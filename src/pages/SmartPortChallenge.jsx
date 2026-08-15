import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'
import { PORTS, PORTS_AUTRE, findPortByValue } from '../utils/portsData'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const TR = {
  fr: {
    identTitle: 'COPAF Smart Port Challenge',
    identSubtitle: 'Avant de commencer, dites-nous qui vous êtes',
    prenom: 'Prénom', prenomP: 'Votre prénom',
    nom: 'Nom', nomP: 'Votre nom',
    email: 'Email', emailP: 'votre@email.com',
    port: 'Votre port / organisation',
    portPlaceholder: 'Sélectionnez votre port',
    portAutreLabel: 'Précisez',
    portAutreP: 'Nom de votre port / organisation',
    autreOption: PORTS_AUTRE.label.fr,
    erreurForm: 'Merci de renseigner tous les champs.',
    commencer: 'Commencer',
    bonjour: (prenom, port) => `Bonjour ${prenom}${port ? ' - ' + port : ''}`,
    alerte: 'ALERTE : MSC AFRICA — 1200 EVP arrive. Pénalité : 15 000$/h de retard',
    quaiLabel: 'Quai',
    quaiOptions: ['Quai 1 - 90% occupé', 'Quai 2 - 75% occupé', 'Quai 3 - 40% occupé'],
    gruesLabel: 'Grues',
    gruesOptions: ['2 Grues', '3 Grues', '4 Grues'],
    digitalLabel: 'Digital',
    digitalOff: 'OFF',
    digitalOn: 'ON - IA Activée',
    copilotTitre: 'Copilote IA',
    copilotTexte: 'Recommandation : Quai 3 + 4 Grues + Digital ON. Gain estimé : -39%',
    lancer: 'Lancer les opérations',
    lancement: 'Lancement...',
    erreurLancement: 'Une erreur est survenue, réessayez.',
    simTitre: 'Déchargement en cours...',
    resultTitre: 'Rapport de Performance',
    kpiTemps: 'Temps', kpiCout: 'Coût', kpiScore: 'Score',
    sansDigital: v => `Sans Digital : ${v}`,
    gain: (argent, temps) => `Vous avez gagné ${argent.toLocaleString('fr-FR')}$ et ${temps}h vs une gestion manuelle`,
    rejouer: 'Rejouer',
    liveTitre: 'CLASSEMENT COPAF 2026 LIVE',
    liveEnAttente: 'En attente des premiers scores...',
    pts: 'pts',
  },
  en: {
    identTitle: 'COPAF Smart Port Challenge',
    identSubtitle: 'Before you start, tell us who you are',
    prenom: 'First name', prenomP: 'Your first name',
    nom: 'Last name', nomP: 'Your last name',
    email: 'Email', emailP: 'your@email.com',
    port: 'Your port / organisation',
    portPlaceholder: 'Select your port',
    portAutreLabel: 'Please specify',
    portAutreP: 'Name of your port / organisation',
    autreOption: PORTS_AUTRE.label.en,
    erreurForm: 'Please fill in all fields.',
    commencer: 'Start',
    bonjour: (prenom, port) => `Hello ${prenom}${port ? ' - ' + port : ''}`,
    alerte: 'ALERT: MSC AFRICA — 1200 TEU inbound. Penalty: $15,000/h delay',
    quaiLabel: 'Berth',
    quaiOptions: ['Berth 1 - 90% occupied', 'Berth 2 - 75% occupied', 'Berth 3 - 40% occupied'],
    gruesLabel: 'Cranes',
    gruesOptions: ['2 Cranes', '3 Cranes', '4 Cranes'],
    digitalLabel: 'Digital',
    digitalOff: 'OFF',
    digitalOn: 'ON - AI Enabled',
    copilotTitre: 'AI Copilot',
    copilotTexte: 'Recommendation: Berth 3 + 4 Cranes + Digital ON. Estimated gain: -39%',
    lancer: 'Start operations',
    lancement: 'Starting...',
    erreurLancement: 'Something went wrong, please try again.',
    simTitre: 'Unloading in progress...',
    resultTitre: 'Performance Report',
    kpiTemps: 'Time', kpiCout: 'Cost', kpiScore: 'Score',
    sansDigital: v => `Without Digital: ${v}`,
    gain: (argent, temps) => `You saved $${argent.toLocaleString('en-US')} and ${temps}h vs manual management`,
    rejouer: 'Play again',
    liveTitre: 'COPAF 2026 LIVE LEADERBOARD',
    liveEnAttente: 'Waiting for the first scores...',
    pts: 'pts',
  },
}

