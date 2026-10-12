// src/components/traducteur/TraducteurTexte.jsx
//
// Affiche le texte d'une carte saisi dans l'admin. Mise en forme volontairement simple (pas de HTML saisi par l'admin) :
//   « ## Titre » → sous-titre · « - texte » → puce · ligne vide → nouveau paragraphe.
// Les mentions « À compléter » / « To be completed » sont signalées en orange pour que rien de provisoire ne passe inaperçu.

import { INK, MUTED } from '../equipe/equipeTheme'

const MARQUEUR = /(À compléter|To be completed)/g

export function Marque({ texte }) {
  return String(texte ?? '').split(MARQUEUR).map((morceau, i) => (
    i % 2 === 1
      ? <span key={i} style={{ background: '#fef3c7', color: '#92400e', borderRadius: 6, padding: '1px 8px', fontWeight: 700, fontSize: '0.92em', fontStyle: 'italic' }}>{morceau}</span>
      : <span key={i}>{morceau}</span>
  ))
}

export default function TraducteurTexte({ texte }) {
  const lignes = String(texte ?? '').replace(/\r/g, '').split('\n')
  const blocs = []
  let puces = null
  lignes.forEach(brut => {
    const l = brut.trim()
    if (l.startsWith('- ')) {
      if (!puces) { puces = []; blocs.push({ type: 'puces', items: puces }) }
      puces.push(l.slice(2))
      return
    }
    puces = null
    if (l.startsWith('## ')) blocs.push({ type: 'titre', texte: l.slice(3) })
    else if (l) blocs.push({ type: 'p', texte: l })
  })
  if (!blocs.length) return null
  return (
    <div>
      {blocs.map((b, i) => {
        if (b.type === 'titre') return <h3 key={i} style={{ margin: i ? '18px 0 4px' : '0 0 4px', fontSize: 15, fontWeight: 900, color: INK }}><Marque texte={b.texte} /></h3>
        if (b.type === 'puces') return (
          <ul key={i} style={{ margin: '6px 0', paddingLeft: 22 }}>
            {b.items.map((it, j) => <li key={j} style={{ margin: '5px 0' }}><Marque texte={it} /></li>)}
          </ul>
        )
        return <p key={i} style={{ margin: '6px 0', color: b.texte.length > 0 ? INK : MUTED }}><Marque texte={b.texte} /></p>
      })}
    </div>
  )
}
