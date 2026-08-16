import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'
import { PORTS, PORTS_AUTRE, findPortByValue } from '../utils/portsData'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const LANE_X = { 'quai-1': 20, 'quai-2': 50, 'quai-3': 80 }
const CONTAINER_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#3b82f6', '#ec4899']

const TR = {
  fr: {
    brand: 'COPAF Smart Port Challenge',
    accrocheHook: 'En 3 minutes, prenez les commandes d’un port et voyez l’impact du digital sur sa performance.',
    accrocheTeaser: 'Jusqu’à -55% de temps de déchargement selon vos choix',
    accrocheCta: 'Découvrir le challenge',
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
    consigne: 'Touchez un quai pour le choisir',
    quaiOccupe: ['90% occupé', '75% occupé', '40% occupé'],
    gruesLabel: 'Grues',
    digitalLabel: 'Digital',
    digitalOff: 'OFF',
    digitalOn: 'IA activée',
    copilotTitre: 'Copilote IA',
    copilotTexte: 'Recommandation : Quai 3 + 4 Grues + Digital ON. Gain estimé : -39%',
    lancer: 'Lancer les opérations',
    lancement: 'Lancement...',
    erreurLancement: 'Une erreur est survenue, réessayez.',
    simTitre: 'Déchargement en cours...',
    tempsEcoule: 'Temps écoulé',
    coutCumule: 'Coût cumulé',
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
    brand: 'COPAF Smart Port Challenge',
    accrocheHook: 'In 3 minutes, take command of a port and see the impact of digital on its performance.',
    accrocheTeaser: 'Up to -55% unloading time depending on your choices',
    accrocheCta: 'Discover the challenge',
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
    consigne: 'Tap a berth to select it',
    quaiOccupe: ['90% occupied', '75% occupied', '40% occupied'],
    gruesLabel: 'Cranes',
    digitalLabel: 'Digital',
    digitalOff: 'OFF',
    digitalOn: 'AI enabled',
    copilotTitre: 'AI Copilot',
    copilotTexte: 'Recommendation: Berth 3 + 4 Cranes + Digital ON. Estimated gain: -39%',
    lancer: 'Start operations',
    lancement: 'Starting...',
    erreurLancement: 'Something went wrong, please try again.',
    simTitre: 'Unloading in progress...',
    tempsEcoule: 'Elapsed time',
    coutCumule: 'Running cost',
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
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    dollar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    target: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    replay: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>,
    alert: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    ai: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 7.54 16.63" /><path d="M12 12v9" /><path d="M12 2a10 10 0 0 0-7.54 16.63" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>,
    plus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    minus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  }
  return icons[name] || null
}

// ─── Grue avec fleche articulee et cable/crochet ─────────────────────────
function Grue({ actif, anime, delay = 0 }) {
  const couleur = actif ? '#e2e8f0' : 'rgba(226,232,240,0.35)'
  return (
    <svg width="38" height="76" viewBox="0 0 38 76" fill="none">
      <line x1="19" y1="76" x2="19" y2="12" stroke={couleur} strokeWidth="3.5" />
      <line x1="10" y1="76" x2="28" y2="76" stroke={couleur} strokeWidth="3.5" strokeLinecap="round" />
      <g className={anime ? 'spc-grue-bras' : ''} style={{ transformOrigin: '19px 12px', animationDelay: `${delay}s` }}>
        <line x1="19" y1="12" x2="35" y2="18" stroke={couleur} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="19" y1="12" x2="4" y2="18" stroke={couleur} strokeWidth="3.5" strokeLinecap="round" />
        {actif && <line x1="30" y1="18" x2="30" y2="30" stroke={couleur} strokeWidth="1.5" strokeDasharray="2 2" />}
      </g>
    </svg>
  )
}

