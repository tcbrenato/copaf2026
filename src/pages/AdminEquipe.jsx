// src/pages/AdminEquipe.jsx
//
// Onglet admin « Équipe » : fiches des membres du comité d'organisation (tout le contenu de
// /espace-equipe), planning de chacun, documents communs et lien de l'espace. Aucun contenu en dur :
// tout est lu et écrit dans equipe_membres / equipe_planning / equipe_documents (écriture réservée à l'admin par RLS).

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import AdminEquipeMembre from '../components/equipe/AdminEquipeMembre'
import AdminEquipeDocuments from '../components/equipe/AdminEquipeDocuments'

const CARD = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(0,54,127,.05)' }
const BTN = { padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }

export default function AdminEquipe() {
  const [membres, setMembres] = useState(null)
  const [erreur, setErreur] = useState('')
  const [ouvert, setOuvert] = useState(null)
  const [copie, setCopie] = useState(false)

  const charger = useCallback(async () => {
    const { data, error } = await supabase.from('equipe_membres').select('*').order('ordre').order('nom')
    if (error) { setErreur(error.message); return }
    setMembres(data || [])
  }, [])

  useEffect(() => { charger() }, [charger])

  const lien = `${window.location.origin}/espace-equipe`
  const copier = async () => {
    try { await navigator.clipboard.writeText(lien); setCopie(true); setTimeout(() => setCopie(false), 2000) } catch { /* presse-papiers indisponible */ }
  }

  if (erreur) return <p style={{ color: '#dc2626', fontSize: 13 }}>{erreur}</p>
  if (membres === null) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Chargement…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={CARD}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Espace équipe</div>
        <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 12px', lineHeight: 1.5 }}>
          Chaque membre se connecte avec son numéro de dossier et son email. Le contenu est provisoire : tout ce qui est marqué [à confirmer] se modifie ici, sans toucher au code.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155', flexWrap: 'wrap' }}>
          <span>Lien de l'espace : <strong>{lien}</strong></span>
          <button type="button" onClick={copier} style={BTN}>{copie ? 'Copié !' : 'Copier le lien'}</button>
        </div>
      </div>

      <div style={CARD}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Documents de la mission (charte, programme, plan du site)</div>
        <AdminEquipeDocuments membres={membres} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {membres.map(m => (
          <div key={m.id} style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
            <button type="button" onClick={() => setOuvert(ouvert === m.id ? null : m.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              {m.photo_url ? (
                <img src={m.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#00367F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                  {String(m.nom || '').split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{m.nom}</div>
                <div style={{ fontSize: 12, color: '#64748b', overflowWrap: 'anywhere' }}>{m.role || '—'} · {m.dossier || 'sans dossier'}</div>
              </div>
              <span style={{ fontSize: 18, color: '#94a3b8' }}>{ouvert === m.id ? '▴' : '▾'}</span>
            </button>
            {ouvert === m.id && <AdminEquipeMembre membre={m} onSaved={charger} />}
          </div>
        ))}
      </div>
    </div>
  )
}
