// src/components/ValidationDocuments.jsx
//
// Permet a l'admin de valider ou rejeter (avec motif) la photo deposee par
// un delegue depuis son espace personnel — distinct de DocumentsSection
// (documents_participants/documents_intervenants) : photo_url vit
// directement sur inscriptions / inscription_participants / intervenants.
// Le passeport n'est plus collecte sous forme de scan (numero + noms saisis
// par la personne, visibles dans sa fiche).
//
// `dossier` est ici le dossier INDIVIDUEL de la personne (ex.
// COPAF2026-97293 pour un membre de delegation), pas le dossier groupe.
// L'admin lit les tables directement (ses droits RLS le permettent).
//
// Un seul email part par decision (notify-action, types document_valide /
// document_rejete, champ `champs` = tableau).

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

// Photo du dossier, cherchee dans les 3 tables (meme cascade que partout ailleurs).
async function trouverPhoto(dossier) {
  const { data: insc } = await supabase.from('inscriptions').select('photo_url').eq('dossier', dossier).maybeSingle()
  if (insc) return { photo_url: insc.photo_url }
  const { data: part } = await supabase.from('inscription_participants').select('photo_url').eq('dossier', dossier).maybeSingle()
  if (part) return { photo_url: part.photo_url }
  const { data: interv } = await supabase.from('intervenants').select('photo_url').eq('dossier', dossier).maybeSingle()
  return interv ? { photo_url: interv.photo_url } : null
}

const LABEL = { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }
const ROW = { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }
const BTN = { padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }

const CHAMPS = [
  { key: 'photo', label: 'Photo' },
]

export default function ValidationDocuments({ dossier }) {
  const [record, setRecord] = useState(null)
  const [etats, setEtats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selection, setSelection] = useState({})
  const [motifOuvert, setMotifOuvert] = useState(false)
  const [motif, setMotif] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!dossier) { setLoading(false); return }
    const [lookup, { data: validations }] = await Promise.all([
      trouverPhoto(dossier),
      supabase.from('document_validations').select('champ, statut, motif').eq('dossier', dossier),
    ])
    setRecord(lookup || null)
    const map = {}
    ;(validations || []).forEach(r => { map[r.champ] = r })
    setEtats(map)
    // Pre-coche par defaut les documents pas encore valides (le cas le plus
    // courant : cocher/decocher sert surtout a exclure un document deja bon).
    setSelection(sel => {
      const next = { ...sel }
      CHAMPS.forEach(c => { if (!(c.key in next)) next[c.key] = map[c.key]?.statut !== 'valide' })
      return next
    })
    setLoading(false)
  }, [dossier])

  useEffect(() => { load() }, [load])

  const champsPresents = record ? record.photo_url ? CHAMPS : [] : []
  const champsCoches = champsPresents.filter(c => selection[c.key]).map(c => c.key)

  const toggle = key => setSelection(sel => ({ ...sel, [key]: !sel[key] }))

  const enregistrerValidations = async (champs, statut, motifTexte) => {
    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    const lignes = champs.map(champ => ({
      dossier, champ, statut, motif: statut === 'rejete' ? motifTexte : null,
      valide_par: userData?.user?.email || null, valide_le: new Date().toISOString(),
    }))
    await supabase.from('document_validations').upsert(lignes, { onConflict: 'dossier,champ' })
    supabase.functions.invoke('notify-action', {
      body: { dossier, type: statut === 'valide' ? 'document_valide' : 'document_rejete', champs, motif: motifTexte },
    }).catch(() => {})
    await load()
    setSaving(false)
  }

  const validerSelection = () => { if (champsCoches.length) enregistrerValidations(champsCoches, 'valide') }
  const ouvrirRejet = () => { if (champsCoches.length) { setMotifOuvert(true); setMotif('') } }
  const envoyerRejet = () => { if (motif.trim() && champsCoches.length) { enregistrerValidations(champsCoches, 'rejete', motif.trim()); setMotifOuvert(false) } }

  if (loading || !record || champsPresents.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <div style={LABEL}>Validation de la photo</div>
      {champsPresents.map(c => {
        const etat = etats[c.key]
        const url = record.photo_url
        return (
          <div key={c.key} style={ROW}>
            <input type="checkbox" checked={!!selection[c.key]} onChange={() => toggle(c.key)} style={{ width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }} />
            <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', textDecoration: 'none', flex: 1, minWidth: 100 }}>
              {c.label}
            </a>
            {etat?.statut === 'valide' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, color: '#065f46', background: '#d1fae5' }}>Validé</span>
            )}
            {etat?.statut === 'rejete' && (
              <span title={etat.motif} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, color: '#991b1b', background: '#fee2e2' }}>
                Rejeté : {etat.motif}
              </span>
            )}
          </div>
        )
      })}

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={validerSelection} disabled={!champsCoches.length || saving} style={{ ...BTN, color: '#065f46', background: '#d1fae5', opacity: !champsCoches.length || saving ? 0.5 : 1 }}>
          Valider la sélection{champsCoches.length > 1 ? ` (${champsCoches.length})` : ''}
        </button>
        <button type="button" onClick={ouvrirRejet} disabled={!champsCoches.length || saving} style={{ ...BTN, color: '#991b1b', background: '#fee2e2', opacity: !champsCoches.length || saving ? 0.5 : 1 }}>
          Rejeter la sélection{champsCoches.length > 1 ? ` (${champsCoches.length})` : ''}
        </button>
      </div>

      {motifOuvert && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            autoFocus value={motif} onChange={e => setMotif(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') envoyerRejet(); if (e.key === 'Escape') setMotifOuvert(false) }}
            placeholder="Motif du rejet (ex. photo floue)"
            style={{ flex: 1, minWidth: 120, padding: '7px 10px', fontSize: 12, fontFamily: 'inherit', border: '1.5px solid #fecaca', borderRadius: 8, outline: 'none' }}
          />
          <button type="button" onClick={envoyerRejet} disabled={!motif.trim() || saving} style={{ ...BTN, color: '#fff', background: '#dc2626', opacity: !motif.trim() || saving ? 0.5 : 1 }}>
            Envoyer
          </button>
          <button type="button" onClick={() => setMotifOuvert(false)} style={{ ...BTN, color: '#64748b', background: '#f1f5f9' }}>
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}
