import React from 'react'

const intervenants = [
  {
    initiales: 'PA',
    photo: '/intervenant3.png',
    nom: 'Expert Partenaire A',
    titre: 'À confirmer',
    organisation: 'À confirmer',
  },
  {
    initiales: 'PB',
    photo: '/intervenant4.png',
    nom: 'Expert Partenaire B',
    titre: 'À confirmer',
    organisation: 'À confirmer',
  },
  {
    initiales: 'RA',
    photo: '/intervenant5.png',
    nom: 'Expert Recruté A',
    titre: 'À confirmer',
    organisation: 'À confirmer',
  },
  {
    initiales: 'RB',
    photo: '/intervenant6.png',
    nom: 'Expert Recruté B',
    titre: 'À confirmer',
    organisation: 'À confirmer',
  },
  {
    initiales: 'WO',
    photo: '/intervenant2.png',
    nom: 'Dr. William ODAH',
    titre: 'Expert en Gouvernance Stratégique et Développement Portuaire',
    organisation: 'CRF Perfection',
  },
  {
    initiales: 'RT',
    photo: '/renatoint.png',
    nom: 'Rénato TCHOBO',
    titre: 'Expert en Transformation Digitale & Consultant en Solutions Numériques',
    organisation: 'CRF Perfection',
  },
]

const Intervenants = () => {
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
            <div key={i} className="intervenant-card">
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
                <div style={{ fontSize: 12, color: '#888', letterSpacing: 0.3 }}>
                  {p.organisation}
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
        `}</style>

      </div>
    </section>
  )
}

export default Intervenants