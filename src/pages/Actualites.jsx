import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'
import { ARTICLES } from '../utils/articlesData'

const NAVY = '#000E91'
const BLUE = '#0073F4'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Actualites() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Actualités — COPAF 2026, Conférence des Ports Africains"
        description="Analyses et communiqués sur la transformation digitale des ports africains : cybersécurité maritime, intelligence artificielle portuaire, actualité de la COPAF 2026."
        canonical="https://copaf-ports.com/actualites"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 50,
            background: 'rgba(0, 115, 244, 0.1)', fontSize: 12, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: BLUE, marginBottom: 16,
          }}>
            COPAF 2026
          </span>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 900, color: '#0a1128', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Actualités
          </h1>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Analyses sectorielles et communiqués sur la transformation digitale des ports africains.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          {ARTICLES.slice().reverse().map(a => (
            <a
              key={a.slug}
              href={`/actualites/${a.slug}`}
              style={{
                display: 'block', background: '#fff', borderRadius: 20, padding: '28px 30px',
                border: '1px solid rgba(0, 115, 244, 0.08)', boxShadow: '0 10px 30px -5px rgba(0, 14, 145, 0.05)',
                textDecoration: 'none', color: 'inherit', transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 34px -8px rgba(0, 115, 244, 0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(0, 14, 145, 0.05)' }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 10 }}>
                {fmtDate(a.publishedDate)} · {a.readingTime} min de lecture
              </div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0a1128', margin: '0 0 10px', lineHeight: 1.3 }}>
                {a.title}
              </h2>
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.7, margin: '0 0 14px' }}>
                {a.excerpt}
              </p>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Lire l'article →
              </span>
            </a>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
