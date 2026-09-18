// supabase/functions/notify-action/index.ts
//
// Notifie par email a chaque action faite depuis un espace personnel
// (badge, "Mon espace", espace intervenant) : upload photo/passeport,
// email/telephone renseignes, document depose, preuve de paiement
// envoyee, validation/rejet de document par l'admin, statut d'inscription
// confirme, rappel de dossier incomplet.
//
// Appelee directement depuis le client juste apres une action reussie
// (pas de trigger DB — les actions couvertes touchent plusieurs tables
// avec des conditions differentes, un appel direct est plus simple et
// suffisant pour une notification "best effort").
//
// Toutes les notifications partagent le meme gabarit visuel (emailShell) :
// cover COPAF en tete, bandeau colore avec icone/titre/sous-titre, encart
// dossier + pastille de statut, bouton d'action, pied de page CRF
// Perfection avec liens reseaux sociaux.
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
  photo: 'Vos documents ont bien été reçus',
  passeport: 'Vos documents ont bien été reçus',
  email: 'Email enregistré',
  telephone: 'Numéro de téléphone enregistré',
  document: 'Document bien reçu',
  preuve_paiement: 'Preuve de paiement bien reçue',
}

const DOCUMENT_ADMIN_SUBJECT = 'Un document vous attend dans votre espace COPAF 2026'

const CHAMP_LABEL: Record<string, string> = { photo: 'photo', passeport: 'passeport' }

// Types qui ne notifient QUE la personne (jamais l'admin) : l'admin est soit
// l'auteur de l'action (document_admin, document_valide/rejete, statut_confirme),
// soit hors-sujet (relance_dossier, automatique).
const PARTICIPANT_ONLY_TYPES = new Set(['document_admin', 'document_valide', 'document_rejete', 'statut_confirme', 'relance_dossier'])

