// supabase/functions/reseau/index.ts
//
// Réseautage avec consentement : un participant ou intervenant demande le contact
// WhatsApp d'une autre personne présente à la conférence. La personne reçoit un
// email avec un lien à usage personnel (jeton) : elle accepte en confirmant le
// numéro à partager, ou refuse, sans avoir besoin de se connecter. Tant qu'elle
// n'a pas accepté, aucun numéro n'est visible. Service ouvert jusqu'au 2027-01-24.
//
// Actions (POST JSON) :
//   demander  { cible_id, dossier?, email? }  demandeur identifié par sa session
//             (participant) ou par dossier + email (intervenant)
//   infos     { token }                       détails de la demande (page de réponse)
//   repondre  { token, accepter, whatsapp? }  réponse de la personne sollicitée
//
// DEPLOIEMENT : supabase functions deploy reseau --no-verify-jwt --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE = 'https://copaf-ports.com'
const FIN_SERVICE = new Date('2027-01-24T00:00:00Z')
const VALIDITE_JOURS = 30
const MAX_DEMANDES_PAR_JOUR = 10

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const nomComplet = (m: { prenom?: string | null; nom: string }) => [m.prenom, m.nom].filter(Boolean).join(' ')
const descr = (m: { fonction?: string | null; organisation?: string | null }) => [m.fonction, m.organisation].filter(Boolean).join(', ')

function jeton(): string {
  const b = new Uint8Array(24)
  crypto.getRandomValues(b)
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('')
}

