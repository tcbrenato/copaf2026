import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const PAGE_SIZE = 50

const TABLE_LABELS = {
  inscriptions: 'Inscriptions',
  inscription_participants: 'Participants',
  sponsorships: 'Sponsoring / Partenariats',
  exposants: 'Exposants',
}

const ACTION_STYLES = {
  insert: { label: 'Création', bg: '#dcfce7', color: '#16a34a' },
  update: { label: 'Modification', bg: '#dbeafe', color: '#0073F4' },
  delete: { label: 'Suppression', bg: '#fee2e2', color: '#dc2626' },
}

// Resume lisible du contenu JSON de "details" : pour un update, une liste
// "champ : avant -> apres" ; pour un insert/delete, juste les champs non
// vides (evite d'afficher un pave JSON brut a l'ecran).
function DetailsSummary({ action, details }) {
  if (!details || typeof details !== 'object') return null
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== '')
  if (entries.length === 0) return <span style={{ color: '#94a3b8' }}>—</span>

  if (action === 'update') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map(([field, change]) => (
          <div key={field} style={{ fontSize: 12.5 }}>
            <span style={{ fontWeight: 700, color: '#334155' }}>{field}</span>
            {' : '}
            <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>{String(change?.avant ?? '—')}</span>
            {' → '}
            <span style={{ color: NAVY, fontWeight: 600 }}>{String(change?.apres ?? '—')}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ fontSize: 12.5, color: '#64748b' }}>
      {entries.slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' · ')}
      {entries.length > 4 ? '…' : ''}
    </div>
  )
}

export default function AdminActivityLog() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [filterEmail, setFilterEmail] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const emails = useMemo(() => [...new Set((rows || []).map((r) => r.email).filter(Boolean))].sort(), [rows])

  const load = async (pageIndex = 0) => {
    setError('')
    let query = supabase
      .from('activity_log')
      .select('id, created_at, email, role, action, target_table, details')
      .order('created_at', { ascending: false })
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1)

    if (filterEmail) query = query.eq('email', filterEmail)
    if (filterAction) query = query.eq('action', filterAction)
    if (filterFrom) query = query.gte('created_at', filterFrom)
    if (filterTo) query = query.lte('created_at', filterTo + 'T23:59:59')

    const { data, error: err } = await query
    if (err) { setError("Impossible de charger le journal d'activité."); return }
    setRows(pageIndex === 0 ? (data || []) : [...(rows || []), ...(data || [])])
    setHasMore((data || []).length === PAGE_SIZE)
    setPage(pageIndex)
  }

  useEffect(() => { load(0) }, [filterEmail, filterAction, filterFrom, filterTo]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectStyle = { padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', color: '#0f172a', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 9, outline: 'none' }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Journal d'activité</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Historique des créations, modifications et suppressions sur les inscriptions, participants, sponsoring et exposants.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <select value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} style={selectStyle}>
          <option value="">Tous les comptes</option>
          {emails.map((em) => <option key={em} value={em}>{em}</option>)}
        </select>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={selectStyle}>
          <option value="">Toutes les actions</option>
          <option value="insert">Créations</option>
          <option value="update">Modifications</option>
          <option value="delete">Suppressions</option>
        </select>
        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={selectStyle} />
        <span style={{ alignSelf: 'center', color: '#94a3b8', fontSize: 13 }}>à</span>
        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={selectStyle} />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16, color: '#dc2626', fontSize: 13.5 }}>{error}</div>
      )}

      {rows === null && !error && <p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p>}
      {rows !== null && rows.length === 0 && <p style={{ color: '#64748b', fontSize: 13.5 }}>Aucune activité enregistrée pour ces filtres.</p>}

      {rows !== null && rows.length > 0 && (
        <>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8faff', borderBottom: '1px solid rgba(0,14,145,0.08)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Compte</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Table</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Détail</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const st = ACTION_STYLES[r.action] || { label: r.action, bg: '#f1f5f9', color: '#64748b' }
                  return (
                    <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', verticalAlign: 'top' }}>
                      <td style={{ padding: '12px 18px', color: '#334155', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '12px 18px', color: '#0a1128', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.email || '—'}</td>
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '3px 10px', background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px 18px', color: '#334155', whiteSpace: 'nowrap' }}>{TABLE_LABELS[r.target_table] || r.target_table}</td>
                      <td style={{ padding: '12px 18px', maxWidth: 420 }}>
                        <DetailsSummary action={r.action} details={r.details} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => load(page + 1)}
              style={{ marginTop: 16, padding: '10px 22px', background: '#fff', border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Voir plus
            </button>
          )}
        </>
      )}
    </div>
  )
}
