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
// Deux niveaux d'acces (voir migration 20260929090000_terrain_acces_pin.sql) :
// - 'admin' : vrai compte Supabase Auth (scope checkin/all), voit tout.
// - 'limite' : dossier + PIN (intervenants.acces_terrain), meme identifiant
//   que l'espace intervenant classique mais un secret dedie (le PIN, pas
//   l'email qui n'est pas confidentiel) - ne voit que la categorie
//   'organisation' (equipe/comite). Pas de session persistee en
//   localStorage (le PIN ne vit qu'en memoire de l'onglet), meme
//   convention que BadgeToken.jsx.
//
// Hors perimetre v1 (comme demande) : file d'attente hors-ligne. Le bandeau
// "Hors connexion" desactive juste les actions en attendant le reseau ou la
// liste papier (bouton Imprimer).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { Ico } from '../utils/dossierUi'
import { useNiveauTerrain } from '../utils/terrainAuth'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const CLE_EQUIPIER = 'copaf_terrain_equipier' // partagee avec StaffScan.jsx — garder la meme chaine

const ETAPES = {
  aeroport: { label: 'Accueilli à l\'aéroport' },
  // Pas de numero de chambre : donnee sensible retiree pour la securite des participants.
  hotel: { label: 'Arrivé à l\'hôtel' },
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
  { id: 'arrivees', label: 'Arrivées & départs groupés', etapes: [], tri: 'nom', lecture: true, vue: 'groupes', adminOnly: true },
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

const BTN = { padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }
const boutonAction = bg => ({ ...BTN, background: bg, color: '#fff', padding: '10px 16px' })
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }
const CARTE = { background: '#fff', borderRadius: 16, border: '1px solid #eef1f8', boxShadow: '0 4px 14px -4px rgba(15,23,42,.08)' }
const PILL_CAT = { participant: { bg: '#ecfeff', fg: '#0e7490', bd: '#a5f3fc' }, intervenant: { bg: '#f5f3ff', fg: '#6d28d9', bd: '#ddd6fe' }, organisation: { bg: '#fffbeb', fg: '#b45309', bd: '#fde68a' } }

