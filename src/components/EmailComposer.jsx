// src/components/EmailComposer.jsx
//
// Formulaire d'envoi manuel d'email : destinataires (avec recherche parmi
// participants / intervenants), objet, message mis en forme, signature
// enregistrable par compte admin, apercu fidele du rendu final, confirmation
// avant envoi. L'envoi passe par l'edge function send-admin-email (reservee
// aux admins) ; chaque email est journalise dans le Journal d'activite.
//
// `initialTo` permet de pre-remplir le destinataire (fiche d'une personne).

import { useEffect, useRef, useState } from 'react'
import { X, Search, Send, Eye, Users, Check } from 'lucide-react'
import { supabase } from '../supabase'
import RichTextEditor from './RichTextEditor'

const NAVY = '#000E91'
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/
const SIGNATURE_DEFAUT = '<p>Cordialement,<br><strong>Comité d\'organisation de la COPAF 2026</strong></p>'

const LABEL = { fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: '#64748b', marginBottom: 6, display: 'block' }
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', color: '#0f172a', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', background: '#fff' }
const BOUTON = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }

async function messageErreur(error) {
  try {
    const corps = await error.context?.json?.()
    if (corps?.error) return corps.error
  } catch { /* corps illisible : on retombe sur le message generique */ }
  return error?.message || "L'envoi a échoué."
}

async function chercherPersonnes(q) {
  const motif = `%${q.replace(/[%,()]/g, ' ').trim()}%`
  const filtre = `nom.ilike.${motif},prenom.ilike.${motif},email.ilike.${motif}`
  const [contacts, parts, intervs] = await Promise.all([
    supabase.from('contacts').select('nom, prenom, email, organisation').or(filtre).not('email', 'is', null).limit(6),
    supabase.from('inscription_participants').select('nom, prenom, email').or(filtre).not('email', 'is', null).limit(6),
    supabase.from('intervenants').select('nom, prenom, email, organisation').or(filtre).not('email', 'is', null).limit(6),
  ])
  const vus = new Set()
  return [
    ...(contacts.data || []).map(r => ({ ...r, type: 'Participant' })),
    ...(parts.data || []).map(r => ({ ...r, type: 'Membre de délégation' })),
    ...(intervs.data || []).map(r => ({ ...r, type: 'Intervenant' })),
  ].filter(r => r.email && !vus.has(r.email.toLowerCase()) && vus.add(r.email.toLowerCase()))
}

