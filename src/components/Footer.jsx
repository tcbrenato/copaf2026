import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()
  const contacts = [
    {
      text: t('contact.sectionOneText'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      text: '+229 01 69 30 30 19',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      ),
    },
    {
      text: '+1 (240) 978-4155',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      ),
    },
    {
      text: 'contact@copaf-ports.com',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      text: 'contact@crfperfection.pro',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ]

  const socials = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/crfperfection/',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/share/1CkmqRu9Yj/?mibextid=wwXIfr',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.35A21 21 0 0 0 14.2 4.2c-2.3 0-3.9 1.4-3.9 4v2.3H7.9v3H10.3V21h3.2Z" />
        </svg>
      ),
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/crf_perfection?igsh=cWkwZGIwYWdraHZw&utm_source=qr',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  ]

  // Liste complète des 26 pays uniques (AGPAOC + UAPNA, sans doublon)
  const memberFlags = [
    { code: 'dz', name: 'Algérie' },
    { code: 'ao', name: 'Angola' },
    { code: 'bj', name: 'Bénin' },
    { code: 'cm', name: 'Cameroun' },
    { code: 'cv', name: 'Cap-Vert' },
    { code: 'cg', name: 'Congo' },
    { code: 'ci', name: 'Côte d\'Ivoire' },
    { code: 'eg', name: 'Égypte' },
    { code: 'ga', name: 'Gabon' },
    { code: 'gm', name: 'Gambie' },
    { code: 'gh', name: 'Ghana' },
    { code: 'gn', name: 'Guinée' },
    { code: 'gw', name: 'Guinée-Bissau' },
    { code: 'gq', name: 'Guinée Équatoriale' },
    { code: 'lr', name: 'Libéria' },
    { code: 'ly', name: 'Libye' },
    { code: 'ma', name: 'Maroc' },
    { code: 'mr', name: 'Mauritanie' },
    { code: 'ng', name: 'Nigéria' },
    { code: 'cd', name: 'République Démocratique du Congo' },
    { code: 'st', name: 'São Tomé-et-Príncipe' },
    { code: 'sn', name: 'Sénégal' },
    { code: 'sl', name: 'Sierra Leone' },
    { code: 'sd', name: 'Soudan' },
    { code: 'tg', name: 'Togo' },
    { code: 'tn', name: 'Tunisie' },
  ]

  return (
    <footer style={{
      background: '#0a1128',
      borderTop: '1px solid rgba(0,115,244,0.2)',
      padding: 'clamp(56px, 8vw, 76px) clamp(20px, 5vw, 60px) clamp(32px, 5vw, 48px)',
      fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
      color: '#FFFFFF',
    }}>

      {/* Bandeau des logos organisateurs & partenaires */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14,
        padding: '14px 22px', background: '#FFFFFF', borderRadius: 12,
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        maxWidth: 620, margin: '0 auto clamp(30px, 5vw, 40px)',
      }}>
        {[
          { src: '/logocrf.png', alt: 'CRF Perfection' },
          { src: '/logocopaf.png', alt: 'COPAF' },
          { src: '/logoagpaoc.png', alt: 'AGPAOC' },
          { src: '/uapna.png', alt: 'UAPNA' },
          { src: '/ANP.png', alt: 'ANP' },
        ].map((logo, i) => (
          <div key={logo.alt} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {i > 0 && <div style={{ width: 1, height: 26, background: 'rgba(0,0,0,0.12)' }} />}
            <img src={logo.src} alt={logo.alt} style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          </div>
        ))}
      </div>

      {/* Mini-cercles des drapeaux des 26 pays membres uniques */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8,
        maxWidth: 1000, margin: '0 auto clamp(36px, 5vw, 48px)',
        alignItems: 'center',
      }}>
        {memberFlags.map((flag) => (
          <div 
            key={flag.code} 
            title={flag.name}
            style={{
              width: 26, height: 26, borderRadius: '50%', overflow: 'hidden',
              border: '1.5px solid rgba(0,115,244,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#111',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src={`https://flagcdn.com/w40/${flag.code}.png`} 
              alt={flag.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {/* Grille principale alignée à gauche pour un look institutionnel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'clamp(36px, 4vw, 56px)',
        marginBottom: 'clamp(48px, 6vw, 64px)',
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'left',
      }} className="footer-grid">

        {/* Colonne 1 : Logo & desc */}
        <div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(22px, 3vw, 26px)',
            fontWeight: 700, letterSpacing: 3, marginBottom: 6, color: '#FFFFFF'
          }}>
            {t('footer.title')} <span style={{ color: '#0073f4' }}>2026</span>
          </div>
          <div style={{
            fontSize: 11, color: '#0073f4',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16,
            fontWeight: 600,
          }}>
            {t('footer.tagline')}
          </div>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
            margin: '0 0 16px 0',
          }}>
            {t('footer.description')}
          </p>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 18 }}>
            {t('footer.organizer')}
          </div>

          {/* Réseaux sociaux */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: 34, height: 34,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,115,244,0.08)',
                  border: '1px solid rgba(0,115,244,0.25)',
                  color: '#0073f4',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0073f4'
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = '#0073f4'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,115,244,0.08)'
                  e.currentTarget.style.color = '#0073f4'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(0,115,244,0.25)'
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Colonne 2 : Navigation */}
        <div>
          <div style={{
            fontSize: 12, color: '#0073f4', fontWeight: 700,
            letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 20
          }}>
            {t('footer.navigationTitle')}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {t('footer.navLinks', { returnObjects: true }).map((link, i) => (
              <li key={i} style={{ marginBottom: 10 }}>
                <a
                  href={`#${link.toLowerCase().replace('à ', '').replace(/\s+/g, '-')}`}
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none', transition: 'color 0.2s ease, padding-left 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#0073f4'
                    e.currentTarget.style.paddingLeft = '4px'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    e.currentTarget.style.paddingLeft = '0px'
                  }}
                >
                  {link}
                </a>
              </li>
            ))}
            <li style={{ marginBottom: 10 }}>
              <a
                href="/actualites"
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none', transition: 'color 0.2s ease, padding-left 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#0073f4'
                  e.currentTarget.style.paddingLeft = '4px'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                  e.currentTarget.style.paddingLeft = '0px'
                }}
              >
                Actualités
              </a>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Contact */}
        <div>
          <div style={{
            fontSize: 12, color: '#0073f4', fontWeight: 700,
            letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 20
          }}>
            {t('footer.contactTitle')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10,
                fontSize: 13,
                color: 'rgba(255,255,255,0.65)',
                alignItems: 'flex-start',
                wordBreak: 'break-word',
              }}>
                <span style={{
                  flexShrink: 0,
                  width: 24, height: 24,
                  marginTop: 1,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,115,244,0.1)',
                  color: '#0073f4',
                }}>
                  {c.icon}
                </span>
                <span style={{ textAlign: 'left', lineHeight: 1.4 }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Barre du bas institutionnelle */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <span>{t('footer.copyright')}</span>
          <span>•</span>
          <span>{t('footer.location')}</span>
        </div>
        
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <a href="/mentions-legales" style={{ color: '#0073f4', textDecoration: 'none' }}>Mentions légales</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <a href="/politique-confidentialite" style={{ color: '#0073f4', textDecoration: 'none' }}>Politique de confidentialité</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer