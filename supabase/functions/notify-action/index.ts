// supabase/functions/notify-action/index.ts
//
// Notifie par email a chaque action faite depuis un espace personnel
// (badge, "Mon espace", espace intervenant) : upload photo/passeport,
// email/telephone renseignes, document depose, preuve de paiement
// envoyee, validation/rejet de document par l'admin, statut d'inscription
// confirme, rappel de dossier incomplet.
//
// Bilingue (fr/en) : chaque email participant est traduit selon
// personne.langue (colonne `langue` sur inscriptions / inscription_participants
// / intervenants, la meme qui pilote deja la langue de /badge). L'email
// interne a l'admin (emailAdminHtml) reste toujours en francais — c'est
// l'equipe CRF Perfection qui le lit, pas le participant.
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

type Langue = 'fr' | 'en'

// Admin-facing (francais uniquement, cf. plus bas).
const ACTION_LABELS: Record<string, string> = {
  photo: 'a envoyé sa photo de badge',
  passeport: 'a envoyé une copie de son passeport',
  email: 'a renseigné son email',
  telephone: 'a renseigné son numéro de téléphone',
  document: 'a déposé un document',
  preuve_paiement: 'a envoyé une preuve de paiement',
}

// Participant-facing (bilingue).
const PARTICIPANT_SUBJECT: Record<Langue, Record<string, string>> = {
  fr: {
    photo: 'Vos documents ont bien été reçus',
    passeport: 'Vos documents ont bien été reçus',
    email: 'Email enregistré',
    telephone: 'Numéro de téléphone enregistré',
    document: 'Document bien reçu',
    preuve_paiement: 'Preuve de paiement bien reçue',
  },
  en: {
    photo: 'Your documents have been received',
    passeport: 'Your documents have been received',
    email: 'Email saved',
    telephone: 'Phone number saved',
    document: 'Document received',
    preuve_paiement: 'Proof of payment received',
  },
}

const CHAMP_LABEL: Record<Langue, Record<string, string>> = {
  fr: { photo: 'photo', passeport: 'passeport' },
  en: { photo: 'photo', passeport: 'passport' },
}

// Types qui ne notifient QUE la personne (jamais l'admin) : l'admin est soit
// l'auteur de l'action (document_admin, document_valide/rejete, statut_confirme),
// soit hors-sujet (relance_dossier, automatique).
const PARTICIPANT_ONLY_TYPES = new Set(['document_admin', 'document_valide', 'document_rejete', 'statut_confirme', 'relance_dossier', 'documentation_intervenant'])

