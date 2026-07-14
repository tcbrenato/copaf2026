import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = '2026COPAF'
const SESSION_KEY = 'copaf_admin_auth'

export default function AdminGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checked,        setChecked]       = useState(false)
  const [password,       setPassword]      = useState('')
  const [error,          setError]         = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved === 'true') setAuthenticated(true)
    setChecked(true)
  }, [])

  const handleSubmit = e => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthenticated(true)
      setError('')
    } else {
      setError('Mot de passe incorrect.')
    }
  }

  if (!checked) return null

  if (authenticated) return children

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(170deg, #020924 0%, #001156 50%, #020924 100%)',
      fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif", padding: 20,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');`}</style>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 380,
        boxShadow: '0 24px 60px rgba(0,0,0,.35)', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
          background: 'linear-gradient(135deg,#000E91,#0073F4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>COPAF 2026</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Accès réservé à l'administration</div>

        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          placeholder="Mot de passe"
          autoFocus
          style={{
            width: '100%', padding: '13px 16px', fontSize: 15, fontFamily: 'inherit',
            color: '#0f172a', background: '#f8fafc', border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
            borderRadius: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
        />
        {error && <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 12, textAlign: 'left' }}>{error}</div>}

        <button type="submit" style={{
          width: '100%', padding: '13px', marginTop: 12,
          background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none', borderRadius: 12,
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Accéder au dashboard
        </button>
      </form>
    </div>
  )
}
