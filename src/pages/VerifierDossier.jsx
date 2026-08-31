import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generateRecapPDF } from '../utils/generateRecapPDF'
import { generateBadge } from '../utils/generateBadge'
import { generateProformaPDF } from '../utils/generateProformaPDF'
import { generateFactureDefinitivePDF } from '../utils/generateFactureDefinitivePDF'
import { generateICS } from '../utils/generateICS'

const CONTACT_PHONE = '+229 01 69 30 30 19'
const WHATSAPP_NUMBER = '2290169303019'
const OFFICIAL_IBAN = 'BJ66BJ1040010003762812010162'

const fmtEur = n => `${Number(n || 0).toLocaleString('fr-FR')} EUR`

const DEFAULT_PROGRAMME_PREVIEW = {
  fr: [
    { jour: 'Jour 1', heure: '10h15', titre: 'IA et Smart Port africain' },
    { jour: 'Jour 2', heure: '9h00', titre: 'Excellence opérationnelle & cybersécurité' },
  ],
  en: [
    { jour: 'Day 1', heure: '10:15', titre: 'AI and the African Smart Port' },
    { jour: 'Day 2', heure: '9:00', titre: 'Operational excellence & cybersecurity' },
  ],
}

const STATUT_LABEL = {
  fr: {
    en_attente: { label: 'Inscription bien reçue — en cours de traitement', color: '#d97706', bg: '#fef3c7' },
    reserve:    { label: 'Place réservée — en attente de règlement', color: '#2563eb', bg: '#dbeafe' },
    confirme:   { label: 'Traité — documents disponibles', color: '#059669', bg: '#d1fae5' },
    annule:     { label: 'Annulé', color: '#dc2626', bg: '#fee2e2' },
  },
  en: {
    en_attente: { label: 'Registration received — processing in progress', color: '#d97706', bg: '#fef3c7' },
    reserve:    { label: 'Spot reserved — awaiting payment', color: '#2563eb', bg: '#dbeafe' },
    confirme:   { label: 'Processed — documents available', color: '#059669', bg: '#d1fae5' },
    annule:     { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' },
  },
}

const TR = {
  fr: {
    langSwitch: 'FR · English',
    kicker: 'Vérification & suivi de dossier',
    title: 'Vérifiez vos informations COPAF 2026',
    subtitle: "Entrez votre numéro de dossier ou collez l'IBAN reçu pour confirmer l'authenticité de votre demande, et accédez ensuite à votre espace personnel.",
    searchPh: 'N° de dossier ou IBAN officiel...',
    searchBtn: 'Vérifier',
    genericError: 'Erreur lors de la vérification. Réessayez ou contactez-nous directement.',
    ibanTitle: 'RIB Officiel Certifié & Authentique',
    ibanText: (org) => <>L'IBAN que vous avez copié correspond exactement au compte bancaire officiel de la <strong>{org}</strong>. Vous pouvez procéder à votre virement en toute sécurité.</>,
    receivedBannerTitle: 'Inscription bien reçue',
    dossierVerifTitle: 'Dossier vérifié et authentique',
    dossierVerifSub: 'Ce numéro correspond bien à une inscription COPAF 2026 réelle.',
    recapLabels: { dossier: 'Dossier', titulaire: 'Titulaire', participants: 'Participants', statut: 'Statut', date: "Date d'inscription" },
    espacePerso: 'Mon espace personnel',
    espacePersoText: 'Confirmez l\'email utilisé lors de votre inscription pour accéder à votre badge numérique, vos documents et le suivi détaillé de votre dossier.',
    emailPh: 'votre@email.com',
    validerBtn: 'Valider',
    emailNoMatch: "Cet email ne correspond pas au dossier renseigné. Vérifiez l'adresse utilisée lors de votre inscription.",
    timelineSteps: ['Inscription reçue', 'Paiement', 'Confirmé'],
    timelineAnnule: 'Dossier annulé',
    badgeTip: 'Astuce : faites une capture d\'écran ou ajoutez cette page à votre écran d\'accueil pour un accès rapide le jour J.',
    mesDocuments: 'Mes documents',
    docRecap: 'Récapitulatif', docProforma: 'Facture proforma', docFactureDef: 'Facture définitive', docBadge: 'Badge (après paiement)', docCalendar: 'Ajouter au calendrier',
    badgeWaiting: 'Le badge sera disponible ici dès que votre paiement sera confirmé par notre équipe.',
    programmeTitle: 'Mon programme',
    voirProgrammeComplet: 'Voir le programme complet',
    paiementTitle: 'Paiement',
    paiementConfirme: 'Paiement confirmé',
    paiementDifferee: 'Règlement différé — à régler avant la conférence',
    paiementEnAttente: 'Virement en attente de confirmation',
    voirRib: 'Voir les coordonnées bancaires',
    aideTitle: "Besoin d'aide",
    aideText: 'Une question sur votre dossier, votre paiement ou votre venue ?',
    contacterOrg: "Contacter l'organisation",
    whatsappMsg: dossier => `Bonjour, j'ai une question concernant mon dossier ${dossier} (COPAF 2026).`,
    infosImportantes: 'Infos importantes',
    notFoundTitle: "Cette référence n'existe pas dans notre base",
    notFoundSub: "Ne procédez à aucun virement avant d'avoir vérifié l'authenticité de cette coordonnée.",
    notFoundText: (phone) => <>Si un tiers vous a fourni cet IBAN ou ce numéro en prétendant représenter COPAF 2026, contactez-nous immédiatement au <strong>{phone}</strong> avant tout virement bancaire.</>,
    bankTitle: 'Coordonnées bancaires officielles — les SEULES valables',
    bankLabels: { banque: 'Banque', titulaire: 'Titulaire' },
    fraudWarning: (phone) => <><strong>Nos coordonnées bancaires ne seront JAMAIS modifiées</strong> par e-mail, SMS ou WhatsApp. Si une personne vous contacte en se faisant passer pour <strong>CRF PERFECTION</strong>, organisateur de la COPAF, veuillez ne communiquer aucune information et nous le signaler immédiatement au <strong>{phone}</strong> ou par e-mail à <strong>contact@copaf-ports.com</strong>.</>,
    dateLocale: 'fr-FR',
  },
  en: {
    langSwitch: 'EN · Français',
    kicker: 'Verification & file tracking',
    title: 'Verify your COPAF 2026 information',
    subtitle: 'Enter your file reference number or paste the IBAN you received to confirm the authenticity of your request, then access your personal space.',
    searchPh: 'File reference or official IBAN...',
    searchBtn: 'Verify',
    genericError: 'An error occurred during verification. Please try again or contact us directly.',
    ibanTitle: 'Certified & Authentic Official Bank Details',
    ibanText: (org) => <>The IBAN you copied matches exactly the official bank account of <strong>{org}</strong>. You can proceed with your transfer safely.</>,
    receivedBannerTitle: 'Registration successfully received',
    dossierVerifTitle: 'File verified and authentic',
    dossierVerifSub: 'This reference number matches a real COPAF 2026 registration.',
    recapLabels: { dossier: 'File', titulaire: 'Holder', participants: 'Participants', statut: 'Status', date: 'Registration date' },
    espacePerso: 'My personal space',
    espacePersoText: 'Confirm the email used during your registration to access your digital badge, your documents and detailed tracking of your file.',
    emailPh: 'your@email.com',
    validerBtn: 'Confirm',
    emailNoMatch: 'This email does not match the provided file. Please check the address used during your registration.',
    timelineSteps: ['Registration received', 'Payment', 'Confirmed'],
    timelineAnnule: 'File cancelled',
    badgeTip: 'Tip: take a screenshot or add this page to your home screen for quick access on the day.',
    mesDocuments: 'My documents',
    docRecap: 'Summary', docProforma: 'Proforma invoice', docFactureDef: 'Final invoice', docBadge: 'Badge (after payment)', docCalendar: 'Add to calendar',
    badgeWaiting: 'Your badge will be available here as soon as your payment is confirmed by our team.',
    programmeTitle: 'My programme',
    voirProgrammeComplet: 'View the full programme',
    paiementTitle: 'Payment',
    paiementConfirme: 'Payment confirmed',
    paiementDifferee: 'Deferred payment — due before the conference',
    paiementEnAttente: 'Bank transfer awaiting confirmation',
    voirRib: 'View bank details',
    aideTitle: 'Need help',
    aideText: 'A question about your file, your payment or your visit?',
    contacterOrg: 'Contact the organisers',
    whatsappMsg: dossier => `Hello, I have a question about my file ${dossier} (COPAF 2026).`,
    infosImportantes: 'Important information',
    notFoundTitle: 'This reference does not exist in our database',
    notFoundSub: 'Do not proceed with any bank transfer before verifying the authenticity of this reference.',
    notFoundText: (phone) => <>If someone provided you this IBAN or reference claiming to represent COPAF 2026, contact us immediately at <strong>{phone}</strong> before making any bank transfer.</>,
    bankTitle: 'Official bank details — the ONLY valid ones',
    bankLabels: { banque: 'Bank', titulaire: 'Account holder' },
    fraudWarning: (phone) => <>Our <strong>bank details will NEVER be changed</strong> by email, SMS or WhatsApp. If someone contacts you claiming to represent <strong>CRF PERFECTION</strong>, organiser of COPAF, please do not share any information and report it to us immediately at <strong>{phone}</strong> or by email at <strong>contact@copaf-ports.com</strong>.</>,
    dateLocale: 'en-GB',
  },
}

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    search:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    check:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    shield:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bank:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    mail:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    download:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    badge:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    receipt: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>,
    calendar:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    plus:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    globe:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    headset: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
    info:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  }
  return icons[name] || null
}