function habiller(titre: string, corps: string, bouton?: { label: string; url: string }): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#F3F6FA;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #D5DEEB">
<div style="background:#00367F;color:#fff;padding:18px 24px"><div style="font-size:11px;letter-spacing:.12em;opacity:.8">COPAF 2026</div><div style="font-size:18px;font-weight:700;margin-top:4px">${esc(titre)}</div></div>
<div style="padding:24px;color:#1E293B;font-size:14px;line-height:1.6">${corps}
${bouton ? `<p style="margin:24px 0 8px"><a href="${bouton.url}" style="display:inline-block;background:#0073F4;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700">${esc(bouton.label)}</a></p>` : ''}
</div></div>
<div style="max-width:560px;margin:10px auto 0;color:#64748B;font-size:11px;text-align:center">CRF Perfection · COPAF 2026 · copaf-ports.com</div></div>`
}

async function envoyer(to: string, subject: string, html: string): Promise<boolean> {
  const key = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM_EMAIL') || 'COPAF 2026 <onboarding@resend.dev>'
  if (!key) return false
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, reply_to: 'contact@copaf-ports.com' }),
  })
  return resp.ok
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const b = await req.json().catch(() => ({}))
    const action = b.action
    const url = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    if (new Date() >= FIN_SERVICE) return json({ error: 'service_clos' }, 410)

    // ── demander ──
    if (action === 'demander') {
      const cibleId = typeof b.cible_id === 'string' ? b.cible_id : ''
      if (!cibleId) return json({ error: 'requete_invalide' }, 400)

      const clientUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      })
      let moiId: string | null = null
      if (typeof b.dossier === 'string' && b.dossier) {
        const { data, error } = await clientUser.rpc('reseau_moi_intervenant', { p_dossier: b.dossier, p_email: b.email ?? '' })
        if (error) return json({ error: 'trop_de_tentatives' }, 429)
        moiId = data
      } else {
        const { data } = await clientUser.rpc('reseau_moi_participant')
        moiId = data
      }
      if (!moiId) return json({ error: 'non_identifie' }, 401)
      if (moiId === cibleId) return json({ error: 'requete_invalide' }, 400)

      const { data: moi } = await admin.from('reseau_membres').select('*').eq('id', moiId).maybeSingle()
      const { data: cible } = await admin.from('reseau_membres').select('*').eq('id', cibleId).eq('visible', true).maybeSingle()
      if (!moi || !cible) return json({ error: 'introuvable' }, 404)
      if (!cible.email) return json({ error: 'indisponible' }, 409)

      const { data: existante } = await admin.from('reseau_demandes').select('id, statut, expire_at').eq('demandeur_id', moiId).eq('cible_id', cibleId).maybeSingle()
      if (existante) {
        const expiree = existante.statut === 'en_attente' && new Date(existante.expire_at) < new Date()
        if (!expiree) return json({ success: true, statut: existante.statut, deja: true })
        await admin.from('reseau_demandes').delete().eq('id', existante.id) // demande expiree : on repart
      }

      const ilYa24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      const { count } = await admin.from('reseau_demandes').select('id', { count: 'exact', head: true }).eq('demandeur_id', moiId).gte('created_at', ilYa24h)
      if ((count ?? 0) >= MAX_DEMANDES_PAR_JOUR) return json({ error: 'limite_quotidienne' }, 429)

      const token = jeton()
      const expire = new Date(Math.min(Date.now() + VALIDITE_JOURS * 86400000, FIN_SERVICE.getTime()))
      const { error: insErr } = await admin.from('reseau_demandes').insert({ demandeur_id: moiId, cible_id: cibleId, token, expire_at: expire.toISOString() })
      if (insErr) { console.error('insert demande:', insErr.message); return json({ error: 'erreur_interne' }, 500) }

      const lien = `${SITE}/reseau/repondre?t=${token}`
      const en = cible.langue === 'en'
      const qui = `<b>${esc(nomComplet(moi))}</b>${descr(moi) ? `<br><span style="color:#64748B">${esc(descr(moi))}</span>` : ''}`
      const ok = await envoyer(
        cible.email,
        en ? `${nomComplet(moi)} would like your WhatsApp contact (COPAF 2026)` : `${nomComplet(moi)} souhaite obtenir votre contact WhatsApp (COPAF 2026)`,
        habiller(
          en ? 'A contact request' : 'Une demande de contact',
          en
            ? `<p>Hello ${esc(cible.prenom || '')},</p><p>A participant of the African Ports Conference would like to continue the conversation with you on WhatsApp:</p><p style="background:#F3F6FA;padding:12px 14px;border-radius:10px">${qui}</p><p>You decide. If you accept, you confirm the number to share; if you decline, nothing is shared. This link is personal and valid ${VALIDITE_JOURS} days.</p>`
            : `<p>Bonjour ${esc(cible.prenom || '')},</p><p>Une personne rencontrée à la Conférence des Ports Africains souhaite poursuivre l'échange avec vous sur WhatsApp :</p><p style="background:#F3F6FA;padding:12px 14px;border-radius:10px">${qui}</p><p>C'est vous qui décidez. Si vous acceptez, vous confirmez le numéro à partager ; si vous refusez, rien n'est communiqué. Ce lien est personnel et valable ${VALIDITE_JOURS} jours.</p>`,
          { label: en ? 'Reply to the request' : 'Répondre à la demande', url: lien },
        ),
      )
      if (!ok) console.error('mail demande non envoye pour', cibleId)
      return json({ success: true, statut: 'en_attente' })
    }

    // ── infos / repondre : par jeton ──
    const token = typeof b.token === 'string' ? b.token : ''
    if ((action === 'infos' || action === 'repondre') && /^[0-9a-f]{48}$/.test(token)) {
      const { data: d } = await admin.from('reseau_demandes').select('*').eq('token', token).maybeSingle()
      if (!d) return json({ error: 'introuvable' }, 404)
      const { data: cible } = await admin.from('reseau_membres').select('*').eq('id', d.cible_id).maybeSingle()
      const { data: dem } = await admin.from('reseau_membres').select('*').eq('id', d.demandeur_id).maybeSingle()
      if (!cible || !dem) return json({ error: 'introuvable' }, 404)
      const expiree = d.statut === 'en_attente' && new Date(d.expire_at) < new Date()

      if (action === 'infos') {
        return json({
          statut: expiree ? 'expiree' : d.statut,
          langue: cible.langue,
          cible: { prenom: cible.prenom, telephone_suggere: cible.telephone_suggere },
          demandeur: { prenom: dem.prenom, nom: dem.nom, fonction: dem.fonction, organisation: dem.organisation },
        })
      }

      if (d.statut !== 'en_attente' || expiree) return json({ error: expiree ? 'expiree' : 'deja_repondu', statut: d.statut }, 409)
      const accepter = b.accepter === true

      if (!accepter) {
        await admin.from('reseau_demandes').update({ statut: 'refusee', repondu_at: new Date().toISOString() }).eq('id', d.id)
        return json({ success: true, statut: 'refusee' })
      }

      const chiffres = String(b.whatsapp ?? '').replace(/[^\d]/g, '')
      if (chiffres.length < 8 || chiffres.length > 15) return json({ error: 'numero_invalide' }, 400)
      const numero = `+${chiffres}`
      await admin.from('reseau_demandes').update({ statut: 'acceptee', whatsapp_partage: numero, repondu_at: new Date().toISOString() }).eq('id', d.id)

      if (dem.email) {
        const en2 = dem.langue === 'en'
        const espace = dem.type === 'intervenant' ? `${SITE}/intervenant` : `${SITE}/verifier`
        await envoyer(
          dem.email,
          en2 ? `${nomComplet(cible)} accepted to share their contact (COPAF 2026)` : `${nomComplet(cible)} a accepté de partager son contact (COPAF 2026)`,
          habiller(
            en2 ? 'Contact shared' : 'Contact partagé',
            en2
              ? `<p>Hello ${esc(dem.prenom || '')},</p><p><b>${esc(nomComplet(cible))}</b> accepted your request. Their WhatsApp contact is now available in your personal space, in the “Network” section.</p>`
              : `<p>Bonjour ${esc(dem.prenom || '')},</p><p><b>${esc(nomComplet(cible))}</b> a accepté votre demande. Son contact WhatsApp est maintenant disponible dans votre espace personnel, rubrique « Réseau ».</p>`,
            { label: en2 ? 'Open my space' : 'Ouvrir mon espace', url: espace },
          ),
        ).catch(e => console.error('mail acceptation:', e))
      }
      return json({ success: true, statut: 'acceptee' })
    }

    return json({ error: 'requete_invalide' }, 400)
  } catch (err) {
    console.error('Erreur interne reseau:', err)
    return json({ error: 'erreur_interne' }, 500)
  }
})
