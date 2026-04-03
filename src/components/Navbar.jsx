import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-scroll'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isHome = window.location.pathname === '/'

  const scrollLinks = [
    { label: 'À Propos', to: 'about' },
    { label: 'Programme', to: 'programme' },
    { label: 'Modules', to: 'modules' },
    { label: 'Contact', to: 'inscription' },
  ]

  const dropdownLinks = [
    { label: 'Sponsors', href: '/sponsors' },
    { label: 'Exposants', href: '/exposants' },
  ]

  const isDropdownActive = dropdownLinks.some(l => window.location.pathname === l.href)
  const logoHeight = scrolled ? 36 : 44

  const dropdownItemStyle = (href) => ({
    display: 'block',
    padding: '11px 20px',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textDecoration: 'none',
    color: window.location.pathname === href ? '#0073f4' : '#000e91',
    transition: 'background 0.15s, color 0.15s',
    background: 'transparent',
  })

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

        {/* GAUCHE : Bloc Logos */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 15,
          padding: '8px 20px', background: '#FFFFFF', borderRadius: 10,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.3s'
        }}>
          <a href="https://crfperfection.pro" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/logocrf.png" alt="CRF Perfection" style={{ height: logoHeight + 6, width: 'auto', objectFit: 'contain' }} />
          </a>
          <div style={{ width: 1, height: 30, background: 'rgba(0,0,0,0.15)' }} />
          <a href="https://copaf-ports.com/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/logocopaf.png" alt="COPAF Logo" style={{ height: logoHeight + 6, width: 'auto', objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: '#000e91', lineHeight: 1 }}>
                COPAF<span style={{ color: '#0073f4' }}>.</span>
              </div>
              <div style={{ fontSize: 7, color: '#0073f4', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
                COPAF 2026
              </div>
            </div>
          </a>
          <div style={{ width: 1, height: 30, background: 'rgba(0,0,0,0.15)' }} />
          <a href="https://agpaoc-pmawca.org/" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/logoagpaoc.png" alt="AGPAOC" style={{ height: logoHeight + 6, width: 'auto', objectFit: 'contain' }} />
          </a>
        </div>

        {/* CENTRE : Liens */}
        <ul className="nav-links" style={{ display: 'flex', gap: 28, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>

          {isHome && scrollLinks.map(item => (
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

          {/* Menu déroulant Partenaires */}
          <li ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: isDropdownActive ? '#0073f4' : '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                opacity: 0.85,
                transition: 'all 0.3s',
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0073f4'; e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => {
                e.currentTarget.style.color = isDropdownActive ? '#0073f4' : '#FFFFFF'
                e.currentTarget.style.opacity = '0.85'
              }}
            >
              Partenaires
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                style={{ transition: 'transform 0.25s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* ✅ CORRIGÉ : balise <a> correctement ouverte avec key sur le bon élément */}
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 14px)',
              left: '50%',
              transform: dropdownOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-6px)',
              background: '#FFFFFF',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              minWidth: 160,
              opacity: dropdownOpen ? 1 : 0,
              pointerEvents: dropdownOpen ? 'auto' : 'none',
              transition: 'opacity 0.2s, transform 0.2s',
            }}>
              {dropdownLinks.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setDropdownOpen(false)}
                  style={Object.assign({}, dropdownItemStyle(item.href), {
                    borderTop: i > 0 ? '1px solid rgba(0,14,145,0.08)' : 'none',
                  })}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.color = '#0073f4' }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = window.location.pathname === item.href ? '#0073f4' : '#000e91'
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </li>
        </ul>

        {/* DROITE : Bouton S'inscrire */}
        {isHome ? (
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
        ) : (
          <a href="/#inscription" className="nav-cta">
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
          </a>
        )}

        {/* Burger mobile */}
        <button className="burger" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: 5, padding: 4 }}>
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Menu mobile */}
      <div style={{
        position: 'fixed', top: 56, left: 0, right: 0, zIndex: 998,
        background: '#000e91', borderBottom: '1px solid rgba(0,115,244,0.3)',
        padding: menuOpen ? '16px 24px 24px' : '0 24px',
        maxHeight: menuOpen ? '500px' : '0',
        overflow: 'hidden', transition: 'all 0.35s ease', display: 'none'
      }} className="mobile-menu">

        {isHome && scrollLinks.map((item) => (
          <Link key={item.to} to={item.to} smooth={true} duration={600} offset={-80}
            onClick={() => setMenuOpen(false)}
            style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          >
            {item.label}
          </Link>
        ))}

        {/* Partenaires mobile */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 0 6px' }}>
            Partenaires
          </div>
          {dropdownLinks.map((item) => (
            <a key={item.href} href={item.href}
              style={{ display: 'block', color: window.location.pathname === item.href ? '#0073f4' : 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', padding: '10px 0 10px 16px', cursor: 'pointer' }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <a href={isHome ? '#inscription' : '/#inscription'} onClick={() => setMenuOpen(false)}>
          <button style={{
            marginTop: 16, width: '100%',
            background: '#0073f4', color: '#FFFFFF',
            border: 'none', padding: '14px', borderRadius: 8,
            fontFamily: 'Roboto', fontWeight: 700, fontSize: 14,
            letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
          }}>
            S'inscrire Maintenant
          </button>
        </a>
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