import { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const INSCRIPTIONS = [
  { id: 1, nom: 'Diallo', prenom: 'Mamadou', email: 'mdiallo@portabidjan.ci', telephone: '+225 07 88 11 22', organisation: 'Port Autonome d\'Abidjan', poste: 'Directeur Général', pays: 'Côte d\'Ivoire', participants: 2, message: '', date: '2026-01-15', montant: 10000 },
  { id: 2, nom: 'Nkosi', prenom: 'Thabo', email: 'tnkosi@transnet.co.za', telephone: '+27 83 555 0012', organisation: 'Transnet Port Terminals', poste: 'Head of Operations', pays: 'Afrique du Sud', participants: 3, message: 'Besoin de traduction anglaise', date: '2026-01-18', montant: 15000 },
  { id: 3, nom: 'Mensah', prenom: 'Akosua', email: 'amensah@tema.gov.gh', telephone: '+233 24 444 5566', organisation: 'Ghana Ports & Harbours Authority', poste: 'IT Director', pays: 'Ghana', participants: 1, message: '', date: '2026-01-22', montant: 5000 },
  { id: 4, nom: 'Traoré', prenom: 'Ibrahim', email: 'itraore@pab.bj', telephone: '+229 97 33 44 55', organisation: 'Port Autonome de Cotonou', poste: 'Chef de service', pays: 'Bénin', participants: 4, message: 'Groupe de 4 personnes', date: '2026-02-01', montant: 20000 },
  { id: 5, nom: 'Camara', prenom: 'Fatoumata', email: 'fcamara@opg.gn', telephone: '+224 62 111 222', organisation: 'Office des Ports de Guinée', poste: 'Responsable Logistique', pays: 'Guinée', participants: 1, message: '', date: '2026-02-05', montant: 5000 },
  { id: 6, nom: 'Okonkwo', prenom: 'Chidi', email: 'cokonkwo@nigerports.gov.ng', telephone: '+234 803 456 7890', organisation: 'Nigerian Ports Authority', poste: 'Deputy Director', pays: 'Nigeria', participants: 5, message: '', date: '2026-02-10', montant: 25000 },
  { id: 7, nom: 'Benzara', prenom: 'Karim', email: 'kbenzara@apmt.ma', telephone: '+212 661 334 455', organisation: 'APM Terminals Tanger Med', poste: 'Operations Manager', pays: 'Maroc', participants: 2, message: '', date: '2026-02-14', montant: 10000 },
  { id: 8, nom: 'Ndiaye', prenom: 'Aminata', email: 'andiaye@portdakar.sn', telephone: '+221 77 888 9900', organisation: 'Port Autonome de Dakar', poste: 'Directrice Informatique', pays: 'Sénégal', participants: 3, message: 'Intérêt pour atelier IA', date: '2026-02-20', montant: 15000 },
  { id: 9, nom: 'Koné', prenom: 'Seydou', email: 'skone@bpa.bj', telephone: '+229 95 22 33 11', organisation: 'Bénin Port Authority', poste: 'Consultant', pays: 'Bénin', participants: 1, message: '', date: '2026-03-02', montant: 5000 },
  { id: 10, nom: 'Asante', prenom: 'Kwame', email: 'kasante@meridian.gh', telephone: '+233 50 777 8888', organisation: 'Meridian Port Services', poste: 'CEO', pays: 'Ghana', participants: 2, message: '', date: '2026-03-05', montant: 10000 },
]

const VISITES_JOUR = [
  { jour: '01 Jan', visites: 42, uniques: 31 },
  { jour: '08 Jan', visites: 78, uniques: 61 },
  { jour: '15 Jan', visites: 134, uniques: 102 },
  { jour: '22 Jan', visites: 189, uniques: 145 },
  { jour: '29 Jan', visites: 156, uniques: 118 },
  { jour: '05 Fév', visites: 212, uniques: 167 },
  { jour: '12 Fév', visites: 278, uniques: 203 },
  { jour: '19 Fév', visites: 341, uniques: 258 },
  { jour: '26 Fév', visites: 298, uniques: 224 },
  { jour: '04 Mar', visites: 387, uniques: 296 },
]

const PAYS_VISITES = [
  { pays: 'Côte d\'Ivoire', visites: 312, flag: '🇨🇮' },
  { pays: 'Sénégal', visites: 278, flag: '🇸🇳' },
  { pays: 'Maroc', visites: 241, flag: '🇲🇦' },
  { pays: 'Nigeria', visites: 198, flag: '🇳🇬' },
  { pays: 'Bénin', visites: 187, flag: '🇧🇯' },
  { pays: 'Ghana', visites: 156, flag: '🇬🇭' },
  { pays: 'France', visites: 134, flag: '🇫🇷' },
  { pays: 'Cameroun', visites: 112, flag: '🇨🇲' },
  { pays: 'Togo', visites: 98, flag: '🇹🇬' },
  { pays: 'USA', visites: 87, flag: '🇺🇸' },
]

const PAGES_VUES = [
  { page: '/ (Accueil)', vues: 1842 },
  { page: '/inscription', vues: 934 },
  { page: '/programme', vues: 756 },
  { page: '/modules', vues: 612 },
  { page: '/about', vues: 489 },
]

const DEVICES = [
  { name: 'Mobile', value: 52, color: '#0073f4' },
  { name: 'Desktop', value: 38, color: '#000e91' },
  { name: 'Tablette', value: 10, color: '#4da6ff' },
]

const SOURCES = [
  { name: 'Direct', value: 38, color: '#000e91' },
  { name: 'Organique', value: 29, color: '#0073f4' },
  { name: 'Social', value: 21, color: '#4da6ff' },
  { name: 'Email', value: 12, color: '#99ccff' },
]

// ─── COMPOSANTS UTILITAIRES ───────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, color = '#0073f4' }) => (
  <div style={{
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '24px 28px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: -20, right: -10,
      fontSize: 80, opacity: 0.04, lineHeight: 1,
      userSelect: 'none',
    }}>{icon}</div>
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

// ─── EXPORT CSV ──────────────────────────────────────────────────────────────

const exportCSV = (data) => {
  const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Organisation', 'Poste', 'Pays', 'Nb Participants', 'Montant ($)', 'Date Inscription', 'Message']
  const rows = data.map(r => [
    r.id, r.nom, r.prenom, r.email, r.telephone,
    r.organisation, r.poste, r.pays, r.participants,
    r.montant, r.date, r.message
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
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
    if (pw === 'AdminCOPAF2026') {
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060a14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 20,
    }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)}
        }
        @keyframes fadeIn {
          from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 420,
        animation: 'fadeIn 0.5s ease',
        animation: shake ? 'shake 0.4s ease' : 'fadeIn 0.5s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: 32, fontWeight: 700, letterSpacing: 5, color: '#FFFFFF', marginBottom: 4
          }}>
            COPAF <span style={{ color: '#0073f4' }}>2026</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, textTransform: 'uppercase' }}>
            Administration
          </div>
        </div>

        <div style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 8, textAlign: 'center' }}>
            Accès Sécurisé
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 32, textAlign: 'center' }}>
            Entrez votre mot de passe administrateur
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Mot de passe
            </div>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••••••••"
              style={{
                width: '100%', padding: '14px 16px',
                background: error ? 'rgba(255,60,60,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${error ? 'rgba(255,60,60,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, color: '#FFFFFF',
                fontFamily: 'monospace', fontSize: 16,
                outline: 'none', boxSizing: 'border-box',
                transition: 'all 0.2s',
              }}
            />
            {error && (
              <div style={{ fontSize: 12, color: '#ff4444', marginTop: 8 }}>
                ❌ Mot de passe incorrect
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #0073f4, #000e91)',
              color: '#FFFFFF', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 14, letterSpacing: 2,
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,115,244,0.3)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🔐 Connexion
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────

const Dashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('analytics')
  const [search, setSearch] = useState('')
  const [exported, setExported] = useState(false)

  const totalVisites = VISITES_JOUR.reduce((s, v) => s + v.visites, 0)
  const totalUniques = VISITES_JOUR.reduce((s, v) => s + v.uniques, 0)
  const totalInscrits = INSCRIPTIONS.reduce((s, r) => s + r.participants, 0)
  const totalRevenu = INSCRIPTIONS.reduce((s, r) => s + r.montant, 0)
  const tauxConversion = ((INSCRIPTIONS.length / totalUniques) * 100).toFixed(1)

  const filtered = useMemo(() =>
    INSCRIPTIONS.filter(r =>
      [r.nom, r.prenom, r.email, r.organisation, r.pays].some(v =>
        v.toLowerCase().includes(search.toLowerCase())
      )
    ), [search])

  const handleExport = () => {
    exportCSV(filtered)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const tabs = [
    { id: 'analytics', label: '📊 Analytics', },
    { id: 'inscriptions', label: '📋 Inscriptions', },
    { id: 'ga4', label: '🔗 Google Analytics', },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060a14',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: '#FFFFFF',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: rgba(0,115,244,0.4); border-radius: 3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      {/* TOPBAR */}
      <div style={{
        background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(12px, 2vw, 16px) clamp(16px, 4vw, 40px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(16px, 3vw, 22px)',
            fontWeight: 700, letterSpacing: 3, color: '#FFFFFF'
          }}>
            COPAF <span style={{ color: '#0073f4' }}>2026</span>
          </div>
          <div style={{
            background: 'rgba(0,115,244,0.15)',
            border: '1px solid rgba(0,115,244,0.3)',
            borderRadius: 20, padding: '3px 12px',
            fontSize: 11, color: '#0073f4', fontWeight: 700,
            letterSpacing: 1, textTransform: 'uppercase'
          }}>
            Admin
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            🕐 Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid rgba(255,60,60,0.25)',
              color: '#ff6b6b', borderRadius: 8,
              padding: '7px 16px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: 1,
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{
        background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 clamp(16px, 4vw, 40px)',
        display: 'flex', gap: 4, flexWrap: 'wrap',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none',
            color: tab === t.id ? '#0073f4' : 'rgba(255,255,255,0.35)',
            fontWeight: 700, fontSize: 13,
            padding: '16px 20px', cursor: 'pointer',
            borderBottom: tab === t.id ? '2px solid #0073f4' : '2px solid transparent',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 'clamp(20px, 4vw, 40px)' }}>

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="fadeUp">

            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: 16, marginBottom: 32,
            }}>
              <StatCard icon="👁️" label="Total Visites" value={totalVisites.toLocaleString()} sub="Depuis le lancement" color="#0073f4" />
              <StatCard icon="👤" label="Visiteurs Uniques" value={totalUniques.toLocaleString()} sub="Sessions distinctes" color="#4da6ff" />
              <StatCard icon="✅" label="Inscrits" value={`${INSCRIPTIONS.length}`} sub={`${totalInscrits} participants`} color="#00cc88" />
              <StatCard icon="💰" label="Revenus" value={`$${(totalRevenu / 1000).toFixed(0)}k`} sub="Prévisionnels" color="#ffaa00" />
              <StatCard icon="📈" label="Conversion" value={`${tauxConversion}%`} sub="Visites → Inscriptions" color="#ff6b9d" />
            </div>

            {/* Graphe visites */}
            <div style={{
              background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 'clamp(20px, 3vw, 28px)',
              marginBottom: 24,
            }}>
              <SectionTitle>Évolution des Visites</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={VISITES_JOUR}>
                  <XAxis dataKey="jour" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 8, color: '#fff' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Line type="monotone" dataKey="visites" stroke="#0073f4" strokeWidth={2.5} dot={{ fill: '#0073f4', r: 4 }} name="Visites" />
                  <Line type="monotone" dataKey="uniques" stroke="#4da6ff" strokeWidth={2} strokeDasharray="4 2" dot={false} name="Uniques" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Row : Pays + Devices + Sources */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 20, marginBottom: 24,
            }}>

              {/* Pays */}
              <div style={{
                background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 'clamp(16px, 3vw, 24px)',
              }}>
                <SectionTitle>Top Pays</SectionTitle>
                {PAYS_VISITES.map((p, i) => {
                  const max = PAYS_VISITES[0].visites
                  return (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                          {p.flag} {p.pays}
                        </span>
                        <span style={{ fontSize: 12, color: '#0073f4', fontWeight: 700, fontFamily: 'monospace' }}>
                          {p.visites}
                        </span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
                        <div style={{
                          height: 4, borderRadius: 4,
                          background: `linear-gradient(90deg, #0073f4, #000e91)`,
                          width: `${(p.visites / max) * 100}%`,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Devices */}
              <div style={{
                background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 'clamp(16px, 3vw, 24px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <SectionTitle style={{ width: '100%' }}>Appareils</SectionTitle>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={DEVICES} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {DEVICES.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 8, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {DEVICES.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{d.name}</span>
                      <span style={{ color: '#0073f4', fontWeight: 700 }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div style={{
                background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 'clamp(16px, 3vw, 24px)',
              }}>
                <SectionTitle>Sources de Trafic</SectionTitle>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={SOURCES} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} width={70} />
                    <Tooltip contentStyle={{ background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {SOURCES.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                  {SOURCES.map((s, i) => (
                    <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      {s.name} {s.value}%
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pages vues */}
            <div style={{
              background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 'clamp(16px, 3vw, 24px)',
            }}>
              <SectionTitle>Pages les Plus Visitées</SectionTitle>
              {PAGES_VUES.map((p, i) => {
                const max = PAGES_VUES[0].vues
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '10px 0',
                    borderBottom: i < PAGES_VUES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(0,115,244,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: '#0073f4', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4, fontFamily: 'monospace' }}>
                        {p.page}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
                        <div style={{
                          height: 4, borderRadius: 4,
                          background: 'linear-gradient(90deg, #0073f4, #000e91)',
                          width: `${(p.vues / max) * 100}%`,
                        }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0073f4', fontFamily: 'monospace', flexShrink: 0 }}>
                      {p.vues.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── INSCRIPTIONS ── */}
        {tab === 'inscriptions' && (
          <div className="fadeUp">

            {/* KPI + Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { label: 'Dossiers', value: INSCRIPTIONS.length, color: '#0073f4' },
                  { label: 'Participants', value: totalInscrits, color: '#00cc88' },
                  { label: 'Revenus', value: `$${totalRevenu.toLocaleString()}`, color: '#ffaa00' },
                  { label: 'Pays', value: new Set(INSCRIPTIONS.map(r => r.pays)).size, color: '#ff6b9d' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '12px 20px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={handleExport} style={{
                background: exported ? 'rgba(0,204,136,0.15)' : 'linear-gradient(135deg, #0073f4, #000e91)',
                border: exported ? '1px solid rgba(0,204,136,0.4)' : 'none',
                color: exported ? '#00cc88' : '#FFFFFF',
                borderRadius: 10, padding: '12px 24px',
                fontWeight: 700, fontSize: 13, letterSpacing: 1,
                cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: exported ? 'none' : '0 6px 20px rgba(0,115,244,0.3)',
              }}>
                {exported ? '✅ Exporté !' : '⬇️ Exporter CSV'}
              </button>
            </div>

            {/* Recherche */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Rechercher par nom, email, organisation, pays..."
              style={{
                width: '100%', padding: '13px 18px',
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#FFFFFF',
                fontSize: 13, outline: 'none', marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />

            {/* Tableau */}
            <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(0,115,244,0.08)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['#', 'Nom & Prénom', 'Organisation', 'Pays', 'Email', 'Tél', 'Part.', 'Montant', 'Date'].map((h, i) => (
                      <th key={i} style={{
                        padding: '14px 16px', textAlign: 'left',
                        fontSize: 10, color: 'rgba(255,255,255,0.4)',
                        letterSpacing: 2, textTransform: 'uppercase',
                        fontWeight: 700, whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,115,244,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                    >
                      <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{r.id}</td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{r.prenom} {r.nom}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{r.poste}</div>
                      </td>
                      <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.65)', maxWidth: 200 }}>{r.organisation}</td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.2)',
                          borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#4da6ff'
                        }}>
                          {r.pays}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: 12 }}>{r.email}</td>
                      <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontSize: 12 }}>{r.telephone}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <span style={{
                          background: 'rgba(0,204,136,0.1)', border: '1px solid rgba(0,204,136,0.2)',
                          borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#00cc88', fontWeight: 700
                        }}>
                          {r.participants}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontWeight: 700, color: '#ffaa00', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        ${r.montant.toLocaleString()}
                      </td>
                      <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {new Date(r.date).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
                  Aucun résultat pour "{search}"
                </div>
              )}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''} · {filtered.reduce((s,r) => s+r.participants, 0)} participants · ${filtered.reduce((s,r) => s+r.montant, 0).toLocaleString()} total
            </div>
          </div>
        )}

        {/* ── GOOGLE ANALYTICS ── */}
        {tab === 'ga4' && (
          <div className="fadeUp">
            <div style={{
              background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 'clamp(24px, 4vw, 40px)',
              maxWidth: 700, margin: '0 auto', textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 12 }}>
                Intégrer Google Analytics 4
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 32 }}>
                Ajoutez votre ID de mesure GA4 dans votre projet React pour activer le tracking en temps réel.
              </p>

              <div style={{ textAlign: 'left' }}>

                {/* Étape 1 */}
                <div style={{
                  background: 'rgba(0,115,244,0.06)', border: '1px solid rgba(0,115,244,0.15)',
                  borderRadius: 12, padding: '20px 24px', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                    Étape 1 — Installer react-ga4
                  </div>
                  <code style={{
                    display: 'block', background: '#060a14',
                    borderRadius: 8, padding: '12px 16px',
                    fontSize: 13, color: '#4da6ff', fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}>
                    npm install react-ga4
                  </code>
                </div>

                {/* Étape 2 */}
                <div style={{
                  background: 'rgba(0,115,244,0.06)', border: '1px solid rgba(0,115,244,0.15)',
                  borderRadius: 12, padding: '20px 24px', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                    Étape 2 — Initialiser dans main.jsx / App.jsx
                  </div>
                  <code style={{
                    display: 'block', background: '#060a14',
                    borderRadius: 8, padding: '12px 16px',
                    fontSize: 12, color: '#4da6ff', fontFamily: 'monospace',
                    whiteSpace: 'pre', overflowX: 'auto',
                  }}>
{`import ReactGA from 'react-ga4'

// Dans votre App.jsx, au montage :
useEffect(() => {
  ReactGA.initialize('G-XXXXXXXXXX') // ← votre Measurement ID
  ReactGA.send('pageview')
}, [])`}
                  </code>
                </div>

                {/* Étape 3 */}
                <div style={{
                  background: 'rgba(0,115,244,0.06)', border: '1px solid rgba(0,115,244,0.15)',
                  borderRadius: 12, padding: '20px 24px', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                    Étape 3 — Tracker les événements clés
                  </div>
                  <code style={{
                    display: 'block', background: '#060a14',
                    borderRadius: 8, padding: '12px 16px',
                    fontSize: 12, color: '#4da6ff', fontFamily: 'monospace',
                    whiteSpace: 'pre', overflowX: 'auto',
                  }}>
{`// Quand quelqu'un soumet le formulaire :
ReactGA.event({
  category: 'Inscription',
  action: 'form_submit',
  label: form.pays,
  value: parseInt(form.participants)
})

// Quand quelqu'un clique sur un bouton CTA :
ReactGA.event({
  category: 'CTA',
  action: 'click',
  label: 'hero_inscrire'
})`}
                  </code>
                </div>

                {/* Étape 4 */}
                <div style={{
                  background: 'rgba(0,204,136,0.06)', border: '1px solid rgba(0,204,136,0.15)',
                  borderRadius: 12, padding: '20px 24px',
                }}>
                  <div style={{ fontSize: 11, color: '#00cc88', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                    ✅ Étape 4 — Voir les données dans GA4
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                    Connectez-vous à <strong style={{ color: '#00cc88' }}>analytics.google.com</strong>, créez une propriété GA4, 
                    récupérez votre Measurement ID (format <code style={{ color: '#4da6ff' }}>G-XXXXXXXXXX</code>) 
                    et remplacez-le dans le code ci-dessus. Les données apparaissent en temps réel dans le rapport 
                    <strong style={{ color: '#00cc88' }}> "Temps réel"</strong> de GA4.
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

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />
  return <Dashboard onLogout={() => setLoggedIn(false)} />
}

export default AdminDashboard