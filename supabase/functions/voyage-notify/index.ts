// supabase/functions/voyage-notify/index.ts
//
// Emails et alertes du parcours "voyage" :
//
//  - action "envoyer" (ADMIN uniquement) : envoie a un participant son Guide du
//    participant ou sa Fiche de voyage, PDF en piece jointe. Le PDF est genere par
//    le navigateur de l'admin ; le destinataire, sa langue et son nom viennent de
//    la base (jamais du client). Met a jour voyages (dates d'envoi, statut).
//  - action "vols_recus" (public, mais verifiee et limitee) : quand un participant
//    vient d'enregistrer ses vols sur /badge -> alerte email + Telegram a l'equipe
//    et confirmation au participant. Verifiee : les vols doivent avoir ete
//    enregistres il y a moins de 15 minutes ; une seule alerte par dossier / 10 min ;
//    plafond horaire global.
//
// Secrets utilises : RESEND_API_KEY, RESEND_FROM_EMAIL, NOTIFY_EMAIL_TO,
// TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (deja definis pour les autres fonctions).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Langue = 'fr' | 'en'
const SITE = 'https://copaf-ports.com'
const COVER = `${SITE}/coverscopaf.png`
const REPONSE = 'contact@copaf-ports.com'
const BRAND_FROM = '#000E91'
const BRAND_TO = '#0073F4'
const MAX_PDF_OCTETS = 3 * 1024 * 1024

