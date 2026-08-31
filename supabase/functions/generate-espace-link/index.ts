// supabase/functions/generate-espace-link/index.ts
//
// Genere un lien magique Supabase Auth deja pret (action_link) pour un
// participant qui vient de s'inscrire, afin de l'inserer directement dans
// l'email de confirmation — pas d'etape "demander un lien" au premier acces.
//
// Securite : n'accepte PAS un email arbitraire fourni par l'appelant (ce
// serait une porte ouverte pour generer un lien de connexion a la place de
// n'importe quel participant, les numeros de dossier etant publics). Le
// couple (dossier, token) doit correspondre exactement a ce qui a ete
// genere cote client au moment de la soumission du formulaire — un jeton
// jamais affiche nulle part — et n'est utilisable qu'une seule fois.
// L'email est ensuite lu server-side depuis le contact lie au dossier,
// jamais fourni par l'appelant.
//
// DEPLOIEMENT : supabase functions deploy generate-espace-link --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REDIRECT_TO = 'https://copaf-ports.com/verifier'

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { dossier, token } = await req.json().catch(() => ({}))

    if (!dossier || !token) {
      return new Response(JSON.stringify({ error: 'dossier et token requis' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: insc, error: inscErr } = await supabase
      .from('inscriptions')
      .select('id, espace_link_token, espace_link_used, contacts(email)')
      .eq('dossier', dossier)
      .single()

    if (inscErr || !insc || insc.espace_link_token !== token || insc.espace_link_used) {
      // Reponse volontairement generique : ne pas distinguer "dossier
      // inconnu" de "jeton invalide"/"deja utilise" pour ne rien reveler.
      return new Response(JSON.stringify({ error: 'Lien indisponible' }), { status: 403, headers: corsHeaders })
    }

    const email = (insc.contacts as { email?: string } | null)?.email
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email introuvable pour ce dossier' }), { status: 404, headers: corsHeaders })
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: REDIRECT_TO },
    })

    if (linkErr || !linkData?.properties?.action_link) {
      console.error('Erreur generateLink:', linkErr)
      return new Response(JSON.stringify({ error: 'Generation du lien impossible' }), { status: 500, headers: corsHeaders })
    }

    // Jeton consomme uniquement apres succes, pour ne pas gaspiller
    // l'unique tentative sur une erreur transitoire.
    await supabase.from('inscriptions').update({ espace_link_used: true }).eq('id', insc.id)

    return new Response(JSON.stringify({ action_link: linkData.properties.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur interne generate-espace-link:', err)
    return new Response(JSON.stringify({ error: 'Erreur interne' }), { status: 500, headers: corsHeaders })
  }
})
