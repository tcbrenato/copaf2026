import React, { useState } from 'react'

const intervenants = [
  {
    initiales: 'PA',
    photo: '/intervenant3.png',
    nom: 'Expert Partenaire A',
    titre: 'À confirmer',
    organisation: 'À confirmer',
    bio: 'Biographie à venir. Cet intervenant sera annoncé prochainement.',
  },
  {
    initiales: 'PB',
    photo: '/intervenant4.png',
    nom: 'Expert Partenaire B',
    titre: 'À confirmer',
    organisation: 'À confirmer',
    bio: 'Biographie à venir. Cet intervenant sera annoncé prochainement.',
  },
  {
    initiales: 'RA',
    photo: '/intervenant5.png',
    nom: 'Expert Recruté A',
    titre: 'À confirmer',
    organisation: 'À confirmer',
    bio: 'Biographie à venir. Cet intervenant sera annoncé prochainement.',
  },
  {
    initiales: 'WO',
    photo: '/intervenant2.png',
    nom: 'Dr. William ODAH',
    titre: 'Expert en Gouvernance Stratégique et Développement Portuaire',
    organisation: 'CRF Perfection',
    bio: "Directeur Général de CRF Perfection, le Dr. William ODAH accompagne depuis de nombreuses années institutions et entreprises d'Afrique de l'Ouest dans leurs projets de gouvernance stratégique, de formation et de développement portuaire. Il intervient régulièrement auprès d'acteurs publics et privés du secteur maritime et logistique, avec une attention particulière portée à la structuration des organisations et au renforcement des compétences. Son expertise couvre la conduite du changement institutionnel, la formation des cadres et l'accompagnement stratégique des projets à fort enjeu portuaire.",
  },
  {
    initiales: 'RB',
    photo: '/intervenant6.png',
    nom: 'Expert Recruté B',
    titre: 'À confirmer',
    organisation: 'À confirmer',
    bio: 'Biographie à venir. Cet intervenant sera annoncé prochainement.',
  },
  {
    initiales: 'MB',
    photo: '/marc.png',
    nom: 'Marc Biegniébé',
    titre: 'Directeur Général',
    organisation: 'ANAXAR',
    bio: "Marc Biegniébé est Directeur Général d'ANAXAR, entreprise de transport routier opérant sur les corridors reliant le port de Lomé aux pays de l'hinterland — Burkina Faso, Mali et Niger. Fort de plus de 10 ans d'expérience dans la chaîne logistique portuaire et transfrontalière, il intervient sur les enjeux de fluidité des corridors, de dédouanement et de digitalisation du transport en Afrique de l'Ouest.",
  },
  {
    initiales: 'PC',
    photo: '/intervenant7.png',
    nom: 'Expert Partenaire C',
    titre: 'À confirmer',
    organisation: 'À confirmer',
    bio: 'Biographie à venir. Cet intervenant sera annoncé prochainement.',
  },
  {
    initiales: 'RC',
    photo: '/intervenant8.png',
    nom: 'Expert Recruté C',
    titre: 'À confirmer',
    organisation: 'À confirmer',
    bio: 'Biographie à venir. Cet intervenant sera annoncé prochainement.',
  },
  {
    initiales: 'RT',
    photo: '/renatoint.png',
    nom: 'Rénato TCHOBO',
    titre: 'Expert en Transformation Digitale & Consultant en Solutions Numériques',
    organisation: 'CRF Perfection',
    bio: "Rénato TCHOBO est Chief Digital & IT Officer chez CRF Perfection, où il pilote le développement web, la stratégie digitale et la transformation numérique des projets institutionnels et événementiels. Consultant freelance en développement web et community management, il conçoit et déploie des plateformes numériques complètes — de la conception à la mise en production — pour des organisations basées à Cotonou et à l'international. Son expertise couvre la structuration de projets digitaux complexes, l'automatisation des processus et l'accompagnement stratégique de la transformation numérique.",
  },
]

