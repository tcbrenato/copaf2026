import { useEffect } from 'react'

// Injecte un titre et des meta tags propres a une page (au lieu du bloc
// unique defini dans index.html, pense pour la page d'accueil). Pas de
// dependance (react-helmet) : le script de prerender (scripts/prerender.mjs)
// capture le DOM final APRES rendu React, donc ce useEffect suffit a
// produire un <head> correct dans le HTML statique que verront les
// crawlers — essentiel pour que chaque article ressorte sur ses propres
// mots-cles plutot que sur le titre generique du site.
function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
}

export default function SeoHead({ title, description, canonical, ogImage, type = 'article' }) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title

    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description })
      upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
      upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    }
    if (title) {
      upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
      upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    }
    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]')
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link) }
      link.setAttribute('href', canonical)
      upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    }
    if (ogImage) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage })
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage })
    }
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })

    // Restaure le titre generique si le composant se demonte (navigation
    // SPA vers une page qui n'utilise pas SeoHead).
    return () => { document.title = prevTitle }
  }, [title, description, canonical, ogImage, type])

  return null
}
