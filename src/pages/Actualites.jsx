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
  const sortedArticles = ARTICLES.slice().reverse()
  const featuredArticle = sortedArticles[0]
  const otherArticles = sortedArticles.slice(1)

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Actualités — COPAF 2026, Conférence des Ports Africains"
        description="Analyses et communiqués sur la transformation digitale des ports africains : cybersécurité maritime, intelligence artificielle portuaire, actualité de la COPAF 2026."
        canonical="https://copaf-ports.com/actualites"
        type="website"
      />
      <Navbar />

      {/* Cover — bandeau de bienvenue plutot qu'un simple espace vide sous la navbar */}
      <div style={{
        position: 'relative', paddingTop: 'clamp(110px, 14vw, 150px)', paddingBottom: 64,
        textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.55) saturate(1.1)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(0,14,145,0.75) 0%, rgba(10,17,40,0.9) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 50,
            background: 'rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: '#fff', marginBottom: 18,
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            COPAF 2026 • Le Mag
          </span>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
            Bienvenue à la COPAF 2026
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            Décryptages, innovations technologiques et communiqués officiels sur la transformation digitale et durable des ports africains.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '56px clamp(20px, 5vw, 40px) 80px' }}>

        {/* Article Mis en Avant (Featured) AVEC IMAGE */}
        {featuredArticle && (
          <div style={{ marginBottom: 48 }}>
            <a
              href={`/actualites/${featuredArticle.slug}`}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 40,
                background: '#fff',
                borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(0, 115, 244, 0.12)',
                boxShadow: '0 20px 40px -10px rgba(0, 14, 145, 0.08)', textDecoration: 'none', color: 'inherit',
                transition: 'all 0.3s ease', alignItems: 'center'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 24px 48px -12px rgba(0, 115, 244, 0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 14, 145, 0.08)' }}
            >
              {/* Image Container (Featured) */}
              <div style={{ height: '100%', minHeight: 350 }}>
                <img
                  src={featuredArticle.imageUrl || '/placeholder-featured.jpg'}
                  alt={featuredArticle.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Contenu Textuel (Featured) */}
              <div style={{ padding: '48px 48px 48px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{
                    background: NAVY, color: '#fff', fontSize: 11, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 1
                  }}>
                    À la une
                  </span>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    {fmtDate(featuredArticle.publishedDate)} · {featuredArticle.readingTime} min de lecture
                  </span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0a1128', margin: '0 0 14px', lineHeight: 1.25 }}>
                  {featuredArticle.title}
                </h2>
                <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, margin: '0 0 24px' }}>
                  {featuredArticle.excerpt}
                </p>
                <div>
                  <span style={{
                    fontSize: 14, fontWeight: 700, color: BLUE, display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(0, 115, 244, 0.08)', padding: '10px 20px', borderRadius: 50, transition: 'background 0.2s'
                  }}>
                    Lire l'analyse →
                  </span>
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Grille des autres articles AVEC IMAGES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
          {otherArticles.map(a => (
            <a
              key={a.slug}
              href={`/actualites/${a.slug}`}
              style={{
                display: 'flex', flexDirection: 'column',
                background: '#fff', borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(0, 115, 244, 0.08)', boxShadow: '0 10px 30px -5px rgba(0, 14, 145, 0.04)',
                textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(0, 115, 244, 0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(0, 14, 145, 0.04)' }}
            >
              {/* Image Container (Grid) */}
              <div style={{ height: 200, width: '100%' }}>
                <img
                  src={a.imageUrl || '/placeholder-grid.jpg'} // Assurez-vous d'avoir une image par défaut si imageUrl est vide
                  alt={a.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Contenu Textuel (Grid) */}
              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE }}></span>
                  {fmtDate(a.publishedDate)} · {a.readingTime} min
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 10px', lineHeight: 1.35, flexGrow: 1 }}>
                  {a.title}
                </h3>
                <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.65, margin: '0 0 20px' }}>
                  {a.excerpt}
                </p>
                <div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Découvrir →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>

      <Footer />
    </div>
  )
}