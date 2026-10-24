import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SeoHead from '../components/SeoHead'

const TR = {
  fr: {
    titre: 'Demande de contact',
    veut: 'souhaite obtenir votre contact WhatsApp pour poursuivre l’échange après la conférence.',
    numero: 'Numéro WhatsApp à partager (avec l’indicatif du pays)', numeroEx: 'ex. +229 01 23 45 67',
    consent: 'En acceptant, vous autorisez le partage de ce numéro uniquement avec cette personne. Vous pouvez refuser : rien ne sera communiqué.',
    accepter: 'Accepter et partager', refuser: 'Refuser', envoi: 'Envoi…',
    okAccepte: 'Merci. Votre contact a été partagé avec cette personne.', okRefuse: 'C’est noté. Aucun contact n’a été partagé.',
    deja: 'Vous avez déjà répondu à cette demande.', expiree: 'Cette demande a expiré.', introuvable: 'Ce lien n’est pas valide.',
    clos: 'Le réseautage est clos.', numInvalide: 'Numéro invalide. Saisissez-le avec l’indicatif du pays.', erreur: 'Une erreur est survenue. Réessayez.',
    chargement: 'Chargement…',
  },
  en: {
    titre: 'Contact request',
    veut: 'would like your WhatsApp contact to continue the conversation after the conference.',
    numero: 'WhatsApp number to share (with country code)', numeroEx: 'e.g. +234 801 234 5678',
    consent: 'By accepting, you allow this number to be shared with this person only. You may decline: nothing will be shared.',
    accepter: 'Accept and share', refuser: 'Decline', envoi: 'Sending…',
    okAccepte: 'Thank you. Your contact has been shared with this person.', okRefuse: 'Noted. No contact has been shared.',
    deja: 'You have already replied to this request.', expiree: 'This request has expired.', introuvable: 'This link is not valid.',
    clos: 'Networking is now closed.', numInvalide: 'Invalid number. Enter it with the country code.', erreur: 'Something went wrong. Please try again.',
    chargement: 'Loading…',
  },
}

const carte = { maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 18, padding: '28px 26px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -8px rgba(0,14,145,.12)' }

export default function ReseauReponse() {
  const token = new URLSearchParams(window.location.search).get('t') || ''
  const [info, setInfo] = useState(undefined) // undefined = chargement, null = introuvable
  const [numero, setNumero] = useState('')
  const [fin, setFin] = useState('') // '' | accepte | refuse
  const [envoi, setEnvoi] = useState(false)
  const [err, setErr] = useState('')
  const [langueForcee, setLangueForcee] = useState(null)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  useEffect(() => {
    let annule = false
    supabase.functions.invoke('reseau', { body: { action: 'infos', token } }).then(async ({ data, error }) => {
      if (annule) return
      if (error || !data) {
        let code = ''
        try { code = (await error?.context?.json?.())?.error } catch { /* corps non JSON */ }
        setInfo(code === 'service_clos' ? { clos: true } : null)
        return
      }
      setInfo(data)
      if (data.cible?.telephone_suggere) setNumero(data.cible.telephone_suggere)
    })
    return () => { annule = true }
  }, [token])

  const lang = langueForcee || info?.langue || 'fr'
  const t = TR[lang === 'en' ? 'en' : 'fr']

  const repondre = async accepter => {
    setEnvoi(true); setErr('')
    const { data, error } = await supabase.functions.invoke('reseau', { body: { action: 'repondre', token, accepter, whatsapp: numero } })
    setEnvoi(false)
    if (error || !data?.success) {
      let code = data?.error
      try { code = code || (await error?.context?.json?.())?.error } catch { /* corps non JSON */ }
      if (code === 'numero_invalide') setErr(t.numInvalide)
      else if (code === 'deja_repondu') setInfo(i => ({ ...i, statut: 'acceptee' }))
      else if (code === 'expiree') setInfo(i => ({ ...i, statut: 'expiree' }))
      else setErr(t.erreur)
      return
    }
    setFin(accepter ? 'accepte' : 'refuse')
  }

  let contenu
  if (info === undefined) contenu = <p style={{ color: '#64748b' }}>{t.chargement}</p>
  else if (info === null) contenu = <p style={{ color: '#991b1b', fontWeight: 600 }}>{t.introuvable}</p>
  else if (info.clos) contenu = <p style={{ color: '#92400e', fontWeight: 600 }}>{t.clos}</p>
  else if (fin) contenu = <p style={{ color: fin === 'accepte' ? '#065f46' : '#334155', fontWeight: 700, fontSize: 15 }}>{fin === 'accepte' ? t.okAccepte : t.okRefuse}</p>
  else if (info.statut === 'expiree') contenu = <p style={{ color: '#92400e', fontWeight: 600 }}>{t.expiree}</p>
  else if (info.statut !== 'en_attente') contenu = <p style={{ color: '#334155', fontWeight: 600 }}>{t.deja}</p>
  else {
    const d = info.demandeur
    contenu = (
      <>
        <div style={{ background: '#F3F6FA', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{[d.prenom, d.nom].filter(Boolean).join(' ')}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{[d.fonction, d.organisation].filter(Boolean).join(' · ')}</div>
        </div>
        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.55, margin: '0 0 16px' }}>{t.veut}</p>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 5 }}>{t.numero}</label>
        <input value={numero} onChange={e => setNumero(e.target.value)} placeholder={t.numeroEx} inputMode="tel" autoComplete="tel" style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, fontFamily: 'inherit' }} />
        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: '10px 0 16px' }}>{t.consent}</p>
        {err && <div style={{ fontSize: 13, color: '#991b1b', fontWeight: 600, marginBottom: 10 }}>{err}</div>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" disabled={envoi} onClick={() => repondre(true)} style={{ flex: '1 1 180px', padding: '13px 20px', borderRadius: 10, border: 'none', cursor: envoi ? 'wait' : 'pointer', background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'inherit' }}>{envoi ? t.envoi : t.accepter}</button>
          <button type="button" disabled={envoi} onClick={() => repondre(false)} style={{ flex: '0 1 120px', padding: '13px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', color: '#475569' }}>{t.refuser}</button>
        </div>
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: '40px 16px' }}>
      <SeoHead title="COPAF 2026" description="" type="website" />
      <div style={{ ...carte }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: '#0073F4' }}>COPAF 2026</div>
          <button type="button" onClick={() => setLangueForcee(lang === 'en' ? 'fr' : 'en')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#475569', fontFamily: 'inherit' }}>{lang === 'en' ? 'FR' : 'EN'}</button>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#00367F', margin: '0 0 14px' }}>{t.titre}</h1>
        {contenu}
      </div>
    </div>
  )
}