function escapeHtml(value: unknown): string {
  const str = value === null || value === undefined || value === '' ? '—' : String(value)
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// "photo" + "passeport" -> "photo et passeport" / "photo and passport"
function nommerChamps(champs: string[], langue: Langue): string {
  const noms = champs.map(c => CHAMP_LABEL[langue][c] || c)
  if (noms.length <= 1) return noms[0] || (langue === 'en' ? 'document' : 'document')
  return noms.join(langue === 'en' ? ' and ' : ' et ')
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
  langue: Langue
  civilite: string | null
  // 'intervenant' se connecte par nom + code d'accres (/intervenant), tous
  // les autres par dossier + email (/verifier) — le lien et les identifiants
  // mentionnes dans l'email dependent de ce type.
  espace: 'participant' | 'intervenant'
}

function normaliserLangue(v: unknown): Langue {
  return v === 'en' ? 'en' : 'fr'
}

// Meme cascade que badge_lookup_by_dossier cote base, mais en direct ici
// (service role, pas besoin de RPC) car on a besoin de l'email — jamais
// expose par les RPC publiques equivalentes.
async function trouverPersonne(supabase: ReturnType<typeof createClient>, dossier: string): Promise<Personne | null> {
  const { data: insc } = await supabase
    .from('inscriptions')
    .select('dossier, photo_url, passeport_url, langue, contacts(nom, prenom, poste, organisation, email)')
    .eq('dossier', dossier)
    .maybeSingle()
  if (insc?.contacts) {
    const c = insc.contacts as { nom: string; prenom: string; poste: string; organisation: string; email: string }
    return { dossier, nom: c.nom, prenom: c.prenom, poste: c.poste, organisation: c.organisation, email: c.email, photoUrl: insc.photo_url as string | null, passeportUrl: insc.passeport_url as string | null, langue: normaliserLangue(insc.langue), civilite: null, espace: 'participant' }
  }

  const { data: participant } = await supabase
    .from('inscription_participants')
    .select('dossier, poste, email, photo_url, passeport_url, nom, prenom, langue, inscriptions(langue, contacts(organisation))')
    .eq('dossier', dossier)
    .maybeSingle()
  if (participant) {
    const inscriptionLiee = participant.inscriptions as { langue?: string; contacts?: { organisation?: string } } | null
    const org = inscriptionLiee?.contacts?.organisation ?? null
    // Langue propre au membre si definie, sinon celle du dossier parent (les
    // membres ajoutes cote admin n'ont souvent pas leur propre langue remplie).
    const langue = normaliserLangue(participant.langue ?? inscriptionLiee?.langue)
    return { dossier, nom: participant.nom, prenom: participant.prenom, poste: participant.poste, organisation: org, email: participant.email, photoUrl: participant.photo_url as string | null, passeportUrl: participant.passeport_url as string | null, langue, civilite: null, espace: 'participant' }
  }

  const { data: intervenant } = await supabase
    .from('intervenants')
    .select('dossier, nom, prenom, fonction, organisation, email, photo_url, passeport_url, langue, civilite')
    .eq('dossier', dossier)
    .maybeSingle()
  if (intervenant) {
    return { dossier, nom: intervenant.nom, prenom: intervenant.prenom, poste: intervenant.fonction, organisation: intervenant.organisation, email: intervenant.email, photoUrl: intervenant.photo_url as string | null, passeportUrl: intervenant.passeport_url as string | null, langue: normaliserLangue(intervenant.langue), civilite: (intervenant.civilite as string | null) ?? null, espace: 'intervenant' }
  }

  return null
}

function espaceLienEtIdentifiants(personne: Personne) {
  const t = TXT[personne.langue]
  return personne.espace === 'intervenant'
    ? { lien: 'https://copaf-ports.com/intervenant', identifiants: t.identifiantsIntervenant }
    : { lien: 'https://copaf-ports.com/verifier', identifiants: t.identifiantsParticipant }
}

// ─── Traductions des elements fixes du gabarit ─────────────────────────────

const TXT: Record<Langue, {
  conference: string
  lieuDate: string
  dossierLabel: string
  identifiantsIntervenant: string
  identifiantsParticipant: string
  identifiantsPrefix: string
  typeDocumentLabel: string
  motifLabel: string
  recuNote: string
  footerCopy: string
  footerInterne: string
  ctaDefault: string
  statutRecu: string
  statutValide: string
  statutRejete: string
  statutConfirme: string
  statutIncomplet: string
}> = {
  fr: {
    conference: 'Conférence des Ports Africains',
    lieuDate: 'Casablanca, Maroc — 19–21 octobre 2026',
    dossierLabel: 'Numéro de dossier',
    identifiantsIntervenant: "nom + code d'accès",
    identifiantsParticipant: 'numéro de dossier + email enregistré',
    identifiantsPrefix: 'Identifiants de connexion',
    typeDocumentLabel: 'Type de document',
    motifLabel: 'Motif',
    recuNote: 'Vous recevez cet email car vous êtes inscrit à COPAF 2026.',
    footerCopy: '© 2026 CRF Perfection — Tous droits réservés.',
    footerInterne: 'Notification interne — équipe COPAF 2026.',
    ctaDefault: 'Voir mon espace',
    statutRecu: 'Reçu',
    statutValide: 'Validé',
    statutRejete: 'À corriger',
    statutConfirme: 'Confirmé',
    statutIncomplet: 'Incomplet',
  },
  en: {
    conference: 'African Ports Conference',
    lieuDate: 'Casablanca, Morocco — October 19–21, 2026',
    dossierLabel: 'File number',
    identifiantsIntervenant: 'name + access code',
    identifiantsParticipant: 'file number + registered email',
    identifiantsPrefix: 'Login',
    typeDocumentLabel: 'Document type',
    motifLabel: 'Reason',
    recuNote: 'You are receiving this email because you are registered for COPAF 2026.',
    footerCopy: '© 2026 CRF Perfection — All rights reserved.',
    footerInterne: 'Internal notification — COPAF 2026 team.',
    ctaDefault: 'View my space',
    statutRecu: 'Received',
    statutValide: 'Approved',
    statutRejete: 'Needs correction',
    statutConfirme: 'Confirmed',
    statutIncomplet: 'Incomplete',
  },
}

// ─── Gabarit visuel partage par toutes les notifications ──────────────────

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

function encartDossier(langue: Langue, dossier: string, statut?: { label: string; tone: keyof typeof STATUT_TONES }) {
  const t = TXT[langue]
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border-left:4px solid ${BRAND_FROM};margin:24px 0;">
<tr><td style="padding:16px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle">
<span style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:4px;">${escapeHtml(t.dossierLabel)}</span>
<strong style="font-size:19px;color:${BRAND_FROM};font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${escapeHtml(dossier)}</strong>
</td>
${statut ? `<td valign="middle" align="right">${pastilleStatut(statut.label, statut.tone)}</td>` : ''}
</tr></table>
</td></tr>
</table>`
}

function encartMotif(langue: Langue, motif: string) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;margin:0 0 24px;">
<tr><td style="padding:16px 20px;">
<span style="font-size:10px;color:#991b1b;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:4px;">${escapeHtml(TXT[langue].motifLabel)}</span>
<span style="font-size:14px;color:#7f1d1d;font-weight:600;">${escapeHtml(motif)}</span>
</td></tr>
</table>`
}

function emailShell(opts: {
  langue: Langue
  pillLabel: string
  icon: string
  accentFrom?: string
  accentTo?: string
  titre: string
  sousTitre: string
  corpsHtml: string
  extraHtml?: string
  ctaLabel?: string
  ctaUrl?: string
  apresCtaHtml?: string
  noteFooter?: string
}) {
  const {
    langue, pillLabel, icon, accentFrom = BRAND_FROM, accentTo = BRAND_TO,
    titre, sousTitre, corpsHtml, extraHtml = '', ctaLabel, ctaUrl, apresCtaHtml = '', noteFooter,
  } = opts
  const t = TXT[langue]

  return `<!DOCTYPE html>
<html lang="${langue}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
<tr><td align="center" style="padding:20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px -8px rgba(0,14,145,0.15);">

<tr><td style="padding:0;line-height:0;">
<img src="${COVER_URL}" alt="COPAF 2026 — ${escapeHtml(t.conference)} — ${escapeHtml(t.lieuDate)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
</td></tr>

<tr><td style="background:linear-gradient(135deg,${accentFrom},${accentTo});padding:26px 32px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top">
<div style="color:#ffffff;font-size:15px;font-weight:800;">COPAF 2026</div>
<div style="color:rgba(255,255,255,.75);font-size:11.5px;margin-top:2px;">${escapeHtml(t.conference)}</div>
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
<a href="${ctaUrl}" target="_blank" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;display:inline-block;">${escapeHtml(ctaLabel || t.ctaDefault)} →</a>
</td>
</tr></table>
</td></tr></table>` : ''}
${apresCtaHtml}
<p style="text-align:center;font-size:12px;color:#94a3b8;margin:24px 0 0;">${escapeHtml(t.lieuDate)}</p>
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
${escapeHtml(noteFooter || t.recuNote)}<br/>
${escapeHtml(t.footerCopy)}
</div>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ─── Gabarits specifiques ──────────────────────────────────────────────────
//
// emailAdminHtml reste toujours en francais (lu par l'equipe CRF Perfection),
// tous les autres suivent personne.langue.

function emailAdminHtml(personne: Personne, actionLabel: string) {
  const nomComplet = `${escapeHtml(personne.prenom)} ${escapeHtml(personne.nom)}`.trim()
  const extra = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;margin-top:8px;">
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Dossier</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.dossier)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Fonction</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.poste)}</td></tr>
<tr><td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;">Organisation</td><td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(personne.organisation)}</td></tr>
</table>`
  return emailShell({
    langue: 'fr',
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
  const langue = personne.langue
  const t = TXT[langue]
  const { lien, identifiants } = espaceLienEtIdentifiants(personne)
  const corps = langue === 'en'
    ? `Hello ${escapeHtml(personne.prenom)},<br/><br/>We confirm we have received your submission for your COPAF 2026 file.`
    : `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>Nous confirmons la bonne réception de votre envoi pour votre dossier COPAF 2026.`
  return emailShell({
    langue,
    pillLabel: langue === 'en' ? 'Notification' : 'Notification',
    icon: '✓',
    titre: subject,
    sousTitre: langue === 'en' ? 'Receipt confirmation' : 'Confirmation de réception',
    corpsHtml: corps,
    extraHtml: encartDossier(langue, personne.dossier, { label: t.statutRecu, tone: 'recu' }) + `<p style="font-size:12px;color:#94a3b8;margin:0;">${escapeHtml(t.identifiantsPrefix)} : ${identifiants}.</p>`,
    ctaLabel: langue === 'en' ? 'View my file' : 'Consulter mon dossier',
    ctaUrl: lien,
  })
}

function emailDocumentAdminHtml(personne: Personne, typeDocument: string) {
  const langue = personne.langue
  const t = TXT[langue]
  const { lien, identifiants } = espaceLienEtIdentifiants(personne)
  const titre = langue === 'en' ? 'A document is waiting in your COPAF 2026 space' : 'Un document vous attend dans votre espace COPAF 2026'
  const corps = langue === 'en'
    ? `Hello ${escapeHtml(personne.prenom)} ${escapeHtml(personne.nom)},<br/><br/>A new document has been added to your COPAF 2026 personal space.`
    : `Bonjour ${escapeHtml(personne.prenom)} ${escapeHtml(personne.nom)},<br/><br/>Un nouveau document a été déposé dans votre espace personnel COPAF 2026.`
  return emailShell({
    langue,
    pillLabel: 'Notification',
    icon: '📄',
    titre,
    sousTitre: langue === 'en' ? 'New document available' : 'Nouveau document disponible',
    corpsHtml: corps,
    extraHtml: encartDossier(langue, personne.dossier) + `<p style="font-size:12px;color:#94a3b8;margin:8px 0 0;">${escapeHtml(t.typeDocumentLabel)} : <strong style="color:#334155;">${escapeHtml(typeDocument)}</strong> · ${escapeHtml(t.identifiantsPrefix)} : ${identifiants}.</p>`,
    ctaLabel: langue === 'en' ? 'View my space' : 'Voir dans mon espace',
    ctaUrl: lien,
  })
}

function emailDocumentValideHtml(personne: Personne, champs: string[]) {
  const langue = personne.langue
  const t = TXT[langue]
  const { lien } = espaceLienEtIdentifiants(personne)
  const nomChamps = nommerChamps(champs, langue)
  const pluriel = champs.length > 1
  const corps = langue === 'en'
    ? `Hello ${escapeHtml(personne.prenom)},<br/><br/>Your ${pluriel ? 'documents' : 'document'} — <strong>${escapeHtml(nomChamps)}</strong> — for your COPAF 2026 file ${pluriel ? 'have been checked and approved' : 'has been checked and approved'}. No action is required on your part.`
    : `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>${pluriel ? 'Vos documents' : 'Votre document'} — <strong>${escapeHtml(nomChamps)}</strong> — pour votre dossier COPAF 2026 ${pluriel ? 'ont été vérifiés et validés' : 'a été vérifié et validé'}. Aucune action de votre part n'est nécessaire.`
  return emailShell({
    langue,
    pillLabel: 'Notification',
    icon: '✓',
    titre: langue === 'en' ? (pluriel ? 'Documents approved' : 'Document approved') : (pluriel ? 'Documents validés' : 'Document validé'),
    sousTitre: langue === 'en' ? (pluriel ? 'Your documents passed verification' : 'Your document passed verification') : (pluriel ? 'Vos pièces ont passé la vérification' : 'Votre pièce a passé la vérification'),
    corpsHtml: corps,
    extraHtml: encartDossier(langue, personne.dossier, { label: t.statutValide, tone: 'valide' }),
    ctaLabel: langue === 'en' ? 'View my file' : 'Consulter mon dossier',
    ctaUrl: lien,
  })
}

