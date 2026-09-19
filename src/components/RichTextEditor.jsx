// src/components/RichTextEditor.jsx
//
// Editeur de texte riche leger (type traitement de texte) : titres, police,
// taille, gras/italique/souligne/barre, couleurs, alignement, listes,
// retraits, liens, ligne de separation, annuler/refaire, effacer la mise en
// forme. Base sur contentEditable + document.execCommand : aucune
// dependance supplementaire, et le HTML produit est compatible email.
//
// Non controle : le contenu vit dans le DOM (evite les sauts de curseur) ;
// `initialHtml` est relu a chaque changement de `resetKey`.

import { useEffect, useRef } from 'react'
import {
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, IndentIncrease, IndentDecrease, Link, Link2Off, Minus, RemoveFormatting, Highlighter, Baseline,
} from 'lucide-react'

const NAVY = '#000E91'

const BLOCS = [
  { label: 'Paragraphe', v: 'p' },
  { label: 'Titre 1', v: 'h1' },
  { label: 'Titre 2', v: 'h2' },
  { label: 'Titre 3', v: 'h3' },
]
const POLICES = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Courier New']
const TAILLES = [
  { label: 'Petit', v: '2' },
  { label: 'Normal', v: '3' },
  { label: 'Grand', v: '5' },
  { label: 'Très grand', v: '6' },
]

const btn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
  background: 'transparent', border: 'none', borderRadius: 6, color: '#334155', cursor: 'pointer', padding: 0,
}
const sel = {
  height: 30, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#334155',
  fontSize: 12.5, fontFamily: 'inherit', padding: '0 6px', cursor: 'pointer',
}
const sep = { width: 1, height: 20, background: '#e2e8f0', margin: '0 4px', flexShrink: 0 }

// Empeche le bouton de voler le focus (sinon la selection de texte est perdue).
const garderFocus = (e) => e.preventDefault()

const Bouton = ({ titre, onClick, children }) => (
  <button type="button" title={titre} aria-label={titre} onMouseDown={garderFocus} onClick={onClick} style={btn}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
    {children}
  </button>
)

