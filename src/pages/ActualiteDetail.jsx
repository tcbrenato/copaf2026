import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'
import { getPublishedArticles, getArticleBySlug } from '../utils/articlesData'

const NAVY = '#000E91'
const BLUE = '#0073F4'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ActualiteDetail() {
  const { slug } = useParams()
  const article = getArticleBySlug(slug)

  const wrap = { minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }

  if (!article) {
    return (
      <div style={wrap}>
        <Navbar />
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '160px 20px 80px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Article introuvable</h1>
          <a href="/actualites" style={{ color: BLUE, fontWeight: 700 }}>← Retour aux actualités</a>
        </div>
        <Footer />
      </div>
    )
  }

  const canonical = `https://copaf-ports.com/actualites/${article.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedDate,
    author: { '@type': 'Organization', name: 'CRF Perfection' },
    publisher: { '@type': 'Organization', name: 'COPAF 2026' },
    mainEntityOfPage: canonical,
  }

  const autres = getPublishedArticles().filter(a => a.slug !== article.slug).slice(0, 2)

  return (
    <div style={wrap}>
      <SeoHead
        title={`${article.title} — COPAF 2026`}
        description={article.metaDescription}
        canonical={canonical}
        ogImage={article.imageUrl ? `https://copaf-ports.com${article.imageUrl}` : undefined}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <article style={{ maxWidth: article.twoColumn ? 900 : 720, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 40px' }}>
        <a href="/actualites" style={{ fontSize: 13, fontWeight: 700, color: BLUE, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Toutes les actualités
        </a>

        <div style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 600, marginBottom: 14 }}>
          {fmtDate(article.publishedDate)} · {article.readingTime} min de lecture
        </div>

        <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', lineHeight: 1.25, margin: '0 0 28px', letterSpacing: '-0.01em' }}>
          {article.title}
        </h1>

        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 20, marginBottom: 32, display: 'block' }}
          />
        )}

        <div className={article.twoColumn ? 'article-two-col' : undefined} style={{ fontSize: 16, color: '#334155', lineHeight: 1.85 }}>
          {article.content.map((block, i) => (
            block.type === 'h2' ? (
              <h2 key={i} style={{ fontSize: 21, fontWeight: 800, color: '#0a1128', margin: '32px 0 12px' }}>{block.text}</h2>
            ) : (
              <p key={i} style={{ margin: '0 0 18px' }}>{block.text}</p>
            )
          ))}
        </div>

        {article.twoColumn && (
          <style>{`
            .article-two-col { column-count: 2; column-gap: 48px; }
            .article-two-col h2 { column-span: all; }
            .article-two-col p { break-inside: avoid; }
            @media (max-width: 700px) {
              .article-two-col { column-count: 1; }
            }
          `}</style>
        )}

        <div style={{ marginTop: 40, padding: '20px 24px', borderRadius: 16, background: 'rgba(0,115,244,0.06)', border: '1px solid rgba(0,115,244,0.15)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>COPAF 2026 — Conférence des Ports Africains</div>
          <p style={{ fontSize: 13.5, color: '#475569', margin: 0, lineHeight: 1.6 }}>
            Du 15 au 17 septembre 2026 à Casablanca. Plus d'informations et inscription sur <a href="/inscription" style={{ color: BLUE, fontWeight: 700 }}>copaf-ports.com/inscription</a>.
          </p>
        </div>

        {autres.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              À lire aussi
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {autres.map(a => (
                <a key={a.slug} href={`/actualites/${a.slug}`} style={{ fontSize: 14.5, fontWeight: 700, color: '#0a1128', textDecoration: 'none' }}>
                  {a.title} →
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  )
}
