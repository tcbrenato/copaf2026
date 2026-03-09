import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../supabase'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const groupByWeek = (rows) => {
  const map = {}
  rows.forEach(r => {
    const d = new Date(r.created_at)
    const week = `${d.getDate().toString().padStart(2,'0')} ${d.toLocaleString('fr-FR',{month:'short'})}`
    if (!map[week]) map[week] = { jour: week, visites: 0, uniques: new Set() }
    map[week].visites++
    map[week].uniques.add(r.ip || r.id)
  })
  return Object.values(map).map(w => ({ jour: w.jour, visites: w.visites, uniques: w.uniques.size })).slice(-10)
}

const groupByField = (rows, field) => {
  const map = {}
  rows.forEach(r => {
    const key = r[field] || 'Inconnu'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).sort((a,b) => b[1]-a[1]).map(([k,v]) => ({ name: k, value: v }))
}

const COLORS = ['#0073f4','#000e91','#4da6ff','#99ccff','#cce5ff','#0055bb','#0044aa','#003399']
const FLAGS = { 'Bénin':'🇧🇯','Côte d\'Ivoire':'🇨🇮','Sénégal':'🇸🇳','Maroc':'🇲🇦','Nigeria':'🇳🇬','Ghana':'🇬🇭','France':'🇫🇷','Cameroun':'🇨🇲','Togo':'🇹🇬','USA':'🇺🇸','Guinée':'🇬🇳','Mali':'🇲🇱','Burkina Faso':'🇧🇫' }

// ─── COMPOSANTS UTILITAIRES ───────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, color = '#0073f4' }) => (
  <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: -20, right: -10, fontSize: 80, opacity: 0.04, lineHeight: 1, userSelect: 'none' }}>{icon}</div>
    <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1, fontFamily: 'monospace' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{sub}</div>}
  </div>
)

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    {children}
  </div>
)

