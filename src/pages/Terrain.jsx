// src/pages/Terrain.jsx
//
// Tableau de bord terrain (accueil aeroport -> hotel -> badge -> conference
// -> depart). Reserve au personnel d'accueil (scope 'checkin' ou 'all',
// meme AuthGate que StaffScan). Un appui = une etape enregistree (RPC
// terrain_marquer/terrain_marquer_groupe), avec heure et auteur ; le scan
// QR (StaffScan.jsx -> badge_checkin) alimente la meme table (etape
// 'present', mode='scan'). Mise a jour en direct entre plusieurs
// comptes/appareils via Realtime (table suivi_terrain/suivi_incidents,
// voir migration 20260928120000_suivi_terrain.sql) + rafraichissement de
// secours toutes les 30s et au retour au premier plan.
//
// Categories reelles du schema (pas de table "equipe" separee) :
// inscriptions/inscription_participants -> categorie 'participant' ;
// intervenants.equipe=false -> 'intervenant' ; intervenants.equipe=true ->
// 'organisation'. personne_type distingue 'inscription' de
// 'participant_groupe' (membre de delegation), et 'intervenant' de 'equipe'
// -> cle utilisee par toutes les RPC terrain_* (voir migration RPC).
//
// Hors perimetre v1 (comme demande) : file d'attente hors-ligne. Le bandeau
// "Hors connexion" desactive juste les actions en attendant le reseau ou la
// liste papier (bouton Imprimer).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAdminAuth } from '../adminAuth'
import { Ico } from '../utils/dossierUi'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const CLE_EQUIPIER = 'copaf_terrain_equipier' // partagee avec StaffScan.jsx — garder la meme chaine

const ETAPES = {
  aeroport: { label: 'Accueilli à l\'aéroport' },
  hotel: { label: 'Arrivé à l\'hôtel', champValeur: true, placeholderValeur: 'N° chambre (optionnel)', valeurRequise: false },
  badge: { label: 'Badge et kit remis' },
  tablette: { label: 'Tablette remise', champValeur: true, placeholderValeur: 'N° tablette', valeurRequise: true },
  present: { label: 'Présent', parJour: true },
  tablette_rendue: { label: 'Tablette restituée' },
  depart: { label: 'Transfert retour effectué' },
}
const TOUTES_ETAPES = Object.keys(ETAPES)

const MODES = [
  { id: 'aeroport', label: 'Aéroport', etapes: ['aeroport'], tri: 'arrivee' },
  { id: 'hotel', label: 'Hôtel', etapes: ['hotel', 'badge'], tri: 'nom' },
  { id: 'conference', label: 'Conférence', etapes: ['present', 'badge', 'tablette'], tri: 'nom' },
  { id: 'visite', label: 'Visite J3', etapes: ['present'], tri: 'nom', jourFixe: '2026-10-21' },
  { id: 'depart', label: 'Départ', etapes: ['tablette_rendue', 'depart'], tri: 'depart' },
  { id: 'tout', label: 'Tout', etapes: TOUTES_ETAPES, tri: 'nom', lecture: true },
]

const INCIDENT_TYPES = [
  { id: 'vol_retarde', label: 'Vol retardé' },
  { id: 'bagage', label: 'Bagage' },
  { id: 'sante', label: 'Santé' },
  { id: 'hotel', label: 'Hôtel' },
  { id: 'badge', label: 'Badge' },
  { id: 'autre', label: 'Autre' },
]

const CAT_LABEL = { participant: 'Participant', intervenant: 'Intervenant', organisation: 'Équipe / Comité' }
const CAT_COLOR = { participant: '#0891b2', intervenant: '#7c3aed', organisation: '#d97706' }

const TZ = 'Africa/Casablanca'
const jourAujourdhui = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const heure = iso => iso ? new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : ''
const sansAccents = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const JOURS_CONF = ['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22']
const fmtJour = j => j ? new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: '2-digit', month: 'short' }).format(new Date(j + 'T12:00:00Z')) : ''

const BTN = { padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const boutonAction = bg => ({ ...BTN, background: bg, color: '#fff', padding: '10px 16px' })
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }
const CARTE = { background: '#fff', borderRadius: 14, border: '1px solid #eef1f8', boxShadow: '0 4px 14px -4px rgba(15,23,42,.08)' }

