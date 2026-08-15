import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const AXES_LABELS = {
  infrastructure: 'Infrastructure digitale',
  automatisation: 'Automatisation',
  tracabilite: 'Traçabilité & données',
  ia: 'IA & décision',
  cybersecurite: 'Cybersécurité',
  surete: 'Sûreté & sécurité',
  environnement: 'Énergie & environnement',
  synchromodalite: 'Synchromodalité',
  competences: 'Compétences',
  parties_prenantes: 'Parties prenantes',
}

// ══════════════════════════════════════════
// Système de thème — tous les styles piochent dans T,
// jamais de couleur codée en dur dans le rendu.
// ══════════════════════════════════════════
const THEMES = {
  dark: {
    label: 'Sombre',
    bgFilter: 'brightness(0.75) saturate(1.2)',
    overlay: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.55) 0%, rgba(9,13,22,0.78) 70%)',
    pageBg: 'transparent',
    card: 'rgba(15, 23, 42, 0.7)',
    cardBlur: 'blur(12px)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardShadow: '0 10px 30px rgba(0,0,0,0.5)',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    textFaint: '#64748b',
    rowAlt: 'rgba(255,255,255,0.03)',
    rowBorder: 'rgba(255,255,255,0.06)',
    inputBg: 'rgba(15, 23, 42, 0.6)',
    inputBorder: 'rgba(255,255,255,0.1)',
    chipBg: 'rgba(255,255,255,0.06)',
    chipBorder: 'rgba(255,255,255,0.12)',
    accent: '#60a5fa',
    accentBg: 'rgba(0,115,244,0.15)',
    accentBorder: 'rgba(0,115,244,0.4)',
    selectOptionBg: '#0f172a',
    toggleOff: 'rgba(255,255,255,0.15)',
    barTrack: 'rgba(255,255,255,0.08)',
  },
  light: {
    label: 'Clair',
    bgFilter: 'brightness(1.08) saturate(1.03)',
    overlay: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(230,239,255,0.96) 100%)',
    pageBg: '#eef2fb',
    card: 'rgba(255, 255, 255, 0.9)',
    cardBlur: 'blur(12px)',
    cardBorder: 'rgba(0, 14, 145, 0.10)',
    cardShadow: '0 10px 30px rgba(15,23,42,0.08)',
    text: '#0b1230',
    textMuted: '#52608a',
    textFaint: '#8592b0',
    rowAlt: 'rgba(0,14,145,0.03)',
    rowBorder: 'rgba(0,14,145,0.08)',
    inputBg: '#ffffff',
    inputBorder: 'rgba(0,14,145,0.14)',
    chipBg: 'rgba(0,14,145,0.05)',
    chipBorder: 'rgba(0,14,145,0.14)',
    accent: BLUE,
    accentBg: 'rgba(0,115,244,0.1)',
    accentBorder: 'rgba(0,115,244,0.3)',
    selectOptionBg: '#ffffff',
    toggleOff: 'rgba(0,14,145,0.15)',
    barTrack: 'rgba(0,14,145,0.08)',
  },
}

const PARAMS_DEFAUT = {
  theme: 'dark', // dark | light
  sonNouveau: true,
  actualisationAuto: true,
  intervalleActualisation: 30, // secondes, utilisé seulement si le realtime tombe
  tri: 'recent', // recent | ancien | score_desc | score_asc | organisation
  seuilBas: 2,
  seuilHaut: 3.5,
  densite: 'confortable', // confortable | compact
}

const STORAGE_KEY = 'copaf_admin_diag_params'

function chargerParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return PARAMS_DEFAUT
    return { ...PARAMS_DEFAUT, ...JSON.parse(raw) }
  } catch {
    return PARAMS_DEFAUT
  }
}

function tempsRelatif(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  return `il y a ${Math.floor(diffH / 24)} j`
}

function jouerSonNotification() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(880, ctx.currentTime)
    g.gain.setValueAtTime(0.001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    o.start()
    o.stop(ctx.currentTime + 0.36)
  } catch {
    // silencieux si l'audio n'est pas disponible (ex. onglet en arrière-plan sans interaction)
  }
}

