import Navbar from '../components/Navbar'

const steps = [
  {
    num: '01',
    title: 'Votre fiche sur le site COPAF',
    color: '#0073f4',
    desc: 'Dès validation de votre demande, une page dédiée est créée sur le site officiel COPAF avec votre logo, description, liens et contacts.',
    details: ['Logo + nom de l\'entreprise', 'Description de vos produits/services', 'Lien vers votre site web', 'Coordonnées de contact', 'QR code dédié'],
  },
  {
    num: '02',
    title: 'Contenu sur les tablettes',
    color: '#FFD700',
    desc: 'Les participants reçoivent des tablettes préchargées avec vos contenus. Chaque participant aura accès à votre espace exposant directement depuis la tablette.',
    details: ['PDF / brochures de vos produits', 'Vidéo de présentation (formules Avancée & Premium)', 'Feuilles de route et ressources', 'Accès à votre fiche exposant', 'QR code vers votre site web'],
  },
  {
    num: '03',
    title: 'Session pitch / démo',
    color: '#00cc88',
    desc: 'Les formules Avancée et Premium incluent une session de présentation en direct pendant la conférence devant tous les participants.',
    details: ['10 à 15 minutes de présentation', 'Démonstration de vos solutions', 'Session questions/réponses', 'Visible par tous les participants', 'Enregistrement disponible (formule Premium)'],
  },
  {
    num: '04',
    title: 'Visibilité post-conférence',
    color: '#ff6b9d',
    desc: 'Votre présence ne s\'arrête pas à la conférence. Votre fiche reste en ligne sur le site COPAF et vos contenus restent accessibles.',
    details: ['Fiche maintenue 12 mois sur le site', 'Accès aux actes de la conférence', 'Réseau des participants conservé', 'Données de consultation disponibles', 'Possibilité de renouvellement'],
  },
]

const comparaison = [
  { feature: 'Fiche sur le site COPAF', essentielle: true, avancee: true, premium: true },
  { feature: 'Logo + description + lien', essentielle: true, avancee: true, premium: true },
  { feature: 'QR code programme numérique', essentielle: true, avancee: true, premium: true },
  { feature: '1 PDF/brochure sur tablettes', essentielle: true, avancee: true, premium: true },
  { feature: 'Vidéo de présentation (5 min)', essentielle: false, avancee: true, premium: true },
  { feature: 'Session pitch 10–15 min', essentielle: false, avancee: true, premium: true },
  { feature: 'Badge participant inclus', essentielle: false, avancee: '1', premium: '2' },
  { feature: 'Page dédiée sur le site', essentielle: false, avancee: true, premium: true },
  { feature: 'Démonstration produit 15 min', essentielle: false, avancee: false, premium: true },
  { feature: 'Contenu prioritaire tablettes', essentielle: false, avancee: false, premium: true },
  { feature: 'Mise en avant page d\'accueil', essentielle: false, avancee: false, premium: true },
]