const exportCSV = (data) => {
  const headers = ['ID','Nom','Prénom','Email','Téléphone','Organisation','Poste','Pays','Nb Participants','Montant ($)','Date Inscription','Message']
  const rows = data.map(r => [
    r.id, r.nom, r.prenom, r.email, r.telephone,
    r.organisation, r.poste, r.pays, r.participants,
    r.montant, new Date(r.created_at).toLocaleDateString('fr-FR'), r.message
  ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `COPAF2026_inscriptions_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

const Login = ({ onLogin }) => {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = () => {
    if (pw === 'AdminCOPAF2026') { onLogin() }
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 500) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 20 }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ width: '100%', maxWidth: 420, animation: shake ? 'shake 0.4s ease' : 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 32, fontWeight: 700, letterSpacing: 5, color: '#FFFFFF', marginBottom: 4 }}>
            COPAF <span style={{ color: '#0073f4' }}>2026</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, textTransform: 'uppercase' }}>Administration</div>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 8, textAlign: 'center' }}>Accès Sécurisé</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 32, textAlign: 'center' }}>Entrez votre mot de passe administrateur</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Mot de passe</div>
            <input type="password" value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••••••••"
              style={{ width: '100%', padding: '14px 16px', background: error ? 'rgba(255,60,60,0.08)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${error ? 'rgba(255,60,60,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: '#FFFFFF', fontFamily: 'monospace', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
            />
            {error && <div style={{ fontSize: 12, color: '#ff4444', marginTop: 8 }}>❌ Mot de passe incorrect</div>}
          </div>
          <button onClick={handleSubmit} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#0073f4,#000e91)', color: '#FFFFFF', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,115,244,0.3)' }}>
            🔐 Connexion
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const Dashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('analytics')
  const [inscriptions, setInscriptions] = useState([])
  const [visites, setVisites] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [exported, setExported] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: ins }, { data: vis }] = await Promise.all([
        supabase.from('inscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('visites').select('*').order('created_at', { ascending: true }),
      ])
      setInscriptions(ins || [])
      setVisites(vis || [])
      setLoading(false)
    }
    load()

    // Realtime inscriptions
    const channel = supabase
      .channel('inscriptions-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inscriptions' }, payload => {
        setInscriptions(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const totalParticipants = inscriptions.reduce((s, r) => s + (r.participants || 0), 0)
  const totalRevenu = inscriptions.reduce((s, r) => s + (r.montant || 0), 0)
  const paysUniques = new Set(inscriptions.map(r => r.pays)).size
  const visitesParSemaine = useMemo(() => groupByWeek(visites), [visites])
  const visitesParPays = useMemo(() => groupByField(visites, 'pays').slice(0,10), [visites])
  const visitesParDevice = useMemo(() => groupByField(visites, 'device'), [visites])
  const visitesParSource = useMemo(() => groupByField(visites, 'source'), [visites])
  const visitesParPage = useMemo(() => groupByField(visites, 'page').slice(0,5), [visites])
  const tauxConversion = visites.length > 0 ? ((inscriptions.length / visites.length) * 100).toFixed(1) : '0.0'

  const filtered = useMemo(() =>
    inscriptions.filter(r =>
      [r.nom, r.prenom, r.email, r.organisation, r.pays].some(v =>
        (v||'').toLowerCase().includes(search.toLowerCase())
      )
    ), [inscriptions, search])

  const handleExport = () => { exportCSV(filtered); setExported(true); setTimeout(() => setExported(false), 2000) }

  const tabs = [
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'inscriptions', label: '📋 Inscriptions' },
    { id: 'ga4', label: '🔗 Google Analytics' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060a14', fontFamily: "'DM Sans','Segoe UI',sans-serif", color: '#FFFFFF' }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#0d1117}
        ::-webkit-scrollbar-thumb{background:rgba(0,115,244,0.4);border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fadeUp{animation:fadeUp 0.35s ease forwards}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(12px,2vw,16px) clamp(16px,4vw,40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 700, letterSpacing: 3 }}>
            COPAF <span style={{ color: '#0073f4' }}>2026</span>
          </div>
          <div style={{ background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 20, padding: '3px 12px', fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Admin</div>
          {loading && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', animation: 'pulse 1.5s infinite' }}>● Chargement...</div>}
          {!loading && <div style={{ fontSize: 11, color: '#00cc88' }}>● Données en direct</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>🕐 {new Date().toLocaleDateString('fr-FR')}</div>
          <button onClick={onLogout} style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.25)', color: '#ff6b6b', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>Déconnexion</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 clamp(16px,4vw,40px)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', color: tab === t.id ? '#0073f4' : 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: 13, padding: '16px 20px', cursor: 'pointer', borderBottom: tab === t.id ? '2px solid #0073f4' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 'clamp(20px,4vw,40px)' }}>

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="fadeUp">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon="👁️" label="Total Visites" value={visites.length.toLocaleString()} sub="Enregistrées" color="#0073f4" />
              <StatCard icon="👤" label="Inscrits" value={inscriptions.length} sub={`${totalParticipants} participants`} color="#00cc88" />
              <StatCard icon="🌍" label="Pays" value={paysUniques} sub="Représentés" color="#4da6ff" />
              <StatCard icon="💰" label="Revenus" value={`$${(totalRevenu/1000).toFixed(0)}k`} sub="Prévisionnels" color="#ffaa00" />
              <StatCard icon="📈" label="Conversion" value={`${tauxConversion}%`} sub="Visites → Inscrits" color="#ff6b9d" />
            </div>

            {visites.length === 0 ? (
              <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 48, textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                  Aucune visite enregistrée.<br />
                  <span style={{ fontSize: 12, marginTop: 8, display: 'block' }}>Connectez le tracking pour voir les données ici.</span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 'clamp(20px,3vw,28px)', marginBottom: 24 }}>
                  <SectionTitle>Évolution des Visites</SectionTitle>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={visitesParSemaine}>
                      <XAxis dataKey="jour" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 8, color: '#fff' }} />
                      <Line type="monotone" dataKey="visites" stroke="#0073f4" strokeWidth={2.5} dot={{ fill: '#0073f4', r: 4 }} name="Visites" />
                      <Line type="monotone" dataKey="uniques" stroke="#4da6ff" strokeWidth={2} strokeDasharray="4 2" dot={false} name="Uniques" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 20, marginBottom: 24 }}>
                  {/* Pays */}
                  <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 'clamp(16px,3vw,24px)' }}>
                    <SectionTitle>Top Pays</SectionTitle>
                    {visitesParPays.map((p, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{FLAGS[p.name] || '🌐'} {p.name}</span>
                          <span style={{ fontSize: 12, color: '#0073f4', fontWeight: 700, fontFamily: 'monospace' }}>{p.value}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
                          <div style={{ height: 4, borderRadius: 4, background: 'linear-gradient(90deg,#0073f4,#000e91)', width: `${(p.value / visitesParPays[0]?.value) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Devices */}
                  <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 'clamp(16px,3vw,24px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <SectionTitle>Appareils</SectionTitle>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={visitesParDevice} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                          {visitesParDevice.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 8, color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {visitesParDevice.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{d.name}</span>
                          <span style={{ color: '#0073f4', fontWeight: 700 }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sources */}
                  <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 'clamp(16px,3vw,24px)' }}>
                    <SectionTitle>Sources de Trafic</SectionTitle>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={visitesParSource} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} width={70} />
                        <Tooltip contentStyle={{ background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 8, color: '#fff' }} />
                        <Bar dataKey="value" radius={[0,6,6,0]}>
                          {visitesParSource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pages */}
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 'clamp(16px,3vw,24px)' }}>
                  <SectionTitle>Pages les Plus Visitées</SectionTitle>
                  {visitesParPage.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: i < visitesParPage.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,115,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#0073f4', flexShrink: 0 }}>{i+1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4, fontFamily: 'monospace' }}>{p.name}</div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
                          <div style={{ height: 4, borderRadius: 4, background: 'linear-gradient(90deg,#0073f4,#000e91)', width: `${(p.value / visitesParPage[0]?.value) * 100}%` }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0073f4', fontFamily: 'monospace', flexShrink: 0 }}>{p.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── INSCRIPTIONS ── */}
        {tab === 'inscriptions' && (
          <div className="fadeUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { label: 'Dossiers', value: inscriptions.length, color: '#0073f4' },
                  { label: 'Participants', value: totalParticipants, color: '#00cc88' },
                  { label: 'Revenus', value: `$${totalRevenu.toLocaleString()}`, color: '#ffaa00' },
                  { label: 'Pays', value: paysUniques, color: '#ff6b9d' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={handleExport} style={{ background: exported ? 'rgba(0,204,136,0.15)' : 'linear-gradient(135deg,#0073f4,#000e91)', border: exported ? '1px solid rgba(0,204,136,0.4)' : 'none', color: exported ? '#00cc88' : '#FFFFFF', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 13, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.3s' }}>
                {exported ? '✅ Exporté !' : '⬇️ Exporter CSV'}
              </button>
            </div>

            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Rechercher par nom, email, organisation, pays..."
              style={{ width: '100%', padding: '13px 18px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#FFFFFF', fontSize: 13, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
            />

            {inscriptions.length === 0 ? (
              <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Aucune inscription pour l'instant.</div>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,115,244,0.08)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {['#','Nom & Prénom','Organisation','Pays','Email','Tél','Part.','Montant','Date'].map((h, i) => (
                          <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.015)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,115,244,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                        >
                          <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 11 }}>{i+1}</td>
                          <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{r.prenom} {r.nom}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{r.poste}</div>
                          </td>
                          <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.65)', maxWidth: 200 }}>{r.organisation}</td>
                          <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                            <span style={{ background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#4da6ff' }}>{r.pays}</span>
                          </td>
                          <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: 12 }}>{r.email}</td>
                          <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontSize: 12 }}>{r.telephone}</td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                            <span style={{ background: 'rgba(0,204,136,0.1)', border: '1px solid rgba(0,204,136,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#00cc88', fontWeight: 700 }}>{r.participants}</span>
                          </td>
                          <td style={{ padding: '13px 16px', fontWeight: 700, color: '#ffaa00', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>${(r.montant||0).toLocaleString()}</td>
                          <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>
                            {new Date(r.created_at).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>
                  {filtered.length} résultat{filtered.length>1?'s':''} · {filtered.reduce((s,r)=>s+(r.participants||0),0)} participants · ${filtered.reduce((s,r)=>s+(r.montant||0),0).toLocaleString()} total
                </div>
              </>
            )}
          </div>
        )}

        {/* ── GOOGLE ANALYTICS ── */}
        {tab === 'ga4' && (
          <div className="fadeUp">
            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 'clamp(24px,4vw,40px)', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 12 }}>Intégrer Google Analytics 4</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 32 }}>
                Ajoutez votre ID de mesure GA4 dans votre projet React.
              </p>
              <div style={{ textAlign: 'left' }}>
                {[
                  { step: '1', label: 'Installer react-ga4', color: '#0073f4', code: 'npm install react-ga4' },
                  { step: '2', label: 'Initialiser dans App.jsx', color: '#0073f4', code: `import ReactGA from 'react-ga4'\n\nuseEffect(() => {\n  ReactGA.initialize('G-XXXXXXXXXX')\n  ReactGA.send('pageview')\n}, [])` },
                  { step: '3', label: 'Tracker le formulaire', color: '#0073f4', code: `ReactGA.event({\n  category: 'Inscription',\n  action: 'form_submit',\n  label: form.pays,\n  value: parseInt(form.participants)\n})` },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,115,244,0.06)', border: '1px solid rgba(0,115,244,0.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Étape {item.step} — {item.label}</div>
                    <code style={{ display: 'block', background: '#060a14', borderRadius: 8, padding: '12px 16px', fontSize: 12, color: '#4da6ff', fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}>{item.code}</code>
                  </div>
                ))}
                <div style={{ background: 'rgba(0,204,136,0.06)', border: '1px solid rgba(0,204,136,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 11, color: '#00cc88', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>✅ Résultat</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                    Connectez-vous sur <strong style={{ color: '#00cc88' }}>analytics.google.com</strong>, créez une propriété GA4, récupérez votre Measurement ID <code style={{ color: '#4da6ff' }}>G-XXXXXXXXXX</code> et les données apparaissent en temps réel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />
  return <Dashboard onLogout={() => setLoggedIn(false)} />
}

export default AdminDashboard