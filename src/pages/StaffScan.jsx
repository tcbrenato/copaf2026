// src/pages/StaffScan.jsx
//
// Page reservee au personnel d'accueil (compte admin scope 'checkin' ou
// 'all', connexion deja geree par AuthGate qui enveloppe cette page dans
// App.jsx). Scan camera du QR de badge -> redirection vers /badge/{token}
// qui affichera alors la vue staff complete (session deja active). Une
// recherche manuelle par nom sert de secours si le QR est illisible ou le
// badge abime.
//
// Non couvert dans cette premiere version : mode hors-ligne avec file
// d'attente locale synchronisee au retour reseau (mentionne dans le
// cahier des charges) — a construire separement si besoin reel confirme
// le jour J.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../supabase'
import { useAdminAuth } from '../adminAuth'
import { Ico } from '../utils/dossierUi'

const NAVY = '#000E91'
const BLUE = '#0073F4'

function extractToken(decodedText) {
  try {
    const url = new URL(decodedText)
    const parts = url.pathname.split('/').filter(Boolean)
    const idx = parts.indexOf('badge')
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
  } catch {
    // pas une URL — peut-etre deja un token brut colle/scanne autrement
  }
  return decodedText.trim()
}

export default function StaffScan() {
  const { scope } = useAdminAuth()
  const navigate = useNavigate()
  const authorized = scope === 'checkin' || scope === 'all'

  const scannerRef = useRef(null)

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (!authorized) return
    const scanner = new Html5QrcodeScanner('staff-scan-reader', {
      fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true,
    }, false)
    scannerRef.current = scanner

    scanner.render(
      decodedText => {
        const token = extractToken(decodedText)
        scanner.clear().catch(() => {})
        navigate(`/badge/${token}`)
      },
      () => { /* echec de decodage sur une frame — normal en continu, on ignore */ }
    )

    return () => { scannerRef.current?.clear().catch(() => {}) }
  }, [authorized, navigate])

  const handleSearch = async e => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true); setSearchError(''); setResults([])
    // staff_search() couvre a la fois les inscriptions principales et les
    // membres de groupe (inscription_participants, ex. delegations) —
    // chercher uniquement dans inscriptions manquait les BIO/KAMARA de ce
    // monde, invisibles depuis /admin mais bien de vrais participants.
    const { data, error } = await supabase.rpc('staff_search', { p_query: query.trim() })
    setSearching(false)
    if (error) { setSearchError('Erreur de recherche.'); return }
    setResults(data || [])
  }

  if (!authorized) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <Ico name="alert" size={28} color="#dc2626" />
          <p style={{ fontSize: 14, color: '#991b1b', fontWeight: 600, marginTop: 12 }}>
            Ce compte n'a pas accès au scan d'accueil.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={{ ...cardStyle, maxWidth: 480, textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>COPAF 2026 · Accueil</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>Scanner un badge</div>

        <div id="staff-scan-reader" style={{ borderRadius: 14, overflow: 'hidden' }} />

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
            <button key={r.dossier} type="button" onClick={() => navigate(`/badge/${r.badge_token}`)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
              padding: '10px 12px', marginTop: 8, background: '#f8fafc', border: '1.5px solid #e2e8f0',
              borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {r.prenom} {r.nom}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{r.organisation} · {r.dossier}</span>
              </span>
              <span style={{ color: '#94a3b8', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const wrapStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20, background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif",
}

const cardStyle = {
  width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, padding: 28,
  boxShadow: '0 12px 32px rgba(15,23,42,.12)', textAlign: 'center',
}
