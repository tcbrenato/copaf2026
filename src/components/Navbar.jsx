import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: scrolled ? '10px 60px' : '20px 60px',
    // Fond Bleu Nuit par défaut
    background: '#000e91', 
    boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.2)' : 'none',
    borderBottom: '1px solid rgba(0, 115, 244, 0.3)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  const linkStyle = {
    color: '#FFFFFF', // Texte Blanc
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textDecoration: 'none',
    opacity: 0.85,
    transition: 'all 0.3s'
  }

  return (
    <nav style={navStyle}>
      {/* Logo Texte en Blanc */}
      <div style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div style={{ 
          fontFamily: 'Cormorant Garamond, serif', 
          fontSize: 26, 
          fontWeight: 700, 
          color: '#FFFFFF',
          lineHeight: 1
        }}>
          COPAF<span style={{ color: '#0073f4' }}>.</span>
        </div>
        <div style={{ 
          fontSize: 9, 
          color: '#0073f4', 
          letterSpacing: 3, 
          textTransform: 'uppercase',
          fontWeight: 700,
          marginTop: 2
        }}>
          Dubaï 2026
        </div>
      </div>

      {/* Menu - Liens Blancs */}
      <ul style={{ 
        display: 'flex', 
        gap: '40px', 
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
        {[
          { label: 'À Propos', to: 'about' },
          { label: 'Programme', to: 'programme' },
          { label: 'Modules', to: 'modules' },
          { label: 'Contact', to: 'inscription' },
        ].map(item => (
          <li key={item.to}>
            <Link
              to={item.to}
              smooth={true}
              duration={600}
              offset={-80}
              style={linkStyle}
              onMouseEnter={e => {
                e.target.style.color = '#0073f4';
                e.target.style.opacity = '1';
              }}
              onMouseLeave={e => {
                e.target.style.color = '#FFFFFF';
                e.target.style.opacity = '0.85';
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Bouton CTA - Blanc avec texte Bleu pour trancher */}
      <Link to="inscription" smooth={true} duration={600} offset={-80}>
        <button style={{
          background: '#FFFFFF', 
          color: '#000e91',
          border: 'none', 
          padding: '12px 24px', 
          borderRadius: 6,
          fontFamily: 'Outfit, sans-serif', 
          fontWeight: 700, 
          fontSize: 12,
          letterSpacing: 1.5, 
          textTransform: 'uppercase', 
          cursor: 'pointer',
          transition: 'all 0.3s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
          onMouseEnter={e => {
            e.target.style.background = '#0073f4';
            e.target.style.color = '#FFFFFF';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.target.style.background = '#FFFFFF';
            e.target.style.color = '#000e91';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          S'inscrire
        </button>
      </Link>
    </nav>
  )
}

export default Navbar