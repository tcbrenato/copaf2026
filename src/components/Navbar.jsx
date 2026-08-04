import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

const Navbar = () => {
  const [scrolled,              setScrolled]              = useState(false)
  const { t } = useTranslation()
  const [menuOpen,              setMenuOpen]              = useState(false)
  const [dropdownOpen,          setDropdownOpen]          = useState(false)
  const [conferenceOpen,        setConferenceOpen]        = useState(false)
  const [mobileConferenceOpen,  setMobileConferenceOpen]  = useState(false)
  const [mobilePartenairesOpen, setMobilePartenairesOpen] = useState(false)

  const dropdownRef     = useRef(null)
  const conferenceRef   = useRef(null)
  const dropdownTimer   = useRef(null)
  const conferenceTimer = useRef(null)

  const navigate = useNavigate()
  const isHome   = window.location.pathname === '/'

  useEffect(() => {
    const fn = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false)
        setMobileConferenceOpen(false)
        setMobilePartenairesOpen(false)
      }
    }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const openConference  = () => { clearTimeout(conferenceTimer.current); setConferenceOpen(true) }
  const closeConference = () => { conferenceTimer.current = setTimeout(() => setConferenceOpen(false), 120) }
  const openDropdown    = () => { clearTimeout(dropdownTimer.current);   setDropdownOpen(true) }
  const closeDropdown   = () => { dropdownTimer.current = setTimeout(() => setDropdownOpen(false), 120) }

  const closeMobileMenu = () => {
    setMenuOpen(false)
    setMobileConferenceOpen(false)
    setMobilePartenairesOpen(false)
  }

  const scrollTo = (id, attempts = 0) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (attempts < 15) {
      setTimeout(() => scrollTo(id, attempts + 1), 100)
    }
  }

  const handleInscription = () => {
    closeMobileMenu()
    if (isHome) {
      scrollTo('inscription')
    } else {
      navigate('/inscription')
    }
  }

  const handleContact = () => {
    closeMobileMenu()
    if (isHome) {
      scrollTo('contact')
    } else {
      window.location.href = '/#contact'
    }
  }

  const handleSection = (id) => {
    closeMobileMenu()
    setConferenceOpen(false)
    if (isHome) {
      scrollTo(id)
    } else {
      window.location.href = `/#${id}`
    }
  }

  const conferenceLinks = [
    { label: t('navbar.programme'),        id: 'programme' },
    { label: t('navbar.axes'),             id: 'axes-thematiques' },
    { label: t('navbar.intervenants'),     id: 'formateurs' },
  ]

  // ✅ CORRIGÉ : virgule mal placée supprimée
  const dropdownLinks = [
    { label: t('navbar.partnerships'),        href: '/partenariats' },
    { label: t('navbar.digitalExposition'), href: '/exposition-digitale' },
    { label: t('navbar.visit'),             href: '/visiter' },
  ]

  const isDropdownActive = dropdownLinks.some(l => window.location.pathname === l.href)
  const logoHeight       = scrolled ? 36 : 44

  const btnBase = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#FFFFFF', fontSize: 12, fontWeight: 600,
    letterSpacing: 1.5, textTransform: 'uppercase',
    opacity: 0.85, transition: 'all 0.3s', padding: 0,
    fontFamily: 'inherit',
  }

  const dropdownPanelStyle = open => ({
    position: 'absolute', top: 'calc(100% + 4px)', left: '50%',
    transform: open ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-6px)',
    background: '#FFFFFF', borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    overflow: 'hidden', minWidth: 200,
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    transition: 'opacity 0.2s, transform 0.2s', zIndex: 1100,
  })

  return (
    <>
      {/*
        NOTE : ce <nav> n'est plus en position:fixed — c'est desormais
        HeaderStack.jsx (qui englobe Navbar + FlashInfoTicker) qui gere la
        fixation en haut de l'ecran. Le nav reste donc en flux normal, mais
        visuellement identique puisque HeaderStack est lui-meme fixed en haut.
      */}
      <nav style={{
        position: 'relative', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: scrolled ? '10px 24px' : '16px 24px',
        background: '#000e91',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.2)' : 'none',
        borderBottom: '1px solid rgba(0,115,244,0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {/* LOGOS */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 15,
          padding: '8px 20px', background: '#FFFFFF', borderRadius: 10,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex' }}>
            <img src="/logocrf.png" alt="CRF" style={{ height: logoHeight + 6, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ width: 1, height: 30, background: 'rgba(0,0,0,0.15)' }} />

          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/logocopaf.png" alt="COPAF" style={{ height: logoHeight + 6, width: 'auto', objectFit: 'contain' }} />
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

          <div style={{ display: 'flex' }}>
            <img src="/logoagpaoc.png" alt="AGPAOC" style={{ height: logoHeight + 6, width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <ul className="nav-links" style={{ display: 'flex', gap: 28, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
          {!isHome && (
            <li><a href="/" style={{ ...btnBase, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0073f4'; e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.opacity = '0.85' }}>
              Accueil
            </a></li>
          )}

          {isHome && (
            <li><button style={btnBase} onClick={() => handleSection('about')}
              onMouseEnter={e => { e.currentTarget.style.color = '#0073f4'; e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.opacity = '0.85' }}>
              {t('navbar.about')}
            </button></li>
          )}

          {isHome && (
            <li ref={conferenceRef} style={{ position: 'relative' }}
              onMouseEnter={openConference} onMouseLeave={closeConference}>
              <button style={{ ...btnBase, display: 'flex', alignItems: 'center', gap: 5 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#0073f4'; e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.opacity = '0.85' }}>
                Conférence
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  style={{ transition: 'transform 0.25s', transform: conferenceOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div style={dropdownPanelStyle(conferenceOpen)} onMouseEnter={openConference} onMouseLeave={closeConference}>
                {conferenceLinks.map((item, i) => (
                  <button key={item.id} onClick={() => handleSection(item.id)} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 20px', fontSize: 12, fontWeight: 600,
                    letterSpacing: 1.5, textTransform: 'uppercase',
                    color: '#000e91', background: 'none', border: 'none',
                    borderTop: i > 0 ? '1px solid rgba(0,14,145,0.08)' : 'none',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.color = '#0073f4' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000e91' }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </li>
          )}

          {isHome && (
            <li><button style={btnBase} onClick={handleContact}
              onMouseEnter={e => { e.currentTarget.style.color = '#0073f4'; e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.opacity = '0.85' }}>
              {t('navbar.contact')}
            </button></li>
          )}

          <li ref={dropdownRef} style={{ position: 'relative' }}
            onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
            <button style={{ ...btnBase, display: 'flex', alignItems: 'center', gap: 5, color: isDropdownActive ? '#0073f4' : '#FFFFFF' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0073f4'; e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.color = isDropdownActive ? '#0073f4' : '#FFFFFF'; e.currentTarget.style.opacity = '0.85' }}>
              {t('navbar.partnerships')}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                style={{ transition: 'transform 0.25s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div style={dropdownPanelStyle(dropdownOpen)} onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
              {dropdownLinks.map((item, i) => (
                <a key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} style={{
                  display: 'block', padding: '11px 20px', fontSize: 12,
                  fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: window.location.pathname === item.href ? '#0073f4' : '#000e91',
                  borderTop: i > 0 ? '1px solid rgba(0,14,145,0.08)' : 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.color = '#0073f4' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = window.location.pathname === item.href ? '#0073f4' : '#000e91' }}>
                  {item.label}
                </a>
              ))}
            </div>
          </li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSwitcher />
          <div className="nav-cta">
            <button onClick={handleInscription} style={{
              background: '#FFFFFF', color: '#000e91', border: 'none',
              padding: '11px 22px', borderRadius: 6, fontFamily: 'Roboto, sans-serif',
              fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0073f4'; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#000e91' }}>
            {t('inscription.cta')}
          </button>
        </div>
        </div>

        <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 4 }}>
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: 25, height: 2.5, background: '#FFFFFF', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* MENU MOBILE */}
      <div className="mobile-menu" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
        background: '#000e91',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto', paddingTop: 80, paddingBottom: 32,
      }}>
        <button onClick={closeMobileMenu} style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
          padding: '8px 12px', cursor: 'pointer', color: '#FFFFFF', fontSize: 18,
        }}>✕</button>

        <div style={{ padding: '0 24px' }}>
          {!isHome && (
            <a href="/" style={mobileItemStyle()}>← {t('navbar.home')}</a>
          )}

          {isHome && (
            <button onClick={() => handleSection('about')} style={{ ...mobileItemStyle(), background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('navbar.about')}
            </button>
          )}

          {isHome && (
            <div>
              <button onClick={() => setMobileConferenceOpen(p => !p)} style={{
                ...mobileItemStyle(), display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', width: '100%',
                background: 'none', border: 'none', padding: 0,
                borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span>{t('navbar.conference')}</span>
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none"
                  style={{ transition: 'transform 0.25s', transform: mobileConferenceOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div style={{ maxHeight: mobileConferenceOpen ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                {conferenceLinks.map(item => (
                  <button key={item.id} onClick={() => handleSection(item.id)} style={{
                    ...mobileSubItemStyle(), background: 'none', border: 'none',
                    width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isHome && (
            <button onClick={handleContact} style={{ ...mobileItemStyle(), background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('navbar.contact')}
            </button>
          )}

          <div>
            <button onClick={() => setMobilePartenairesOpen(p => !p)} style={{
              ...mobileItemStyle(), display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', width: '100%',
              background: 'none', border: 'none', padding: 0,
              borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span>{t('navbar.partnerships')}</span>
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"
                style={{ transition: 'transform 0.25s', transform: mobilePartenairesOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div style={{ maxHeight: mobilePartenairesOpen ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              {dropdownLinks.map(item => (
                <a key={item.href} href={item.href} onClick={closeMobileMenu}
                  style={mobileSubItemStyle(window.location.pathname === item.href)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <button onClick={handleInscription} style={{
            display: 'block', width: '100%', marginTop: 24,
            background: '#0073f4', color: '#FFFFFF', border: 'none',
            padding: '16px', borderRadius: 8, fontFamily: 'Roboto',
            fontWeight: 700, fontSize: 14, letterSpacing: 2,
            textTransform: 'uppercase', cursor: 'pointer',
          }}>
            {t('inscription.cta')}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div onClick={closeMobileMenu} style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.5)' }} />
      )}

      <style>{`
        .burger { display: none !important; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-cta   { display: none !important; }
          .burger    { display: flex !important; }
        }
      `}</style>
    </>
  )
}

const mobileItemStyle = () => ({
  display: 'block', color: 'rgba(255,255,255,0.9)',
  fontSize: 16, fontWeight: 600, letterSpacing: 1.2,
  textTransform: 'uppercase', textDecoration: 'none',
  padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
})

const mobileSubItemStyle = (active = false) => ({
  display: 'block',
  color: active ? '#0073f4' : 'rgba(255,255,255,0.7)',
  fontSize: 14, fontWeight: 600, letterSpacing: 1,
  textTransform: 'uppercase', textDecoration: 'none',
  padding: '14px 0 14px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
})

export default Navbar