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

  return (
    <footer style={{
      background: '#00072e',
      borderTop: '1px solid rgba(0,115,244,0.2)',
      padding: 'clamp(48px, 7vw, 68px) clamp(20px, 5vw, 60px) clamp(24px, 4vw, 30px)',
      textAlign: 'center',
      fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
    }}>

      {/* Grille principale */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: 'clamp(36px, 5vw, 56px)',
        marginBottom: 'clamp(36px, 5vw, 52px)',
        maxWidth: 1100,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>

        {/* Logo & desc */}
        <div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 700, letterSpacing: 4, marginBottom: 8, color: '#FFFFFF'
          }}>
            {t('footer.title')} <span style={{ color: '#0073f4' }}>2026</span>
          </div>
          <div style={{
            fontSize: 12, color: '#0073f4',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18,
            fontWeight: 600,
          }}>
            {t('footer.tagline')}
          </div>
          <p style={{
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            color: 'rgba(255,255,255,0.45)', lineHeight: 1.8,
            maxWidth: 320, margin: '0 auto',
          }}>
            {t('footer.description')}
          </p>
          <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {t('footer.organizer')}
          </div>

          {/* Réseaux sociaux */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22 }}>
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: 36, height: 36,
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
                  e.currentTarget.style.transform = 'translateY(-3px)'
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

        {/* Navigation */}
        <div>
          <div style={{
            fontSize: 11, color: '#0073f4', fontWeight: 700,
            letterSpacing: 3, textTransform: 'uppercase', marginBottom: 22
          }}>
            {t('footer.navigationTitle')}
          </div>
          {t('footer.navLinks', { returnObjects: true }).map((link, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <a
                href={`#${link.toLowerCase().replace('à ', '').replace(/\s+/g, '-')}`}
                style={{
                  fontSize: 'clamp(13px, 1.8vw, 14px)',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none', transition: 'color 0.2s ease, letter-spacing 0.2s ease',
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#0073f4'
                  e.currentTarget.style.letterSpacing = '0.8px'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  e.currentTarget.style.letterSpacing = '0.3px'
                }}
              >
                {link}
              </a>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{
            fontSize: 11, color: '#0073f4', fontWeight: 700,
            letterSpacing: 3, textTransform: 'uppercase', marginBottom: 22
          }}>
            {t('footer.contactTitle')}
          </div>
          {contacts.map((c, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, marginBottom: 13,
              fontSize: 'clamp(12px, 1.8vw, 13px)',
              color: 'rgba(255,255,255,0.55)',
              alignItems: 'center',
              justifyContent: 'center',
              wordBreak: 'break-word',
            }}>
              <span style={{
                flexShrink: 0,
                width: 28, height: 28,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,115,244,0.1)',
                color: '#0073f4',
              }}>
                {c.icon}
              </span>
              <span style={{ textAlign: 'left' }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{ fontSize: 'clamp(11px, 1.6vw, 13px)', color: 'rgba(255,255,255,0.3)' }}>
          {t('footer.copyright')}
        </div>
        <div style={{ fontSize: 'clamp(11px, 1.6vw, 13px)', color: 'rgba(255,255,255,0.3)' }}>
          {t('footer.location')}
        </div>
      </div>
    </footer>
  )
}

export default Footer