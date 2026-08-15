import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabase'

const BLUE = '#0073F4'

const TR = {
  fr: {
    titre: 'Discussion entre répondants de ce port',
    sousTitre: "Échangez avec les autres personnes de votre organisation qui remplissent aussi ce diagnostic — visible uniquement par elles.",
    pseudoLabel: 'Votre nom affiché',
    placeholder: 'Écrire un message…',
    envoyer: 'Envoyer',
    vide: 'Aucun message pour le moment. Soyez le premier à écrire.',
    erreur: "Impossible d'envoyer le message. Réessayez.",
  },
  en: {
    titre: 'Discussion between respondents from this port',
    sousTitre: 'Chat with other people from your organisation also filling in this diagnostic — visible to them only.',
    pseudoLabel: 'Your display name',
    placeholder: 'Write a message…',
    envoyer: 'Send',
    vide: 'No messages yet. Be the first to write.',
    erreur: 'Could not send the message. Please try again.',
  },
}

function formatHeure(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function DiagnosticChat({ roomKey, pseudoInitial, lang = 'fr' }) {
  const t = TR[lang] || TR.fr
  const [messages, setMessages] = useState([])
  const [pseudo, setPseudo] = useState(pseudoInitial || '')
  const [texte, setTexte] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const channelRef = useRef(null)
  const listeRef = useRef(null)

  const charger = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_diagnostic_chat_messages', { p_room_key: roomKey })
    if (!error && data) setMessages(data)
  }, [roomKey])

  useEffect(() => {
    if (!roomKey) return
    charger()
    const channel = supabase.channel(`diagnostic-chat-${roomKey}`)
    channelRef.current = channel
    channel.on('broadcast', { event: 'nouveau-message' }, ({ payload }) => {
      setMessages(prev => prev.some(m => m.id === payload.id) ? prev : [...prev, payload])
    }).subscribe()
    return () => {
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [roomKey, charger])

  useEffect(() => {
    if (listeRef.current) listeRef.current.scrollTop = listeRef.current.scrollHeight
  }, [messages])

  const envoyer = async (e) => {
    e.preventDefault()
    const auteur = pseudo.trim()
    const message = texte.trim()
    if (!auteur || !message || envoiEnCours) return
    setEnvoiEnCours(true)
    setErreur('')
    try {
      const { data, error } = await supabase.rpc('send_diagnostic_chat_message', {
        p_room_key: roomKey,
        p_auteur: auteur,
        p_message: message,
      })
      if (error) throw error
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data])
      channelRef.current?.send({ type: 'broadcast', event: 'nouveau-message', payload: data })
      setTexte('')
    } catch (err) {
      console.error('Erreur envoi message chat:', err)
      setErreur(t.erreur)
    } finally {
      setEnvoiEnCours(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#f8fafc', fontSize: 13,
  }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.titre}</div>
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{t.sousTitre}</p>

      <div ref={listeRef} style={{
        display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto',
        marginBottom: 14, padding: messages.length ? '4px 2px' : 0,
      }}>
        {!messages.length && (
          <p style={{ fontSize: 12.5, color: '#64748b', textAlign: 'center', padding: '18px 0' }}>{t.vide}</p>
        )}
        {messages.map(m => (
          <div key={m.id} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '9px 12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>{m.auteur}</span>
              <span style={{ fontSize: 10.5, color: '#64748b', flexShrink: 0 }}>{formatHeure(m.created_at)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, wordBreak: 'break-word' }}>{m.message}</div>
          </div>
        ))}
      </div>

      {erreur && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 10 }}>{erreur}</p>}

      <form onSubmit={envoyer} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          style={inputStyle}
          value={pseudo}
          onChange={e => setPseudo(e.target.value)}
          placeholder={t.pseudoLabel}
          maxLength={60}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={texte}
            onChange={e => setTexte(e.target.value)}
            placeholder={t.placeholder}
            maxLength={500}
          />
          <button type="submit" disabled={envoiEnCours || !pseudo.trim() || !texte.trim()} style={{
            padding: '11px 20px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
            borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            cursor: envoiEnCours ? 'default' : 'pointer', opacity: (!pseudo.trim() || !texte.trim()) ? 0.5 : 1,
            flexShrink: 0,
          }}>
            {t.envoyer}
          </button>
        </div>
      </form>
    </div>
  )
}
