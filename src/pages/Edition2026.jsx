import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'
import { supabase } from '../supabase'
import { useLang } from '../i18n/useLang'

const NAVY = '#00357E'
const SKY = '#1798F4'
const LIGHT = '#A9C8F0'
const BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/edition-2026/`
const PAR_PAGE = 24
const CACHE_CLE = 'copaf_edition2026_v1'

const ALBUMS = {
  1: 'https://photos.app.goo.gl/fjzZo9yKvkzvTRJX9',
  2: 'https://photos.app.goo.gl/JsDJse28awQVwMeG7',
  3: 'https://photos.app.goo.gl/rA38riHy3MMw32zc6',
  4: 'https://photos.app.goo.gl/JhgoCG3JDZW7wyT69',
}

const TR = {
  fr: {
    seoTitle: 'COPAF 2026 : l’édition en images', seoDesc: 'Revivez la Conférence des Ports Africains, Casablanca, 19 au 21 octobre 2026 : la galerie photo des trois jours.',
    kicker: 'COPAF 2026 · CASABLANCA', titreA: 'L’ÉDITION 2026', titreB: 'EN IMAGES',
    intro: 'Du 19 au 21 octobre 2026, Casablanca a réuni les autorités portuaires africaines autour du Smart Port : IA et cybersécurité au service de la performance. Revivez les trois jours.',
    merci: 'Lire la lettre de remerciement',
    tout: 'Tout', jour: 'Jour', date: ['', '19 octobre', '20 octobre', '21 octobre', 'Présence des DG et SG'], dgsg: 'DG et SG',
    chargement: 'Chargement des photos…', vide: 'La sélection de photos arrive très bientôt.',
    plus: 'Voir plus de photos', photos: 'photos',
    albumsTitre: 'Toutes les photos en haute qualité', albumsTexte: 'Les albums complets sont disponibles au téléchargement.',
    album: 'Ouvrir l’album', fermer: 'Fermer', prec: 'Photo précédente', suiv: 'Photo suivante', telecharger: 'Télécharger',
  },
  en: {
    seoTitle: 'COPAF 2026: the edition in pictures', seoDesc: 'Relive the African Ports Conference, Casablanca, 19 to 21 October 2026: the photo gallery of the three days.',
    kicker: 'COPAF 2026 · CASABLANCA', titreA: 'THE 2026 EDITION', titreB: 'IN PICTURES',
    intro: 'From 19 to 21 October 2026, Casablanca brought together African port authorities around the Smart Port: AI and cybersecurity driving performance. Relive the three days.',
    merci: 'Read the thank-you letter',
    tout: 'All', jour: 'Day', date: ['', 'October 19', 'October 20', 'October 21', 'Directors General & Secretaries General'], dgsg: 'DGs & SGs',
    chargement: 'Loading photos…', vide: 'The photo selection is coming very soon.',
    plus: 'Show more photos', photos: 'photos',
    albumsTitre: 'All photos in high quality', albumsTexte: 'The full albums are available to download.',
    album: 'Open the album', fermer: 'Close', prec: 'Previous photo', suiv: 'Next photo', telecharger: 'Download',
  },
}

function Lightbox({ photos, index, onClose, onIndex, t, lang }) {
  const touch = useRef(null)
  const p = photos[index]
  const aller = useCallback(d => onIndex((index + d + photos.length) % photos.length), [index, photos.length, onIndex])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') aller(1)
      else if (e.key === 'ArrowLeft') aller(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [aller, onClose])

  // Precharge la photo suivante pour un defilement fluide
  useEffect(() => {
    const n = photos[(index + 1) % photos.length]
    if (n) { const i = new Image(); i.src = BASE + n.full_path }
  }, [index, photos])

  if (!p) return null
  const legende = lang === 'en' ? p.legende_en : p.legende_fr
  const bouton = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(255,255,255,.35)', background: 'rgba(0,21,57,.6)', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'grid', placeItems: 'center' }

  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      onTouchStart={e => { touch.current = e.touches[0].clientX }}
      onTouchEnd={e => { const d = e.changedTouches[0].clientX - (touch.current ?? 0); if (Math.abs(d) > 50) aller(d < 0 ? 1 : -1); touch.current = null }}
      style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,10,35,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 12px' }}>
      <img key={p.id} src={BASE + p.full_path} alt={legende || ''} onClick={e => e.stopPropagation()}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 10px 50px rgba(0,0,0,.6)' }} />
      <button type="button" onClick={onClose} aria-label={t.fermer} style={{ position: 'absolute', top: 12, right: 14, width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,.35)', background: 'rgba(0,21,57,.6)', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <button type="button" onClick={e => { e.stopPropagation(); aller(-1) }} aria-label={t.prec} style={{ ...bouton, left: 10 }}>‹</button>
      <button type="button" onClick={e => { e.stopPropagation(); aller(1) }} aria-label={t.suiv} style={{ ...bouton, right: 10 }}>›</button>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: 0, right: 0, bottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, color: LIGHT, fontSize: 13 }}>
        <span>{index + 1} / {photos.length}{legende ? ` · ${legende}` : ''}</span>
        <a href={BASE + p.full_path} download target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,.4)', borderRadius: 8, padding: '5px 12px' }}>{t.telecharger}</a>
      </div>
    </div>
  )
}

export default function Edition2026() {
  const lang = useLang()
  const t = TR[lang]
  // Affichage immediat depuis la derniere visite, puis rafraichi en arriere-plan
  const [photos, setPhotos] = useState(() => { try { return JSON.parse(localStorage.getItem(CACHE_CLE)) || null } catch { return null } })
  const [onglet, setOnglet] = useState(0) // 0 = tout
  const [visibles, setVisibles] = useState(PAR_PAGE)
  const [ouverte, setOuverte] = useState(-1)

  useEffect(() => {
    let annule = false
    supabase.from('edition_photos').select('id, jour, ordre, thumb_path, full_path, largeur, hauteur, legende_fr, legende_en')
      .order('jour').order('ordre').limit(1000)
      .then(({ data, error }) => {
        if (annule || (error && photos)) return
        const liste = error ? [] : (data || [])
        setPhotos(liste)
        try { localStorage.setItem(CACHE_CLE, JSON.stringify(liste)) } catch { /* stockage indisponible */ }
      })
    return () => { annule = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrees = useMemo(() => (photos || []).filter(p => onglet === 0 || p.jour === onglet), [photos, onglet])
  const affichees = filtrees.slice(0, visibles)
  const fermer = useCallback(() => setOuverte(-1), [])
  const compte = j => (photos || []).filter(p => j === 0 || p.jour === j).length

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fc', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif", color: '#0f172a' }}>
      <SeoHead title={t.seoTitle} description={t.seoDesc} canonical="https://copaf-ports.com/edition-2026" type="website" />
      <Navbar />

      <header style={{ position: 'relative', overflow: 'hidden', color: '#fff', textAlign: 'center', background: 'url(/merci/fond.jpg) center/cover, #001E4E', padding: 'clamp(120px, 16vw, 170px) 20px clamp(40px, 6vw, 64px)' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,67,152,.55), rgba(0,21,57,.88))' }} />
        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: '.2em', color: LIGHT }}>{t.kicker}</div>
          <h1 style={{ margin: '12px 0 0', fontWeight: 800, fontSize: 'clamp(30px, 6vw, 56px)', lineHeight: 1.1 }}>{t.titreA} <span style={{ color: SKY }}>{t.titreB}</span></h1>
          <div aria-hidden="true" style={{ width: 70, height: 4, background: SKY, borderRadius: 3, margin: '18px auto 20px' }} />
          <p style={{ margin: '0 auto', maxWidth: 680, fontSize: 'clamp(14px, 2vw, 17px)', lineHeight: 1.7, color: '#E8F3FD' }}>{t.intro}</p>
          <a href="/#merci" style={{ display: 'inline-block', marginTop: 24, padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(169,200,240,.55)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', background: 'rgba(255,255,255,.08)' }}>{t.merci}</a>
        </div>
      </header>

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(24px, 4vw, 44px) clamp(12px, 3vw, 28px) 72px' }}>
        <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 26 }}>
          {[0, 1, 2, 3, 4].map(j => (
            <button key={j} role="tab" aria-selected={onglet === j} type="button" onClick={() => { setOnglet(j); setVisibles(PAR_PAGE) }}
              style={{ padding: '10px 20px', borderRadius: 999, border: onglet === j ? `1.5px solid ${NAVY}` : '1.5px solid #cdd8ea', background: onglet === j ? NAVY : '#fff', color: onglet === j ? '#fff' : NAVY, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              {j === 0 ? t.tout : j === 4 ? t.dgsg : `${t.jour} ${j}`}{photos && photos.length > 0 ? ` · ${compte(j)}` : ''}
              {j > 0 && j < 4 && <span style={{ display: 'block', fontWeight: 500, fontSize: 11, opacity: .8 }}>{t.date[j]}</span>}
            </button>
          ))}
        </div>

        {photos === null && <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>{t.chargement}</div>}
        {photos !== null && photos.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: '36px 16px', fontSize: 16 }}>{t.vide}</div>}

        {affichees.length > 0 && (
          <div style={{ columnWidth: 260, columnGap: 14 }}>
            {affichees.map((p, i) => (
              <button key={p.id} type="button" onClick={() => setOuverte(i)} aria-label={p.jour === 4 ? t.dgsg : `${t.jour} ${p.jour}`}
                style={{ display: 'block', width: '100%', marginBottom: 14, padding: 0, border: 'none', background: '#dbe5f3', borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', breakInside: 'avoid', boxShadow: '0 2px 10px rgba(0,30,90,.12)', aspectRatio: p.largeur && p.hauteur ? `${p.largeur} / ${p.hauteur}` : undefined }}>
                <img src={BASE + p.thumb_path} alt={(lang === 'en' ? p.legende_en : p.legende_fr) || ''} loading={i < 8 ? 'eager' : 'lazy'} fetchPriority={i < 4 ? 'high' : undefined} decoding="async"
                  width={p.largeur || undefined} height={p.hauteur || undefined}
                  style={{ display: 'block', width: '100%', height: 'auto', transition: 'transform .35s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }} />
              </button>
            ))}
          </div>
        )}

        {filtrees.length > visibles && (
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button type="button" onClick={() => setVisibles(v => v + PAR_PAGE)} style={{ padding: '13px 28px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${SKY}, #0A5BB5)`, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.plus} ({filtrees.length - visibles})
            </button>
          </div>
        )}

        <section style={{ marginTop: 56, padding: 'clamp(22px, 4vw, 36px)', borderRadius: 20, background: `linear-gradient(135deg, #054398, ${NAVY} 55%, #001E4E)`, color: '#fff', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800 }}>{t.albumsTitre}</h2>
          <p style={{ margin: '8px auto 20px', maxWidth: 560, color: '#E8F3FD', fontSize: 15, lineHeight: 1.6 }}>{t.albumsTexte}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(j => (
              <a key={j} href={ALBUMS[j]} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', minWidth: 170, padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(169,200,240,.55)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                {j === 4 ? t.dgsg : `${t.jour} ${j}`}
                <span style={{ display: 'block', fontWeight: 500, fontSize: 12, color: LIGHT }}>{j === 4 ? t.album : `${t.date[j]} · ${t.album}`}</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      {ouverte >= 0 && <Lightbox photos={affichees} index={ouverte} onClose={fermer} onIndex={setOuverte} t={t} lang={lang} />}
    </div>
  )
}
