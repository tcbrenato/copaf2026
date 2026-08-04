const Ico = ({ name, size = 22, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    mail:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    whatsapp: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    phone:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>,
    globe:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    pin:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    shield:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  }
  return icons[name] || null
}

const CONTACTS = [
  {
    icon: 'mail', label: 'Email Officiel', value: 'contact@copaf-ports.com',
    href: 'mailto:contact@copaf-ports.com?subject=Question COPAF 2026',
    cta: 'Écrire un email', color: '#0073F4', bg: '#EBF3FF',
  },
  {
    icon: 'mail', label: 'Email CRF Perfection', value: 'contact@crfperfection.pro',
    href: 'mailto:contact@crfperfection.pro?subject=Question COPAF 2026',
    cta: 'Écrire un email', color: '#0073F4', bg: '#EBF3FF',
  },
  {
    icon: 'whatsapp', label: 'WhatsApp', value: '+229 0169 30 30 19',
    href: "https://wa.me/22901693030?text=Bonjour, j'ai une question concernant la COPAF 2026.",
    cta: 'Discuter sur WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.1)',
  },
  {
    icon: 'phone', label: 'Téléphone', value: '+1 (240) 978-4155',
    href: 'tel:+12409784155',
    cta: 'Appeler', color: '#000E91', bg: 'rgba(0,14,145,0.06)',
  },
]

const Contact = () => (
  <section id="contact" style={{
    padding: 'clamp(64px, 10vw, 110px) clamp(20px, 5vw, 60px)',
    background: '#f8faff',
    fontFamily: "'Roboto', sans-serif",
  }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');`}</style>

    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#000E91', borderRadius: 100, padding: '7px 20px', marginBottom: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0073F4' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#fff' }}>Contact</span>
        </div>
        <h2 style={{
          fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 900,
          color: '#000E91', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.02em',
        }}>
          Une question ? Contactez-nous
        </h2>
        <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: '#64748b', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Notre équipe vous répond rapidement, par le canal qui vous convient le mieux.
        </p>
      </div>

      {/* CARTES CONTACT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20, marginBottom: 40 }}>
        {CONTACTS.map((c, i) => (
          <a key={i} href={c.href} target={c.icon === 'whatsapp' ? '_blank' : undefined} rel="noopener noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20,
              padding: '32px 24px', textDecoration: 'none', transition: 'all 0.25s ease',
              boxShadow: '0 4px 16px rgba(0,14,145,.05)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,14,145,.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,14,145,.05)' }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
            }}>
              <Ico name={c.icon} size={26} color={c.color} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
              {c.value}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px',
              background: c.bg, borderRadius: 100, color: c.color, fontSize: 12.5, fontWeight: 700,
            }}>
              {c.cta}
            </div>
          </a>
        ))}
      </div>

      {/* BLOC BAS : localisation + verification */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '28px 26px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ico name="pin" size={20} color="#0073F4" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>CRF Perfection — présence régionale</div>
            <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7 }}>Bénin · Côte d'Ivoire · Togo · États-Unis</div>
          </div>
        </div>

        <div style={{ background: '#EBF3FF', border: '1.5px solid #bfdbfe', borderRadius: 20, padding: '28px 26px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ico name="shield" size={20} color="#0073F4" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#000E91', marginBottom: 6 }}>Vérifiez toujours nos coordonnées bancaires</div>
            <div style={{ fontSize: 13.5, color: '#1e40af', lineHeight: 1.7 }}>
              Avant tout virement, confirmez le RIB officiel sur{' '}
              <a href="/verifier" style={{ color: '#000E91', fontWeight: 700, textDecoration: 'underline' }}>copaf-ports.com/verifier</a>.
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
)

export default Contact