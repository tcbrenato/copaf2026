// src/pages/StaffScan.jsx
//
// Page reservee au personnel d'accueil : compte admin Supabase Auth (scope
// 'checkin'/'all') OU dossier+PIN (meme mecanisme que Terrain.jsx, voir
// utils/terrainAuth.js et migration 20260929100000_scan_acces_pin.sql).
// Pas d'AuthGate : la page gere les deux chemins elle-meme.
//
// Scan continu : chaque badge lu declenche directement l'emargement
// (badge_checkin) sans quitter la page — la camera (Html5Qrcode bas niveau,
// facingMode 'environment') redemarre seule apres la banniere de
// confirmation, au lieu de naviguer vers /badge/{token} et de perdre 5-10s
// par personne a relancer le scanner. La recherche manuelle sert de secours
// si le QR est illisible ou le badge abime.
//
// Par defaut (mode fiche), un scan ou un resultat de recherche ouvre la FICHE de la
// personne avec les boutons d'etapes (aeroport, hotel, kit, tablette T01-T35, present) :
// rien n'est marque sans appui. Case « Emarger directement au scan » : ancien mode,
// presence automatique pour les jours de conference.
//
// Non couvert dans cette premiere version : mode hors-ligne avec file
// d'attente locale synchronisee au retour reseau (mentionne dans le
// cahier des charges) — a construire separement si besoin reel confirme
// le jour J.

import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../supabase'
import { useNiveauTerrain } from '../utils/terrainAuth'
import { Ico } from '../utils/dossierUi'
import { PREREQUIS, normaliserNumeroTablette } from '../utils/terrainEtapes'
import ModalTablette from '../components/ModalTablette'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const DOMAINES_AUTORISES = ['copaf-ports.com', 'www.copaf-ports.com', 'localhost']
const PAUSE_APRES_SCAN_MS = 2200

// Etapes proposees sur la fiche d'une personne (scan ou recherche), dans l'ordre du parcours.
const ETAPES_FICHE = [
  { id: 'aeroport', label: "Accueilli à l'aéroport" },
  { id: 'hotel', label: "Arrivé à l'hôtel" },
  { id: 'badge', label: 'Badge et kit remis' },
  { id: 'tablette', label: 'Tablette remise', valeur: true },
  { id: 'present', label: "Présent aujourd'hui", parJour: true },
]
const TZ = 'Africa/Casablanca'
const jourAujourdhui = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const heureCourte = iso => iso ? new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : ''
// Cle localStorage partagee avec Terrain.jsx (memes deux fichiers doivent
// utiliser exactement la meme chaine) : identifie l'equipier au comptoir
// (chemin admin uniquement), transmis a badge_checkin comme fait_par.
const CLE_EQUIPIER = 'copaf_terrain_equipier'

function extractToken(decodedText) {
  const brut = decodedText.trim()
  try {
    const url = new URL(brut)
    if (!DOMAINES_AUTORISES.includes(url.hostname)) return null // QR d'un autre site : ignore
    const parts = url.pathname.split('/').filter(Boolean)
    const idx = parts.indexOf('badge')
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
    return null
  } catch {
    // pas une URL — token brut colle/scanne autrement (UUID attendu)
    return /^[0-9a-f-]{20,40}$/i.test(brut) ? brut : null
  }
}

function bipEtVibre(ok) {
  try {
    if (navigator.vibrate) navigator.vibrate(ok ? 80 : [60, 60, 60])
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = ok ? 880 : 300
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(); osc.stop(ctx.currentTime + 0.2)
    setTimeout(() => ctx.close().catch(() => {}), 300)
  } catch { /* audio indisponible (permissions, navigateur) — tant pis, la vibration/bannière suffisent */ }
}