// ── Arrivées & départs groupés (admin uniquement) : tout le monde groupé
// par vol exact (date+heure+numero), dans les deux sens — pratique pour
// l'accueil aeroport et les transferts (voir aussi l'onglet equivalent
// dans Voyages & Guide, meme logique de groupement). Requete independante
// de terrain_liste (qui ne renvoie pas la date du vol), sur les memes
// tables que AdminVoyage.jsx.
function cleVolTerrain(v) {
  if (!v?.date || !v?.heure) return null
  return `${v.date}|${v.heure}|${v.numero || ''}|${v.compagnie || ''}`
}
function grouperParVolTerrain(personnes, champ) {
  const groupes = new Map()
  personnes.forEach(p => {
    const v = p[champ]
    const cle = cleVolTerrain(v)
    if (!cle) return
    if (!groupes.has(cle)) groupes.set(cle, { ...v, personnes: [] })
    groupes.get(cle).personnes.push(p)
  })
  return [...groupes.values()].sort((a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`))
}
const fmtDateLongueTerrain = d => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) : '')

function GroupeVolTerrain({ groupe, directionIcone }) {
  return (
    <div className="terrain-carte" style={{ ...CARTE, padding: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 17 }}>{directionIcone}</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>{fmtDateLongueTerrain(groupe.date)} · {groupe.heure}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{[groupe.compagnie, groupe.numero].filter(Boolean).join(' ') || 'Vol non précisé'}</div>
          </div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: NAVY, background: '#eef2ff', borderRadius: 100, padding: '3px 11px' }}>
          {groupe.personnes.length} personne{groupe.personnes.length > 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {groupe.personnes.map(p => {
          const pill = PILL_CAT[p.categorie] || { bg: '#f1f5f9', fg: '#475569', bd: '#e2e8f0' }
          return (
            <div key={`${p.personne_type}:${p.personne_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '7px 11px', background: '#f8faff', borderRadius: 10, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{p.prenom} {p.nom}</span>
                <span style={{ marginLeft: 6, fontSize: 9.5, fontWeight: 800, color: pill.fg, background: pill.bg, border: `1px solid ${pill.bd}`, borderRadius: 20, padding: '1px 7px' }}>{CAT_LABEL[p.categorie]}</span>
                <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{p.organisation || '—'} · {p.dossier}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: p.hotel ? '#166534' : '#b45309', background: p.hotel ? '#dcfce7' : '#fffbeb', borderRadius: 100, padding: '2px 9px', whiteSpace: 'nowrap' }}>
                {p.hotel || 'Hôtel à attribuer'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VueArriveesGroupees({ acces }) {
  const [personnes, setPersonnes] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    ;(async () => {
      const [insc, parts, interv, voy] = await Promise.all([
        supabase.from('inscriptions').select('dossier, paiement_status, contacts(nom, prenom, organisation)'),
        supabase.from('inscription_participants').select('dossier, nom, prenom, inscriptions(paiement_status, contacts(organisation))'),
        supabase.from('intervenants').select('dossier, nom, prenom, organisation, equipe'),
        supabase.from('voyages').select('dossier, vol_aller, vol_retour, hotel'),
      ])
      if (annule) return
      if (insc.error || parts.error || interv.error || voy.error) { setErreur('Chargement impossible (droits administrateur requis).'); return }
      const voyages = Object.fromEntries((voy.data || []).map(v => [v.dossier, v]))
      const trimme = s => String(s || '').trim() || null
      const liste = [
        ...(insc.data || []).filter(i => i.paiement_status !== 'annule' && i.paiement_status !== 'prospect').map(i => ({
          personne_type: 'inscription', personne_id: i.dossier, dossier: i.dossier,
          nom: trimme(i.contacts?.nom), prenom: trimme(i.contacts?.prenom), organisation: trimme(i.contacts?.organisation), categorie: 'participant',
          vol_aller: voyages[i.dossier]?.vol_aller || null, vol_retour: voyages[i.dossier]?.vol_retour || null, hotel: voyages[i.dossier]?.hotel || null,
        })),
        ...(parts.data || []).filter(p => p.inscriptions?.paiement_status !== 'annule' && p.inscriptions?.paiement_status !== 'prospect').map(p => ({
          personne_type: 'participant_groupe', personne_id: p.dossier, dossier: p.dossier,
          nom: trimme(p.nom), prenom: trimme(p.prenom), organisation: trimme(p.inscriptions?.contacts?.organisation), categorie: 'participant',
          vol_aller: voyages[p.dossier]?.vol_aller || null, vol_retour: voyages[p.dossier]?.vol_retour || null, hotel: voyages[p.dossier]?.hotel || null,
        })),
        ...(interv.data || []).map(v => ({
          personne_type: v.equipe ? 'equipe' : 'intervenant', personne_id: v.dossier, dossier: v.dossier,
          nom: trimme(v.nom), prenom: trimme(v.prenom), organisation: trimme(v.organisation), categorie: v.equipe ? 'organisation' : 'intervenant',
          vol_aller: voyages[v.dossier]?.vol_aller || null, vol_retour: voyages[v.dossier]?.vol_retour || null, hotel: voyages[v.dossier]?.hotel || null,
        })),
      ]
      setPersonnes(liste)
    })()
    return () => { annule = true }
  }, [acces])

  if (erreur) return <p style={{ color: '#dc2626', fontSize: 13.5 }}>{erreur}</p>
  if (personnes === null) return <p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p>

  const arrivees = grouperParVolTerrain(personnes, 'vol_aller')
  const departs = grouperParVolTerrain(personnes, 'vol_retour')
  const sansVol = personnes.filter(p => !p.vol_aller && !p.vol_retour).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
        Tout le monde groupé par vol exact — qui arrive ou repart ensemble, et à quelle heure. {sansVol > 0 && `${sansVol} personne(s) sans vol renseigné.`}
      </p>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0a1128', margin: '0 0 10px' }}>↘ Arrivées à Casablanca ({arrivees.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {arrivees.length === 0 && <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Aucun vol aller renseigné.</p>}
          {arrivees.map(g => <GroupeVolTerrain key={cleVolTerrain(g)} groupe={g} directionIcone="↘" />)}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0a1128', margin: '0 0 10px' }}>↗ Départs de Casablanca ({departs.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {departs.length === 0 && <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Aucun vol retour renseigné.</p>}
          {departs.map(g => <GroupeVolTerrain key={cleVolTerrain(g)} groupe={g} directionIcone="↗" />)}
        </div>
      </div>
    </div>
  )
}

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
  // Detection du niveau d'acces au montage : compte Supabase Auth admin
  // (scope checkin/all) d'abord, sinon formulaire dossier+PIN (voir
  // ConnexionPin ci-dessous). Pas d'AuthGate ici : Terrain.jsx gere les deux
  // chemins lui-meme (App.jsx ne l'enveloppe plus). Logique partagee avec
  // StaffScan.jsx via utils/terrainAuth.js.
  const { niveau, identite, acces, connecter } = useNiveauTerrain()
  const authorized = niveau === 'admin' || niveau === 'limite'

  const [equipier, setEquipier] = useState(() => localStorage.getItem(CLE_EQUIPIER) || '')
  const [editionEquipier, setEditionEquipier] = useState(!equipier)
  // Nom affiche/transmis comme auteur : le prenom reel pour un compte
  // limite (le serveur l'impose de toute facon, cote client c'est juste
  // pour l'affichage), la saisie libre pour un admin.
  const auteurAffiche = niveau === 'limite' ? (identite?.prenom || '') : equipier
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
    const { data, error } = await supabase.rpc('terrain_liste', { p_jour: jourActif, ...acces })
    if (error) { setErreur('Chargement impossible (droits accueil requis).'); return }
    setPersonnes(data || [])
  }, [jourActif, acces])

  const chargerIncidents = useCallback(async () => {
    const { data } = await supabase.rpc('terrain_incidents', { p_ouverts_seulement: true, ...acces })
    setIncidentsOuverts(data || [])
  }, [acces])

  useEffect(() => { if (authorized) { charger(); chargerIncidents() } }, [authorized, charger, chargerIncidents])

  // charger()/chargerIncidents() changent d'identite a chaque changement de
  // jour (deps de useCallback) : passer par une ref evite de desabonner et
  // rouvrir le canal Realtime a chaque fois qu'on change d'onglet jour,
  // l'abonnement lui-meme ne depend que de la connexion (authorized).
  const chargeursRef = useRef({ charger, chargerIncidents })
  useEffect(() => { chargeursRef.current = { charger, chargerIncidents } }, [charger, chargerIncidents])

  // Realtime : une action a l'aeroport doit apparaitre immediatement a
  // l'hotel/au comptoir. Filet de secours (poll 30s + retour au premier
  // plan) en plus, au cas ou l'abonnement se coupe silencieusement.
  useEffect(() => {
    if (!authorized) return
    const channel = supabase
      .channel('terrain-suivi')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suivi_terrain' }, () => chargeursRef.current.charger())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suivi_incidents' }, () => chargeursRef.current.chargerIncidents())
      .subscribe()
    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') { chargeursRef.current.charger(); chargeursRef.current.chargerIncidents() }
    }, 30000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') { chargeursRef.current.charger(); chargeursRef.current.chargerIncidents() }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => { supabase.removeChannel(channel); clearInterval(poll); document.removeEventListener('visibilitychange', onVisible) }
  }, [authorized])

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
    patchLocal(p, etapeId, { id: 'temp', fait_le: new Date().toISOString(), fait_par: auteurAffiche, valeur: valeur || null, mode: 'manuel' })
    const { data, error } = await supabase.rpc('terrain_marquer', {
      p_personne_type: p.personne_type, p_personne_id: p.personne_id, p_etape: etapeId,
      p_jour: jourEtape, p_valeur: valeur || null, p_mode: 'manuel', p_fait_par: auteurAffiche, ...acces,
    })
    if (error) {
      patchLocal(p, etapeId, avant)
      setMsg(error.message?.includes('Numero de tablette') ? 'Numéro de tablette requis.' : "Échec de l'enregistrement.")
      return
    }
    const r = Array.isArray(data) ? data[0] : data
    patchLocal(p, etapeId, { id: r?.id, fait_le: new Date().toISOString(), fait_par: auteurAffiche, valeur: valeur || null, mode: 'manuel' })
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
    const { error } = await supabase.rpc('terrain_annuler', { p_suivi_id: suiviId, p_motif: motif.trim(), p_par: auteurAffiche, ...acces })
    if (error) { patchLocal(personne, etape, avant); setMsg("Échec de l'annulation.") }
    setModalAnnuler(null)
    charger()
  }

  const marquerGroupe = async etapeId => {
    if (!filtreDelegation) return
    if (!window.confirm(`Marquer « ${ETAPES[etapeId].label} » pour toute la délégation « ${filtreDelegation} » (${affiches.length} personne(s) affichée(s)) ?`)) return
    const jourEtape = ETAPES[etapeId].parJour ? jourActif : null
    const { data, error } = await supabase.rpc('terrain_marquer_groupe', { p_delegation: filtreDelegation, p_etape: etapeId, p_jour: jourEtape, p_fait_par: auteurAffiche, ...acces })
    if (error) { setMsg("Échec de l'action groupée."); return }
    const r = Array.isArray(data) ? data[0] : data
    setMsg(`${r?.marques ?? 0} personne(s) marquée(s).`)
    charger()
  }

  const creerIncident = async (type, note) => {
    if (!modalIncident || !note.trim()) return
    const p = modalIncident.personne
    await supabase.rpc('terrain_incident_creer', { p_personne_type: p.personne_type, p_personne_id: p.personne_id, p_type: type, p_note: note.trim(), p_par: auteurAffiche, ...acces })
    setModalIncident(null)
    charger(); chargerIncidents()
  }

  const resoudreIncident = async id => {
    await supabase.rpc('terrain_incident_resoudre', { p_id: id, p_par: auteurAffiche, ...acces })
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
    const { data, error } = await supabase.rpc('terrain_liste', { p_jour: jourVisite, ...acces })
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

  if (niveau === null) {
    return <div style={wrap}><p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p></div>
  }

  if (niveau === 'anonyme') {
    return <ConnexionPin onConnecte={connecter} />
  }

  if (niveau === 'admin' && editionEquipier) {
    return (
      <div style={wrap}>
        <div style={{ ...CARTE, overflow: 'hidden', maxWidth: 380, width: '100%' }}>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, padding: '22px 26px 20px', color: '#fff' }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>COPAF 2026 · Terrain</div>
            <div style={{ fontSize: 19, fontWeight: 900, marginTop: 4 }}>Qui êtes-vous ?</div>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 16px' }}>Votre prénom sera enregistré comme auteur de chaque action.</p>
            {equipeConnue.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {equipeConnue.map(n => (
                  <button key={n} type="button" onClick={() => enregistrerEquipier(n)} style={{ ...BTN, background: '#eef2ff', color: NAVY }}>{n}</button>
                ))}
              </div>
            )}
            <input autoFocus placeholder="Ou saisissez librement" style={INPUT} defaultValue={equipier}
              onKeyDown={e => { if (e.key === 'Enter') enregistrerEquipier(e.currentTarget.value) }}
              id="champ-equipier" />
            <button type="button" style={{ ...boutonAction(NAVY), width: '100%', marginTop: 14, justifyContent: 'center' }}
              onClick={() => enregistrerEquipier(document.getElementById('champ-equipier').value)}>
              Continuer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5fb', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '0 0 60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
        .terrain-carte { transition: box-shadow .15s ease, transform .15s ease; }
        .terrain-carte:hover { box-shadow: 0 10px 26px -8px rgba(15,23,42,.14); transform: translateY(-1px); }
        .terrain-modal-overlay { animation: terrainFadeIn .15s ease; }
        .terrain-modal-box { animation: terrainPopIn .18s cubic-bezier(.2,.9,.3,1.2); }
        @keyframes terrainFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes terrainPopIn { from { opacity: 0; transform: scale(.96) translateY(6px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @media print {
          body * { visibility: hidden; }
          #feuille-impression, #feuille-impression * { visibility: visible; }
          #feuille-impression { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Bandeau d'en-tete */}
      <div style={{ background: `linear-gradient(120deg, ${NAVY}, #001a66 60%, ${BLUE})`, padding: '22px 16px 46px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>COPAF 2026 · Terrain</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2 }}>Tableau de bord terrain</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {niveau === 'admin' ? (
              <button type="button" onClick={() => setEditionEquipier(true)} style={{ ...BTN, background: 'rgba(255,255,255,.14)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
                <Ico name="user" size={13} color="#fff" /> {equipier}
              </button>
            ) : (
              <span style={{ ...BTN, background: 'rgba(255,255,255,.14)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', cursor: 'default' }}>
                <Ico name="user" size={13} color="#fff" /> {auteurAffiche}
              </span>
            )}
            {niveau === 'admin' && (
              <Link to="/staff/scan" style={{ ...BTN, background: '#fff', color: NAVY, textDecoration: 'none' }}>
                <Ico name="search" size={13} color={NAVY} /> Scanner
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '-28px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!enLigne && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, padding: '10px 14px', color: '#991b1b', fontSize: 13, fontWeight: 700 }}>
            Hors connexion — utilisez la liste papier. Les actions sont désactivées.
          </div>
        )}
        {erreur && <p style={{ color: '#dc2626', fontSize: 13.5 }}>{erreur}</p>}
        {msg && <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '9px 14px', color: NAVY, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

        {/* Carte "jour + onglets" flottante sur le bandeau */}
        <div className="terrain-carte" style={{ ...CARTE, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={jour} onChange={e => setJour(e.target.value)} disabled={!!mode.jourFixe} style={{ ...INPUT, width: 'auto', padding: '8px 10px', fontWeight: 700 }}>
                {JOURS_CONF.map(j => <option key={j} value={j}>{fmtJour(j)}</option>)}
              </select>
              {mode.jourFixe && <span style={{ fontSize: 11.5, color: '#94a3b8' }}>(fixé au {fmtJour(mode.jourFixe)})</span>}
            </div>
            <button type="button" onClick={() => setPanneauIncidents(v => !v)} style={{
              ...BTN, background: incidentsOuverts.length ? '#fef2f2' : '#f1f5f9', color: incidentsOuverts.length ? '#dc2626' : '#64748b',
            }}>
              <Ico name="alert" size={13} color={incidentsOuverts.length ? '#dc2626' : '#94a3b8'} /> {incidentsOuverts.length} incident(s)
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MODES.filter(m => !m.adminOnly || niveau === 'admin').map(m => (
              <button key={m.id} type="button" onClick={() => setModeId(m.id)} style={{
                ...BTN, padding: '8px 15px', borderRadius: 100,
                background: modeId === m.id ? `linear-gradient(135deg, ${NAVY}, ${BLUE})` : '#f1f5f9',
                color: modeId === m.id ? '#fff' : '#334155',
                boxShadow: modeId === m.id ? '0 4px 12px -3px rgba(0,14,145,.4)' : 'none',
              }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {panneauIncidents && (
          <div className="terrain-carte" style={{ ...CARTE, padding: 16 }}>
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

        {mode.vue === 'groupes' ? (
          <VueArriveesGroupees acces={acces} />
        ) : (
        <>
        {/* Compteurs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {compteurs.map(c => {
            const pct = c.total ? Math.round((c.faits / c.total) * 100) : 0
            return (
              <div key={c.etape} className="terrain-carte" style={{ ...CARTE, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 19, fontWeight: 900, color: NAVY }}>{c.faits}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>/ {c.total}</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700, marginTop: 2, marginBottom: 8 }}>{c.label}</div>
                <div style={{ height: 5, borderRadius: 100, background: '#eef2f7', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 100, background: `linear-gradient(90deg, ${BLUE}, ${NAVY})`, transition: 'width .3s ease' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recherche + filtres */}
        <div className="terrain-carte" style={{ ...CARTE, padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher (nom, organisation, dossier)…" style={{ ...INPUT, flex: 1, minWidth: 200, border: '1.5px solid #eef1f8', background: '#f8fafc' }} />
          {niveau === 'admin' && (
            <select value={filtreCategorie} onChange={e => setFiltreCategorie(e.target.value)} style={{ ...INPUT, width: 'auto', border: '1.5px solid #eef1f8', background: '#f8fafc' }}>
              <option value="tous">Toutes catégories</option>
              {Object.entries(CAT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          )}
          {niveau === 'admin' && (
            <select value={filtreDelegation} onChange={e => setFiltreDelegation(e.target.value)} style={{ ...INPUT, width: 'auto', border: '1.5px solid #eef1f8', background: '#f8fafc' }}>
              <option value="">Toutes délégations</option>
              {delegations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
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
          <button type="button" onClick={exporterCSV} style={boutonAction('#0891b2')}><Ico name="download" size={13} color="#fff" /> Export CSV</button>
          <button type="button" onClick={imprimerListe} style={boutonAction('#64748b')}><Ico name="receipt" size={13} color="#fff" /> Imprimer la liste</button>
          <button type="button" onClick={exporterVisiteJ3} style={boutonAction('#d97706')}><Ico name="download" size={13} color="#fff" /> Liste Visite J3</button>
          {niveau === 'admin' && (
            <button type="button" onClick={exporterAttestations} style={boutonAction('#16a34a')}><Ico name="download" size={13} color="#fff" /> Éligibles attestations</button>
          )}
        </div>

        {/* Liste */}
        {personnes === null && !erreur && <p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {affiches.length === 0 && personnes !== null && (
            <div style={{ padding: 32, textAlign: 'center', background: '#fff', borderRadius: 14, border: '1.5px dashed #cbd5e1', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
              Aucune personne pour ce filtre.
            </div>
          )}
          {affiches.map(p => {
            const incidentOuvert = incidentsOuverts.some(i => i.personne_type === p.personne_type && i.personne_id === p.personne_id)
            const pill = PILL_CAT[p.categorie] || { bg: '#f1f5f9', fg: '#475569', bd: '#e2e8f0' }
            return (
              <div key={cleP(p)} className="terrain-carte" style={{ ...CARTE, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {p.photo_url ? (
                  <img src={p.photo_url} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #eef1f8' }} />
                ) : (
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                    {(p.prenom?.[0] || '') + (p.nom?.[0] || '')}
                  </div>
                )}
                <div style={{ minWidth: 160, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {p.prenom} {p.nom}
                    <span style={{ fontSize: 10, fontWeight: 800, color: pill.fg, background: pill.bg, border: `1px solid ${pill.bd}`, borderRadius: 20, padding: '1px 8px' }}>{CAT_LABEL[p.categorie]}</span>
                    {p.statut_dossier === 'a_regulariser' && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#92400e', background: '#fef3c7', borderRadius: 20, padding: '1px 6px' }}>Dossier à régulariser</span>}
                    {incidentOuvert && <Ico name="alert" size={13} color="#dc2626" />}
                  </div>
                  {p.fonction && <div style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{p.fonction}</div>}
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
                        ...BTN, background: '#16a34a', color: '#fff', minWidth: 90, justifyContent: 'center',
                      }}>
                        <Ico name="check" size={11} color="#fff" /> {heure(fait.fait_le)} · {fait.fait_par}{fait.mode === 'scan' ? ' 📷' : ''}
                      </button>
                    ) : (
                      <button key={e} type="button" onClick={() => demarrerMarquage(p, e)} disabled={!enLigne} style={{ ...BTN, background: '#eef2f7', color: '#334155', minWidth: 90, justifyContent: 'center' }}>
                        {ETAPES[e].label}
                      </button>
                    )
                  })}
                  <button type="button" onClick={() => setModalIncident({ personne: p })} disabled={!enLigne} style={{ ...BTN, background: '#fef2f2', color: '#dc2626' }}>
                    <Ico name="alert" size={12} color="#dc2626" /> Incident
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
        </>
        )}
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
const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(3px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }
const boiteModal = { background: '#fff', borderRadius: 18, width: '100%', maxWidth: 380, padding: 22, boxShadow: '0 24px 48px -12px rgba(15,23,42,.35)' }

function ModalValeur({ titre, placeholder, requise, onValider, onFermer }) {
  const [v, setV] = useState('')
  return (
    <div style={overlay} className="terrain-modal-overlay" onClick={onFermer}>
      <div style={boiteModal} className="terrain-modal-box" onClick={e => e.stopPropagation()}>
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
    <div style={overlay} className="terrain-modal-overlay" onClick={onFermer}>
      <div style={boiteModal} className="terrain-modal-box" onClick={e => e.stopPropagation()}>
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
    <div style={overlay} className="terrain-modal-overlay" onClick={onFermer}>
      <div style={boiteModal} className="terrain-modal-box" onClick={e => e.stopPropagation()}>
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

// Ecran de connexion pour le personnel sans compte Supabase Auth (Yvette,
// Eliram, l'equipe Maroc...) : dossier + PIN (voir terrain_login). Le PIN
// ne reste qu'en memoire (etat du composant parent), jamais en
// localStorage, meme convention que BadgeToken.jsx.
function ConnexionPin({ onConnecte }) {
  const [dossier, setDossier] = useState('')
  const [pin, setPin] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  const connexion = async e => {
    e.preventDefault()
    if (!dossier.trim() || !pin.trim()) return
    setEnCours(true); setErreur('')
    try {
      const { data, error } = await supabase.rpc('terrain_login', { p_dossier: dossier.trim(), p_pin: pin.trim() })
      if (error) {
        setErreur(/tentatives/i.test(error.message || '') ? 'Trop de tentatives, réessayez dans 15 minutes.' : 'Erreur, réessayez.')
        return
      }
      if (!data) { setErreur('Dossier ou code incorrect.'); return }
      onConnecte(dossier.trim(), pin.trim(), { nom: data.nom, prenom: data.prenom })
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div style={wrap}>
      <div style={{ ...CARTE, overflow: 'hidden', maxWidth: 380, width: '100%' }}>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, padding: '22px 26px 20px', color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>COPAF 2026 · Terrain</div>
          <div style={{ fontSize: 19, fontWeight: 900, marginTop: 4 }}>Connexion</div>
        </div>
        <form onSubmit={connexion} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 4px' }}>Votre numéro de dossier et le code PIN qui vous a été communiqué.</p>
          <input
            value={dossier} onChange={e => { setErreur(''); setDossier(e.target.value) }}
            placeholder="INT2026-XXX" autoCapitalize="characters" autoComplete="username" style={INPUT}
          />
          <input
            value={pin} onChange={e => { setErreur(''); setPin(e.target.value) }}
            placeholder="Code PIN" type="password" inputMode="numeric" autoComplete="current-password" style={INPUT}
          />
          {erreur && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{erreur}</p>}
          <button type="submit" disabled={enCours || !dossier.trim() || !pin.trim()} style={{ ...boutonAction(NAVY), width: '100%', justifyContent: 'center', marginTop: 6, opacity: enCours ? 0.7 : 1 }}>
            {enCours ? '…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