export default function EmailComposer({ initialTo = [], dossier = null, onSent }) {
  const [destinataires, setDestinataires] = useState(() => [...new Set(initialTo.map(e => e.toLowerCase()))])
  const [saisie, setSaisie] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [objet, setObjet] = useState('')
  const [corps, setCorps] = useState('')
  const [corpsKey, setCorpsKey] = useState(0)
  const [signature, setSignature] = useState(SIGNATURE_DEFAUT)
  const [signatureKey, setSignatureKey] = useState(0)
  const [signatureOuverte, setSignatureOuverte] = useState(false)
  const [signatureMsg, setSignatureMsg] = useState('')
  const [habillage, setHabillage] = useState(true)
  const [replyTo, setReplyTo] = useState('contact@copaf-ports.com')
  const [apercu, setApercu] = useState(null)
  const [confirmer, setConfirmer] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [resultat, setResultat] = useState(null)
  const minuterie = useRef(null)

  // Signature enregistree du compte connecte.
  useEffect(() => {
    let annule = false
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      const email = u?.user?.email?.toLowerCase()
      if (!email) return
      const { data } = await supabase.from('email_signatures').select('signature_html').eq('email', email).maybeSingle()
      if (!annule && data?.signature_html) {
        setSignature(data.signature_html)
        setSignatureKey(k => k + 1)
      }
    })()
    return () => { annule = true }
  }, [])

  // Recherche de personnes (avec un delai pour ne pas interroger a chaque frappe).
  useEffect(() => {
    clearTimeout(minuterie.current)
    if (saisie.trim().length < 2) return undefined
    minuterie.current = setTimeout(async () => {
      const trouvees = await chercherPersonnes(saisie.trim())
      setSuggestions(trouvees)
    }, 300)
    return () => clearTimeout(minuterie.current)
  }, [saisie])

  const suggestionsVisibles = saisie.trim().length >= 2
    ? suggestions.filter(s => !destinataires.includes(s.email.toLowerCase()))
    : []

  const ajouter = (email) => {
    const e = email.trim().toLowerCase().replace(/[;,]$/, '')
    if (!e) return
    if (!EMAIL_RE.test(e)) { setErreur(`« ${e} » n'est pas une adresse valide.`); return }
    setErreur('')
    setDestinataires(d => (d.includes(e) ? d : [...d, e]))
    setSaisie('')
  }

  const retirer = (email) => setDestinataires(d => d.filter(x => x !== email))

  const ajouterGroupe = async (groupe) => {
    setErreur('')
    let emails = []
    if (groupe === 'intervenants') {
      const { data } = await supabase.from('intervenants').select('email').not('email', 'is', null)
      emails = (data || []).map(r => r.email)
    } else {
      const { data } = await supabase.from('inscriptions').select('contacts(email)').eq('paiement_status', 'confirme')
      emails = (data || []).map(r => r.contacts?.email).filter(Boolean)
    }
    const valides = emails.map(e => e.trim().toLowerCase()).filter(e => EMAIL_RE.test(e))
    setDestinataires(d => [...new Set([...d, ...valides])])
  }

  const surTouche = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') { e.preventDefault(); ajouter(saisie) }
    if (e.key === 'Backspace' && !saisie && destinataires.length) retirer(destinataires[destinataires.length - 1])
  }

  const enregistrerSignature = async () => {
    setSignatureMsg('')
    const { data: u } = await supabase.auth.getUser()
    const email = u?.user?.email?.toLowerCase()
    if (!email) { setSignatureMsg('Session expirée, reconnectez-vous.'); return }
    const { error } = await supabase.from('email_signatures').upsert({ email, signature_html: signature, updated_at: new Date().toISOString() })
    setSignatureMsg(error ? "Impossible d'enregistrer la signature." : 'Signature enregistrée pour vos prochains emails.')
  }

  const corpsEnvoi = () => ({ bodyHtml: corps, signatureHtml: signature, habillage, replyTo })

  const voirApercu = async () => {
    setErreur('')
    const { data, error } = await supabase.functions.invoke('send-admin-email', { body: { ...corpsEnvoi(), preview: true } })
    if (error) { setErreur(await messageErreur(error)); return }
    setApercu(data.html)
  }

  const envoyer = async () => {
    setEnvoi(true); setErreur(''); setResultat(null)
    const { data, error } = await supabase.functions.invoke('send-admin-email', {
      body: { ...corpsEnvoi(), to: destinataires, subject: objet, dossier },
    })
    setEnvoi(false); setConfirmer(false)
    if (error) {
      let rapport = null
      try { rapport = (await error.context?.json?.())?.rapport } catch { /* pas de rapport detaille */ }
      if (rapport) setResultat({ rapport })
      setErreur(await messageErreur(error))
      return
    }
    setResultat(data)
    if (data?.envoyes === data?.total) {
      setObjet(''); setCorps(''); setCorpsKey(k => k + 1)
      if (onSent) onSent(data)
    }
  }

  const pret = destinataires.length > 0 && objet.trim() && corps.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={LABEL}>Destinataire(s)</label>
        <div style={{ ...INPUT, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '7px 10px' }}>
          {destinataires.map(d => (
            <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eef2ff', color: NAVY, borderRadius: 100, padding: '4px 6px 4px 12px', fontSize: 13, fontWeight: 600 }}>
              {d}
              <button type="button" onClick={() => retirer(d)} aria-label={`Retirer ${d}`} style={{ display: 'inline-flex', background: 'rgba(0,14,145,.12)', border: 'none', borderRadius: '50%', width: 18, height: 18, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: NAVY, padding: 0 }}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={saisie} onChange={(e) => setSaisie(e.target.value)} onKeyDown={surTouche} onBlur={() => { if (EMAIL_RE.test(saisie.trim())) ajouter(saisie) }}
            placeholder={destinataires.length ? 'Ajouter…' : 'Adresse email, ou tapez un nom pour rechercher…'}
            style={{ flex: 1, minWidth: 200, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', padding: '4px 2px', background: 'transparent' }}
          />
        </div>

        {suggestionsVisibles.length > 0 && (
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, marginTop: 6, background: '#fff', boxShadow: '0 8px 24px rgba(15,23,42,.08)', overflow: 'hidden' }}>
            {suggestionsVisibles.map(s => (
              <button key={s.email} type="button" onClick={() => ajouter(s.email)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, textAlign: 'left', padding: '9px 14px', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Search size={14} color="#94a3b8" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{`${s.prenom || ''} ${s.nom || ''}`.trim() || s.email}</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#64748b' }}>{s.email} · {s.type}{s.organisation ? ` · ${s.organisation}` : ''}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={() => ajouterGroupe('intervenants')} style={{ ...BOUTON, padding: '6px 12px', fontSize: 12.5, background: '#f1f5f9', color: '#334155' }}>
            <Users size={13} /> Tous les intervenants
          </button>
          <button type="button" onClick={() => ajouterGroupe('confirmes')} style={{ ...BOUTON, padding: '6px 12px', fontSize: 12.5, background: '#f1f5f9', color: '#334155' }}>
            <Users size={13} /> Participants confirmés
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0' }}>Un email individuel est envoyé à chaque destinataire : ils ne voient pas les autres adresses.</p>
      </div>

      <div>
        <label style={LABEL} htmlFor="email-objet">Objet</label>
        <input id="email-objet" value={objet} onChange={(e) => setObjet(e.target.value)} placeholder="Objet du message" style={INPUT} />
      </div>

      <div>
        <label style={LABEL}>Message</label>
        <RichTextEditor initialHtml={corps} resetKey={corpsKey} onChange={setCorps} minHeight={240} />
      </div>

      <div>
        <button type="button" onClick={() => setSignatureOuverte(o => !o)} style={{ background: 'none', border: 'none', padding: 0, color: '#0073F4', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {signatureOuverte ? '▾' : '▸'} Signature
        </button>
        {signatureOuverte && (
          <div style={{ marginTop: 10 }}>
            <RichTextEditor initialHtml={signature} resetKey={signatureKey} onChange={setSignature} minHeight={90} placeholder="Votre signature…" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={enregistrerSignature} style={{ ...BOUTON, background: '#f1f5f9', color: '#334155' }}>Enregistrer comme signature par défaut</button>
              {signatureMsg && <span style={{ fontSize: 12.5, color: '#059669', fontWeight: 600 }}>{signatureMsg}</span>}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={habillage} onChange={(e) => setHabillage(e.target.checked)} style={{ width: 16, height: 16 }} />
          Habillage COPAF (cover et pied de page)
        </label>
        <div style={{ minWidth: 240 }}>
          <label style={LABEL} htmlFor="email-reply">Les réponses arrivent à</label>
          <input id="email-reply" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} style={{ ...INPUT, padding: '8px 12px' }} />
        </div>
      </div>

      {erreur && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 10, padding: '10px 14px', fontSize: 13.5 }}>{erreur}</div>}

      {resultat?.rapport && (
        <div style={{ background: resultat.envoyes === resultat.total ? '#f0fdf4' : '#fffbeb', border: `1px solid ${resultat.envoyes === resultat.total ? '#bbf7d0' : '#fde68a'}`, borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#0f172a' }}>
          <strong>{resultat.envoyes === resultat.total ? 'Message envoyé' : 'Envoi partiel'}</strong>
          {resultat.total !== undefined && ` — ${resultat.envoyes ?? 0} sur ${resultat.total}`}
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {resultat.rapport.map(r => (
              <li key={r.to} style={{ color: r.ok ? '#047857' : '#b91c1c' }}>{r.ok ? '✓' : '✗'} {r.to}{r.ok ? '' : ` — ${r.detail || 'échec'}`}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <button type="button" onClick={voirApercu} disabled={!corps} style={{ ...BOUTON, background: '#f1f5f9', color: '#334155', opacity: corps ? 1 : 0.5 }}>
          <Eye size={16} /> Aperçu
        </button>
        {!confirmer ? (
          <button type="button" onClick={() => setConfirmer(true)} disabled={!pret || envoi} style={{ ...BOUTON, background: NAVY, color: '#fff', opacity: pret ? 1 : 0.5 }}>
            <Send size={16} /> Envoyer{destinataires.length > 1 ? ` à ${destinataires.length} destinataires` : ''}
          </button>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '6px 8px 6px 14px', fontSize: 13.5, color: '#92400e', fontWeight: 600 }}>
            Envoyer à {destinataires.length} destinataire{destinataires.length > 1 ? 's' : ''} ?
            <button type="button" onClick={envoyer} disabled={envoi} style={{ ...BOUTON, padding: '7px 14px', background: '#16a34a', color: '#fff' }}>
              <Check size={15} /> {envoi ? 'Envoi…' : 'Confirmer'}
            </button>
            <button type="button" onClick={() => setConfirmer(false)} disabled={envoi} style={{ ...BOUTON, padding: '7px 14px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}>Annuler</button>
          </span>
        )}
      </div>

      {apercu && (
        <div onClick={() => setApercu(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,17,40,.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 720, height: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: 14 }}>Aperçu — {objet || '(sans objet)'}</strong>
              <button type="button" onClick={() => setApercu(null)} aria-label="Fermer l'aperçu" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <iframe title="Aperçu de l'email" srcDoc={apercu} sandbox="" style={{ flex: 1, border: 'none', width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  )
}
