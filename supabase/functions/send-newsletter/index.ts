// supabase/functions/send-newsletter/index.ts
//
// Envoie une newsletter a tous les abonnes de "newsletter_subscribers" via
// l'API Resend. Reserve aux comptes admin (scope 'all') : verifie le JWT
// de l'appelant puis son role dans la table "admins" avant tout envoi —
// un abonnement a la newsletter etant une donnee sensible (email de
// centaines de contacts), il ne doit jamais pouvoir etre declenche que
// depuis le dashboard admin authentifie.
//
// Chaque envoi est journalise dans "newsletter_campaigns" (sujet, nombre
// de destinataires, statut) pour garder un historique visible cote admin.
//
// DEPLOIEMENT (a faire une seule fois depuis un terminal) :
//   1. npm install -g supabase          (si pas deja installe)
//   2. supabase login
//   3. supabase link --project-ref pdtohaxbsgpxccopgnmd
//   4. supabase secrets set RESEND_API_KEY=re_xxx
//      supabase secrets set RESEND_FROM_EMAIL="COPAF 2026 <newsletter@copaf-ports.com>"
//   5. supabase functions deploy send-newsletter

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Resend accepte jusqu'a 100 destinataires par appel API ; on decoupe en
// lots pour supporter une liste d'abonnes qui grandit au fil du temps.
const BATCH_SIZE = 100

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildEmailHtml(subject: string, bodyHtml: string, prenom: string | null) {
  const greeting = prenom ? `Bonjour ${escapeHtml(prenom)},` : 'Bonjour,'
  const preheader = escapeHtml(subject).slice(0, 130)
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,Helvetica,sans-serif;">
    <!-- Preheader : texte d'apercu invisible dans le corps, visible dans la liste des emails -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#eef2ff;padding:36px 16px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid rgba(0,14,145,0.08);">

            <!-- En-tete -->
            <tr>
              <td align="center" style="padding:36px 32px 24px;border-bottom:3px solid #0073F4;">
                <img src="https://copaf-ports.com/logocopaf.png" width="200" alt="COPAF 2026" style="display:block;max-width:200px;width:100%;height:auto;border:0;" />
                <div style="margin-top:14px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0073F4;">
                  19&ndash;21 Octobre 2026 &middot; Casablanca, Maroc
                </div>
              </td>
            </tr>

            <!-- Corps -->
            <tr>
              <td style="padding:36px 40px;color:#0a1128;font-size:15px;line-height:1.75;">
                <p style="margin:0 0 18px;font-weight:700;">${greeting}</p>
                <div style="color:#334155;">${bodyHtml}</div>

                <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 4px;">
                  <tr>
                    <td align="center" style="border-radius:10px;background:#000E91;">
                      <a href="https://copaf-ports.com" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                        Visiter le site de la COPAF 2026
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Pied de page -->
            <tr>
              <td style="padding:24px 40px;background:#f8faff;border-top:1px solid #e8ecff;">
                <p style="margin:0 0 6px;font-size:12px;color:#64748b;line-height:1.6;">
                  Vous recevez cet email car vous vous &ecirc;tes inscrit(e) &agrave; la newsletter de la COPAF 2026.
                </p>
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  Organis&eacute; par CRF Perfection &middot; <a href="mailto:contact@copaf-ports.com" style="color:#0073F4;text-decoration:none;">contact@copaf-ports.com</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const jwt = authHeader.replace(/^Bearer\s+/i, '')
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Authentification requise' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt)
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Session invalide' }), { status: 401, headers: corsHeaders })
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('scope, role, email')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (!adminRow || adminRow.scope !== 'all') {
      return new Response(JSON.stringify({ error: 'Acces reserve aux administrateurs' }), { status: 403, headers: corsHeaders })
    }

    const { subject, bodyHtml } = await req.json().catch(() => ({}))
    if (!subject || typeof subject !== 'string' || !bodyHtml || typeof bodyHtml !== 'string') {
      return new Response(JSON.stringify({ error: 'subject et bodyHtml requis' }), { status: 400, headers: corsHeaders })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'COPAF 2026 <onboarding@resend.dev>'
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY n'est pas configure dans les secrets de la fonction" }), { status: 500, headers: corsHeaders })
    }

    const { data: subscribers, error: subErr } = await supabase
      .from('newsletter_subscribers')
      .select('email, prenom')

    if (subErr) {
      console.error('Erreur lecture newsletter_subscribers:', subErr)
      return new Response(JSON.stringify({ error: 'Impossible de lire les abonnes' }), { status: 500, headers: corsHeaders })
    }

    const recipients = subscribers || []
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: 'Aucun abonne a la newsletter' }), { status: 400, headers: corsHeaders })
    }

    let sentCount = 0
    const errors: string[] = []

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)
      const payload = batch.map(sub => ({
        from: fromEmail,
        to: [sub.email],
        subject,
        html: buildEmailHtml(subject, bodyHtml, sub.prenom),
      }))

      const resp = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (resp.ok) {
        sentCount += batch.length
      } else {
        const errText = await resp.text()
        console.error('Erreur Resend pour un lot:', resp.status, errText)
        errors.push(errText)
      }
    }

    const status = sentCount > 0 ? 'envoye' : 'echec'
    await supabase.from('newsletter_campaigns').insert({
      subject,
      body_html: bodyHtml,
      sent_by: userData.user.id,
      sent_by_email: adminRow.email,
      recipients_count: sentCount,
      status,
      error_detail: errors.length > 0 ? errors.join(' | ').slice(0, 2000) : null,
    })

    if (sentCount === 0) {
      return new Response(JSON.stringify({ error: "Echec de l'envoi", detail: errors.join(' | ') }), { status: 502, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true, sentCount, totalRecipients: recipients.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur interne send-newsletter:', err)
    return new Response(JSON.stringify({ error: 'Erreur interne' }), { status: 500, headers: corsHeaders })
  }
})
