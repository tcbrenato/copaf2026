// supabase/functions/notify-action/index.ts
//
// Notifie par email a chaque action faite depuis un espace personnel
// (badge, "Mon espace", espace intervenant) : upload photo/passeport,
// email/telephone renseignes, document depose, preuve de paiement
// envoyee. Deux emails a chaque fois :
//   - a l'admin (NOTIFY_EMAIL_TO) — toujours, pour suivre l'activite
//   - a la personne elle-meme — uniquement si elle a deja un email
//     enregistre (sinon impossible ; l'admin reste notifie quand meme)
//
// Appelee directement depuis le client juste apres une action reussie
// (pas de trigger DB — les actions couvertes touchent plusieurs tables
// avec des conditions differentes, un appel direct est plus simple et
// suffisant pour une notification "best effort").
//
// Reutilise RESEND_API_KEY / RESEND_FROM_EMAIL / NOTIFY_EMAIL_TO deja
// configures pour notify-email-inscription.
//
// DEPLOIEMENT : supabase functions deploy notify-action --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ACTION_LABELS: Record<string, string> = {
  photo: 'a envoyé sa photo de badge',
  passeport: 'a envoyé une copie de son passeport',
  email: 'a renseigné son email',
  telephone: 'a renseigné son numéro de téléphone',
  document: 'a déposé un document',
  preuve_paiement: 'a envoyé une preuve de paiement',
}

const PARTICIPANT_SUBJECT: Record<string, string> = {
  photo: 'Photo bien reçue',
  passeport: 'Copie de passeport bien reçue',
  email: 'Email enregistré',
  telephone: 'Numéro de téléphone enregistré',
  document: 'Document bien reçu',
  preuve_paiement: 'Preuve de paiement bien reçue',
}

function escapeHtml(value: unknown): string {
  const str = value === null || value === undefined || value === '' ? '—' : String(value)
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface Personne {
  dossier: string
  nom: string | null
  prenom: string | null
  poste: string | null
  organisation: string | null
  email: string | null
}

// Meme cascade que badge_lookup_by_dossier cote base, mais en direct ici
// (service role, pas besoin de RPC) car on a besoin de l'email — jamais
// expose par les RPC publiques equivalentes.
async function trouverPersonne(supabase: ReturnType<typeof createClient>, dossier: string): Promise<Personne | null> {
  const { data: insc } = await supabase
    .from('inscriptions')
    .select('dossier, contacts(nom, prenom, poste, organisation, email)')
    .eq('dossier', dossier)
    .maybeSingle()
  if (insc?.contacts) {
    const c = insc.contacts as { nom: string; prenom: string; poste: string; organisation: string; email: string }
    return { dossier, nom: c.nom, prenom: c.prenom, poste: c.poste, organisation: c.organisation, email: c.email }
  }

  const { data: participant } = await supabase
    .from('inscription_participants')
    .select('dossier, nom, prenom, poste, email, inscriptions(contacts(organisation))')
    .eq('dossier', dossier)
    .maybeSingle()
  if (participant) {
    const org = (participant.inscriptions as { contacts?: { organisation?: string } } | null)?.contacts?.organisation ?? null
    return { dossier, nom: participant.nom, prenom: participant.prenom, poste: participant.poste, organisation: org, email: participant.email }
  }

  const { data: intervenant } = await supabase
    .from('intervenants')
    .select('dossier, nom, prenom, fonction, organisation, email')
    .eq('dossier', dossier)
    .maybeSingle()
  if (intervenant) {
    return { dossier, nom: intervenant.nom, prenom: intervenant.prenom, poste: intervenant.fonction, organisation: intervenant.organisation, email: intervenant.email }
  }

  return null
}

function emailAdminHtml(personne: Personne, actionLabel: string) {
  const nomComplet = `${escapeHtml(personne.prenom)} ${escapeHtml(personne.nom)}`.trim()
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#eef2ff;padding:36px 16px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,14,145,0.08);">
<tr><td style="background:linear-gradient(135deg,#000E91,#0073F4);padding:24px 28px;">
<div style="color:#fff;font-size:17px;font-weight:800;">📄 Activité — Espace personnel</div>
</td></tr>
<tr><td style="padding:24px 28px;">
<div style="font-size:15px;color:#0f172a;line-height:1.6;">
<strong>${nomComplet}</strong> ${escapeHtml(actionLabel)}.
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;margin-top:16px;">
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Dossier</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.dossier)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Fonction</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.poste)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Organisation</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.organisation)}</td></tr>
</table>
<a href="https://copaf-ports.com/admin" style="display:block;margin-top:24px;padding:12px;border-radius:10px;background:#000E91;color:#fff;text-decoration:none;text-align:center;font-size:13px;font-weight:700;">
Voir dans l'admin
</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function emailParticipantHtml(personne: Personne, subject: string) {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#eef2ff;padding:36px 16px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,14,145,0.08);">
<tr><td style="background:linear-gradient(135deg,#000E91,#0073F4);padding:24px 28px;">
<div style="color:#fff;font-size:17px;font-weight:800;">✅ ${escapeHtml(subject)}</div>
</td></tr>
<tr><td style="padding:24px 28px;">
<div style="font-size:15px;color:#0f172a;line-height:1.6;">
Bonjour ${escapeHtml(personne.prenom)},<br/><br/>
Nous confirmons la bonne réception de votre envoi pour votre dossier COPAF 2026 (<strong>${escapeHtml(personne.dossier)}</strong>).
</div>
<div style="margin-top:20px;padding-top:16px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">
COPAF 2026 — Conférence des Ports Africains · 19–21 octobre 2026, Casablanca
</div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { dossier, type } = await req.json().catch(() => ({}))

    if (!dossier || !type || !ACTION_LABELS[type]) {
      return new Response(JSON.stringify({ error: 'dossier et type (valide) requis' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const personne = await trouverPersonne(supabase, String(dossier).trim())
    if (!personne) {
      return new Response(JSON.stringify({ success: true, warning: 'Dossier introuvable' }), { headers: corsHeaders })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'COPAF 2026 <onboarding@resend.dev>'
    const adminEmail = Deno.env.get('NOTIFY_EMAIL_TO')

    if (!resendApiKey) {
      return new Response(JSON.stringify({ success: true, warning: 'RESEND_API_KEY manquant' }), { headers: corsHeaders })
    }

    const envois: Promise<Response>[] = []
    const nomComplet = `${personne.prenom || ''} ${personne.nom || ''}`.trim()

    if (adminEmail) {
      envois.push(fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          subject: `📄 ${nomComplet} — ${ACTION_LABELS[type]}`,
          html: emailAdminHtml(personne, ACTION_LABELS[type]),
        }),
      }))
    }

    if (personne.email) {
      envois.push(fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: [personne.email],
          subject: `COPAF 2026 — ${PARTICIPANT_SUBJECT[type]}`,
          html: emailParticipantHtml(personne, PARTICIPANT_SUBJECT[type]),
        }),
      }))
    }

    const resultats = await Promise.allSettled(envois)
    for (const r of resultats) {
      if (r.status === 'rejected') console.error('Echec envoi Resend:', r.reason)
      else if (!r.value.ok) console.error('Erreur Resend:', r.value.status, await r.value.text())
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Erreur interne notify-action:', err)
    return new Response(JSON.stringify({ success: true, warning: 'Erreur interne' }), { headers: corsHeaders })
  }
})