function escapeHtml(value: unknown): string {
  const str = value === null || value === undefined || value === '' ? '—' : String(value)
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// "photo" + "passeport" -> "photo et passeport" ; ["photo"] -> "photo"
function nommerChamps(champs: string[]): string {
  const noms = champs.map(c => CHAMP_LABEL[c] || c)
  if (noms.length <= 1) return noms[0] || 'document'
  return noms.join(' et ')
}

interface Personne {
  dossier: string
  nom: string | null
  prenom: string | null
  poste: string | null
  organisation: string | null
  email: string | null
  photoUrl: string | null
  passeportUrl: string | null
  // 'intervenant' se connecte par nom + code d'accres (/intervenant), tous
  // les autres par dossier + email (/verifier) — le lien et les identifiants
  // mentionnes dans l'email dependent de ce type.
  espace: 'participant' | 'intervenant'
}

// Meme cascade que badge_lookup_by_dossier cote base, mais en direct ici
// (service role, pas besoin de RPC) car on a besoin de l'email — jamais
// expose par les RPC publiques equivalentes.
async function trouverPersonne(supabase: ReturnType<typeof createClient>, dossier: string): Promise<Personne | null> {
  const { data: insc } = await supabase
    .from('inscriptions')
    .select('dossier, photo_url, passeport_url, contacts(nom, prenom, poste, organisation, email)')
    .eq('dossier', dossier)
    .maybeSingle()
  if (insc?.contacts) {
    const c = insc.contacts as { nom: string; prenom: string; poste: string; organisation: string; email: string }
    return { dossier, nom: c.nom, prenom: c.prenom, poste: c.poste, organisation: c.organisation, email: c.email, photoUrl: insc.photo_url as string | null, passeportUrl: insc.passeport_url as string | null, espace: 'participant' }
  }

  const { data: participant } = await supabase
    .from('inscription_participants')
    .select('dossier, poste, email, photo_url, passeport_url, nom, prenom, inscriptions(contacts(organisation))')
    .eq('dossier', dossier)
    .maybeSingle()
  if (participant) {
    const org = (participant.inscriptions as { contacts?: { organisation?: string } } | null)?.contacts?.organisation ?? null
    return { dossier, nom: participant.nom, prenom: participant.prenom, poste: participant.poste, organisation: org, email: participant.email, photoUrl: participant.photo_url as string | null, passeportUrl: participant.passeport_url as string | null, espace: 'participant' }
  }

  const { data: intervenant } = await supabase
    .from('intervenants')
    .select('dossier, nom, prenom, fonction, organisation, email, photo_url, passeport_url')
    .eq('dossier', dossier)
    .maybeSingle()
  if (intervenant) {
    return { dossier, nom: intervenant.nom, prenom: intervenant.prenom, poste: intervenant.fonction, organisation: intervenant.organisation, email: intervenant.email, photoUrl: intervenant.photo_url as string | null, passeportUrl: intervenant.passeport_url as string | null, espace: 'intervenant' }
  }

  return null
}

function espaceLienEtIdentifiants(personne: Personne) {
  return personne.espace === 'intervenant'
    ? { lien: 'https://copaf-ports.com/intervenant', identifiants: "nom + code d'accès" }
    : { lien: 'https://copaf-ports.com/verifier', identifiants: 'numéro de dossier + email enregistré' }
}

// ─── Gabarit visuel partage par toutes les notifications ──────────────────
//
// Cover COPAF en tete, bandeau colore (icone rond + titre + sous-titre),
// corps de message, encart optionnel (dossier + pastille de statut, ou
// tableau d'infos libre), bouton d'action optionnel, pied de page CRF
// Perfection (liens + reseaux sociaux).

const COVER_URL = 'https://copaf-ports.com/coverscopaf.png'
const SITE_URL = 'https://copaf-ports.com'
const BRAND_FROM = '#000E91'
const BRAND_TO = '#0073F4'
const ALERT_FROM = '#dc2626'
const ALERT_TO = '#f97316'

const STATUT_TONES: Record<string, { bg: string; fg: string }> = {
  valide: { bg: '#d1fae5', fg: '#065f46' },
  rejete: { bg: '#fee2e2', fg: '#991b1b' },
  confirme: { bg: '#d1fae5', fg: '#065f46' },
  incomplet: { bg: '#ffedd5', fg: '#9a3412' },
  recu: { bg: '#dbeafe', fg: '#1e40af' },
  neutre: { bg: '#f1f5f9', fg: '#475569' },
}

function pastilleStatut(label: string, tone: keyof typeof STATUT_TONES) {
  const c = STATUT_TONES[tone]
  return `<span style="display:inline-block;font-size:11px;font-weight:700;padding:5px 12px;border-radius:100px;color:${c.fg};background:${c.bg};white-space:nowrap;">${escapeHtml(label)}</span>`
}

function encartDossier(dossier: string, statut?: { label: string; tone: keyof typeof STATUT_TONES }) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border-left:4px solid ${BRAND_FROM};margin:24px 0;">
<tr><td style="padding:16px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle">
<span style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:4px;">Numéro de dossier</span>
<strong style="font-size:19px;color:${BRAND_FROM};font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${escapeHtml(dossier)}</strong>
</td>
${statut ? `<td valign="middle" align="right">${pastilleStatut(statut.label, statut.tone)}</td>` : ''}
</tr></table>
</td></tr>
</table>`
}

function encartMotif(motif: string) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;margin:0 0 24px;">
<tr><td style="padding:16px 20px;">
<span style="font-size:10px;color:#991b1b;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:4px;">Motif</span>
<span style="font-size:14px;color:#7f1d1d;font-weight:600;">${escapeHtml(motif)}</span>
</td></tr>
</table>`
}