const Ico = ({ name, size = 24, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    globe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    ship: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20" /><path d="M4 20l1.5-6h13L20 20" /><path d="M8 14V6h8v8" /><path d="M12 2v4" /></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    dollar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    target: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    replay: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>,
    alert: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    ai: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 7.54 16.63" /><path d="M12 12v9" /><path d="M12 2a10 10 0 0 0-7.54 16.63" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>,
  }
  return icons[name] || null
}

// ─── Fond decoratif "vue du ciel" du port (ecran 1 : statique / ecran 2 : anime) ──
function VuePort({ simulating, quai, grues }) {
  const laneX = { 'quai-1': 20, 'quai-2': 50, 'quai-3': 80 }
  const boatX = simulating ? laneX[quai] : 50
  const boatY = simulating ? 78 : 12
  const nbGrues = simulating ? grues : 3
  const gruePositions = simulating
    ? Array.from({ length: nbGrues }, (_, i) => laneX[quai] + (i - (nbGrues - 1) / 2) * 8)
    : [25, 50, 75]

  return (
    <div style={{
      position: 'relative', width: '100%', height: 220, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(180deg, #0a2a5e 0%, #0e3d7a 55%, #0b2f52 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      {/* Quais */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '22%', background: 'linear-gradient(180deg, #334155, #1e293b)' }} />
      {['quai-1', 'quai-2', 'quai-3'].map(q => (
        <div key={q} style={{
          position: 'absolute', bottom: '20%', left: `${laneX[q]}%`, transform: 'translateX(-50%)',
          width: 2, height: 6, background: 'rgba(255,255,255,0.3)',
        }} />
      ))}

      {/* Grues */}
      {gruePositions.map((x, i) => (
        <div key={i} className="spc-grue" style={{
          position: 'absolute', bottom: '20%', left: `${x}%`, transform: 'translateX(-50%)',
          transformOrigin: 'bottom center', transition: 'left 0.6s ease',
        }}>
          <svg width="34" height="70" viewBox="0 0 34 70" fill="none">
            <line x1="17" y1="70" x2="17" y2="10" stroke="#e2e8f0" strokeWidth="3" />
            <g className={simulating ? 'spc-grue-bras-anim' : ''} style={{ transformOrigin: '17px 10px' }}>
              <line x1="17" y1="10" x2="32" y2="16" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
              <line x1="17" y1="10" x2="4" y2="16" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      ))}

      {/* Bateau */}
      <div style={{
        position: 'absolute', left: `${boatX}%`, top: `${boatY}%`,
        transform: 'translate(-50%, -50%)',
        transition: simulating ? 'left 4.5s ease-in-out, top 4.5s ease-in-out' : 'none',
      }}>
        <Ico name="ship" size={40} color="#fff" />
      </div>

      <style>{`
        @keyframes spcGrueBras { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-12deg); } }
        .spc-grue-bras-anim { animation: spcGrueBras 1.1s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

// ─── Ecran 4 : classement projete, mis a jour en direct ─────────────────────
function ClassementLive() {
  const [top10, setTop10] = useState([])
  const [loaded, setLoaded] = useState(false)

  const charger = useCallback(async () => {
    const { data } = await supabase.rpc('get_smart_port_challenge_top10')
    if (data) setTop10(data)
    setLoaded(true)
  }, [])

  useEffect(() => {
    charger()
    const channel = supabase
      .channel('smart-port-challenge-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'copaf_demo_scores' }, charger)
      .subscribe()
    const interval = setInterval(charger, 5000)
    return () => { supabase.removeChannel(channel); clearInterval(interval) }
  }, [charger])

  return (
    <div style={{
      minHeight: '100vh', background: `linear-gradient(135deg,${NAVY},#000733)`,
      fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '56px 64px',
      display: 'flex', flexDirection: 'column', color: '#fff',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.4)', borderRadius: 30, fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#60a5fa', marginBottom: 20 }}>
          COPAF Smart Port Challenge
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, margin: 0 }}>CLASSEMENT COPAF 2026 LIVE</h1>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loaded && top10.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.6, fontSize: 18, padding: 40 }}>En attente des premiers scores...</div>
        )}
        {top10.map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 20, padding: '18px 28px', borderRadius: 16,
            background: i < 3 ? 'linear-gradient(135deg, rgba(0,115,244,0.25), rgba(0,14,145,0.4))' : 'rgba(15,23,42,0.6)',
            border: i < 3 ? '1px solid rgba(0,115,244,0.4)' : '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ width: 40, fontSize: 22, fontWeight: 900, color: i < 3 ? '#60a5fa' : '#94a3b8' }}>{i + 1}</div>
            <div style={{ flex: 1, fontSize: 19, fontWeight: 700 }}>{row.nom}</div>
            <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>{row.port}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{row.score} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>pts</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Ecrans 0 a 3 : identification, setup, simulation, resultat ─────────────
function Challenge() {
  const [lang, setLang] = useState('fr')
  const t = TR[lang]

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', portValue: '', portAutre: '' })
  const [erreurForm, setErreurForm] = useState('')

  const [choix, setChoix] = useState({ quai: 'quai-2', grues: 2, digital: false })
  const [lancement, setLancement] = useState(false)
  const [erreurLancement, setErreurLancement] = useState('')
  const [resultat, setResultat] = useState(null)
  const [progress, setProgress] = useState(0)

  const portLabel = form.portValue === PORTS_AUTRE.value
    ? form.portAutre
    : (findPortByValue(form.portValue)?.label[lang] || '')

  const validerIdentification = e => {
    e.preventDefault()
    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim() || !form.portValue || (form.portValue === PORTS_AUTRE.value && !form.portAutre.trim())) {
      setErreurForm(t.erreurForm)
      return
    }
    setErreurForm('')
    setStep(1)
  }

  const lancerOperations = async () => {
    setLancement(true)
    setErreurLancement('')
    try {
      const { data, error } = await supabase.functions.invoke('smart-port-challenge-score', {
        body: {
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim(),
          port: portLabel,
          quai: choix.quai,
          grues: choix.grues,
          digital: choix.digital,
        },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setResultat(data)
      setStep(2)
    } catch (err) {
      console.error(err)
      setErreurLancement(t.erreurLancement)
    } finally {
      setLancement(false)
    }
  }

  // Ecran 2 : animation proportionnelle au temps calcule par le moteur.
  const timeoutRef = useRef(null)
  useEffect(() => {
    if (step !== 2 || !resultat) return
    const duree = Math.min(10000, Math.max(5000, Math.round(5000 + ((resultat.tempsFinal - 4) / 6) * 5000)))
    setProgress(0)
    const raf = requestAnimationFrame(() => setProgress(100))
    timeoutRef.current = setTimeout(() => setStep(3), duree)
    return () => { clearTimeout(timeoutRef.current); cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, resultat])

  const dureeMs = resultat ? Math.min(10000, Math.max(5000, Math.round(5000 + ((resultat.tempsFinal - 4) / 6) * 5000))) : 7000

  const rejouer = () => {
    setResultat(null)
    setProgress(0)
    setChoix({ quai: 'quai-2', grues: 2, digital: false })
    setStep(1)
  }

  // ─── Styles partages (memes conventions que DiagnosticSmartPort.jsx) ──────
  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f8fafc' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -2, backgroundColor: '#0b0f1c', backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.7) saturate(1.2)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.55) 0%, rgba(9,13,22,0.78) 70%)' }
  const Fond = () => <><div style={bgImage} /><div style={bgOverlay} /></>
  const BoutonLang = () => (
    <button onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')} type="button" style={{
      position: 'fixed', top: 18, right: 18, zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '9px 16px', borderRadius: 20, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: 12.5, fontWeight: 700,
      cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      <Ico name="globe" size={14} color="#60a5fa" />
      {lang === 'fr' ? 'FR · English' : 'EN · Français'}
    </button>
  )
  const card = { width: '100%', maxWidth: 680 }
  const inputStyle = { width: '100%', padding: '14px 18px', fontSize: 14.5, fontFamily: 'inherit', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }
  const btnPrimary = { padding: '16px 32px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 10px 30px rgba(0,115,244,0.35)' }

  // ─── Ecran 0 : identification ──────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={wrap}>
        <Fond /><RetourMenu /><BoutonLang />
        <form onSubmit={validerIdentification} style={{ ...card, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h1 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 900, margin: '0 0 8px' }}>{t.identTitle}</h1>
            <p style={{ color: '#94a3b8', fontSize: 14.5, margin: 0 }}>{t.identSubtitle}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>{t.prenom}</label>
              <input style={inputStyle} placeholder={t.prenomP} value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>{t.nom}</label>
              <input style={inputStyle} placeholder={t.nomP} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t.email}</label>
            <input type="email" style={inputStyle} placeholder={t.emailP} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>{t.port}</label>
            <select style={inputStyle} value={form.portValue} onChange={e => setForm(f => ({ ...f, portValue: e.target.value }))}>
              <option value="">{t.portPlaceholder}</option>
              {[...new Set(PORTS.map(p => p.country))].map(country => (
                <optgroup key={country} label={country}>
                  {PORTS.filter(p => p.country === country).map(p => (
                    <option key={p.value} value={p.value}>{p.label[lang]}</option>
                  ))}
                </optgroup>
              ))}
              <option value={PORTS_AUTRE.value}>{t.autreOption}</option>
            </select>
          </div>

          {form.portValue === PORTS_AUTRE.value && (
            <div>
              <label style={labelStyle}>{t.portAutreLabel}</label>
              <input style={inputStyle} placeholder={t.portAutreP} value={form.portAutre} onChange={e => setForm(f => ({ ...f, portAutre: e.target.value }))} />
            </div>
          )}

          {erreurForm && <div style={{ color: '#f87171', fontSize: 13.5, fontWeight: 600 }}>{erreurForm}</div>}

          <button type="submit" style={{ ...btnPrimary, alignSelf: 'center', marginTop: 8 }}>{t.commencer}</button>
        </form>
      </div>
    )
  }

  // ─── Ecran 1 : setup / decision ────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={wrap}>
        <Fond /><RetourMenu /><BoutonLang />
        <div style={{ ...card, maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, margin: '0 0 6px' }}>{t.identTitle}</h1>
            <p style={{ color: '#94a3b8', fontSize: 14.5, margin: 0 }}>{t.bonjour(form.prenom, portLabel)}</p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 14,
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5',
          }}>
            <Ico name="alert" size={20} color="#f87171" />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>{t.alerte}</span>
          </div>

          <VuePort simulating={false} quai={choix.quai} grues={choix.grues} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <label style={labelStyle}>{t.quaiLabel}</label>
              <select style={inputStyle} value={choix.quai} onChange={e => setChoix(c => ({ ...c, quai: e.target.value }))}>
                <option value="quai-1">{t.quaiOptions[0]}</option>
                <option value="quai-2">{t.quaiOptions[1]}</option>
                <option value="quai-3">{t.quaiOptions[2]}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.gruesLabel}</label>
              <select style={inputStyle} value={choix.grues} onChange={e => setChoix(c => ({ ...c, grues: Number(e.target.value) }))}>
                <option value={2}>{t.gruesOptions[0]}</option>
                <option value={3}>{t.gruesOptions[1]}</option>
                <option value={4}>{t.gruesOptions[2]}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.digitalLabel}</label>
              <button
                type="button"
                onClick={() => setChoix(c => ({ ...c, digital: !c.digital }))}
                style={{
                  width: '100%', padding: '14px 18px', borderRadius: 12, border: choix.digital ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  background: choix.digital ? 'rgba(16,185,129,0.15)' : 'rgba(15, 23, 42, 0.6)', color: choix.digital ? '#34d399' : '#cbd5e1',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {choix.digital ? t.digitalOn : t.digitalOff}
              </button>
            </div>
          </div>

          {choix.digital && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(0,115,244,0.18), rgba(0,14,145,0.28))', border: '1px solid rgba(0,115,244,0.35)',
            }}>
              <Ico name="ai" size={22} color="#60a5fa" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t.copilotTitre}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{t.copilotTexte}</div>
              </div>
            </div>
          )}

          {erreurLancement && <div style={{ color: '#f87171', fontSize: 13.5, fontWeight: 600, textAlign: 'center' }}>{erreurLancement}</div>}

          <button onClick={lancerOperations} disabled={lancement} style={{ ...btnPrimary, alignSelf: 'center', opacity: lancement ? 0.7 : 1 }}>
            {lancement ? t.lancement : t.lancer}
          </button>
        </div>
      </div>
    )
  }

  // ─── Ecran 2 : simulation ───────────────────────────────────────────────
  if (step === 2) {
    return (
      <div style={wrap}>
        <Fond /><RetourMenu /><BoutonLang />
        <div style={{ ...card, maxWidth: 780, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ textAlign: 'center', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, margin: 0 }}>{t.simTitre}</h1>
          <VuePort simulating quai={choix.quai} grues={choix.grues} />
          <div style={{ width: '100%', height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 10, background: 'linear-gradient(90deg,#0073F4,#34d399)',
              width: `${progress}%`, transition: `width ${dureeMs}ms linear`,
            }} />
          </div>
        </div>
      </div>
    )
  }

  // ─── Ecran 3 : resultat ─────────────────────────────────────────────────
  const gainArgent = resultat ? resultat.coutSansDigital - resultat.coutFinal : 0
  const gainTemps = resultat ? (resultat.tempsSansDigital - resultat.tempsFinal).toFixed(1) : 0

  return (
    <div style={wrap}>
      <Fond /><RetourMenu /><BoutonLang />
      <div style={{ ...card, maxWidth: 780, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 900, margin: 0, textAlign: 'center' }}>{t.resultTitre}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, width: '100%' }}>
          {[
            { icon: 'clock', label: t.kpiTemps, valeur: `${resultat?.tempsFinal.toFixed(1)}h`, avant: resultat ? `${resultat.tempsSansDigital.toFixed(1)}h` : '' },
            { icon: 'dollar', label: t.kpiCout, valeur: `${resultat?.coutFinal.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}$`, avant: resultat ? `${resultat.coutSansDigital.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}$` : '' },
            { icon: 'target', label: t.kpiScore, valeur: `${resultat?.score} / 100`, avant: null },
          ].map(k => (
            <div key={k.label} style={{
              padding: '22px 20px', borderRadius: 16, background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center',
            }}>
              <Ico name={k.icon} size={22} color="#60a5fa" />
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '10px 0 4px' }}>{k.valeur}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{k.label}</div>
              {k.avant && <div style={{ fontSize: 12.5, color: '#64748b', textDecoration: 'line-through', marginTop: 6 }}>{t.sansDigital(k.avant)}</div>}
            </div>
          ))}
        </div>

        {resultat && (
          <div style={{
            padding: '16px 24px', borderRadius: 14, background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.35)', color: '#34d399', fontWeight: 700, fontSize: 14.5, textAlign: 'center',
          }}>
            {t.gain(gainArgent, gainTemps)}
          </div>
        )}

        <button onClick={rejouer} style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Ico name="replay" size={16} color="#fff" />
          {t.rejouer}
        </button>
      </div>
    </div>
  )
}

export default function SmartPortChallenge() {
  const [searchParams] = useSearchParams()
  if (searchParams.get('live') === '1') return <ClassementLive />
  return <Challenge />
}