function emailDocumentRejeteHtml(personne: Personne, champs: string[], motif: string) {
  const langue = personne.langue
  const t = TXT[langue]
  const { lien } = espaceLienEtIdentifiants(personne)
  const nomChamps = nommerChamps(champs, langue)
  const pluriel = champs.length > 1
  const corps = langue === 'en'
    ? `Hello ${escapeHtml(personne.prenom)},<br/><br/>Your ${pluriel ? 'documents' : 'document'} — <strong>${escapeHtml(nomChamps)}</strong> — for your COPAF 2026 file could not be approved.`
    : `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>${pluriel ? 'Vos documents' : 'Votre document'} — <strong>${escapeHtml(nomChamps)}</strong> — pour votre dossier COPAF 2026 ${pluriel ? "n'ont pas pu être validés" : "n'a pas pu être validé"}.`
  return emailShell({
    langue,
    pillLabel: langue === 'en' ? 'Action required' : 'Action requise',
    icon: '⚠',
    accentFrom: ALERT_FROM,
    accentTo: ALERT_TO,
    titre: langue === 'en' ? (pluriel ? 'Documents need correction' : 'Document needs correction') : (pluriel ? 'Documents à corriger' : 'Document à corriger'),
    sousTitre: langue === 'en' ? 'Could not be approved' : "N'a pas pu être validé",
    corpsHtml: corps,
    extraHtml: encartDossier(langue, personne.dossier, { label: t.statutRejete, tone: 'rejete' }) + encartMotif(langue, motif),
    ctaLabel: langue === 'en' ? 'Upload a new version' : 'Déposer une nouvelle version',
    ctaUrl: lien,
  })
}