// ─── Bateau : coque + conteneurs sur le pont ─────────────────────────────
function Bateau({ size = 1 }) {
  return (
    <svg width={64 * size} height={44 * size} viewBox="0 0 64 44" fill="none">
      <path d="M4 30h56l-6 10H10z" fill="#e2e8f0" />
      <rect x="10" y="14" width="10" height="10" rx="1" fill={CONTAINER_COLORS[0]} />
      <rect x="21" y="14" width="10" height="10" rx="1" fill={CONTAINER_COLORS[2]} />
      <rect x="32" y="14" width="10" height="10" rx="1" fill={CONTAINER_COLORS[4]} />
      <rect x="43" y="17" width="9" height="7" rx="1" fill="#94a3b8" />
      <rect x="46" y="8" width="7" height="9" rx="1" fill="#cbd5e1" />
    </svg>
  )
}

// ─── Pile de conteneurs decorative sur un quai ───────────────────────────
function PileConteneurs({ x, dim }) {
  return (
    <div style={{ position: 'absolute', bottom: '21%', left: `${x}%`, transform: 'translateX(-50%)', display: 'flex', gap: 2, opacity: dim ? 0.4 : 1 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 9, height: 9 + (i % 2) * 4, background: CONTAINER_COLORS[(i + Math.round(x)) % CONTAINER_COLORS.length], borderRadius: 1.5 }} />
      ))}
    </div>
  )
}

