import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import QRCode from 'qrcode'
import { supabase } from '../supabase'
import { generateBadge } from '../utils/generateBadge'
import { useAdminAuth } from '../adminAuth'
import AdminProforma from '../pages/AdminProforma'
import AdminSondages from '../pages/AdminSondages'
import AdminDiagnostics from '../pages/AdminDiagnostics'
import AdminTirage from '../pages/AdminTirage'

// ============================================================
// REMPLACEZ CETTE URL par celle de votre déploiement Apps Script
// Extensions > Apps Script > Déployer > Nouvelle application web
// ============================================================
const SHEET_URL = import.meta.env.VITE_SHEET_URL_ADMIN

// ─── ICÔNES SVG ──────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const paths = {
    users: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    diamond: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M12 22V9"/><path d="M6 3l6 6 6-6"/></svg>,
    building: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    monitor: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
    chart: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    euro: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7 7 0 1 0 0 12"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    refresh: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    sheet: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    trash: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    mail: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    close: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    filter: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    save: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    globe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    menu: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    copaf: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"/><polyline points="2 7 12 12 22 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
    gift: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
    upload: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    plus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    eye: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.35"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    copy: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  }
  return paths[name] || null
}

// ─── STATUTS ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  nouveau:    { label: 'Nouveau',     bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed' },
  en_attente: { label: 'En attente',  bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
  reserve:    { label: 'Réservé',     bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' },
  confirme:   { label: 'Confirmé',    bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  annule:     { label: 'Annulé',      bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
}

// ─── MODULES (onglets sidebar) ────────────────────────────────────────────────
const MODULES = [
  { id: 'dashboard',   label: 'Tableau de bord', icon: 'chart',    table: null,            scope: 'all' },
  { id: 'analytics',   label: 'Analytics',       icon: 'globe',    table: null,            scope: 'all' },
  { id: 'participants',label: 'Participants',     icon: 'users',    table: 'inscriptions',  statusField: 'paiement_status', scope: 'all' },
  { id: 'sponsors',    label: 'Sponsors',         icon: 'diamond',  table: 'sponsorships',  statusField: 'statut', filter: { type: 'sponsor' }, scope: 'all' },
  { id: 'partenaires', label: 'Partenaires',      icon: 'building', table: 'sponsorships',  statusField: 'statut', filter: { type: 'partenaire_strategique' }, scope: 'all' },
  { id: 'exposants',   label: 'Exposants',        icon: 'monitor',  table: 'exposants',     statusField: 'statut', scope: 'all' },
  { id: 'proforma',    label: 'Proforma',         icon: 'euro',     table: null,            scope: 'proforma' },
  { id: 'sondages',    label: 'Sondages',         icon: 'check',    table: null,            scope: 'sondages' },
  { id: 'diagnostics', label: 'Diagnostics',      icon: 'search',   table: null,            scope: 'diagnostics' },
  { id: 'tirage',      label: 'Tirage au sort',   icon: 'gift',     table: null,            scope: 'all' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt     = n  => (n || 0).toLocaleString('fr-FR')
const fmtEur  = n  => `${fmt(n)} €`
const fmtDate = d  => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime = d  => d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''

// Détection appareil à partir du user-agent stocké en base
const parseDevice = ua => {
  if (!ua) return 'Inconnu'
  if (/tablet|ipad/i.test(ua)) return 'Tablette'
  if (/mobile|android|iphone/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

// Détection source à partir du referrer stocké en base
const parseSource = ref => {
  if (!ref) return 'Direct'
  if (ref.includes('google')) return 'Google'
  if (ref.includes('facebook')) return 'Facebook'
  if (ref.includes('linkedin')) return 'LinkedIn'
  if (ref.includes('twitter') || ref.includes('x.com')) return 'Twitter / X'
  if (ref.includes('whatsapp')) return 'WhatsApp'
  if (ref.includes('copaf-ports.com')) return 'Interne (navigation)'
  return 'Autre'
}

function exportCSV(rows, cols, filename) {
  const header = cols.map(c => `"${c.label}"`).join(',')
  const body   = rows.map(r => cols.map(c => `"${String(r[c.key] || '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob   = new Blob(['\uFEFF' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
  const a      = document.createElement('a')
  a.href       = URL.createObjectURL(blob)
  a.download   = filename
  a.click()
}

// ─── SYNC GOOGLE SHEETS ──────────────────────────────────────────────────────
async function syncToSheets(action, payload) {
  if (!SHEET_URL || SHEET_URL.includes('COLLEZ_ICI')) {
    throw new Error("Configurez d'abord SHEET_URL dans AdminPage.jsx")
  }

  // Google Apps Script n'accepte pas application/json en cross-origin
  // On encode les donnees en parametre URL (GET) pour contourner CORS
  const body    = JSON.stringify({ action, ...payload })
  const encoded = encodeURIComponent(body)
  const url     = `${SHEET_URL}?data=${encoded}`

  await fetch(url, {
    method: 'GET',
    mode: 'no-cors', // no-cors suffit pour GET — le script recoit bien les donnees
  })

  return true
}

// ─── BADGE STATUT ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.nouveau
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, color: cfg.color,
      borderRadius: 20, padding: '4px 12px',
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ─── STYLE PARTAGE DES CARTES ─────────────────────────────────────────────────
const CARD_STYLE = {
  background: '#fff', border: '1px solid #eef1f8', borderRadius: 18,
  boxShadow: '0 1px 3px rgba(15,23,42,.04), 0 10px 24px -16px rgba(15,23,42,.12)',
}

// ─── CARTE KPI ───────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color, trend }) {
  return (
    <div className="kpi-card" style={{
      ...CARD_STYLE, padding: '20px 20px 18px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}33)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: `linear-gradient(135deg, ${color}26, ${color}0d)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color={color} />
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#10b981' : '#ef4444', background: trend >= 0 ? '#d1fae5' : '#fee2e2', padding: '3px 9px', borderRadius: 8 }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.6px', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ─── BARRE HORIZONTALE ───────────────────────────────────────────────────────
function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.max(3, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155', marginBottom: 6, gap: 8 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>{value}</span>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 4, height: '100%', transition: 'width .8s ease' }} />
      </div>
    </div>
  )
}

// ─── MODAL GÉNÉRIQUE ─────────────────────────────────────────────────────────
function Modal({ title, subtitle, accentColor, fields, status, statusField, onStatusChange, onSave, onDelete, onClose, saving, deleting, confirmDel, setConfirmDel, toast, onDownloadBadge, generatingBadge, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.15)', animation: 'modalIn .2s ease' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '28px 28px 0', borderBottom: '1px solid #f1f5f9', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{title}</div>
              {subtitle && <div style={{ fontSize: 13, color: accentColor, fontWeight: 600 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={16} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ margin: '14px 28px 0', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#065f46', fontWeight: 500 }}>
            {toast}
          </div>
        )}

        {/* Champs */}
        <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          {fields.filter(f => f.value).map((f, i) => (
            <div key={i} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: .5, marginBottom: 5 }}>{f.label}</div>
              <div style={{ fontSize: 14, color: '#334155', fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word' }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Modifier statut */}
        <div style={{ padding: '0 28px 20px' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: .5, marginBottom: 10 }}>Modifier le statut</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {Object.entries(STATUS_CONFIG).map(([k, s]) => (
              <button key={k} onClick={() => onStatusChange(k)} style={{
                background: status === k ? s.bg : '#fff',
                border: `1.5px solid ${status === k ? s.dot : '#e2e8f0'}`,
                color: status === k ? s.color : '#64748b',
                borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
              }}>{s.label}</button>
            ))}
          </div>

          <button onClick={onSave} disabled={saving} style={{
            width: '100%', padding: '13px', background: saving ? '#e2e8f0' : '#0f172a',
            border: 'none', borderRadius: 12, color: saving ? '#94a3b8' : '#fff',
            fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
          }}>
            <Icon name="save" size={16} color={saving ? '#94a3b8' : '#fff'} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          {onDownloadBadge && (
            <button onClick={onDownloadBadge} disabled={generatingBadge} style={{
              width: '100%', padding: '13px', marginTop: 10,
              background: '#fff', border: '1.5px solid #000E91',
              borderRadius: 12, color: '#000E91',
              fontWeight: 700, fontSize: 14, cursor: generatingBadge ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
              opacity: generatingBadge ? .6 : 1,
            }}>
              <Icon name="download" size={16} color="#000E91" />
              {generatingBadge ? 'Génération du badge...' : 'Télécharger le badge (PNG)'}
            </button>
          )}
        </div>

        {children}

        {/* Suppression */}
        {onDelete && (
          <div style={{ padding: '0 28px 28px' }}>
            <button onClick={onDelete} disabled={deleting} style={{
              width: '100%', padding: '12px',
              background: confirmDel ? '#fef2f2' : '#fff',
              border: `1.5px solid ${confirmDel ? '#ef4444' : '#fee2e2'}`,
              color: '#ef4444', borderRadius: 12, fontWeight: 600, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
              transition: 'all .15s',
            }}>
              <Icon name="trash" size={15} color="#ef4444" />
              {deleting ? 'Suppression...' : confirmDel ? 'Confirmer la suppression ?' : 'Supprimer ce dossier'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ESPACE PERSONNEL DU DOSSIER (documents, programme, infos) ────────────────
const EXTRAS_LABEL = { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: .5, marginBottom: 8 }
const EXTRAS_ROW = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 12px', border: '1px solid #eef1f8', borderRadius: 10, marginBottom: 6, background: '#f8fafc' }
const EXTRAS_INPUT = { flex: 1, padding: '9px 12px', fontSize: 12.5, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 9, outline: 'none', boxSizing: 'border-box' }
const EXTRAS_ICONBTN = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }
const PREUVE_STATUT_LABEL = { en_attente: 'En attente', validee: 'Validee', rejetee: 'Rejetee' }
const PREUVE_STATUT_COLOR = { en_attente: { bg: '#fef3c7', color: '#92400e' }, validee: { bg: '#d1fae5', color: '#065f46' }, rejetee: { bg: '#fee2e2', color: '#991b1b' } }

function DossierExtras({ dossier, badgeToken, inscriptionId, arrived, arrivedAt, onArrivedChange }) {
  const [docs, setDocs] = useState([])
  const [infos, setInfos] = useState([])
  const [agenda, setAgenda] = useState([])
  const [preuves, setPreuves] = useState([])
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newInfo, setNewInfo] = useState('')
  const [badgeQr, setBadgeQr] = useState('')
  const [tokenCopied, setTokenCopied] = useState(false)
  const [togglingArrivee, setTogglingArrivee] = useState(null)
  const fileRef = useRef(null)

  const badgeUrl = badgeToken ? `https://copaf-ports.com/badge/${badgeToken}` : ''

  useEffect(() => {
    if (!badgeUrl) { setBadgeQr(''); return }
    let cancelled = false
    QRCode.toDataURL(badgeUrl, { width: 320, margin: 1, color: { dark: '#000E91', light: '#FFFFFF' } })
      .then(url => { if (!cancelled) setBadgeQr(url) })
      .catch(() => { if (!cancelled) setBadgeQr('') })
    return () => { cancelled = true }
  }, [badgeUrl])

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(badgeToken)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    } catch { /* clipboard indisponible */ }
  }

  const downloadBadgeQr = () => {
    if (!badgeQr) return
    const a = document.createElement('a')
    a.href = badgeQr
    a.download = `QR-badge-${dossier}.png`
    a.click()
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [docsRes, infosRes, agendaRes, preuvesRes, membresRes] = await Promise.all([
      supabase.from('documents_participants').select('*').eq('dossier', dossier).order('created_at'),
      supabase.from('infos_importantes').select('*').eq('dossier', dossier).order('created_at', { ascending: false }),
      supabase.from('agenda_participant').select('*').eq('dossier', dossier).order('jour').order('heure'),
      supabase.from('preuves_paiement').select('*').eq('dossier', dossier).order('created_at', { ascending: false }),
      inscriptionId
        ? supabase.from('inscription_participants').select('*').eq('inscription_id', inscriptionId).order('ordre')
        : Promise.resolve({ data: [] }),
    ])
    setDocs(docsRes.data || [])
    setInfos(infosRes.data || [])
    setAgenda(agendaRes.data || [])
    setPreuves(preuvesRes.data || [])
    setMembres(membresRes.data || [])
    setLoading(false)
  }, [dossier, inscriptionId])

  useEffect(() => { load() }, [load])

  // Pointage manuel depuis le dashboard (en plus du scan sur place) : utile
  // pour corriger une erreur de scan ou marquer quelqu'un arrive/absent
  // sans repasser par /staff/scan. targetId=null -> inscription principale,
  // sinon id de la ligne inscription_participants (membre de groupe).
  const toggleArrivee = async (targetId, currentlyArrived) => {
    setTogglingArrivee(targetId || 'principal')
    const table = targetId ? 'inscription_participants' : 'inscriptions'
    const match = targetId ? { id: targetId } : { dossier }
    const { data: userData } = await supabase.auth.getUser()
    const patch = currentlyArrived
      ? { arrived: false, arrived_at: null, checked_in_by: null }
      : { arrived: true, arrived_at: new Date().toISOString(), checked_in_by: userData?.user?.id || null }
    await supabase.from(table).update(patch).match(match)
    if (targetId) await load()
    else onArrivedChange?.(patch)
    setTogglingArrivee(null)
  }

  const uploadDoc = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${dossier}/${Date.now()}_${file.name}`.replace(/\s+/g, '_')
    const { error: upErr } = await supabase.storage.from('documents-participants').upload(path, file)
    if (!upErr) {
      const url = supabase.storage.from('documents-participants').getPublicUrl(path).data.publicUrl
      const { data: userData } = await supabase.auth.getUser()
      await supabase.from('documents_participants').insert({
        dossier, type: 'autre', label: file.name, url, ajoute_par: userData?.user?.email || null,
      })
      await load()
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const toggleDocVisible = async doc => {
    await supabase.from('documents_participants').update({ visible: !doc.visible }).eq('id', doc.id)
    load()
  }

  const deleteDoc = async doc => {
    await supabase.from('documents_participants').delete().eq('id', doc.id)
    load()
  }

  const addInfo = async () => {
    if (!newInfo.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('infos_importantes').insert({ dossier, contenu: newInfo.trim(), updated_par: userData?.user?.email || null })
    setNewInfo('')
    load()
  }

  const deleteInfo = async info => {
    await supabase.from('infos_importantes').delete().eq('id', info.id)
    load()
  }

  const setPreuveStatut = async (preuve, statut) => {
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('preuves_paiement').update({
      statut, valide_par: userData?.user?.email || null, valide_le: new Date().toISOString(),
    }).eq('id', preuve.id)
    load()
  }

  const viewPreuve = async preuve => {
    const { data } = await supabase.storage.from('preuves-paiement').createSignedUrl(preuve.storage_path, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noreferrer')
  }

  if (loading) return <div style={{ padding: '0 28px 8px', fontSize: 12, color: '#94a3b8' }}>Chargement de l'espace personnel...</div>

  return (
    <div style={{ padding: '0 28px 8px', borderTop: '1px solid #f1f5f9', marginTop: 4 }}>

      {/* Badge QR — token a coller dans Canva pour composer le visuel du badge */}
      {badgeToken && (
        <div style={{ marginTop: 20 }}>
          <div style={EXTRAS_LABEL}>Badge — QR code (a integrer dans Canva)</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {badgeQr && (
              <img src={badgeQr} alt="QR code badge" style={{ width: 96, height: 96, borderRadius: 10, border: '1.5px solid #e2e8f0', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ ...EXTRAS_ROW, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#0f172a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {badgeToken}
                </span>
                <button type="button" onClick={copyToken} title="Copier le token" style={EXTRAS_ICONBTN}>
                  <Icon name={tokenCopied ? 'check' : 'copy'} size={13} color={tokenCopied ? '#059669' : '#64748b'} />
                </button>
              </div>
              <button type="button" onClick={downloadBadgeQr} disabled={!badgeQr} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10,
                fontSize: 12, fontWeight: 600, color: '#64748b', cursor: badgeQr ? 'pointer' : 'not-allowed',
                background: '#fff', width: '100%', boxSizing: 'border-box',
              }}>
                <Icon name="download" size={13} color="#64748b" />
                Télécharger le QR (PNG)
              </button>
              <button type="button" onClick={() => toggleArrivee(null, arrived)} disabled={togglingArrivee === 'principal'} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 12px', border: 'none', borderRadius: 10, marginTop: 6,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%', boxSizing: 'border-box',
                color: arrived ? '#065f46' : '#fff', background: arrived ? '#d1fae5' : '#000E91',
              }}>
                <Icon name={arrived ? 'check' : 'users'} size={13} color={arrived ? '#065f46' : '#fff'} />
                {arrived
                  ? `Arrivé${arrivedAt ? ` à ${fmtTime(arrivedAt)}` : ''} — marquer non arrivé`
                  : 'Marquer arrivé et installé'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Membres de la delegation (inscription groupee, ex. plusieurs
          personnes sous un seul paiement) — chacun a son propre badge/QR
          et son propre pointage, independant du contact principal ci-dessus. */}
      {membres.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={EXTRAS_LABEL}>Membres de la délégation ({membres.length})</div>
          {membres.map(m => (
            <div key={m.id} style={{ ...EXTRAS_ROW, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 700, flex: 1, minWidth: 140 }}>
                {m.prenom} {m.nom}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{m.poste} · {m.dossier}</span>
              </span>
              <a href={`https://copaf-ports.com/badge/${m.badge_token}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: '#0073F4', textDecoration: 'none' }}>
                Voir le badge
              </a>
              <button type="button" onClick={() => toggleArrivee(m.id, m.arrived)} disabled={togglingArrivee === m.id} style={{
                border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                color: m.arrived ? '#065f46' : '#92400e', background: m.arrived ? '#d1fae5' : '#fef3c7',
              }}>
                {m.arrived ? `Arrivé${m.arrived_at ? ` ${fmtTime(m.arrived_at)}` : ''}` : 'Non arrivé'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Documents */}
      <div style={{ marginTop: 20 }}>
        <div style={EXTRAS_LABEL}>Documents deposes (visibles dans l'espace participant)</div>
        {docs.map(doc => (
          <div key={doc.id} style={EXTRAS_ROW}>
            <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 600, textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.label}
            </a>
            <button type="button" onClick={() => toggleDocVisible(doc)} title={doc.visible ? 'Masquer' : 'Rendre visible'} style={EXTRAS_ICONBTN}>
              <Icon name={doc.visible ? 'eye' : 'eyeOff'} size={13} color={doc.visible ? '#059669' : '#94a3b8'} />
            </button>
            <button type="button" onClick={() => deleteDoc(doc)} title="Supprimer" style={EXTRAS_ICONBTN}>
              <Icon name="trash" size={13} color="#ef4444" />
            </button>
          </div>
        ))}
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '9px 12px', border: '1.5px dashed #cbd5e1', borderRadius: 10,
          fontSize: 12, fontWeight: 600, color: '#64748b', cursor: uploading ? 'not-allowed' : 'pointer', marginTop: 4,
        }}>
          <Icon name="upload" size={13} color="#64748b" />
          {uploading ? 'Envoi en cours...' : 'Deposer un document (badge, attestation...)'}
          <input ref={fileRef} type="file" onChange={uploadDoc} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Agenda personnalise (libre-service cote participant, lecture seule ici) */}
      {agenda.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={EXTRAS_LABEL}>Agenda du participant (construit en libre-service, lecture seule)</div>
          {agenda.map(item => (
            <div key={item.id} style={EXTRAS_ROW}>
              <span style={{ fontSize: 12.5, color: '#0f172a', flex: 1 }}>
                <strong>{item.jour}</strong> · {item.heure} — {item.titre}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Preuves de virement */}
      {preuves.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={EXTRAS_LABEL}>Preuves de virement</div>
          {preuves.map(preuve => {
            const cfg = PREUVE_STATUT_COLOR[preuve.statut] || PREUVE_STATUT_COLOR.en_attente
            return (
              <div key={preuve.id} style={{ ...EXTRAS_ROW, flexWrap: 'wrap' }}>
                <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                  {PREUVE_STATUT_LABEL[preuve.statut] || preuve.statut}
                </span>
                <button type="button" onClick={() => viewPreuve(preuve)} style={{ background: 'none', border: 'none', color: '#0073F4', fontWeight: 700, fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  Voir le fichier
                </button>
                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                  <button type="button" onClick={() => setPreuveStatut(preuve, 'validee')} title="Valider" style={EXTRAS_ICONBTN}>
                    <Icon name="check" size={13} color="#059669" />
                  </button>
                  <button type="button" onClick={() => setPreuveStatut(preuve, 'rejetee')} title="Rejeter" style={EXTRAS_ICONBTN}>
                    <Icon name="trash" size={13} color="#ef4444" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Infos importantes specifiques a ce dossier */}
      <div style={{ margin: '20px 0 4px' }}>
        <div style={EXTRAS_LABEL}>Infos importantes propres a ce dossier</div>
        {infos.map(info => (
          <div key={info.id} style={EXTRAS_ROW}>
            <span style={{ fontSize: 12.5, color: '#0f172a', flex: 1 }}>{info.contenu}</span>
            <button type="button" onClick={() => deleteInfo(info)} title="Supprimer" style={EXTRAS_ICONBTN}>
              <Icon name="trash" size={13} color="#ef4444" />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6 }}>
          <input placeholder="Ex : merci de finaliser votre virement avant le..." value={newInfo} onChange={e => setNewInfo(e.target.value)} style={EXTRAS_INPUT} />
          <button type="button" onClick={addInfo} style={EXTRAS_ICONBTN}><Icon name="plus" size={14} color="#0f172a" /></button>
        </div>
      </div>
    </div>
  )
}

// ─── MODAL PARTICIPANT ────────────────────────────────────────────────────────
function ModalParticipant({ row, onClose, onUpdate }) {
  const [status,     setStatus]     = useState(row.paiement_status || 'en_attente')
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [toast,      setToast]      = useState('')
  const [genBadge,   setGenBadge]   = useState(false)

  const t = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('inscriptions').update({ paiement_status: status }).eq('id', row.id)
    setSaving(false)
    if (!error) {
      const wasConfirmed = row.paiement_status === 'confirme'
      const updated = { ...row, paiement_status: status }
      onUpdate(updated)
      if (status === 'confirme' && !wasConfirmed) {
        t('Statut confirmé — génération du badge...')
        setGenBadge(true)
        try {
          await generateBadge({
            nomPrenom: `${updated.contacts?.prenom || ''} ${updated.contacts?.nom || ''}`.trim(),
            fonction: updated.contacts?.pays || '',
            dossier: updated.dossier || updated.id,
            photoSrc: updated.photo_url || undefined,
          })
        } catch (e) { console.error(e) }
        setGenBadge(false)
      } else {
        t('Statut mis a jour avec succes')
      }
    }
    else t('Erreur : ' + error.message)
  }

  const del = async () => {
    if (!confirmDel) { setConfirmDel(true); return }
    setDeleting(true)
    const { error } = await supabase.from('inscriptions').delete().eq('id', row.id)
    setDeleting(false)
    if (!error) { onUpdate(null); onClose() }
    else t('Erreur suppression')
  }

  const downloadBadge = async () => {
    setGenBadge(true)
    try {
      await generateBadge({
        nomPrenom: `${row.contacts?.prenom || ''} ${row.contacts?.nom || ''}`.trim(),
        fonction: row.contacts?.pays || '',
        dossier: row.dossier || row.id,
        photoSrc: row.photo_url || undefined,
      })
    }
    catch (e) { t('Erreur génération badge : ' + e.message) }
    setGenBadge(false)
  }

  return (
    <Modal
      title={`${row.prenom || ''} ${row.nom || ''}`}
      subtitle={`${row.dossier || '—'} · ${row.organisation || ''}`}
      accentColor="#6366f1"
      fields={[
        { label: 'Email',        value: row.email },
        { label: 'Telephone',    value: row.telephone },
        { label: 'Poste',        value: row.poste },
        { label: 'Pays',         value: row.pays },
        { label: 'Participants', value: `${row.participants || 1} personne(s)` },
        { label: 'Montant',      value: fmtEur(row.montant) },
        { label: 'Mode paiement',value: row.paiement_mode === 'maintenant' ? 'Paiement immediat' : 'Reservation differee' },
        { label: 'Date',         value: `${fmtDate(row.created_at)} ${fmtTime(row.created_at)}` },
        { label: 'Message',      value: row.message, full: true },
      ]}
      status={status} onStatusChange={setStatus}
      onSave={save} saving={saving}
      onDelete={del} deleting={deleting}
      confirmDel={confirmDel} setConfirmDel={setConfirmDel}
      onClose={onClose} toast={toast}
      onDownloadBadge={status === 'confirme' ? downloadBadge : null}
      generatingBadge={genBadge}
    >
      {row.dossier && (
        <DossierExtras
          dossier={row.dossier} badgeToken={row.badge_token} inscriptionId={row.id}
          arrived={row.arrived} arrivedAt={row.arrived_at}
          onArrivedChange={patch => onUpdate({ ...row, ...patch })}
        />
      )}
    </Modal>
  )
}

// ─── MODAL SPONSORSHIP (sponsor + partenaire) ─────────────────────────────────
function ModalSponsorship({ row, onClose, onUpdate, type }) {
  const [status,  setStatus]  = useState(row.statut || 'nouveau')
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState('')
  const t = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('sponsorships').update({ statut: status }).eq('id', row.id)
    setSaving(false)
    if (!error) { onUpdate({ ...row, statut: status }); t('Statut mis a jour') }
    else t('Erreur : ' + error.message)
  }

  const isStrat = type === 'partenaires'
  const accentColor = isStrat ? '#000E91' : '#d97706'

  return (
    <Modal
      title={row.organisation || row['contacts']?.organisation || '—'}
      subtitle={`${isStrat ? 'Partenaire' : 'Sponsor'} ${row.niveau || ''}${row.montant ? ' · ' + fmtEur(row.montant) : ''}`}
      accentColor={accentColor}
      fields={[
        { label: 'Contact',          value: row['contacts']?.nom || row.contact },
        { label: 'Email',            value: row['contacts']?.email || row.email },
        { label: 'Telephone',        value: row['contacts']?.telephone || row.telephone },
        { label: 'Pays',             value: row['contacts']?.pays || row.pays },
        { label: 'Niveau',           value: row.niveau },
        { label: 'Montant',          value: row.montant ? fmtEur(row.montant) : '—' },
        ...(isStrat ? [{ label: 'Type institution', value: row.type_institution }] : []),
        { label: 'Date',             value: fmtDate(row.created_at) },
        { label: 'Message',          value: row.message, full: true },
      ]}
      status={status} onStatusChange={setStatus}
      onSave={save} saving={saving}
      onClose={onClose} toast={toast}
    />
  )
}

// ─── MODAL EXPOSANT ───────────────────────────────────────────────────────────
function ModalExposant({ row, onClose, onUpdate }) {
  const [status, setStatus] = useState(row.statut || 'nouveau')
  const [saving, setSaving] = useState(false)
  const [toast,  setToast]  = useState('')
  const t = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('exposants').update({ statut: status }).eq('id', row.id)
    setSaving(false)
    if (!error) { onUpdate({ ...row, statut: status }); t('Statut mis a jour') }
    else t('Erreur : ' + error.message)
  }

  return (
    <Modal
      title={row.entreprise || '—'}
      subtitle={`Exposition ${row.forfait || ''}`}
      accentColor="#0891b2"
      fields={[
        { label: 'Contact',  value: row['contacts']?.nom },
        { label: 'Email',    value: row['contacts']?.email },
        { label: 'Telephone',value: row['contacts']?.telephone },
        { label: 'Secteur',  value: row.secteur },
        { label: 'Forfait',  value: row.forfait },
        { label: 'Date',     value: fmtDate(row.created_at) },
        { label: 'Objectifs',value: row.goals, full: true },
      ]}
      status={status} onStatusChange={setStatus}
      onSave={save} saving={saving}
      onClose={onClose} toast={toast}
    />
  )
}

// ─── TABLE GÉNÉRIQUE ──────────────────────────────────────────────────────────
function DataTable({ cols, rows, onRow }) {
  if (rows.length === 0) return (
    <div style={{ ...CARD_STYLE, padding: 60, textAlign: 'center' }}>
      <Icon name="filter" size={32} color="#cbd5e1" />
      <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>Aucun enregistrement trouvé</div>
    </div>
  )

  return (
    <div style={{ ...CARD_STYLE, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #f1f5f9', background: '#f8fafc' }}>
            {cols.map((c, i) => (
              <th key={i} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 10, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id || i}
              onClick={() => onRow(r)}
              style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {cols.map((c, j) => (
                <td key={j} style={{ padding: '14px 18px', color: c.muted ? '#94a3b8' : '#334155', whiteSpace: c.wrap ? 'normal' : 'nowrap', maxWidth: c.maxW || 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.render ? c.render(r[c.key], r) : (r[c.key] || '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── BARRE D'OUTILS ──────────────────────────────────────────────────────────
function Toolbar({ search, setSearch, filterStatus, setFilterStatus, onExport, onSync, syncing, syncOk, placeholder }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
      {/* Recherche */}
      <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Icon name="search" size={16} color="#94a3b8" />
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={placeholder || 'Rechercher...'}
          style={{
            width: '100%', padding: '11px 14px 11px 40px',
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12,
            fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0f172a', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filtre statut */}
      <select
        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        style={{ padding: '11px 14px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', cursor: 'pointer', color: '#475569', fontFamily: 'inherit' }}
      >
        <option value="tous">Tous les statuts</option>
        {Object.entries(STATUS_CONFIG).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
      </select>

      {/* Export CSV */}
      <button onClick={onExport} style={{ padding: '11px 16px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, color: '#475569', fontFamily: 'inherit', transition: 'all .15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0073F4'; e.currentTarget.style.color = '#0073F4' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}>
        <Icon name="download" size={15} color="currentColor" />
        Exporter CSV
      </button>

      {/* Sync Google Sheets */}
      <button onClick={onSync} disabled={syncing} style={{
        padding: '11px 16px',
        background: syncOk ? '#d1fae5' : '#000E91',
        border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700,
        cursor: syncing ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 7,
        color: syncOk ? '#065f46' : '#fff',
        fontFamily: 'inherit', transition: 'all .2s', opacity: syncing ? .7 : 1,
      }}>
        <Icon name={syncOk ? 'check' : 'sheet'} size={15} color={syncOk ? '#065f46' : '#fff'} />
        {syncing ? 'Synchronisation...' : syncOk ? 'Google Sheets OK' : 'Sync Google Sheets'}
      </button>
    </div>
  )
}

// ─── INFOS IMPORTANTES GENERALES (dossier = null, visibles pour tous les participants) ──
function InfosGeneralesPanel() {
  const [open,  setOpen]  = useState(false)
  const [infos, setInfos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [newInfo, setNewInfo] = useState('')

  const load = async () => {
    const { data } = await supabase.from('infos_importantes').select('*').is('dossier', null).order('created_at', { ascending: false })
    setInfos(data || [])
    setLoaded(true)
  }

  useEffect(() => { if (open && !loaded) load() }, [open, loaded])

  const addInfo = async () => {
    if (!newInfo.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('infos_importantes').insert({ dossier: null, contenu: newInfo.trim(), updated_par: userData?.user?.email || null })
    setNewInfo('')
    load()
  }

  const deleteInfo = async info => {
    await supabase.from('infos_importantes').delete().eq('id', info.id)
    load()
  }

  return (
    <div style={{ ...CARD_STYLE, padding: 18, marginBottom: 20 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        all: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', cursor: 'pointer', boxSizing: 'border-box',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
          <Icon name="mail" size={16} color="#0073F4" />
          Infos importantes générales (visibles dans l'espace de tous les participants)
        </span>
        <Icon name={open ? 'close' : 'menu'} size={14} color="#94a3b8" />
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          {infos.map(info => (
            <div key={info.id} style={EXTRAS_ROW}>
              <span style={{ fontSize: 12.5, color: '#0f172a', flex: 1 }}>{info.contenu}</span>
              <button type="button" onClick={() => deleteInfo(info)} title="Supprimer" style={EXTRAS_ICONBTN}>
                <Icon name="trash" size={13} color="#ef4444" />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6 }}>
            <input placeholder="Ex : le dress code est business formal..." value={newInfo} onChange={e => setNewInfo(e.target.value)} style={EXTRAS_INPUT} />
            <button type="button" onClick={addInfo} style={EXTRAS_ICONBTN}><Icon name="plus" size={14} color="#0f172a" /></button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SECTION PARTICIPANTS ─────────────────────────────────────────────────────
function SectionParticipants({ data, membres = [], setData }) {
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('tous')
  const [selected,      setSelected]      = useState(null)
  const [syncing,       setSyncing]       = useState(false)
  const [syncOk,        setSyncOk]        = useState(false)

  const total       = data.length
  const totalParts  = data.reduce((s, r) => s + (r.participants || 0), 0)
  const totalMontant= data.reduce((s, r) => s + (r.montant || 0), 0)
  const confirmes   = data.filter(r => r.paiement_status === 'confirme').length
  const enAttente   = data.filter(r => ['en_attente', 'reserve'].includes(r.paiement_status)).length
  const arrives     = data.filter(r => r.arrived).length + membres.filter(m => m.arrived).length

  // Les membres de delegation (inscription_participants) n'ont pas leur
  // propre ligne financiere -- on les affiche quand meme dans le tableau,
  // en heritant organisation/pays/statut de paiement de leur inscription
  // parente, pour que chaque personne individuelle (pas seulement le
  // contact principal du groupe) soit visible et cliquable.
  const combinedRows = useMemo(() => {
    const byId = new Map(data.map(r => [r.id, r]))
    const memberRows = membres.map(m => {
      const parent = byId.get(m.inscription_id)
      return {
        id: `membre-${m.id}`,
        _isMember: true,
        dossier: m.dossier,
        badge_token: m.badge_token,
        participants: 1,
        montant: null,
        paiement_status: parent?.paiement_status,
        paiement_mode: parent?.paiement_mode,
        created_at: parent?.created_at,
        arrived: m.arrived,
        arrived_at: m.arrived_at,
        contacts: {
          prenom: m.prenom, nom: m.nom, poste: m.poste, email: m.email, telephone: m.telephone,
          organisation: parent?.contacts?.organisation, pays: parent?.contacts?.pays,
        },
      }
    })
    return [...data, ...memberRows]
  }, [data, membres])

  const filtered = useMemo(() => combinedRows.filter(r => {
    const s   = search.toLowerCase()
    const ok  = [r.contacts?.nom, r.contacts?.prenom, r.contacts?.email, r.contacts?.organisation, r.contacts?.pays, r.dossier].some(v => (v || '').toLowerCase().includes(s))
    const st  = filterStatus === 'tous' || r.paiement_status === filterStatus
    return ok && st
  }), [combinedRows, search, filterStatus])

  const CSV_COLS = [
    { label: 'Dossier',         key: 'dossier' },
    { label: 'Nom',             key: 'nom' },
    { label: 'Prenom',          key: 'prenom' },
    { label: 'Email',           key: 'email' },
    { label: 'Telephone',       key: 'telephone' },
    { label: 'Organisation',    key: 'organisation' },
    { label: 'Poste',           key: 'poste' },
    { label: 'Pays',            key: 'pays' },
    { label: 'Participants',    key: 'participants' },
    { label: 'Montant',         key: 'montant' },
    { label: 'Statut',          key: 'paiement_status' },
    { label: 'Mode paiement',   key: 'paiement_mode' },
    { label: 'Date',            key: 'created_at' },
    { label: 'Message',         key: 'message' },
  ]

  const doSync = async () => {
    setSyncing(true)
    try {
      const rows = filtered.map(r => [
        r.dossier,
        r.contacts?.prenom || '', r.contacts?.nom || '',
        r.contacts?.email || '', r.contacts?.telephone || '',
        r.contacts?.organisation || '', r.contacts?.poste || '', r.contacts?.pays || '',
        r.participants, r.montant, r.paiement_status, r.paiement_mode,
        r.message, fmtDate(r.created_at),
      ])
      await syncToSheets('sync_inscriptions', { rows })
      setSyncOk(true)
      setTimeout(() => setSyncOk(false), 4000)
    } catch (err) { alert(err.message) }
    setSyncing(false)
  }

  const TABLE_COLS = [
    { key: 'dossier',         label: 'Dossier',       render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6366f1', fontWeight: 600, background: '#eef2ff', padding: '2px 8px', borderRadius: 6 }}>{v || '—'}</span> },
    { key: 'nom',             label: 'Nom & Prenom',  render: (v, r) => <div>
      <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
        {r.contacts?.prenom} {r.contacts?.nom}
        {r._isMember && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', borderRadius: 20, padding: '1px 7px', textTransform: 'uppercase', letterSpacing: .3 }}>Délégation</span>}
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{r.contacts?.poste || '—'}</div>
    </div> },
    { key: 'organisation',    label: 'Organisation',  muted: true, maxW: 180, render: (v, r) => r.contacts?.organisation || '—' },
    { key: 'pays',            label: 'Pays',          render: (v, r) => <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px', fontSize: 11 }}>{r.contacts?.pays || '—'}</span> },
    { key: 'participants',    label: 'Pers.',         render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { key: 'montant',         label: 'Montant',       render: (v, r) => r._isMember
      ? <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Partagé</span>
      : <span style={{ fontWeight: 800, color: '#d97706' }}>{fmtEur(v)}</span> },
    { key: 'paiement_status', label: 'Statut',        render: v => <StatusBadge status={v} /> },
    { key: 'arrived',         label: 'Présence',      render: (v, r) => v
      ? <span style={{ background: '#d1fae5', color: '#065f46', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Arrivé{r.arrived_at ? ` ${fmtTime(r.arrived_at)}` : ''}</span>
      : <span style={{ background: '#f1f5f9', color: '#94a3b8', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Non arrivé</span> },
    { key: 'created_at',      label: 'Date',          render: v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{fmtDate(v)}</span> },
  ]

  return (
    <div>
      <InfosGeneralesPanel />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard icon="users"  label="Dossiers"    value={total}           color="#6366f1" />
        <KpiCard icon="chart"  label="Participants" value={totalParts}      color="#8b5cf6" />
        <KpiCard icon="euro"   label="Revenus"      value={fmtEur(totalMontant)} color="#d97706" />
        <KpiCard icon="check"  label="Confirmes"    value={confirmes}       color="#10b981" sub={`${Math.round((confirmes/total||0)*100)}% de conversion`} />
        <KpiCard icon="clock"  label="En attente"   value={enAttente}       color="#2563eb" />
        <KpiCard icon="search" label="Arrivés"      value={arrives}         color="#0891b2" sub="Contacts principaux — voir la fiche pour les délégations" />
      </div>

      <Toolbar
        search={search} setSearch={setSearch}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        onExport={() => {
          const flat = filtered.map(r => ({
            ...r,
            nom: r.contacts?.nom, prenom: r.contacts?.prenom, email: r.contacts?.email,
            telephone: r.contacts?.telephone, organisation: r.contacts?.organisation,
            poste: r.contacts?.poste, pays: r.contacts?.pays,
          }))
          exportCSV(flat, CSV_COLS, `COPAF_participants_${new Date().toISOString().slice(0,10)}.csv`)
        }}
        onSync={doSync} syncing={syncing} syncOk={syncOk}
        placeholder="Rechercher par nom, email, dossier, pays..."
      />

      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
        {filtered.length} enregistrement{filtered.length > 1 ? 's' : ''} affiches
      </div>

      <DataTable cols={TABLE_COLS} rows={filtered} onRow={r => r._isMember ? window.open(`https://copaf-ports.com/badge/${r.badge_token}`, '_blank') : setSelected(r)} />

      {selected && (
        <ModalParticipant
          row={selected}
          onClose={() => setSelected(null)}
          onUpdate={updated => {
            if (!updated) setData(prev => prev.filter(r => r.id !== selected.id))
            else { setData(prev => prev.map(r => r.id === updated.id ? updated : r)); setSelected(updated) }
          }}
        />
      )}
    </div>
  )
}

// ─── SECTION GÉNÉRIQUE (Sponsors, Partenaires, Exposants) ────────────────────
function SectionGeneric({ data, setData, moduleId, accentColor }) {
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('tous')
  const [selected,     setSelected]     = useState(null)
  const [syncing,      setSyncing]      = useState(false)
  const [syncOk,       setSyncOk]       = useState(false)

  const filtered = useMemo(() => data.filter(r => {
    const s  = search.toLowerCase()
    const ok = [r.organisation, r.contact, r.email, r.pays, r.niveau, r.forfait, r.entreprise,
                r['contacts']?.nom, r['contacts']?.email, r['contacts']?.organisation]
               .some(v => (v || '').toLowerCase().includes(s))
    const sf = r.statut || 'nouveau'
    const st = filterStatus === 'tous' || sf === filterStatus
    return ok && st
  }), [data, search, filterStatus])

  // Colonnes selon le module
  const getCols = () => {
    if (moduleId === 'sponsors' || moduleId === 'partenaires') return [
      { key: 'organisation', label: 'Organisation', render: (v, r) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{r['contacts']?.organisation || v || '—'}</span> },
      { key: 'niveau',       label: 'Niveau',       render: v => <span style={{ color: accentColor, fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>{v || '—'}</span> },
      { key: 'contact',      label: 'Contact',      render: (v, r) => r['contacts']?.nom || v || '—', muted: true },
      { key: 'email',        label: 'Email',        render: (v, r) => <span style={{ fontSize: 12, color: '#64748b' }}>{r['contacts']?.email || v || '—'}</span> },
      { key: 'montant',      label: 'Montant',      render: v => v ? <span style={{ fontWeight: 800, color: '#d97706' }}>{fmtEur(v)}</span> : '—' },
      { key: 'statut',       label: 'Statut',       render: v => <StatusBadge status={v || 'nouveau'} /> },
      { key: 'created_at',   label: 'Date',         render: v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{fmtDate(v)}</span> },
    ]
    // Exposants
    return [
      { key: 'entreprise', label: 'Entreprise',  render: v => <span style={{ fontWeight: 700, color: '#0f172a' }}>{v || '—'}</span> },
      { key: 'forfait',    label: 'Forfait',     render: v => <span style={{ color: accentColor, fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>{v || '—'}</span> },
      { key: 'secteur',    label: 'Secteur',     muted: true },
      { key: 'contact',    label: 'Contact',     render: (v, r) => r['contacts']?.nom || v || '—', muted: true },
      { key: 'email',      label: 'Email',       render: (v, r) => <span style={{ fontSize: 12, color: '#64748b' }}>{r['contacts']?.email || v || '—'}</span> },
      { key: 'statut',     label: 'Statut',      render: v => <StatusBadge status={v || 'nouveau'} /> },
      { key: 'created_at', label: 'Date',        render: v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{fmtDate(v)}</span> },
    ]
  }

  const getSheetAction = () => {
    if (moduleId === 'sponsors')    return 'sync_sponsors'
    if (moduleId === 'partenaires') return 'sync_partenaires'
    return 'sync_exposants'
  }

  const buildSheetRows = () => {
    if (moduleId === 'sponsors' || moduleId === 'partenaires') {
      return filtered.map(r => [
        r.id, r['contacts']?.organisation || r.organisation,
        r['contacts']?.nom, r['contacts']?.email, r['contacts']?.telephone,
        r['contacts']?.pays, r.niveau, r.montant,
        r.statut || 'nouveau', r.message, fmtDate(r.created_at),
      ])
    }
    return filtered.map(r => [
      r.id, r.entreprise, r.secteur,
      r['contacts']?.nom, r['contacts']?.email, r['contacts']?.telephone,
      r.forfait, r.statut || 'nouveau', r.goals, fmtDate(r.created_at),
    ])
  }

  const doSync = async () => {
    setSyncing(true)
    try {
      await syncToSheets(getSheetAction(), { rows: buildSheetRows() })
      setSyncOk(true)
      setTimeout(() => setSyncOk(false), 4000)
    } catch (err) { alert(err.message) }
    setSyncing(false)
  }

  const kpis = {
    sponsors:    [
      { icon: 'diamond',  label: 'Total Sponsors',  value: data.length,                                        color: '#d97706' },
      { icon: 'check',    label: 'Confirmes',        value: data.filter(r => r.statut === 'confirme').length,   color: '#10b981' },
      { icon: 'clock',    label: 'Nouveaux',         value: data.filter(r => !r.statut || r.statut === 'nouveau').length, color: '#6366f1' },
      { icon: 'euro',     label: 'Valeur estimee',   value: fmtEur(data.reduce((s, r) => s + (r.montant || 0), 0)), color: '#0073F4' },
    ],
    partenaires: [
      { icon: 'building', label: 'Partenaires',      value: data.length,                                        color: '#000E91' },
      { icon: 'check',    label: 'Confirmes',        value: data.filter(r => r.statut === 'confirme').length,   color: '#10b981' },
      { icon: 'clock',    label: 'En attente',       value: data.filter(r => r.statut === 'en_attente').length, color: '#d97706' },
      { icon: 'euro',     label: 'Valeur estimee',   value: fmtEur(data.reduce((s, r) => s + (r.montant || 0), 0)), color: '#0073F4' },
    ],
    exposants:   [
      { icon: 'monitor',  label: 'Total Exposants',  value: data.length,                                        color: '#0891b2' },
      { icon: 'check',    label: 'Confirmes',        value: data.filter(r => r.statut === 'confirme').length,   color: '#10b981' },
      { icon: 'clock',    label: 'Nouveaux',         value: data.filter(r => !r.statut || r.statut === 'nouveau').length, color: '#6366f1' },
    ],
  }

  const renderModal = r => {
    if (moduleId === 'exposants') return (
      <ModalExposant row={r} onClose={() => setSelected(null)}
        onUpdate={u => { setData(prev => prev.map(x => x.id === u.id ? u : x)); setSelected(u) }} />
    )
    return (
      <ModalSponsorship row={r} type={moduleId} onClose={() => setSelected(null)}
        onUpdate={u => { setData(prev => prev.map(x => x.id === u.id ? u : x)); setSelected(u) }} />
    )
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
        {(kpis[moduleId] || []).map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      <Toolbar
        search={search} setSearch={setSearch}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        onExport={() => exportCSV(filtered, getCols().map(c => ({ label: c.label, key: c.key })), `COPAF_${moduleId}_${new Date().toISOString().slice(0,10)}.csv`)}
        onSync={doSync} syncing={syncing} syncOk={syncOk}
        placeholder={`Rechercher dans ${moduleId}...`}
      />

      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
        {filtered.length} enregistrement{filtered.length > 1 ? 's' : ''} affiches
      </div>

      <DataTable cols={getCols()} rows={filtered} onRow={setSelected} />
      {selected && renderModal(selected)}
    </div>
  )
}

// ─── SECTION TABLEAU DE BORD ──────────────────────────────────────────────────
function SectionDashboard({ allData }) {
  const { inscriptions = [], sponsors = [], partenaires = [], exposants = [] } = allData

  const totalRevenu  = inscriptions.reduce((s, r) => s + (r.montant || 0), 0)
    + sponsors.reduce((s, r) => s + (r.montant || 0), 0)
    + partenaires.reduce((s, r) => s + (r.montant || 0), 0)
  const confirmes    = inscriptions.filter(r => r.paiement_status === 'confirme').length

  // Top pays
  const paysMap = {}
  inscriptions.forEach(r => { if (r.pays) paysMap[r.pays] = (paysMap[r.pays] || 0) + 1 })
  const topPays = Object.entries(paysMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxPays = topPays[0]?.[1] || 1

  // Inscriptions 14 derniers jours
  const dayMap = {}
  inscriptions.forEach(r => {
    const d = fmtDate(r.created_at)
    dayMap[d] = (dayMap[d] || 0) + 1
  })
  const dailyEntries = Object.entries(dayMap).slice(-14)
  const dailyChartData = dailyEntries.map(([label, val]) => ({ name: label, value: val }))

  // Statuts inscriptions
  const statutsInsc = Object.entries(STATUS_CONFIG).map(([k, s]) => ({
    label: s.label, color: s.dot,
    value: inscriptions.filter(r => r.paiement_status === k).length,
  }))

  return (
    <div>
      {/* KPIs globaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard icon="users"    label="Participants" value={inscriptions.reduce((s, r) => s + (r.participants || 0), 0)} color="#6366f1" sub={`${inscriptions.length} dossiers`} />
        <KpiCard icon="euro"     label="Revenus totaux" value={fmtEur(totalRevenu)} color="#10b981" />
        <KpiCard icon="check"    label="Confirmes"    value={confirmes} color="#10b981" sub={`${Math.round((confirmes / (inscriptions.length || 1)) * 100)}% conv.`} />
        <KpiCard icon="diamond"  label="Sponsors"     value={sponsors.length} color="#d97706" />
        <KpiCard icon="building" label="Partenaires"  value={partenaires.length} color="#000E91" />
        <KpiCard icon="monitor"  label="Exposants"    value={exposants.length} color="#0891b2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Inscriptions par jour */}
        <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>Inscriptions par jour</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>14 derniers jours</div>
          {dailyChartData.length === 0 ? (
            <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>Aucune donnee</div>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={dailyChartData} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0073F4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0073F4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={26} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} />
                <Area type="monotone" dataKey="value" name="Inscriptions" stroke="#0073F4" strokeWidth={2.5} fill="url(#dailyFill)" activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top pays */}
        <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>Top pays</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Par nombre de dossiers</div>
          {topPays.length === 0
            ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucune donnee</div>
            : topPays.map(([pays, nb], i) => <BarRow key={i} label={pays} value={nb} max={maxPays} color={['#6366f1','#0073F4','#000E91','#10b981','#d97706','#0891b2'][i % 6]} />)
          }
        </div>
      </div>

      {/* Statuts inscriptions */}
      <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 20 }}>Repartition des statuts — Inscriptions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {statutsInsc.map((s, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e8edf5', borderRadius: 14, padding: '16px 20px', minWidth: 110, textAlign: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── SECTION ANALYTICS (façon Google Analytics) ───────────────────────────────
const AUTO_REFRESH_MS   = 15000  // 15 secondes
const ACTIVE_WINDOW_MIN = 5      // fenêtre "actifs maintenant"
const ANALYTICS_LOOKBACK_DAYS = 30

function SectionAnalytics() {
  const [sessions,     setSessions]     = useState([])
  const [pageViews,    setPageViews]    = useState([])
  const [topPages,     setTopPages]     = useState([])
  const [funnel,       setFunnel]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [lastLoad,     setLastLoad]     = useState(null)
  const [syncing,      setSyncing]      = useState(false)
  const [syncOk,       setSyncOk]       = useState(false)
  const [clearing,     setClearing]     = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * ANALYTICS_LOOKBACK_DAYS).toISOString()
    const [
      { data: sess },
      { data: pv },
      { data: tp },
      { data: fn },
    ] = await Promise.all([
      supabase.from('sessions').select('*').gte('started_at', since).order('started_at', { ascending: false }).limit(1000),
      supabase.from('page_views').select('*').gte('viewed_at', since).order('viewed_at', { ascending: false }).limit(2000),
      supabase.from('v_top_pages').select('*').order('visites', { ascending: false }),
      supabase.from('v_funnel').select('*').order('ordre', { ascending: true }),
    ])
    setSessions(sess || [])
    setPageViews(pv || [])
    setTopPages(tp || [])
    setFunnel(fn || [])
    setLastLoad(new Date())
    setLoading(false)
  }, [])

  // Chargement initial + auto-refresh
  useEffect(() => {
    load()
    const interval = setInterval(load, AUTO_REFRESH_MS)
    return () => clearInterval(interval)
  }, [load])

  // Utilisateurs actifs (fenêtre glissante de X minutes, calculée côté client)
  const activeNow = useMemo(() => {
    const cutoff = Date.now() - ACTIVE_WINDOW_MIN * 60 * 1000
    const ids = new Set(
      pageViews.filter(p => new Date(p.viewed_at).getTime() > cutoff).map(p => p.session_id)
    )
    return ids.size
  }, [pageViews])

  const totalSessions  = sessions.length
  const totalPageViews = pageViews.length
  const totalVisites   = funnel.find(f => f.etape === 'Visites')?.nb || 0
  const totalConfirmes = funnel.find(f => f.etape === 'Confirmés')?.nb || 0
  const tauxConv        = totalVisites > 0 ? Math.round((totalConfirmes / totalVisites) * 100) : 0

  // Répartition appareils
  const deviceEntries = useMemo(() => {
    const m = {}
    sessions.forEach(s => { const d = parseDevice(s.user_agent); m[d] = (m[d] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [sessions])
  const maxDevice = deviceEntries[0]?.[1] || 1

  // Répartition sources / referrers — priorite au parametre UTM (fiable,
  // survit au nettoyage du referrer par LinkedIn) avant de retomber sur le
  // referrer brut si aucun UTM n'est present sur la visite.
  const sourceEntries = useMemo(() => {
    const m = {}
    const utmLabel = {
      linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
      whatsapp: 'WhatsApp', email: 'Email', newsletter: 'Newsletter',
    }
    pageViews.forEach(p => {
      const s = p.utm_source
        ? (utmLabel[p.utm_source.toLowerCase()] || p.utm_source)
        : parseSource(p.referrer)
      m[s] = (m[s] || 0) + 1
    })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [pageViews])
  const maxSource = sourceEntries[0]?.[1] || 1

  // Répartition pays
  const countryEntries = useMemo(() => {
    const m = {}
    sessions.forEach(s => { if (s.country) m[s.country] = (m[s.country] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [sessions])
  const maxCountry = countryEntries[0]?.[1] || 1

  const maxTopPage = topPages[0]?.visites || 1
  const maxFunnel  = funnel[0]?.nb || 1

  // ── Sync vers Google Sheets ──
  // NB: nécessite d'ajouter un cas 'sync_analytics' côté Google Apps Script
  const doSync = async () => {
    setSyncing(true)
    try {
      const rows = topPages.map(p => [
        p.path, p.visites, p.sessions_uniques, Math.round(p.temps_moyen_sec || 0),
      ])
      await syncToSheets('sync_analytics', {
        rows,
        summary: [totalSessions, totalPageViews, activeNow, tauxConv],
        generated_at: new Date().toISOString(),
      })
      setSyncOk(true)
      setTimeout(() => setSyncOk(false), 4000)
    } catch (err) { alert(err.message) }
    setSyncing(false)
  }

  // ── Vider les données analytics (sessions, page_views, events) ──
  const clearAnalytics = async () => {
    if (!confirmClear) { setConfirmClear(true); return }
    setClearing(true)
    await supabase.from('events').delete().not('id', 'is', null)
    await supabase.from('page_views').delete().not('id', 'is', null)
    await supabase.from('sessions').delete().not('id', 'is', null)
    setClearing(false)
    setConfirmClear(false)
    await load()
  }

  return (
    <div>
      {/* Barre du haut : indicateur live + actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e8edf5', borderRadius: 12, padding: '9px 16px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulseLive 1.6s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Temps réel</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>· actualisation auto {AUTO_REFRESH_MS / 1000}s</span>
        </div>

        <div style={{ flex: 1 }} />

        <button onClick={doSync} disabled={syncing} style={{
          padding: '11px 16px',
          background: syncOk ? '#d1fae5' : '#000E91',
          border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700,
          cursor: syncing ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 7,
          color: syncOk ? '#065f46' : '#fff', fontFamily: 'inherit',
          opacity: syncing ? .7 : 1,
        }}>
          <Icon name={syncOk ? 'check' : 'sheet'} size={15} color={syncOk ? '#065f46' : '#fff'} />
          {syncing ? 'Synchronisation...' : syncOk ? 'Google Sheets à jour' : 'Sync Google Sheets'}
        </button>

        <button onClick={clearAnalytics} disabled={clearing} style={{
          padding: '11px 16px',
          background: confirmClear ? '#fef2f2' : '#fff',
          border: `1.5px solid ${confirmClear ? '#ef4444' : '#e2e8f0'}`,
          borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7, color: '#ef4444', fontFamily: 'inherit',
        }}>
          <Icon name="trash" size={15} color="#ef4444" />
          {clearing ? 'Suppression...' : confirmClear ? 'Confirmer : tout supprimer ?' : 'Vider les données analytics'}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard icon="users" label={`Actifs (${ACTIVE_WINDOW_MIN} min)`} value={activeNow} color="#10b981" />
        <KpiCard icon="chart" label={`Sessions (${ANALYTICS_LOOKBACK_DAYS}j)`} value={fmt(totalSessions)} color="#6366f1" />
        <KpiCard icon="globe" label={`Pages vues (${ANALYTICS_LOOKBACK_DAYS}j)`} value={fmt(totalPageViews)} color="#0073F4" />
        <KpiCard icon="check" label="Taux de conversion" value={`${tauxConv}%`} color="#d97706" sub={`${totalConfirmes} / ${totalVisites} visites`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Pages les plus vues */}
        <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>Pages les plus vues</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Toutes périodes</div>
          {topPages.length === 0
            ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucune donnée</div>
            : topPages.slice(0, 8).map((p, i) => (
              <BarRow key={i} label={p.path} value={p.visites} max={maxTopPage}
                color={['#6366f1', '#0073F4', '#000E91', '#10b981', '#d97706', '#0891b2', '#8b5cf6', '#ef4444'][i % 8]} />
            ))
          }
        </div>

        {/* Tunnel de conversion */}
        <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>Tunnel de conversion</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Visite → Inscription confirmée</div>
          {funnel.length === 0
            ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucune donnée</div>
            : funnel.map((f, i) => (
              <BarRow key={i} label={f.etape} value={f.nb} max={maxFunnel}
                color={['#6366f1', '#0073F4', '#000E91', '#10b981', '#d97706'][i % 5]} />
            ))
          }
        </div>
      </div>

      <div className="analytics-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {/* Appareils */}
        <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 20 }}>Appareils</div>
          {deviceEntries.length === 0
            ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucune donnée</div>
            : deviceEntries.map(([label, val], i) => (
              <BarRow key={i} label={label} value={val} max={maxDevice} color={['#0073F4', '#6366f1', '#0891b2'][i % 3]} />
            ))
          }
        </div>

        {/* Sources */}
        <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 20 }}>Sources de trafic</div>
          {sourceEntries.length === 0
            ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucune donnée</div>
            : sourceEntries.map(([label, val], i) => (
              <BarRow key={i} label={label} value={val} max={maxSource} color={['#10b981', '#d97706', '#6366f1', '#0073F4', '#ef4444', '#8b5cf6'][i % 6]} />
            ))
          }
        </div>

        {/* Pays */}
        <div style={{ ...CARD_STYLE, padding: '22px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 20 }}>Top pays</div>
          {countryEntries.length === 0
            ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucune donnée</div>
            : countryEntries.map(([label, val], i) => (
              <BarRow key={i} label={label} value={val} max={maxCountry}
                color={['#6366f1', '#0073F4', '#000E91', '#10b981', '#d97706', '#0891b2', '#8b5cf6', '#ef4444'][i % 8]} />
            ))
          }
        </div>
      </div>

      {lastLoad && (
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, textAlign: 'right' }}>
          Dernière actualisation : {lastLoad.toLocaleTimeString('fr-FR')}
        </div>
      )}
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function AdminPage() {
  const { scope, signOut, session } = useAdminAuth()
  const visibleModules = useMemo(() => scope === 'all' ? MODULES : MODULES.filter(m => m.scope === scope), [scope])
  const [activeModule,   setActiveModule]   = useState(() => visibleModules[0]?.id || 'dashboard')
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [allData,        setAllData]        = useState({ inscriptions: [], sponsors: [], partenaires: [], exposants: [], membres: [] })
  const [sectionData,    setSectionData]    = useState([])
  const [loading,        setLoading]        = useState(true)
  const [lastSync,       setLastSync]       = useState(null)
  const [globalSyncing,  setGlobalSyncing]  = useState(false)
  const [globalSyncOk,   setGlobalSyncOk]   = useState(false)

  // Chargement initial : toutes les tables pour le dashboard
  const loadAll = useCallback(async () => {
    setLoading(true)
    const [
      { data: insc },
      { data: spons },
      { data: part },
      { data: expo },
      { data: membresRes },
    ] = await Promise.all([
      supabase.from('inscriptions').select('*, contacts(nom,prenom,email,telephone,organisation,pays,poste)').order('created_at', { ascending: false }),
      supabase.from('sponsorships').select('*, contacts(nom,email,telephone,organisation,pays)').eq('type', 'sponsor').order('created_at', { ascending: false }),
      supabase.from('sponsorships').select('*, contacts(nom,email,telephone,organisation,pays)').eq('type', 'partenaire_strategique').order('created_at', { ascending: false }),
      supabase.from('exposants').select('*, contacts(nom,email,telephone,organisation)').order('created_at', { ascending: false }),
      // Membres de delegations (inscription_participants) : personnes a
      // part entiere sous une inscription groupee, invisibles sinon dans
      // le tableau principal alors qu'elles ont chacune leur propre badge.
      supabase.from('inscription_participants').select('*'),
    ])
    const d = {
      inscriptions: insc  || [],
      sponsors:     spons || [],
      partenaires:  part  || [],
      exposants:    expo  || [],
      membres:      membresRes || [],
    }
    setAllData(d)
    setSectionData(d[activeModule] || [])
    setLastSync(new Date())
    setLoading(false)
  }, [activeModule])

  // Scope 'checkin' (personnel d'accueil) : ne charge jamais les donnees du
  // tableau de bord (RLS les bloquerait de toute facon, is_admin('proforma')
  // etc. ne passe pas pour ce scope), et est redirige vers /staff/scan plus
  // bas — inutile de lancer la requete.
  useEffect(() => { if (scope !== 'checkin') loadAll() }, [])

  // Changement d'onglet
  useEffect(() => {
    if (['dashboard', 'analytics', 'proforma', 'sondages', 'diagnostics', 'tirage'].includes(activeModule)) return
    setSectionData(allData[activeModule] || [])
  }, [activeModule, allData])

  // Sync globale vers Google Sheets
  const syncAll = async () => {
    setGlobalSyncing(true)
    try {
      const rows = {
        inscriptions: allData.inscriptions.map(r => [
          r.dossier,
          r.contacts?.prenom || '', r.contacts?.nom || '',
          r.contacts?.email || '', r.contacts?.telephone || '',
          r.contacts?.organisation || '', r.contacts?.poste || '', r.contacts?.pays || '',
          r.participants, r.montant, r.paiement_status, r.paiement_mode, r.message, fmtDate(r.created_at),
        ]),
        sponsors: allData.sponsors.map(r => [
          r.id, r['contacts']?.organisation, r['contacts']?.nom, r['contacts']?.email,
          r['contacts']?.telephone, r['contacts']?.pays, r.niveau, r.montant, r.statut, r.message, fmtDate(r.created_at),
        ]),
        partenaires: allData.partenaires.map(r => [
          r.id, r['contacts']?.organisation, r.type_institution, r['contacts']?.pays,
          r['contacts']?.nom, r['contacts']?.email, r['contacts']?.telephone,
          r.niveau, r.montant, r.statut, r.message, fmtDate(r.created_at),
        ]),
        exposants: allData.exposants.map(r => [
          r.id, r.entreprise, r.secteur,
          r['contacts']?.nom, r['contacts']?.email, r['contacts']?.telephone,
          r.forfait, r.statut, r.goals, fmtDate(r.created_at),
        ]),
      }
      await syncToSheets('sync_all', rows)
      setGlobalSyncOk(true)
      setTimeout(() => setGlobalSyncOk(false), 5000)
    } catch (err) { alert(err.message) }
    setGlobalSyncing(false)
  }

  const activeM = MODULES.find(m => m.id === activeModule)

  // Le personnel d'accueil (scope 'checkin') n'a pas d'onglet dans MODULES
  // (visibleModules est vide pour ce scope) : plutot que de retomber sur le
  // tableau de bord general par defaut, on l'envoie directement sur l'outil
  // qui le concerne.
  if (scope === 'checkin') return <Navigate to="/staff/scan" replace />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f4f6fb', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes modalIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes pulseLive {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,.55); }
          70%  { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .spinner { width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite; }
        .kpi-card { transition: transform .18s ease, box-shadow .18s ease; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 1px 3px rgba(15,23,42,.05), 0 16px 32px -16px rgba(15,23,42,.18); }
        .nav-item { display:flex;align-items:center;gap:12px;padding:11px 14px;border:none;border-radius:12px;background:transparent;cursor:pointer;font-family:inherit;font-weight:600;font-size:13.5px;color:rgba(255,255,255,.62);transition:all .18s;width:100%;text-align:left; }
        .nav-item:hover { background:rgba(255,255,255,.08);color:#fff; }
        .nav-item.active { background:linear-gradient(135deg,#0073F4,#000E91);color:#fff;box-shadow:0 6px 16px -4px rgba(0,115,244,.5); }
        ::-webkit-scrollbar { width:5px;height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e2e8f0;border-radius:10px; }
        @media (max-width: 900px) {
          .analytics-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside style={{
        width: sidebarOpen ? 264 : 0,
        minWidth: sidebarOpen ? 264 : 0,
        background: 'linear-gradient(180deg, #020924 0%, #001156 55%, #020a30 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width .25s ease, min-width .25s ease',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '26px 22px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#0073F4,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,115,244,.4)' }}>
              <Icon name="copaf" size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>COPAF 2026</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Administration</div>
            </div>
          </div>
        </div>

        {/* Profil admin connecte */}
        <div style={{ margin: '2px 16px 16px', padding: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0, textTransform: 'uppercase' }}>
            {(session?.user?.email || '?')[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user?.email}</div>
            <div style={{ fontSize: 10, color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginTop: 2 }}>{scope === 'all' ? 'Accès complet' : scope}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '4px 12px 16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '0 8px 10px' }}>Menu principal</div>
          {visibleModules.map(m => (
            <button
              key={m.id}
              className={`nav-item${activeModule === m.id ? ' active' : ''}`}
              onClick={() => setActiveModule(m.id)}
            >
              <Icon name={m.icon} size={18} color={activeModule === m.id ? '#fff' : 'rgba(255,255,255,.55)'} />
              <span style={{ whiteSpace: 'nowrap' }}>{m.label}</span>
              {m.table && allData[m.id]?.length > 0 && (
                <span style={{ marginLeft: 'auto', background: activeModule === m.id ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.08)', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {allData[m.id]?.length}
                </span>
              )}
            </button>
          ))}
          {(scope === 'all' || scope === 'checkin') && (
            <a href="/staff/scan" className="nav-item" style={{ textDecoration: 'none' }}>
              <Icon name="search" size={18} color="rgba(255,255,255,.55)" />
              <span style={{ whiteSpace: 'nowrap' }}>Scanner badges</span>
            </a>
          )}
        </nav>

        {/* Derniere sync */}
        {lastSync && (
          <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 11, color: 'rgba(255,255,255,.4)', flexShrink: 0 }}>
            <div style={{ fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 2 }}>Derniere actualisation</div>
            {lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}

        {/* Deconnexion */}
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
          <button
            onClick={signOut}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.12)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{ background: '#fff', boxShadow: '0 1px 0 rgba(15,23,42,.06), 0 2px 8px rgba(15,23,42,.03)', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', color: '#64748b', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Icon name="menu" size={20} color="#64748b" />
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{activeM?.label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {allData[activeModule]?.length > 0 ? `${allData[activeModule].length} enregistrements` : activeModule === 'analytics' ? 'Statistiques de fréquentation' : 'Tableau de bord general'}
              </div>
            </div>
          </div>

          {!['proforma', 'sondages', 'diagnostics', 'tirage'].includes(activeModule) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Sync tout vers Sheets */}
              <button
                onClick={syncAll}
                disabled={globalSyncing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px',
                  background: globalSyncOk ? '#d1fae5' : '#fff',
                  border: `1.5px solid ${globalSyncOk ? '#10b981' : '#e2e8f0'}`,
                  borderRadius: 12, fontSize: 13, fontWeight: 700,
                  color: globalSyncOk ? '#065f46' : '#0f172a',
                  cursor: globalSyncing ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'all .2s',
                  opacity: globalSyncing ? .7 : 1,
                }}
              >
                {globalSyncing ? <div className="spinner" style={{ borderTopColor: '#0f172a', borderColor: '#e2e8f0' }} /> : <Icon name="sheet" size={16} color={globalSyncOk ? '#065f46' : '#0f172a'} />}
                {globalSyncing ? 'Sync en cours...' : globalSyncOk ? 'Google Sheets a jour' : 'Tout synchroniser'}
              </button>

              {/* Actualiser */}
              <button
                onClick={loadAll}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#000E91', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1 }}
              >
                {loading ? <div className="spinner" /> : <Icon name="refresh" size={16} color="#fff" />}
                Actualiser
              </button>
            </div>
          )}
        </header>

        {/* Contenu */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 40px' }}>
          {activeModule === 'proforma' ? (
            <AdminProforma />
          ) : activeModule === 'sondages' ? (
            <AdminSondages />
          ) : activeModule === 'diagnostics' ? (
            <AdminDiagnostics />
          ) : activeModule === 'tirage' ? (
            <AdminTirage />
          ) : activeModule === 'analytics' ? (
            <SectionAnalytics />
          ) : loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#000E91', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <div style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Chargement des donnees...</div>
            </div>
          ) : (
            <>
              {activeModule === 'dashboard' && <SectionDashboard allData={allData} />}
              {activeModule === 'participants' && (
                <SectionParticipants
                  data={allData.inscriptions}
                  membres={allData.membres}
                  setData={d => setAllData(prev => ({ ...prev, inscriptions: typeof d === 'function' ? d(prev.inscriptions) : d }))}
                />
              )}
              {(activeModule === 'sponsors' || activeModule === 'partenaires' || activeModule === 'exposants') && (
                <SectionGeneric
                  data={allData[activeModule]}
                  setData={d => setAllData(prev => ({ ...prev, [activeModule]: typeof d === 'function' ? d(prev[activeModule]) : d }))}
                  moduleId={activeModule}
                  accentColor={activeModule === 'sponsors' ? '#d97706' : activeModule === 'partenaires' ? '#000E91' : '#0891b2'}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}