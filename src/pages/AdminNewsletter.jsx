import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const STATUS_STYLES = {
  envoye: { label: 'Envoyé', bg: '#dcfce7', color: '#16a34a' },
  echec:  { label: 'Échec',  bg: '#fee2e2', color: '#dc2626' },
}

export default function AdminNewsletter() {
  const [subscriberCount, setSubscriberCount] = useState(null)
  const [campaigns, setCampaigns] = useState(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const load = async () => {
    const [{ count }, { data: camp }] = await Promise.all([
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter_campaigns').select('id, subject, sent_by_email, recipients_count, status, created_at').order('created_at', { ascending: false }).limit(30),
    ])
    setSubscriberCount(count ?? 0)
    setCampaigns(camp || [])
  }

  useEffect(() => { load() }, [])

  const bodyHtml = message
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br/>').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('')

  const canSend = subject.trim().length > 0 && message.trim().length > 0 && subscriberCount > 0 && !sending

  const handleSend = async () => {
    if (!canSend) return
    setSending(true)
    setResult(null)
    const { data, error } = await supabase.functions.invoke('send-newsletter', {
      body: { subject: subject.trim(), bodyHtml },
    })
    setSending(false)
    setConfirming(false)
    if (error || data?.error) {
      setResult({ ok: false, message: data?.error || error.message || "Échec de l'envoi." })
    } else {
      setResult({ ok: true, message: `Newsletter envoyée à ${data.sentCount} abonné(s).` })
      setSubject('')
      setMessage('')
      load()
    }
  }

  const inputStyle = { width: '100%', padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', color: '#0f172a', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 9, outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Newsletter</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          {subscriberCount === null ? 'Chargement…' : `${subscriberCount} abonné(s) recevront cet email.`}
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)', padding: 24, marginBottom: 28, maxWidth: 640 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Sujet</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Ex : Le programme complet de la COPAF 2026 est disponible"
          style={{ ...inputStyle, marginBottom: 18 }}
        />

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Rédigez votre message. Séparez les paragraphes par une ligne vide."
          rows={8}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, marginBottom: 18 }}
        />

        {result && (
          <div style={{
            marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13.5,
            background: result.ok ? '#dcfce7' : '#fef2f2',
            color: result.ok ? '#16a34a' : '#dc2626',
            border: `1px solid ${result.ok ? '#86efac' : '#fca5a5'}`,
          }}>
            {result.message}
          </div>
        )}

        {!confirming ? (
          <button
            type="button"
            disabled={!canSend}
            onClick={() => setConfirming(true)}
            style={{
              padding: '11px 24px', background: canSend ? BLUE : '#cbd5e1', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: canSend ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}
          >
            Envoyer la newsletter
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, color: '#334155', fontWeight: 600 }}>
              Confirmer l'envoi à {subscriberCount} abonné(s) ?
            </span>
            <button
              type="button"
              disabled={sending}
              onClick={handleSend}
              style={{ padding: '10px 20px', background: NAVY, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit' }}
            >
              {sending ? 'Envoi en cours…' : 'Oui, envoyer'}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => setConfirming(false)}
              style={{ padding: '10px 20px', background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a1128', margin: '0 0 12px' }}>Historique des envois</h3>

      {campaigns === null && <p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p>}
      {campaigns !== null && campaigns.length === 0 && <p style={{ color: '#64748b', fontSize: 13.5 }}>Aucune newsletter envoyée pour le moment.</p>}

      {campaigns !== null && campaigns.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1px solid rgba(0,14,145,0.08)' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Sujet</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Envoyé par</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Destinataires</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => {
                const st = STATUS_STYLES[c.status] || { label: c.status, bg: '#f1f5f9', color: '#64748b' }
                return (
                  <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '12px 18px', color: '#334155', whiteSpace: 'nowrap' }}>
                      {new Date(c.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '12px 18px', color: '#0a1128', fontWeight: 600 }}>{c.subject}</td>
                    <td style={{ padding: '12px 18px', color: '#334155' }}>{c.sent_by_email || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{c.recipients_count}</td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '3px 10px', background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