// ─── Scene principale du port : accroche (ambiance) / setup (interactif) / simulation (animee) ──
function PortScene({ mode, quai, grues, digital, onSelectQuai, onIncGrues, onDecGrues, onToggleDigital, t }) {
  const simulating = mode === 'simulation'
  const interactif = mode === 'setup'
  const boatX = simulating ? LANE_X[quai] : 50
  const boatY = simulating ? 76 : (mode === 'accroche' ? 18 : 10)

  return (
    <div style={{
      position: 'relative', width: '100%', height: mode === 'accroche' ? 320 : 240, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(180deg, #0a2a5e 0%, #0e3d7a 55%, #0b2f52 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      {/* Quai / dock */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '20%', background: 'linear-gradient(180deg, #334155, #1e293b)' }} />

      {/* Piles de conteneurs decoratives (une par quai, sauf sur la voie active en simulation) */}
      {mode !== 'accroche' && ['quai-1', 'quai-2', 'quai-3'].map(q => (
        (!simulating || q !== quai) && <PileConteneurs key={q} x={LANE_X[q] - 8} dim={interactif && q !== quai} />
      ))}

      {/* Grues : 1 par quai (setup, quai non selectionne) ou `grues` sur le quai actif */}
      {mode !== 'accroche' && ['quai-1', 'quai-2', 'quai-3'].map(q => {
        if (simulating && q !== quai) return null
        const actif = q === quai
        const nb = actif ? grues : 1
        return Array.from({ length: nb }, (_, i) => (
          <div key={`${q}-${i}`} style={{
            position: 'absolute', bottom: '19%', left: `${LANE_X[q] + (i - (nb - 1) / 2) * 9}%`, transform: 'translateX(-50%)',
            transition: 'left 0.5s ease',
          }}>
            <Grue actif={actif} anime={simulating && actif} delay={i * 0.15} />
          </div>
        ))
      })}

      {/* Zones tactiles de selection du quai (setup uniquement) */}
      {interactif && ['quai-1', 'quai-2', 'quai-3'].map((q, i) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelectQuai(q)}
          style={{
            position: 'absolute', bottom: 0, top: 0, left: `${i * (100 / 3)}%`, width: `${100 / 3}%`,
            background: q === quai ? 'rgba(0,115,244,0.16)' : 'transparent',
            border: 'none', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '0 0 4px',
          }}
        >
          {q === quai && <div style={{ position: 'absolute', inset: 4, borderRadius: 14, border: '2px solid rgba(0,115,244,0.6)', pointerEvents: 'none' }} />}
          <span style={{
            fontSize: 10.5, fontWeight: 800, color: q === quai ? '#93c5fd' : 'rgba(226,232,240,0.55)',
            background: 'rgba(10,17,40,0.55)', padding: '3px 8px', borderRadius: 20, marginBottom: 2,
          }}>
            {`Q${i + 1} · ${t.quaiOccupe[i]}`}
          </span>
        </button>
      ))}

      {/* Bateau */}
      <div style={{
        position: 'absolute', left: `${boatX}%`, top: `${boatY}%`,
        transform: 'translate(-50%, -50%)',
        transition: simulating ? 'left 2.2s ease-in-out, top 2.2s ease-in-out' : 'none',
        animation: mode === 'accroche' ? 'spcBoatBob 3.2s ease-in-out infinite' : 'none',
      }}>
        <Bateau size={mode === 'accroche' ? 1.3 : 1} />
      </div>

      {/* Conteneurs en mouvement pendant la simulation */}
      {simulating && Array.from({ length: grues }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${boatX}%`, top: `${boatY}%`, width: 10, height: 10, borderRadius: 2,
          background: CONTAINER_COLORS[i % CONTAINER_COLORS.length],
          animation: `spcConteneurFlow 1.6s ease-in ${i * 0.35}s infinite`,
        }} />
      ))}

      {/* Overlay "grille numerique" quand Digital = ON */}
      {digital && mode !== 'accroche' && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', animation: 'spcGridPulse 2.4s ease-in-out infinite' }}>
          <defs>
            <pattern id="spcGrid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#60a5fa" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spcGrid)" />
        </svg>
      )}

      {/* Consigne (setup) */}
      {interactif && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 11.5, fontWeight: 700, color: 'rgba(226,232,240,0.7)', background: 'rgba(10,17,40,0.5)', padding: '4px 12px', borderRadius: 20 }}>
          {t.consigne}
        </div>
      )}

      {/* Stepper Grues (setup) */}
      {interactif && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10,17,40,0.7)', backdropFilter: 'blur(6px)', borderRadius: 30, padding: '6px 8px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <button type="button" onClick={onDecGrues} disabled={grues <= 2} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: grues <= 2 ? 'default' : 'pointer', opacity: grues <= 2 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="minus" size={13} color="#fff" />
          </button>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: '#fff', minWidth: 60, textAlign: 'center' }}>{grues} {t.gruesLabel}</span>
          <button type="button" onClick={onIncGrues} disabled={grues >= 4} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: grues >= 4 ? 'default' : 'pointer', opacity: grues >= 4 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="plus" size={13} color="#fff" />
          </button>
        </div>
      )}

      {/* Toggle Digital (setup) */}
      {interactif && (
        <button type="button" onClick={onToggleDigital} style={{
          position: 'absolute', bottom: 10, right: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 30, cursor: 'pointer', fontWeight: 800, fontSize: 12,
          background: digital ? 'rgba(16,185,129,0.85)' : 'rgba(10,17,40,0.7)',
          border: digital ? '1px solid rgba(52,211,153,0.6)' : '1px solid rgba(255,255,255,0.15)',
          color: '#fff', backdropFilter: 'blur(6px)',
        }}>
          <Ico name="ai" size={14} color="#fff" />
          {digital ? t.digitalOn : t.digitalLabel + ' ' + t.digitalOff}
        </button>
      )}

      <style>{`
        @keyframes spcGrueBras { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-12deg); } }
        .spc-grue-bras { animation: spcGrueBras 1.1s ease-in-out infinite; }
        @keyframes spcBoatBob { 0%, 100% { margin-top: 0px; } 50% { margin-top: -8px; } }
        @keyframes spcGridPulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.5; } }
        @keyframes spcConteneurFlow {
          0% { transform: translate(-50%, -50%) translateY(0); opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(-50%, -50%) translateY(120px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Ecran de classement projete, mis a jour en direct ─────────────────────
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

// ─── Ecrans : accroche, identification, setup, simulation, resultat ────────
function Challenge() {
  const [lang, setLang] = useState('fr')
  const t = TR[lang]

  // 0 accroche, 1 identification, 2 setup, 3 simulation, 4 resultat
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', portValue: '', portAutre: '' })
  const [erreurForm, setErreurForm] = useState('')

  const [choix, setChoix] = useState({ quai: 'quai-2', grues: 2, digital: false })
  const [lancement, setLancement] = useState(false)
  const [erreurLancement, setErreurLancement] = useState('')
  const [resultat, setResultat] = useState(null)
  const [simProgress, setSimProgress] = useState(0)

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
    setStep(2)
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
      setStep(3)
    } catch (err) {
      console.error(err)
      setErreurLancement(t.erreurLancement)
    } finally {
      setLancement(false)
    }
  }

  const dureeMs = resultat ? Math.min(10000, Math.max(5000, Math.round(5000 + ((resultat.tempsFinal - 4) / 6) * 5000))) : 7000

  // Ecran 3 : compteurs en direct (temps/cout) pilotes par requestAnimationFrame,
  // pour donner l'impression de regarder l'operation se derouler en temps reel
  // plutot qu'une simple barre de progression statique.
  const rafRef = useRef(null)
  useEffect(() => {
    if (step !== 3 || !resultat) return
    let start = null
    const tick = ts => {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / dureeMs)
      setSimProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setStep(4), 400)
      }
    }
    setSimProgress(0)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, resultat])

  const rejouer = () => {
    setResultat(null)
    setSimProgress(0)
    setChoix({ quai: 'quai-2', grues: 2, digital: false })
    setStep(2)
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

  // ─── Ecran 0 : accroche ─────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={wrap}>
        <Fond /><RetourMenu /><BoutonLang />
        <div style={{ ...card, maxWidth: 720, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.4)', borderRadius: 30, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#60a5fa', marginBottom: 18 }}>
              {t.brand}
            </div>
            <h1 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.25 }}>{t.accrocheHook}</h1>
          </div>

          <PortScene mode="accroche" quai={choix.quai} grues={choix.grues} digital={false} t={t} />

          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#34d399' }}>{t.accrocheTeaser}</div>

          <button onClick={() => setStep(1)} style={{ ...btnPrimary, alignSelf: 'center' }}>{t.accrocheCta}</button>
        </div>
      </div>
    )
  }

  // ─── Ecran 1 : identification ──────────────────────────────────────────
  if (step === 1) {
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

  // ─── Ecran 2 : setup / decision (scene interactive) ────────────────────
  if (step === 2) {
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

          <PortScene
            mode="setup" quai={choix.quai} grues={choix.grues} digital={choix.digital} t={t}
            onSelectQuai={q => setChoix(c => ({ ...c, quai: q }))}
            onIncGrues={() => setChoix(c => ({ ...c, grues: Math.min(4, c.grues + 1) }))}
            onDecGrues={() => setChoix(c => ({ ...c, grues: Math.max(2, c.grues - 1) }))}
            onToggleDigital={() => setChoix(c => ({ ...c, digital: !c.digital }))}
          />

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

  // ─── Ecran 3 : simulation avec compteurs en direct ──────────────────────
  if (step === 3) {
    const tempsEcoule = resultat ? (simProgress * resultat.tempsFinal).toFixed(1) : '0.0'
    const coutCumule = resultat ? Math.round(simProgress * resultat.coutFinal) : 0
    return (
      <div style={wrap}>
        <Fond /><RetourMenu /><BoutonLang />
        <div style={{ ...card, maxWidth: 780, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h1 style={{ textAlign: 'center', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, margin: 0 }}>{t.simTitre}</h1>
          <PortScene mode="simulation" quai={choix.quai} grues={choix.grues} digital={choix.digital} t={t} />

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '14px', borderRadius: 14, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{tempsEcoule}h</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{t.tempsEcoule}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '14px', borderRadius: 14, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{coutCumule.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}$</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{t.coutCumule}</div>
            </div>
          </div>

          <div style={{ width: '100%', height: 8, borderRadius: 10, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg,#0073F4,#34d399)', width: `${simProgress * 100}%` }} />
          </div>
        </div>
      </div>
    )
  }

  // ─── Ecran 4 : resultat ─────────────────────────────────────────────────
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
