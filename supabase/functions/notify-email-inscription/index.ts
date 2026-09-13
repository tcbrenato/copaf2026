// supabase/functions/notify-email-inscription/index.ts
//
// Notifie l'equipe COPAF par email a chaque nouvelle inscription. Meme
// principe que notify-telegram-inscription (declenchee par un trigger en
// base, jamais bloquante pour l'inscription elle-meme) — reutilise
// RESEND_API_KEY / RESEND_FROM_EMAIL deja configures pour la newsletter.
//
// DEPLOIEMENT (a faire une seule fois depuis un terminal) :
//   1. npm install -g supabase          (si pas deja installe)
//   2. supabase login
//   3. supabase link --project-ref pdtohaxbsgpxccopgnmd
//   4. supabase secrets set NOTIFY_EMAIL_TO=contactcrfperfection@gmail.com
//      (RESEND_API_KEY et RESEND_FROM_EMAIL sont deja definis pour send-newsletter)
//   5. supabase functions deploy notify-email-inscription
//
// Le declencheur en base (trigger_notify_email_inscription, meme table
// "inscriptions", evenement INSERT) est cree par la migration
// add_email_inscription_notification — rien a faire de plus cote Studio.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface InscriptionRecord {
  id: string
  contact_id: string | null
  dossier: string | null
  participants: number | null
  montant: number | string | null
  paiement_status: string | null
  paiement_mode: string | null
  langue: string | null
  created_at: string
}

interface WebhookPayload {
  type: string
  table: string
  record: InscriptionRecord
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(value: unknown): string {
  const str = value === null || value === undefined || value === '' ? '—' : String(value)
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildEmailHtml(record: InscriptionRecord, contact: { prenom: string | null; nom: string | null; organisation: string | null; pays: string | null } | null) {
  const prenom = escapeHtml(contact?.prenom)
  const nom = escapeHtml(contact?.nom)
  const organisation = escapeHtml(contact?.organisation)
  const pays = escapeHtml(contact?.pays)
  const participants = escapeHtml(record.participants ?? 1)
  const montant = escapeHtml(record.montant)
  const statut = escapeHtml(record.paiement_status)
  const dossier = escapeHtml(record.dossier)
  const langue = escapeHtml(record.langue)

  const ligne = (label: string, valeur: string) =>
    `<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">${label}</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${valeur}</td></tr>`

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#eef2ff;padding:36px 16px;">
      <tr><td align="center">
        <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,14,145,0.08);">
          <tr><td style="background:linear-gradient(135deg,#000E91,#0073F4);padding:24px 28px;">
            <div style="color:#fff;font-size:17px;font-weight:800;">🎉 Nouvelle inscription COPAF 2026</div>
          </td></tr>
          <tr><td style="padding:24px 28px;">
            <div style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:16px;">${prenom} ${nom}</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;">
              ${ligne('Organisation', organisation)}
              ${ligne('Pays', pays)}
              ${ligne('Participants', participants)}
              ${ligne('Montant', montant + ' €')}
              ${ligne('Statut', statut)}
              ${ligne('Dossier', dossier)}
              ${ligne('Langue', langue)}
            </table>
            <a href="https://copaf-ports.com/admin" style="display:block;margin-top:24px;padding:12px;border-radius:10px;background:#000E91;color:#fff;text-decoration:none;text-align:center;font-size:13px;font-weight:700;">
              Voir dans l'admin
            </a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = (await req.json()) as WebhookPayload
    const record = payload?.record

    if (!record) {
      return new Response(JSON.stringify({ error: 'Payload invalide : "record" manquant' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let contact: { prenom: string | null; nom: string | null; organisation: string | null; pays: string | null } | null = null
    if (record.contact_id) {
      const { data, error } = await supabase
        .from('contacts')
        .select('prenom, nom, organisation, pays')
        .eq('id', record.contact_id)
        .single()
      if (error) console.error('Contact introuvable pour', record.contact_id, error)
      else contact = data
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'COPAF 2026 <onboarding@resend.dev>'
    const toEmail = Deno.env.get('NOTIFY_EMAIL_TO')

    if (!resendApiKey || !toEmail) {
      console.error('RESEND_API_KEY ou NOTIFY_EMAIL_TO manquant dans les secrets de la fonction')
      return new Response(JSON.stringify({ success: true, warning: 'Notification email non configurée' }), { headers: corsHeaders })
    }

    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: `🎉 Nouvelle inscription — ${contact?.prenom || ''} ${contact?.nom || ''}`.trim(),
          html: buildEmailHtml(record, contact),
        }),
      })
      if (!resp.ok) {
        const errText = await resp.text()
        console.error('Erreur Resend:', resp.status, errText)
      }
    } catch (mailErr) {
      console.error('Echec de l\'appel a l\'API Resend:', mailErr)
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Erreur interne notify-email-inscription:', err)
    return new Response(JSON.stringify({ success: true, warning: 'Erreur interne lors de la notification' }), { headers: corsHeaders })
  }
})
