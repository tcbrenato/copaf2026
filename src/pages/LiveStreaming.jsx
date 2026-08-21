import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const BLUE = '#0073F4'

// Chaine YouTube officielle COPAF (youtube.com/@copafports).
// L'ID de chaine (UCxxxx) est necessaire pour l'embed "live_stream" — le
// handle @copafports seul ne fonctionne pas avec cette URL d'integration.
const YOUTUBE_CHANNEL_ID = 'UCwZhHrXxH7XukDDaPkbPgaw'
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@copafports'

// Fenetre de la conference : avant cette date, on affiche un compte a
// rebours plutot que d'essayer d'integrer un flux qui n'existe pas encore
// (l'embed peut sinon afficher un cadre vide ou une erreur YouTube).
const DEBUT_CONFERENCE = new Date('2026-09-15T08:00:00+01:00')
const FIN_CONFERENCE   = new Date('2026-09-18T00:00:00+01:00')

const Ico = ({ name, size = 22, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    play: <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    youtube: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12Z" /></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  }
  return icons[name] || null
}

function Compteur() {
  const diff = Math.max(0, DEBUT_CONFERENCE.getTime() - Date.now())
  const jours = Math.floor(diff / 86400000)
  const heures = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 28 }}>
      {[{ v: jours, l: 'jours' }, { v: heures, l: 'heures' }, { v: minutes, l: 'min' }].map(u => (
        <div key={u.l} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 22px', minWidth: 84 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{u.v}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{u.l}</div>
        </div>
      ))}
    </div>
  )
}

export default function LiveStreaming() {
  const maintenant = Date.now()
  const enDirect = maintenant >= DEBUT_CONFERENCE.getTime() && maintenant < FIN_CONFERENCE.getTime()
  const avantConference = maintenant < DEBUT_CONFERENCE.getTime()

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#f8fafc', background: '#0a1128' }}>
      <SeoHead
        title="Live Streaming — COPAF 2026"
        description="Suivez la Conférence des Ports Africains (COPAF) 2026 en direct, du 15 au 17 septembre à Casablanca."
        canonical="https://copaf-ports.com/live"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 80px', textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50,
          background: 'rgba(0, 115, 244, 0.15)', border: '1px solid rgba(0,115,244,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase', color: '#60a5fa', marginBottom: 18,
        }}>
          {enDirect && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'copaf-live-pulse 1.4s ease-in-out infinite' }} />}
          {enDirect ? 'En direct maintenant' : 'COPAF 2026'}
        </span>
        <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
          Live Streaming
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Suivez les sessions de la conférence en direct depuis Casablanca, où que vous soyez.
        </p>

        {avantConference ? (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '48px 24px' }}>
              <Ico name="clock" size={36} color="#60a5fa" />
              <p style={{ fontSize: 15, color: '#cbd5e1', marginTop: 16, marginBottom: 0 }}>
                La diffusion en direct commencera le <strong style={{ color: '#fff' }}>15 septembre 2026</strong>
              </p>
              <Compteur />
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <iframe
              src={`https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}`}
              title="COPAF 2026 — Live Streaming"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 32, padding: '13px 26px',
            borderRadius: 12, background: '#FF0000', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(255,0,0,0.3)',
          }}
        >
          <Ico name="youtube" size={20} color="#fff" />
          S'abonner sur YouTube
        </a>
      </div>

      <Footer />

      <style>{`@keyframes copaf-live-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  )
}
