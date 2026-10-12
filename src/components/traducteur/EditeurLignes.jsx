// src/components/traducteur/EditeurLignes.jsx
//
// Éditeur générique d'une table de l'espace traducteurs (programme, planning, intervenants, glossaire, documents) :
// une carte par ligne, enregistrement à la sortie du champ, ajout, suppression et téléversement d'un fichier.
// Écriture protégée par les droits de l'admin (RLS) côté Supabase.

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../supabase'

const INPUT = { padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', width: '100%', background: '#fff', color: '#0f172a' }
const BTN = { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }
const TRI_DEFAUT = ['ordre'] // constante : un tableau recréé à chaque rendu relancerait le chargement en boucle
const LIBELLE = { display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 3 }

const nomSur = nom => String(nom || 'fichier').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_')
const dateHeure = iso => (iso ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' }) : '—')

export default function EditeurLignes({ table, colonnes, defaut, tri = TRI_DEFAUT, resume, libelleAjout = 'Ajouter une ligne', cleRecharge = 0, extra = null }) {
  const [lignes, setLignes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(null)

  const charger = useCallback(async () => {
    let q = supabase.from(table).select('*')
    tri.forEach(c => { q = q.order(c) })
    const { data, error } = await q
    if (error) { setErreur(error.message); return }
    setErreur('')
    setLignes(data || [])
  }, [table, tri])

  useEffect(() => {
    const minuteur = setTimeout(charger, 0)
    return () => clearTimeout(minuteur)
  }, [charger, cleRecharge])

  const maj = (id, champs) => setLignes(ls => ls.map(l => (l.id === id ? { ...l, ...champs } : l)))
  const sauver = async (id, champs) => {
    setErreur('')
    const { error } = await supabase.from(table).update(champs).eq('id', id)
    if (error) setErreur(error.message)
  }
  const valeurBase = (col, valeur) => {
    if (col.nombre) return Number(valeur) || 0
    return col.requis ? String(valeur ?? '') : (String(valeur ?? '').trim() === '' ? null : String(valeur).trim())
  }

  const ajouter = async () => {
    setErreur('')
    const ordre = (lignes || []).reduce((m, l) => Math.max(m, l.ordre || 0), 0) + 1
    const { error } = await supabase.from(table).insert({ ...defaut, ordre })
    if (error) { setErreur(error.message); return }
    charger()
  }
  const supprimer = async ligne => {
    if (!window.confirm(`Supprimer « ${resume(ligne) || 'cette ligne'} » ?`)) return
    const { error } = await supabase.from(table).delete().eq('id', ligne.id)
    if (error) { setErreur(error.message); return }
    charger()
  }
  const televerser = async (ligne, e) => {
    const fichier = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!fichier) return
    setEnvoi(ligne.id); setErreur('')
    // chemin non devinable (identifiant aléatoire) : le bucket est public, le lien n'est connu que de l'espace
    const chemin = `traducteurs/${crypto.randomUUID()}_${nomSur(fichier.name)}`
    const { error } = await supabase.storage.from('documents-intervenants').upload(chemin, fichier)
    setEnvoi(null)
    if (error) { setErreur(`Échec de l'envoi : ${error.message}`); return }
    const url = supabase.storage.from('documents-intervenants').getPublicUrl(chemin).data.publicUrl
    maj(ligne.id, { url })
    sauver(ligne.id, { url })
  }

  if (lignes === null) return <p style={{ fontSize: 12.5, color: '#94a3b8' }}>{erreur || 'Chargement…'}</p>

  return (
    <div>
      {erreur && <p role="alert" style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{erreur}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <button type="button" onClick={ajouter} style={{ ...BTN, background: '#00367F', color: '#fff', borderColor: '#00367F', marginRight: 8, marginBottom: 6 }}>+ {libelleAjout}</button>
        {extra}
        <span style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{lignes.length} ligne(s) · enregistrement automatique à la sortie d'un champ</span>
      </div>
      {lignes.map(ligne => (
        <div key={ligne.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, background: '#f8fafc', marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
            {colonnes.map(col => {
              const valeur = ligne[col.cle]
              const cellule = { gridColumn: col.large ? '1 / -1' : undefined }
              if (col.type === 'lecture') {
                return <div key={col.cle} style={cellule}><span style={LIBELLE}>{col.label}</span><div style={{ fontSize: 13, color: '#475569', padding: '8px 0' }}>{dateHeure(valeur)}</div></div>
              }
              if (col.type === 'select') {
                return (
                  <label key={col.cle} style={cellule}><span style={LIBELLE}>{col.label}</span>
                    <select value={valeur ?? ''} style={INPUT} onChange={e => { const v = col.nombre ? Number(e.target.value) : e.target.value; maj(ligne.id, { [col.cle]: v }); sauver(ligne.id, { [col.cle]: v === '' ? null : v }).then(() => { if (col.cle === 'statut') charger() }) }}>
                      {(col.optionnel ? [['', '—']] : []).concat(col.options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </label>
                )
              }
              if (col.type === 'fichier') {
                return (
                  <div key={col.cle} style={{ gridColumn: '1 / -1' }}>
                    <span style={LIBELLE}>{col.label}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input value={valeur || ''} placeholder="Lien du fichier (ou téléversez-le)" onChange={e => maj(ligne.id, { [col.cle]: e.target.value })} onBlur={() => sauver(ligne.id, { [col.cle]: String(valeur || '').trim() || null })} style={{ ...INPUT, flex: '1 1 260px', marginRight: 8 }} />
                      <input type="file" onChange={e => televerser(ligne, e)} disabled={envoi === ligne.id} style={{ fontSize: 12, marginRight: 8 }} aria-label="Téléverser un fichier" />
                      {valeur && <a href={valeur} target="_blank" rel="noopener noreferrer" style={{ ...BTN, textDecoration: 'none', marginRight: 6 }}>Ouvrir</a>}
                      {valeur && <button type="button" style={BTN} onClick={() => { maj(ligne.id, { [col.cle]: null }); sauver(ligne.id, { [col.cle]: null }) }}>Retirer</button>}
                      {envoi === ligne.id && <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>Envoi…</span>}
                    </div>
                  </div>
                )
              }
              const Champ = col.type === 'area' ? 'textarea' : 'input'
              return (
                <label key={col.cle} style={cellule}><span style={LIBELLE}>{col.label}</span>
                  <Champ value={valeur ?? ''} rows={col.type === 'area' ? 3 : undefined} type={col.nombre ? 'number' : 'text'} style={{ ...INPUT, resize: 'vertical' }}
                    onChange={e => maj(ligne.id, { [col.cle]: e.target.value })}
                    onBlur={() => sauver(ligne.id, { [col.cle]: valeurBase(col, valeur) })} />
                </label>
              )
            })}
          </div>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button type="button" onClick={() => supprimer(ligne)} style={{ ...BTN, color: '#b91c1c', borderColor: '#fecaca' }}>Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  )
}