export default function StaffScan() {
  const { niveau, identite, acces, connecter } = useNiveauTerrain()
  const authorized = niveau === 'admin' || niveau === 'limite'
  const auteurAffiche = niveau === 'limite' ? (identite?.prenom || '') : (localStorage.getItem(CLE_EQUIPIER) || null)

  const scannerRef = useRef(null)
  const enPauseRef = useRef(false)

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])
  const [searchError, setSearchError] = useState('')
  const [banniere, setBanniere] = useState(null) // { ok, nom, organisation, photo_url, deja, heure } | { erreur }
  const [cameraErreur, setCameraErreur] = useState('')

  const [modeAuto, setModeAuto] = useState(false) // true : emargement direct au scan (jours de conference)
  const modeAutoRef = useRef(false)
  const [fiche, setFiche] = useState(null)
  const [ficheMsg, setFicheMsg] = useState('')
  const [modalTablette, setModalTablette] = useState(false)

  const emarger = useCallback(async token => {
    if (enPauseRef.current) return
    enPauseRef.current = true
    try {
      const { data: rows, error } = await supabase.rpc('badge_checkin', { p_token: token, p_fait_par: auteurAffiche, ...acces })
      const r = Array.isArray(rows) ? rows[0] : rows
      if (error || !r) {
        bipEtVibre(false)
        setBanniere({ erreur: true, message: 'Badge introuvable.' })
      } else {
        bipEtVibre(true)
        setBanniere({
          ok: true, nom: `${r.prenom || ''} ${r.nom || ''}`.trim(), organisation: r.organisation, poste: r.poste,
          photo_url: r.photo_url, deja: r.deja_arrive,
          heure: r.arrived_at ? new Date(r.arrived_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        })
      }
    } catch {
      bipEtVibre(false)
      setBanniere({ erreur: true, message: 'Erreur réseau, réessayez.' })
    }
    setTimeout(() => { setBanniere(null); enPauseRef.current = false }, PAUSE_APRES_SCAN_MS)
  }, [auteurAffiche, acces])

  const chargerFiche = useCallback(async token => {
    const { data, error } = await supabase.rpc('staff_fiche', { p_token: token, ...acces })
    if (error || !data) return false
    setFiche({ ...data, token })
    return true
  }, [acces])

  const ouvrirFiche = useCallback(async token => {
    if (enPauseRef.current) return
    enPauseRef.current = true // pas de nouveau scan tant que la fiche est ouverte
    setFicheMsg('')
    if (await chargerFiche(token)) { bipEtVibre(true); return }
    bipEtVibre(false)
    setBanniere({ erreur: true, message: 'Badge introuvable.' })
    setTimeout(() => { setBanniere(null); enPauseRef.current = false }, PAUSE_APRES_SCAN_MS)
  }, [chargerFiche])

  const fermerFiche = () => { setFiche(null); setFicheMsg(''); setModalTablette(false); enPauseRef.current = false }

  const marquerEtape = async (etape, valeur) => {
    const def = ETAPES_FICHE.find(e => e.id === etape)
    setFicheMsg('')
    const { error } = await supabase.rpc('terrain_marquer', {
      p_personne_type: fiche.personne_type, p_personne_id: fiche.personne_id, p_etape: etape,
      p_jour: def?.parJour ? jourAujourdhui() : null, p_valeur: valeur || null, p_mode: 'manuel', p_fait_par: auteurAffiche, ...acces,
    })
    if (error) {
      const dejaPris = error.message?.match(/deja attribue \((.+?)\)/)
      setFicheMsg(dejaPris ? `Ce numéro de tablette est déjà attribué (${dejaPris[1]}).` : error.message?.includes('invalide') ? 'Numéro de tablette invalide : T01 à T35.' : "Échec de l'enregistrement.")
      return
    }
    await chargerFiche(fiche.token)
  }

  const demarrerEtape = etape => {
    const bloc = PREREQUIS[etape]
    const libelle = id => ETAPES_FICHE.find(e => e.id === id)?.label || id
    if (bloc && !fiche.etapes?.[bloc.avant]) {
      if (!bloc.souple) { setFicheMsg(`« ${libelle(bloc.avant)} » doit être fait avant « ${libelle(etape)} ».`); return }
      if (!window.confirm(`« ${libelle(bloc.avant)} » n'est pas marqué. Marquer « ${libelle(etape)} » quand même ?`)) return
    }
    if (etape === 'tablette') { setModalTablette(true); return }
    marquerEtape(etape, null)
  }

  const annulerEtape = async etape => {
    const info = fiche.etapes?.[etape]
    if (!info) return
    if (!window.confirm('Annuler cette étape ?')) return
    const { error } = await supabase.rpc('terrain_annuler', { p_suivi_id: info.id, p_motif: 'Annulé depuis le scan', p_par: auteurAffiche, ...acces })
    if (error) { setFicheMsg("Échec de l'annulation."); return }
    await chargerFiche(fiche.token)
  }

  const surScan = useCallback(token => { if (modeAutoRef.current) emarger(token); else ouvrirFiche(token) }, [emarger, ouvrirFiche])

  useEffect(() => {
    if (!authorized) return
    const scanner = new Html5Qrcode('staff-scan-reader')
    scannerRef.current = scanner
    let arrete = false

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      decodedText => {
        if (enPauseRef.current) return
        const token = extractToken(decodedText)
        if (token) surScan(token)
      },
      () => { /* echec de decodage sur une frame — normal en continu, on ignore */ }
    ).catch(() => { if (!arrete) setCameraErreur("Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.") })

    return () => {
      arrete = true
      scannerRef.current?.stop().then(() => scannerRef.current?.clear()).catch(() => {})
    }
  }, [authorized, surScan])

  const handleSearch = async e => {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) { setSearchError('Au moins 2 caractères.'); return }
    setSearching(true); setSearchError(''); setResults([])
    // staff_search() couvre inscriptions, membres de groupe (delegations) et
    // intervenants/equipe — chercher uniquement dans inscriptions manquait
    // ces deux categories, invisibles depuis /admin mais de vraies personnes.
    const { data, error } = await supabase.rpc('staff_search', { p_query: q, ...acces })
    setSearching(false)
    if (error) { setSearchError('Erreur de recherche.'); return }
    setResults(data || [])
  }

  const choisirResultat = r => {
    setResults([]); setQuery('')
    ouvrirFiche(r.badge_token)
  }

  if (niveau === null) {
    return <div style={wrapStyle}><p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p></div>
  }

  if (niveau === 'anonyme') {
    return <ConnexionPinAccueil onConnecte={connecter} />
  }

  return (
    <div style={wrapStyle}>
      <div style={{ ...cardStyle, maxWidth: 480, textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            COPAF 2026 · Accueil {niveau === 'limite' && `· ${identite?.prenom || ''}`}
          </div>
          <Link to="/terrain" style={{ fontSize: 11.5, color: NAVY, fontWeight: 700, textDecoration: 'none' }}>Tableau terrain →</Link>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>Scanner un badge</div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 12 }}>
          <input type="checkbox" checked={modeAuto} onChange={e => { setModeAuto(e.target.checked); modeAutoRef.current = e.target.checked }} />
          Émarger directement au scan (jours de conférence)
        </label>

        {fiche && (
          <div style={{ border: '1.5px solid #c7d2fe', borderRadius: 14, padding: 14, marginBottom: 14, background: '#f8faff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {fiche.photo_url ? (
                <img src={fiche.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                  {(fiche.prenom?.[0] || '') + (fiche.nom?.[0] || '')}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>{fiche.prenom} {fiche.nom}</div>
                {fiche.poste && <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{fiche.poste}</div>}
                <div style={{ fontSize: 11.5, color: '#64748b' }}>{fiche.organisation} · {fiche.dossier}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {ETAPES_FICHE.map(e => {
                const fait = fiche.etapes?.[e.id]
                const bloc = PREREQUIS[e.id]
                const bloque = !fait && bloc && !bloc.souple && !fiche.etapes?.[bloc.avant]
                return fait ? (
                  <button key={e.id} type="button" onClick={() => annulerEtape(e.id)} title="Toucher pour annuler" style={{ ...boutonFiche, background: '#16a34a', color: '#fff', flexWrap: 'wrap' }}>
                    <Ico name="check" size={13} color="#fff" /> {e.label}
                    <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 600, opacity: 0.95 }}>{heureCourte(fait.fait_le)} · {fait.fait_par}{e.valeur && fait.valeur ? ` · N° ${fait.valeur}` : ''}</span>
                  </button>
                ) : (
                  <button key={e.id} type="button" onClick={() => demarrerEtape(e.id)} style={{ ...boutonFiche, background: '#eef2f7', color: '#334155', opacity: bloque ? 0.45 : 1 }}>
                    {e.label}
                  </button>
                )
              })}
            </div>
            {ficheMsg && <p style={{ fontSize: 12.5, color: '#b45309', fontWeight: 700, margin: '10px 0 0' }}>{ficheMsg}</p>}
            <button type="button" onClick={fermerFiche} style={{ ...boutonFiche, marginTop: 12, background: NAVY, color: '#fff', justifyContent: 'center' }}>Terminé — scanner le suivant</button>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <div id="staff-scan-reader" style={{ borderRadius: 14, overflow: 'hidden' }} />
          {banniere && (
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 14, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, textAlign: 'center',
              background: banniere.erreur ? '#dc2626' : banniere.deja ? '#d97706' : '#16a34a', color: '#fff',
            }}>
              {banniere.erreur ? (
                <>
                  <Ico name="alert" size={30} color="#fff" />
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{banniere.message}</div>
                </>
              ) : (
                <>
                  {banniere.photo_url ? (
                    <img src={banniere.photo_url} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.6)' }} />
                  ) : (
                    <Ico name={banniere.deja ? 'alert' : 'check'} size={30} color="#fff" />
                  )}
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{banniere.nom || 'Badge reconnu'}</div>
                  {banniere.poste && <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.95 }}>{banniere.poste}</div>}
                  {banniere.organisation && <div style={{ fontSize: 12, opacity: 0.9 }}>{banniere.organisation}</div>}
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                    {banniere.deja ? `Déjà émargé${banniere.heure ? ` à ${banniere.heure}` : ''}` : 'Émargé ✓'}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {cameraErreur && <p style={{ fontSize: 12.5, color: '#dc2626', marginTop: 10 }}>{cameraErreur}</p>}

        <div style={{ margin: '24px 0 16px', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>QR illisible ? Recherche manuelle</div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Nom, prénom ou numéro de dossier..."
              style={{ flex: 1, padding: '11px 14px', fontSize: 13.5, border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={searching} style={{
              padding: '11px 16px', background: NAVY, color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            }}>
              {searching ? '...' : 'Chercher'}
            </button>
          </form>
          {searchError && <p style={{ fontSize: 12.5, color: '#dc2626', marginTop: 8 }}>{searchError}</p>}
          {results.map(r => (
            <button key={r.dossier} type="button" onClick={() => choisirResultat(r)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
              padding: '10px 12px', marginTop: 8, background: '#f8fafc', border: '1.5px solid #e2e8f0',
              borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {r.prenom} {r.nom}
                {r.poste && <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#334155' }}>{r.poste}</span>}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{r.organisation} · {r.dossier}</span>
              </span>
              <span style={{ color: '#94a3b8', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
      {modalTablette && fiche && (
        <ModalTablette
          titre={`Tablette remise — ${fiche.prenom} ${fiche.nom}`}
          pris={fiche.tablettes_prises || {}}
          onValider={v => { setModalTablette(false); marquerEtape('tablette', normaliserNumeroTablette(v)) }}
          onFermer={() => setModalTablette(false)}
        />
      )}
    </div>
  )
}

const boutonFiche = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 14px', border: 'none', borderRadius: 10,
  fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
}

const wrapStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20, background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif",
}

const cardStyle = {
  width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, padding: 28,
  boxShadow: '0 12px 32px rgba(15,23,42,.12)', textAlign: 'center',
}

const champLogin = {
  padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13.5,
  fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
}

// Ecran de connexion pour le personnel sans compte Supabase Auth (memes
// dossier+PIN que Terrain.jsx, voir terrain_login).
function ConnexionPinAccueil({ onConnecte }) {
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
    <div style={wrapStyle}>
      <div style={{ ...cardStyle, textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' }}>COPAF 2026 · Accueil</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginTop: 10, textAlign: 'center' }}>Connexion</div>
        <form onSubmit={connexion} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={dossier} onChange={e => { setErreur(''); setDossier(e.target.value) }} placeholder="INT2026-XXX" autoCapitalize="characters" autoComplete="username" style={champLogin} />
          <input value={pin} onChange={e => { setErreur(''); setPin(e.target.value) }} placeholder="Code PIN" type="password" inputMode="numeric" autoComplete="current-password" style={champLogin} />
          {erreur && <p style={{ fontSize: 12, color: '#dc2626', margin: 0, textAlign: 'center' }}>{erreur}</p>}
          <button type="submit" disabled={enCours || !dossier.trim() || !pin.trim()} style={{
            padding: '13px', border: 'none', borderRadius: 12, background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`,
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: enCours ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: enCours ? 0.7 : 1,
          }}>
            {enCours ? '…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
