import { useState, useEffect, useRef } from 'react'
import HeaderStack from '../components/HeaderStack'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const NAVY_DEEP = '#0A1128'
const BLUE = '#0073F4'

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    check:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    file:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    clock:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    linkedin: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" /></svg>,
    x:        <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z" /></svg>,
    doc:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  }
  return icons[name] || null
}

// ─── Contenu ────────────────────────────────────────────────────────────────
// Les themes/tags ci-dessous reprennent les intitules deja officiels du
// programme (voir Programme.jsx / translation.json) — pas d'invention.
// En revanche les "recommandations" elles-memes n'existent pas encore : ce
// sont les decisions issues des tables rondes EN direct pendant la COPAF
// (19-21 oct 2026). Chaque jour reste donc en etat "a venir" (tableau vide)
// jusqu'a ce que l'equipe COPAF fournisse le contenu reel a integrer ici.
const JOURS = [
  {
    id: 'jour1', badge: 'JOUR 1', titre: 'Vision Smart Port Africain', date: '19 Octobre 2026',
    tags: ['IA', 'Diagnostic digital', 'Automatisation', 'Gouvernance de la donnée'],
    recommandations: [],
    pdfHref: null,
  },
  {
    id: 'jour2', badge: 'JOUR 2', titre: 'Excellence Opérationnelle, Sécurité & Cybersécurité', date: '20 Octobre 2026',
    tags: ['Cybersécurité', 'Sûreté portuaire', 'Opérations nautiques', 'Pilotage temps réel'],
    recommandations: [],
    pdfHref: null,
  },
  {
    id: 'jour3', badge: 'JOUR 3', titre: 'Immersion Terrain — Port de Casablanca', date: '21 Octobre 2026',
    tags: ['Visite technique', 'Infrastructures IA', 'Réseautage'],
    recommandations: [],
    pdfHref: null,
  },
]

const TABS = [
  { id: 'tous',    label: 'Tous' },
  { id: 'jour1',   label: 'Jour 1 · Smart Port & IA' },
  { id: 'jour2',   label: 'Jour 2 · Cybersécurité & Opérations' },
  { id: 'jour3',   label: 'Jour 3 · Immersion & Clôture' },
  { id: 'rapport', label: 'Rapport Général' },
]

const shareUrl = 'https://copaf-ports.com/recommandations'

function TagPill({ children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700,
      background: 'rgba(0,115,244,0.08)', color: BLUE, letterSpacing: 0.2,
    }}>
      #{children}
    </span>
  )
}

