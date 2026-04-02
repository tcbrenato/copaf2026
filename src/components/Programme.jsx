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
}

const jours = [
  {
    jour: 'Jour 1', date: '15 Sept.', titre: 'IA & Vision Stratégique',
    objectif: 'Comprendre le paysage technologique et identifier les opportunités',
    icon: icons.compass, accentColor: '#0073f4',
    sessions: [
      { heure: '09h00 – 10h30', titre: "Conférence d'ouverture", desc: "L'IA au cœur de la révolution du Smart Port. Panorama mondial et spécificités africaines.", icon: icons.mic, points: ["Panorama mondial des ports intelligents", "Spécificités du contexte africain", "Feuille de route de la conférence"] },
      { heure: '11h00 – 12h30', titre: 'Démystification technique', desc: 'Comprendre la Data, le Machine Learning et la Vision par Ordinateur sans jargon.', icon: icons.cpu, points: ["Data & Big Data expliqués simplement", "Machine Learning sans code", "Vision par Ordinateur appliquée aux ports"] },
      { heure: '14h00 – 15h30', titre: 'Études de cas', desc: 'Succès et échecs des projets IA dans les ports de Tanger Med et Durban.', icon: icons.chart, points: ["Cas Tanger Med : déploiement IA", "Cas Durban : leçons des échecs", "Facteurs clés de succès identifiés"] },
      { heure: '16h00 – 17h30', titre: 'Atelier de réflexion', desc: 'Diagnostic de maturité digitale de votre autorité portuaire.', icon: icons.search, points: ["Grille d'auto-évaluation digitale", "Cartographie des gaps technologiques", "Priorisation des chantiers urgents"] },
    ]
  },
  {
    jour: 'Jour 2', date: '16 Sept.', titre: 'Excellence Opérationnelle & Sécurité',
    objectif: "Voir comment l'IA transforme le terrain (quais, terminaux, accès)",
    icon: icons.gear, accentColor: '#7c3aed',
    sessions: [
      { heure: '09h00 – 10h30', titre: 'Opérations nautiques', desc: 'Prédiction des arrivées (ETA) et gestion intelligente des postes à quai.', icon: icons.anchor, points: ["Algorithmes de prédiction ETA", "Optimisation des postes à quai", "Réduction des temps d'attente"] },
      { heure: '11h00 – 12h30', titre: "Fluidité de l'Hinterland", desc: 'Algorithmes de gestion des flux de camions et réduction de la congestion urbaine.', icon: icons.truck, points: ["Gestion intelligente des flux camions", "Réduction de la congestion urbaine", "Coordination avec les douanes"] },
      { heure: '14h00 – 15h30', titre: 'Sécurité & Sûreté', desc: "L'IA pour la détection automatique des anomalies (scanners, vidéosurveillance).", icon: icons.lock, points: ["Analyse automatisée des scanners", "Vidéosurveillance intelligente", "Alertes en temps réel"] },
      { heure: '16h00 – 17h30', titre: 'Cybersécurité portuaire', desc: 'Comment protéger un port connecté contre les menaces étatiques et criminelles.', icon: icons.shield, points: ["Cartographie des menaces cyber", "Protocoles de protection OT/IT", "Gestion des incidents et réponse"] },
    ]
  },
  {
    jour: 'Jour 3', date: '17 Sept.', titre: 'Gouvernance, ROI & Feuille de Route',
    objectif: "Préparer l'après-formation : financer et piloter le changement",
    icon: icons.map, accentColor: '#059669',
    sessions: [
      { heure: '09h00 – 10h30', titre: "Modèle économique de l'IA", desc: "Calculer le ROI d'un projet technologique portuaire.", icon: icons.dollar, points: ["Méthodes de calcul du ROI tech", "Modèles de financement disponibles", "Présentation aux instances dirigeantes"] },
      { heure: '11h00 – 12h30', titre: 'Gouvernance de la donnée', desc: 'Créer une culture Data-Driven et recruter les talents nécessaires.', icon: icons.users, points: ["Mise en place d'une Data Governance", "Stratégie de recrutement tech", "Conduite du changement organisationnel"] },
      { heure: '14h00 – 15h30', titre: 'Atelier Action Plan', desc: "Élaboration d'une feuille de route de transformation digitale personnalisée.", icon: icons.clipboard, points: ["Template de feuille de route", "Priorisation sur 12 / 24 / 36 mois", "KPIs de suivi de transformation"] },
      { heure: '16h00 – 17h00', titre: 'Table ronde finale', desc: "Signature d'un manifeste pour la coopération technologique entre ports africains.", icon: icons.handshake, points: ["Présentation des plans d'action", "Réseau de coopération inter-ports", "Signature du manifeste COPAF 2026"] },
    ]
  },
]