const IcoSoleil = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
  </svg>
)
const IcoLune = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export default function AdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtrePays, setFiltrePays] = useState('')
  const [ouvert, setOuvert] = useState(null)
  const [nouveauId, setNouveauId] = useState(null)
  const [confirmSuppr, setConfirmSuppr] = useState(null)
  const [confirmSupprTout, setConfirmSupprTout] = useState(false)
  const [suppEnCours, setSuppEnCours] = useState(false)
  const [toast, setToast] = useState('')
  const [panneauOuvert, setPanneauOuvert] = useState(false)
  const [ongletPanneau, setOngletPanneau] = useState('actions') // actions | affichage | alertes
  const [params, setParams] = useState(chargerParams)
  const [derniereActualisation, setDerniereActualisation] = useState(null)
  const [actualisationEnCours, setActualisationEnCours] = useState(false)

  const premierChargement = useRef(true)

  const T = THEMES[params.theme] || THEMES.dark

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const majParam = (cle, valeur) => {
    setParams(prev => {
      const suivant = { ...prev, [cle]: valeur }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(suivant)) } catch { /* stockage indisponible */ }
      return suivant
    })
  }

  const basculerTheme = () => majParam('theme', params.theme === 'dark' ? 'light' : 'dark')

  const reinitialiserParams = () => {
    setParams(PARAMS_DEFAUT)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(PARAMS_DEFAUT)) } catch { /* stockage indisponible */ }
    showToast('Préférences réinitialisées')
  }

  const load = useCallback(async () => {
    setActualisationEnCours(true)
    const { data: rows } = await supabase
      .from('diagnostics')
      .select('id, nom, prenom, organisation, pays, scores, recommandations, created_at')
      .order('created_at', { ascending: false })

    setDiagnostics(prev => {
      if (!premierChargement.current && rows && rows.length > 0 && rows[0].id !== prev[0]?.id) {
        setNouveauId(rows[0].id)
        setTimeout(() => setNouveauId(null), 4000)
        if (params.sonNouveau) jouerSonNotification()
      }
      return rows || []
    })
    premierChargement.current = false
    setLoading(false)
    setActualisationEnCours(false)
    setDerniereActualisation(new Date())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.sonNouveau])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('admin-diagnostics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diagnostics' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filet de sécurité : actualisation périodique si activée, en plus du realtime
  useEffect(() => {
    if (!params.actualisationAuto) return undefined
    const id = setInterval(load, Math.max(10, params.intervalleActualisation) * 1000)
    return () => clearInterval(id)
  }, [params.actualisationAuto, params.intervalleActualisation, load])

  const supprimerUn = async id => {
    setSuppEnCours(true)
    const { error } = await supabase.from('diagnostics').delete().eq('id', id)
    setSuppEnCours(false)
    setConfirmSuppr(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    setDiagnostics(list => list.filter(d => d.id !== id))
    showToast('Diagnostic supprimé')
  }

  const supprimerTout = async () => {
    setSuppEnCours(true)
    const idsASupprimer = filtres.map(d => d.id)
    const { error } = await supabase.from('diagnostics').delete().in('id', idsASupprimer)
    setSuppEnCours(false)
    setConfirmSupprTout(false)
    if (error) { showToast('Erreur : ' + error.message); return }
    setDiagnostics(list => list.filter(d => !idsASupprimer.includes(d.id)))
    showToast(`${idsASupprimer.length} diagnostic(s) supprimé(s)`)
  }

  const exporterCSV = () => {
    const cles = Object.keys(AXES_LABELS)
    const entetes = ['Organisation', 'Pays', 'Prénom', 'Nom', 'Email', 'Téléphone', ...cles.map(k => AXES_LABELS[k]), 'Score moyen', 'Date']
    const lignes = filtres.map(d => {
      const scores = cles.map(k => d.scores?.[k] ?? '')
      const moy = Object.values(d.scores || {}).length
        ? (Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length).toFixed(1)
        : ''
      return [
        d.organisation || '', d.pays || '', d.prenom || '', d.nom || '', d.email || '', d.telephone || '',
        ...scores, moy, new Date(d.created_at).toLocaleDateString('fr-FR'),
      ]
    })
    const csv = [entetes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagnostics-smartport-${filtrePays || 'tous'}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`CSV exporté (${filtres.length} ligne${filtres.length > 1 ? 's' : ''})`)
  }

  const copierResumeTexte = async () => {
    const lignes = moyennesParAxe.map(a => `${a.label} : ${a.moyenne.toFixed(1)}/5`)
    const texte = [
      `Diagnostics Smart Port — COPAF 2026`,
      filtrePays ? `Pays : ${filtrePays}` : 'Tous pays',
      `${filtres.length} diagnostic(s)`,
      '',
      ...lignes,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(texte)
      showToast('Résumé copié dans le presse-papiers')
    } catch {
      showToast("Impossible de copier — presse-papiers indisponible")
    }
  }

  const couleurMoyenne = v => {
    if (v < params.seuilBas) return '#ef4444'
    if (v < params.seuilHaut) return '#f59e0b'
    return '#22c55e'
  }

  const filtres = useMemo(() => {
    let base = filtrePays ? diagnostics.filter(d => d.pays === filtrePays) : diagnostics
    const moyenneDe = d => Object.values(d.scores || {}).length
      ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length
      : 0
    const copie = [...base]
    switch (params.tri) {
      case 'ancien':
        copie.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break
      case 'score_desc':
        copie.sort((a, b) => moyenneDe(b) - moyenneDe(a)); break
      case 'score_asc':
        copie.sort((a, b) => moyenneDe(a) - moyenneDe(b)); break
      case 'organisation':
        copie.sort((a, b) => (a.organisation || '').localeCompare(b.organisation || '')); break
      default:
        copie.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return copie
  }, [diagnostics, filtrePays, params.tri])

  const paysUniques = [...new Set(diagnostics.map(d => d.pays).filter(Boolean))].sort()

  const moyennesParAxe = Object.keys(AXES_LABELS).map(key => {
    const valeurs = filtres.map(d => d.scores?.[key]).filter(v => v !== undefined)
    const moyenne = valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : 0
    return { key, label: AXES_LABELS[key], moyenne, n: valeurs.length }
  })

  const densiteCompacte = params.densite === 'compact'

  const wrap = { position: 'relative', overflow: 'hidden', borderRadius: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '32px 20px', color: T.text, background: T.pageBg, transition: 'background .25s ease, color .25s ease' }
  const bgImage = { position: 'absolute', inset: 0, zIndex: -2, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: T.bgFilter }
  const bgOverlay = { position: 'absolute', inset: 0, zIndex: -1, backgroundImage: T.overlay }
  const cardStyle = { background: T.card, backdropFilter: T.cardBlur, border: `1px solid ${T.cardBorder}`, borderRadius: 16, boxShadow: T.cardShadow, transition: 'background .25s ease, border-color .25s ease' }

  const inputStyle = {
    padding: '10px 14px', fontSize: 13.5, fontFamily: 'inherit', color: T.text,
    background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 10, outline: 'none',
  }

  const boutonAction = (couleur) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
    background: `${couleur}1f`, border: `1px solid ${couleur}4d`, color: couleur,
    fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  })

  const toggleStyle = (actif) => ({
    position: 'relative', width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
    background: actif ? BLUE : T.toggleOff, transition: 'background .2s ease', border: 'none',
  })
  const toggleKnob = (actif) => ({
    position: 'absolute', top: 2, left: actif ? 20 : 2, width: 18, height: 18, borderRadius: '50%',
    background: '#fff', transition: 'left .2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
  })

  const ligneParam = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.rowBorder}` }
  const labelParam = { fontSize: 13, color: T.text, fontWeight: 600 }
  const descParam = { fontSize: 11.5, color: T.textMuted, marginTop: 2 }

  return (
    <div style={wrap}>
      <div style={bgImage} />
      <div style={bgOverlay} />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 20, fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              COPAF 2026
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, marginBottom: 6, letterSpacing: '-0.5px' }}>Diagnostics Smart Port</div>
            <div style={{ fontSize: 13.5, color: T.textMuted }}>
              {diagnostics.length} diagnostic{diagnostics.length > 1 ? 's' : ''} soumis
              {filtrePays && ` · filtré sur ${filtrePays} (${filtres.length})`}
              {derniereActualisation && ` · actualisé ${tempsRelatif(derniereActualisation.toISOString())}`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {/* Bascule rapide clair / sombre */}
            <button onClick={basculerTheme} title={params.theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10,
              background: T.chipBg, border: `1px solid ${T.chipBorder}`, color: T.text,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {params.theme === 'dark' ? <IcoSoleil color={T.text} /> : <IcoLune color={T.text} />}
              {params.theme === 'dark' ? 'Clair' : 'Sombre'}
            </button>

            <button onClick={load} disabled={actualisationEnCours} title="Actualiser maintenant" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10,
              background: T.chipBg, border: `1px solid ${T.chipBorder}`, color: T.text,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span style={{ display: 'inline-block', transition: 'transform .5s ease', transform: actualisationEnCours ? 'rotate(360deg)' : 'none' }}>⟳</span>
              Actualiser
            </button>
            <button onClick={() => setPanneauOuvert(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10,
              background: panneauOuvert ? T.accentBg : T.chipBg,
              border: `1px solid ${panneauOuvert ? T.accentBorder : T.chipBorder}`,
              color: panneauOuvert ? T.accent : T.text,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              ⚙️ Paramètres
            </button>
          </div>
        </div>

        {toast && (
          <div style={{ background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.4)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
            {toast}
          </div>
        )}

        {/* Panneau de paramètres */}
        {panneauOuvert && (
          <div style={{ ...cardStyle, padding: 0, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.cardBorder}` }}>
              {[
                { id: 'actions', label: 'Actions' },
                { id: 'affichage', label: 'Affichage' },
                { id: 'alertes', label: 'Alertes & seuils' },
              ].map(onglet => (
                <button key={onglet.id} onClick={() => setOngletPanneau(onglet.id)} style={{
                  flex: 1, padding: '13px 10px', background: ongletPanneau === onglet.id ? T.accentBg : 'transparent',
                  border: 'none', borderBottom: ongletPanneau === onglet.id ? `2px solid ${BLUE}` : '2px solid transparent',
                  color: ongletPanneau === onglet.id ? T.text : T.textMuted, fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {onglet.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 20 }}>
              {ongletPanneau === 'actions' && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={exporterCSV} disabled={filtres.length === 0} style={{ ...boutonAction('#60a5fa'), opacity: filtres.length === 0 ? 0.5 : 1, cursor: filtres.length === 0 ? 'default' : 'pointer' }}>
                    ⬇️ Exporter en CSV {filtrePays ? `(${filtrePays})` : '(tous)'}
                  </button>

                  <button onClick={copierResumeTexte} disabled={filtres.length === 0} style={{ ...boutonAction('#a78bfa'), opacity: filtres.length === 0 ? 0.5 : 1, cursor: filtres.length === 0 ? 'default' : 'pointer' }}>
                    📋 Copier le résumé des moyennes
                  </button>

                  <button onClick={load} style={boutonAction('#22c55e')}>
                    ⟳ Forcer l'actualisation
                  </button>

                  {!confirmSupprTout ? (
                    <button onClick={() => setConfirmSupprTout(true)} disabled={filtres.length === 0} style={{ ...boutonAction('#ef4444'), opacity: filtres.length === 0 ? 0.5 : 1, cursor: filtres.length === 0 ? 'default' : 'pointer' }}>
                      🗑️ Supprimer {filtrePays ? `les diagnostics de ${filtrePays}` : 'tous les diagnostics'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10 }}>
                      <span style={{ fontSize: 12.5, color: '#ef4444', fontWeight: 600 }}>Supprimer {filtres.length} diagnostic(s) définitivement ?</span>
                      <button onClick={supprimerTout} disabled={suppEnCours} style={{ padding: '6px 14px', background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {suppEnCours ? '...' : 'Confirmer'}
                      </button>
                      <button onClick={() => setConfirmSupprTout(false)} style={{ padding: '6px 14px', background: T.chipBg, border: 'none', borderRadius: 8, color: T.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              )}

              {ongletPanneau === 'affichage' && (
                <div>
                  <div style={ligneParam}>
                    <div>
                      <div style={labelParam}>Thème</div>
                      <div style={descParam}>Apparence de l'espace admin</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['dark', 'light'].map(v => (
                        <button key={v} onClick={() => majParam('theme', v)} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          background: params.theme === v ? T.accentBg : T.chipBg,
                          border: `1px solid ${params.theme === v ? T.accentBorder : T.chipBorder}`,
                          color: params.theme === v ? T.accent : T.textMuted,
                        }}>
                          {v === 'dark' ? <IcoLune size={13} /> : <IcoSoleil size={13} />}
                          {THEMES[v].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={ligneParam}>
                    <div>
                      <div style={labelParam}>Densité de la liste</div>
                      <div style={descParam}>Compacte pour voir plus de lignes à l'écran</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['confortable', 'compact'].map(v => (
                        <button key={v} onClick={() => majParam('densite', v)} style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          background: params.densite === v ? T.accentBg : T.chipBg,
                          border: `1px solid ${params.densite === v ? T.accentBorder : T.chipBorder}`,
                          color: params.densite === v ? T.accent : T.textMuted,
                        }}>
                          {v === 'confortable' ? 'Confortable' : 'Compact'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={ligneParam}>
                    <div>
                      <div style={labelParam}>Tri de la liste</div>
                      <div style={descParam}>Ordre d'affichage des diagnostics individuels</div>
                    </div>
                    <select value={params.tri} onChange={e => majParam('tri', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', padding: '7px 10px', fontSize: 12 }}>
                      <option value="recent" style={{ background: T.selectOptionBg, color: T.text }}>Plus récent</option>
                      <option value="ancien" style={{ background: T.selectOptionBg, color: T.text }}>Plus ancien</option>
                      <option value="score_desc" style={{ background: T.selectOptionBg, color: T.text }}>Score décroissant</option>
                      <option value="score_asc" style={{ background: T.selectOptionBg, color: T.text }}>Score croissant</option>
                      <option value="organisation" style={{ background: T.selectOptionBg, color: T.text }}>Organisation (A→Z)</option>
                    </select>
                  </div>

                  <div style={{ ...ligneParam, borderBottom: 'none' }}>
                    <div>
                      <div style={labelParam}>Réinitialiser les préférences</div>
                      <div style={descParam}>Revenir aux réglages par défaut</div>
                    </div>
                    <button onClick={reinitialiserParams} style={{ padding: '7px 14px', borderRadius: 8, background: T.chipBg, border: `1px solid ${T.chipBorder}`, color: T.textMuted, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Réinitialiser
                    </button>
                  </div>
                </div>
              )}

              {ongletPanneau === 'alertes' && (
                <div>
                  <div style={ligneParam}>
                    <div>
                      <div style={labelParam}>Son à la réception d'un nouveau diagnostic</div>
                      <div style={descParam}>Joue un bip discret quand une soumission arrive en direct</div>
                    </div>
                    <button onClick={() => majParam('sonNouveau', !params.sonNouveau)} style={toggleStyle(params.sonNouveau)}>
                      <span style={toggleKnob(params.sonNouveau)} />
                    </button>
                  </div>

                  <div style={ligneParam}>
                    <div>
                      <div style={labelParam}>Actualisation automatique</div>
                      <div style={descParam}>Filet de sécurité en plus du direct (utile si la connexion temps réel coupe)</div>
                    </div>
                    <button onClick={() => majParam('actualisationAuto', !params.actualisationAuto)} style={toggleStyle(params.actualisationAuto)}>
                      <span style={toggleKnob(params.actualisationAuto)} />
                    </button>
                  </div>

                  {params.actualisationAuto && (
                    <div style={ligneParam}>
                      <div>
                        <div style={labelParam}>Intervalle d'actualisation</div>
                        <div style={descParam}>{params.intervalleActualisation} secondes</div>
                      </div>
                      <input
                        type="range" min={10} max={120} step={10}
                        value={params.intervalleActualisation}
                        onChange={e => majParam('intervalleActualisation', Number(e.target.value))}
                        style={{ width: 140 }}
                      />
                    </div>
                  )}

                  <div style={ligneParam}>
                    <div>
                      <div style={labelParam}>Seuil rouge / orange</div>
                      <div style={descParam}>En dessous de {params.seuilBas.toFixed(1)}/5 → rouge</div>
                    </div>
                    <input type="range" min={0.5} max={3} step={0.1} value={params.seuilBas}
                      onChange={e => majParam('seuilBas', Math.min(Number(e.target.value), params.seuilHaut - 0.1))}
                      style={{ width: 140 }} />
                  </div>

                  <div style={{ ...ligneParam, borderBottom: 'none' }}>
                    <div>
                      <div style={labelParam}>Seuil orange / vert</div>
                      <div style={descParam}>Au-dessus de {params.seuilHaut.toFixed(1)}/5 → vert</div>
                    </div>
                    <input type="range" min={2} max={5} step={0.1} value={params.seuilHaut}
                      onChange={e => majParam('seuilHaut', Math.max(Number(e.target.value), params.seuilBas + 0.1))}
                      style={{ width: 140 }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activite en direct */}
        <div style={{ ...cardStyle, padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'copaf-live-pulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Activité en direct</span>
          </div>
          {diagnostics.length === 0 ? (
            <p style={{ fontSize: 12.5, color: T.textFaint, margin: 0 }}>En attente des premières soumissions...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {diagnostics.slice(0, 5).map(d => {
                const estNouveau = d.id === nouveauId
                const moy = Object.values(d.scores || {}).length
                  ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length
                  : 0
                return (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    padding: '9px 12px', borderRadius: 10, fontSize: 12.5,
                    background: estNouveau ? T.accentBg : T.rowAlt,
                    border: estNouveau ? `1.5px solid ${BLUE}` : '1px solid transparent',
                    transition: 'all .4s ease',
                  }}>
                    <span style={{ color: T.textMuted }}>
                      {estNouveau && <span style={{ color: T.accent, fontWeight: 800, marginRight: 6 }}>NOUVEAU ·</span>}
                      <strong style={{ color: T.text }}>{d.organisation || `${d.prenom} ${d.nom}`}</strong>
                      <span style={{ color: T.textMuted }}> · {d.pays}</span>
                    </span>
                    <span style={{ color: T.textMuted, flexShrink: 0 }}>{moy.toFixed(1)}/5 · {tempsRelatif(d.created_at)}</span>
                  </div>
                )
              })}
            </div>
          )}
          <style>{`@keyframes copaf-live-pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,.5); } 50% { opacity: .6; box-shadow: 0 0 0 5px rgba(34,197,94,0); } }`}</style>
        </div>

        {/* Filtre pays */}
        <div style={{ marginBottom: 20 }}>
          <select value={filtrePays} onChange={e => setFiltrePays(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="" style={{ background: T.selectOptionBg, color: T.text }}>Tous les pays</option>
            {paysUniques.map(p => <option key={p} value={p} style={{ background: T.selectOptionBg, color: T.text }}>{p}</option>)}
          </select>
        </div>

        {/* Moyennes agregees */}
        <div style={{ ...cardStyle, padding: 22, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            Moyenne par axe {filtrePays ? `— ${filtrePays}` : '— tous les ports'}
          </div>
          {filtres.length === 0 ? (
            <p style={{ fontSize: 13, color: T.textFaint }}>Aucun diagnostic pour l'instant.</p>
          ) : moyennesParAxe.map(a => (
            <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: T.textMuted, width: 160, flexShrink: 0 }}>{a.label}</span>
              <div style={{ flex: 1, height: 9, background: T.barTrack, borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${(a.moyenne / 5) * 100}%`, height: '100%', background: couleurMoyenne(a.moyenne), borderRadius: 5 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: couleurMoyenne(a.moyenne), width: 50, textAlign: 'right', flexShrink: 0 }}>{a.moyenne.toFixed(1)}/5</span>
            </div>
          ))}
        </div>

        {/* Liste */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Diagnostics individuels
        </div>

        {loading && <div style={{ color: T.textFaint, fontSize: 13 }}>Chargement...</div>}
        {!loading && filtres.length === 0 && <div style={{ color: T.textFaint, fontSize: 13 }}>Aucun résultat.</div>}

        {filtres.map(d => {
          const isOuvert = ouvert === d.id
          const moyenne = Object.values(d.scores || {}).length
            ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length
            : 0
          return (
            <div key={d.id} style={{ ...cardStyle, padding: densiteCompacte ? 10 : 16, marginBottom: densiteCompacte ? 6 : 10 }}>
              <div onClick={() => setOuvert(isOuvert ? null : d.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: densiteCompacte ? 13 : 14, fontWeight: 800, color: T.text }}>{d.organisation || `${d.prenom} ${d.nom}`}</div>
                  {!densiteCompacte && <div style={{ fontSize: 11.5, color: T.textMuted }}>{d.prenom} {d.nom} · {d.pays}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: couleurMoyenne(moyenne) }}>{moyenne.toFixed(1)}/5</span>
                  <a href={`/diagnostic/resultat/${d.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11.5, color: T.accent, fontWeight: 700, textDecoration: 'underline' }}>
                    Voir
                  </a>
                  {confirmSuppr === d.id ? (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => supprimerUn(d.id)} disabled={suppEnCours} style={{ padding: '5px 10px', background: '#dc2626', border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {suppEnCours ? '...' : 'Confirmer'}
                      </button>
                      <button onClick={() => setConfirmSuppr(null)} style={{ padding: '5px 10px', background: T.chipBg, border: 'none', borderRadius: 7, color: T.textMuted, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setConfirmSuppr(d.id) }} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#ef4444' }}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {isOuvert && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.rowBorder}` }}>
                  {Object.keys(AXES_LABELS).map(key => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.textMuted, padding: '4px 0' }}>
                      <span>{AXES_LABELS[key]}</span>
                      <span style={{ fontWeight: 700, color: T.text }}>{d.scores?.[key] ?? '—'}/5</span>
                    </div>
                  ))}
                  {d.recommandations && (
                    <div style={{ marginTop: 10, padding: 12, background: T.rowAlt, border: `1px solid ${T.rowBorder}`, borderRadius: 10, fontSize: 12, color: T.textMuted, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {d.recommandations}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}