function emailShell(opts: {
  pillLabel?: string
  icon: string
  accentFrom?: string
  accentTo?: string
  titre: string
  sousTitre: string
  corpsHtml: string
  extraHtml?: string
  ctaLabel?: string
  ctaUrl?: string
  noteFooter?: string
}) {
  const {
    pillLabel = 'Notification', icon, accentFrom = BRAND_FROM, accentTo = BRAND_TO,
    titre, sousTitre, corpsHtml, extraHtml = '', ctaLabel, ctaUrl, noteFooter,
  } = opts

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
<tr><td align="center" style="padding:20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px -8px rgba(0,14,145,0.15);">

<tr><td style="padding:0;line-height:0;">
<img src="${COVER_URL}" alt="COPAF 2026 — Conférence des Ports Africains — Casablanca, Maroc — 19-21 Octobre 2026" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
</td></tr>

<tr><td style="background:linear-gradient(135deg,${accentFrom},${accentTo});padding:26px 32px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top">
<div style="color:#ffffff;font-size:15px;font-weight:800;">COPAF 2026</div>
<div style="color:rgba(255,255,255,.75);font-size:11.5px;margin-top:2px;">Conférence des Ports Africains</div>
</td>
<td valign="top" align="right">
<span style="display:inline-block;font-size:10.5px;font-weight:700;color:#ffffff;background:rgba(255,255,255,.18);padding:5px 12px;border-radius:100px;letter-spacing:.3px;">${escapeHtml(pillLabel)}</span>
</td>
</tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;"><tr>
<td valign="middle" width="48" style="width:48px;">
<div style="width:44px;height:44px;border-radius:100px;background:#ffffff;text-align:center;line-height:44px;font-size:19px;">${icon}</div>
</td>
<td valign="middle" style="padding-left:14px;">
<div style="color:#ffffff;font-size:19px;font-weight:800;line-height:1.3;">${escapeHtml(titre)}</div>
<div style="color:rgba(255,255,255,.85);font-size:12.5px;margin-top:2px;">${escapeHtml(sousTitre)}</div>
</td>
</tr></table>
</td></tr>

<tr><td style="padding:36px 32px 32px;">
<div style="font-size:14.5px;color:#475569;line-height:1.7;">
${corpsHtml}
</div>
${extraHtml}
${ctaUrl ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;"><tr><td align="center">
<table border="0" cellspacing="0" cellpadding="0"><tr>
<td align="center" bgcolor="${BRAND_FROM}" style="border-radius:10px;">
<a href="${ctaUrl}" target="_blank" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;display:inline-block;">${escapeHtml(ctaLabel || 'Voir mon espace')} →</a>
</td>
</tr></table>
</td></tr></table>` : ''}
<p style="text-align:center;font-size:12px;color:#94a3b8;margin:24px 0 0;">Casablanca, Maroc — 19–21 octobre 2026</p>
</td></tr>

<tr><td style="background-color:#0f172a;padding:32px;text-align:center;">
<div style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:.5px;margin-bottom:10px;">CRF PERFECTION</div>
<div style="font-size:12.5px;color:#94a3b8;margin-bottom:18px;">
<a href="${SITE_URL}" style="color:#38bdf8;text-decoration:none;font-weight:600;">copaf-ports.com</a>
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
${escapeHtml(noteFooter || 'Vous recevez cet email car vous êtes inscrit à COPAF 2026.')}<br/>
© 2026 CRF Perfection — Tous droits réservés.
</div>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ─── Gabarits specifiques ──────────────────────────────────────────────────

function emailAdminHtml(personne: Personne, actionLabel: string) {
  const nomComplet = `${escapeHtml(personne.prenom)} ${escapeHtml(personne.nom)}`.trim()
  const extra = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;margin-top:8px;">
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Dossier</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.dossier)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Fonction</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.poste)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Organisation</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.organisation)}</td></tr>
</table>`
  return emailShell({
    pillLabel: 'Activité',
    icon: '📋',
    titre: 'Nouvelle activité',
    sousTitre: actionLabel,
    corpsHtml: `<strong>${nomComplet}</strong> ${escapeHtml(actionLabel)}.`,
    extraHtml: extra,
    ctaLabel: "Voir dans l'admin",
    ctaUrl: `${SITE_URL}/admin`,
    noteFooter: 'Notification interne — équipe COPAF 2026.',
  })
}

function emailParticipantHtml(personne: Personne, subject: string) {
  const { lien, identifiants } = espaceLienEtIdentifiants(personne)
  return emailShell({
    icon: '✓',
    titre: subject,
    sousTitre: 'Confirmation de réception',
    corpsHtml: `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>Nous confirmons la bonne réception de votre envoi pour votre dossier COPAF 2026.`,
    extraHtml: encartDossier(personne.dossier, { label: 'Reçu', tone: 'recu' }) + `<p style="font-size:12px;color:#94a3b8;margin:0;">Identifiants de connexion : ${identifiants}.</p>`,
    ctaLabel: 'Consulter mon dossier',
    ctaUrl: lien,
  })
}

function emailDocumentAdminHtml(personne: Personne, typeDocument: string) {
  const { lien, identifiants } = espaceLienEtIdentifiants(personne)
  return emailShell({
    icon: '📄',
    titre: DOCUMENT_ADMIN_SUBJECT,
    sousTitre: 'Nouveau document disponible',
    corpsHtml: `Bonjour ${escapeHtml(personne.prenom)} ${escapeHtml(personne.nom)},<br/><br/>Un nouveau document a été déposé dans votre espace personnel COPAF 2026.`,
    extraHtml: encartDossier(personne.dossier) + `<p style="font-size:12px;color:#94a3b8;margin:8px 0 0;">Type de document : <strong style="color:#334155;">${escapeHtml(typeDocument)}</strong> · Identifiants de connexion : ${identifiants}.</p>`,
    ctaLabel: 'Voir dans mon espace',
    ctaUrl: lien,
  })
}

function emailDocumentValideHtml(personne: Personne, champs: string[]) {
  const { lien } = espaceLienEtIdentifiants(personne)
  const nomChamps = nommerChamps(champs)
  const pluriel = champs.length > 1
  return emailShell({
    icon: '✓',
    titre: pluriel ? 'Documents validés' : 'Document validé',
    sousTitre: pluriel ? 'Vos pièces ont passé la vérification' : 'Votre pièce a passé la vérification',
    corpsHtml: `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>${pluriel ? 'Vos documents' : 'Votre document'} — <strong>${escapeHtml(nomChamps)}</strong> — pour votre dossier COPAF 2026 ${pluriel ? 'ont été vérifiés et validés' : 'a été vérifié et validé'}. Aucune action de votre part n'est nécessaire.`,
    extraHtml: encartDossier(personne.dossier, { label: 'Validé', tone: 'valide' }),
    ctaLabel: 'Consulter mon dossier',
    ctaUrl: lien,
  })
}

function emailDocumentRejeteHtml(personne: Personne, champs: string[], motif: string) {
  const { lien } = espaceLienEtIdentifiants(personne)
  const nomChamps = nommerChamps(champs)
  const pluriel = champs.length > 1
  return emailShell({
    pillLabel: 'Action requise',
    icon: '⚠',
    accentFrom: ALERT_FROM,
    accentTo: ALERT_TO,
    titre: pluriel ? 'Documents à corriger' : 'Document à corriger',
    sousTitre: "N'a pas pu être validé",
    corpsHtml: `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>${pluriel ? 'Vos documents' : 'Votre document'} — <strong>${escapeHtml(nomChamps)}</strong> — pour votre dossier COPAF 2026 ${pluriel ? "n'ont pas pu être validés" : "n'a pas pu être validé"}.`,
    extraHtml: encartDossier(personne.dossier, { label: 'À corriger', tone: 'rejete' }) + encartMotif(motif),
    ctaLabel: 'Déposer une nouvelle version',
    ctaUrl: lien,
  })
}

function emailStatutConfirmeHtml(personne: Personne) {
  const { lien } = espaceLienEtIdentifiants(personne)
  return emailShell({
    icon: '✓',
    titre: 'Inscription confirmée',
    sousTitre: 'Votre paiement a été validé',
    corpsHtml: `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>Votre inscription à la COPAF 2026 est désormais <strong>confirmée</strong>. Nous avons hâte de vous accueillir !`,
    extraHtml: encartDossier(personne.dossier, { label: 'Confirmé', tone: 'confirme' }),
    ctaLabel: 'Consulter mon dossier',
    ctaUrl: lien,
  })
}

function emailRelanceDossierHtml(personne: Personne, joursRestants: number) {
  const { lien } = espaceLienEtIdentifiants(personne)
  const manquants = [!personne.photoUrl && 'photo', !personne.passeportUrl && 'passeport'].filter(Boolean).join(' et ')
  return emailShell({
    pillLabel: 'Rappel',
    icon: '⏰',
    accentFrom: ALERT_FROM,
    accentTo: ALERT_TO,
    titre: `Dossier incomplet — J-${joursRestants}`,
    sousTitre: 'Documents manquants',
    corpsHtml: `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>Il reste <strong>${joursRestants} jours</strong> avant la COPAF 2026 et votre dossier est encore incomplet : il manque votre <strong>${escapeHtml(manquants)}</strong>.`,
    extraHtml: encartDossier(personne.dossier, { label: 'Incomplet', tone: 'incomplet' }),
    ctaLabel: 'Compléter mon dossier',
    ctaUrl: lien,
  })
}

// ─── Handler ────────────────────────────────────────────────────────────

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { dossier, type, label, champs, motif, jours } = await req.json().catch(() => ({}))
    const estParticipantOnly = PARTICIPANT_ONLY_TYPES.has(type)

    if (!dossier || !type || (!estParticipantOnly && !ACTION_LABELS[type])) {
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

    // Types document_valide/document_rejete : accepte soit `champs` (tableau,
    // permet de valider/rejeter photo + passeport en un seul email), soit
    // l'ancien `label` singulier pour compatibilite.
    const champsList: string[] = Array.isArray(champs) && champs.length ? champs : label ? [String(label)] : ['photo']

    const envois: Promise<Response>[] = []
    const nomComplet = `${personne.prenom || ''} ${personne.nom || ''}`.trim()

    if (estParticipantOnly) {
      // Ces types ne notifient QUE la personne elle-meme (jamais l'admin,
      // qui est soit l'auteur de l'action, soit hors-sujet).
      if (personne.email) {
        let subject = ''
        let html = ''
        if (type === 'document_admin') { subject = DOCUMENT_ADMIN_SUBJECT; html = emailDocumentAdminHtml(personne, String(label || 'Document')) }
        else if (type === 'document_valide') { subject = champsList.length > 1 ? 'Documents validés' : 'Document validé'; html = emailDocumentValideHtml(personne, champsList) }
        else if (type === 'document_rejete') { subject = champsList.length > 1 ? 'Documents à corriger' : 'Document à corriger'; html = emailDocumentRejeteHtml(personne, champsList, String(motif || 'Non précisé')) }
        else if (type === 'statut_confirme') { subject = 'Inscription confirmée'; html = emailStatutConfirmeHtml(personne) }
        else if (type === 'relance_dossier') { subject = `Dossier incomplet — J-${Number(jours) || 0}`; html = emailRelanceDossierHtml(personne, Number(jours) || 0) }

        if (html) {
          envois.push(fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: fromEmail, to: [personne.email], subject: `COPAF 2026 — ${subject}`, html }),
          }))
        }
      }
    } else {
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

        // Rattrapage : sur le parcours dossier-only, les documents sont
        // deposes AVANT que l'email ne soit connu — la confirmation
        // "documents reçus" n'a alors jamais pu partir a ce moment-la. Des
        // que l'email arrive, si les deux documents sont deja presents, on
        // l'envoie maintenant.
        if (type === 'email' && personne.photoUrl && personne.passeportUrl) {
          envois.push(fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: fromEmail,
              to: [personne.email],
              subject: 'COPAF 2026 — Vos documents ont bien été reçus',
              html: emailParticipantHtml(personne, 'Vos documents ont bien été reçus'),
            }),
          }))
        }
      }
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
