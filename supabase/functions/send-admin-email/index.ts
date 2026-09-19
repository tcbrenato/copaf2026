// supabase/functions/send-admin-email/index.ts
//
// Envoi manuel d'un email depuis l'espace admin ("Envoyer un email") : objet,
// corps mis en forme (HTML produit par l'editeur), signature, un ou plusieurs
// destinataires (un email individuel par destinataire — ils ne se voient pas
// entre eux). Reserve aux comptes admin (scope 'all') : le JWT de l'appelant
// est verifie puis son role dans la table "admins", comme send-newsletter.
//
// Chaque envoi est journalise dans notifications_log (type 'manuel', objet,
// auteur, resultat Resend) et apparait donc dans le Journal d'activite.
//
// `preview: true` renvoie seulement le HTML final, sans rien envoyer.
//
// DEPLOIEMENT : supabase functions deploy send-admin-email --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_DESTINATAIRES = 100
const REPLY_TO_DEFAUT = 'contact@copaf-ports.com'
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// L'auteur est un admin authentifie, mais on retire quand meme tout ce qui
// pourrait executer du code ou charger des ressources actives dans un email.
function assainir(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta|base)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta|base)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2')
}

function versTexte(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|h[1-6]|li|tr)\s*>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '- ')
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function construireHtml(corps: string, signature: string, habillage: boolean): string {
  const blocSignature = signature.trim()
    ? `<div style="margin-top:28px;">${signature}</div>`
    : ''

  if (!habillage) {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1e293b;">
<div>${corps}</div>${blocSignature}
</body></html>`
  }

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
<tr><td align="center" style="padding:20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px -8px rgba(0,14,145,0.15);">
<tr><td style="padding:0;line-height:0;">
<img src="https://copaf-ports.com/coverscopaf.png" alt="COPAF 2026 — Conférence des Ports Africains — Casablanca, Maroc — 19-21 Octobre 2026" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
</td></tr>
<tr><td style="padding:36px 32px 32px;">
<div style="font-size:15px;color:#334155;line-height:1.7;">${corps}</div>${blocSignature}
</td></tr>
<tr><td style="background-color:#0f172a;padding:32px;text-align:center;">
<div style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:.5px;margin-bottom:10px;">CRF PERFECTION</div>
<div style="font-size:12.5px;color:#94a3b8;margin-bottom:18px;">
<a href="https://copaf-ports.com" style="color:#38bdf8;text-decoration:none;font-weight:600;">copaf-ports.com</a>
&nbsp;·&nbsp;
<a href="https://www.linkedin.com/company/crfperfection/" style="color:#38bdf8;text-decoration:none;font-weight:600;">LinkedIn</a>
&nbsp;·&nbsp;
<a href="mailto:contact@copaf-ports.com" style="color:#38bdf8;text-decoration:none;font-weight:600;">Contact</a>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom:18px;"><tr>
<td><a href="https://www.linkedin.com/company/crfperfection/" target="_blank" style="display:inline-block;margin:0 6px;"><img src="https://img.icons8.com/ios-filled/50/94a3b8/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:block;border:0;" /></a></td>
<td><a href="https://www.facebook.com/copafcrfperfection" target="_blank" style="display:inline-block;margin:0 6px;"><img src="https://img.icons8.com/ios-filled/50/94a3b8/facebook-new.png" width="20" height="20" alt="Facebook" style="display:block;border:0;" /></a></td>
<td><a href="https://www.instagram.com/crf_perfection" target="_blank" style="display:inline-block;margin:0 6px;"><img src="https://img.icons8.com/ios-filled/50/94a3b8/instagram-new.png" width="20" height="20" alt="Instagram" style="display:block;border:0;" /></a></td>
</tr></table>
<div style="font-size:11px;color:#64748b;line-height:1.6;border-top:1px solid #1e293b;padding-top:16px;">
Message du comité d'organisation de la COPAF 2026.<br/>
© 2026 CRF Perfection — Tous droits réservés.
</div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
    if (!jwt) return json({ error: 'Authentification requise' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt)
    if (userErr || !userData?.user) return json({ error: 'Session invalide' }, 401)

    const { data: adminRow } = await supabase
      .from('admins')
      .select('scope, email')
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (!adminRow || adminRow.scope !== 'all') return json({ error: 'Accès réservé aux administrateurs' }, 403)

    const { to, subject, bodyHtml, signatureHtml, habillage, replyTo, dossier, preview } = await req.json().catch(() => ({}))

    const corps = assainir(typeof bodyHtml === 'string' ? bodyHtml : '')
    const signature = assainir(typeof signatureHtml === 'string' ? signatureHtml : '')
    const html = construireHtml(corps, signature, habillage !== false)

    if (preview) return json({ success: true, html })

    const objet = typeof subject === 'string' ? subject.trim() : ''
    if (!objet) return json({ error: "L'objet est obligatoire" }, 400)
    if (!versTexte(corps)) return json({ error: 'Le message est vide' }, 400)

    const destinataires = [...new Set(
      (Array.isArray(to) ? to : [])
        .filter((e: unknown): e is string => typeof e === 'string')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean),
    )]
    if (destinataires.length === 0) return json({ error: 'Aucun destinataire' }, 400)
    if (destinataires.length > MAX_DESTINATAIRES) return json({ error: `Maximum ${MAX_DESTINATAIRES} destinataires par envoi` }, 400)
    const invalides = destinataires.filter(e => !EMAIL_RE.test(e))
    if (invalides.length) return json({ error: `Adresse(s) invalide(s) : ${invalides.join(', ')}` }, 400)

    const reponseA = typeof replyTo === 'string' && EMAIL_RE.test(replyTo.trim()) ? replyTo.trim() : REPLY_TO_DEFAUT

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'COPAF 2026 <onboarding@resend.dev>'
    if (!resendApiKey) return json({ error: "RESEND_API_KEY n'est pas configuré" }, 500)

    const texte = versTexte(corps + (signature ? `<br><br>${signature}` : ''))
    const rapport: { to: string; ok: boolean; status?: number; detail?: string }[] = []

    for (const dest of destinataires) {
      try {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromEmail, to: [dest], subject: objet, html, text: texte, reply_to: reponseA }),
        })
        const detail = await resp.text()
        rapport.push({ to: dest, ok: resp.ok, status: resp.status, detail: resp.ok ? undefined : detail })
      } catch (e) {
        rapport.push({ to: dest, ok: false, detail: String(e) })
      }
    }

    const { error: logErr } = await supabase.from('notifications_log').insert(
      rapport.map(r => ({
        dossier: typeof dossier === 'string' && dossier ? dossier : null,
        type: 'manuel',
        destinataire: r.to,
        sujet: objet,
        envoye_par: adminRow.email,
        ok: r.ok,
        status: r.status ?? null,
        detail: r.detail ?? null,
      })),
    )
    if (logErr) console.error('Echec journal notifications_log:', logErr.message)

    const envoyes = rapport.filter(r => r.ok).length
    return json({ success: envoyes > 0, envoyes, total: rapport.length, rapport }, envoyes > 0 ? 200 : 502)
  } catch (err) {
    console.error('Erreur interne send-admin-email:', err)
    return json({ error: 'Erreur interne' }, 500)
  }
})
