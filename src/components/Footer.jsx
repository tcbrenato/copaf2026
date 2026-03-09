const Footer = () => {
  return (
    <footer style={{
      background: '#00072e',
      borderTop: '1px solid rgba(0,115,244,0.2)',
      padding: '60px 60px 30px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

        {/* Logo & desc */}
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, letterSpacing: 4, marginBottom: 6 }}>
            COPAF <span style={{ color: '#0073f4' }}>2026</span>
          </div>
          <div style={{ fontSize: 12, color: '#0073f4', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            La Performance des Ports Africains
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 320 }}>
            La Conférence Officielle sur les Ports Africains et la Formation. Une plateforme stratégique pour façonner l'avenir portuaire africain.
          </p>
          <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Organisé par <span style={{ color: '#0073f4', fontWeight: 700 }}>CRF Perfection</span>
          </div>
        </div>

        {/* Liens */}
        <div>
          <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
            Navigation
          </div>
          {['À Propos', 'Programme', 'Modules', 'Inscription'].map((link, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <a href={`#${link.toLowerCase().replace('à ', '').replace(' ', '')}`}
                style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#0073f4'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              >
                {link}
              </a>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
            Contact
          </div>
          {[
            { icon: '📍', text: 'Bénin · Côte d\'Ivoire · Togo · USA' },
            { icon: '📱', text: '+229 01 97 77 57 98' },
            { icon: '🇺🇸', text: '+1 (240) 978-4155' },
            { icon: '✉️', text: 'contact@crfperfection.pro' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              <span>{c.icon}</span> {c.text}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          © 2026 COPAF — CRF Perfection. Tous droits réservés.
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Dubaï, Émirats Arabes Unis · 15–17 Septembre 2026
        </div>
      </div>
    </footer>
  )
}

export default Footer