// src/pages/AdminIntervenants.jsx
//
// Gestion admin de l'espace intervenants (voir src/pages/EspaceIntervenant.jsx) :
// liste des intervenants, code d'acces partage, et documents par intervenant
// (reutilise DocumentsSection sur documents_intervenants / documents-intervenants).

import { useState, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../supabase'
import DocumentsSection from '../components/DocumentsSection'
import { generateQrCard } from '../utils/generateQrCard'

const CARD = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }
const INPUT = { padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 9, outline: 'none', boxSizing: 'border-box', width: '100%' }
const BTN_PRIMARY = { padding: '9px 16px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: '#000E91', cursor: 'pointer', fontFamily: 'inherit' }
const BTN_GHOST = { padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#64748b', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }

function interventionsToTexte(interventions) {
  return (interventions || []).map(iv => [iv.jour, iv.heure, iv.titre, iv.avec || ''].join(' | ')).join('\n')
}

function texteToInterventions(texte) {
  return texte.split('\n').map(l => l.trim()).filter(Boolean).map(ligne => {
    const [jour, heure, titre, avec] = ligne.split('|').map(s => (s || '').trim())
    return { jour: Number(jour) || jour, heure, titre, ...(avec ? { avec } : {}) }
  })
}

function FormeIntervenant({ initial, nextOrdre, onCancel, onSaved }) {
  const [nom, setNom] = useState(initial?.nom || '')
  const [prenom, setPrenom] = useState(initial?.prenom || '')
  const [organisation, setOrganisation] = useState(initial?.organisation || '')
  const [fonction, setFonction] = useState(initial?.fonction || '')
  const [pays, setPays] = useState(initial?.pays || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [telephone, setTelephone] = useState(initial?.telephone || '')
  const [codeAcces, setCodeAcces] = useState(initial?.code_acces || 'COPAF2026-SPEAKER')
  const [interventionsTxt, setInterventionsTxt] = useState(interventionsToTexte(initial?.interventions))
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')

  const save = async () => {
    if (!nom.trim()) { setErreur('Le nom est obligatoire.'); return }
    if (!codeAcces.trim()) { setErreur("Le code d'accès est obligatoire."); return }
    setSaving(true); setErreur('')
    const champs = {
      nom: nom.trim(), prenom: prenom.trim(), organisation: organisation.trim() || null,
      fonction: fonction.trim() || null, pays: pays.trim() || null, email: email.trim() || null,
      telephone: telephone.trim() || null, code_acces: codeAcces.trim(), interventions: texteToInterventions(interventionsTxt),
    }
    const resultat = initial
      ? await supabase.from('intervenants').update(champs).eq('id', initial.id)
      : await supabase.from('intervenants').insert({ ...champs, dossier: `INT2026-${Date.now().toString().slice(-6)}`, ordre: nextOrdre })
    const { error } = resultat
    setSaving(false)
    if (error) { setErreur(error.message); return }
    onSaved()
  }

  return (
    <div style={{ ...CARD, marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nom *</label>
          <input value={nom} onChange={e => setNom(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Prénom</label>
          <input value={prenom} onChange={e => setPrenom(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Organisation</label>
          <input value={organisation} onChange={e => setOrganisation(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Fonction</label>
          <input value={fonction} onChange={e => setFonction(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Pays</label>
          <input value={pays} onChange={e => setPays(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Téléphone</label>
          <input value={telephone} onChange={e => setTelephone(e.target.value)} style={INPUT} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
            Code d'accès personnel *
          </label>
          <input value={codeAcces} onChange={e => setCodeAcces(e.target.value)} style={{ ...INPUT, maxWidth: 280 }} />
        </div>
      </div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
        Interventions — une par ligne : Jour | Horaire | Titre | Mention co-intervenant (optionnel, texte libre — ex. "Avec Mme X" ou "Assisté de M. Y")
      </label>
      <textarea
        value={interventionsTxt} onChange={e => setInterventionsTxt(e.target.value)} rows={4}
        placeholder="1 | 10h15–11h30 | Plénière L'IA au cœur de la révolution du Smart Port"
        style={{ ...INPUT, fontFamily: 'monospace', fontSize: 12, resize: 'vertical', marginBottom: 12 }}
      />
      {erreur && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{erreur}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={save} disabled={saving} style={BTN_PRIMARY}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        <button type="button" onClick={onCancel} style={BTN_GHOST}>Annuler</button>
      </div>
    </div>
  )
}

function IntervenantQr({ iv }) {
  const [qr, setQr] = useState('')

  useEffect(() => {
    if (!iv.badge_token) { setQr(''); return }
    let cancelled = false
    const badgeUrl = `https://copaf-ports.com/badge/${iv.badge_token}`
    QRCode.toDataURL(badgeUrl, { width: 200, margin: 1, color: { dark: '#000E91', light: '#FFFFFF' } })
      .then(url => { if (!cancelled) setQr(url) })
      .catch(() => { if (!cancelled) setQr('') })
    return () => { cancelled = true }
  }, [iv.badge_token])

  const telecharger = () => {
    if (!qr) return
    generateQrCard({
      qrDataUrl: qr, nomPrenom: `${iv.prenom} ${iv.nom}`.trim(), sousTitre: iv.fonction, dossier: iv.dossier,
      fileName: `QR-badge-${iv.dossier}.png`,
    })
  }

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16, marginTop: 16 }}>
      {qr && <img src={qr} alt="QR code badge" style={{ width: 72, height: 72, borderRadius: 10, border: '1.5px solid #e2e8f0', flexShrink: 0 }} />}
      <button type="button" onClick={telecharger} disabled={!qr} style={{ ...BTN_GHOST, opacity: qr ? 1 : 0.5 }}>
        Télécharger le QR / badge
      </button>
    </div>
  )
}

export default function AdminIntervenants() {
  const [intervenants, setIntervenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [ajout, setAjout] = useState(false)
  const [edition, setEdition] = useState(null)
  const [ouvert, setOuvert] = useState(null)
  const [copie, setCopie] = useState(false)
  const [codeCopieId, setCodeCopieId] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [overId, setOverId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: iv } = await supabase.from('intervenants').select('*').order('ordre')
    setIntervenants(iv || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const copierCode = async iv => {
    try { await navigator.clipboard.writeText(iv.code_acces); setCodeCopieId(iv.id); setTimeout(() => setCodeCopieId(null), 2000) } catch { /* clipboard indisponible */ }
  }

  const onDragStartRow = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'move' }
  const onDragOverRow = (e, id) => { e.preventDefault(); if (id !== overId) setOverId(id) }
  const onDragEndRow = () => { setDraggedId(null); setOverId(null) }
  const onDropRow = async (e, targetId) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setOverId(null); return }
    const fromIdx = intervenants.findIndex(x => x.id === draggedId)
    const toIdx = intervenants.findIndex(x => x.id === targetId)
    const reordered = [...intervenants]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    setIntervenants(reordered)
    setDraggedId(null); setOverId(null)
    await Promise.all(reordered.map((iv, i) => supabase.from('intervenants').update({ ordre: i + 1 }).eq('id', iv.id)))
  }

  const supprimer = async iv => {
    if (!window.confirm(`Supprimer ${iv.prenom} ${iv.nom} de la liste des intervenants ?`)) return
    await supabase.from('intervenants').delete().eq('id', iv.id)
    load()
  }

  const lienEspace = `${window.location.origin}/intervenant`
  const copierLien = async () => {
    try { await navigator.clipboard.writeText(lienEspace); setCopie(true); setTimeout(() => setCopie(false), 2000) } catch { /* clipboard indisponible */ }
  }

  if (loading) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Chargement...</p>

  return (
    <div>
      <div style={{ ...CARD, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Accès à l'espace intervenant</div>
        <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 12px' }}>
          Chaque intervenant a son propre code (modifiable dans sa fiche ci-dessous). Communiquez-lui son nom + son code + le lien ci-dessous.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
          <span>Lien de l'espace : <strong>{lienEspace}</strong></span>
          <button type="button" onClick={copierLien} style={{ ...BTN_GHOST, padding: '4px 10px' }}>{copie ? 'Copié !' : 'Copier'}</button>
        </div>
      </div>

      {ajout && <FormeIntervenant nextOrdre={intervenants.length + 1} onCancel={() => setAjout(false)} onSaved={() => { setAjout(false); load() }} />}
      {edition && (
        <FormeIntervenant initial={edition} onCancel={() => setEdition(null)} onSaved={() => { setEdition(null); load() }} />
      )}

      {!ajout && !edition && (
        <button type="button" onClick={() => setAjout(true)} style={{ ...BTN_PRIMARY, marginBottom: 16 }}>
          + Ajouter un intervenant
        </button>
      )}

      {intervenants.map(iv => (
        <div
          key={iv.id}
          onDragOver={e => onDragOverRow(e, iv.id)}
          onDrop={e => onDropRow(e, iv.id)}
          style={{
            ...CARD, marginBottom: 12, padding: 0, overflow: 'hidden',
            opacity: draggedId === iv.id ? 0.4 : 1,
            outline: overId === iv.id && draggedId && draggedId !== iv.id ? '2px solid #0073F4' : 'none',
          }}
        >
          <div
            onClick={() => setOuvert(ouvert === iv.id ? null : iv.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                draggable
                onDragStart={e => onDragStartRow(e, iv.id)}
                onDragEnd={onDragEndRow}
                onClick={e => e.stopPropagation()}
                title="Glisser pour réordonner"
                style={{ cursor: 'grab', color: '#cbd5e1', fontSize: 16, lineHeight: 1, letterSpacing: -2, userSelect: 'none', flexShrink: 0 }}
              >
                ⠿
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{iv.prenom} {iv.nom}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{iv.fonction}{iv.organisation ? ` — ${iv.organisation}` : ''} · {iv.dossier}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
              <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#0369a1', background: '#e0f2fe', borderRadius: 8, padding: '5px 10px' }}>
                {iv.code_acces}
              </span>
              <button type="button" onClick={() => copierCode(iv)} style={{ ...BTN_GHOST, padding: '5px 10px' }}>{codeCopieId === iv.id ? 'Copié !' : 'Copier'}</button>
              <button type="button" onClick={() => { setEdition(iv); setAjout(false) }} style={BTN_GHOST}>Modifier</button>
              <button type="button" onClick={() => supprimer(iv)} style={{ ...BTN_GHOST, color: '#dc2626', borderColor: '#fecaca' }}>Supprimer</button>
            </div>
          </div>
          {ouvert === iv.id && (
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
              <IntervenantQr iv={iv} />
              <DocumentsSection
                dossier={iv.dossier} table="documents_intervenants" bucket="documents-intervenants"
                titre={`Documents — ${iv.prenom} ${iv.nom}`}
              />
            </div>
          )}
        </div>
      ))}

      {intervenants.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Aucun intervenant enregistré pour le moment.</p>}
    </div>
  )
}
