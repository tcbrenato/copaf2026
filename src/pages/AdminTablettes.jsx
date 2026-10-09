// src/pages/AdminTablettes.jsx
//
// Onglet admin « Tablettes » (aussi accessible via /admin/tablettes) : liens personnels de connexion automatique à /tablette.
// Génération (une ou en lot), affichage UNIQUE du lien + QR code, export CSV, révocation immédiate, régénération,
// dernière utilisation. Les jetons ne sont jamais relisibles ensuite : la base ne garde que leur empreinte SHA-256.
// Toutes les opérations passent par des fonctions réservées à l'admin (admin_tablette_*).

import { useCallback, useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const CARD = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(0,54,127,.05)' }
const BTN = { padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }
const BTN_PRIMARY = { ...BTN, background: NAVY, color: '#fff', borderColor: NAVY }
const BTN_DANGER = { ...BTN, color: '#b91c1c', borderColor: '#fecaca' }
const INPUT = { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', color: '#0f172a', background: '#fff' }
const TH = { textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }
const TD = { padding: '9px 10px', fontSize: 13, color: '#0f172a', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }

const STATUTS = {
  aucun:   { label: 'Aucun lien',  fond: '#f1f5f9', texte: '#64748b' },
  actif:   { label: 'Actif',       fond: '#dcfce7', texte: '#166534' },
  revoque: { label: 'Révoqué',     fond: '#fee2e2', texte: '#991b1b' },
  expire:  { label: 'Expiré',      fond: '#fef3c7', texte: '#92400e' },
}
const CATEGORIES = { participant: 'Participant', intervenant: 'Intervenant', organisation: 'Organisation' }

const cle = p => `${p.personne_type}|${p.personne_id}`
const nomComplet = p => `${p.prenom || ''} ${p.nom || ''}`.trim()
const dateCourte = d => (d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—')

// Numéro de tablette (T01, T02…) porté par l'étiquette du lien : « T07 · Prénom NOM »
const numeroTablette = p => { const m = /^(T\d+) · /.exec(p.token_label || ''); return m ? m[1] : '' }

function statutLien(p) {
  if (!p.token_id) return 'aucun'
  if (p.token_revoque_le) return 'revoque'
  if (p.token_expire_le && new Date(p.token_expire_le) < new Date()) return 'expire'
  return 'actif'
}

function telechargerCsv(nomFichier, lignes) {
  const cellule = v => { const s = String(v ?? ''); return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const contenu = '﻿' + lignes.map(l => l.map(cellule).join(';')).join('\r\n') + '\r\n'
  const url = URL.createObjectURL(new Blob([contenu], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = nomFichier
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const lienComplet = code => `${window.location.origin}/t/${code}`

function LigneLien({ item }) {
  const [qr, setQr] = useState('')
  const [copie, setCopie] = useState(false)
  const lien = lienComplet(item.token)

  useEffect(() => {
    let actif = true
    QRCode.toDataURL(lien, { margin: 1, width: 168, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(u => { if (actif) setQr(u) }).catch(() => {})
    return () => { actif = false }
  }, [lien])

  const copier = async () => {
    try { await navigator.clipboard.writeText(lien); setCopie(true); setTimeout(() => setCopie(false), 2000) } catch { /* presse-papiers indisponible */ }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
      <div style={{ width: 84, height: 84, flexShrink: 0 }}>{qr && <img src={qr} alt="QR code du lien" style={{ width: 84, height: 84 }} />}</div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{item.label} <span style={{ fontWeight: 600, color: '#64748b', fontSize: 12 }}>· {item.dossier}</span></div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 3, color: NAVY, fontFamily: 'monospace', marginTop: 2 }}>{item.token}</div>
        <input readOnly value={lien} onFocus={e => e.target.select()} style={{ ...INPUT, width: '100%', boxSizing: 'border-box', marginTop: 6, fontSize: 12, fontFamily: 'monospace' }} />
      </div>
      <button type="button" onClick={copier} style={BTN}>{copie ? 'Copié ✓' : 'Copier le lien'}</button>
    </div>
  )
}

export default function AdminTablettes() {
  const [liste, setListe] = useState(null)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [filtreCategorie, setFiltreCategorie] = useState('tous')
  const [choisis, setChoisis] = useState({})
  const [expiration, setExpiration] = useState('')
  const [occupe, setOccupe] = useState(false)
  const [genere, setGenere] = useState(null) // liens affichés une seule fois

  const charger = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_tablette_liste')
    if (error) { setErreur(error.message); return }
    setErreur('')
    setListe(data || [])
  }, [])

  useEffect(() => {
    const t = setTimeout(charger, 0)
    return () => clearTimeout(t)
  }, [charger])

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return (liste || []).filter(p => {
      if (filtreStatut !== 'tous' && statutLien(p) !== filtreStatut) return false
      if (filtreCategorie !== 'tous' && p.categorie !== filtreCategorie) return false
      if (!q) return true
      return `${nomComplet(p)} ${p.dossier} ${p.organisation || ''} ${p.pays || ''}`.toLowerCase().includes(q)
    })
  }, [liste, recherche, filtreStatut, filtreCategorie])

  const nbChoisis = Object.keys(choisis).filter(k => choisis[k]).length
  const bascule = p => setChoisis(c => ({ ...c, [cle(p)]: !c[cle(p)] }))
  const toutChoisir = () => {
    const sansLien = visibles.filter(p => statutLien(p) !== 'actif')
    const tous = sansLien.length > 0 && sansLien.every(p => choisis[cle(p)])
    setChoisis(c => { const n = { ...c }; sansLien.forEach(p => { n[cle(p)] = !tous }); return n })
  }

  const generer = async (personnes, regenerer) => {
    if (!personnes.length) return
    setOccupe(true); setErreur('')
    const { data, error } = await supabase.rpc('admin_tablette_generer', {
      p_personnes: personnes.map(p => ({ type: p.personne_type, id: p.personne_id })),
      p_expire: expiration ? new Date(`${expiration}T23:59:59`).toISOString() : null,
      p_regenerer: regenerer,
    })
    setOccupe(false)
    if (error) { setErreur(error.message); return }
    setGenere(data || [])
    setChoisis({})
    charger()
  }

  const revoquer = async p => {
    if (!window.confirm(`Révoquer le lien de ${nomComplet(p)} ? La tablette sera déconnectée immédiatement.`)) return
    setOccupe(true)
    const { error } = await supabase.rpc('admin_tablette_revoquer', { p_token_id: p.token_id })
    setOccupe(false)
    if (error) { setErreur(error.message); return }
    charger()
  }

  const regenerer = p => {
    if (!window.confirm(`Régénérer le lien de ${nomComplet(p)} ? L'ancien lien sera révoqué.`)) return
    generer([p], true)
  }

  const exporterLiens = () => telechargerCsv('tablettes-liens.csv', [
    ['Participant', 'Dossier', 'Code', 'Lien', 'Statut'],
    ...(genere || []).map(g => [g.label, g.dossier, g.token, lienComplet(g.token), 'Actif']),
  ])
  const copierTous = async () => {
    try { await navigator.clipboard.writeText((genere || []).map(g => `${g.label} : ${lienComplet(g.token)}`).join('\n')) } catch { /* presse-papiers indisponible */ }
  }
  const exporterEtat = () => telechargerCsv('tablettes-etat.csv', [
    ['Tablette', 'Participant', 'Dossier', 'Organisation', 'Pays', 'Statut du lien', 'Créé le', 'Dernière utilisation', 'Utilisations'],
    ...visibles.map(p => [numeroTablette(p), nomComplet(p), p.dossier, p.organisation, p.pays, STATUTS[statutLien(p)].label, dateCourte(p.token_cree_le), dateCourte(p.derniere_utilisation), p.utilisations]),
  ])

  if (erreur && liste === null) return <p style={{ color: '#dc2626', fontSize: 13 }}>{erreur}</p>
  if (liste === null) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Chargement…</p>

  const compte = s => liste.filter(p => statutLien(p) === s).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={CARD}>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Tablettes — liens personnels</div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
          Chaque participant reçoit un lien court unique (<code>copaf-ports.com/t/CODE</code>, 10 caractères faciles à taper) : en l'ouvrant sur la tablette, il est connecté pour 30 jours, sans mot de passe.
          Le lien n'est affiché qu'une fois, à la génération : exportez-le ou copiez-le tout de suite. Révoquer un lien déconnecte la tablette immédiatement.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12.5, fontWeight: 700 }}>
          {['actif', 'aucun', 'revoque', 'expire'].map(s => (
            <span key={s} style={{ background: STATUTS[s].fond, color: STATUTS[s].texte, borderRadius: 20, padding: '4px 12px' }}>{STATUTS[s].label} : {compte(s)}</span>
          ))}
        </div>
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher (nom, dossier, organisation, pays)" style={{ ...INPUT, flex: 1, minWidth: 220 }} />
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} style={INPUT}>
            <option value="tous">Tous les liens</option>
            {Object.keys(STATUTS).map(s => <option key={s} value={s}>{STATUTS[s].label}</option>)}
          </select>
          <select value={filtreCategorie} onChange={e => setFiltreCategorie(e.target.value)} style={INPUT}>
            <option value="tous">Toutes catégories</option>
            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{CATEGORIES[c]}</option>)}
          </select>
          <button type="button" onClick={exporterEtat} style={BTN}>Exporter l'état (CSV)</button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14, padding: 12, background: '#f8fafc', borderRadius: 12 }}>
          <button type="button" onClick={toutChoisir} style={BTN}>Sélectionner les personnes sans lien actif</button>
          <label style={{ fontSize: 12.5, color: '#475569', fontWeight: 600 }}>
            Expire le (facultatif){' '}
            <input type="date" value={expiration} onChange={e => setExpiration(e.target.value)} style={{ ...INPUT, padding: '6px 10px' }} />
          </label>
          <button type="button" disabled={!nbChoisis || occupe} onClick={() => generer(liste.filter(p => choisis[cle(p)]), false)}
            style={{ ...BTN_PRIMARY, opacity: !nbChoisis || occupe ? 0.5 : 1 }}>
            {occupe ? 'Génération…' : `Générer les liens (${nbChoisis})`}
          </button>
        </div>

        {erreur && <p style={{ color: '#dc2626', fontSize: 13, margin: '0 0 10px' }}>{erreur}</p>}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr>
                <th style={TH} />
                <th style={TH}>Participant</th>
                <th style={TH}>Organisation</th>
                <th style={TH}>Lien</th>
                <th style={TH}>Dernière utilisation</th>
                <th style={TH}>Util.</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(p => {
                const st = statutLien(p)
                return (
                  <tr key={cle(p)}>
                    <td style={TD}>
                      <input type="checkbox" checked={!!choisis[cle(p)]} onChange={() => bascule(p)} aria-label={`Sélectionner ${nomComplet(p)}`} style={{ width: 18, height: 18 }} />
                    </td>
                    <td style={TD}>
                      <div style={{ fontWeight: 800 }}>
                        {numeroTablette(p) && <span style={{ background: NAVY, color: '#fff', borderRadius: 6, padding: '1px 7px', fontSize: 11.5, marginRight: 8 }}>{numeroTablette(p)}</span>}
                        {nomComplet(p)}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>{p.dossier} · {CATEGORIES[p.categorie] || p.categorie}</div>
                    </td>
                    <td style={TD}>{p.organisation || '—'}{p.pays ? <div style={{ fontSize: 11.5, color: '#64748b' }}>{p.pays}</div> : null}</td>
                    <td style={TD}>
                      <span style={{ background: STATUTS[st].fond, color: STATUTS[st].texte, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 800 }}>{STATUTS[st].label}</span>
                      {st === 'actif' && p.token_expire_le && <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>jusqu'au {dateCourte(p.token_expire_le)}</div>}
                    </td>
                    <td style={TD}>{dateCourte(p.derniere_utilisation)}</td>
                    <td style={TD}>{p.utilisations || 0}</td>
                    <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                      {st === 'actif' ? (
                        <>
                          <button type="button" onClick={() => regenerer(p)} disabled={occupe} style={{ ...BTN, marginRight: 6 }}>Régénérer</button>
                          <button type="button" onClick={() => revoquer(p)} disabled={occupe} style={BTN_DANGER}>Révoquer</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => generer([p], false)} disabled={occupe} style={BTN}>Générer</button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!visibles.length && <tr><td colSpan={7} style={{ ...TD, textAlign: 'center', color: '#94a3b8' }}>Aucune personne ne correspond.</td></tr>}
            </tbody>
          </table>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>{visibles.length} personne(s) affichée(s) sur {liste.length}.</p>
      </div>

      {genere && (
        <div role="dialog" aria-modal="true" aria-label="Liens générés"
          style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ ...CARD, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
              {genere.length ? `${genere.length} lien(s) généré(s)` : 'Aucun nouveau lien'}
            </div>
            {genere.length ? (
              <>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#b91c1c', fontWeight: 700, lineHeight: 1.5 }}>
                  Ces liens ne seront plus jamais affichés. Copiez-les ou exportez le CSV maintenant, puis transmettez chaque lien à son participant (ne les publiez pas).
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <button type="button" onClick={exporterLiens} style={BTN_PRIMARY}>Exporter le CSV (participant, code, lien, statut)</button>
                  <button type="button" onClick={copierTous} style={BTN}>Copier tous les liens</button>
                </div>
                {genere.map(g => <LigneLien key={g.token_id} item={g} />)}
              </>
            ) : (
              <p style={{ fontSize: 13, color: '#475569' }}>Les personnes sélectionnées ont déjà un lien actif. Utilisez « Régénérer » pour en créer un nouveau.</p>
            )}
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button type="button" onClick={() => setGenere(null)} style={BTN}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