const Intervenants = () => {
  const [activeModal, setActiveModal] = useState(null)

  return (
    <section id="formateurs" style={{
      padding: 'clamp(80px, 10vw, 130px) clamp(20px, 5vw, 80px)',
      fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'url(/bg2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(248,249,255,0.90)',
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: '#0073f4', marginBottom: 14,
          }}>
            COPAF 2026
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 900,
            color: '#000e91',
            margin: '0 0 18px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            Intervenants
          </h2>
          <p style={{
            fontSize: 16, color: '#555',
            maxWidth: 560, margin: '0 auto', lineHeight: 1.7,
          }}>
            Des experts réunis pour partager leur expertise sur les enjeux portuaires en Afrique.
          </p>
        </div>

        {/* Grille */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 28,
        }}>
          {intervenants.map((p, i) => (
            <div key={i} className="intervenant-card" onClick={() => setActiveModal(p)} style={{ cursor: 'pointer' }}>
              <div
                className="intervenant-card-inner"
                onMouseEnter={e => {
                  e.currentTarget.parentElement.style.transform = 'translateY(-5px)'
                  e.currentTarget.parentElement.style.boxShadow = '0 16px 40px rgba(0,14,145,0.14)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.parentElement.style.transform = 'translateY(0)'
                  e.currentTarget.parentElement.style.boxShadow = '0 4px 20px rgba(0,14,145,0.06)'
                }}
              >
              {/* Photo carrée en grand format, pleine largeur */}
              <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', background: '#EBF3FF' }}>
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt={p.nom}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #000e91, #0073f4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFFFF', fontSize: 48, fontWeight: 700,
                    letterSpacing: 1,
                  }}>
                    {p.initiales}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, background: 'linear-gradient(90deg, #000e91, #0073f4)' }} />
              </div>

              <div style={{ padding: '24px 28px 30px' }}>
                {/* Nom & titre */}
                <h3 style={{
                  fontSize: 22, fontWeight: 800,
                  color: '#000e91', margin: '0 0 6px', lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}>
                  {p.nom}
                </h3>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: '#0073f4',
                  letterSpacing: 0.3, lineHeight: 1.5,
                  marginBottom: 8,
                }}>
                  {p.titre}
                </div>
                <div style={{ fontSize: 12, color: '#888', letterSpacing: 0.3, marginBottom: 10 }}>
                  {p.organisation}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: '#0073f4',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Lire la biographie
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0073f4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .intervenant-card {
            position: relative;
            border-radius: 17px;
            padding: 1.5px;
            overflow: hidden;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 4px 20px rgba(0,14,145,0.06);
          }
          .intervenant-card::before {
            content: '';
            position: absolute;
            inset: -60%;
            background: conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 300deg,
              #4DA6FF 330deg,
              #0073f4 345deg,
              #000e91 355deg,
              transparent 360deg
            );
            animation: intervenant-border-spin 3.2s linear infinite;
          }
          .intervenant-card-inner {
            position: relative;
            z-index: 1;
            background: rgba(255,255,255,0.96);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          @keyframes intervenant-border-spin {
            to { transform: rotate(360deg); }
          }
          .intervenant-modal-overlay {
            position: fixed; inset: 0;
            background: rgba(15,23,42,.55);
            backdrop-filter: blur(6px);
            z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            animation: intervenant-fade-in .2s ease;
          }
          .intervenant-modal-box {
            background: #fff;
            border-radius: 22px;
            width: 100%;
            max-width: 560px;
            max-height: 86vh;
            overflow: hidden;
            position: relative;
            box-shadow: 0 24px 60px rgba(0,0,0,.2);
            animation: intervenant-slide-up .3s ease;
            display: flex;
            flex-direction: column;
          }
          .intervenant-modal-photo {
            width: 100%;
            height: clamp(180px, 32vh, 280px);
            flex-shrink: 0;
            position: relative;
            background: #EBF3FF;
          }
          .intervenant-modal-body {
            overflow-y: auto;
            padding: 28px 32px 36px;
          }
          @keyframes intervenant-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes intervenant-slide-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {activeModal && (
          <div className="intervenant-modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="intervenant-modal-box" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  position: 'absolute', top: 16, right: 16, zIndex: 2,
                  background: 'rgba(255,255,255,0.9)', border: 'none',
                  width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              <div className="intervenant-modal-photo">
                {activeModal.photo ? (
                  <img
                    src={activeModal.photo}
                    alt={activeModal.nom}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #000e91, #0073f4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFFFF', fontSize: 48, fontWeight: 700,
                  }}>
                    {activeModal.initiales}
                  </div>
                )}
              </div>

              <div className="intervenant-modal-body">
                <h3 style={{ fontSize: 24, fontWeight: 900, color: '#000e91', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  {activeModal.nom}
                </h3>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0073f4', marginBottom: 4 }}>
                  {activeModal.titre}
                </div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
                  {activeModal.organisation}
                </div>
                <p style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.8 }}>
                  {activeModal.bio}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}

export default Intervenants