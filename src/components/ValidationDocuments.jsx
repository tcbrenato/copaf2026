// src/components/ValidationDocuments.jsx
//
// Permet a l'admin de valider ou rejeter (avec motif) la photo et le
// passeport deposes par un delegue depuis son espace personnel — distinct
// de DocumentsSection (documents_participants/documents_intervenants) :
// photo_url/passeport_url vivent directement sur inscriptions /
// inscription_participants / intervenants (voir badge_upload_url).
//
// `dossier` est ici le dossier INDIVIDUEL de la personne (ex.
// COPAF2026-97293 pour un membre de delegation), pas le dossier groupe —
// badge_lookup_by_dossier() retrouve photo/passeport/email pour n'importe
// quel dossier individuel, sans avoir a savoir dans quelle table il vit.
//
// Notifie la personne par email a chaque decision (notify-action, types
// document_valide / document_rejete).

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

const LABEL = { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }
const ROW = { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }
const BTN = { padding: '5px 10px', borderRadius: 8, border: 'none', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }

const CHAMPS = [
  { key: 'photo', label: 'Photo' },
  { key: 'passeport', label: 'Passeport' },
]

export default function ValidationDocuments({ dossier }) {
  const [record, setRecord] = useState(null)
  const [etats, setEtats] = useState({})
  const [loading, setLoading] = useState(true)
  const [motifChamp, setMotifChamp] = useState(null)
  const [motif, setMotif] = useState('')
  const [saving, setSaving] = useState(null)

  const load = useCallback(async () => {
    if (!dossier) { setLoading(false); return }
    const [{ data: lookup }, { data: validations }] = await Promise.all([
      supabase.rpc('badge_lookup_by_dossier', { p_dossier: dossier }).maybeSingle(),
      supabase.from('document_validations').select('champ, statut, motif').eq('dossier', dossier),
    ])
    setRecord(lookup || null)
    const map = {}
    ;(validations || []).forEach(r => { map[r.champ] = r })
    setEtats(map)
    setLoading(false)
  }, [dossier])

  useEffect(() => { load() }, [load])

  const valider = async champ => {
    setSaving(champ)
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('document_validations').upsert(
      { dossier, champ, statut: 'valide', motif: null, valide_par: userData?.user?.email || null, valide_le: new Date().toISOString() },
      { onConflict: 'dossier,champ' },
    )
    supabase.functions.invoke('notify-action', { body: { dossier, type: 'document_valide', label: champ } }).catch(() => {})
    await load()
    setSaving(null)
  }

  const rejeter = async champ => {
    if (!motif.trim()) return
    setSaving(champ)
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('document_validations').upsert(
      { dossier, champ, statut: 'rejete', motif: motif.trim(), valide_par: userData?.user?.email || null, valide_le: new Date().toISOString() },
      { onConflict: 'dossier,champ' },
    )
    supabase.functions.invoke('notify-action', { body: { dossier, type: 'document_rejete', label: champ, motif: motif.trim() } }).catch(() => {})
    setMotifChamp(null); setMotif('')
    await load()
    setSaving(null)
  }

  if (loading || !record) return null

  const urls = { photo: record.photo_url, passeport: record.passeport_url }
  const champsPresents = CHAMPS.filter(c => urls[c.key])
  if (champsPresents.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <div style={LABEL}>Validation photo / passeport</div>
      {champsPresents.map(c => {
        const etat = etats[c.key]
        return (
          <div key={c.key}>
            <div style={ROW}>
              <a href={urls[c.key]} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', textDecoration: 'none', flex: 1, minWidth: 100 }}>
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
              {etat?.statut !== 'valide' && (
                <button type="button" onClick={() => valider(c.key)} disabled={saving === c.key} style={{ ...BTN, color: '#065f46', background: '#d1fae5', opacity: saving === c.key ? 0.6 : 1 }}>
                  Valider
                </button>
              )}
              {motifChamp !== c.key && (
                <button type="button" onClick={() => { setMotifChamp(c.key); setMotif('') }} disabled={saving === c.key} style={{ ...BTN, color: '#991b1b', background: '#fee2e2', opacity: saving === c.key ? 0.6 : 1 }}>
                  Rejeter
                </button>
              )}
            </div>
            {motifChamp === c.key && (
              <div style={{ display: 'flex', gap: 8, paddingBottom: 10 }}>
                <input
                  autoFocus value={motif} onChange={e => setMotif(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') rejeter(c.key); if (e.key === 'Escape') setMotifChamp(null) }}
                  placeholder="Motif du rejet (ex. photo floue)"
                  style={{ flex: 1, minWidth: 120, padding: '6px 10px', fontSize: 12, fontFamily: 'inherit', border: '1.5px solid #fecaca', borderRadius: 8, outline: 'none' }}
                />
                <button type="button" onClick={() => rejeter(c.key)} disabled={!motif.trim() || saving === c.key} style={{ ...BTN, color: '#fff', background: '#dc2626', opacity: !motif.trim() || saving === c.key ? 0.5 : 1 }}>
                  Envoyer
                </button>
                <button type="button" onClick={() => setMotifChamp(null)} style={{ ...BTN, color: '#64748b', background: '#f1f5f9' }}>
                  Annuler
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
