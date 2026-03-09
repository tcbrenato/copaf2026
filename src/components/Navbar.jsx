import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { label: 'À Propos', to: 'about' },
    { label: 'Programme', to: 'programme' },
    { label: 'Modules', to: 'modules' },
    { label: 'Contact', to: 'inscription' },
  ]

  const logoHeight = scrolled ? 36 : 44

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: scrolled ? '10px 24px' : '16px 24px',
        background: '#000e91',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.2)' : 'none',
        borderBottom: '1px solid rgba(0,115,244,0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>

        {/* GAUCHE : Logo COPAF + texte + Logo 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>

          {/* Logo 1 */}
          <img
            src="https://i.ibb.co/WNB5fLWD/LOGO-COPAF.png"
            alt="COPAF Logo"
            style={{ height: logoHeight, width: 'auto', objectFit: 'contain', transition: 'height 0.4s' }}
          />

          {/* Texte COPAF */}
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
              COPAF<span style={{ color: '#0073f4' }}>.</span>
            </div>
            <div style={{ fontSize: 9, color: '#0073f4', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
              Dubaï 2026
            </div>
          </div>

          {/* Séparateur vertical */}
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

          {/* Logo 2 */}
          <img
            src="https://i.ibb.co/j90m5XS2/agpaoc-0.jpg"
            alt="Logo partenaire"
            style={{ height: logoHeight, width: 'auto', objectFit: 'contain', transition: 'height 0.4s' }}
          />
        </div>

        {/* CENTRE : Liens de navigation */}
        <ul className="nav-links" style={{ display: 'flex', gap: 36, listStyle: 'none', margin: 0, padding: 0 }}>
          {links.map(item => (
            <li key={item.to}>
              <Link to={item.to} smooth={true} duration={600} offset={-80}
                style={{ color: '#FFFFFF', cursor: 'pointer', fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none', opacity: 0.85, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.target.style.color = '#0073f4'; e.target.style.opacity = '1' }}
                onMouseLeave={e => { e.target.style.color = '#FFFFFF'; e.target.style.opacity = '0.85' }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* DROITE : Bouton S'inscrire */}
        <Link to="inscription" smooth={true} duration={600} offset={-80} className="nav-cta">
          <button style={{
            background: '#FFFFFF', color: '#000e91',
            border: 'none', padding: '11px 22px', borderRadius: 6,
            fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 12,
            letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s'
          }}
            onMouseEnter={e => { e.target.style.background = '#0073f4'; e.target.style.color = '#FFFFFF' }}
            onMouseLeave={e => { e.target.style.background = '#FFFFFF'; e.target.style.color = '#000e91' }}
          >
            S'inscrire
          </button>
        </Link>

        {/* Burger — mobile */}
        <button
          className="burger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'none', flexDirection: 'column',
            gap: 5, padding: 4
          }}
        >
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Menu mobile déroulant */}
      <div style={{
        position: 'fixed', top: 56, left: 0, right: 0, zIndex: 998,
        background: '#000e91',
        borderBottom: '1px solid rgba(0,115,244,0.3)',
        padding: menuOpen ? '16px 24px 24px' : '0 24px',
        maxHeight: menuOpen ? '400px' : '0',
        overflow: 'hidden',
        transition: 'all 0.35s ease',
        display: 'none'
      }} className="mobile-menu">
        {links.map((item, i) => (
          <Link key={item.to} to={item.to} smooth={true} duration={600} offset={-80}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block', color: 'rgba(255,255,255,0.85)',
              fontSize: 15, fontWeight: 600, letterSpacing: 1,
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '14px 0',
              borderBottom: i < links.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              cursor: 'pointer'
            }}
          >
            {item.label}
          </Link>
        ))}
        <Link to="inscription" smooth={true} duration={600} offset={-80} onClick={() => setMenuOpen(false)}>
          <button style={{
            marginTop: 16, width: '100%',
            background: '#0073f4', color: '#FFFFFF',
            border: 'none', padding: '14px', borderRadius: 8,
            fontFamily: 'Roboto', fontWeight: 700, fontSize: 14,
            letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
          }}>
            S'inscrire Maintenant
          </button>
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-cta { display: none !important; }
          .burger { display: flex !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </>
  )
}

export default Navbar