const Programme = () => {
  const [activeJour, setActiveJour] = useState(0)
  const [activeSession, setActiveSession] = useState(null)
  const jour = jours[activeJour]

  return (
    <section id="programme" style={{
      padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 60px)',
      background: '#FFFFFF',
      fontFamily: 'Roboto, sans-serif',
    }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,115,244,0.12)',
          border: '1px solid rgba(0,115,244,0.3)',
          borderRadius: 100, padding: '6px 22px', marginBottom: 20,
        }}>
          <span style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Chronogramme
          </span>
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
          color: '#000', marginBottom: 16, lineHeight: 1.15, margin: '0 0 16px'
        }}>
          3 Jours de <span style={{ color: '#0073f4' }}>Partages Intensifs</span>
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 16px)', color: '#666',
          maxWidth: 520, margin: '16px auto 0', lineHeight: 1.8, fontWeight: 300
        }}>
          Un programme structuré pour transformer votre approche de la gestion portuaire africaine
        </p>
      </div>

      {/* ONGLETS JOURS */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        marginBottom: 40, flexWrap: 'wrap',
      }}>
        {jours.map((j, i) => (
          <button key={i} onClick={() => setActiveJour(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 24px',
            borderRadius: 50,
            border: activeJour === i ? 'none' : '1px solid rgba(255,255,255,0.1)',
            background: activeJour === i ? j.accentColor : 'rgba(0,0,0,0.04)',
            color: activeJour === i ? '#fff' : '#666',
            fontFamily: 'Roboto, sans-serif', fontWeight: 700,
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <span style={{ color: activeJour === i ? '#fff' : j.accentColor, display: 'flex', alignItems: 'center' }}>{j.icon}</span>
            <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{j.date}</div>
              <div>{j.jour}</div>
            </div>
          </button>
        ))}
      </div>

      {/* HEADER DU JOUR */}
      <div style={{
        background: jour.accentColor + '18',
        border: '1px solid ' + jour.accentColor + '40',
        borderRadius: '16px 16px 0 0',
        padding: 'clamp(20px, 4vw, 32px) clamp(20px, 5vw, 40px)',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: jour.accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
        }}>
          {jour.icon}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, color: jour.accentColor, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
            {jour.date} 2026
          </div>
          <div style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, color: '#000', lineHeight: 1.2 }}>
            {jour.jour} — {jour.titre}
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
            {jour.objectif}
          </div>
        </div>
        <div style={{
          background: 'rgba(0,0,0,0.06)', borderRadius: 10,
          padding: '8px 18px', textAlign: 'center', flexShrink: 0,
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#000' }}>4</div>
          <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Sessions</div>
        </div>
      </div>

      {/* TIMELINE SESSIONS */}
      <div style={{
        border: '1px solid rgba(0,0,0,0.1)',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        overflow: 'hidden',
        marginBottom: 48,
      }}>
        {jour.sessions.map((s, k) => (
          <div key={k} onClick={() => setActiveSession({ ...s, accentColor: jour.accentColor, jourTitre: jour.titre })}
            style={{
              display: 'grid',
              gridTemplateColumns: 'clamp(90px,14vw,130px) 1px 1fr',
              background: k % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.04)',
              borderBottom: k < jour.sessions.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = jour.accentColor + '12'}
            onMouseLeave={e => e.currentTarget.style.background = k % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.04)'}
          >
            {/* Colonne heure */}
            <div style={{
              padding: 'clamp(16px, 3vw, 24px) clamp(12px, 2vw, 20px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4,
            }}>
              <div style={{ color: jour.accentColor, display: 'flex', marginBottom: 4 }}>{icons.clock}</div>
              <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#666', fontWeight: 700, textAlign: 'center', lineHeight: 1.4 }}>
                {s.heure.replace('–', '\n')}
              </div>
            </div>

            {/* Ligne séparatrice verticale */}
            <div style={{ background: 'rgba(0,0,0,0.1)', alignSelf: 'stretch' }} />

            {/* Contenu session */}
            <div style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: jour.accentColor + '20',
                border: '1px solid ' + jour.accentColor + '35',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: jour.accentColor, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 700, color: '#000', marginBottom: 4 }}>
                  {s.titre}
                </div>
                <div style={{ fontSize: 'clamp(12px, 1.6vw, 13px)', color: '#666', lineHeight: 1.6 }}>
                  {s.desc}
                </div>
              </div>
              <div style={{ color: jour.accentColor, fontSize: 18, flexShrink: 0, opacity: 0.7 }}>›</div>
            </div>
          </div>
        ))}
      </div>

      {/* INFOS LOGISTIQUES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: 16,
      }}>
        {[
          { icon: icons.pin, label: 'Lieu', value: 'Tanger Med (Maroc)' },
          { icon: icons.cal, label: 'Dates', value: '15 – 17 Septembre 2026' },
          { icon: icons.globe, label: 'Langues', value: 'Français & Anglais (traduction simultanée)' },
        ].map((info, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 12, padding: '18px 22px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ color: '#0073f4', display: 'flex', flexShrink: 0 }}>{info.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#999', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{info.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginTop: 3 }}>{info.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {activeSession && (
        <div onClick={() => setActiveSession(null)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 20, maxWidth: 500, width: '100%',
            overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{
              background: activeSession.accentColor,
              padding: '24px 28px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                }}>
                  {activeSession.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                    Session — {activeSession.jourTitre}
                  </div>
                  <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
                    {activeSession.titre}
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveSession(null)} style={{
                background: 'rgba(0,0,0,0.1)', border: 'none',
                color: '#000', width: 32, height: 32, borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {icons.close}
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '28px 28px 32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: activeSession.accentColor + '20',
                border: '1px solid ' + activeSession.accentColor + '40',
                borderRadius: 20, padding: '5px 14px', marginBottom: 20,
                color: activeSession.accentColor, fontSize: 13, fontWeight: 700,
              }}>
                <span style={{ display: 'flex' }}>{icons.clock}</span>
                <span style={{ marginLeft: 4 }}>{activeSession.heure}</span>
              </div>

              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.8, marginBottom: 28 }}>
                {activeSession.desc}
              </p>

              <div style={{
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 12, padding: '20px 22px',
              }}>
                <div style={{ fontSize: 11, color: activeSession.accentColor, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                  Points clés abordés
                </div>
                {activeSession.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < activeSession.points.length - 1 ? 12 : 0 }}>
                    <div style={{ color: activeSession.accentColor, marginTop: 2, flexShrink: 0 }}>{icons.check}</div>
                    <span style={{ fontSize: 14, color: '#333', lineHeight: 1.6 }}>{p}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setActiveSession(null)} style={{
                marginTop: 24, width: '100%',
                background: activeSession.accentColor, color: '#fff',
                border: 'none', padding: '14px', borderRadius: 10,
                fontFamily: 'Roboto', fontWeight: 700, fontSize: 14,
                letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
              }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

export default Programme