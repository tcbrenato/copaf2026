import { useState } from 'react'
import { NUMEROS_TABLETTES } from '../utils/terrainEtapes'

const NAVY = '#000E91'
const BTN = { padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }
const overlay = { position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(3px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }
const boite = { background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, padding: 22, boxShadow: '0 24px 48px -12px rgba(15,23,42,.35)', maxHeight: '92vh', overflow: 'auto' }

// Grille T01-T35. pris : { 'T07': 'Prenom Nom' } = numeros deja remis (grises).
export default function ModalTablette({ titre, pris, onValider, onFermer }) {
  const [choix, setChoix] = useState('')
  return (
    <div style={overlay} className="terrain-modal-overlay" onClick={onFermer}>
      <div style={boite} className="terrain-modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 4 }}>{titre}</div>
        <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 10 }}>Touchez le numéro écrit sur la tablette remise.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {NUMEROS_TABLETTES.map(n => {
            const prisPar = pris[n]
            const actif = choix === n
            return (
              <button key={n} type="button" disabled={!!prisPar} onClick={() => setChoix(n)} title={prisPar ? `Déjà remise à ${prisPar}` : undefined} style={{
                ...BTN, justifyContent: 'center', padding: '10px 0', fontSize: 13,
                background: actif ? NAVY : prisPar ? '#f1f5f9' : '#eef2f7', color: actif ? '#fff' : prisPar ? '#cbd5e1' : '#334155',
                textDecoration: prisPar ? 'line-through' : 'none', cursor: prisPar ? 'not-allowed' : 'pointer',
              }}>{n}</button>
            )
          })}
        </div>
        <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 12.5, fontWeight: 600 }}>
          Rappelez à la personne d'apporter sa tablette demain, au Jour 1 de la conférence.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" disabled={!choix} onClick={() => onValider(choix)} style={{ ...BTN, background: NAVY, color: '#fff', padding: '10px 16px', flex: 1, justifyContent: 'center', opacity: choix ? 1 : 0.5 }}>{choix ? `Valider ${choix}` : 'Valider'}</button>
          <button type="button" onClick={onFermer} style={{ ...BTN, background: '#f1f5f9', color: '#334155' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