function esc(v: unknown): string {
  const s = v === null || v === undefined || v === '' ? '—' : String(v)
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function shell(o: { langue: Langue; titre: string; sousTitre: string; corps: string; cta?: { label: string; url: string }; interne?: boolean }) {
  const en = o.langue === 'en'
  const note = o.interne
    ? (en ? 'Internal notification — COPAF 2026 team.' : 'Notification interne — équipe COPAF 2026.')
    : (en ? 'You are receiving this email because you are registered for COPAF 2026.' : 'Vous recevez cet email car vous êtes inscrit à COPAF 2026.')
  return `<!DOCTYPE html>
<html lang="${o.langue}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;"><tr><td align="center" style="padding:20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
<tr><td style="padding:0;line-height:0;"><img src="${COVER}" alt="COPAF 2026" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" /></td></tr>
<tr><td style="background:linear-gradient(135deg,${BRAND_FROM},${BRAND_TO});padding:26px 32px 28px;">
<div style="color:#ffffff;font-size:20px;font-weight:800;line-height:1.3;">${esc(o.titre)}</div>
<div style="color:rgba(255,255,255,.85);font-size:13px;margin-top:4px;">${esc(o.sousTitre)}</div>
</td></tr>
<tr><td style="padding:32px;">
<div style="font-size:14.5px;color:#475569;line-height:1.7;">${o.corps}</div>
${o.cta ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 4px;"><tr><td align="center"><table border="0" cellspacing="0" cellpadding="0"><tr><td align="center" bgcolor="${BRAND_FROM}" style="border-radius:10px;"><a href="${o.cta.url}" target="_blank" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;display:inline-block;">${esc(o.cta.label)} →</a></td></tr></table></td></tr></table>` : ''}
</td></tr>
<tr><td style="background-color:#0f172a;padding:26px 32px;text-align:center;">
<div style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:.5px;margin-bottom:8px;">CRF PERFECTION</div>
<div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px;"><a href="${SITE}" style="color:#38bdf8;text-decoration:none;font-weight:600;">copaf-ports.com</a> &nbsp;·&nbsp; <a href="mailto:${REPONSE}" style="color:#38bdf8;text-decoration:none;font-weight:600;">Contact</a></div>
<div style="font-size:11px;color:#64748b;line-height:1.6;">${esc(note)}<br/>© 2026 CRF Perfection</div>
</td></tr>
</table></td></tr></table></body></html>`
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const corps = await req.json().catch(() => ({}))
    const { action, dossier } = corps
    if (!dossier || typeof dossier !== 'string' || dossier.length > 60) return json({ error: 'dossier requis' }, 400)

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const from = Deno.env.get('RESEND_FROM_EMAIL') || 'COPAF 2026 <onboarding@resend.dev>'
    const adminEmail = Deno.env.get('NOTIFY_EMAIL_TO')

    const journaliser = async (row: Record<string, unknown>) => {
      const { error } = await supabase.from('notifications_log').insert(row)
      if (error) console.error('Echec journal notifications_log:', error.message)
    }
    const envoyer = async (to: string, subject: string, html: string, pj?: { filename: string; content: string }) => {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, html, reply_to: REPONSE, ...(pj ? { attachments: [pj] } : {}) }),
      })
      const detail = await r.text()
      if (!r.ok) console.error('Erreur Resend:', r.status, detail)
      return { ok: r.ok, status: r.status, detail }
    }

    const { data: p } = await supabase.rpc('_personne_dossier', { p_dossier: dossier.trim() })
    const personne = Array.isArray(p) ? p[0] : p
    if (!personne) return json({ success: true }) // dossier inconnu : reponse neutre
    const langue: Langue = personne.langue === 'en' ? 'en' : 'fr'
    const nomComplet = `${personne.prenom || ''} ${personne.nom || ''}`.trim()

    // ───────────────────────── Envoi du guide / de la fiche (admin) ─────────────────────────
    if (action === 'envoyer') {
      const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
      if (!jwt) return json({ error: 'Authentification requise' }, 401)
      const { data: userData } = await supabase.auth.getUser(jwt)
      if (!userData?.user) return json({ error: 'Session invalide' }, 401)
      const { data: adminRow } = await supabase.from('admins').select('scope, email').eq('user_id', userData.user.id).maybeSingle()
      if (!adminRow || adminRow.scope !== 'all') return json({ error: 'Accès réservé aux administrateurs' }, 403)

      const kind = corps.kind
      if (kind !== 'guide' && kind !== 'fiche') return json({ error: 'kind invalide' }, 400)
      const pdf = typeof corps.pdf === 'string' ? corps.pdf : ''
      if (!pdf.startsWith('JVBER') || pdf.length * 0.75 > MAX_PDF_OCTETS) return json({ error: 'PDF invalide ou trop volumineux' }, 400)
      const filename = String(corps.filename || (kind === 'guide' ? 'Guide_du_Participant_COPAF2026.pdf' : 'Fiche_Voyage_COPAF2026.pdf')).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80)
      if (!personne.email) {
        await journaliser({ dossier, type: kind === 'guide' ? 'guide_participant' : 'fiche_voyage', langue, ok: false, detail: 'Aucun email enregistré pour ce dossier', envoye_par: adminRow.email })
        return json({ success: false, raison: 'sans_email' })
      }
      if (!resendKey) return json({ success: false, raison: 'email_non_configure' })

      const en = langue === 'en'
      const prenom = esc(personne.prenom)
      const contenu = kind === 'guide'
        ? {
          sujet: en ? 'COPAF 2026 — Your Participant Guide' : 'COPAF 2026 — Votre Guide du participant',
          titre: en ? 'Your Participant Guide' : 'Votre Guide du participant',
          sous: en ? 'Welcome, accommodation, travel and practical information' : 'Accueil, hébergement, déplacements et informations pratiques',
          texte: en
            ? `Hello ${prenom},<br/><br/>Please find attached the <strong>COPAF 2026 Participant Guide</strong>: welcome, accommodation, travel, formalities and practical information. It is also available at any time in your participant area.<br/><br/><strong>Next step (about 3 minutes):</strong> enter your photo, your passport number and your flight information on your personal page.`
            : `Bonjour ${prenom},<br/><br/>Vous trouverez en pièce jointe le <strong>Guide du participant de la COPAF 2026</strong> : accueil, hébergement, déplacements, formalités et informations pratiques. Il est aussi disponible à tout moment dans votre espace participant.<br/><br/><strong>Prochaine étape (environ 3 minutes) :</strong> renseignez votre photo, votre numéro de passeport et vos informations de vol sur votre page personnelle.`,
          cta: { label: en ? 'Enter my information' : 'Renseigner mes informations', url: `${SITE}/badge` },
        }
        : {
          sujet: en ? 'COPAF 2026 — Your travel sheet' : 'COPAF 2026 — Votre fiche de voyage',
          titre: en ? 'Your travel sheet is ready' : 'Votre fiche de voyage est prête',
          sous: en ? 'Hotel, transfers and contacts' : 'Hôtel, transferts et contacts',
          texte: en
            ? `Hello ${prenom},<br/><br/>Your <strong>individual travel sheet</strong> is attached: hotel, address, confirmation number and transfer details. It is also available in your participant area.`
            : `Bonjour ${prenom},<br/><br/>Votre <strong>fiche de voyage individuelle</strong> est jointe à ce message : hôtel, adresse, numéro de confirmation et modalités de transfert. Elle est aussi disponible dans votre espace participant.`,
          cta: { label: en ? 'Open my participant area' : 'Ouvrir mon espace participant', url: `${SITE}/verifier` },
        }

      const res = await envoyer(personne.email, contenu.sujet, shell({ langue, titre: contenu.titre, sousTitre: contenu.sous, corps: contenu.texte, cta: contenu.cta }), { filename, content: pdf })
      await journaliser({ dossier, type: kind === 'guide' ? 'guide_participant' : 'fiche_voyage', destinataire: personne.email, langue, sujet: contenu.sujet, ok: res.ok, status: res.status, detail: res.ok ? null : res.detail, envoye_par: adminRow.email })

      if (res.ok) {
        const maj = kind === 'guide'
          ? { guide_envoye_le: new Date().toISOString() }
          : { fiche_envoyee_le: new Date().toISOString(), statut: 'fiche_envoyee' }
        await supabase.from('voyages').upsert({ dossier, ...maj, updated_at: new Date().toISOString() }, { onConflict: 'dossier' })
      }
      return json({ success: res.ok })
    }

    // ───────────────────────── Vols recus (appel public verifie) ─────────────────────────
    if (action === 'vols_recus') {
      const ilYa = (min: number) => new Date(Date.now() - min * 60_000).toISOString()
      const { data: voy } = await supabase.from('voyages').select('vols_recus_le').eq('dossier', dossier.trim()).gt('vols_recus_le', ilYa(15)).maybeSingle()
      if (!voy) return json({ success: true })
      const { data: deja } = await supabase.from('notifications_log').select('dossier').eq('dossier', dossier.trim()).eq('type', 'vols_recus').eq('ok', true).gt('created_at', ilYa(10)).limit(1)
      const { count } = await supabase.from('notifications_log').select('dossier', { count: 'exact', head: true }).eq('type', 'vols_recus').eq('ok', true).gt('created_at', ilYa(60))
      if ((deja && deja.length) || (count ?? 0) >= 100) return json({ success: true })

      let ok = false
      if (resendKey && adminEmail) {
        const html = shell({
          langue: 'fr', interne: true, titre: 'Vols reçus', sousTitre: `${nomComplet}`,
          corps: `<strong>${esc(nomComplet)}</strong> (${esc(personne.organisation)}) vient de renseigner ses informations de vol.<br/><br/>Dossier : <strong>${esc(dossier)}</strong>`,
          cta: { label: "Voir dans l'admin", url: `${SITE}/admin` },
        })
        ok = (await envoyer(adminEmail, `✈️ ${nomComplet} — vols reçus`, html)).ok
      }
      const token = Deno.env.get('TELEGRAM_BOT_TOKEN'); const chat = Deno.env.get('TELEGRAM_CHAT_ID')
      if (token && chat) {
        try {
          const t = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chat, parse_mode: 'HTML', text: `✈️ Vols reçus\n\n👤 ${esc(nomComplet)}\n🏢 ${esc(personne.organisation)}\n📋 Dossier : ${esc(dossier)}` }),
          })
          ok = ok || t.ok
        } catch (e) { console.error('Echec Telegram:', e) }
      }
      if (personne.email && resendKey) {
        const en = langue === 'en'
        await envoyer(
          personne.email,
          en ? 'COPAF 2026 — Flight information received' : 'COPAF 2026 — Informations de vol bien reçues',
          shell({
            langue, titre: en ? 'Flight information received' : 'Informations de vol bien reçues', sousTitre: en ? 'Thank you' : 'Merci',
            corps: en
              ? `Hello ${esc(personne.prenom)},<br/><br/>We have received your travel information. Your <strong>travel sheet</strong> (hotel and transfers) will be sent to you as soon as your accommodation and transfers are confirmed.`
              : `Bonjour ${esc(personne.prenom)},<br/><br/>Nous avons bien reçu vos informations de voyage. Votre <strong>fiche de voyage</strong> (hôtel et transferts) vous sera envoyée dès que votre hébergement et vos transferts seront confirmés.`,
          }),
        )
      }
      await journaliser({ dossier: dossier.trim(), type: 'vols_recus', langue, ok, detail: 'Alerte équipe' })
      return json({ success: true })
    }

    return json({ error: 'action invalide' }, 400)
  } catch (err) {
    console.error('Erreur interne voyage-notify:', err)
    return json({ success: false })
  }
})