function telechargerFichier(nom, contenu, type) {
  const blob = new Blob([contenu], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nom; a.click()
  URL.revokeObjectURL(url)
}
function versCSV(entetes, lignes) {
  const csv = [entetes, ...lignes].map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  return '﻿' + csv
}

export default function Terrain() {
  const { scope } = useAdminAuth()
  const authorized = scope === 'checkin' || scope === 'all'

  const [equipier, setEquipier] = useState(() => localStorage.getItem(CLE_EQUIPIER) || '')
  const [editionEquipier, setEditionEquipier] = useState(!equipier)
  const [jour, setJour] = useState(jourAujourdhui)
  const [modeId, setModeId] = useState('aeroport')
  const mode = MODES.find(m => m.id === modeId)
  const jourActif = mode.jourFixe || jour

  const [personnes, setPersonnes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [query, setQuery] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('tous')
  const [filtreDelegation, setFiltreDelegation] = useState('')
  const [aFaireSeulement, setAFaireSeulement] = useState(true)
  const [enLigne, setEnLigne] = useState(navigator.onLine)
  const [incidentsOuverts, setIncidentsOuverts] = useState([])
  const [panneauIncidents, setPanneauIncidents] = useState(false)

  const [modalTablette, setModalTablette] = useState(null) // { personne }
  const [modalAnnuler, setModalAnnuler] = useState(null) // { personne, etape, suiviId }
  const [modalIncident, setModalIncident] = useState(null) // { personne }
  const [msg, setMsg] = useState('')

  const charger = useCallback(async () => {
    setErreur('')
    const { data, error } = await supabase.rpc('terrain_liste', { p_jour: jourActif })
    if (error) { setErreur('Chargement impossible (droits accueil requis).'); return }
    setPersonnes(data || [])
  }, [jourActif])

  const chargerIncidents = useCallback(async () => {
    const { data } = await supabase.rpc('terrain_incidents', { p_ouverts_seulement: true })
    setIncidentsOuverts(data || [])
  }, [])

  useEffect(() => { if (authorized) { charger(); chargerIncidents() } }, [authorized, charger, chargerIncidents])

  // Realtime : une action a l'aeroport doit apparaitre immediatement a
  // l'hotel/au comptoir. Filet de secours (poll 30s + retour au premier
  // plan) en plus, au cas ou l'abonnement se coupe silencieusement.
  useEffect(() => {
    if (!authorized) return
    const channel = supabase
      .channel('terrain-suivi')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suivi_terrain' }, () => charger())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suivi_incidents' }, () => chargerIncidents())
      .subscribe()
    const poll = setInterval(() => { if (document.visibilityState === 'visible') { charger(); chargerIncidents() } }, 30000)
    const onVisible = () => { if (document.visibilityState === 'visible') { charger(); chargerIncidents() } }
    document.addEventListener('visibilitychange', onVisible)
    return () => { supabase.removeChannel(channel); clearInterval(poll); document.removeEventListener('visibilitychange', onVisible) }
  }, [authorized, charger, chargerIncidents])

  useEffect(() => {
    const on = () => setEnLigne(true), off = () => setEnLigne(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const enregistrerEquipier = valeur => {
    const v = valeur.trim()
    if (!v) return
    localStorage.setItem(CLE_EQUIPIER, v)
    setEquipier(v); setEditionEquipier(false)
  }

  const equipeConnue = useMemo(() => {
    if (!personnes) return []
    const noms = new Set(personnes.filter(p => p.categorie === 'organisation').map(p => p.prenom).filter(Boolean))
    return [...noms].sort()
  }, [personnes])

  const delegations = useMemo(() => {
    if (!personnes) return []
    const noms = new Set(personnes.map(p => p.delegation).filter(Boolean))
    return [...noms].sort()
  }, [personnes])

  const cleP = p => `${p.personne_type}:${p.personne_id}`

  const affiches = useMemo(() => {
    if (!personnes) return []
    let liste = personnes
    if (filtreCategorie !== 'tous') liste = liste.filter(p => p.categorie === filtreCategorie)
    if (filtreDelegation) liste = liste.filter(p => p.delegation === filtreDelegation)
    const q = sansAccents(query.trim())
    if (q.length >= 2) {
      liste = liste.filter(p => [p.nom, p.prenom, p.organisation, p.dossier].some(v => sansAccents(v).includes(q)))
    }
    if (aFaireSeulement && !mode.lecture) {
      liste = liste.filter(p => mode.etapes.some(e => !p.etapes?.[e]))
    }
    const arr = [...liste]
    if (mode.tri === 'arrivee') arr.sort((a, b) => (a.heure_arrivee || 'zz').localeCompare(b.heure_arrivee || 'zz') || (a.nom || '').localeCompare(b.nom || ''))
    else if (mode.tri === 'depart') arr.sort((a, b) => (a.heure_depart || 'zz').localeCompare(b.heure_depart || 'zz') || (a.nom || '').localeCompare(b.nom || ''))
    else arr.sort((a, b) => (a.nom || '').localeCompare(b.nom || '') || (a.prenom || '').localeCompare(b.prenom || ''))
    return arr
  }, [personnes, filtreCategorie, filtreDelegation, query, aFaireSeulement, mode])

  const compteurs = useMemo(() => {
    if (!personnes) return []
    return mode.etapes.map(e => ({
      etape: e, label: ETAPES[e].label,
      faits: personnes.filter(p => p.etapes?.[e]).length,
      total: personnes.length,
    }))
  }, [personnes, mode])

  // ── Actions ──────────────────────────────────────────────────────────
  const patchLocal = (p, etape, valeurEtape) => {
    setPersonnes(list => list.map(x => x === p ? { ...x, etapes: { ...x.etapes, [etape]: valeurEtape } } : x))
  }

  const marquer = async (p, etapeId, valeur) => {
    if (!enLigne) { setMsg('Hors connexion : utilisez la liste papier.'); return }
    const def = ETAPES[etapeId]
    const jourEtape = def.parJour ? jourActif : null
    const avant = p.etapes?.[etapeId]
    patchLocal(p, etapeId, { id: 'temp', fait_le: new Date().toISOString(), fait_par: equipier, valeur: valeur || null, mode: 'manuel' })
    const { data, error } = await supabase.rpc('terrain_marquer', {
      p_personne_type: p.personne_type, p_personne_id: p.personne_id, p_etape: etapeId,
      p_jour: jourEtape, p_valeur: valeur || null, p_mode: 'manuel', p_fait_par: equipier,
    })
    if (error) {
      patchLocal(p, etapeId, avant)
      setMsg(error.message?.includes('Numero de tablette') ? 'Numéro de tablette requis.' : "Échec de l'enregistrement.")
      return
    }
    const r = Array.isArray(data) ? data[0] : data
    patchLocal(p, etapeId, { id: r?.id, fait_le: new Date().toISOString(), fait_par: equipier, valeur: valeur || null, mode: 'manuel' })
    charger()
  }

  const demarrerMarquage = (p, etapeId) => {
    if (ETAPES[etapeId].champValeur) { setModalTablette({ personne: p, etape: etapeId }); return }
    marquer(p, etapeId, null)
  }

  const ouvrirAnnulation = (p, etapeId) => {
    const info = p.etapes?.[etapeId]
    if (!info) return
    setModalAnnuler({ personne: p, etape: etapeId, suiviId: info.id })
  }

  const confirmerAnnulation = async motif => {
    if (!modalAnnuler || !motif.trim()) return
    const { personne, etape, suiviId } = modalAnnuler
    const avant = personne.etapes?.[etape]
    patchLocal(personne, etape, undefined)
    const { error } = await supabase.rpc('terrain_annuler', { p_suivi_id: suiviId, p_motif: motif.trim(), p_par: equipier })
    if (error) { patchLocal(personne, etape, avant); setMsg("Échec de l'annulation.") }
    setModalAnnuler(null)
    charger()
  }

  const marquerGroupe = async etapeId => {
    if (!filtreDelegation) return
    if (!window.confirm(`Marquer « ${ETAPES[etapeId].label} » pour toute la délégation « ${filtreDelegation} » (${affiches.length} personne(s) affichée(s)) ?`)) return
    const jourEtape = ETAPES[etapeId].parJour ? jourActif : null
    const { data, error } = await supabase.rpc('terrain_marquer_groupe', { p_delegation: filtreDelegation, p_etape: etapeId, p_jour: jourEtape, p_fait_par: equipier })
    if (error) { setMsg("Échec de l'action groupée."); return }
    const r = Array.isArray(data) ? data[0] : data
    setMsg(`${r?.marques ?? 0} personne(s) marquée(s).`)
    charger()
  }

  const creerIncident = async (type, note) => {
    if (!modalIncident || !note.trim()) return
    const p = modalIncident.personne
    await supabase.rpc('terrain_incident_creer', { p_personne_type: p.personne_type, p_personne_id: p.personne_id, p_type: type, p_note: note.trim(), p_par: equipier })
    setModalIncident(null)
    charger(); chargerIncidents()
  }

  const resoudreIncident = async id => {
    await supabase.rpc('terrain_incident_resoudre', { p_id: id, p_par: equipier })
    chargerIncidents(); charger()
  }

  // ── Exports ──────────────────────────────────────────────────────────
  const exporterCSV = () => {
    const entetes = ['Nom', 'Prénom', 'Organisation', 'Délégation', 'Catégorie', ...mode.etapes.map(e => ETAPES[e].label)]
    const lignes = affiches.map(p => [
      p.nom, p.prenom, p.organisation, p.delegation || '', CAT_LABEL[p.categorie] || p.categorie,
      ...mode.etapes.map(e => p.etapes?.[e] ? `${heure(p.etapes[e].fait_le)} · ${p.etapes[e].fait_par}${p.etapes[e].valeur ? ` (${p.etapes[e].valeur})` : ''}` : ''),
    ])
    telechargerFichier(`Terrain_${mode.id}_${jourActif}.csv`, versCSV(entetes, lignes), 'text/csv;charset=utf-8;')
  }

  const imprimerListe = () => window.print()

  const exporterVisiteJ3 = async () => {
    // Toujours le 21 oct., independamment du jour actuellement affiche a
    // l'ecran (sinon un export lance depuis un autre onglet/jour listerait
    // les presents de ce jour-la au lieu des inscrits a la visite).
    const jourVisite = MODES.find(m => m.id === 'visite').jourFixe
    const { data, error } = await supabase.rpc('terrain_liste', { p_jour: jourVisite })
    if (error) { setMsg("Échec de l'export Visite J3."); return }
    const liste = (data || []).filter(p => p.etapes?.present)
    const entetes = ['Nom', 'Prénom', 'Organisation', 'Dossier', 'Pièce d\'identité présentée', 'Signature']
    const lignes = liste.map(p => [p.nom, p.prenom, p.organisation, p.dossier, '', ''])
    telechargerFichier('Visite_J3_liste_nominative.csv', versCSV(entetes, lignes), 'text/csv;charset=utf-8;')
  }

  const exporterAttestations = async () => {
    const { data, error } = await supabase.rpc('terrain_eligibles_attestation')
    if (error) { setMsg('Échec du calcul des éligibles.'); return }
    const entetes = ['Nom', 'Prénom', 'Organisation', 'Dossier']
    const lignes = (data || []).map(p => [p.nom, p.prenom, p.organisation, p.dossier])
    telechargerFichier('Eligibles_attestations.csv', versCSV(entetes, lignes), 'text/csv;charset=utf-8;')
  }

  useEffect(() => { const t = setTimeout(() => setMsg(''), 4000); return () => clearTimeout(t) }, [msg])

  if (!authorized) {
    return (
      <div style={wrap}>
        <div style={{ ...CARTE, padding: 28, textAlign: 'center', maxWidth: 380 }}>
          <Ico name="alert" size={28} color="#dc2626" />
          <p style={{ fontSize: 14, color: '#991b1b', fontWeight: 600, marginTop: 12 }}>Ce compte n'a pas accès au tableau terrain.</p>
        </div>
      </div>
    )
  }

  if (editionEquipier) {
    return (
      <div style={wrap}>
        <div style={{ ...CARTE, padding: 28, maxWidth: 380, width: '100%' }}>
          <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>COPAF 2026 · Terrain</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Qui êtes-vous ?</div>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 14px' }}>Votre prénom sera enregistré comme auteur de chaque action.</p>
          {equipeConnue.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {equipeConnue.map(n => (
                <button key={n} type="button" onClick={() => enregistrerEquipier(n)} style={{ ...BTN, background: '#eef2ff', color: NAVY }}>{n}</button>
              ))}
            </div>
          )}
          <input autoFocus placeholder="Ou saisissez librement" style={INPUT} defaultValue={equipier}
            onKeyDown={e => { if (e.key === 'Enter') enregistrerEquipier(e.currentTarget.value) }}
            id="champ-equipier" />
          <button type="button" style={{ ...boutonAction(NAVY), width: '100%', marginTop: 12 }}
            onClick={() => enregistrerEquipier(document.getElementById('champ-equipier').value)}>
            Continuer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '16px 16px 60px' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #feuille-impression, #feuille-impression * { visibility: visible; }
          #feuille-impression { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* En-tete */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>COPAF 2026 · Terrain</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Tableau de bord terrain</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setEditionEquipier(true)} style={{ ...BTN, background: '#eef2ff', color: NAVY }}>
              👤 {equipier}
            </button>
            <Link to="/staff/scan" style={{ fontSize: 12.5, color: NAVY, fontWeight: 700, textDecoration: 'none' }}>Scanner →</Link>
          </div>
        </div>

        {!enLigne && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, padding: '10px 14px', color: '#991b1b', fontSize: 13, fontWeight: 700 }}>
            Hors connexion — utilisez la liste papier. Les actions sont désactivées.
          </div>
        )}
        {erreur && <p style={{ color: '#dc2626', fontSize: 13.5 }}>{erreur}</p>}
        {msg && <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '9px 14px', color: NAVY, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

        {/* Jour + onglets de mode */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={jour} onChange={e => setJour(e.target.value)} disabled={!!mode.jourFixe} style={{ ...INPUT, width: 'auto', padding: '8px 10px', fontWeight: 700 }}>
            {JOURS_CONF.map(j => <option key={j} value={j}>{fmtJour(j)}</option>)}
          </select>
          {mode.jourFixe && <span style={{ fontSize: 11.5, color: '#94a3b8' }}>(fixé au {fmtJour(mode.jourFixe)})</span>}
          <button type="button" onClick={() => setPanneauIncidents(v => !v)} style={{ ...BTN, background: incidentsOuverts.length ? '#fef2f2' : '#f1f5f9', color: incidentsOuverts.length ? '#dc2626' : '#64748b' }}>
            ⚠ {incidentsOuverts.length} incident(s)
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button key={m.id} type="button" onClick={() => setModeId(m.id)} style={{
              ...BTN, padding: '8px 14px', background: modeId === m.id ? NAVY : '#f1f5f9', color: modeId === m.id ? '#fff' : '#334155',
            }}>
              {m.label}
            </button>
          ))}
        </div>

        {panneauIncidents && (
          <div style={{ ...CARTE, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Incidents ouverts</div>
            {incidentsOuverts.length === 0 && <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>Aucun incident ouvert.</p>}
            {incidentsOuverts.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{INCIDENT_TYPES.find(t => t.id === i.type)?.label || i.type} · {i.personne_id}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{i.note}</div>
                </div>
                <button type="button" onClick={() => resoudreIncident(i.id)} style={{ ...BTN, background: '#dcfce7', color: '#166534', flexShrink: 0 }}>Résoudre</button>
              </div>
            ))}
          </div>
        )}

        {/* Compteurs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {compteurs.map(c => (
            <div key={c.etape} style={{ ...CARTE, padding: '10px 16px', minWidth: 140 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{c.faits} / {c.total}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Recherche + filtres */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher (nom, organisation, dossier)…" style={{ ...INPUT, flex: 1, minWidth: 200 }} />
          <select value={filtreCategorie} onChange={e => setFiltreCategorie(e.target.value)} style={{ ...INPUT, width: 'auto' }}>
            <option value="tous">Toutes catégories</option>
            {Object.entries(CAT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select value={filtreDelegation} onChange={e => setFiltreDelegation(e.target.value)} style={{ ...INPUT, width: 'auto' }}>
            <option value="">Toutes délégations</option>
            {delegations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={aFaireSeulement} onChange={e => setAFaireSeulement(e.target.checked)} /> À faire seulement
          </label>
        </div>

        {filtreDelegation && !mode.lecture && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mode.etapes.filter(e => !ETAPES[e].champValeur || !ETAPES[e].valeurRequise).map(e => (
              <button key={e} type="button" onClick={() => marquerGroupe(e)} style={boutonAction('#7c3aed')}>
                Marquer toute la délégation — {ETAPES[e].label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={exporterCSV} style={boutonAction('#0891b2')}>⬇️ Export CSV</button>
          <button type="button" onClick={imprimerListe} style={boutonAction('#64748b')}>🖨️ Imprimer la liste</button>
          <button type="button" onClick={exporterVisiteJ3} style={boutonAction('#d97706')}>⬇️ Liste Visite J3</button>
          <button type="button" onClick={exporterAttestations} style={boutonAction('#16a34a')}>⬇️ Éligibles attestations</button>
        </div>

        {/* Liste */}
        {personnes === null && !erreur && <p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {affiches.length === 0 && personnes !== null && <p style={{ color: '#94a3b8', fontSize: 13, padding: 16, textAlign: 'center' }}>Aucune personne pour ce filtre.</p>}
          {affiches.map(p => {
            const incidentOuvert = incidentsOuverts.some(i => i.personne_type === p.personne_type && i.personne_id === p.personne_id)
            return (
              <div key={cleP(p)} style={{ ...CARTE, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {p.photo_url ? (
                  <img src={p.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eef2ff', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                    {(p.prenom?.[0] || '') + (p.nom?.[0] || '')}
                  </div>
                )}
                <div style={{ minWidth: 160, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {p.prenom} {p.nom}
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: CAT_COLOR[p.categorie], borderRadius: 20, padding: '1px 7px' }}>{CAT_LABEL[p.categorie]}</span>
                    {p.statut_dossier === 'a_regulariser' && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#92400e', background: '#fef3c7', borderRadius: 20, padding: '1px 6px' }}>Dossier à régulariser</span>}
                    {incidentOuvert && <Ico name="alert" size={13} color="#dc2626" />}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>
                    {p.organisation}{p.delegation ? ` · ${p.delegation}` : ''} · {p.dossier}
                    {mode.id === 'aeroport' && p.vol_arrivee && ` · ✈ ${p.vol_arrivee} ${p.heure_arrivee || ''}`}
                    {mode.id === 'depart' && p.vol_depart && ` · ✈ ${p.vol_depart} ${p.heure_depart || ''}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {mode.etapes.map(e => {
                    const fait = p.etapes?.[e]
                    if (mode.lecture) {
                      return (
                        <span key={e} title={ETAPES[e].label} style={{ fontSize: 10.5, fontWeight: 700, padding: '4px 8px', borderRadius: 8, background: fait ? '#dcfce7' : '#f1f5f9', color: fait ? '#166534' : '#94a3b8' }}>
                          {ETAPES[e].label.split(' ')[0]}{fait ? ' ✓' : ''}
                        </span>
                      )
                    }
                    return fait ? (
                      <button key={e} type="button" onClick={() => ouvrirAnnulation(p, e)} disabled={!enLigne} title="Cliquer pour annuler" style={{
                        ...BTN, background: '#16a34a', color: '#fff', minWidth: 90, textAlign: 'center',
                      }}>
                        ✓ {heure(fait.fait_le)} · {fait.fait_par}{fait.mode === 'scan' ? ' 📷' : ''}
                      </button>
                    ) : (
                      <button key={e} type="button" onClick={() => demarrerMarquage(p, e)} disabled={!enLigne} style={{ ...BTN, background: '#e2e8f0', color: '#334155', minWidth: 90 }}>
                        {ETAPES[e].label}
                      </button>
                    )
                  })}
                  <button type="button" onClick={() => setModalIncident({ personne: p })} disabled={!enLigne} style={{ ...BTN, background: '#fef2f2', color: '#dc2626' }}>
                    ⚠ Incident
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feuille d'impression (secours papier) */}
        <div id="feuille-impression" style={{ display: 'none' }}>
          <h2>COPAF 2026 — {mode.label} — {fmtJour(jourActif)}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={thTd}>Nom</th><th style={thTd}>Organisation</th><th style={thTd}>☐</th><th style={thTd}>Signature</th>
            </tr></thead>
            <tbody>
              {[...affiches].sort((a, b) => (a.nom || '').localeCompare(b.nom || '')).map(p => (
                <tr key={cleP(p)}>
                  <td style={thTd}>{p.prenom} {p.nom}</td>
                  <td style={thTd}>{p.organisation}</td>
                  <td style={{ ...thTd, width: 30 }}></td>
                  <td style={{ ...thTd, width: 160 }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalTablette && (
        <ModalValeur
          titre={`${ETAPES[modalTablette.etape].label} — ${modalTablette.personne.prenom} ${modalTablette.personne.nom}`}
          placeholder={ETAPES[modalTablette.etape].placeholderValeur}
          requise={ETAPES[modalTablette.etape].valeurRequise}
          onValider={v => { marquer(modalTablette.personne, modalTablette.etape, v); setModalTablette(null) }}
          onFermer={() => setModalTablette(null)}
        />
      )}
      {modalAnnuler && (
        <ModalMotif
          titre={`Annuler « ${ETAPES[modalAnnuler.etape].label} » — ${modalAnnuler.personne.prenom} ${modalAnnuler.personne.nom} ?`}
          onValider={confirmerAnnulation}
          onFermer={() => setModalAnnuler(null)}
        />
      )}
      {modalIncident && (
        <ModalIncident personne={modalIncident.personne} onValider={creerIncident} onFermer={() => setModalIncident(null)} />
      )}
    </div>
  )
}

const thTd = { border: '1px solid #333', padding: '6px 8px', textAlign: 'left', fontSize: 12 }
const wrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }
const boiteModal = { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, padding: 22 }

function ModalValeur({ titre, placeholder, requise, onValider, onFermer }) {
  const [v, setV] = useState('')
  return (
    <div style={overlay} onClick={onFermer}>
      <div style={boiteModal} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 12 }}>{titre}</div>
        <input autoFocus value={v} onChange={e => setV(e.target.value)} placeholder={placeholder} style={INPUT} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" disabled={requise && !v.trim()} onClick={() => onValider(v)} style={{ ...boutonAction(NAVY), flex: 1, opacity: requise && !v.trim() ? 0.5 : 1 }}>Valider</button>
          <button type="button" onClick={onFermer} style={{ ...BTN, background: '#f1f5f9', color: '#334155' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

function ModalMotif({ titre, onValider, onFermer }) {
  const [motif, setMotif] = useState('')
  return (
    <div style={overlay} onClick={onFermer}>
      <div style={boiteModal} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 12 }}>{titre}</div>
        <textarea autoFocus value={motif} onChange={e => setMotif(e.target.value)} placeholder="Motif de l'annulation (obligatoire)" style={{ ...INPUT, minHeight: 70, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" disabled={!motif.trim()} onClick={() => onValider(motif)} style={{ ...boutonAction('#dc2626'), flex: 1, opacity: motif.trim() ? 1 : 0.5 }}>Confirmer l'annulation</button>
          <button type="button" onClick={onFermer} style={{ ...BTN, background: '#f1f5f9', color: '#334155' }}>Retour</button>
        </div>
      </div>
    </div>
  )
}

function ModalIncident({ personne, onValider, onFermer }) {
  const [type, setType] = useState('autre')
  const [note, setNote] = useState('')
  return (
    <div style={overlay} onClick={onFermer}>
      <div style={boiteModal} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 4 }}>Signaler un incident</div>
        <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 12 }}>{personne.prenom} {personne.nom}</div>
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...INPUT, marginBottom: 8 }}>
          {INCIDENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <textarea autoFocus value={note} onChange={e => setNote(e.target.value)} placeholder="Note factuelle et courte" style={{ ...INPUT, minHeight: 70, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" disabled={!note.trim()} onClick={() => onValider(type, note)} style={{ ...boutonAction('#dc2626'), flex: 1, opacity: note.trim() ? 1 : 0.5 }}>Enregistrer</button>
          <button type="button" onClick={onFermer} style={{ ...BTN, background: '#f1f5f9', color: '#334155' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
