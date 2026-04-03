import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../supabase'
import emailjs from '@emailjs/browser'

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

const STATUS_CONFIG = {
  nouveau:     { label: 'Nouveau',     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  en_attente:  { label: 'En attente',  color: '#ffaa00', bg: 'rgba(255,170,0,0.12)',   border: 'rgba(255,170,0,0.3)'  },
  reserve:     { label: 'Réservé',     color: '#4da6ff', bg: 'rgba(77,166,255,0.12)',  border: 'rgba(77,166,255,0.3)' },
  confirme:    { label: 'Confirmé ✓',  color: '#00cc88', bg: 'rgba(0,204,136,0.12)',   border: 'rgba(0,204,136,0.3)'  },
  annule:      { label: 'Annulé',      color: '#ff4444', bg: 'rgba(255,68,68,0.12)',   border: 'rgba(255,68,68,0.3)'  },
}

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

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG['nouveau']
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, color: s.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

const exportCSV = (data) => {
  const headers = ['Dossier','Nom','Prénom','Email','Téléphone','Organisation','Poste','Pays','Nb Participants','Montant ($)','Statut','Date','Message']
  const rows = data.map(r => [
    r.dossier, r.nom, r.prenom, r.email, r.telephone,
    r.organisation, r.poste, r.pays, r.participants,
    r.montant, r.paiement_status, new Date(r.created_at).toLocaleDateString('fr-FR'), r.message
  ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `COPAF2026_inscriptions_${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

// ─── MODAL INSCRIPTION ───────────────────────────────────────────────────────

const ModalDossier = ({ inscription, onClose, onUpdate }) => {
  const [status, setStatus] = useState(inscription.paiement_status || 'en_attente')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleSaveStatus = async () => {
    setSaving(true)
    const { error } = await supabase.from('inscriptions').update({ paiement_status: status }).eq('id', inscription.id)
    setSaving(false)
    if (!error) { onUpdate({ ...inscription, paiement_status: status }); showToast('✅ Statut mis à jour') }
    else showToast('❌ Erreur : ' + error.message)
  }

  const handleRelance = async () => {
    setSending(true)
    try {
      await emailjs.send('service_x07g4et', 'template_7wrkmm1', {
        prenom: inscription.prenom, nom: inscription.nom, email: inscription.email,
        organisation: inscription.organisation, poste: inscription.poste, pays: inscription.pays,
        participants: inscription.participants, montant: (inscription.montant || 0).toLocaleString(),
        dossier: inscription.dossier || '—', paiement_mode: '⚠️ RELANCE — Paiement en attente',
      }, 'zBZAZxCfznICTKLJK')
      showToast('📧 Relance envoyée !')
    } catch { showToast('❌ Erreur envoi email') }
    setSending(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const { error } = await supabase.from('inscriptions').delete().eq('id', inscription.id)
    setDeleting(false)
    if (!error) { onUpdate(null); onClose() }
    else showToast('❌ Erreur suppression')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 'clamp(24px,4vw,40px)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
        {toast && <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#fff', whiteSpace: 'nowrap', zIndex: 10 }}>{toast}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF' }}>{inscription.prenom} {inscription.nom}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: 'monospace' }}>{inscription.dossier || '—'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          {[
            { label: 'Organisation', value: inscription.organisation },
            { label: 'Poste', value: inscription.poste },
            { label: 'Pays', value: inscription.pays },
            { label: 'Email', value: inscription.email },
            { label: 'Téléphone', value: inscription.telephone },
            { label: 'Participants', value: `${inscription.participants} personne(s)` },
            { label: 'Montant', value: `$${(inscription.montant||0).toLocaleString()}` },
            { label: 'Date', value: new Date(inscription.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Statut du paiement</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {Object.entries(STATUS_CONFIG).map(([key, s]) => (
              <div key={key} onClick={() => setStatus(key)} style={{ border: `2px solid ${status === key ? s.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', background: status === key ? s.bg : 'transparent', transition: 'all 0.2s', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: status === key ? s.color : 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={handleSaveStatus} disabled={saving} style={{ marginTop: 12, width: '100%', padding: '12px', background: 'linear-gradient(135deg,#0073f4,#000e91)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, letterSpacing: 1, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '⏳ Sauvegarde...' : '💾 Enregistrer le statut'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={handleRelance} disabled={sending} style={{ padding: '12px', background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.3)', color: '#4da6ff', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1 }}>
            {sending ? '⏳ Envoi...' : '📧 Envoyer relance'}
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: '12px', background: confirmDelete ? 'rgba(255,68,68,0.2)' : 'rgba(255,68,68,0.08)', border: `1px solid ${confirmDelete ? 'rgba(255,68,68,0.6)' : 'rgba(255,68,68,0.25)'}`, color: '#ff6b6b', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: deleting ? 'not-allowed' : 'pointer' }}>
            {deleting ? '⏳...' : confirmDelete ? '⚠️ Confirmer' : '🗑️ Supprimer'}
          </button>
        </div>
        {confirmDelete && <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,100,100,0.7)', textAlign: 'center' }}>Cliquez à nouveau pour confirmer la suppression définitive.</div>}
      </div>
    </div>
  )
}

// ─── MODAL LEAD (Exposant / Sponsor) ─────────────────────────────────────────

const ModalLead = ({ lead, type, onClose, onUpdate }) => {
  const [statut, setStatut] = useState(lead.statut || 'nouveau')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleSave = async () => {
    setSaving(true)
    const table = type === 'sponsor' ? 'sponsors' : 'exposants'
    const { error } = await supabase.from(table).update({ statut }).eq('id', lead.id)
    setSaving(false)
    if (!error) { onUpdate({ ...lead, statut }); showToast('✅ Statut mis à jour') }
    else showToast('❌ Erreur : ' + error.message)
  }

  const infos = type === 'sponsor' ? [
    { label: 'Organisation', value: lead.organisation },
    { label: 'Package', value: lead.package },
    { label: 'Contact', value: lead.contact },
    { label: 'Email', value: lead.email },
    { label: 'Téléphone', value: lead.telephone },
    { label: 'Pays', value: lead.pays },
    { label: 'Message', value: lead.message },
    { label: 'Date', value: new Date(lead.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) },
  ] : [
    { label: 'Entreprise', value: lead.entreprise },
    { label: 'Forfait', value: lead.forfait },
    { label: 'Catégorie', value: lead.categorie },
    { label: 'Contact', value: lead.contact },
    { label: 'Email', value: lead.email },
    { label: 'Téléphone', value: lead.telephone },
    { label: 'Pays', value: lead.pays },
    { label: 'Site', value: lead.site },
    { label: 'Description', value: lead.description },
    { label: 'Message', value: lead.message },
    { label: 'Date', value: new Date(lead.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 'clamp(24px,4vw,40px)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
        {toast && <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#1a2030', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#fff', whiteSpace: 'nowrap', zIndex: 10 }}>{toast}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF' }}>{lead.entreprise || lead.organisation}</div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4, color: type === 'sponsor' ? '#FFD700' : '#0073f4' }}>
              {type === 'sponsor' ? `💎 Sponsor — ${lead.package}` : `🏪 Exposant — ${lead.forfait}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          {infos.filter(r => r.value).map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600, textAlign: 'right', maxWidth: 300, wordBreak: 'break-word' }}>{row.value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Statut</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {Object.entries(STATUS_CONFIG).map(([key, s]) => (
              <div key={key} onClick={() => setStatut(key)} style={{ border: `2px solid ${statut === key ? s.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', background: statut === key ? s.bg : 'transparent', transition: 'all 0.2s', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: statut === key ? s.color : 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} style={{ marginTop: 12, width: '100%', padding: '12px', background: 'linear-gradient(135deg,#0073f4,#000e91)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '⏳ Sauvegarde...' : '💾 Enregistrer le statut'}
          </button>
        </div>
        <a href={`mailto:${lead.email}`} style={{ display: 'block', textAlign: 'center', padding: '13px', background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.3)', color: '#4da6ff', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: 1 }}>
          📧 Contacter — {lead.email}
        </a>
      </div>
    </div>
  )
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
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 32, fontWeight: 700, letterSpacing: 5, color: '#FFFFFF', marginBottom: 4 }}>COPAF <span style={{ color: '#0073f4' }}>2026</span></div>
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
  const [tab, setTab] = useState('inscriptions')
  const [inscriptions, setInscriptions] = useState([])
  const [exposants, setExposants] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [visites, setVisites] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('tous')
  const [exported, setExported] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [leadType, setLeadType] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: ins }, { data: vis }, { data: exp }, { data: spo }] = await Promise.all([
        supabase.from('inscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('visites').select('*').order('created_at', { ascending: true }),
        supabase.from('exposants').select('*').order('created_at', { ascending: false }),
        supabase.from('sponsors').select('*').order('created_at', { ascending: false }),
      ])
      setInscriptions(ins || [])
      setVisites(vis || [])
      setExposants(exp || [])
      setSponsors(spo || [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('all-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inscriptions' }, payload => setInscriptions(prev => [payload.new, ...prev]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exposants' }, payload => setExposants(prev => [payload.new, ...prev]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sponsors' }, payload => setSponsors(prev => [payload.new, ...prev]))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const totalParticipants = inscriptions.reduce((s, r) => s + (r.participants || 0), 0)
  const totalRevenu = inscriptions.reduce((s, r) => s + (r.montant || 0), 0)
  const paysUniques = new Set(inscriptions.map(r => r.pays)).size
  const confirmes = inscriptions.filter(r => r.paiement_status === 'confirme').length
  const enAttente = inscriptions.filter(r => r.paiement_status === 'en_attente' || r.paiement_status === 'reserve').length

  const visitesParSemaine = useMemo(() => groupByWeek(visites), [visites])
  const visitesParPays = useMemo(() => groupByField(visites, 'pays').slice(0,10), [visites])
  const visitesParDevice = useMemo(() => groupByField(visites, 'device'), [visites])
  const visitesParSource = useMemo(() => groupByField(visites, 'source'), [visites])
  const tauxConversion = visites.length > 0 ? ((inscriptions.length / visites.length) * 100).toFixed(1) : '0.0'

  const filtered = useMemo(() =>
    inscriptions.filter(r => {
      const matchSearch = [r.nom, r.prenom, r.email, r.organisation, r.pays, r.dossier].some(v => (v||'').toLowerCase().includes(search.toLowerCase()))
      const matchStatus = filterStatus === 'tous' || r.paiement_status === filterStatus
      return matchSearch && matchStatus
    }), [inscriptions, search, filterStatus])

  const handleUpdateInscription = (updated) => {
    if (updated === null) setInscriptions(prev => prev.filter(r => r.id !== selectedInscription?.id))
    else setInscriptions(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  const handleUpdateLead = (updated) => {
    if (leadType === 'sponsor') setSponsors(prev => prev.map(r => r.id === updated.id ? updated : r))
    else setExposants(prev => prev.map(r => r.id === updated.id ? updated : r))
    setSelectedLead(updated)
  }

  const handleExport = () => { exportCSV(filtered); setExported(true); setTimeout(() => setExported(false), 2000) }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch('https://script.google.com/macros/s/AKfycbx8aHKKGJz10iYkMJbUni74rvLrjk00E8v1gCJuYVAo9oqjA9zJXDrdhaGkwWX031iX_w/exec', { mode: 'no-cors' })
      setTimeout(() => {
        alert('✅ Google Sheet mis à jour !')
        setSyncing(false)
      }, 4000)
    } catch {
      alert('❌ Erreur de synchronisation')
      setSyncing(false)
    }
  }

  const tabs = [
    { id: 'inscriptions', label: '📋 Inscriptions' },
    { id: 'exposants', label: '🏪 Exposants' },
    { id: 'sponsors', label: '💎 Sponsors' },
    { id: 'analytics', label: '📊 Analytics' },
  ]

  const tableRowStyle = (i) => ({ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.015)', transition: 'background 0.15s', cursor: 'pointer' })

  return (
    <div style={{ minHeight: '100vh', background: '#060a14', fontFamily: "'DM Sans','Segoe UI',sans-serif", color: '#FFFFFF' }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0d1117} ::-webkit-scrollbar-thumb{background:rgba(0,115,244,0.4);border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fadeUp{animation:fadeUp 0.35s ease forwards}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        tr.row:hover td{background:rgba(0,115,244,0.06)!important}
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(12px,2vw,16px) clamp(16px,4vw,40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 700, letterSpacing: 3 }}>COPAF <span style={{ color: '#0073f4' }}>2026</span></div>
          <div style={{ background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 20, padding: '3px 12px', fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Admin</div>
          {loading && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', animation: 'pulse 1.5s infinite' }}>● Chargement...</div>}
          {!loading && <div style={{ fontSize: 11, color: '#00cc88' }}>● En direct</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>🕐 {new Date().toLocaleDateString('fr-FR')}</div>
          <button onClick={handleSync} disabled={syncing} style={{
            background: 'rgba(0,200,100,0.1)',
            border: '1px solid rgba(0,200,100,0.3)',
            color: '#00cc88', borderRadius: 8,
            padding: '7px 16px', fontSize: 12,
            fontWeight: 700, cursor: syncing ? 'not-allowed' : 'pointer',
            opacity: syncing ? 0.6 : 1
          }}>
            {syncing ? '⏳ Sync...' : '📊 Sync Sheets'}
          </button>
          <button onClick={onLogout} style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.25)', color: '#ff6b6b', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 clamp(16px,4vw,40px)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', color: tab === t.id ? '#0073f4' : 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: 13, padding: '16px 20px', cursor: 'pointer', borderBottom: tab === t.id ? '2px solid #0073f4' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {t.label}
            {t.id === 'exposants' && exposants.filter(e => e.statut === 'nouveau').length > 0 && (
              <span style={{ marginLeft: 6, background: '#0073f4', borderRadius: 10, padding: '2px 7px', fontSize: 10, color: '#fff' }}>{exposants.filter(e => e.statut === 'nouveau').length}</span>
            )}
            {t.id === 'sponsors' && sponsors.filter(s => s.statut === 'nouveau').length > 0 && (
              <span style={{ marginLeft: 6, background: '#FFD700', borderRadius: 10, padding: '2px 7px', fontSize: 10, color: '#000' }}>{sponsors.filter(s => s.statut === 'nouveau').length}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: 'clamp(20px,4vw,40px)' }}>

        {/* ── INSCRIPTIONS ── */}
        {tab === 'inscriptions' && (
          <div className="fadeUp">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Total dossiers', value: inscriptions.length, color: '#0073f4' },
                { label: 'Confirmés', value: confirmes, color: '#00cc88' },
                { label: 'En attente', value: enAttente, color: '#ffaa00' },
                { label: 'Participants', value: totalParticipants, color: '#4da6ff' },
                { label: 'Revenus', value: `$${totalRevenu.toLocaleString()}`, color: '#ff6b9d' },
                { label: 'Pays', value: paysUniques, color: '#a78bfa' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Nom, email, dossier, pays..."
                style={{ flex: 1, minWidth: 200, padding: '11px 16px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#FFFFFF', fontSize: 13, outline: 'none' }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '11px 16px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#FFFFFF', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                <option value="tous">Tous les statuts</option>
                {Object.entries(STATUS_CONFIG).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
              <button onClick={handleExport} style={{ background: exported ? 'rgba(0,204,136,0.15)' : 'linear-gradient(135deg,#0073f4,#000e91)', border: exported ? '1px solid rgba(0,204,136,0.4)' : 'none', color: exported ? '#00cc88' : '#FFFFFF', borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {exported ? '✅ Exporté !' : '⬇️ CSV'}
              </button>
            </div>
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
                        {['Dossier','Nom & Prénom','Organisation','Pays','Part.','Montant','Statut','Date',''].map((h, i) => (
                          <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => (
                        <tr key={r.id} className="row" style={tableRowStyle(i)} onClick={() => setSelectedInscription(r)}>
                          <td style={{ padding: '13px 16px', fontFamily: 'monospace', fontSize: 11, color: '#4da6ff', whiteSpace: 'nowrap' }}>{r.dossier || '—'}</td>
                          <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{r.prenom} {r.nom}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{r.poste}</div>
                          </td>
                          <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.65)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.organisation}</td>
                          <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}><span style={{ background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#4da6ff' }}>{FLAGS[r.pays] || ''} {r.pays}</span></td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}><span style={{ background: 'rgba(0,204,136,0.1)', border: '1px solid rgba(0,204,136,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#00cc88', fontWeight: 700 }}>{r.participants}</span></td>
                          <td style={{ padding: '13px 16px', fontWeight: 700, color: '#ffaa00', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>${(r.montant||0).toLocaleString()}</td>
                          <td style={{ padding: '13px 16px' }}><StatusBadge status={r.paiement_status} /></td>
                          <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                          <td style={{ padding: '13px 16px' }}>
                            <button onClick={e => { e.stopPropagation(); setSelectedInscription(r) }} style={{ background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.3)', color: '#4da6ff', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Gérer →</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>
                  {filtered.length} résultat{filtered.length>1?'s':''} · {filtered.reduce((s,r)=>s+(r.participants||0),0)} participants · ${filtered.reduce((s,r)=>s+(r.montant||0),0).toLocaleString()}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── EXPOSANTS ── */}
        {tab === 'exposants' && (
          <div className="fadeUp">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,160px),1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Total demandes', value: exposants.length, color: '#0073f4' },
                { label: 'Nouveaux', value: exposants.filter(e => e.statut === 'nouveau').length, color: '#a78bfa' },
                { label: 'Confirmés', value: exposants.filter(e => e.statut === 'confirme').length, color: '#00cc88' },
                { label: 'Annulés', value: exposants.filter(e => e.statut === 'annule').length, color: '#ff4444' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {exposants.length === 0 ? (
              <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🏪</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Aucune demande exposant pour l'instant.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,115,244,0.08)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Entreprise','Contact','Email','Pays','Catégorie','Forfait','Statut','Date'].map((h, i) => (
                        <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exposants.map((r, i) => (
                      <tr key={r.id} className="row" style={tableRowStyle(i)} onClick={() => { setSelectedLead(r); setLeadType('exposant') }}>
                        <td style={{ padding: '13px 16px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{r.entreprise}</td>
                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{r.contact}</td>
                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: 12 }}>{r.email}</td>
                        <td style={{ padding: '13px 16px' }}><span style={{ background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#4da6ff' }}>{r.pays}</span></td>
                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{r.categorie}</td>
                        <td style={{ padding: '13px 16px', color: '#0073f4', fontWeight: 700 }}>{r.forfait}</td>
                        <td style={{ padding: '13px 16px' }}><StatusBadge status={r.statut || 'nouveau'} /></td>
                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SPONSORS ── */}
        {tab === 'sponsors' && (
          <div className="fadeUp">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,160px),1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Total demandes', value: sponsors.length, color: '#FFD700' },
                { label: 'Nouveaux', value: sponsors.filter(s => s.statut === 'nouveau').length, color: '#a78bfa' },
                { label: 'Confirmés', value: sponsors.filter(s => s.statut === 'confirme').length, color: '#00cc88' },
                { label: 'Annulés', value: sponsors.filter(s => s.statut === 'annule').length, color: '#ff4444' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {sponsors.length === 0 ? (
              <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>💎</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Aucune demande sponsor pour l'instant.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,215,0,0.06)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Organisation','Contact','Email','Pays','Package','Statut','Date'].map((h, i) => (
                        <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sponsors.map((r, i) => (
                      <tr key={r.id} className="row" style={tableRowStyle(i)} onClick={() => { setSelectedLead(r); setLeadType('sponsor') }}>
                        <td style={{ padding: '13px 16px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{r.organisation}</td>
                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{r.contact}</td>
                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: 12 }}>{r.email}</td>
                        <td style={{ padding: '13px 16px' }}><span style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#FFD700' }}>{r.pays}</span></td>
                        <td style={{ padding: '13px 16px', color: '#FFD700', fontWeight: 700 }}>{r.package}</td>
                        <td style={{ padding: '13px 16px' }}><StatusBadge status={r.statut || 'nouveau'} /></td>
                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="fadeUp">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon="👁️" label="Total Visites" value={visites.length.toLocaleString()} sub="Enregistrées" color="#0073f4" />
              <StatCard icon="👤" label="Inscrits" value={inscriptions.length} sub={`${totalParticipants} participants`} color="#00cc88" />
              <StatCard icon="🏪" label="Exposants" value={exposants.length} sub="Demandes reçues" color="#4da6ff" />
              <StatCard icon="💎" label="Sponsors" value={sponsors.length} sub="Demandes reçues" color="#FFD700" />
              <StatCard icon="📈" label="Conversion" value={`${tauxConversion}%`} sub="Visites → Inscrits" color="#ff6b9d" />
            </div>
            {visites.length === 0 ? (
              <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Aucune visite enregistrée.</div>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 20 }}>
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
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL INSCRIPTION */}
      {selectedInscription && (
        <ModalDossier
          inscription={selectedInscription}
          onClose={() => setSelectedInscription(null)}
          onUpdate={(updated) => { handleUpdateInscription(updated); if (updated) setSelectedInscription(updated) }}
        />
      )}

      {/* MODAL LEAD */}
      {selectedLead && (
        <ModalLead
          lead={selectedLead}
          type={leadType}
          onClose={() => { setSelectedLead(null); setLeadType(null) }}
          onUpdate={handleUpdateLead}
        />
      )}
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