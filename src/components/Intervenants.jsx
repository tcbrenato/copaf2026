import React, { useState } from 'react'

const intervenants = [
  {
    initiales: 'I1',
    nom: 'Intervenant 1',
    titre: 'Titre du poste',
    organisation: 'Organisation',
    categorie: 'Conférencier',
    bio: 'Courte biographie de l\'intervenant.',
  },
  {
    initiales: 'I2',
    nom: 'Intervenant 2',
    titre: 'Titre du poste',
    organisation: 'Organisation',
    categorie: 'Panelistes',
    bio: 'Courte biographie de l\'intervenant.',
  },
  {
    initiales: 'I3',
    nom: 'Intervenant 3',
    titre: 'Titre du poste',
    organisation: 'Organisation',
    categorie: 'Expert',
    bio: 'Courte biographie de l\'intervenant.',
  },
  {
    initiales: 'I4',
    nom: 'Intervenant 4',
    titre: 'Titre du poste',
    organisation: 'Organisation',
    categorie: 'Conférencier',
    bio: 'Courte biographie de l\'intervenant.',
  },
  {
    initiales: 'I5',
    nom: 'Intervenant 5',
    titre: 'Titre du poste',
    organisation: 'Organisation',
    categorie: 'Expert',
    bio: 'Courte biographie de l\'intervenant.',
  },
  {
    initiales: 'I6',
    nom: 'Intervenant 6',
    titre: 'Titre du poste',
    organisation: 'Organisation',
    categorie: 'Panelistes',
    bio: 'Courte biographie de l\'intervenant.',
  },
]

const categorieStyle = {
  Conférencier: { bg: '#e8ecff', color: '#000e91' },
  Panelistes:  { bg: '#e8f6ff', color: '#005fa3' },
  Expert:        { bg: '#fff4e8', color: '#a35f00' },
}

const filtres = ['Tous', 'Conférencier', 'Panelistes', 'Expert']

const Intervenants = () => {
  const [actif, setActif] = useState('Tous')

  const visibles = actif === 'Tous'
    ? intervenants
    : intervenants.filter(i => i.categorie === actif)

  return (
    <section id="formateurs" style={{
      padding: 'clamp(80px, 10vw, 130px) clamp(20px, 5vw, 80px)',
      background: '#f8f9ff',
      fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

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
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 700,
            color: '#000e91',
            margin: '0 0 18px',
            lineHeight: 1.1,
          }}>
            Intervenants
          </h2>
          <p style={{
            fontSize: 16, color: '#555',
            maxWidth: 560, margin: '0 auto', lineHeight: 1.7,
          }}>
            Experts, conférenciers et Panelistes réunis pour partager leurs connaissances
            sur les enjeux portuaires en Afrique.
          </p>
        </div>

        {/* Filtres */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: 10, marginBottom: 48, flexWrap: 'wrap',
        }}>
          {filtres.map(f => (
            <button
              key={f}
              onClick={() => setActif(f)}
              style={{
                padding: '8px 22px',
                borderRadius: 30,
                border: actif === f ? '2px solid #000e91' : '2px solid rgba(0,14,145,0.15)',
                background: actif === f ? '#000e91' : 'transparent',
                color: actif === f ? '#FFFFFF' : '#000e91',
                fontSize: 12, fontWeight: 700,
                letterSpacing: 1.2, textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grille */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 28,
        }}>
          {visibles.map((p, i) => {
            const cat = categorieStyle[p.categorie]
            return (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,14,145,0.08)',
                  boxShadow: '0 4px 20px rgba(0,14,145,0.06)',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,14,145,0.13)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,14,145,0.06)'
                }}
              >
                {/* Bandeau supérieur */}
                <div style={{ height: 6, background: 'linear-gradient(90deg, #000e91, #0073f4)' }} />

                <div style={{ padding: '28px 28px 24px' }}>
                  {/* Avatar + badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{
                      width: 68, height: 68,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #000e91, #0073f4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontSize: 18, fontWeight: 700,
                      fontFamily: "'Cormorant Garamond', serif",
                      letterSpacing: 1, flexShrink: 0,
                    }}>
                      {p.initiales}
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: 1.2, textTransform: 'uppercase',
                      background: cat.bg, color: cat.color,
                    }}>
                      {p.categorie}
                    </span>
                  </div>

                  {/* Nom & titre */}
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 22, fontWeight: 700,
                    color: '#000e91', margin: '0 0 4px', lineHeight: 1.2,
                  }}>
                    {p.nom}
                  </h3>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: '#0073f4', textTransform: 'uppercase',
                    letterSpacing: 0.8, marginBottom: 4,
                  }}>
                    {p.titre}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 16, letterSpacing: 0.3 }}>
                    {p.organisation}
                  </div>

                  <div style={{ height: 1, background: 'rgba(0,14,145,0.07)', marginBottom: 16 }} />

                  <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.7, margin: 0 }}>
                    {p.bio}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default Intervenants