// ── Timeline de progression ──
function ProgressTimeline({ statut, t }) {
  const steps = t.timelineSteps.map((label, i) => ({ key: ['inscrit','paiement','confirme'][i], label }))
  const activeIndex = statut === 'confirme' ? 2 : statut === 'annule' ? -1 : 1

  if (statut === 'annule') {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#991b1b', fontWeight: 600, textAlign: 'center' }}>
        {t.timelineAnnule}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 4 }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {i > 0 && (
            <div style={{
              position: 'absolute', top: 13, right: '50%', width: '100%', height: 3,
              background: i <= activeIndex ? '#0073F4' : '#e2e8f0', zIndex: 0,
            }} />
          )}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: i <= activeIndex ? '#0073F4' : '#e2e8f0',
            color: i <= activeIndex ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 800,
          }}>
            {i < activeIndex ? <Ico name="check" size={13} color="#fff" /> : i + 1}
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: i <= activeIndex ? '#0073F4' : '#94a3b8', marginTop: 6, textAlign: 'center' }}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Carte de section du tableau de bord (Documents / Programme / Paiement / Aide) ──
function Card({ icon, title, children }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: 20, boxShadow: '0 4px 16px rgba(15,23,42,.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ico name={icon} size={17} color="#0073F4" />
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{title}</div>
      </div>
      {children}
    </div>
  )
}