export default function RichTextEditor({ initialHtml = '', onChange, minHeight = 220, placeholder = 'Rédigez votre message…', resetKey = 0 }) {
  const ref = useRef(null)
  const rangeRef = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml
  }, [resetKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const emettre = () => { if (onChange && ref.current) onChange(ref.current.innerHTML) }

  const sauverSelection = () => {
    const s = window.getSelection()
    if (s && s.rangeCount > 0 && ref.current && ref.current.contains(s.anchorNode)) rangeRef.current = s.getRangeAt(0).cloneRange()
  }

  const restaurerSelection = () => {
    ref.current?.focus()
    const s = window.getSelection()
    if (rangeRef.current && s) { s.removeAllRanges(); s.addRange(rangeRef.current) }
  }

  const cmd = (nom, valeur = null) => {
    restaurerSelection()
    document.execCommand('styleWithCSS', false, true)
    document.execCommand(nom, false, valeur)
    sauverSelection()
    emettre()
  }

  const lien = () => {
    restaurerSelection()
    const url = window.prompt('Adresse du lien (https://…)')
    if (!url) return
    cmd('createLink', /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`)
  }

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, padding: '8px 10px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Bouton titre="Annuler" onClick={() => cmd('undo')}><Undo2 size={16} /></Bouton>
        <Bouton titre="Rétablir" onClick={() => cmd('redo')}><Redo2 size={16} /></Bouton>
        <span style={sep} />
        <select aria-label="Style de paragraphe" style={sel} defaultValue="p" onChange={(e) => { cmd('formatBlock', e.target.value); e.target.value = 'p' }}>
          {BLOCS.map(b => <option key={b.v} value={b.v}>{b.label}</option>)}
        </select>
        <select aria-label="Police" style={sel} defaultValue="" onChange={(e) => { if (e.target.value) cmd('fontName', e.target.value); e.target.value = '' }}>
          <option value="">Police</option>
          {POLICES.map(p => <option key={p} value={p} style={{ fontFamily: p }}>{p}</option>)}
        </select>
        <select aria-label="Taille du texte" style={sel} defaultValue="" onChange={(e) => { if (e.target.value) cmd('fontSize', e.target.value); e.target.value = '' }}>
          <option value="">Taille</option>
          {TAILLES.map(t => <option key={t.v} value={t.v}>{t.label}</option>)}
        </select>
        <span style={sep} />
        <Bouton titre="Gras" onClick={() => cmd('bold')}><Bold size={16} /></Bouton>
        <Bouton titre="Italique" onClick={() => cmd('italic')}><Italic size={16} /></Bouton>
        <Bouton titre="Souligné" onClick={() => cmd('underline')}><Underline size={16} /></Bouton>
        <Bouton titre="Barré" onClick={() => cmd('strikeThrough')}><Strikethrough size={16} /></Bouton>
        <label title="Couleur du texte" style={{ ...btn, position: 'relative', cursor: 'pointer' }} onMouseDown={sauverSelection}>
          <Baseline size={16} />
          <input type="color" defaultValue="#000E91" aria-label="Couleur du texte" onChange={(e) => cmd('foreColor', e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        </label>
        <label title="Surlignage" style={{ ...btn, position: 'relative', cursor: 'pointer' }} onMouseDown={sauverSelection}>
          <Highlighter size={16} />
          <input type="color" defaultValue="#fef08a" aria-label="Couleur de surlignage" onChange={(e) => cmd('hiliteColor', e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        </label>
        <span style={sep} />
        <Bouton titre="Aligner à gauche" onClick={() => cmd('justifyLeft')}><AlignLeft size={16} /></Bouton>
        <Bouton titre="Centrer" onClick={() => cmd('justifyCenter')}><AlignCenter size={16} /></Bouton>
        <Bouton titre="Aligner à droite" onClick={() => cmd('justifyRight')}><AlignRight size={16} /></Bouton>
        <Bouton titre="Justifier" onClick={() => cmd('justifyFull')}><AlignJustify size={16} /></Bouton>
        <span style={sep} />
        <Bouton titre="Liste à puces" onClick={() => cmd('insertUnorderedList')}><List size={16} /></Bouton>
        <Bouton titre="Liste numérotée" onClick={() => cmd('insertOrderedList')}><ListOrdered size={16} /></Bouton>
        <Bouton titre="Diminuer le retrait" onClick={() => cmd('outdent')}><IndentDecrease size={16} /></Bouton>
        <Bouton titre="Augmenter le retrait" onClick={() => cmd('indent')}><IndentIncrease size={16} /></Bouton>
        <span style={sep} />
        <Bouton titre="Insérer un lien" onClick={lien}><Link size={16} /></Bouton>
        <Bouton titre="Retirer le lien" onClick={() => cmd('unlink')}><Link2Off size={16} /></Bouton>
        <Bouton titre="Ligne de séparation" onClick={() => cmd('insertHorizontalRule')}><Minus size={16} /></Bouton>
        <Bouton titre="Effacer la mise en forme" onClick={() => cmd('removeFormat')}><RemoveFormatting size={16} /></Bouton>
      </div>

      <div
        ref={ref}
        className="rte-zone"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emettre}
        onBlur={() => { sauverSelection(); emettre() }}
        onKeyUp={sauverSelection}
        onMouseUp={sauverSelection}
        style={{ minHeight, padding: '14px 16px', outline: 'none', fontSize: 14.5, lineHeight: 1.7, color: '#1e293b', fontFamily: 'Arial, Helvetica, sans-serif' }}
      />

      <style>{`
        .rte-zone:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }
        .rte-zone h1 { font-size: 24px; margin: 12px 0 8px; color: ${NAVY}; }
        .rte-zone h2 { font-size: 20px; margin: 12px 0 8px; color: ${NAVY}; }
        .rte-zone h3 { font-size: 17px; margin: 10px 0 6px; color: ${NAVY}; }
        .rte-zone ul, .rte-zone ol { padding-left: 26px; margin: 8px 0; }
        .rte-zone a { color: #0073F4; }
        .rte-zone hr { border: none; border-top: 1px solid #cbd5e1; margin: 14px 0; }
        .rte-zone blockquote { border-left: 3px solid #cbd5e1; margin: 10px 0; padding-left: 14px; color: #475569; }
      `}</style>
    </div>
  )
}
