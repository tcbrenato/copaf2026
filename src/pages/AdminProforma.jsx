import { useState } from 'react'
import { supabase } from '../supabase'
import { generateProformaPDF } from '../utils/generateProformaPDF'

const NAVY = '#000E91'
const MAROON = '#96182A'

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    file:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    alert:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  }
  return icons[name] || null
}

export default function AdminProforma() {
  const [dossierInput, setDossierInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null) // { dossier, nom, prenom, organisation, poste, pays, email, telephone, participants, montant }
  const [generating, setGenerating] = useState(false)

  const handleSearch = async e => {
    e.preventDefault()
    if (!dossierInput.trim()) return
    setLoading(true); setError(''); setData(null)

    const { data: rows, error: err } = await supabase
      .from('inscriptions')
      .select('dossier, participants, montant, contacts(nom, prenom, organisation, poste, pays, email, telephone)')
      .eq('dossier', dossierInput.trim())
      .limit(1)

    if (err) { setError('Erreur : ' + err.message); setLoading(false); return }
    if (!rows || rows.length === 0) { setError('Aucun dossier trouvé avec cette référence.'); setLoading(false); return }

    const row = rows[0]
    setData({
      dossier: row.dossier,
      participants: row.participants,
      montant: row.montant,
      nom: row.contacts?.nom || '',
      prenom: row.contacts?.prenom || '',
      organisation: row.contacts?.organisation || '',
      poste: row.contacts?.poste || '',
      pays: row.contacts?.pays || '',
      email: row.contacts?.email || '',
      telephone: row.contacts?.telephone || '',
    })
    setLoading(false)
  }

  const handleField = (field, value) => setData(d => ({ ...d, [field]: value }))

  const handleGenerate = () => {
    if (!data) return
    setGenerating(true)
    try {
      generateProformaPDF({
        form: {
          nom: data.nom,
          prenom: data.prenom,
          organisation: data.organisation,
          poste: data.poste,
          pays: data.pays,
          email: data.email,
        },
        dossier: data.dossier,
        nb: Number(data.participants) || 1,
        total: Number(data.montant) || 0,
      })
    } finally {
      setGenerating(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
    color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Générer une facture proforma</div>
        <div style={{ fontSize: 13.5, color: '#64748b' }}>Recherchez un dossier, vérifiez/complétez les informations, puis générez le PDF.</div>
      </div>

      {/* Recherche */}
      <form onSubmit={handleSearch} style={{
        background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20,
        marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', boxShadow: '0 4px 16px rgba(0,14,145,.05)',
      }}>
        <input
          value={dossierInput}
          onChange={e => setDossierInput(e.target.value)}
          placeholder="Numéro de dossier (ex: COPAF2026-30561)"
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <button type="submit" disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          background: NAVY, border: 'none', borderRadius: 10, color: '#fff',
          fontWeight: 700, fontSize: 13.5, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
        }}>
          <Ico name="search" size={15} color="#fff" />
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Ico name="alert" size={16} color="#dc2626" />
          <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Formulaire de verification/completion */}
      {data && (
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 18 }}>
            Dossier {data.dossier}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input style={inputStyle} value={data.prenom} onChange={e => handleField('prenom', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Nom</label>
              <input style={inputStyle} value={data.nom} onChange={e => handleField('nom', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Organisation</label>
            <input style={inputStyle} value={data.organisation} onChange={e => handleField('organisation', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Poste</label>
              <input style={inputStyle} value={data.poste} onChange={e => handleField('poste', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Pays</label>
              <input style={inputStyle} value={data.pays} onChange={e => handleField('pays', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={data.email} onChange={e => handleField('email', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Nombre de participants</label>
              <input type="number" min="1" style={inputStyle} value={data.participants} onChange={e => handleField('participants', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Montant total (EUR)</label>
              <input type="number" min="0" style={inputStyle} value={data.montant} onChange={e => handleField('montant', e.target.value)} />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} style={{
            width: '100%', padding: 14, background: MAROON, border: 'none', borderRadius: 12,
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: generating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: generating ? 0.7 : 1,
          }}>
            <Ico name="file" size={17} color="#fff" />
            {generating ? 'Génération...' : 'Générer la facture proforma (PDF)'}
          </button>
        </div>
      )}
    </div>
  )
}