// ── Bouton secondaire pleine largeur (bas de carte) ──
const cardBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', padding: '11px 14px', marginTop: 6, boxSizing: 'border-box',
  background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: 10,
  color: '#0f172a', fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
  cursor: 'pointer', fontFamily: 'inherit',
}

// ── Ligne document telechargeable (ou grisee si indisponible) ──
function DocRow({ icon, label, onClick, href, disabled, loading }) {
  const row = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, marginBottom: 8,
      background: disabled ? '#f8fafc' : '#fff', opacity: disabled ? 0.6 : 1,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: disabled ? '#94a3b8' : '#0f172a' }}>
        <Ico name={icon} size={15} color={disabled ? '#cbd5e1' : '#0073F4'} />
        {label}
      </span>
      {loading ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#0073F4', borderColor: 'rgba(0,115,244,.25)' }} /> : <Ico name="download" size={13} color={disabled ? '#cbd5e1' : '#94a3b8'} />}
    </div>
  )
  if (disabled) return row
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block' }}>{row}</a>
  return <button type="button" onClick={onClick} style={{ all: 'unset', display: 'block', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>{row}</button>
}

export default function VerifierDossier() {
  const [lang, setLang] = useState('fr')
  const t = TR[lang]
  const STATUTS = STATUT_LABEL[lang]

  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(undefined)
  const [error,   setError]   = useState('')

  const [trackEmail,   setTrackEmail]   = useState('')
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackResult,  setTrackResult]  = useState(undefined)
  const [trackError,   setTrackError]   = useState('')
  const [genLoading,   setGenLoading]   = useState('')

  const executeVerification = async (rawValue) => {
    const cleanedInput = rawValue.trim()
    if (!cleanedInput) return

    setLoading(true); setError(''); setResult(undefined); setTrackResult(undefined); setTrackEmail('')

    const inputAsIban = cleanedInput.replace(/\s+/g, '')
    if (inputAsIban === OFFICIAL_IBAN) {
      setResult({ type: 'iban' })
      setLoading(false)
      return
    }

    try {
      const { data, error: err } = await supabase.rpc('verifier_dossier', { p_dossier: cleanedInput })
      if (err) throw new Error(err.message)
      if (data && data.length > 0) setResult({ type: 'dossier', ...data[0] })
      else setResult(null)
    } catch (err) {
      setError(t.genericError)
      setResult(undefined)
    }
    setLoading(false)
  }

  const handleSearch = e => { e.preventDefault(); executeVerification(input) }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dossierParam = params.get('dossier') || params.get('ref') || params.get('iban')
    if (dossierParam) { setInput(dossierParam); executeVerification(dossierParam) }
  }, [])

  const handleTrackSubmit = async e => {
    e.preventDefault()
    if (!trackEmail.trim() || !result?.dossier) return
    setTrackLoading(true); setTrackError(''); setTrackResult(undefined)
    try {
      const { data, error: err } = await supabase.rpc('suivi_dossier', { p_dossier: result.dossier, p_email: trackEmail.trim() })
      if (err) throw new Error(err.message)
      setTrackResult(data && data.length > 0 ? data[0] : null)
    } catch (err) {
      setTrackError(t.genericError)
      setTrackResult(undefined)
    }
    setTrackLoading(false)
  }

  const formData = () => ({
    nom: trackResult.nom, prenom: trackResult.prenom, organisation: trackResult.organisation,
    poste: trackResult.poste, pays: trackResult.pays, email: trackResult.email,
  })

  const handleDownloadRecap = async () => {
    setGenLoading('recap')
    try {
      await generateRecapPDF({ form: formData(), dossier: trackResult.dossier, nb: trackResult.participants, total: trackResult.montant, paiementMode: trackResult.paiement_mode, lang })
    } finally { setGenLoading('') }
  }

  const handleDownloadProforma = async () => {
    setGenLoading('proforma')
    try {
      await generateProformaPDF({ form: formData(), dossier: trackResult.dossier, nb: trackResult.participants, total: trackResult.montant, lang })
    } finally { setGenLoading('') }
  }

  const handleDownloadFacture = async () => {
    if (!trackResult.numero_facture) return
    setGenLoading('facture')
    try {
      await generateFactureDefinitivePDF({ form: formData(), dossier: trackResult.dossier, numeroFacture: trackResult.numero_facture, nb: trackResult.participants, total: trackResult.montant, lang })
    } finally { setGenLoading('') }
  }

  const handleDownloadBadge = async () => {
    setGenLoading('badge')
    try {
      await generateBadge({ nomPrenom: `${trackResult.prenom} ${trackResult.nom}`, fonction: trackResult.poste || '', dossier: trackResult.dossier, photoSrc: trackResult.photo_url || null })
    } finally { setGenLoading('') }
  }

  const handleAddToCalendar = () => generateICS({ dossier: trackResult?.dossier, lang })

  return (
    <section style={{
      padding: 'clamp(64px,10vw,120px) 0', minHeight: '100vh',
      background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite; }
        .lang-switch{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:#fff;border:1.5px solid #e2e8f0;border-radius:100px;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:700;color:#0073F4;transition:all .2s}
        .lang-switch:hover{border-color:#0073F4;background:#EBF3FF}
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

        {/* SELECTEUR DE LANGUE */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button className="lang-switch" type="button" onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}>
            <Ico name="globe" size={14} color="#0073F4" />
            {t.langSwitch}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#000E91', borderRadius: 100, padding: '8px 22px', marginBottom: 20 }}>
            <Ico name="shield" size={14} color="#0073F4" />
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t.kicker}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4.5vw,38px)', fontWeight: 900, color: '#0f172a', marginBottom: 12, lineHeight: 1.15 }}>
            {t.title}
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSearch} style={{
          background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20,
          padding: 24, boxShadow: '0 8px 32px rgba(0,14,145,.08)', marginBottom: 24,
          display: 'flex', gap: 10, flexWrap: 'wrap',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t.searchPh}
            style={{ flex: '1 1 220px', padding: '14px 16px', fontSize: 15, fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, outline: 'none', boxSizing: 'border-box' }}
          />
          <button type="submit" disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px',
            background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
            borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: loading ? 0.7 : 1, flexShrink: 0,
          }}>
            {loading ? <div className="spinner" /> : <Ico name="search" size={16} color="#fff" />}
            {t.searchBtn}
          </button>
        </form>

        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '14px 18px', marginBottom: 24, color: '#dc2626', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        {result && result.type === 'iban' && (
          <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 8px 32px rgba(5,150,105,.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="check" size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46' }}>{t.ibanTitle}</div>
                <div style={{ fontSize: 13, color: '#047857', marginTop: 2, lineHeight: 1.4 }}>
                  {t.ibanText('CRF PERFECTION (Société Générale Bénin)')}
                </div>
              </div>
            </div>
          </div>
        )}

        {result && result.type === 'dossier' && (
          <div style={{ background: '#fff', border: '1.5px solid #a7f3d0', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 8px 32px rgba(5,150,105,.1)' }}>

            {/* Bandeau "inscription bien reçue" toujours visible des qu'un dossier est trouve */}
            <div style={{ background: (STATUTS[result.statut] || {}).bg || '#f1f5f9', border: `1px solid ${(STATUTS[result.statut] || {}).color || '#cbd5e1'}40`, borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
              <Ico name="check" size={18} color={(STATUTS[result.statut] || {}).color || '#059669'} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: (STATUTS[result.statut] || {}).color || '#065f46' }}>{t.receivedBannerTitle}</div>
                <div style={{ fontSize: 12.5, color: (STATUTS[result.statut] || {}).color || '#047857', marginTop: 1 }}>{(STATUTS[result.statut] || {}).label || result.statut}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="check" size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{t.dossierVerifTitle}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{t.dossierVerifSub}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              {[
                { l: t.recapLabels.dossier,      v: result.dossier },
                { l: t.recapLabels.titulaire,    v: `${result.initiales} — ${result.organisation || 'N/A'}` },
                { l: t.recapLabels.participants, v: result.participants },
                { l: t.recapLabels.statut,       v: (STATUTS[result.statut] || {}).label || result.statut },
                { l: t.recapLabels.date, v: new Date(result.date_inscription).toLocaleDateString(t.dateLocale, { day: '2-digit', month: 'long', year: 'numeric' }) },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #eef2f7' : 'none', fontSize: 13.5 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>{row.l}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{row.v}</span>
                </div>
              ))}
            </div>

            {/* ── Espace personnel deverrouille par email ── */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 22 }}>
              <div style={{ fontSize: 10, color: '#0073F4', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                {t.espacePerso}
              </div>
              <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
                {t.espacePersoText}
              </p>

              <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <input
                  type="email" required value={trackEmail}
                  onChange={e => setTrackEmail(e.target.value)}
                  placeholder={t.emailPh}
                  style={{ flex: '1 1 200px', padding: '11px 14px', fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={trackLoading} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px',
                  background: '#000E91', border: 'none', borderRadius: 10, color: '#fff',
                  fontWeight: 700, fontSize: 12.5, cursor: trackLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: trackLoading ? 0.7 : 1, flexShrink: 0,
                }}>
                  {trackLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Ico name="mail" size={14} color="#fff" />}
                  {t.validerBtn}
                </button>
              </form>

              {trackError && <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 8 }}>{trackError}</div>}

              {trackResult === null && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#991b1b' }}>
                  {t.emailNoMatch}
                </div>
              )}

              {trackResult && (() => {
                const paiementSub = trackResult.statut === 'confirme'
                  ? t.paiementConfirme
                  : trackResult.paiement_mode === 'plus_tard'
                    ? t.paiementDifferee
                    : t.paiementEnAttente
                const progItems = (trackResult.programme_personnalise && trackResult.programme_personnalise.length)
                  ? trackResult.programme_personnalise
                  : DEFAULT_PROGRAMME_PREVIEW[lang]
                const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsappMsg(trackResult.dossier))}`
                const scrollToRib = () => document.getElementById('rib-officiel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

                return (
                  <div style={{ marginTop: 14 }}>

                    {/* Bandeau dossier */}
                    <div style={{
                      background: 'linear-gradient(135deg,#000E91,#0073F4)', borderRadius: 18, padding: '20px 24px',
                      color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      flexWrap: 'wrap', gap: 14, marginBottom: 18,
                    }}>
                      <div>
                        <div style={{ fontSize: 11.5, opacity: 0.75, fontWeight: 600 }}>{t.recapLabels.dossier} {trackResult.dossier}</div>
                        <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{trackResult.prenom} {trackResult.nom}</div>
                        {(trackResult.organisation || trackResult.poste) && (
                          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                            {[trackResult.organisation, trackResult.poste].filter(Boolean).join(' — ')}
                          </div>
                        )}
                      </div>
                      <span style={{
                        background: 'rgba(255,255,255,.18)', padding: '8px 16px', borderRadius: 100,
                        fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                        {(STATUTS[trackResult.statut] || {}).label || trackResult.statut}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div style={{ marginBottom: 22 }}>
                      <ProgressTimeline statut={trackResult.statut} t={t} />
                    </div>

                    {/* Grille 4 blocs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginBottom: 18 }}>

                      <Card icon="receipt" title={t.mesDocuments}>
                        <DocRow icon="download" label={t.docRecap} onClick={handleDownloadRecap} loading={genLoading === 'recap'} />
                        <DocRow icon="receipt" label={t.docProforma} onClick={handleDownloadProforma} loading={genLoading === 'proforma'} />
                        {trackResult.numero_facture && (
                          <DocRow icon="receipt" label={t.docFactureDef} onClick={handleDownloadFacture} loading={genLoading === 'facture'} />
                        )}
                        {(trackResult.documents || []).map(doc => (
                          <DocRow key={doc.id} icon="receipt" label={doc.label} href={doc.url} />
                        ))}
                        <DocRow
                          icon="badge" label={t.docBadge}
                          disabled={trackResult.statut !== 'confirme'}
                          onClick={trackResult.statut === 'confirme' ? handleDownloadBadge : undefined}
                          loading={genLoading === 'badge'}
                        />
                        <DocRow icon="calendar" label={t.docCalendar} onClick={handleAddToCalendar} />
                      </Card>

                      <Card icon="calendar" title={t.programmeTitle}>
                        {progItems.map((item, i) => (
                          <div key={i} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{item.jour} · {item.heure}</div>
                            <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 2 }}>{item.titre}</div>
                          </div>
                        ))}
                        <a href="/#programme" style={cardBtnStyle}>{t.voirProgrammeComplet}</a>
                      </Card>

                      <Card icon="bank" title={t.paiementTitle}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{fmtEur(trackResult.montant)}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 4 }}>{paiementSub}</div>
                        <button type="button" onClick={scrollToRib} style={cardBtnStyle}>{t.voirRib}</button>
                      </Card>

                      <Card icon="headset" title={t.aideTitle}>
                        <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, margin: '0 0 8px' }}>{t.aideText}</p>
                        <a href={whatsappHref} target="_blank" rel="noreferrer" style={cardBtnStyle}>
                          <Ico name="mail" size={14} color="#0f172a" />
                          {t.contacterOrg}
                        </a>
                      </Card>
                    </div>

                    {/* Infos importantes (pilotees par le secretariat) */}
                    {trackResult.infos_importantes && trackResult.infos_importantes.length > 0 && (
                      <div style={{ background: '#EBF3FF', border: '1.5px solid #bfdbfe', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <Ico name="info" size={18} color="#0073F4" />
                        <div>
                          <div style={{ fontSize: 11, color: '#0073F4', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                            {t.infosImportantes}
                          </div>
                          {trackResult.infos_importantes.map(info => (
                            <p key={info.id} style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.6, margin: '0 0 6px' }}>{info.contenu}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {trackResult.statut === 'confirme' && (
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 14, textAlign: 'center', lineHeight: 1.6 }}>
                        {t.badgeTip}
                      </p>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {result === null && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 20, padding: 28, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="alert" size={22} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#7f1d1d' }}>{t.notFoundTitle}</div>
                <div style={{ fontSize: 13, color: '#991b1b' }}>{t.notFoundSub}</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: '#7f1d1d', lineHeight: 1.7, margin: 0 }}>
              {t.notFoundText(CONTACT_PHONE)}
            </p>
          </div>
        )}

        <div id="rib-officiel" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,14,145,.06)', scrollMarginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="bank" size={18} color="#0073F4" />
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>{t.bankTitle}</div>
          </div>
          {[
            { l: t.bankLabels.banque,    v: 'Société Générale Bénin (SGB)', empha: false },
            { l: 'IBAN',      v: 'BJ66 BJ10 4001 0003 7628 1201 0162', empha: true },
            { l: 'BIC',       v: 'SOGEBJBJ', empha: true },
            { l: t.bankLabels.titulaire, v: 'CRF PERFECTION', empha: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{item.l}</span>
              <span style={{ fontSize: item.empha ? 14 : 13, color: item.empha ? '#000E91' : '#0f172a', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>{item.v}</span>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
            ℹ️ NB : Virement RTGS préféré
          </div>
        </div>

        <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Ico name="alert" size={18} color="#d97706" />
          <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.75, margin: 0 }}>
            {t.fraudWarning(CONTACT_PHONE)}
          </p>
        </div>
      </div>
    </section>
  )
}