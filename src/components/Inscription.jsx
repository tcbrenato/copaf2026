import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import emailjs from '@emailjs/browser'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SHEET_URL     = 'https://script.google.com/macros/s/AKfycbyLClkSCepqlUnoshI8D01U_G4'
const PRIX_UNITAIRE = 3500
const EMAILJS_SVC   = 'service_x07g4et'
const EMAILJS_TPL   = 'template_7wrkmm1'
const EMAILJS_KEY   = 'zBZAZxCfznICTKLJK'

// ─── PAYS ────────────────────────────────────────────────────────────────────
const PAYS = [
  { value: 'Bénin',              label: '🇧🇯 Bénin' },
  { value: 'Togo',               label: '🇹🇬 Togo' },
  { value: "Côte d'Ivoire",      label: "🇨🇮 Côte d'Ivoire" },
  { value: 'Sénégal',            label: '🇸🇳 Sénégal' },
  { value: 'Guinée',             label: '🇬🇳 Guinée' },
  { value: 'Mauritanie',         label: '🇲🇷 Mauritanie' },
  { value: 'Nigeria',            label: '🇳🇬 Nigeria' },
  { value: 'Ghana',              label: '🇬🇭 Ghana' },
  { value: 'Gambie',             label: '🇬🇲 Gambie' },
  { value: 'Sierra Leone',       label: '🇸🇱 Sierra Leone' },
  { value: 'Liberia',            label: '🇱🇷 Liberia' },
  { value: 'Cameroun',           label: '🇨🇲 Cameroun' },
  { value: 'Gabon',              label: '🇬🇦 Gabon' },
  { value: 'Congo',              label: '🇨🇬 Congo (Brazzaville)' },
  { value: 'RDC',                label: '🇨🇩 RDC (Congo)' },
  { value: 'Guinée Équatoriale', label: '🇬🇶 Guinée Équatoriale' },
  { value: 'Angola',             label: '🇦🇴 Angola' },
  { value: 'Cap-Vert',           label: '🇨🇻 Cap-Vert' },
  { value: 'Guinée-Bissau',      label: '🇬🇼 Guinée-Bissau' },
  { value: 'Afrique du Sud',     label: '🇿🇦 Afrique du Sud' },
  { value: 'Algérie',            label: '🇩🇿 Algérie' },
  { value: 'Maroc',              label: '🇲🇦 Maroc' },
  { value: 'Tunisie',            label: '🇹🇳 Tunisie' },
  { value: 'Égypte',             label: '🇪🇬 Égypte' },
  { value: 'Kenya',              label: '🇰🇪 Kenya' },
  { value: 'Tanzanie',           label: '🇹🇿 Tanzanie' },
  { value: 'Émirats Arabes Unis',label: '🇦🇪 Émirats Arabes Unis' },
  { value: 'Arabie Saoudite',    label: '🇸🇦 Arabie Saoudite' },
  { value: 'Chine',              label: '🇨🇳 Chine' },
  { value: 'Inde',               label: '🇮🇳 Inde' },
  { value: 'France',             label: '🇫🇷 France' },
  { value: 'Belgique',           label: '🇧🇪 Belgique' },
  { value: 'Allemagne',          label: '🇩🇪 Allemagne' },
  { value: 'Pays-Bas',           label: '🇳🇱 Pays-Bas' },
  { value: 'États-Unis',         label: '🇺🇸 États-Unis' },
  { value: 'Canada',             label: '🇨🇦 Canada' },
  { value: 'Brésil',             label: '🇧🇷 Brésil' },
  { value: 'Autre',              label: '🌍 Autre pays' },
]

