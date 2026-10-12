// src/components/traducteur/TraducteurModale.jsx
//
// Fenêtre (modale) accessible de l'espace traducteurs : role="dialog" + aria-modal, fermeture par Échap, par le bouton ✕
// ou en touchant le fond, focus placé dans la fenêtre puis rendu au bouton d'origine, Tab qui reste dans la fenêtre,
// défilement de la page bloqué pendant l'ouverture. Sur petit écran la fenêtre occupe toute la largeur et défile à l'intérieur.

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { NAVY, INK, LINE } from '../equipe/equipeTheme'

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function TraducteurModale({ titre, libelleFermer, fermer, children }) {
  const fenetre = useRef(null)
  const boutonFermer = useRef(null)
  const fermerRef = useRef(fermer)
  useEffect(() => { fermerRef.current = fermer })

  useEffect(() => {
    const precedent = document.activeElement
    const defilement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (boutonFermer.current) boutonFermer.current.focus()

    const surTouche = e => {
      if (e.key === 'Escape') { e.stopPropagation(); fermerRef.current() ; return }
      if (e.key !== 'Tab' || !fenetre.current) return
      const elements = Array.prototype.slice.call(fenetre.current.querySelectorAll(FOCUSABLES))
      if (!elements.length) return
      const premier = elements[0]
      const dernier = elements[elements.length - 1]
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus() }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus() }
    }
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('keydown', surTouche)
      document.body.style.overflow = defilement
      if (precedent && typeof precedent.focus === 'function') precedent.focus()
    }
  }, [])

  return (
    <div onMouseDown={e => { if (e.target === e.currentTarget) fermerRef.current() }}
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, boxSizing: 'border-box' }}>
      <div ref={fenetre} role="dialog" aria-modal="true" aria-label={titre}
        style={{ width: '100%', maxWidth: 680, maxHeight: '94vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 14px 20px', background: NAVY, color: '#fff', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{titre}</h2>
          <button ref={boutonFermer} type="button" onClick={() => fermerRef.current()} aria-label={libelleFermer}
            style={{ flexShrink: 0, width: 44, height: 44, marginLeft: 10, border: '1px solid rgba(255,255,255,.45)', borderRadius: 12, background: 'rgba(255,255,255,.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', WebkitOverflowScrolling: 'touch', color: INK, fontSize: 15, lineHeight: 1.6, borderTop: `1px solid ${LINE}` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
