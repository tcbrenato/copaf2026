import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { AdminAuthContext } from '../adminAuth'

// Remplace AdminGate : vraie authentification Supabase Auth (email + mot de
// passe), au lieu d'une simple comparaison de chaîne côté client qui ne
// protégeait pas les données (RLS Postgres derrière). Le scope du compte
// connecté (table "admins") est exposé aux enfants via AdminAuthContext.
export default function AuthGate({ children, requiredScope = null, title = 'COPAF 2026', subtitle = "Accès réservé à l'administration" }) {
  const [session, setSession] = useState(undefined) // undefined = chargement en cours
  const [scope,   setScope]   = useState(undefined)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === undefined) return
    if (!session) { setScope(null); return }
    setScope(undefined)
    supabase.from('admins').select('scope').eq('user_id', session.user.id).single()
      .then(({ data }) => setScope(data?.scope || null))
  }, [session])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError('Email ou mot de passe incorrect.')
  }

  const signOut = () => supabase.auth.signOut()

  // Chargement de la session ou du scope en cours
  if (session === undefined || scope === undefined) return null

  const authorized = session && scope && (scope === 'all' || !requiredScope || scope === requiredScope)

  if (!authorized) {
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
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>{subtitle}</div>

          {session && scope && !authorized && (
            <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 16, textAlign: 'left' }}>
              Ce compte n'a pas accès à cette section.{' '}
              <button type="button" onClick={signOut} style={{ background: 'none', border: 'none', color: '#0073F4', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
                Se déconnecter
              </button>
            </div>
          )}

          {!session && (
            <>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="Email"
                autoFocus
                autoComplete="username"
                style={{
                  width: '100%', padding: '13px 16px', fontSize: 15, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                  borderRadius: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 10,
                }}
              />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Mot de passe"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '13px 16px', fontSize: 15, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                  borderRadius: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 8,
                }}
              />
              {error && <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 12, textAlign: 'left' }}>{error}</div>}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', marginTop: 12,
                background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none', borderRadius: 12,
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </>
          )}
        </form>
      </div>
    )
  }

  return (
    <AdminAuthContext.Provider value={{ session, scope, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
