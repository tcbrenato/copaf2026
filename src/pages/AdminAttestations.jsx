// src/pages/AdminAttestations.jsx
//
// Onglet admin « Attestations » : liste des personnes qui recevront une attestation de participation, avec
// import Excel/CSV (validation + doublons), import depuis les inscrits, langue automatique selon le pays (règle dans
// attestationsConfig.js), génération des codes COPAF-2026-EXEC-XXXX, QR codes en lot (ZIP PNG/SVG + CSV), exports Excel/CSV,
// attestations PDF en lot (ZIP) et publication. Tout passe par la table `attestations` (écriture réservée à l'admin par RLS).

import { useCallback, useEffect, useMemo, useState } from 'react'
import JSZip from 'jszip'
import QRCode from 'qrcode'
import { supabase } from '../supabase'
import {
  cleDoublon, langueDepuisPays, nomAffiche, normaliserCivilite, normaliserTexte, prenomAffiche, trouverPays, urlVerification,
} from '../utils/attestationsConfig'
import { ecrireCsv, ecrireXlsx, lireTableur, telecharger } from '../utils/tableur'

const NAVY = '#000E91'
const CARD = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(0,54,127,.05)' }
const BTN = { padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', marginRight: 8, marginBottom: 8 }
const BTN_PRIMARY = { ...BTN, background: NAVY, color: '#fff', borderColor: NAVY }
const BTN_DANGER = { ...BTN, color: '#b91c1c', borderColor: '#fecaca' }
const INPUT = { padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#0f172a', background: '#fff', boxSizing: 'border-box' }
const TH = { textAlign: 'left', padding: '8px 8px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }
const TD = { padding: '8px 8px', fontSize: 13, color: '#0f172a', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }

const COLONNES_IMPORT = ['Civilité', 'Prénom', 'Nom', 'Fonction', 'Autorité portuaire', 'Pays']
const ENTETES_EXPORT = ['Prénom', 'Nom', 'Fonction', 'Autorité portuaire', 'Pays', 'Langue', 'Code d\'enregistrement', 'URL de vérification']
const nomFichier = s => normaliserTexte(s).replace(/ /g, '_').toUpperCase() || 'SANS_NOM'
const complet = a => `${a.prenom || ''} ${a.nom || ''}`.trim()

// Une ligne brute (6 colonnes) → ligne d'attestation validée, avec erreurs et avertissements
function preparerLigne(brut, source) {
  const [civ, prenom, nom, fonction, autorite, pays] = brut
  const erreurs = []
  const avertissements = []
  const civilite = normaliserCivilite(civ)
  if (!String(prenom || '').trim()) erreurs.push('prénom manquant')
  if (!String(nom || '').trim()) erreurs.push('nom manquant')
  if (civ && !civilite) avertissements.push(`civilité « ${civ} » non reconnue (M. ou Mme)`)
  if (!civ && source !== 'inscrits') avertissements.push('civilité manquante')
  const trouve = trouverPays(pays)
  if (pays && !trouve) avertissements.push(`pays « ${pays} » non reconnu : drapeau absent, langue FR par défaut`)
  if (!pays) avertissements.push('pays manquant')
  if (!String(fonction || '').trim()) avertissements.push('fonction manquante')
  if (!String(autorite || '').trim()) avertissements.push('autorité portuaire manquante')
  return {
    erreurs, avertissements,
    donnees: {
      civilite: civilite || null,
      prenom: String(prenom || '').trim(),
      nom: String(nom || '').trim(),
      fonction: String(fonction || '').trim() || null,
      autorite_portuaire: String(autorite || '').trim() || null,
      pays: trouve ? trouve.fr : (String(pays || '').trim() || null),
      pays_iso2: trouve ? trouve.iso2 : null,
      langue: langueDepuisPays(pays),
    },
  }
}

export default function AdminAttestations() {
  const [lignes, setLignes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')
  const [occupe, setOccupe] = useState('')
  const [recherche, setRecherche] = useState('')
  const [fPays, setFPays] = useState('')
  const [fLangue, setFLangue] = useState('')
  const [fAutorite, setFAutorite] = useState('')
  const [tri, setTri] = useState({ cle: 'nom', sens: 1 })
  const [choisis, setChoisis] = useState({})
  const [edition, setEdition] = useState(null) // { id (ou 'nouveau'), valeurs }
  const [apercu, setApercu] = useState(null) // import en attente de confirmation

  const charger = useCallback(async () => {
    const { data, error } = await supabase.from('attestations').select('*').order('nom').order('prenom')
    if (error) { setErreur(error.message); return }
    setErreur('')
    setLignes(data || [])
  }, [])
  useEffect(() => { const t = setTimeout(charger, 0); return () => clearTimeout(t) }, [charger])

  const visibles = useMemo(() => {
    const q = normaliserTexte(recherche)
    const liste = (lignes || []).filter(a => {
      if (fPays && a.pays !== fPays) return false
      if (fLangue && a.langue !== fLangue) return false
      if (fAutorite && a.autorite_portuaire !== fAutorite) return false
      return !q || normaliserTexte(`${complet(a)} ${a.fonction} ${a.autorite_portuaire} ${a.pays} ${a.code}`).includes(q)
    })
    return liste.sort((a, b) => String(a[tri.cle] ?? '').localeCompare(String(b[tri.cle] ?? ''), 'fr', { sensitivity: 'base' }) * tri.sens)
  }, [lignes, recherche, fPays, fLangue, fAutorite, tri])

  const pays = useMemo(() => [...new Set((lignes || []).map(a => a.pays).filter(Boolean))].sort(), [lignes])
  const autorites = useMemo(() => [...new Set((lignes || []).map(a => a.autorite_portuaire).filter(Boolean))].sort(), [lignes])
  const idsChoisis = (lignes || []).filter(a => choisis[a.id]).map(a => a.id)
  const cible = idsChoisis.length ? (lignes || []).filter(a => choisis[a.id]) : visibles // sélection, sinon liste filtrée
  const trier = cle => setTri(t => ({ cle, sens: t.cle === cle ? -t.sens : 1 }))

  const message = (txt, err = false) => { if (err) { setErreur(txt); setInfo('') } else { setInfo(txt); setErreur('') } }

  // ── Édition / ajout / suppression ──
  const valeursVides = { civilite: '', prenom: '', nom: '', fonction: '', autorite_portuaire: '', pays: '', langue: 'FR', logo_url: '' }
  const enregistrer = async () => {
    const v = edition.valeurs
    if (!v.prenom.trim() || !v.nom.trim()) { message('Prénom et nom sont obligatoires.', true); return }
    const trouve = trouverPays(v.pays)
    const champs = {
      civilite: normaliserCivilite(v.civilite) || null, prenom: v.prenom.trim(), nom: v.nom.trim(),
      fonction: v.fonction.trim() || null, autorite_portuaire: v.autorite_portuaire.trim() || null,
      pays: trouve ? trouve.fr : (v.pays.trim() || null), pays_iso2: trouve ? trouve.iso2 : null,
      langue: v.langue === 'EN' ? 'EN' : 'FR', logo_url: v.logo_url.trim() || null,
    }
    setOccupe('Enregistrement…')
    const { error } = edition.id === 'nouveau'
      ? await supabase.from('attestations').insert([champs])
      : await supabase.from('attestations').update(champs).eq('id', edition.id)
    setOccupe('')
    if (error) { message(error.message, true); return }
    setEdition(null); message('Enregistré.'); charger()
  }
  const modifier = a => setEdition({ id: a.id, valeurs: { ...valeursVides, ...Object.fromEntries(Object.entries(a).map(([k, x]) => [k, x ?? ''])) } })
  const changerPaysEdition = valeur => setEdition(e => {
    const trouve = trouverPays(valeur)
    return { ...e, valeurs: { ...e.valeurs, pays: valeur, ...(trouve ? { langue: trouve.langue } : {}) } }
  })
  const supprimer = async a => {
    if (!window.confirm(`Supprimer l'attestation de ${complet(a)} ?`)) return
    const { error } = await supabase.from('attestations').delete().eq('id', a.id)
    if (error) { message(error.message, true); return }
    message('Supprimée.'); charger()
  }
  const changerLangue = async (a, langue) => {
    const { error } = await supabase.from('attestations').update({ langue }).eq('id', a.id)
    if (error) message(error.message, true); else charger()
  }

  // ── Publication ──
  const publier = async (liste, valeur) => {
    if (!liste.length) return
    setOccupe('Mise à jour…')
    const { error } = await supabase.from('attestations').update({ publie: valeur }).in('id', liste.map(a => a.id))
    setOccupe('')
    if (error) { message(error.message, true); return }
    message(`${liste.length} attestation(s) ${valeur ? 'publiée(s)' : 'retirée(s) de la publication'}.`); charger()
  }

  // ── Codes ──
  const genererCodes = async () => {
    setOccupe('Génération des codes…')
    const { data, error } = await supabase.rpc('admin_attestation_generer_codes')
    setOccupe('')
    if (error) { message(error.message, true); return }
    message(`${data} code(s) généré(s).`); charger()
  }

  // ── Import ──
  const preparerApercu = (brutes, source) => {
    const existants = new Set((lignes || []).map(cleDoublon))
    const dansFichier = new Set()
    const items = brutes.map((brut, i) => {
      const l = preparerLigne(brut, source)
      const cle = cleDoublon(l.donnees)
      let doublon = ''
      if (!l.erreurs.length) {
        if (existants.has(cle)) doublon = 'déjà dans la liste'
        else if (dansFichier.has(cle)) doublon = 'en double dans le fichier'
        dansFichier.add(cle)
      }
      return { ...l, numero: i + 1, doublon, personne: brut.personne || null }
    })
    setApercu({ source, items })
  }
  const importerFichier = async e => {
    const fichier = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!fichier) return
    try {
      const table = await lireTableur(fichier, fichier.name)
      if (!table.length) { message('Le fichier est vide.', true); return }
      const entete = table[0].map(normaliserTexte)
      const aEntete = entete.includes('nom') || entete.includes('prenom')
      const idx = nom => entete.indexOf(nom)
      const colonnes = aEntete
        ? [idx('civilite'), idx('prenom'), idx('nom'), idx('fonction'), idx('autorite portuaire') >= 0 ? idx('autorite portuaire') : idx('autorite'), idx('pays')]
        : [0, 1, 2, 3, 4, 5]
      const brutes = (aEntete ? table.slice(1) : table).map(l => colonnes.map(c => (c >= 0 ? l[c] || '' : '')))
      preparerApercu(brutes, 'fichier')
      setInfo(''); setErreur('')
    } catch (err) { message(`Lecture du fichier impossible : ${err.message}`, true) }
  }
  const importerInscrits = async () => {
    setOccupe('Lecture des inscrits…')
    const { data, error } = await supabase.rpc('terrain_liste')
    setOccupe('')
    if (error) { message(error.message, true); return }
    const deja = new Set((lignes || []).filter(a => a.personne_id).map(a => `${a.personne_type}|${a.personne_id}`))
    const brutes = (data || [])
      .filter(p => p.categorie === 'participant' && !deja.has(`${p.personne_type}|${p.personne_id}`))
      .map(p => {
        const brut = ['', prenomAffiche(p.prenom), nomAffiche(p.nom), p.fonction || '', p.organisation || '', p.pays || (/nigeria/i.test(p.organisation || '') ? 'Nigeria' : '')]
        brut.personne = { type: p.personne_type, id: p.personne_id }
        return brut
      })
    if (!brutes.length) { message('Tous les inscrits sont déjà dans la liste.'); return }
    preparerApercu(brutes, 'inscrits')
  }
  const confirmerImport = async () => {
    const aImporter = apercu.items.filter(i => !i.erreurs.length && !i.doublon)
    setOccupe(`Import de ${aImporter.length} ligne(s)…`)
    for (let i = 0; i < aImporter.length; i += 100) {
      const lot = aImporter.slice(i, i + 100).map(it => ({ ...it.donnees, ...(it.personne ? { personne_type: it.personne.type, personne_id: it.personne.id } : {}) }))
      const { error } = await supabase.from('attestations').insert(lot)
      if (error) { setOccupe(''); message(error.message, true); return }
    }
    setOccupe(''); setApercu(null); message(`${aImporter.length} personne(s) importée(s).`); charger()
  }
  const telechargerModele = async () => {
    const blob = await ecrireXlsx([
      COLONNES_IMPORT,
      ['M.', 'Komla', 'AMEDRO', "Responsable de la Sécurité des Systèmes d'Information", 'Port Autonome de Lomé', 'Togo'],
      ['Mme', 'Vivian', 'RICHARD-EDET', 'Executive Director Finance & Administration', 'Nigerian Ports Authority (NPA)', 'Nigeria'],
      ['M.', 'Eustace', 'ROGERS', 'Director, Technical Services', 'Sierra Leone Ports and Harbours Authority', 'Sierra Leone'],
    ], { nomFeuille: 'Participants', largeurs: [10, 18, 20, 48, 40, 18] })
    telecharger(blob, 'participants_modele.xlsx')
  }

  // ── Exports ──
  const lignesExport = liste => [ENTETES_EXPORT, ...liste.map(a => [a.prenom, a.nom, a.fonction, a.autorite_portuaire, a.pays, a.langue, a.code, a.code ? urlVerification(a.code, window.location.origin) : ''])]
  const exporterListeXlsx = async () => telecharger(await ecrireXlsx(lignesExport(cible), { nomFeuille: 'Attestations', largeurs: [18, 20, 40, 36, 18, 8, 24, 52] }), 'COPAF-2026_attestations_liste.xlsx')
  const exporterListeCsv = () => telecharger(ecrireCsv(lignesExport(cible)), 'COPAF-2026_attestations_liste.csv')
  const avecCode = cible.filter(a => a.code)
  const csvQr = liste => ecrireCsv([['Code', 'Prénom', 'Nom', 'URL', 'Nom du fichier QR'], ...liste.map(a => [a.code, a.prenom, a.nom, urlVerification(a.code, window.location.origin), `${a.code}_${nomFichier(a.nom)}.png`])])
  const exporterQr = async () => {
    if (!avecCode.length) { message('Aucune ligne avec un code : générez d\'abord les codes.', true); return }
    setOccupe('Création des QR codes…')
    const zip = new JSZip()
    for (const a of avecCode) {
      const url = urlVerification(a.code, window.location.origin)
      const base = `${a.code}_${nomFichier(a.nom)}`
      const png = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 2, width: 600 })
      zip.file(`PNG/${base}.png`, png.split(',')[1], { base64: true })
      zip.file(`SVG/${base}.svg`, await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'H', margin: 2 }))
    }
    zip.file('liste_qr.csv', await csvQr(avecCode).arrayBuffer())
    telecharger(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), 'COPAF-2026_QR_codes.zip')
    setOccupe(''); message(`${avecCode.length} QR code(s) exporté(s) (PNG + SVG + CSV).`)
  }
  const exporterPdfLot = async () => {
    if (!avecCode.length) { message('Aucune ligne avec un code : générez d\'abord les codes.', true); return }
    const { genererAttestationPDF } = await import('../utils/generateAttestationPDF')
    const zip = new JSZip()
    const cache = {}
    for (let i = 0; i < avecCode.length; i++) {
      const a = avecCode[i]
      setOccupe(`Attestation ${i + 1} / ${avecCode.length}…`)
      try {
        const blob = await genererAttestationPDF(a, { origine: window.location.origin, cache })
        zip.file(`${a.code}_${nomFichier(a.nom)}_${a.langue}.pdf`, blob)
      } catch (err) { setOccupe(''); message(`PDF impossible pour ${complet(a)} : ${err.message}`, true); return }
    }
    telecharger(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), 'COPAF-2026_attestations_PDF.zip')
    setOccupe(''); message(`${avecCode.length} attestation(s) PDF générée(s).`)
  }

  if (erreur && lignes === null) return <p style={{ color: '#dc2626', fontSize: 13 }}>{erreur}</p>
  if (lignes === null) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Chargement…</p>

  const sansCode = lignes.filter(a => !a.code).length
  const nbPublies = lignes.filter(a => a.publie).length
  const flecheTri = cle => (tri.cle === cle ? (tri.sens === 1 ? ' ▲' : ' ▼') : '')
  const champ = (cle, largeur) => (
    <input value={edition.valeurs[cle]} onChange={e => setEdition(ed => ({ ...ed, valeurs: { ...ed.valeurs, [cle]: e.target.value } }))} style={{ ...INPUT, width: largeur }} aria-label={cle} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={CARD}>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Attestations de participation</div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
          Chaque personne a un numéro <code>COPAF-2026-EXEC-XXXX</code> et un QR code qui ouvre <code>copaf-ports.com/verifier/NUMÉRO</code>.
          Avant le 21/10/2026, l'attestation affiche « en cours de préparation » tant qu'elle n'est pas publiée.
        </p>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
          {lignes.length} personne(s) · {lignes.length - sansCode} avec code · {sansCode} sans code · {nbPublies} publiée(s)
        </div>
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ ...BTN_PRIMARY, display: 'inline-block' }}>Importer Excel / CSV
            <input type="file" accept=".xlsx,.csv,.tsv,.txt" onChange={importerFichier} style={{ display: 'none' }} />
          </label>
          <button type="button" style={BTN} onClick={telechargerModele}>Télécharger le modèle (.xlsx)</button>
          <button type="button" style={BTN} onClick={importerInscrits} disabled={!!occupe}>Importer depuis les inscrits</button>
          <button type="button" style={BTN} onClick={() => setEdition({ id: 'nouveau', valeurs: { ...valeursVides } })}>+ Ajouter une personne</button>
          <button type="button" style={BTN_PRIMARY} onClick={genererCodes} disabled={!!occupe || !sansCode}>Générer les codes manquants ({sansCode})</button>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>Colonnes attendues : {COLONNES_IMPORT.join(' | ')}</p>
        {(occupe || info || erreur) && (
          <p role="status" style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700, color: erreur ? '#dc2626' : occupe ? '#475569' : '#166534' }}>{occupe || erreur || info}</p>
        )}
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher (nom, fonction, autorité, pays, code)" style={{ ...INPUT, flex: '1 1 240px', marginRight: 8, marginBottom: 8 }} />
          <select value={fPays} onChange={e => setFPays(e.target.value)} style={{ ...INPUT, marginRight: 8, marginBottom: 8 }}><option value="">Tous les pays</option>{pays.map(p => <option key={p} value={p}>{p}</option>)}</select>
          <select value={fLangue} onChange={e => setFLangue(e.target.value)} style={{ ...INPUT, marginRight: 8, marginBottom: 8 }}><option value="">FR + EN</option><option value="FR">FR</option><option value="EN">EN</option></select>
          <select value={fAutorite} onChange={e => setFAutorite(e.target.value)} style={{ ...INPUT, maxWidth: 260, marginBottom: 8 }}><option value="">Toutes les autorités</option>{autorites.map(p => <option key={p} value={p}>{p}</option>)}</select>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: 10, background: '#f8fafc', borderRadius: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginRight: 12, marginBottom: 8 }}>{idsChoisis.length ? `${idsChoisis.length} sélectionnée(s)` : `Liste affichée (${visibles.length})`} :</span>
          <button type="button" style={BTN_PRIMARY} onClick={() => publier(cible.filter(a => a.code), true)}>Publier</button>
          <button type="button" style={BTN} onClick={() => publier(cible, false)}>Retirer la publication</button>
          <button type="button" style={BTN} onClick={exporterQr} disabled={!!occupe}>QR codes (ZIP PNG + SVG + CSV)</button>
          <button type="button" style={BTN} onClick={() => telecharger(csvQr(avecCode), 'COPAF-2026_QR_liste.csv')} disabled={!avecCode.length}>CSV des QR</button>
          <button type="button" style={BTN} onClick={exporterListeXlsx}>Liste Excel</button>
          <button type="button" style={BTN} onClick={exporterListeCsv}>Liste CSV</button>
          <button type="button" style={BTN} onClick={exporterPdfLot} disabled={!!occupe}>Attestations PDF (ZIP)</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
            <thead>
              <tr>
                <th style={TH}><input type="checkbox" aria-label="Tout sélectionner" checked={visibles.length > 0 && visibles.every(a => choisis[a.id])}
                  onChange={e => setChoisis(c => { const n = { ...c }; visibles.forEach(a => { n[a.id] = e.target.checked }); return n })} /></th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => trier('code')}>Code{flecheTri('code')}</th>
                <th style={TH}>Civ.</th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => trier('nom')}>Nom et prénom{flecheTri('nom')}</th>
                <th style={TH}>Fonction</th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => trier('autorite_portuaire')}>Autorité portuaire{flecheTri('autorite_portuaire')}</th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => trier('pays')}>Pays{flecheTri('pays')}</th>
                <th style={TH}>Langue</th>
                <th style={TH}>Publié</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(a => (
                <tr key={a.id}>
                  <td style={TD}><input type="checkbox" checked={!!choisis[a.id]} onChange={() => setChoisis(c => ({ ...c, [a.id]: !c[a.id] }))} aria-label={`Sélectionner ${complet(a)}`} /></td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: 12 }}>{a.code || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                  <td style={TD}>{a.civilite || <span style={{ color: '#f59e0b' }} title="Civilité manquante">?</span>}</td>
                  <td style={TD}><strong>{a.prenom}</strong> {a.nom}</td>
                  <td style={TD}>{a.fonction || '—'}</td>
                  <td style={TD}>{a.autorite_portuaire || '—'}</td>
                  <td style={TD}>{a.pays || '—'}{a.pays_iso2 ? <span style={{ color: '#94a3b8', fontSize: 11 }}> · {a.pays_iso2}</span> : <span style={{ color: '#f59e0b', fontSize: 11 }}> · sans drapeau</span>}</td>
                  <td style={TD}>
                    <select value={a.langue} onChange={e => changerLangue(a, e.target.value)} style={{ ...INPUT, padding: '4px 6px' }} aria-label="Langue"><option value="FR">FR</option><option value="EN">EN</option></select>
                  </td>
                  <td style={TD}><input type="checkbox" checked={a.publie} disabled={!a.code} onChange={() => publier([a], !a.publie)} aria-label="Publié" /></td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                    {a.code && <a href={`/verifier/${a.code}`} target="_blank" rel="noopener noreferrer" style={{ ...BTN, display: 'inline-block', textDecoration: 'none' }}>Voir</a>}
                    <button type="button" style={BTN} onClick={() => modifier(a)}>Modifier</button>
                    <button type="button" style={BTN_DANGER} onClick={() => supprimer(a)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {!visibles.length && <tr><td colSpan={10} style={{ ...TD, textAlign: 'center', color: '#94a3b8' }}>Aucune personne. Importez un fichier ou les inscrits.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {edition && (
        <div role="dialog" aria-modal="true" aria-label="Modifier une personne" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ ...CARD, width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>{edition.id === 'nouveau' ? 'Ajouter une personne' : 'Modifier la personne'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {[['civilite', 'Civilité (M. / Mme)', 120], ['prenom', 'Prénom', 220], ['nom', 'Nom', 220], ['fonction', 'Fonction', 520], ['autorite_portuaire', 'Autorité portuaire', 520], ['logo_url', "Logo de l'autorité (URL, facultatif)", 520]].map(([cle, libelle, l]) => (
                <label key={cle} style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginRight: 12, marginBottom: 10 }}>{libelle}<br />{champ(cle, l)}</label>
              ))}
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginRight: 12, marginBottom: 10 }}>Pays<br />
                <input value={edition.valeurs.pays} onChange={e => changerPaysEdition(e.target.value)} style={{ ...INPUT, width: 220 }} aria-label="pays" />
              </label>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>Langue de l'attestation<br />
                <select value={edition.valeurs.langue} onChange={e => setEdition(ed => ({ ...ed, valeurs: { ...ed.valeurs, langue: e.target.value } }))} style={{ ...INPUT, width: 120 }}><option value="FR">FR</option><option value="EN">EN</option></select>
              </label>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#94a3b8' }}>
              {trouverPays(edition.valeurs.pays) ? `Pays reconnu (${trouverPays(edition.valeurs.pays).iso2}) : drapeau et langue proposés automatiquement.` : 'Pays non reconnu : pas de drapeau (écrivez le nom du pays en français ou en anglais).'}
            </p>
            <div style={{ textAlign: 'right' }}>
              <button type="button" style={BTN} onClick={() => setEdition(null)}>Annuler</button>
              <button type="button" style={{ ...BTN_PRIMARY, marginRight: 0 }} onClick={enregistrer} disabled={!!occupe}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {apercu && (
        <div role="dialog" aria-modal="true" aria-label="Aperçu de l'import" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ ...CARD, width: '100%', maxWidth: 980, maxHeight: '92vh', overflowY: 'auto' }}>
            {(() => {
              const ok = apercu.items.filter(i => !i.erreurs.length && !i.doublon)
              const nbErreurs = apercu.items.filter(i => i.erreurs.length).length
              const nbDoublons = apercu.items.filter(i => i.doublon).length
              return (
                <>
                  <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>Aperçu de l'import ({apercu.source === 'inscrits' ? 'inscrits' : 'fichier'})</div>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: '#475569' }}>
                    <strong style={{ color: '#166534' }}>{ok.length} à importer</strong> · {nbDoublons} doublon(s) ignoré(s) · <span style={{ color: nbErreurs ? '#b91c1c' : undefined }}>{nbErreurs} erreur(s)</span>.
                    Les avertissements (civilité, pays…) n'empêchent pas l'import : corrigez ensuite dans la liste.
                  </p>
                  <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                      <thead><tr><th style={TH}>Ligne</th><th style={TH}>Personne</th><th style={TH}>Fonction · autorité · pays</th><th style={TH}>Langue</th><th style={TH}>Contrôle</th></tr></thead>
                      <tbody>
                        {apercu.items.map(i => (
                          <tr key={i.numero} style={{ background: i.erreurs.length ? '#fef2f2' : i.doublon ? '#f8fafc' : undefined }}>
                            <td style={TD}>{i.numero}</td>
                            <td style={TD}>{i.donnees.civilite} {i.donnees.prenom} {i.donnees.nom}</td>
                            <td style={TD}>{[i.donnees.fonction, i.donnees.autorite_portuaire, i.donnees.pays].filter(Boolean).join(' · ')}</td>
                            <td style={TD}>{i.donnees.langue}</td>
                            <td style={{ ...TD, fontSize: 12 }}>
                              {i.erreurs.length > 0 && <span style={{ color: '#b91c1c', fontWeight: 800 }}>Erreur : {i.erreurs.join(', ')}</span>}
                              {i.doublon && <span style={{ color: '#64748b', fontWeight: 700 }}>Doublon : {i.doublon}</span>}
                              {!i.erreurs.length && !i.doublon && (i.avertissements.length ? <span style={{ color: '#b45309' }}>{i.avertissements.join(' ; ')}</span> : <span style={{ color: '#166534' }}>OK</span>)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" style={BTN} onClick={() => setApercu(null)}>Annuler</button>
                    <button type="button" style={{ ...BTN_PRIMARY, marginRight: 0, opacity: ok.length ? 1 : 0.5 }} disabled={!ok.length || !!occupe} onClick={confirmerImport}>Importer {ok.length} ligne(s)</button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
