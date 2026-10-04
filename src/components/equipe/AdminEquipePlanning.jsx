import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../supabase'

const INPUT = { padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', width: '100%', background: '#fff' }
const BTN = { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }

// Édition du planning d'un membre : une ligne = jour / horaire / tâche / lieu. Chaque champ s'enregistre en quittant la case.
export default function AdminEquipePlanning({ membreId }) {
  const [lignes, setLignes] = useState(null)
  const [erreur, setErreur] = useState('')

  const charger = useCallback(async () => {
    const { data, error } = await supabase.from('equipe_planning').select('*').eq('membre_id', membreId).order('jour').order('ordre')
    if (error) { setErreur(error.message); return }
    setLignes(data || [])
  }, [membreId])

  useEffect(() => { charger() }, [charger])

  const modifierLocal = (id, champ, valeur) => setLignes(ls => ls.map(l => (l.id === id ? { ...l, [champ]: valeur } : l)))

  const enregistrer = async (ligne, champ) => {
    setErreur('')
    const valeur = ligne[champ]
    if (champ === 'tache' && !String(valeur || '').trim()) return
    const { error } = await supabase.from('equipe_planning').update({ [champ]: valeur === '' ? null : valeur }).eq('id', ligne.id)
    if (error) setErreur(error.message)
  }

  const ajouter = async () => {
    setErreur('')
    const dernier = (lignes || [])[(lignes || []).length - 1]
    const { error } = await supabase.from('equipe_planning').insert({
      membre_id: membreId, jour: dernier?.jour || '2026-10-19', horaire: '', tache: 'Nouvelle ligne', lieu: '', ordre: (lignes || []).length + 1,
    })
    if (error) { setErreur(error.message); return }
    charger()
  }

  const supprimer = async ligne => {
    if (!window.confirm('Supprimer cette ligne du planning ?')) return
    const { error } = await supabase.from('equipe_planning').delete().eq('id', ligne.id)
    if (error) { setErreur(error.message); return }
    charger()
  }

  if (lignes === null) return <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Chargement du planning…</p>

  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Planning ({lignes.length} ligne{lignes.length > 1 ? 's' : ''})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lignes.map(l => (
          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6, padding: 8, border: '1px solid #eef2f7', borderRadius: 10, background: '#f8fafc' }}>
            <input type="date" value={l.jour || ''} onChange={e => modifierLocal(l.id, 'jour', e.target.value)} onBlur={() => enregistrer(l, 'jour')} style={INPUT} aria-label="Jour" />
            <input value={l.horaire || ''} onChange={e => modifierLocal(l.id, 'horaire', e.target.value)} onBlur={() => enregistrer(l, 'horaire')} placeholder="Horaire" style={INPUT} aria-label="Horaire" />
            <input value={l.tache || ''} onChange={e => modifierLocal(l.id, 'tache', e.target.value)} onBlur={() => enregistrer(l, 'tache')} placeholder="Tâche" style={{ ...INPUT, gridColumn: 'span 2' }} aria-label="Tâche" />
            <input value={l.lieu || ''} onChange={e => modifierLocal(l.id, 'lieu', e.target.value)} onBlur={() => enregistrer(l, 'lieu')} placeholder="Lieu" style={INPUT} aria-label="Lieu" />
            <button type="button" onClick={() => supprimer(l)} style={{ ...BTN, color: '#dc2626' }}>Supprimer</button>
          </div>
        ))}
      </div>
      {erreur && <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0' }}>{erreur}</p>}
      <button type="button" onClick={ajouter} style={{ ...BTN, marginTop: 10 }}>+ Ajouter une ligne</button>
    </div>
  )
}
