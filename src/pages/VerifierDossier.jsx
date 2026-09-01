import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generateRecapPDF } from '../utils/generateRecapPDF'
import { generateBadge } from '../utils/generateBadge'
import { generateProformaPDF } from '../utils/generateProformaPDF'
import { generateFactureDefinitivePDF } from '../utils/generateFactureDefinitivePDF'
import { generateICS } from '../utils/generateICS'
import { Ico } from '../utils/dossierUi'
import ParticipantDashboard from '../components/ParticipantDashboard'

const CONTACT_PHONE = '+229 01 69 30 30 19'
const OFFICIAL_IBAN = 'BJ66BJ1040010003762812010162'

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
    espacePersoText: 'Entrez votre numéro de dossier et l\'email utilisé lors de votre inscription pour accéder directement à votre badge numérique, vos documents et le suivi de votre dossier — sans rien recevoir par e-mail.',
    dossierPh: 'N° de dossier (ex. COPAF2026-12345)',
    emailPh: 'votre@email.com',
    validerBtn: 'Valider',
    accessBtn: 'Accéder à mon espace',
    accessError: "Dossier ou email introuvable. Vérifiez ces informations et réessayez.",
    signOut: 'Se déconnecter',
    noDossierTitle: 'Aucune inscription trouvée',
    noDossierText: "Aucun dossier COPAF 2026 n'est associé à ce compte. Si vous venez de vous inscrire, réessayez dans quelques minutes, ou contactez-nous.",
    loadingDossier: 'Chargement de votre espace personnel...',
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
    espacePersoText: 'Enter your file reference number and the email used at registration to access your digital badge, your documents and your file tracking directly — nothing to receive by email.',
    dossierPh: 'File reference (e.g. COPAF2026-12345)',
    emailPh: 'your@email.com',
    validerBtn: 'Confirm',
    accessBtn: 'Access my space',
    accessError: 'File or email not found. Check these details and try again.',
    signOut: 'Sign out',
    noDossierTitle: 'No registration found',
    noDossierText: 'No COPAF 2026 file is linked to this account. If you just registered, try again in a few minutes, or contact us.',
    loadingDossier: 'Loading your personal space...',
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

