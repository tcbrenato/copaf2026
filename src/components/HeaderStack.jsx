import { useEffect, useRef } from 'react'
import Navbar from './Navbar'
import FlashInfoTicker from './FlashInfoTicker'

// Regroupe Navbar + FlashInfoTicker dans un seul bloc fixe en haut de l'ecran.
//
// FIX IMPORTANT : la hauteur reelle de ce bloc varie (Navbar qui retrecit au
// scroll, bandeau ticker present ou non, menu mobile qui wrap differemment
// selon la largeur d'ecran). Un padding-top fixe en pixels sur les pages qui
// suivent finissait par etre trop petit dans certains cas (mobile, ecrans
// etroits), ce qui cachait le contenu juste en dessous (bouton video,
// selecteur de langue...) derriere ce bloc fixe.
//
// Solution : on mesure la vraie hauteur de ce bloc en continu (ResizeObserver)
// et on la publie comme variable CSS globale --copaf-header-h. Les pages
// utilisent ensuite `paddingTop: 'var(--copaf-header-h, 130px)'` au lieu d'un
// chiffre fixe — l'espacement s'adapte alors automatiquement, y compris si le
// header change de hauteur plus tard (nouveau logo, nouvelle ligne de menu...).
const HeaderStack = () => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const updateHeight = () => {
      const h = el.offsetHeight
      document.documentElement.style.setProperty('--copaf-header-h', `${h}px`)
    }

    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)
    window.addEventListener('resize', updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return (
    <div ref={ref} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Navbar />
      <FlashInfoTicker />
    </div>
  )
}

export default HeaderStack