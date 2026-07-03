import { useState } from 'react'

const icons = {
  compass: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  gear: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  map: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  mic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  cpu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  anchor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>,
  truck: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  dollar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  handshake: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.36-7.36 1.06-1.06a5.4 5.4 0 0 0 0-7.23z"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  globe: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  cal: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  user: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
}

const C = {
  navy: '#000E91', navyLight: '#0A1AAF', navyDeep: '#000770',
  blue: '#0073F4', blueLight: '#3391F6', bluePale: '#EBF3FF', blueMid: '#C2DCFD',
  white: '#FFFFFF', offWhite: '#FFFFFF',
  navyAlpha10: 'rgba(0,14,145,0.10)', navyAlpha20: 'rgba(0,14,145,0.20)',
  blueAlpha15: 'rgba(0,115,244,0.15)', blueAlpha30: 'rgba(0,115,244,0.30)',
}

// Style des badges "Expert affecté" selon la catégorie (Maison / Partenaire / Recruté)
const categorieBadge = {
  Maison:    { bg: '#E8ECFF', color: '#000E91' },
  Partenaire:{ bg: '#EBF3FF', color: '#0073F4' },
  Recruté:   { bg: '#FFF4E8', color: '#A35F00' },
}

const jours = [
  {
    jour: 'Jour 1', date: '15 Sept.', titre: 'IA & Vision Stratégique',
    objectif: 'Comprendre le paysage technologique et identifier les opportunités',
    icon: icons.compass, accent: C.blue, accentBg: C.bluePale, accentBorder: C.blueMid,
    sessions: [
      { heure: '09h00 – 10h30', titre: "Conférence d'ouverture", desc: "L'IA au cœur de la révolution du Smart Port. Panorama mondial et spécificités africaines.", icon: icons.mic, points: ["Panorama mondial des ports intelligents", "Spécificités du contexte africain", "Feuille de route de la conférence"], intervenant: 'Expert Partenaire A', categorie: 'Partenaire' },
      { heure: '11h00 – 12h30', titre: 'Démystification technique', desc: 'Comprendre la Data, le Machine Learning et la Vision par Ordinateur sans jargon.', icon: icons.cpu, points: ["Data & Big Data expliqués simplement", "Machine Learning sans code", "Vision par Ordinateur appliquée aux ports"], intervenant: 'TCHOBO Rénato', categorie: 'Maison' },
      { heure: '14h00 – 15h30', titre: 'Études de cas', desc: 'Succès et échecs des projets IA dans les ports africains et mondiaux.', icon: icons.chart, points: ["Cas concrets de déploiement IA en Afrique", "Leçons tirées des expériences internationales", "Facteurs clés de succès identifiés"], intervenant: 'Expert Partenaire A', categorie: 'Partenaire' },
      { heure: '16h00 – 17h30', titre: 'Atelier de réflexion', desc: 'Diagnostic de maturité digitale de votre autorité portuaire.', icon: icons.search, points: ["Grille d'auto-évaluation digitale", "Cartographie des gaps technologiques", "Priorisation des chantiers urgents"], intervenant: 'Dr. William ODAH', categorie: 'Maison' },
    ]
  },
  {
    jour: 'Jour 2', date: '16 Sept.', titre: 'Excellence Opérationnelle & Sécurité',
    objectif: "Voir comment l'IA transforme le terrain (quais, terminaux, accès)",
    icon: icons.gear, accent: C.navy, accentBg: 'rgba(0,14,145,0.06)', accentBorder: 'rgba(0,14,145,0.2)',
    sessions: [
      { heure: '09h00 – 10h30', titre: 'Opérations nautiques', desc: 'Prédiction des arrivées (ETA) et gestion intelligente des postes à quai.', icon: icons.anchor, points: ["Algorithmes de prédiction ETA", "Optimisation des postes à quai", "Réduction des temps d'attente"], intervenant: 'Expert Recruté A', categorie: 'Recruté' },
      { heure: '11h00 – 12h30', titre: "Fluidité de l'Hinterland", desc: 'Algorithmes de gestion des flux de camions et réduction de la congestion urbaine.', icon: icons.truck, points: ["Gestion intelligente des flux camions", "Réduction de la congestion urbaine", "Coordination avec les douanes"], intervenant: 'Expert Recruté A', categorie: 'Recruté' },
      { heure: '14h00 – 15h30', titre: 'Sécurité & Sûreté', desc: "L'IA pour la détection automatique des anomalies (scanners, vidéosurveillance).", icon: icons.lock, points: ["Analyse automatisée des scanners", "Vidéosurveillance intelligente", "Alertes en temps réel"], intervenant: 'Expert Recruté B', categorie: 'Recruté' },
      { heure: '16h00 – 17h30', titre: 'Cybersécurité portuaire', desc: 'Comment protéger un port connecté contre les menaces étatiques et criminelles.', icon: icons.shield, points: ["Cartographie des menaces cyber", "Protocoles de protection OT/IT", "Gestion des incidents et réponse"], intervenant: 'Expert Recruté B', categorie: 'Recruté' },
    ]
  },
  {
    jour: 'Jour 3', date: '17 Sept.', titre: 'Gouvernance, ROI & Feuille de Route',
    objectif: "Préparer l'après-formation : financer et piloter le changement",
    icon: icons.map, accent: C.blueLight, accentBg: 'rgba(51,145,246,0.08)', accentBorder: 'rgba(51,145,246,0.25)',
    sessions: [
      { heure: '09h00 – 10h30', titre: "Modèle économique de l'IA", desc: "Calculer le ROI d'un projet technologique portuaire.", icon: icons.dollar, points: ["Méthodes de calcul du ROI tech", "Modèles de financement disponibles", "Présentation aux instances dirigeantes"], intervenant: 'Expert Partenaire B', categorie: 'Partenaire' },
      { heure: '11h00 – 12h30', titre: 'Gouvernance de la donnée', desc: 'Créer une culture Data-Driven et recruter les talents nécessaires.', icon: icons.users, points: ["Mise en place d'une Data Governance", "Stratégie de recrutement tech", "Conduite du changement organisationnel"], intervenant: 'TCHOBO Rénato', categorie: 'Maison' },
      { heure: '14h00 – 15h30', titre: 'Atelier Action Plan', desc: "Élaboration d'une feuille de route de transformation digitale personnalisée.", icon: icons.clipboard, points: ["Template de feuille de route", "Priorisation sur 12 / 24 / 36 mois", "KPIs de suivi de transformation"], intervenant: 'Dr. William ODAH', categorie: 'Maison' },
      { heure: '16h00 – 17h00', titre: 'Table ronde finale', desc: "Signature d'un manifeste pour la coopération technologique entre ports africains.", icon: icons.handshake, points: ["Présentation des plans d'action", "Réseau de coopération inter-ports", "Signature du manifeste COPAF 2026"], intervenant: 'Expert Partenaire B', categorie: 'Partenaire' },
    ]
  },
]