function JourCard({ jour, register }) {
  const dispo = jour.recommandations.length > 0
  const shareText = encodeURIComponent(`${jour.badge} — ${jour.titre} — Recommandations officielles COPAF 2026`)

  return (
    <div id={jour.id} ref={el => register(jour.id, el)} style={{
      background: '#fff', borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(0,14,145,0.08)',
      boxShadow: '0 16px 40px -12px rgba(0,14,145,0.1)', scrollMarginTop: 'calc(var(--copaf-header-h, 140px) + 70px)',
    }}>
      {/* En-tete */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-block', padding: '5px 14px', borderRadius: 50, fontSize: 11, fontWeight: 900,
            letterSpacing: 1.5, background: 'rgba(255,255,255,0.15)', color: '#fff',
          }}>
            {jour.badge}
          </span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{jour.date}</span>
        </div>
        <h3 style={{ fontSize: 'clamp(19px,2.5vw,24px)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.25 }}>
          {jour.titre}
        </h3>
      </div>

      <div style={{ padding: '24px 28px 28px' }}>
        {/* Points cles & thematiques */}
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
          Points clés & thématiques
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {jour.tags.map(t => <TagPill key={t}>{t}</TagPill>)}
        </div>

        {/* Recommandations officielles */}
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>
          Recommandations officielles
        </div>
        {dispo ? (
          <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'grid', gap: 10 }}>
            {jour.recommandations.map((r, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Ico name="check" size={12} color="#16a34a" />
                </span>
                {r}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', marginBottom: 24,
            background: '#f8fafc', border: '1.5px dashed #e2e8f0', borderRadius: 14,
          }}>
            <Ico name="clock" size={18} color="#94a3b8" />
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              Les recommandations de cette journée seront publiées ici pendant la conférence (19–21 octobre 2026 à Casablanca).
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {jour.pdfHref ? (
            <a href={jour.pdfHref} download target="_blank" rel="noopener noreferrer" style={{
              flex: '1 1 220px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 18px', borderRadius: 12, background: `linear-gradient(135deg,${BLUE},${NAVY})`,
              color: '#fff', fontWeight: 800, fontSize: 13, textDecoration: 'none',
            }}>
              <Ico name="file" size={15} color="#fff" /> Télécharger la Synthèse {jour.badge.replace('JOUR ', 'J')} (PDF)
            </a>
          ) : (
            <div style={{
              flex: '1 1 220px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 18px', borderRadius: 12, background: '#f1f5f9', color: '#94a3b8', fontWeight: 700, fontSize: 13,
            }}>
              <Ico name="clock" size={15} color="#94a3b8" /> Synthèse PDF à venir
            </div>
          )}
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
            aria-label="Partager sur LinkedIn" style={{
              width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: NAVY,
            }}>
            <Ico name="linkedin" size={17} color={NAVY} />
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`} target="_blank" rel="noopener noreferrer"
            aria-label="Partager sur X" style={{
              width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: NAVY,
            }}>
            <Ico name="x" size={15} color={NAVY} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function RecommandationsActes() {
  const [activeTab, setActiveTab] = useState('tous')
  const sectionsRef = useRef({})

  const register = (id, el) => { if (el) sectionsRef.current[id] = el }

  useEffect(() => {
    const targets = Object.values(sectionsRef.current).filter(Boolean)
    if (!targets.length) return
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          const id = visible[0].target.id
          setActiveTab(prev => (['jour1', 'jour2', 'jour3', 'rapport'].includes(id) ? id : prev))
        }
      },
      { rootMargin: '-180px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    targets.forEach(t => obs.observe(t))
    return () => obs.disconnect()
  }, [])

  const goTo = id => {
    setActiveTab(id)
    if (id === 'tous') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    sectionsRef.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Recommandations Officielles & Actes — COPAF 2026"
        description="Consultez et téléchargez les feuilles de route stratégiques et les décisions consensuelles issues des travaux de la COPAF 2026 à Casablanca."
        canonical="https://copaf-ports.com/recommandations"
        type="website"
      />
      <HeaderStack />

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden', textAlign: 'center',
        paddingTop: 'calc(var(--copaf-header-h, 140px) + 32px)', paddingBottom: 32,
        background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', marginBottom: 18,
            borderRadius: 50, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'copaf-reco-pulse 1.8s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#fff' }}>
              Mis à jour en direct pendant l'événement
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Recommandations Officielles &amp; Actes — COPAF 2026
          </h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0 }}>
            Consultez et téléchargez les feuilles de route stratégiques et les décisions consensuelles issues des travaux de Casablanca.
          </p>
        </div>
      </div>

      {/* Barre d'onglets sticky */}
      <div style={{
        position: 'sticky', top: 'var(--copaf-header-h, 90px)', zIndex: 60,
        background: 'rgba(248,250,255,0.96)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,14,145,0.08)',
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto', padding: '10px clamp(16px,4vw,32px)',
          display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        }} className="copaf-reco-tabs">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => goTo(tab.id)} style={{
              flexShrink: 0, padding: '9px 16px', borderRadius: 50, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all .18s',
              background: activeTab === tab.id ? `linear-gradient(135deg,${BLUE},${NAVY})` : '#fff',
              color: activeTab === tab.id ? '#fff' : '#475569',
              boxShadow: activeTab === tab.id ? '0 6px 16px rgba(0,115,244,.25)' : '0 1px 3px rgba(0,0,0,0.06)',
              border: activeTab === tab.id ? 'none' : '1px solid #e2e8f0',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes par journee */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px clamp(16px,4vw,32px) 24px', display: 'grid', gap: 28 }}>
        {JOURS.map(j => <JourCard key={j.id} jour={j} register={register} />)}
      </div>

      {/* Rapport general & livre blanc */}
      <div id="rapport" ref={el => register('rapport', el)} style={{ maxWidth: 880, margin: '0 auto', padding: '24px clamp(16px,4vw,32px) 80px', scrollMarginTop: 'calc(var(--copaf-header-h, 140px) + 70px)' }}>
        <div style={{
          borderRadius: 24, padding: 'clamp(32px,5vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`,
        }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,115,244,0.35) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Ico name="doc" size={26} color="#fff" />
            </div>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>
              Actes Complets de la COPAF 2026
            </h2>
            <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: '0 auto 26px', lineHeight: 1.7 }}>
              Le livre blanc consolidant l'ensemble des recommandations, décisions et travaux des 3 journées sera disponible en téléchargement à l'issue de l'événement.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 50,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)',
              fontWeight: 700, fontSize: 13,
            }}>
              <Ico name="clock" size={15} color="rgba(255,255,255,0.85)" /> Disponible à l'issue de la conférence
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes copaf-reco-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .copaf-reco-tabs::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