function emailStatutConfirmeHtml(personne: Personne) {
  const langue = personne.langue
  const t = TXT[langue]
  const { lien } = espaceLienEtIdentifiants(personne)
  const corps = langue === 'en'
    ? `Hello ${escapeHtml(personne.prenom)},<br/><br/>Your registration for COPAF 2026 is now <strong>confirmed</strong>. We look forward to welcoming you!`
    : `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>Votre inscription à la COPAF 2026 est désormais <strong>confirmée</strong>. Nous avons hâte de vous accueillir !`
  return emailShell({
    langue,
    pillLabel: 'Notification',
    icon: '✓',
    titre: langue === 'en' ? 'Registration confirmed' : 'Inscription confirmée',
    sousTitre: langue === 'en' ? 'Your payment has been approved' : 'Votre paiement a été validé',
    corpsHtml: corps,
    extraHtml: encartDossier(langue, personne.dossier, { label: t.statutConfirme, tone: 'confirme' }),
    ctaLabel: langue === 'en' ? 'View my file' : 'Consulter mon dossier',
    ctaUrl: lien,
  })
}

function emailRelanceDossierHtml(personne: Personne, joursRestants: number) {
  const langue = personne.langue
  const t = TXT[langue]
  const { lien } = espaceLienEtIdentifiants(personne)
  const manquants = langue === 'en'
    ? [!personne.photoUrl && 'photo', !personne.passeportUrl && 'passport'].filter(Boolean).join(' and ')
    : [!personne.photoUrl && 'photo', !personne.passeportUrl && 'passeport'].filter(Boolean).join(' et ')
  const corps = langue === 'en'
    ? `Hello ${escapeHtml(personne.prenom)},<br/><br/>There are <strong>${joursRestants} days</strong> left before COPAF 2026 and your file is still incomplete: your <strong>${escapeHtml(manquants)}</strong> is missing.`
    : `Bonjour ${escapeHtml(personne.prenom)},<br/><br/>Il reste <strong>${joursRestants} jours</strong> avant la COPAF 2026 et votre dossier est encore incomplet : il manque votre <strong>${escapeHtml(manquants)}</strong>.`
  return emailShell({
    langue,
    pillLabel: langue === 'en' ? 'Reminder' : 'Rappel',
    icon: '⏰',
    accentFrom: ALERT_FROM,
    accentTo: ALERT_TO,
    titre: langue === 'en' ? `Incomplete file — ${joursRestants} days left` : `Dossier incomplet — J-${joursRestants}`,
    sousTitre: langue === 'en' ? 'Missing documents' : 'Documents manquants',
    corpsHtml: corps,
    extraHtml: encartDossier(langue, personne.dossier, { label: t.statutIncomplet, tone: 'incomplet' }),
    ctaLabel: langue === 'en' ? 'Complete my file' : 'Compléter mon dossier',
    ctaUrl: lien,
  })
}

