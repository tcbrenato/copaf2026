import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const intervenants = [
  {
    initiales: 'MA',
    photo: '/modeste.jpg',
    nom: 'M. Modeste ABIALA',
    titre: 'Directeur des Solutions Maritimes',
    organisation: 'AGL Bénin (ex Groupe Bolloré)',
    bioKey: 'abialaBio',
  },
  {
    initiales: 'EM',
    photo: '/intervenant2.jpg',
    nom: 'Expert Maroc',
    titre: 'Atelier : Modèle économique de développement d\'un projet technologique portuaire',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'WO',
    photo: '/odah.jpg',
    nom: 'Dr William ODAH',
    titre: 'Directeur Général CRF Perfection & Directeur du Comité scientifique de la COPAF 2026',
    organisation: '',
    bioKey: 'odahBio',
  },
  {
    initiales: 'BB',
    photo: '/babel.jpg',
    nom: 'Mme Babel BALSOMI',
    titre: 'CEO & Experte en Cybersécurité Offensive et Transformation Digitale',
    organisation: 'Hiero Digital International',
    bioKey: 'balsomiBio',
  },
  {
    initiales: 'EM',
    photo: '/intervenant3.jpg',
    nom: 'Expert Maroc',
    titre: 'Panel : Sécurité & Sûreté — détection automatique des anomalies',
    organisationKey: 'toConfirm',
    bioKey: 'bioComingSoon',
  },
  {
    initiales: 'MB',
    photo: '/marc.jpg',
    nom: 'Marc BIEGNIÉBÉ',
    titre: 'Directeur Général',
    organisation: 'ANAXAR',
    bioKey: 'biegniebeBio',
  },
  {
    initiales: 'RT',
    photo: '/renato.jpg',
    nom: 'M. Rénato TCHOBO',
    titreKey: 'tchoboTitre',
    organisation: 'CRF Perfection',
    bioKey: 'tchoboBio',
  },
]

const Intervenants = () => {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState(null)

  const resolve = (p) => ({
    ...p,
    titre: p.titre ?? t(`intervenants.${p.titreKey}`),
    organisation: p.organisation ?? t(`intervenants.${p.organisationKey}`),
    bio: p.bio ?? t(`intervenants.${p.bioKey}`),
  })

  return (
    <section id="formateurs" style={{
      padding: 'clamp(80px, 10vw, 130px) clamp(20px, 5vw, 40px)',
      fontFamily: "'Inter', 'Roboto', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'url(/bg2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <style>{`
        .interv-card { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .interv-bio-btn {
          margin: 16px 22px 22px;
          padding: 12px 0;
          background: #000E91;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .interv-bio-btn:hover { background: #0073F4; }
      `}</style>
      {/* Overlay subtil */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(248,249,255,0.95) 0%, rgba(240,244,255,0.98) 100%)',
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '50px',
            background: 'rgba(0, 115, 244, 0.1)',
            fontSize: 12, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: '#0073f4', marginBottom: 16,
          }}>
            {t('intervenants.eyebrow')}
          </span>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 46px)',
            fontWeight: 800,
            color: '#0a1128',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}>
            {t('intervenants.title')}
          </h2>
          <p style={{
            fontSize: 16, color: '#475569',
            maxWidth: 600, margin: '0 auto', lineHeight: 1.6,
          }}>
            {t('intervenants.subtitle')}
          </p>
        </div>

        {/* Grille des intervenants */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 30,
        }}>
          {intervenants.map((raw, i) => {
            const p = resolve(raw)
            return (
              <div
                key={i}
                className="interv-card"
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 14, 145, 0.06)',
                  boxShadow: '0 10px 30px -5px rgba(0, 14, 145, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 115, 244, 0.18)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(0, 14, 145, 0.05)'
                }}
              >
                {/* Photo */}
                <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt={p.nom}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'linear-gradient(135deg, #000e91, #0073f4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontSize: 40, fontWeight: 700,
                    }}>
                      {p.initiales}
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div style={{ padding: '20px 22px 0', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{
                    fontSize: 18, fontWeight: 800,
                    color: '#000e91', margin: '0 0 8px',
                  }}>
                    {p.nom}
                  </h3>

                  <div style={{
                    fontSize: 13.5, fontWeight: 500,
                    color: '#475569',
                    lineHeight: 1.5,
                    marginBottom: 4,
                  }}>
                    {p.titre}
                  </div>

                  <div style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500, marginBottom: 18 }}>
                    {p.organisation}
                  </div>
                </div>

                {/* Barre d'accent */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, #000E91, #0073F4)' }} />

                {/* CTA Biographie */}
                <button
                  type="button"
                  className="interv-bio-btn"
                  onClick={() => setActiveModal(p)}
                >
                  {t('intervenants.readBio')}
                </button>
              </div>
            )
          })}
        </div>

        {/* Modal Améliorée — rendue via portail pour échapper au contexte d'empilement local
            (sinon le header fixe, avec le même z-index, passe par-dessus sur mobile). */}
        {activeModal && createPortal((
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10, 17, 40, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn 0.2s ease',
          }} onClick={() => setActiveModal(null)}>
            <div 
              style={{
                background: '#fff',
                borderRadius: 24,
                width: '100%',
                maxWidth: 540,
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  position: 'absolute', top: 16, right: 16, zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0a1128', fontWeight: 'bold',
                }}
              >
                ✕
              </button>

              <div style={{ width: '100%', height: 260, background: '#f1f5f9', position: 'relative' }}>
                {activeModal.photo ? (
                  <img
                    src={activeModal.photo}
                    alt={activeModal.nom}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

              <div style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>
                  {activeModal.nom}
                </h3>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0073f4', marginBottom: 4 }}>
                  {activeModal.titre}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                  {activeModal.organisation}
                </div>
                <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, margin: 0 }}>
                  {activeModal.bio}
                </p>
              </div>
            </div>
          </div>
        ), document.body)}

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  )
}

export default Intervenants 