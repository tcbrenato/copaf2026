import { useState, useEffect, useRef } from 'react'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const WHATSAPP_NUM = '2290169303019'

const Ico = ({ name, size = 22, color = '#fff' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    close: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    chat: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
    mail: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    whatsapp: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12.014 2C6.486 2 2 6.486 2 12.014c0 1.988.573 3.845 1.562 5.41L2 22l4.688-1.531A9.96 9.96 0 0 0 12.014 22C17.542 22 22 17.542 22 12.014 22 6.486 17.542 2 12.014 2zm0 18.09a8.05 8.05 0 0 1-4.32-1.253l-.31-.185-2.762.902.914-2.7-.201-.312a8.05 8.05 0 0 1-1.245-4.298c0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.09-8.09 8.09z" /></svg>,
    phone: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>,
    linkedin: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" /></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    file: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    ticket: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><line x1="13" y1="5" x2="13" y2="19" strokeDasharray="3 3" /></svg>,
  }
  return icons[name] || null
}

const SHORTCUTS = [
  { key: 'email', label: 'Email', icon: 'mail', href: 'mailto:contact@copaf-ports.com', color: '#0073F4' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent("Bonjour, j'ai une question à propos de COPAF 2026.")}`, color: '#25D366', external: true },
  { key: 'phone', label: 'Téléphone', icon: 'phone', href: `tel:+${WHATSAPP_NUM}`, color: '#0073F4' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/company/crfperfection/', color: '#0A66C2', external: true },
  // Pas de vrai Calendly configure pour l'instant — lien de secours par email
  // avec objet pre-rempli, a remplacer par une vraie URL Calendly des qu'un
  // compte est cree (je ne peux pas creer ce compte a votre place).
  { key: 'rdv', label: 'Rendez-vous', icon: 'calendar', href: 'mailto:contact@copaf-ports.com?subject=Demande%20de%20rendez-vous%20COPAF%202026', color: '#000E91' },
  { key: 'programme', label: 'Programme', icon: 'file', href: '/ProgrammecopafFR.pdf', color: '#0073F4', external: true },
  { key: 'inscription', label: 'Inscription', icon: 'ticket', href: '/inscription', color: '#000E91' },
]

export default function ContactHub() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onEsc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  return (
    <div ref={rootRef} className="copaf-hub-root" style={{ position: 'fixed', zIndex: 940 }}>
      {/* Grille des raccourcis */}
      <div className="copaf-hub-grid" style={{
        position: 'absolute', bottom: 'calc(100% + 16px)', right: 0,
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
        padding: 16, borderRadius: 22, width: 260,
        background: 'linear-gradient(160deg, rgba(10,17,40,0.92), rgba(0,14,145,0.88))',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        transformOrigin: 'bottom right',
        transform: open ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
      }}>
        {SHORTCUTS.map(s => (
          <a
            key={s.key}
            href={s.href}
            aria-label={s.label}
            target={s.external ? '_blank' : undefined}
            rel={s.external ? 'noopener noreferrer' : undefined}
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '14px 8px', borderRadius: 16, textDecoration: 'none',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: `0 4px 14px ${s.color}55`,
            }}>
              <Ico name={s.icon} size={19} />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.25 }}>
              {s.label}
            </span>
          </a>
        ))}
      </div>

      {/* Bouton principal */}
      <button
        className="copaf-hub-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fermer le menu de contact' : 'Ouvrir le menu de contact'}
        aria-expanded={open}
        style={{
          borderRadius: '50%', border: '3px solid #fff', cursor: 'pointer',
          background: `linear-gradient(135deg, ${BLUE}, ${NAVY})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(0,14,145,0.35)',
          animation: open ? 'none' : 'copaf-hub-pulse 2.6s ease-in-out infinite',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <Ico name={open ? 'close' : 'chat'} size={22} />
        </div>
      </button>

      <style>{`
        .copaf-hub-root {
          right: clamp(16px, 4vw, 24px);
          bottom: max(20px, calc(env(safe-area-inset-bottom) + 14px));
        }
        .copaf-hub-btn { width: 56px; height: 56px; }
        @keyframes copaf-hub-pulse {
          0%, 100% { box-shadow: 0 8px 20px rgba(0,14,145,0.35); }
          50% { box-shadow: 0 8px 20px rgba(0,14,145,0.5), 0 0 0 8px rgba(0,115,244,0.12); }
        }
        @media (max-width: 480px) {
          .copaf-hub-btn { width: 46px; height: 46px; }
          .copaf-hub-grid { width: 220px !important; }
        }
      `}</style>
    </div>
  )
}
