// supabase/functions/relance-dossiers-incomplets/index.ts
//
// Tourne une fois par jour via pg_cron (voir migration
// document_validations_and_relances, job "relance-dossiers-incomplets-quotidien"
// a 07h00 UTC) : relance automatiquement par email les dossiers dont la
// photo et/ou le passeport manquent encore a l'approche de la conference
// (19 octobre 2026) — deux paliers, J-14 et J-7, chacun envoye une seule
// fois par dossier (voir relances_dossier_envoyees).
//
// Reutilise notify-action (type 'relance_dossier') pour l'envoi effectif,
// afin de ne pas dupliquer le gabarit d'email ni la logique espace/identifiants.
//
// DEPLOIEMENT : supabase functions deploy relance-dossiers-incomplets --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CONFERENCE_DATE = new Date('2026-10-19T00:00:00Z')
const PALIERS = [14, 7]

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const joursRestants = Math.ceil((CONFERENCE_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (joursRestants <= 0) {
      return new Response(JSON.stringify({ success: true, info: 'Conférence déjà commencée' }), { headers: { 'Content-Type': 'application/json' } })
    }

    const palierActif = PALIERS.find(p => joursRestants <= p)
    if (!palierActif) {
      return new Response(JSON.stringify({ success: true, info: `J-${joursRestants}, aucun palier atteint` }), { headers: { 'Content-Type': 'application/json' } })
    }

    // Cascade des 3 tables portant photo_url/numero_passeport/email, comme
    // badge_lookup_by_dossier — seuls les dossiers avec un email connu
    // peuvent recevoir une relance. Volumes faibles (dizaines de lignes) :
    // filtrage cote JS plus simple et plus sur qu'un filtre PostgREST
    // imbrique sur une ressource jointe.
    const [insc, participants, intervenants] = await Promise.all([
      supabase.from('inscriptions').select('dossier, photo_url, numero_passeport, contacts(email)'),
      supabase.from('inscription_participants').select('dossier, email, photo_url, numero_passeport'),
      supabase.from('intervenants').select('dossier, email, photo_url, numero_passeport'),
    ])

    const incomplet = (r: { photo_url: string | null; numero_passeport: string | null }) => !r.photo_url || !r.numero_passeport

    const candidats = [
      ...((insc.data || []) as { dossier: string; photo_url: string | null; numero_passeport: string | null; contacts: { email: string | null } | null }[])
        .filter(r => r.contacts?.email && incomplet(r)).map(r => r.dossier),
      ...((participants.data || []) as { dossier: string; email: string | null; photo_url: string | null; numero_passeport: string | null }[])
        .filter(r => r.email && incomplet(r)).map(r => r.dossier),
      ...((intervenants.data || []) as { dossier: string; email: string | null; photo_url: string | null; numero_passeport: string | null }[])
        .filter(r => r.email && incomplet(r)).map(r => r.dossier),
    ].filter(Boolean)

    const { data: dejaEnvoyes } = candidats.length
      ? await supabase.from('relances_dossier_envoyees').select('dossier').eq('palier', palierActif).in('dossier', candidats)
      : { data: [] }

    const dejaSet = new Set((dejaEnvoyes || []).map(r => r.dossier))
    const aRelancer = candidats.filter(d => !dejaSet.has(d))

    const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-action`
    let envoyes = 0
    for (const dossier of aRelancer) {
      try {
        await fetch(notifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
          body: JSON.stringify({ dossier, type: 'relance_dossier', jours: joursRestants }),
        })
        await supabase.from('relances_dossier_envoyees').insert({ dossier, palier: palierActif })
        envoyes++
      } catch (e) {
        console.error('Échec relance pour', dossier, e)
      }
    }

    return new Response(
      JSON.stringify({ success: true, palier: palierActif, joursRestants, candidats: candidats.length, envoyes }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Erreur interne relance-dossiers-incomplets:', err)
    return new Response(JSON.stringify({ success: false, error: 'Erreur interne' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