const CheckIcon = ({ ok, val }) => {
  if (val && typeof val === 'string') return <span style={{ fontSize: 13, fontWeight: 700, color: '#00cc88' }}>{val}</span>
  if (ok) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(0,204,136,0.15)" />
      <polyline points="5 10 8 13 15 7" stroke="#00cc88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.04)" />
      <line x1="7" y1="7" x2="13" y2="13" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="7" x2="7" y2="13" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const ExpositionDigitale = () => {
  return (
    <div style={{
      background: '#060a14', minHeight: '100vh',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#FFFFFF',
    }}>
      <Navbar />

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(160deg, #060a14 0%, #000e91 70%, #0073f4 100%)',
        padding: 'clamp(90px, 14vw, 150px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 100px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(0,115,244,0.07)', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 100, padding: '7px 22px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            💻 Exposition Digitale COPAF 2026
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 54px)', fontWeight: 900, marginBottom: 18, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Comment fonctionne<br />
          <span style={{ color: '#0073f4' }}>l'exposition digitale ?</span>
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.8 }}>
          Pas de stand physique — une présence digitale puissante sur le site COPAF et sur les tablettes distribuées aux 500+ participants.
        </p>
        <a href="/partenariats" style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #000e91, #0073f4)',
          color: '#FFFFFF', textDecoration: 'none',
          padding: '14px 32px', borderRadius: 12,
          fontWeight: 800, fontSize: 14, letterSpacing: 1,
          boxShadow: '0 8px 28px rgba(0,115,244,0.35)',
        }}>
          Devenir Exposant →
        </a>
      </div>

      <div style={{ padding: 'clamp(50px, 8vw, 90px) clamp(20px, 5vw, 60px)' }}>

        {/* ÉTAPES */}
        <div style={{ maxWidth: 900, margin: '0 auto 80px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 34px)', fontWeight: 900, marginBottom: 12 }}>
            Votre visibilité en <span style={{ color: '#0073f4' }}>4 étapes</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 52 }}>
            De la validation de votre dossier jusqu'après la conférence
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {steps.map((step, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 24, alignItems: 'start',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18, padding: 'clamp(20px, 4vw, 32px)',
              }}>
                {/* Numéro */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `rgba(${step.color === '#0073f4' ? '0,115,244' : step.color === '#FFD700' ? '255,215,0' : step.color === '#00cc88' ? '0,204,136' : '255,107,157'},0.15)`,
                  border: `1.5px solid ${step.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: step.color }}>{step.num}</span>
                </div>

                {/* Contenu */}
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: step.color, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 16 }}>{step.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {step.details.map((d, i) => (
                      <span key={i} style={{
                        background: `rgba(${step.color === '#0073f4' ? '0,115,244' : step.color === '#FFD700' ? '255,215,0' : step.color === '#00cc88' ? '0,204,136' : '255,107,157'},0.08)`,
                        border: `1px solid rgba(${step.color === '#0073f4' ? '0,115,244' : step.color === '#FFD700' ? '255,215,0' : step.color === '#00cc88' ? '0,204,136' : '255,107,157'},0.2)`,
                        borderRadius: 100, padding: '5px 14px',
                        fontSize: 12, color: step.color, fontWeight: 600,
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABLETTES — focus visuel */}
        <div style={{ maxWidth: 800, margin: '0 auto 80px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #000e91 0%, #0073f4 100%)',
            borderRadius: 24, padding: 'clamp(32px, 5vw, 52px)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 32, alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                Les tablettes COPAF
              </div>
              <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
                500+ tablettes préchargées distribuées aux participants
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.8 }}>
                Chaque participant reçoit une tablette contenant les ressources de la conférence, le programme, les actes et les fiches exposants. Votre contenu est accessible à tout moment.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '📄', label: 'PDF & Brochures', desc: 'Vos documents directement accessibles' },
                { icon: '🎥', label: 'Vidéos', desc: 'Présentation et démonstrations' },
                { icon: '🌐', label: 'Site COPAF', desc: 'Accès à votre fiche exposant en ligne' },
                { icon: '📱', label: 'QR Codes', desc: 'Redirection vers vos ressources' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px',
                }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLEAU COMPARATIF */}
        <div style={{ maxWidth: 860, margin: '0 auto 80px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, marginBottom: 12 }}>
            Comparatif des <span style={{ color: '#0073f4' }}>formules</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 40 }}>
            Choisissez la formule adaptée à vos objectifs
          </p>

          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr repeat(3, 120px)',
              background: 'rgba(0,115,244,0.1)', borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '16px 24px', gap: 8, alignItems: 'center',
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Fonctionnalité</div>
              {[
                { label: 'Essentielle', price: '500 €', color: '#0073f4' },
                { label: 'Avancée', price: '1 200 €', color: '#FFD700' },
                { label: 'Premium', price: '2 500 €', color: '#00cc88' },
              ].map((h, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: h.color }}>{h.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{h.price}</div>
                </div>
              ))}
            </div>

            {/* Lignes */}
            {comparaison.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr repeat(3, 120px)',
                padding: '14px 24px', gap: 8, alignItems: 'center',
                borderBottom: i < comparaison.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{row.feature}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><CheckIcon ok={row.essentielle} val={typeof row.essentielle === 'string' ? row.essentielle : null} /></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><CheckIcon ok={row.avancee} val={typeof row.avancee === 'string' ? row.avancee : null} /></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><CheckIcon ok={row.premium} val={typeof row.premium === 'string' ? row.premium : null} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 900, marginBottom: 12 }}>
            Prêt à exposer vos solutions ?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 28 }}>
            Soumettez votre demande — notre équipe vous répond sous 48h.
          </p>
          <a href="/partenariats" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #000e91, #0073f4)',
            color: '#FFFFFF', textDecoration: 'none',
            padding: '16px 40px', borderRadius: 12,
            fontWeight: 800, fontSize: 15, letterSpacing: 1,
            boxShadow: '0 8px 28px rgba(0,115,244,0.35)',
          }}>
            Choisir ma formule exposant →
          </a>
        </div>

      </div>
    </div>
  )
}

export default ExpositionDigitale