// Information envoyee a tous les intervenants : le dossier Drive de
// documentation de reference est disponible dans leur espace. Redige en
// francais (langue de travail des intervenants), civilite M / Mme selon la
// colonne intervenants.civilite.
const WHATSAPP_URL = 'https://wa.me/2290169303019'
const CONTACT_REPONSE = 'contact@copaf-ports.com'

function blocDocumentation(titre: string, contenuHtml: string) {
  return `
<div style="margin:0 0 22px;">
<div style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${BRAND_FROM};margin-bottom:6px;">${escapeHtml(titre)}</div>
<div style="font-size:14.5px;color:#475569;line-height:1.7;">${contenuHtml}</div>
</div>`
}

function emailDocumentationIntervenantHtml(personne: Personne) {
  const civilite = personne.civilite === 'Mme' ? 'Mme' : 'M.'
  const nomComplet = `${escapeHtml(personne.prenom)} ${escapeHtml(personne.nom)}`.replace(/\s+/g, ' ').trim()
  const sections =
    blocDocumentation('Où le trouver', 'Dans votre espace intervenant, sur la carte «&nbsp;COPAF 2026 – Documentation de référence&nbsp;», cliquez sur «&nbsp;Ouvrir le dossier&nbsp;».') +
    blocDocumentation('Ce que contient le dossier', 'Les 8 modules du cours «&nbsp;Gestion moderne des ports&nbsp;» de la CNUCED (programme TrainForTrade). Ils offrent un cadre et un vocabulaire communs à l\'ensemble des intervenants, afin que nos interventions restent cohérentes entre elles.') +
    blocDocumentation('Comment les utiliser', 'Ces documents constituent un socle de référence commun. Ils sont là pour nourrir votre réflexion et vous servir de repère&nbsp;; votre expertise, notamment sur l\'IA, la cybersécurité et les Smart Ports, reste au cœur de vos interventions. Le Module&nbsp;4 («&nbsp;Les principaux enjeux du futur&nbsp;») est un bon point d\'entrée&nbsp;; les autres modules complètent selon votre thématique.') +
    `<div style="background:#f8fafc;border-left:4px solid ${BRAND_FROM};border-radius:12px;padding:16px 20px;font-size:14px;color:#475569;line-height:1.7;">
Vos supports de session (cahier des charges, template de présentation) restent disponibles au même endroit, dans la rubrique «&nbsp;Supports &amp; documents&nbsp;».<br/>
<strong style="color:#0f172a;">Et aussi, nous attendons vos différentes présentations.</strong>
</div>`

  const apres = `
<div style="margin-top:28px;font-size:14px;color:#475569;line-height:1.7;">
En cas de difficulté d'accès au dossier, n'hésitez pas à nous répondre directement à cet email ou à nous joindre par WhatsApp.
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 4px;"><tr><td align="center">
<table border="0" cellspacing="0" cellpadding="0"><tr>
<td align="center" bgcolor="#16a34a" style="border-radius:10px;">
<a href="${WHATSAPP_URL}" target="_blank" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:10px;display:inline-block;">WhatsApp · +229 01 69 30 30 19</a>
</td>
</tr></table>
</td></tr></table>
<div style="margin-top:26px;font-size:14px;color:#475569;line-height:1.7;">
Cordialement,<br/>
<strong style="color:#0f172a;">Comité d'organisation de la COPAF 2026</strong>
</div>`

  return emailShell({
    langue: 'fr',
    pillLabel: 'Notification',
    icon: '📚',
    titre: 'Documentation de référence disponible',
    sousTitre: 'Dans votre espace intervenant',
    corpsHtml: `Bonjour ${civilite} ${nomComplet},<br/><br/>Dans le cadre de la préparation de COPAF 2026 (19-21 octobre, Casablanca), nous avons mis à votre disposition un dossier de documentation de référence.`,
    extraHtml: `<div style="margin-top:26px;">${sections}</div>`,
    ctaLabel: 'Accéder à mon espace intervenant',
    ctaUrl: 'https://copaf-ports.com/intervenant',
    apresCtaHtml: apres,
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

    // Journal de chaque appel (table notifications_log) : permet de verifier
    // apres coup si un email est vraiment parti, sans dependre des logs Supabase.
    const journaliser = async (rows: Record<string, unknown>[]) => {
      if (!rows.length) return
      const { error } = await supabase.from('notifications_log').insert(rows)
      if (error) console.error('Echec journal notifications_log:', error.message)
    }

    const personne = await trouverPersonne(supabase, String(dossier).trim())
    if (!personne) {
      await journaliser([{ dossier: String(dossier), type, ok: false, detail: 'Dossier introuvable' }])
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
    const langue = personne.langue

    const envois: { to: string; promise: Promise<Response> }[] = []
    const programmer = (to: string, subject: string, html: string, replyTo?: string) => {
      envois.push({
        to,
        promise: fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromEmail, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
        }),
      })
    }
    const sansEmail: Record<string, unknown>[] = []
    const nomComplet = `${personne.prenom || ''} ${personne.nom || ''}`.trim()

    if (estParticipantOnly) {
      // Ces types ne notifient QUE la personne elle-meme (jamais l'admin,
      // qui est soit l'auteur de l'action, soit hors-sujet).
      if (!personne.email) {
        sansEmail.push({ dossier: personne.dossier, type, langue: personne.langue, ok: false, detail: 'Aucun email enregistré pour ce dossier' })
      } else if (type === 'documentation_intervenant' && personne.espace !== 'intervenant') {
        // Garde-fou : cette information ne concerne que l'espace intervenant.
        sansEmail.push({ dossier: personne.dossier, type, destinataire: personne.email, langue: personne.langue, ok: false, detail: 'Ignoré : ce dossier n\'est pas un intervenant' })
      } else if (type === 'documentation_intervenant') {
        programmer(
          personne.email,
          'COPAF 2026 – Documentation de référence disponible dans votre espace',
          emailDocumentationIntervenantHtml(personne),
          CONTACT_REPONSE,
        )
      } else {
        let subject = ''
        let html = ''
        if (type === 'document_admin') {
          subject = langue === 'en' ? 'A document is waiting in your COPAF 2026 space' : 'Un document vous attend dans votre espace COPAF 2026'
          html = emailDocumentAdminHtml(personne, String(label || 'Document'))
        } else if (type === 'document_valide') {
          subject = langue === 'en' ? (champsList.length > 1 ? 'Documents approved' : 'Document approved') : (champsList.length > 1 ? 'Documents validés' : 'Document validé')
          html = emailDocumentValideHtml(personne, champsList)
        } else if (type === 'document_rejete') {
          subject = langue === 'en' ? (champsList.length > 1 ? 'Documents need correction' : 'Document needs correction') : (champsList.length > 1 ? 'Documents à corriger' : 'Document à corriger')
          html = emailDocumentRejeteHtml(personne, champsList, String(motif || (langue === 'en' ? 'Not specified' : 'Non précisé')))
        } else if (type === 'statut_confirme') {
          subject = langue === 'en' ? 'Registration confirmed' : 'Inscription confirmée'
          html = emailStatutConfirmeHtml(personne)
        } else if (type === 'relance_dossier') {
          const j = Number(jours) || 0
          subject = langue === 'en' ? `Incomplete file — ${j} days left` : `Dossier incomplet — J-${j}`
          html = emailRelanceDossierHtml(personne, j)
        }

        if (html) programmer(personne.email, `COPAF 2026 — ${subject}`, html)
      }
    } else {
      if (adminEmail) {
        programmer(adminEmail, `📄 ${nomComplet} — ${ACTION_LABELS[type]}`, emailAdminHtml(personne, ACTION_LABELS[type]))
      }

      if (!personne.email) {
        sansEmail.push({ dossier: personne.dossier, type, langue: personne.langue, ok: false, detail: 'Aucun email enregistré pour ce dossier (confirmation participant non envoyée)' })
      } else {
        programmer(personne.email, `COPAF 2026 — ${PARTICIPANT_SUBJECT[langue][type]}`, emailParticipantHtml(personne, PARTICIPANT_SUBJECT[langue][type]))

        // Rattrapage : sur le parcours dossier-only, les documents sont
        // deposes AVANT que l'email ne soit connu — la confirmation
        // "documents reçus" n'a alors jamais pu partir a ce moment-la. Des
        // que l'email arrive, si les deux documents sont deja presents, on
        // l'envoie maintenant.
        if (type === 'email' && personne.photoUrl && personne.passeportUrl) {
          const subjectRattrapage = PARTICIPANT_SUBJECT[langue].photo
          programmer(personne.email, `COPAF 2026 — ${subjectRattrapage}`, emailParticipantHtml(personne, subjectRattrapage))
        }
      }
    }

    const resultats = await Promise.allSettled(envois.map(e => e.promise))
    const envoisRapport: { to: string; ok: boolean; status?: number; detail?: string }[] = []
    for (let i = 0; i < resultats.length; i++) {
      const r = resultats[i]
      const to = envois[i].to
      if (r.status === 'rejected') {
        console.error('Echec envoi Resend:', r.reason)
        envoisRapport.push({ to, ok: false, detail: String(r.reason) })
      } else {
        const detail = await r.value.text()
        if (!r.value.ok) console.error('Erreur Resend:', r.value.status, detail)
        envoisRapport.push({ to, ok: r.value.ok, status: r.value.status, detail })
      }
    }

    await journaliser([
      ...sansEmail,
      ...envoisRapport.map(e => ({ dossier: personne.dossier, type, destinataire: e.to, langue: personne.langue, ok: e.ok, status: e.status ?? null, detail: e.detail ?? null })),
    ])

    return new Response(JSON.stringify({ success: true, envois: envoisRapport, destinataireTrouve: !!personne.email }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Erreur interne notify-action:', err)
    return new Response(JSON.stringify({ success: true, warning: 'Erreur interne' }), { headers: corsHeaders })
  }
})
