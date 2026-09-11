// src/components/DocumentsSection.jsx
//
// Documents deposes manuellement par un admin sur un dossier (preuve,
// piece d'identite, etc.) — distinct de l'historique des documents
// GENERES automatiquement (proforma/recap/badge/facture, voir
// AdminProforma.jsx "Historique"). Partage entre AdminDashboard.jsx
// (module Participants) et AdminProforma.jsx : avant ce partage,
// AdminProforma n'avait aucun moyen de deposer/voir un document, pour le
// contact principal comme pour les membres de delegation.
//
// participant_id (colonne de documents_participants) distingue un document
// PERSONNEL a un membre de la delegation (visible uniquement par lui, en
// plus des documents partages) d'un document PARTAGE par tout le dossier
// (participant_id = null, visible par le contact principal et tous les
// membres) — voir mon_dossier() cote base.

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

const ICONBTN = { background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6, flexShrink: 0 }
const ROW = { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #f1f5f9' }
const LABEL = { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }

const Icon = ({ name, size = 13, color = '#64748b' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    eye:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    trash:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    edit:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
    swap:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    upload: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    check:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  }
  return icons[name] || null
}

// Les URLs publiques Supabase Storage suivent toujours ce format ; on en
// deduit le chemin de stockage pour pouvoir supprimer l'ancien fichier lors
// d'un remplacement, sans avoir a stocker une colonne path dediee.
function storagePathFromUrl(url) {
  const marker = '/object/public/documents-participants/'
  const i = (url || '').indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

export default function DocumentsSection({ dossier, participantId = null, titre }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [remplacementId, setRemplacementId] = useState(null)
  const [editionId, setEditionId] = useState(null)
  const [libelleEdite, setLibelleEdite] = useState('')
  const fileRef = useRef(null)
  const replaceFileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('documents_participants').select('*').eq('dossier', dossier)
    q = participantId ? q.or(`participant_id.is.null,participant_id.eq.${participantId}`) : q.is('participant_id', null)
    const { data, error } = await q.order('created_at')
    if (error) console.error('Erreur chargement documents:', error)
    setDocs(data || [])
    setLoading(false)
  }, [dossier, participantId])

  useEffect(() => { load() }, [load])

  const uploadDoc = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${dossier}/${Date.now()}_${file.name}`.replace(/\s+/g, '_')
    const { error: upErr } = await supabase.storage.from('documents-participants').upload(path, file)
    if (!upErr) {
      const url = supabase.storage.from('documents-participants').getPublicUrl(path).data.publicUrl
      const { data: userData } = await supabase.auth.getUser()
      await supabase.from('documents_participants').insert({
        dossier, participant_id: participantId, type: 'autre', label: file.name, url, ajoute_par: userData?.user?.email || null,
      })
      await load()
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const remplacerFichier = async (doc, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setRemplacementId(doc.id)
    const path = `${dossier}/${Date.now()}_${file.name}`.replace(/\s+/g, '_')
    const { error: upErr } = await supabase.storage.from('documents-participants').upload(path, file)
    if (!upErr) {
      const url = supabase.storage.from('documents-participants').getPublicUrl(path).data.publicUrl
      await supabase.from('documents_participants').update({ url, label: doc.label === doc.url ? file.name : doc.label }).eq('id', doc.id)
      const ancienPath = storagePathFromUrl(doc.url)
      if (ancienPath) await supabase.storage.from('documents-participants').remove([ancienPath])
      await load()
    }
    setRemplacementId(null)
    if (replaceFileRef.current) replaceFileRef.current.value = ''
  }

  const commencerEdition = doc => { setEditionId(doc.id); setLibelleEdite(doc.label) }
  const validerEdition = async doc => {
    const label = libelleEdite.trim()
    if (label && label !== doc.label) await supabase.from('documents_participants').update({ label }).eq('id', doc.id)
    setEditionId(null)
    load()
  }

  const toggleDocVisible = async doc => {
    await supabase.from('documents_participants').update({ visible: !doc.visible }).eq('id', doc.id)
    load()
  }

  const deleteDoc = async doc => {
    await supabase.from('documents_participants').delete().eq('id', doc.id)
    const path = storagePathFromUrl(doc.url)
    if (path) await supabase.storage.from('documents-participants').remove([path])
    load()
  }

  if (loading) return null

  return (
    <div style={{ marginTop: 20 }}>
      <div style={LABEL}>
        {titre || 'Documents déposés (visibles dans son espace personnel)'}
        {participantId && ' — personnels à cette personne + partagés du dossier'}
      </div>
      {docs.map(doc => (
        <div key={doc.id} style={{ ...ROW, flexWrap: 'wrap' }}>
          {editionId === doc.id ? (
            <>
              <input
                autoFocus value={libelleEdite} onChange={e => setLibelleEdite(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') validerEdition(doc); if (e.key === 'Escape') setEditionId(null) }}
                style={{ flex: 1, minWidth: 120, padding: '5px 8px', fontSize: 12.5, fontFamily: 'inherit', border: '1.5px solid #93c5fd', borderRadius: 8, outline: 'none' }}
              />
              <button type="button" onClick={() => validerEdition(doc)} title="Valider" style={ICONBTN}><Icon name="check" color="#059669" /></button>
            </>
          ) : (
            <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 600, textDecoration: 'none', flex: 1, minWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.label}
            </a>
          )}
          {participantId && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, flexShrink: 0,
              color: doc.participant_id ? '#7c3aed' : '#0369a1', background: doc.participant_id ? '#f3e8ff' : '#e0f2fe',
            }}>
              {doc.participant_id ? 'Personnel' : 'Partagé'}
            </span>
          )}
          <button type="button" onClick={() => commencerEdition(doc)} title="Renommer" style={ICONBTN}>
            <Icon name="edit" />
          </button>
          <label style={{ ...ICONBTN, cursor: remplacementId === doc.id ? 'wait' : 'pointer' }} title="Remplacer le fichier">
            <Icon name="swap" color={remplacementId === doc.id ? '#cbd5e1' : '#64748b'} />
            <input ref={replaceFileRef} type="file" onChange={e => remplacerFichier(doc, e)} disabled={remplacementId === doc.id} style={{ display: 'none' }} />
          </label>
          <button type="button" onClick={() => toggleDocVisible(doc)} title={doc.visible ? 'Masquer' : 'Rendre visible'} style={ICONBTN}>
            <Icon name={doc.visible ? 'eye' : 'eyeOff'} color={doc.visible ? '#059669' : '#94a3b8'} />
          </button>
          <button type="button" onClick={() => deleteDoc(doc)} title="Supprimer" style={ICONBTN}>
            <Icon name="trash" color="#ef4444" />
          </button>
        </div>
      ))}
      <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '9px 12px', border: '1.5px dashed #cbd5e1', borderRadius: 10,
        fontSize: 12, fontWeight: 600, color: '#64748b', cursor: uploading ? 'not-allowed' : 'pointer', marginTop: 4,
      }}>
        <Icon name="upload" />
        {uploading ? 'Envoi en cours...' : participantId ? 'Déposer un document pour cette personne' : 'Déposer un document (badge, attestation...)'}
        <input ref={fileRef} type="file" onChange={uploadDoc} disabled={uploading} style={{ display: 'none' }} />
      </label>
    </div>
  )
}
