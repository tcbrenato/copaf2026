import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const intervenants = [
  {
    initiales: 'PA',
    photo: '/intervenant3.png',
    nom: 'Expert Partenaire A',
    titreKey: 'toConfirm',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'PB',
    photo: '/intervenant4.png',
    nom: 'Expert Partenaire B',
    titreKey: 'toConfirm',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'RA',
    photo: '/intervenant5.png',
    nom: 'Expert Recruté A',
    titreKey: 'toConfirm',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'WO',
    photo: '/intervenant2.png',
    nom: 'Dr. William ODAH',
    titreKey: 'odahTitre',
    organisation: 'CRF Perfection',
    bioKey: 'odahBio',
  },
  {
    initiales: 'RB',
    photo: '/intervenant6.png',
    nom: 'Expert Recruté B',
    titreKey: 'toConfirm',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'MB',
    photo: '/marc.png',
    nom: 'Marc Biegniébé',
    titre: 'Directeur Général',
    organisation: 'ANAXAR',
    bioKey: 'biegniebeBio',
  },
  {
    initiales: 'PC',
    photo: '/intervenant7.png',
    nom: 'Expert Partenaire C',
    titreKey: 'toConfirm',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'RC',
    photo: '/intervenant8.png',
    nom: 'Expert Recruté C',
    titreKey: 'toConfirm',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'RT',
    photo: '/renatoint.png',
    nom: 'Rénato TCHOBO',
    titreKey: 'tchoboTitre',
    organisation: 'CRF Perfection',
    bioKey: 'tchoboBio',
  },
]

const Intervenants = () => {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState(null)

  // Résout titre/organisation/bio : soit la valeur statique fixe (bios confirmées),
  // soit une clé i18n à traduire (placeholders "À confirmer" / "Biographie à venir")
  const resolve = (p) => ({
    ...p,
    titre: p.titre ?? t(`intervenants.${p.titreKey}`),
    organisation: p.organisation ?? t(`intervenants.${p.organisationKey}`),
    bio: p.bio ?? t(`intervenants.${p.bioKey}`),
  })

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
            {t('intervenants.eyebrow')}
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 900,
            color: '#000e91',
            margin: '0 0 18px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            {t('intervenants.title')}
          </h2>
          <p style={{
            fontSize: 16, color: '#555',
            maxWidth: 560, margin: '0 auto', lineHeight: 1.7,
          }}>
            {t('intervenants.subtitle')}
          </p>
        </div>

        {/* Grille */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 28,
        }}>
          {intervenants.map((raw, i) => {
            const p = resolve(raw)
            return (
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
                    {t('intervenants.readBio')}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0073f4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                </div>
                </div>
              </div>
            )
          })}
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