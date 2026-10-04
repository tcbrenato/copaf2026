import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../supabase'

const INPUT = { padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', width: '100%', background: '#fff' }
const BTN = { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }
const TYPES = [['charte', 'Charte de l’équipe'], ['programme', 'Programme'], ['plan', 'Plan du site']]

const nomSur = nom => (nom || 'fichier').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_')

// Documents communs : titre, type, lien (ou fichier à téléverser) et visibilité (tous ou certains membres).
export default function AdminEquipeDocuments({ membres }) {
  const [docs, setDocs] = useState(null)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(null)

  const charger = useCallback(async () => {
    const { data, error } = await supabase.from('equipe_documents').select('*').order('ordre').order('created_at')
    if (error) { setErreur(error.message); return }
    setDocs(data || [])
  }, [])

  useEffect(() => { charger() }, [charger])

  const maj = (id, champs) => setDocs(ds => ds.map(d => (d.id === id ? { ...d, ...champs } : d)))

  const sauver = async (doc, champs) => {
    setErreur('')
    const { error } = await supabase.from('equipe_documents').update(champs).eq('id', doc.id)
    if (error) setErreur(error.message)
  }

  const ajouter = async () => {
    setErreur('')
    const { error } = await supabase.from('equipe_documents').insert({ titre: 'Nouveau document', type: 'charte', url: null, ordre: (docs || []).length + 1 })
    if (error) { setErreur(error.message); return }
    charger()
  }

  const supprimer = async doc => {
    if (!window.confirm(`Supprimer « ${doc.titre} » ?`)) return
    const { error } = await supabase.from('equipe_documents').delete().eq('id', doc.id)
    if (error) { setErreur(error.message); return }
    charger()
  }

  const televerser = async (doc, e) => {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    setEnvoi(doc.id); setErreur('')
    const chemin = `equipe/${Date.now()}_${nomSur(fichier.name)}`
    const { error } = await supabase.storage.from('documents-intervenants').upload(chemin, fichier)
    setEnvoi(null)
    if (error) { setErreur(`Échec de l'envoi : ${error.message}`); return }
    const url = supabase.storage.from('documents-intervenants').getPublicUrl(chemin).data.publicUrl
    maj(doc.id, { url })
    sauver(doc, { url })
  }

  const basculerMembre = (doc, membreId) => {
    const actuels = doc.visible_pour || []
    const suite = actuels.includes(membreId) ? actuels.filter(x => x !== membreId) : [...actuels, membreId]
    maj(doc.id, { visible_pour: suite })
    sauver(doc, { visible_pour: suite })
  }

  if (docs === null) return <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Chargement des documents…</p>

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {docs.map(doc => (
          <div key={doc.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              <input value={doc.titre || ''} onChange={e => maj(doc.id, { titre: e.target.value })} onBlur={() => doc.titre?.trim() && sauver(doc, { titre: doc.titre.trim() })} placeholder="Titre" style={INPUT} aria-label="Titre" />
              <select value={doc.type} onChange={e => { maj(doc.id, { type: e.target.value }); sauver(doc, { type: e.target.value }) }} style={INPUT} aria-label="Type">
                {TYPES.map(([id, libelle]) => <option key={id} value={id}>{libelle}</option>)}
              </select>
              <input value={doc.url || ''} onChange={e => maj(doc.id, { url: e.target.value })} onBlur={() => sauver(doc, { url: doc.url?.trim() || null })} placeholder="Lien du document (https://…)" style={{ ...INPUT, gridColumn: 'span 2' }} aria-label="Lien" />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ ...BTN, display: 'inline-block' }}>
                {envoi === doc.id ? 'Envoi…' : 'Téléverser un fichier'}
                <input type="file" onChange={e => televerser(doc, e)} disabled={envoi === doc.id} style={{ display: 'none' }} />
              </label>
              <button type="button" onClick={() => supprimer(doc)} style={{ ...BTN, color: '#dc2626' }}>Supprimer</button>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, marginRight: 12 }}>
                <input type="checkbox" checked={!doc.visible_pour} onChange={e => { const v = e.target.checked ? null : membres.map(m => m.id); maj(doc.id, { visible_pour: v }); sauver(doc, { visible_pour: v }) }} />
                Visible pour tous
              </label>
              {doc.visible_pour && membres.map(m => (
                <label key={m.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 10 }}>
                  <input type="checkbox" checked={doc.visible_pour.includes(m.id)} onChange={() => basculerMembre(doc, m.id)} /> {m.nom}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {erreur && <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0' }}>{erreur}</p>}
      <button type="button" onClick={ajouter} style={{ ...BTN, marginTop: 10 }}>+ Ajouter un document</button>
    </div>
  )
}
