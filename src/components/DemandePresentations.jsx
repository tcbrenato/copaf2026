import { useState } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const TR = {
  fr: {
    titre: 'Présentations de la conférence',
    texte: 'Les présentations des intervenants (en français et en anglais) sont disponibles dans l’espace personnel des participants et des intervenants. Vous n’en faites pas partie ? Vous pouvez en faire la demande.',
    espaceParticipant: 'Espace participant', espaceIntervenant: 'Espace intervenant',
    bouton: 'Demander les présentations',
    nom: 'Nom et prénom', email: 'Email', organisation: 'Organisation', pays: 'Pays', message: 'Message (facultatif)',
    envoyer: 'Envoyer ma demande', envoi: 'Envoi…', annuler: 'Annuler',
    merci: 'Votre demande a bien été envoyée. Notre équipe vous répondra très prochainement.',
    erreur: 'Une erreur est survenue. Réessayez dans un instant.',
  },
  en: {
    titre: 'Conference presentations',
    texte: 'The speakers’ presentations (in French and English) are available in the personal space of participants and speakers. Not one of them? You can request access.',
    espaceParticipant: 'Participant space', espaceIntervenant: 'Speaker space',
    bouton: 'Request the presentations',
    nom: 'Full name', email: 'Email', organisation: 'Organisation', pays: 'Country', message: 'Message (optional)',
    envoyer: 'Send my request', envoi: 'Sending…', annuler: 'Cancel',
    merci: 'Your request has been sent. Our team will get back to you very shortly.',
    erreur: 'Something went wrong. Please try again in a moment.',
  },
}

const champ = { width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', background: '#fff', color: '#0f172a' }
const etiquette = { display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 5 }

export default function DemandePresentations({ lang = 'fr' }) {
  const t = TR[lang === 'en' ? 'en' : 'fr']
  const [ouvert, setOuvert] = useState(false)
  const [etat, setEtat] = useState('repos') // repos | envoi | ok | erreur
  const [msgErreur, setMsgErreur] = useState('')
  const [f, setF] = useState({ nom: '', email: '', organisation: '', pays: '', message: '', website: '' })
  const maj = k => e => setF(prev => ({ ...prev, [k]: e.target.value }))

  const envoyer = async e => {
    e.preventDefault()
    if (etat === 'envoi') return
    setEtat('envoi'); setMsgErreur('')
    const { data, error } = await supabase.functions.invoke('demande-presentations', { body: { ...f, langue: lang } })
    if (error || !data?.success) {
      let detail = ''
      try { detail = (await error?.context?.json?.())?.error || '' } catch { /* corps non JSON */ }
      setMsgErreur(detail || t.erreur)
      setEtat('erreur')
      return
    }
    setEtat('ok')
  }

  return (
    <div style={{ marginTop: 40, background: '#fff', borderRadius: 18, padding: '26px 28px', border: '1px solid rgba(0, 115, 244, 0.08)', boxShadow: '0 10px 30px -5px rgba(0, 14, 145, 0.05)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 8px' }}>{t.titre}</h2>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>{t.texte}</p>

      {etat === 'ok' ? (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: '#ecfdf5', color: '#065f46', fontSize: 14, fontWeight: 600 }}>{t.merci}</div>
      ) : !ouvert ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={() => setOuvert(true)} style={{ padding: '12px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${BLUE}, ${NAVY})`, color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'inherit' }}>{t.bouton}</button>
          <a href="/verifier" style={{ fontSize: 13, fontWeight: 700, color: NAVY, textDecoration: 'none' }}>{t.espaceParticipant}</a>
          <a href="/intervenant" style={{ fontSize: 13, fontWeight: 700, color: NAVY, textDecoration: 'none' }}>{t.espaceIntervenant}</a>
        </div>
      ) : (
        <form onSubmit={envoyer} style={{ display: 'grid', gap: 12 }}>
          <div><label style={etiquette}>{t.nom} *</label><input style={champ} required maxLength={120} value={f.nom} onChange={maj('nom')} autoComplete="name" /></div>
          <div><label style={etiquette}>{t.email} *</label><input style={champ} type="email" required maxLength={160} value={f.email} onChange={maj('email')} autoComplete="email" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div><label style={etiquette}>{t.organisation}</label><input style={champ} maxLength={160} value={f.organisation} onChange={maj('organisation')} autoComplete="organization" /></div>
            <div><label style={etiquette}>{t.pays}</label><input style={champ} maxLength={80} value={f.pays} onChange={maj('pays')} autoComplete="country-name" /></div>
          </div>
          <div><label style={etiquette}>{t.message}</label><textarea style={{ ...champ, minHeight: 84, resize: 'vertical' }} maxLength={1000} value={f.message} onChange={maj('message')} /></div>
          {/* champ piege : invisible pour les humains */}
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={maj('website')} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
          {etat === 'erreur' && <div style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>{msgErreur}</div>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" disabled={etat === 'envoi'} style={{ padding: '12px 22px', borderRadius: 10, border: 'none', cursor: etat === 'envoi' ? 'wait' : 'pointer', background: `linear-gradient(135deg, ${BLUE}, ${NAVY})`, color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'inherit', opacity: etat === 'envoi' ? 0.7 : 1 }}>{etat === 'envoi' ? t.envoi : t.envoyer}</button>
            <button type="button" onClick={() => setOuvert(false)} style={{ padding: '12px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', color: '#475569' }}>{t.annuler}</button>
          </div>
        </form>
      )}
    </div>
  )
}
