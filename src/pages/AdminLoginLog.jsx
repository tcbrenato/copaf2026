import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const ROLE_LABELS = {
  admin: 'Admin',
  dg: 'DG',
  manager: 'Manager',
  secretariat: 'Secrétariat',
  sg: 'SG AGPAOC',
}

export default function AdminLoginLog() {
  const [rows, setRows] = useState(null)
  const [roleByEmail, setRoleByEmail] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('admin_login_log').select('email, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('admins').select('email, role'),
    ]).then(([logRes, adminsRes]) => {
      if (logRes.error) { setError("Impossible de charger le journal de connexions."); return }
      setRows(logRes.data || [])
      const map = {}
      ;(adminsRes.data || []).forEach((a) => { map[a.email] = a.role })
      setRoleByEmail(map)
    })
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Journal de connexions</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Historique des connexions au tableau de bord admin, par personne.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16, color: '#dc2626', fontSize: 13.5 }}>
          {error}
        </div>
      )}

      {rows === null && !error && <p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p>}

      {rows !== null && rows.length === 0 && (
        <p style={{ color: '#64748b', fontSize: 13.5 }}>Aucune connexion enregistrée pour le moment.</p>
      )}

      {rows !== null && rows.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1px solid rgba(0,14,145,0.08)' }}>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: '#64748b', fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Date & heure</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: '#64748b', fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Compte</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: '#64748b', fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '12px 20px', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '12px 20px', color: '#0a1128', fontWeight: 600 }}>{r.email}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
                      color: '#fff', background: NAVY, borderRadius: 100, padding: '3px 10px',
                    }}>
                      {ROLE_LABELS[roleByEmail[r.email]] || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 14 }}>
        Note : le Secrétaire Général de l'AGPAOC se connecte séparément via{' '}
        <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, color: BLUE }}>/suivi-inscriptions</code>
        {' '}(mot de passe dédié) — ces connexions n'apparaissent pas ici.
      </p>
    </div>
  )
}
