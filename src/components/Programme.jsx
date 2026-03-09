import { useState } from 'react'

const Programme = () => {
  const [activeJour, setActiveJour] = useState(0)
  const [activeSession, setActiveSession] = useState(null)

  const jours = [
    {
      jour: 'Jour 1',
      date: '15 Septembre',
      titre: 'IA & Vision Stratégique',
      objectif: 'Comprendre le paysage technologique et identifier les opportunités',
      icon: '🧭',
      color: '#0073f4',
      sessions: [
        { heure: '09h00 - 10h30', titre: "Conférence d'ouverture", desc: 'L\'IA au coeur de la révolution du Smart Port. Panorama mondial et spécificités africaines.', icon: '🎤' },
        { heure: '11h00 - 12h30', titre: 'Démystification technique', desc: 'Comprendre la Data, le Machine Learning et la Vision par Ordinateur sans jargon.', icon: '💡' },
        { heure: '14h00 - 15h30', titre: 'Études de cas', desc: 'Succès et échecs des projets IA dans les ports de Tanger Med et Durban.', icon: '📊' },
        { heure: '16h00 - 17h30', titre: 'Atelier de réflexion', desc: 'Diagnostic de maturité digitale de votre autorité portuaire.', icon: '🔍' },
      ]
    },
    {
      jour: 'Jour 2',
      date: '16 Septembre',
      titre: 'Excellence Opérationnelle & Sécurité',
      objectif: "Voir comment l'IA transforme le terrain (quais, terminaux, accès)",
      icon: '⚙️',
      color: '#000e91',
      sessions: [
        { heure: '09h00 - 10h30', titre: 'Opérations nautiques', desc: 'Prédiction des arrivées (ETA) et gestion intelligente des postes à quai.', icon: '⚓' },
        { heure: '11h00 - 12h30', titre: "Fluidité de l'Hinterland", desc: 'Algorithmes de gestion des flux de camions et réduction de la congestion urbaine.', icon: '🚛' },
        { heure: '14h00 - 15h30', titre: 'Sécurité & Sûreté', desc: "L'IA pour la détection automatique des anomalies (scanners, vidéosurveillance).", icon: '🔒' },
        { heure: '16h00 - 17h30', titre: 'Cyber sécurité', desc: 'Comment protéger un port connecté contre les menaces étatiques et criminelles.', icon: '🛡️' },
      ]
    },
    {
      jour: 'Jour 3',
      date: '17 Septembre',
      titre: 'Gouvernance, ROI & Feuille de Route',
      objectif: "Préparer l'après-formation : financer et piloter le changement",
      icon: '🗺️',
      color: '#0073f4',
      sessions: [
        { heure: '09h00 - 10h30', titre: "Modèle économique de l'IA", desc: "Calculer le ROI d'un projet technologique portuaire.", icon: '💰' },
        { heure: '11h00 - 12h30', titre: 'Gouvernance de la donnée', desc: 'Créer une culture Data-Driven et recruter les talents nécessaires.', icon: '📈' },
        { heure: '14h00 - 15h30', titre: 'Atelier Action Plan', desc: 'Élaboration d\'une feuille de route de transformation digitale personnalisée.', icon: '📋' },
        { heure: '16h00 - 17h00', titre: 'Table ronde finale', desc: 'Signature d\'un manifeste pour la coopération technologique entre ports africains.', icon: '🤝' },
      ]
    },
  ]

  const jour = jours[activeJour]

  return (
    <section id="programme" style={{
      padding: '100px 60px',
      background: '#ffffff',
      fontFamily: 'Roboto, sans-serif',
    }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,115,244,0.08)',
          border: '1px solid rgba(0,115,244,0.25)',
          borderRadius: 100, padding: '6px 22px', marginBottom: 18
        }}>
          <span style={{ color: '#0073f4', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Chronogramme
          </span>
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
          color: '#000e91', marginBottom: 16, lineHeight: 1.15
        }}>
          3 Jours de <span style={{ color: '#0073f4' }}>Formation Intensive</span>
        </h2>
        <p style={{ fontSize: 17, color: '#666', maxWidth: 560, margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
          Un programme dense et structuré pour transformer votre approche de la gestion portuaire
        </p>
      </div>

      {/* ONGLETS JOURS */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16,
        marginBottom: 48, flexWrap: 'wrap'
      }}>
        {jours.map((j, i) => (
          <button key={i}
            onClick={() => setActiveJour(i)}
            style={{
              padding: '14px 32px',
              borderRadius: 50,
              border: activeJour === i ? 'none' : '2px solid rgba(0,14,145,0.15)',
              background: activeJour === i ? j.color : '#FFFFFF',
              color: activeJour === i ? '#FFFFFF' : '#000e91',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.25s',
              boxShadow: activeJour === i ? '0 6px 24px rgba(0,115,244,0.35)' : 'none',
              display: 'flex', alignItems: 'center', gap: 10
            }}
            onMouseEnter={e => {
              if (activeJour !== i) {
                e.currentTarget.style.background = 'rgba(0,14,145,0.05)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={e => {
              if (activeJour !== i) {
                e.currentTarget.style.background = '#FFFFFF'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            <span style={{ fontSize: 18 }}>{j.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, opacity: 0.75 }}>{j.date}</div>
              <div>{j.jour}</div>
            </div>
          </button>
        ))}
      </div>

      {/* CONTENU DU JOUR ACTIF */}
      <div style={{
        background: '#f8f9ff',
        border: '1px solid rgba(0,115,244,0.12)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 4px 40px rgba(0,14,145,0.06)',
        marginBottom: 48
      }}>

        {/* Header du jour */}
        <div style={{
          background: jour.color,
          padding: '32px 48px',
          display: 'flex', alignItems: 'center', gap: 24
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0
          }}>
            {jour.icon}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
              {jour.date} 2026
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>
              {jour.jour} — {jour.titre}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
              🎯 {jour.objectif}
            </div>
          </div>
        </div>

        {/* Grille sessions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {jour.sessions.map((s, k) => (
            <div key={k}
              onClick={() => setActiveSession({ ...s, jourColor: jour.color })}
              style={{
                padding: '28px 36px',
                borderRight: k % 2 === 0 ? '1px solid rgba(0,115,244,0.08)' : 'none',
                borderBottom: k < 2 ? '1px solid rgba(0,115,244,0.08)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s',
                background: '#FFFFFF'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,115,244,0.03)'
                e.currentTarget.style.transform = 'scale(1.01)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FFFFFF'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: jour.color + '15',
                border: '1px solid ' + jour.color + '30',
                borderRadius: 20, padding: '4px 12px', marginBottom: 12
              }}>
                <span style={{ fontSize: 10 }}>⏱</span>
                <span style={{ fontSize: 11, color: jour.color, fontWeight: 700, letterSpacing: 1 }}>
                  {s.heure}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: jour.color + '12',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#000e91', marginBottom: 6 }}>
                    {s.titre}
                  </div>
                  <div style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>
                    {s.desc}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: 12, color: jour.color, fontWeight: 600 }}>
                Voir les détails →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INFOS LOGISTIQUES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {[
          { icon: '📍', label: 'Lieu', value: 'Dubaï, Émirats Arabes Unis' },
          { icon: '🗓', label: 'Dates', value: '15, 16 & 17 Septembre 2026' },
          { icon: '🌐', label: 'Langues', value: 'Français & Anglais (traduction simultanée)' },
        ].map((info, i) => (
          <div key={i} style={{
            background: '#f8f9ff',
            border: '1px solid rgba(0,115,244,0.12)',
            borderRadius: 12, padding: '22px 28px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 2px 12px rgba(0,14,145,0.04)'
          }}>
            <span style={{ fontSize: 28 }}>{info.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                {info.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#000e91', marginTop: 4 }}>
                {info.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL SESSION */}
      {activeSession && (
        <div
          onClick={() => setActiveSession(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,14,145,0.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: 20,
              maxWidth: 520, width: '100%',
              boxShadow: '0 24px 80px rgba(0,14,145,0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Modal header */}
            <div style={{
              background: activeSession.jourColor,
              padding: '28px 32px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22
                }}>
                  {activeSession.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>
                    Session
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF' }}>
                    {activeSession.titre}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveSession(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: '#FFFFFF', width: 32, height: 32, borderRadius: '50%',
                  cursor: 'pointer', fontSize: 16, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: activeSession.jourColor + '15',
                border: '1px solid ' + activeSession.jourColor + '30',
                borderRadius: 20, padding: '6px 14px', marginBottom: 20
              }}>
                <span style={{ fontSize: 12 }}>⏱</span>
                <span style={{ fontSize: 13, color: activeSession.jourColor, fontWeight: 700 }}>
                  {activeSession.heure}
                </span>
              </div>

              <p style={{ fontSize: 16, color: '#444', lineHeight: 1.8, marginBottom: 28, fontWeight: 300 }}>
                {activeSession.desc}
              </p>

              <div style={{
                background: '#f8f9ff', borderRadius: 12,
                padding: '20px 24px',
                border: '1px solid rgba(0,115,244,0.1)'
              }}>
                <div style={{ fontSize: 12, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                  Ce que vous apprendrez
                </div>
                {[
                  'Comprendre les enjeux stratégiques liés à cette thématique',
                  "Identifier les opportunités d'amélioration pour votre port",
                  'Repartir avec des outils concrets et applicables',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#0073f4', marginTop: 7, flexShrink: 0
                    }} />
                    <span style={{ fontSize: 14, color: '#555' }}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveSession(null)}
                style={{
                  marginTop: 24, width: '100%',
                  background: activeSession.jourColor, color: '#FFFFFF',
                  border: 'none', padding: '14px', borderRadius: 10,
                  fontFamily: 'Roboto', fontWeight: 700, fontSize: 14,
                  letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer'
                }}
              >
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