// ─── TYPES D'INSCRIPTION ─────────────────────────────────────────────────────
const TYPES = [
  {
    id: 'participant',
    emoji: '🎫',
    label: 'Participant',
    sublabel: 'Je participe à la conférence',
    desc: 'Ports, autorités portuaires, logisticiens, shippers et tout professionnel du maritime.',
    prix: '3 500 €',
    tag: 'par personne',
    cta: "S'inscrire maintenant",
    redirect: false,
    color: '#0073F4',
    bg: '#EBF3FF',
  },
  {
    id: 'sponsor',
    emoji: '💎',
    label: 'Sponsor / Partenaire',
    sublabel: 'Visibilité & partenariat institutionnel',
    desc: 'Sponsors Platine, Or, Argent, Bronze — ou partenariat institutionnel, média, académique.',
    prix: 'Dès 8 000 €',
    tag: 'sponsors & partenaires',
    cta: 'Voir les offres',
    redirect: true,
    redirectTo: '/partenariats',
    color: '#000E91',
    bg: 'rgba(0,14,145,0.06)',
  },
  {
    id: 'exposant',
    emoji: '🖥️',
    label: 'Exposant Digital',
    sublabel: 'Vitrine digitale de vos solutions',
    desc: 'Exposition 100% digitale sur le site COPAF et les tablettes distribuées aux participants.',
    prix: 'Dès 500 €',
    tag: 'digital · site + tablettes',
    cta: 'Voir les formules',
    redirect: true,
    redirectTo: '/exposition-digitale',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.06)',
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const genDossier = () => `COPAF2026-${Math.floor(Math.random() * 90000) + 10000}`

async function upsertContact(form) {
  const { data, error } = await supabase
    .from('contacts')
    .upsert(
      {
        email:        form.email,
        prenom:       form.prenom,
        nom:          form.nom,
        telephone:    form.telephone,
        organisation: form.organisation,
        poste:        form.poste,
        pays:         form.pays,
        source:       'inscription',
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id
}

async function createInscription(contactId, form, nbParticipants, montant, paiementMode, dossier) {
  const { error } = await supabase.from('inscriptions').insert([{
    contact_id:      contactId,
    dossier,
    participants:    nbParticipants,
    montant,
    paiement_status: paiementMode === 'maintenant' ? 'en_attente' : 'reserve',
    paiement_mode:   paiementMode,
    message:         form.message,
  }])
  if (error) throw new Error(error.message)
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function Inscription() {
  const navigate = useNavigate()

  const [etape,         setEtape]         = useState(1)
  const [typeChoisi,    setTypeChoisi]    = useState(null)
  const [form,          setForm]          = useState({
    nom: '', prenom: '', email: '', telephone: '',
    organisation: '', poste: '', pays: '', participants: '1', message: '',
  })
  const [paiementMode,  setPaiementMode]  = useState('maintenant')
  const [cgv,           setCgv]           = useState(false)
  const [rgpd,          setRgpd]          = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [submitted,     setSubmitted]     = useState(false)
  const [errorMsg,      setErrorMsg]      = useState('')
  const [dossierNum,    setDossierNum]    = useState('')
  const [focused,       setFocused]       = useState('')

  const nb     = parseInt(form.participants) || 1
  const total  = nb * PRIX_UNITAIRE

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleTypeSelect = type => {
    setTypeChoisi(type)
    if (type.redirect) navigate(type.redirectTo)
    else setEtape(2)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const dossier = genDossier()

    try {
      // 1. Upsert contact
      const contactId = await upsertContact(form)

      // 2. Inscription
      await createInscription(contactId, form, nb, total, paiementMode, dossier)

      // 3. Google Sheets (best-effort)
      fetch(SHEET_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, montant: total, dossier, paiement: paiementMode }),
      }).catch(() => {})

      // 4. Email de confirmation
      await emailjs.send(EMAILJS_SVC, EMAILJS_TPL, {
        prenom:          form.prenom,
        nom:             form.nom,
        email:           form.email,
        organisation:    form.organisation,
        poste:           form.poste,
        pays:            form.pays,
        participants:    form.participants,
        montant:         `${total.toLocaleString('fr-FR')} €`,
        tarif:           `Tarif unique — ${PRIX_UNITAIRE.toLocaleString('fr-FR')} €/pers.`,
        dossier,
        paiement_mode:   paiementMode === 'maintenant' ? 'Paiement immédiat (7 jours)' : 'Réservation — paiement différé',
        paiement_maintenant: paiementMode === 'maintenant' ? 'true' : '',
        paiement_reserve:    paiementMode === 'plus_tard'  ? 'true' : '',
      }, EMAILJS_KEY)

      setDossierNum(dossier)
      setSubmitted(true)
    } catch (err) {
      setErrorMsg('Une erreur est survenue : ' + err.message)
    }

    setLoading(false)
  }

  // ─── STYLES PARTAGÉS ───────────────────────────────────────────────────────
  const inputStyle = name => ({
    width: '100%',
    padding: '13px 16px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#0f172a',
    background: focused === name ? '#fff' : '#f8fafc',
    border: `1.5px solid ${focused === name ? '#0073F4' : '#e2e8f0'}`,
    borderRadius: 12,
    outline: 'none',
    transition: 'all .2s',
    boxSizing: 'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,115,244,.12)' : 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
  })

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 7,
  }

  return (
    <>
      {/* ── GLOBAL CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html { overflow-x: clip; scroll-behavior: smooth; }
        body { overflow-x: clip; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(.95); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,115,244,.35); }
          50%      { box-shadow: 0 0 0 10px rgba(0,115,244,0); }
        }

        .fade-up    { animation: fadeUp .5s ease both; }
        .fade-up-1  { animation: fadeUp .5s .05s ease both; }
        .fade-up-2  { animation: fadeUp .5s .15s ease both; }
        .fade-up-3  { animation: fadeUp .5s .25s ease both; }
        .scale-in   { animation: scaleIn .4s ease both; }
        .spinner    { width:20px;height:20px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite; }

        /* ── Type cards ── */
        .type-card {
          background:#fff;
          border:1.5px solid #e2e8f0;
          border-radius:20px;
          padding:28px 24px;
          cursor:pointer;
          transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .25s, border-color .25s;
          position:relative;
          overflow:hidden;
        }
        .type-card:hover  { transform:translateY(-6px); box-shadow:0 20px 48px rgba(0,14,145,.12); }
        .type-card:active { transform:scale(.98); }
        @media (max-width:520px) {
          .type-card:hover { transform:none; }
          .type-card:active { transform:scale(.98); }
        }

        /* ── Grid cartes ── */
        .cards-grid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:18px;
          max-width:960px;
          margin:0 auto;
        }
        @media (max-width:820px) {
          .cards-grid { grid-template-columns:minmax(0,1fr) minmax(0,1fr); }
          .card-last  { grid-column:1/-1; max-width:400px; margin:0 auto; width:100%; }
        }
        @media (max-width:520px) {
          .cards-grid { grid-template-columns:minmax(0,1fr); gap:14px; }
          .card-last  { grid-column:auto; max-width:100%; }
        }

        /* ── Grid formulaire + sidebar ── */
        .form-layout {
          display:grid;
          grid-template-columns:minmax(0,1fr) 300px;
          gap:24px;
          align-items:start;
        }
        @media (max-width:880px) {
          .form-layout { grid-template-columns:minmax(0,1fr); }
        }

        /* ── Champs 2 colonnes ── */
        .field-row {
          display:grid;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr);
          gap:14px;
          margin-bottom:16px;
        }
        @media (max-width:540px) {
          .field-row { grid-template-columns:minmax(0,1fr); }
        }

        /* ── Boutons paiement ── */
        .pay-grid {
          display:grid;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr);
          gap:12px;
        }
        @media (max-width:420px) {
          .pay-grid { grid-template-columns:minmax(0,1fr); }
        }

        /* ── Sidebar sticky ── */
        .sidebar { position:sticky; top:100px; }
        @media (max-width:880px) { .sidebar { position:static; } }

        /* ── Checkbox custom ── */
        .check-row {
          display:flex; align-items:flex-start; gap:10px;
          font-size:13.5px; color:#475569; line-height:1.6;
          margin-bottom:12px; cursor:pointer;
        }
        .check-row input[type="checkbox"] {
          width:18px; height:18px; accent-color:#0073F4;
          flex-shrink:0; margin-top:2px; cursor:pointer;
        }

        /* ── Bouton submit ── */
        .submit-btn {
          width:100%; padding:16px 24px;
          background:linear-gradient(135deg,#0073F4,#000E91);
          border:none; border-radius:14px;
          color:#fff; font-family:inherit; font-size:15px;
          font-weight:700; cursor:pointer; letter-spacing:.3px;
          display:flex; align-items:center; justify-content:center; gap:10px;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 8px 24px rgba(0,115,244,.3);
        }
        .submit-btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); box-shadow:0 12px 32px rgba(0,115,244,.4); }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:.55; cursor:not-allowed; box-shadow:none; }

        /* ── iOS font-size ≥16px ── */
        @media (max-width:768px) {
          input,select,textarea { font-size:16px !important; }
        }

        /* ── Step indicator ── */
        .step-dot {
          width:8px; height:8px; border-radius:50%;
          transition:all .3s;
        }
      `}</style>

      {/* ── SECTION PRINCIPALE ── */}
      <section style={{
        padding: 'clamp(64px,10vw,120px) 0',
        background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
      }}>

        {/* Décors de fond */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(circle at 10% 15%, rgba(0,115,244,.08) 0%, transparent 50%), radial-gradient(circle at 90% 85%, rgba(0,14,145,.06) 0%, transparent 50%)' }} />
        <div style={{ position:'absolute', top:-100, right:-100, width:320, height:320, borderRadius:'50%', border:'50px solid rgba(0,115,244,.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:240, height:240, borderRadius:'50%', border:'40px solid rgba(0,14,145,.04)', pointerEvents:'none' }} />

        {/* ── WRAPPER ── */}
        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto', padding:'0 clamp(16px,5vw,48px)', minWidth:0 }}>

          {/* ── HEADER ── */}
          <div className="fade-up" style={{ textAlign:'center', marginBottom:'clamp(40px,6vw,72px)' }}>

            {/* Pill badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'#000E91', borderRadius:100,
              padding:'8px 22px', marginBottom:24,
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#0073F4', flexShrink:0, animation:'pulse 2s infinite' }} />
              <span style={{ color:'#fff', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase' }}>
                Rejoindre la COPAF 2026
              </span>
            </div>

            {/* Titre */}
            <h2 style={{
              fontSize:'clamp(24px,5vw,54px)',
              fontWeight:900, color:'#0f172a',
              marginBottom:16, lineHeight:1.1,
              letterSpacing:'-0.03em',
            }}>
              {etape === 1 ? (
                <>Choisissez votre{' '}
                  <span style={{ background:'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    participation
                  </span>
                </>
              ) : (
                <>Formulaire{' '}
                  <span style={{ background:'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    d'inscription
                  </span>
                </>
              )}
            </h2>

            {/* Sous-titre */}
            <p style={{ fontSize:'clamp(14px,2vw,17px)', color:'#64748b', maxWidth:500, margin:'0 auto', lineHeight:1.8, fontWeight:400 }}>
              {etape === 1
                ? 'Sélectionnez la catégorie correspondant à votre profil.'
                : 'Remplissez le formulaire. Paiement sécurisé par virement bancaire.'}
            </p>

            {/* Indicateur d'étapes */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:20 }}>
              {[1, 2].map(s => (
                <div key={s} className="step-dot" style={{
                  width: etape === s ? 24 : 8,
                  background: etape === s ? '#0073F4' : '#cbd5e1',
                  borderRadius: etape === s ? 4 : '50%',
                }} />
              ))}
            </div>

            {/* Retour étape 1 */}
            {etape === 2 && !submitted && (
              <button
                onClick={() => setEtape(1)}
                style={{
                  background:'none', border:'1.5px solid #e2e8f0', cursor:'pointer',
                  display:'inline-flex', alignItems:'center', gap:6,
                  color:'#475569', fontSize:13, fontWeight:600,
                  padding:'8px 18px', borderRadius:100, marginTop:16,
                  fontFamily:'inherit', transition:'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#0073F4'; e.currentTarget.style.color='#0073F4' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#475569' }}
              >
                ← Changer de catégorie
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════
              ÉTAPE 1 — SÉLECTION DU TYPE
          ══════════════════════════════════════════════ */}
          {etape === 1 && (
            <div className="cards-grid">
              {TYPES.map((type, idx) => (
                <div
                  key={type.id}
                  className={`type-card fade-up-${idx + 1}${idx === 2 ? ' card-last' : ''}`}
                  onClick={() => handleTypeSelect(type)}
                >
                  {/* Barre colorée top */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${type.color},${type.color}99)`, borderRadius:'18px 18px 0 0' }} />

                  {/* Badge redirect */}
                  {type.redirect && (
                    <div style={{
                      position:'absolute', top:16, right:16,
                      background:type.bg, border:`1px solid ${type.color}30`,
                      borderRadius:100, padding:'3px 10px',
                      fontSize:10, color:type.color, fontWeight:700,
                    }}>
                      Page dédiée ↗
                    </div>
                  )}

                  {/* Icône emoji */}
                  <div style={{
                    width:52, height:52, borderRadius:15,
                    background:type.bg, display:'flex',
                    alignItems:'center', justifyContent:'center',
                    fontSize:24, marginBottom:18, marginTop:8,
                  }}>
                    {type.emoji}
                  </div>

                  {/* Titre */}
                  <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:4 }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:type.color, marginBottom:14 }}>
                    {type.sublabel}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.7, marginBottom:20 }}>
                    {type.desc}
                  </p>

                  {/* Prix */}
                  <div style={{
                    background:type.bg, borderRadius:12,
                    padding:'12px 16px', marginBottom:18,
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    <span style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>{type.prix}</span>
                    <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{type.tag}</span>
                  </div>

                  {/* CTA */}
                  <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'13px 18px',
                    background:`linear-gradient(135deg,${type.color},${type.color}cc)`,
                    borderRadius:12, color:'#fff', fontSize:13, fontWeight:700,
                  }}>
                    <span>{type.cta}</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              ÉTAPE 2 — FORMULAIRE + SIDEBAR
          ══════════════════════════════════════════════ */}
          {etape === 2 && (
            <div className="form-layout scale-in">

              {/* ── FORMULAIRE ── */}
              <div style={{
                background:'#fff',
                border:'1.5px solid #e2e8f0',
                borderRadius:24,
                padding:'clamp(20px,5vw,44px)',
                boxShadow:'0 8px 40px rgba(0,14,145,.07)',
                minWidth:0,
              }}>

                {/* ── ÉCRAN SUCCÈS ── */}
                {submitted ? (
                  <div className="scale-in" style={{ textAlign:'center', padding:'12px 0' }}>
                    {/* Checkmark animé */}
                    <div style={{
                      width:80, height:80, borderRadius:'50%',
                      background:'linear-gradient(135deg,#0073F4,#000E91)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      margin:'0 auto 24px',
                      boxShadow:'0 12px 40px rgba(0,115,244,.35)',
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>

                    <h3 style={{ fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:'#0f172a', marginBottom:8 }}>
                      {paiementMode === 'maintenant' ? 'Inscription confirmée !' : 'Place réservée !'}
                    </h3>
                    <p style={{ fontSize:14, color:'#64748b', marginBottom:24, lineHeight:1.8 }}>
                      Merci <strong style={{ color:'#0f172a' }}>{form.prenom} {form.nom}</strong>.<br/>
                      {paiementMode === 'maintenant'
                        ? <>Instructions de virement envoyées à <strong style={{ color:'#0073F4' }}>{form.email}</strong> sous 24h.</>
                        : <>Place réservée. Réglez avant le <strong style={{ color:'#0073F4' }}>1er août 2026</strong>.</>
                      }
                    </p>

                    {/* Numéro dossier */}
                    <div style={{
                      background:'linear-gradient(135deg,#000E91,#0073F4)',
                      borderRadius:16, padding:'20px 32px',
                      display:'inline-block', marginBottom:24,
                      boxShadow:'0 10px 32px rgba(0,14,145,.25)',
                    }}>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.55)', letterSpacing:2.5, textTransform:'uppercase', marginBottom:8 }}>
                        Numéro de dossier
                      </div>
                      <div style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:900, color:'#fff', letterSpacing:2 }}>
                        {dossierNum}
                      </div>
                    </div>

                    {/* Récap */}
                    <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:16, padding:'18px 20px', marginBottom:24, textAlign:'left' }}>
                      <div style={{ fontSize:10, color:'#0073F4', fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', marginBottom:14 }}>Récapitulatif</div>
                      {[
                        { l:'Participants', v: form.participants },
                        { l:'Tarif unitaire', v: `${PRIX_UNITAIRE.toLocaleString('fr-FR')} €` },
                      ].map((r,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'#64748b', paddingBottom:8, borderBottom:'1px solid #f1f5f9', marginBottom:8, gap:8 }}>
                          <span>{r.l}</span><strong style={{ color:'#0f172a' }}>{r.v}</strong>
                        </div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:900, color:'#0f172a', marginTop:4 }}>
                        <span>Total</span>
                        <span>{total.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>

                    {/* Étapes suivantes */}
                    {(paiementMode === 'maintenant' ? [
                      'Email de confirmation envoyé',
                      'Instructions de virement reçues sous 24h',
                      'Règlement sous 7 jours ouvrés',
                      'Badge & accès participant après paiement',
                    ] : [
                      'Email de confirmation de réservation envoyé',
                      'Rappel de paiement à J+3, J+7',
                      'Instructions de virement sur demande',
                      'Badge & accès participant après paiement',
                    ]).map((step, i, arr) => (
                      <div key={i} style={{
                        display:'flex', gap:10, alignItems:'flex-start',
                        padding:'9px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                        fontSize:13.5, color:'#475569',
                      }}>
                        <span style={{ color:'#0073F4', flexShrink:0, marginTop:1, fontSize:16 }}>✓</span>
                        {step}
                      </div>
                    ))}

                    {paiementMode === 'plus_tard' && (
                      <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'13px 16px', marginTop:20, fontSize:13, color:'#92400e', lineHeight:1.65 }}>
                        ⚠️ Place réservée mais <strong>non confirmée</strong> jusqu'au paiement. Sans règlement avant le 1er août 2026, votre réservation sera annulée.
                      </div>
                    )}
                  </div>

                ) : (
                  /* ── FORMULAIRE ── */
                  <form onSubmit={handleSubmit} noValidate style={{ minWidth:0 }}>
                    <h3 style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginBottom:28, textAlign:'center' }}>
                      Vos informations
                    </h3>

                    {/* Nom / Prénom */}
                    <div className="field-row">
                      {[
                        { name:'nom',    label:'Nom *',    placeholder:'Votre nom' },
                        { name:'prenom', label:'Prénom *', placeholder:'Votre prénom' },
                      ].map(f => (
                        <div key={f.name}>
                          <label style={labelStyle}>{f.label}</label>
                          <input
                            name={f.name} type="text" required
                            value={form[f.name]} onChange={handleChange}
                            placeholder={f.placeholder} style={inputStyle(f.name)}
                            onFocus={() => setFocused(f.name)}
                            onBlur={() => setFocused('')}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Email / Téléphone */}
                    <div className="field-row">
                      {[
                        { name:'email',     label:'Email *',      placeholder:'votre@email.com',   type:'email' },
                        { name:'telephone', label:'Téléphone *',  placeholder:'+229 01 XX XX XX',  type:'tel'   },
                      ].map(f => (
                        <div key={f.name}>
                          <label style={labelStyle}>{f.label}</label>
                          <input
                            name={f.name} type={f.type || 'text'} required
                            value={form[f.name]} onChange={handleChange}
                            placeholder={f.placeholder} style={inputStyle(f.name)}
                            onFocus={() => setFocused(f.name)}
                            onBlur={() => setFocused('')}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Organisation / Poste */}
                    <div className="field-row">
                      {[
                        { name:'organisation', label:'Organisation *', placeholder:'Port / Entreprise' },
                        { name:'poste',        label:'Poste *',        placeholder:'Votre fonction'    },
                      ].map(f => (
                        <div key={f.name}>
                          <label style={labelStyle}>{f.label}</label>
                          <input
                            name={f.name} type="text" required
                            value={form[f.name]} onChange={handleChange}
                            placeholder={f.placeholder} style={inputStyle(f.name)}
                            onFocus={() => setFocused(f.name)}
                            onBlur={() => setFocused('')}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Pays / Participants */}
                    <div className="field-row">
                      <div>
                        <label style={labelStyle}>Pays *</label>
                        <select
                          name="pays" required value={form.pays} onChange={handleChange}
                          style={{ ...inputStyle('pays'), cursor:'pointer', color: form.pays ? '#0f172a' : '#94a3b8' }}
                          onFocus={() => setFocused('pays')} onBlur={() => setFocused('')}
                        >
                          <option value="" disabled>Sélectionnez votre pays</option>
                          {PAYS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Nombre de participants</label>
                        <select
                          name="participants" value={form.participants} onChange={handleChange}
                          style={{ ...inputStyle('participants'), cursor:'pointer' }}
                          onFocus={() => setFocused('participants')} onBlur={() => setFocused('')}
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n}>
                              {n} participant{n > 1 ? 's' : ''} — {(n * PRIX_UNITAIRE).toLocaleString('fr-FR')} €
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom:22 }}>
                      <label style={labelStyle}>Message / Besoins spécifiques</label>
                      <textarea
                        name="message" rows={3} value={form.message} onChange={handleChange}
                        placeholder="Questions, besoins alimentaires, accessibilité..."
                        style={{ ...inputStyle('message'), resize:'vertical', minHeight:80 }}
                        onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                      />
                    </div>

                    {/* Mode de paiement */}
                    <div style={{ marginBottom:22 }}>
                      <label style={labelStyle}>Mode de paiement *</label>
                      <div className="pay-grid">
                        {[
                          { value:'maintenant', icon:'💳', title:'Payer maintenant', desc:'Virement sous 7 jours ouvrés' },
                          { value:'plus_tard',  icon:'📅', title:'Réserver ma place', desc:'Paiement avant le 1er août 2026' },
                        ].map(opt => {
                          const active = paiementMode === opt.value
                          return (
                            <button
                              key={opt.value} type="button"
                              onClick={() => setPaiementMode(opt.value)}
                              style={{
                                background: active ? '#EBF3FF' : '#f8fafc',
                                border: `2px solid ${active ? '#0073F4' : '#e2e8f0'}`,
                                borderRadius:14, padding:'14px 16px',
                                cursor:'pointer', textAlign:'left',
                                fontFamily:'inherit', transition:'all .2s',
                                display:'flex', flexDirection:'column', gap:5,
                                minHeight:70,
                              }}
                            >
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <span style={{ fontSize:18 }}>{opt.icon}</span>
                                <span style={{ fontSize:13, fontWeight:700, color: active ? '#000E91' : '#334155' }}>
                                  {opt.title}
                                </span>
                              </div>
                              <span style={{ fontSize:11.5, color:'#64748b', lineHeight:1.4 }}>{opt.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div style={{ marginBottom:24 }}>
                      <label className="check-row">
                        <input type="checkbox" checked={cgv} onChange={e => setCgv(e.target.checked)} required />
                        <span>
                          J'accepte les{' '}
                          <a href="/cgv" style={{ color:'#0073F4', fontWeight:600 }}>conditions générales de vente</a>{' '}
                          et les modalités d'inscription.
                        </span>
                      </label>
                      <label className="check-row">
                        <input type="checkbox" checked={rgpd} onChange={e => setRgpd(e.target.checked)} required />
                        <span>
                          J'accepte le traitement de mes données selon la{' '}
                          <a href="/confidentialite" style={{ color:'#0073F4', fontWeight:600 }}>politique de confidentialité</a>.
                        </span>
                      </label>
                    </div>

                    {/* Erreur */}
                    {errorMsg && (
                      <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#dc2626', marginBottom:18, lineHeight:1.5 }}>
                        ⚠️ {errorMsg}
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit" className="submit-btn" disabled={loading || !cgv || !rgpd}>
                      {loading ? (
                        <><div className="spinner" /> Envoi en cours…</>
                      ) : (
                        <>{paiementMode === 'maintenant' ? 'Confirmer mon inscription' : 'Réserver ma place'} →</>
                      )}
                    </button>

                    <p style={{ textAlign:'center', fontSize:12, color:'#94a3b8', marginTop:14, lineHeight:1.6 }}>
                      🔒 Paiement 100% sécurisé par virement bancaire.<br/>
                      Aucune carte bancaire requise à cette étape.
                    </p>
                  </form>
                )}
              </div>

              {/* ── SIDEBAR ── */}
              <div className="sidebar" style={{ minWidth:0, display:'flex', flexDirection:'column', gap:16 }}>

                {/* Récap tarif */}
                <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:20, padding:'24px 20px', boxShadow:'0 4px 20px rgba(0,14,145,.06)' }}>
                  <div style={{ fontSize:10, color:'#0073F4', fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', marginBottom:16 }}>
                    Récapitulatif
                  </div>
                  {[
                    { l:'Participants', v: nb },
                    { l:'Tarif unitaire', v: `${PRIX_UNITAIRE.toLocaleString('fr-FR')} €` },
                  ].map((r,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14, color:'#64748b', padding:'10px 0', borderBottom:'1px solid #f1f5f9', gap:8 }}>
                      <span>{r.l}</span><strong style={{ color:'#0f172a' }}>{r.v}</strong>
                    </div>
                  ))}
                  <div style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    marginTop:14, padding:'14px 16px',
                    background:'linear-gradient(135deg,#000E91,#0073F4)',
                    borderRadius:12,
                  }}>
                    <span style={{ color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:600 }}>Total</span>
                    <span style={{ fontSize:22, fontWeight:900, color:'#fff' }}>
                      {total.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>

                {/* Infos virement */}
                <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:20, padding:'22px 20px', boxShadow:'0 4px 20px rgba(0,14,145,.06)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    <span style={{ fontSize:20 }}>🏦</span>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Paiement par virement</div>
                  </div>
                  {[
                    { l:'Banque',    v:'SGBÉ Bénin' },
                    { l:'IBAN',      v:'BJ66 BJ083 01001 00050273980 97' },
                    { l:'BIC',       v:'SGBEBJ BX' },
                    { l:'Titulaire', v:'COPAF 2026' },
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, padding:'8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                      <span style={{ fontSize:12, color:'#94a3b8', fontWeight:600, flexShrink:0 }}>{item.l}</span>
                      <span style={{ fontSize:12, color:'#0f172a', fontWeight:700, textAlign:'right', wordBreak:'break-all' }}>{item.v}</span>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                <div style={{ background:'#EBF3FF', border:'1.5px solid #bfdbfe', borderRadius:20, padding:'20px' }}>
                  <div style={{ fontSize:10, color:'#000E91', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>
                    Besoin d'aide ?
                  </div>
                  {[
                    { icon:'📞', text:'+229 01 97 67 22 00' },
                    { icon:'✉️', text:'inscriptions@copaf-ports.com' },
                    { icon:'🌐', text:'www.copaf-ports.com' },
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#1e40af', fontWeight:500, marginBottom: i < 2 ? 10 : 0 }}>
                      <span style={{ flexShrink:0, fontSize:14 }}>{item.icon}</span>
                      <span style={{ wordBreak:'break-word', overflowWrap:'break-word' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}