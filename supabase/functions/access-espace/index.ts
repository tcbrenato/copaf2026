// supabase/functions/access-espace/index.ts
//
// Connexion directe a l'espace personnel via dossier + email, sans etape
// "verifiez votre boite mail" a chaque visite. Le participant a deja recu
// un lien magique une fois a son inscription (voir generate-espace-link) ;
// s'il change d'appareil ou perd sa session, l'obliger a repasser par un
// aller-retour email est trop de friction pour l'usage attendu.
//
// Principe : on verifie ici que l'email fourni correspond bien au contact
// du dossier indique, puis on genere un lien magique Supabase Auth
// cote serveur — jamais envoye par e-mail, renvoye directement a
// l'appelant. Le navigateur suit ensuite ce lien pour etablir une vraie
// session authentifiee, identique a celle obtenue via un lien magique
// classique : tout le reste de l'application (RLS, upload de preuve de
// virement, etc.) continue de fonctionner sans aucun changement.
//
// Le dossier peut correspondre soit au contact principal d'une inscription
// (table inscriptions/contacts), soit a un membre d'un groupe enregistre
// individuellement (table inscription_participants — ex. delegation avec
// plusieurs personnes sous un seul paiement). Les deux sont verifies ; le
// premier trouve gagne.
//
// Compromis de securite assume : contrairement a generate-espace-link (qui
// exige un jeton secret a usage unique), l'acces ici repose sur la seule
// connaissance du couple (dossier, email). Le numero de dossier est deja
// traite comme public ailleurs dans l'application (page /verifier). Pour
// limiter une enumeration automatisee des ~90 000 dossiers possibles contre
// un email connu, les tentatives sont plafonnees par IP (voir
// MAX_ATTEMPTS_PER_WINDOW ci-dessous).
//
// DEPLOIEMENT : supabase functions deploy access-espace --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REDIRECT_TO = 'https://copaf-ports.com/verifier'
const MAX_ATTEMPTS_PER_WINDOW = 20
const WINDOW_MINUTES = 60

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { dossier, email } = await req.json().catch(() => ({}))

    if (!dossier || !email) {
      return new Response(JSON.stringify({ error: 'Dossier et email requis' }), { status: 400, headers: corsHeaders })
    }

    const forwardedFor = req.headers.get('x-forwarded-for') || ''
    const clientIp = forwardedFor.split(',')[0].trim() || 'unknown'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString()
    const { count: recentAttempts } = await supabase
      .from('espace_login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip', clientIp)
      .gte('created_at', windowStart)

    if ((recentAttempts ?? 0) >= MAX_ATTEMPTS_PER_WINDOW) {
      return new Response(JSON.stringify({ error: 'Trop de tentatives, reessayez plus tard' }), { status: 429, headers: corsHeaders })
    }

    const dossierTrim = dossier.trim()
    const emailTrim = String(email).trim().toLowerCase()
    let realEmail: string | null = null

    const { data: insc } = await supabase
      .from('inscriptions')
      .select('id, contacts(email)')
      .eq('dossier', dossierTrim)
      .single()
    const contactEmail = (insc?.contacts as { email?: string } | null)?.email
    if (contactEmail && contactEmail.trim().toLowerCase() === emailTrim) {
      realEmail = contactEmail
    }

    if (!realEmail) {
      const { data: membre } = await supabase
        .from('inscription_participants')
        .select('email')
        .eq('dossier', dossierTrim)
        .single()
      if (membre?.email && membre.email.trim().toLowerCase() === emailTrim) {
        realEmail = membre.email
      }
    }

    const matches = !!realEmail

    // Journalise chaque tentative (succes ou echec) pour le calcul du debit
    // ci-dessus, sans jamais logger l'email fourni par l'appelant.
    await supabase.from('espace_login_attempts').insert({ ip: clientIp, success: matches })

    if (!matches) {
      // Reponse volontairement generique : ne pas reveler si c'est le
      // dossier ou l'email qui est incorrect.
      return new Response(JSON.stringify({ error: 'Dossier ou email introuvable' }), { status: 403, headers: corsHeaders })
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: realEmail!,
      options: { redirectTo: REDIRECT_TO },
    })

    if (linkErr || !linkData?.properties?.action_link) {
      console.error('Erreur generateLink:', linkErr)
      return new Response(JSON.stringify({ error: 'Connexion impossible' }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ action_link: linkData.properties.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur interne access-espace:', err)
    return new Response(JSON.stringify({ error: 'Erreur interne' }), { status: 500, headers: corsHeaders })
  }
})