export default function VerifierDossier() {
  const [lang, setLang] = useState('fr')
  const t = TR[lang]
  const STATUTS = STATUT_LABEL[lang]

  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(undefined)
  const [error,   setError]   = useState('')

  const [session,         setSession]         = useState(null)
  const [accessDossier,   setAccessDossier]   = useState('')
  const [accessEmail,     setAccessEmail]     = useState('')
  const [accessLoading,   setAccessLoading]   = useState(false)
  const [accessError,     setAccessError]     = useState('')
  const [myDossier,       setMyDossier]       = useState(undefined)
  const [myDossierLoading, setMyDossierLoading] = useState(false)
  const [genLoading,      setGenLoading]      = useState('')

  const executeVerification = async (rawValue) => {
    const cleanedInput = rawValue.trim()
    if (!cleanedInput) return

    setLoading(true); setError(''); setResult(undefined)

    const inputAsIban = cleanedInput.replace(/\s+/g, '')
    if (inputAsIban === OFFICIAL_IBAN) {
      setResult({ type: 'iban' })
      setLoading(false)
      return
    }

    try {
      const { data, error: err } = await supabase.rpc('verifier_dossier', { p_dossier: cleanedInput })
      if (err) throw new Error(err.message)
      if (data && data.length > 0) {
        setResult({ type: 'dossier', ...data[0] })
        setAccessDossier(data[0].dossier) // pre-remplit le formulaire d'acces ci-dessous
      } else setResult(null)
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

  // ── Session Supabase Auth (lien magique) ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => sub.subscription.unsubscribe()
  }, [])

  const fetchMyDossier = async () => {
    setMyDossierLoading(true)
    try {
      const { data, error: err } = await supabase.rpc('mon_dossier')
      if (err) throw new Error(err.message)
      setMyDossier(data && data.length > 0 ? data[0] : null)
    } catch {
      setMyDossier(null)
    }
    setMyDossierLoading(false)
  }

  useEffect(() => {
    if (session?.user) fetchMyDossier()
    else setMyDossier(undefined)
  }, [session?.user?.id])

  // Connexion directe par dossier + email (voir supabase/functions/access-espace) :
  // pas d'aller-retour par e-mail a chaque visite. La fonction verifie le
  // couple cote serveur puis renvoie un lien magique deja pret ; on suit ce
  // lien immediatement pour etablir une vraie session Supabase Auth, comme
  // si le participant avait clique un lien recu par e-mail.
  const handleAccessSubmit = async e => {
    e.preventDefault()
    if (!accessDossier.trim() || !accessEmail.trim()) return
    setAccessLoading(true); setAccessError('')
    try {
      const { data, error: err } = await supabase.functions.invoke('access-espace', {
        body: { dossier: accessDossier.trim(), email: accessEmail.trim() },
      })
      if (err || !data?.action_link) throw new Error(err?.message || 'Connexion impossible')
      window.location.href = data.action_link
    } catch {
      setAccessError(t.accessError)
      setAccessLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMyDossier(undefined)
    setAccessDossier('')
    setAccessEmail('')
  }

  const formData = () => ({
    nom: myDossier.nom, prenom: myDossier.prenom, organisation: myDossier.organisation,
    poste: myDossier.poste, pays: myDossier.pays, email: myDossier.email,
  })

  const handleDownloadRecap = async () => {
    setGenLoading('recap')
    try {
      await generateRecapPDF({ form: formData(), dossier: myDossier.dossier, nb: myDossier.participants, total: myDossier.montant, paiementMode: myDossier.paiement_mode, lang })
    } finally { setGenLoading('') }
  }

  const handleDownloadProforma = async () => {
    setGenLoading('proforma')
    try {
      await generateProformaPDF({ form: formData(), dossier: myDossier.dossier, nb: myDossier.participants, total: myDossier.montant, lang })
    } finally { setGenLoading('') }
  }

  const handleDownloadFacture = async () => {
    if (!myDossier.numero_facture) return
    setGenLoading('facture')
    try {
      await generateFactureDefinitivePDF({ form: formData(), dossier: myDossier.dossier, numeroFacture: myDossier.numero_facture, nb: myDossier.participants, total: myDossier.montant, lang })
    } finally { setGenLoading('') }
  }

  const handleDownloadBadge = async () => {
    setGenLoading('badge')
    try {
      await generateBadge({ nomPrenom: `${myDossier.prenom} ${myDossier.nom}`, fonction: myDossier.poste || '', dossier: myDossier.dossier, photoSrc: myDossier.photo_url || null })
    } finally { setGenLoading('') }
  }

  const handleAddToCalendar = () => generateICS({ dossier: myDossier?.dossier, lang })

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

        {/* ── Mon espace personnel (acces direct par dossier + email, independant de la verification ci-dessus) ── */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 8px 32px rgba(0,14,145,.08)' }}>
          <div style={{ fontSize: 10, color: '#0073F4', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
            {t.espacePerso}
          </div>

          {!session && (
            <>
              <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
                {t.espacePersoText}
              </p>
              <form onSubmit={handleAccessSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text" required value={accessDossier}
                  onChange={e => setAccessDossier(e.target.value)}
                  placeholder={t.dossierPh}
                  style={{ flex: '1 1 200px', padding: '11px 14px', fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                />
                <input
                  type="email" required value={accessEmail}
                  onChange={e => setAccessEmail(e.target.value)}
                  placeholder={t.emailPh}
                  style={{ flex: '1 1 200px', padding: '11px 14px', fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={accessLoading} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px',
                  background: '#000E91', border: 'none', borderRadius: 10, color: '#fff',
                  fontWeight: 700, fontSize: 12.5, cursor: accessLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: accessLoading ? 0.7 : 1, flexShrink: 0,
                }}>
                  {accessLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Ico name="mail" size={14} color="#fff" />}
                  {t.accessBtn}
                </button>
              </form>
              {accessError && <div style={{ fontSize: 12.5, color: '#dc2626', marginTop: 8 }}>{accessError}</div>}
            </>
          )}

          {session && myDossierLoading && (
            <p style={{ fontSize: 12.5, color: '#64748b' }}>{t.loadingDossier}</p>
          )}

          {session && !myDossierLoading && myDossier === null && (
            <div>
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: '#991b1b', marginBottom: 12 }}>
                <strong>{t.noDossierTitle}</strong>
                <div style={{ marginTop: 4 }}>{t.noDossierText}</div>
              </div>
              <button type="button" onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                {t.signOut}
              </button>
            </div>
          )}

          {session && myDossier && (
            <ParticipantDashboard
              myDossier={myDossier}
              lang={lang}
              t={t}
              STATUTS={STATUTS}
              genLoading={genLoading}
              onDownloadRecap={handleDownloadRecap}
              onDownloadProforma={handleDownloadProforma}
              onDownloadFacture={handleDownloadFacture}
              onDownloadBadge={handleDownloadBadge}
              onAddToCalendar={handleAddToCalendar}
              onSignOut={handleSignOut}
              onRefresh={fetchMyDossier}
            />
          )}
        </div>

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