const Programme = () => {
  const [activeJour, setActiveJour] = useState(0)
  const [activeSession, setActiveSession] = useState(null)
  const [hoveredSession, setHoveredSession] = useState(null)
  const jour = jours[activeJour]

  return (
    <section id="programme" style={{
      padding: 'clamp(60px, 10vw, 100px) 0',
      background: '#ffffff',
      backgroundImage: 'url(/bg2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: "'Outfit', 'Roboto', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap');
        .prog-tab { transition: all 0.25s cubic-bezier(.4,0,.2,1) !important; }
        .prog-tab:hover { transform: translateY(-2px); }
        .prog-row { transition: all 0.18s ease !important; }
        .prog-stat-card { transition: all 0.2s ease !important; }
        .prog-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,115,244,0.18) !important; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .prog-animate { animation: fadeSlideUp 0.4s ease forwards; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-animate { animation: modalIn 0.3s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      {/* Overlay pour lisibilité sur bg2.png */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', zIndex: 1, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px, 5vw, 60px)', position: 'relative', zIndex: 2 }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 7vw, 72px)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.navy, borderRadius: 100, padding: '7px 22px', marginBottom: 24,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue }} />
            <span style={{ color: C.white, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Chronogramme</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900,
            color: C.navy, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em',
          }}>
            3 Jours de{' '}
            <span style={{
              background: `linear-gradient(135deg, ${C.blue}, ${C.navyLight})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Partages Intensifs</span>
          </h2>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)', color: C.navyLight,
            maxWidth: 540, margin: '0 auto', lineHeight: 1.8, fontWeight: 300, opacity: 0.7,
          }}>
            Un programme structuré pour transformer votre approche de la gestion portuaire africaine
          </p>
        </div>

        {/* ── ONGLETS JOURS ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
          {jours.map((j, i) => {
            const active = activeJour === i
            return (
              <button key={i} className="prog-tab" onClick={() => setActiveJour(i)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 26px', borderRadius: 14,
                border: active ? 'none' : `1.5px solid ${C.navyAlpha20}`,
                background: active ? `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)` : C.white,
                color: active ? C.white : C.navy,
                fontFamily: 'inherit', fontWeight: 700,
                fontSize: 'clamp(12px, 1.8vw, 14px)', cursor: 'pointer',
                boxShadow: active ? `0 8px 24px ${C.navyAlpha20}` : '0 2px 8px rgba(0,14,145,0.06)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: active ? 'rgba(255,255,255,0.2)' : C.bluePale,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: active ? C.white : C.blue,
                }}>{j.icon}</div>
                <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
                  <div style={{ fontSize: 10, opacity: 0.65, fontWeight: 400, letterSpacing: 1 }}>{j.date}</div>
                  <div>{j.jour}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── BLOC JOUR ACTIF ── */}
        <div className="prog-animate" key={activeJour}>

          {/* Header du jour */}
          <div style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 60%, ${C.blue} 100%)`,
            borderRadius: '20px 20px 0 0',
            padding: 'clamp(24px, 4vw, 36px) clamp(24px, 5vw, 44px)',
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', border: '40px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 60, bottom: -60, width: 150, height: 150, borderRadius: '50%', border: '30px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.white, flexShrink: 0,
            }}>{jour.icon}</div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: C.blueMid, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
                {jour.date} 2026
              </div>
              <div style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 900, color: C.white, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                {jour.jour} — {jour.titre}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 1.6 }}>
                {jour.objectif}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 14, padding: '14px 24px', textAlign: 'center', flexShrink: 0, backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.white, lineHeight: 1 }}>4</div>
              <div style={{ fontSize: 10, color: C.blueMid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>Sessions</div>
            </div>
          </div>

          {/* Sessions */}
          <div style={{
            border: `1.5px solid ${C.navyAlpha10}`, borderTop: 'none',
            borderRadius: '0 0 20px 20px', overflow: 'hidden',
            background: C.white, boxShadow: '0 20px 60px rgba(0,14,145,0.08)',
          }}>
            {jour.sessions.map((s, k) => {
              const hovered = hoveredSession === k
              const catBadge = categorieBadge[s.categorie] || categorieBadge.Partenaire
              return (
                <div key={k} className="prog-row"
                  onClick={() => setActiveSession({ ...s, accent: jour.accent, jourTitre: jour.titre })}
                  onMouseEnter={() => setHoveredSession(k)}
                  onMouseLeave={() => setHoveredSession(null)}
                  style={{
                    display: 'grid', gridTemplateColumns: 'clamp(100px,13vw,140px) 1px 1fr',
                    background: hovered ? C.bluePale : (k % 2 === 0 ? C.white : '#FAFBFF'),
                    borderBottom: k < jour.sessions.length - 1 ? `1px solid ${C.navyAlpha10}` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ padding: 'clamp(20px, 3vw, 28px) clamp(14px, 2vw, 22px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <div style={{ color: hovered ? C.blue : C.navy, display: 'flex' }}>{icons.clock}</div>
                    <div style={{ fontSize: 'clamp(10px, 1.4vw, 11px)', color: hovered ? C.blue : '#666', fontWeight: 700, textAlign: 'center', lineHeight: 1.5, letterSpacing: 0.3 }}>
                      {s.heure.split('–').map((t, i) => <div key={i}>{t.trim()}</div>)}
                    </div>
                  </div>

                  <div style={{ background: hovered ? C.blueAlpha30 : C.navyAlpha10, transition: 'background 0.18s' }} />

                  <div style={{ padding: 'clamp(20px, 3vw, 28px) clamp(18px, 3vw, 32px)', display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: hovered ? C.blue : C.bluePale,
                      border: `1.5px solid ${hovered ? C.blue : C.blueMid}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: hovered ? C.white : C.blue, flexShrink: 0, transition: 'all 0.18s',
                    }}>{s.icon}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 700, color: C.navy, marginBottom: 5, letterSpacing: '-0.01em' }}>{s.titre}</div>
                      <div style={{ fontSize: 'clamp(12px, 1.5vw, 13px)', color: '#888', lineHeight: 1.65, marginBottom: 8 }}>{s.desc}</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontWeight: 700, color: catBadge.color,
                        background: catBadge.bg, borderRadius: 20, padding: '3px 10px 3px 8px',
                      }}>
                        <span style={{ display: 'flex' }}>{icons.user}</span>
                        {s.intervenant}
                      </div>
                    </div>

                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: hovered ? C.blue : C.bluePale,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: hovered ? C.white : C.blue, fontSize: 18, flexShrink: 0, transition: 'all 0.18s',
                    }}>›</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── INFOS LOGISTIQUES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginTop: 40 }}>
          {[
            { icon: icons.pin,   label: 'Lieu',    value: 'Casablanca, Maroc' },
            { icon: icons.cal,   label: 'Dates',   value: '15 – 17 Septembre 2026' },
            { icon: icons.globe, label: 'Langues', value: 'Français & Anglais (traduction simultanée)' },
          ].map((info, i) => (
            <div key={i} className="prog-stat-card" style={{
              background: C.white, border: `1.5px solid ${C.navyAlpha10}`,
              borderRadius: 16, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 4px 16px rgba(0,14,145,0.05)',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.bluePale, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue, flexShrink: 0 }}>
                {info.icon}
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{info.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, lineHeight: 1.4 }}>{info.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL ── */}
      {activeSession && (
        <div onClick={() => setActiveSession(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,14,145,0.45)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: 20,
        }}>
          <div className="modal-animate" onClick={e => e.stopPropagation()} style={{
            background: C.white, borderRadius: 24, maxWidth: 520, width: '100%',
            overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 40px 100px rgba(0,14,145,0.3)',
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight} 50%, ${C.blue})`,
              padding: '28px 32px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', gap: 16, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: '50%', border: '28px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, flexShrink: 0 }}>
                  {activeSession.icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.blueMid, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 }}>
                    Session — {activeSession.jourTitre}
                  </div>
                  <div style={{ fontSize: 'clamp(16px, 3vw, 21px)', fontWeight: 900, color: C.white, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                    {activeSession.titre}
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveSession(null)} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                color: C.white, width: 36, height: 36, borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >{icons.close}</button>
            </div>

            <div style={{ padding: '32px 32px 36px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.bluePale, border: `1px solid ${C.blueMid}`, borderRadius: 100, padding: '6px 16px', color: C.blue, fontSize: 13, fontWeight: 700 }}>
                  <span style={{ display: 'flex' }}>{icons.clock}</span>
                  <span>{activeSession.heure}</span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 100, padding: '6px 16px',
                  fontSize: 13, fontWeight: 700,
                  background: (categorieBadge[activeSession.categorie] || categorieBadge.Partenaire).bg,
                  color: (categorieBadge[activeSession.categorie] || categorieBadge.Partenaire).color,
                  border: `1px solid ${(categorieBadge[activeSession.categorie] || categorieBadge.Partenaire).color}30`,
                }}>
                  <span style={{ display: 'flex' }}>{icons.user}</span>
                  <span>{activeSession.intervenant}</span>
                </div>
              </div>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 28, fontWeight: 300 }}>{activeSession.desc}</p>
              <div style={{ background: '#FAFBFF', border: `1.5px solid ${C.navyAlpha10}`, borderRadius: 16, padding: '22px 24px' }}>
                <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 18 }}>Points clés abordés</div>
                {activeSession.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < activeSession.points.length - 1 ? 14 : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: C.bluePale, border: `1px solid ${C.blueMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue, flexShrink: 0, marginTop: 1 }}>{icons.check}</div>
                    <span style={{ fontSize: 14, color: C.navy, lineHeight: 1.65, fontWeight: 400 }}>{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveSession(null)} style={{
                marginTop: 28, width: '100%',
                background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                color: C.white, border: 'none', padding: '15px', borderRadius: 12,
                fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Fermer</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Programme