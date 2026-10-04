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
function storagePathFromUrl(url, bucket) {
  const marker = `/object/public/${bucket}/`
  const i = (url || '').indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

// Supabase Storage rejette les cles contenant des caracteres accentues (ex.
// "MATURITÉ" — erreur "Invalid key") ; on retire les accents et on remplace
// tout caractere hors [A-Za-z0-9._-] par un underscore avant l'upload.
function sanitizeFileName(name) {
  const sansAccents = (name || 'fichier').normalize('NFD').replace(/[̀-ͯ]/g, '')
  return sansAccents.replace(/[^A-Za-z0-9._-]+/g, '_')
}

// `table`/`bucket` permettent de reutiliser ce composant pour l'espace
// intervenants (documents_intervenants / documents-intervenants), qui n'a
// pas de participant_id et n'exige pas de session Supabase Auth — d'ou
// `ajoutePar` en override, l'appelant public n'ayant pas de session admin
// dont on pourrait lire l'email via supabase.auth.getUser().
// `notifier` : quand la personne depose elle-meme (ex. EspaceIntervenant.jsx),
// notifie admin + confirmation a la personne (type 'document'). Cote admin
// (notifier=false, valeur par defaut), on notifie plutot la personne qu'un
// document l'attend dans son espace (type 'document_admin') — voir
// supabase/functions/notify-action.
export default function DocumentsSection({ dossier, participantId = null, titre, table = 'documents_participants', bucket = 'documents-participants', ajoutePar, onDocsChange, notifier = false, lang = 'fr' }) {
  const en = lang === 'en'
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [remplacementId, setRemplacementId] = useState(null)
  const [editionId, setEditionId] = useState(null)
  const [libelleEdite, setLibelleEdite] = useState('')
  const [erreur, setErreur] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)
  const replaceFileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from(table).select('*').eq('dossier', dossier)
    if (table === 'documents_participants') {
      q = participantId ? q.or(`participant_id.is.null,participant_id.eq.${participantId}`) : q.is('participant_id', null)
    }
    const { data, error } = await q.order('created_at')
    if (error) console.error('Erreur chargement documents:', error)
    setDocs(data || [])
    onDocsChange?.(data || [])
    setLoading(false)
  }, [dossier, participantId, table])

  useEffect(() => { load() }, [load])

  const uploadFile = async file => {
    if (!file) return
    setUploading(true); setErreur('')
    const path = `${dossier}/${Date.now()}_${sanitizeFileName(file.name)}`
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file)
    if (upErr) {
      setErreur(`${en ? 'File upload failed: ' : "Échec de l'envoi du fichier : "}${upErr.message}`)
    } else {
      const url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
      let auteur = ajoutePar || null
      if (!auteur) {
        const { data: userData } = await supabase.auth.getUser()
        auteur = userData?.user?.email || null
      }
      const champs = { dossier, type: 'autre', label: file.name, url, ajoute_par: auteur }
      if (table === 'documents_participants') champs.participant_id = participantId
      const { error: insErr } = await supabase.from(table).insert(champs)
      if (insErr) {
        // Le fichier est deja sur le stockage a ce stade ; seul l'enregistrement
        // en base a echoue (ex. contrainte de base de donnees) — sans ce
        // message, le depot semblait avoir reussi alors que rien n'etait
        // visible ensuite (bug reel rencontre : cf. contrainte dossier retiree
        // en migration).
        setErreur(`${en ? 'File uploaded but not saved: ' : 'Fichier envoyé mais non enregistré : '}${insErr.message}`)
      } else {
        if (notifier) supabase.functions.invoke('notify-action', { body: { dossier, type: 'document' } }).catch(() => {})
        else supabase.functions.invoke('notify-action', { body: { dossier, type: 'document_admin', label: file.name } }).catch(() => {})
        await load()
      }
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const uploadDoc = e => uploadFile(e.target.files?.[0])

  const onDropZoneDrop = e => {
    e.preventDefault()
    setDragOver(false)
    if (uploading) return
    uploadFile(e.dataTransfer.files?.[0])
  }

  const remplacerFichier = async (doc, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setRemplacementId(doc.id); setErreur('')
    const path = `${dossier}/${Date.now()}_${sanitizeFileName(file.name)}`
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file)
    if (upErr) {
      setErreur(`${en ? 'File upload failed: ' : "Échec de l'envoi du fichier : "}${upErr.message}`)
    } else {
      const url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
      const { error: updErr } = await supabase.from(table).update({ url, label: doc.label === doc.url ? file.name : doc.label }).eq('id', doc.id)
      if (updErr) {
        setErreur(`${en ? 'File uploaded but not saved: ' : 'Fichier envoyé mais non enregistré : '}${updErr.message}`)
      } else {
        const ancienPath = storagePathFromUrl(doc.url, bucket)
        if (ancienPath) await supabase.storage.from(bucket).remove([ancienPath])
        if (notifier) supabase.functions.invoke('notify-action', { body: { dossier, type: 'document' } }).catch(() => {})
        else supabase.functions.invoke('notify-action', { body: { dossier, type: 'document_admin', label: doc.label === doc.url ? file.name : doc.label } }).catch(() => {})
        await load()
      }
    }
    setRemplacementId(null)
    if (replaceFileRef.current) replaceFileRef.current.value = ''
  }

  const commencerEdition = doc => { setEditionId(doc.id); setLibelleEdite(doc.label) }
  const validerEdition = async doc => {
    const label = libelleEdite.trim()
    if (label && label !== doc.label) await supabase.from(table).update({ label }).eq('id', doc.id)
    setEditionId(null)
    load()
  }

  const toggleDocVisible = async doc => {
    await supabase.from(table).update({ visible: !doc.visible }).eq('id', doc.id)
    load()
  }

  // Cote admin : type du document. « Badge » et « Attestation » alimentent les boutons dedies de l'espace du participant.
  const changerType = async (doc, type) => {
    await supabase.from(table).update({ type }).eq('id', doc.id)
    load()
  }

  const deleteDoc = async doc => {
    await supabase.from(table).delete().eq('id', doc.id)
    const path = storagePathFromUrl(doc.url, bucket)
    if (path) await supabase.storage.from(bucket).remove([path])
    load()
  }

  // Types proposes cote admin : « Badge », « Attestation » (et, pour l'equipe, « Guide » et « Fiche de voyage ») alimentent les boutons dedies
  const typesDoc = [['autre', 'Autre', 'Other'], ['badge', 'Badge', 'Badge'], ...(table === 'documents_intervenants' ? [['guide', 'Guide du participant', 'Participant guide'], ['fiche', 'Fiche de voyage', 'Travel sheet']] : []), ['attestation', 'Attestation', 'Certificate']]

  if (loading) return null

  return (
    <div style={{ marginTop: 20 }}>
      <div style={LABEL}>
        {titre || (en ? 'Uploaded documents (visible in their personal space)' : 'Documents déposés (visibles dans son espace personnel)')}
        {participantId && (en ? ' - personal to this person + shared with the file' : ' - personnels à cette personne + partagés du dossier')}
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
              <button type="button" onClick={() => validerEdition(doc)} title={en ? 'Confirm' : 'Valider'} style={ICONBTN}><Icon name="check" color="#059669" /></button>
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
              {doc.participant_id ? (en ? 'Personal' : 'Personnel') : (en ? 'Shared' : 'Partagé')}
            </span>
          )}
          {!notifier && (
            <select
              value={doc.type || 'autre'} onChange={e => changerType(doc, e.target.value)}
              title={en ? 'Type: Badge and Certificate feed the dedicated buttons in their personal space' : "Type : « Badge » et « Attestation » alimentent les boutons dédiés de son espace personnel"}
              style={{ fontSize: 11, fontWeight: 700, fontFamily: 'inherit', padding: '3px 6px', borderRadius: 8, border: '1.5px solid #cbd5e1', background: '#fff', color: doc.type === 'badge' || doc.type === 'attestation' ? '#059669' : '#64748b', cursor: 'pointer', flexShrink: 0 }}
            >
              {typesDoc.map(([valeur, fr, anglais]) => <option key={valeur} value={valeur}>{en ? anglais : fr}</option>)}
              {!typesDoc.some(([valeur]) => valeur === doc.type) && <option value={doc.type}>{doc.type}</option>}
            </select>
          )}
          <button type="button" onClick={() => commencerEdition(doc)} title={en ? 'Rename' : 'Renommer'} style={ICONBTN}>
            <Icon name="edit" />
          </button>
          <label style={{ ...ICONBTN, cursor: remplacementId === doc.id ? 'wait' : 'pointer' }} title={en ? 'Replace the file' : 'Remplacer le fichier'}>
            <Icon name="swap" color={remplacementId === doc.id ? '#cbd5e1' : '#64748b'} />
            <input ref={replaceFileRef} type="file" onChange={e => remplacerFichier(doc, e)} disabled={remplacementId === doc.id} style={{ display: 'none' }} />
          </label>
          <button type="button" onClick={() => toggleDocVisible(doc)} title={doc.visible ? (en ? 'Hide' : 'Masquer') : (en ? 'Make visible' : 'Rendre visible')} style={ICONBTN}>
            <Icon name={doc.visible ? 'eye' : 'eyeOff'} color={doc.visible ? '#059669' : '#94a3b8'} />
          </button>
          <button type="button" onClick={() => deleteDoc(doc)} title={en ? 'Delete' : 'Supprimer'} style={ICONBTN}>
            <Icon name="trash" color="#ef4444" />
          </button>
        </div>
      ))}
      {erreur && (
        <p style={{ fontSize: 11.5, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 10px', marginTop: 6, marginBottom: 0 }}>
          {erreur}
        </p>
      )}
      <label
        onDragOver={e => { e.preventDefault(); if (!uploading) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDropZoneDrop}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '9px 12px', border: `1.5px dashed ${dragOver ? '#0073F4' : '#cbd5e1'}`, borderRadius: 10,
          background: dragOver ? '#EBF3FF' : 'transparent',
          fontSize: 12, fontWeight: 600, color: dragOver ? '#0073F4' : '#64748b', cursor: uploading ? 'not-allowed' : 'pointer', marginTop: 4,
          transition: 'all .15s',
        }}
      >
        <Icon name="upload" color={dragOver ? '#0073F4' : '#64748b'} />
        {uploading ? (en ? 'Uploading...' : 'Envoi en cours...') : dragOver ? (en ? 'Drop the file here' : 'Déposez le fichier ici') : participantId ? 'Déposer un document pour cette personne (ou glisser-déposer)' : (en ? 'Upload a document (badge, certificate...) - or drag and drop' : 'Déposer un document (badge, attestation...) - ou glisser-déposer')}
        <input ref={fileRef} type="file" onChange={uploadDoc} disabled={uploading} style={{ display: 'none' }} />
      </label>
    </div>
  )
}
