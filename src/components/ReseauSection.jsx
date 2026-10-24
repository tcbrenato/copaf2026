import { useEffect, useMemo, useState } from 'react'

const TR = {
  fr: {
    titre: 'Réseau',
    intro: 'Retrouvez les personnes présentes à la conférence. Pour obtenir le contact WhatsApp de l’une d’elles, envoyez-lui une demande : elle reçoit un mail et décide d’accepter ou non. Rien n’est partagé sans son accord.',
    recherche: 'Rechercher un nom, une organisation, un pays…',
    demander: 'Demander le contact', envoye: 'Demande envoyée', whatsapp: 'Ouvrir WhatsApp',
    indisponible: 'Non disponible', pasContact: 'Contact indisponible', expiree: 'Demande expirée',
    visible: 'Apparaître dans l’annuaire', visibleAide: 'Si vous décochez, les autres ne vous voient plus et ne peuvent plus vous écrire.',
    chargement: 'Chargement…', vide: 'Aucun résultat.', clos: 'Le réseautage est clos.',
    erreur: 'Impossible de charger l’annuaire pour le moment.', erreurDemande: 'La demande n’a pas pu être envoyée. Réessayez plus tard.',
    limite: 'Vous avez atteint la limite de demandes pour aujourd’hui. Réessayez demain.',
  },
  en: {
    titre: 'Network',
    intro: 'Find the people who attended the conference. To get someone’s WhatsApp contact, send them a request: they receive an email and decide whether to accept. Nothing is shared without their consent.',
    recherche: 'Search a name, organisation, country…',
    demander: 'Request contact', envoye: 'Request sent', whatsapp: 'Open WhatsApp',
    indisponible: 'Not available', pasContact: 'Contact unavailable', expiree: 'Request expired',
    visible: 'Appear in the directory', visibleAide: 'If you untick, others no longer see you and cannot contact you.',
    chargement: 'Loading…', vide: 'No result.', clos: 'Networking is now closed.',
    erreur: 'Unable to load the directory right now.', erreurDemande: 'The request could not be sent. Please try again later.',
    limite: 'You have reached today’s request limit. Please try again tomorrow.',
  },
}

const initiales = m => `${(m.prenom || '')[0] || ''}${(m.nom || '')[0] || ''}`.toUpperCase()
const sansAccent = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const bouton = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '9px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap', textDecoration: 'none' }

// `charger` : rpc liste ; `demander(cibleId)` : renvoie { data, error } de la fonction ; `visibilite(bool)` : rpc
export default function ReseauSection({ charger, demander, visibilite, lang = 'fr' }) {
  const t = TR[lang === 'en' ? 'en' : 'fr']
  const [etat, setEtat] = useState('chargement') // chargement | erreur | ok
  const [data, setData] = useState(null)
  const [q, setQ] = useState('')
  const [enCours, setEnCours] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let annule = false
    Promise.resolve(charger())
      .then(({ data: d, error }) => {
        if (annule) return
        if (error || !d) { setEtat('erreur'); return }
        setData(d); setEtat('ok')
      })
      .catch(() => { if (!annule) setEtat('erreur') })
    return () => { annule = true }
  }, [charger])

  const filtres = useMemo(() => {
    if (!data) return []
    const n = sansAccent(q).trim()
    if (!n) return data.membres
    return data.membres.filter(m => sansAccent([m.prenom, m.nom, m.fonction, m.organisation, m.pays].join(' ')).includes(n))
  }, [data, q])

  const majStatut = (id, statut) => setData(d => ({ ...d, membres: d.membres.map(m => (m.id === id ? { ...m, statut } : m)) }))

  const envoyer = async m => {
    setEnCours(m.id); setMessage('')
    try {
      const { data: r, error } = await demander(m.id)
      if (error || !r?.success) {
        let code = r?.error
        try { code = code || (await error?.context?.json?.())?.error } catch { /* corps non JSON */ }
        setMessage(code === 'limite_quotidienne' ? t.limite : t.erreurDemande)
      } else {
        majStatut(m.id, r.statut || 'en_attente')
      }
    } finally {
      setEnCours(null)
    }
  }

  const basculerVisible = async e => {
    const v = e.target.checked
    setData(d => ({ ...d, moi: { ...d.moi, visible: v } }))
    await visibilite(v)
  }

  if (etat === 'chargement') return <div style={{ fontSize: 13, color: '#94a3b8' }}>{t.chargement}</div>
  if (etat === 'erreur') return <div style={{ fontSize: 13, color: '#991b1b' }}>{t.erreur}</div>

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{t.titre}</h3>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 14px' }}>{t.intro}</p>

      {!data.actif && <div style={{ fontSize: 13, color: '#92400e', background: '#fef3c7', padding: '10px 14px', borderRadius: 10, marginBottom: 12 }}>{t.clos}</div>}

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#0f172a', marginBottom: 14, cursor: 'pointer' }}>
        <input type="checkbox" checked={data.moi?.visible !== false} onChange={basculerVisible} style={{ marginTop: 3 }} />
        <span><b>{t.visible}</b><br /><span style={{ color: '#64748b', fontSize: 12 }}>{t.visibleAide}</span></span>
      </label>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.recherche} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', marginBottom: 12 }} />
      {message && <div style={{ fontSize: 13, color: '#991b1b', marginBottom: 10, fontWeight: 600 }}>{message}</div>}

      {filtres.length === 0 && <div style={{ fontSize: 13, color: '#94a3b8' }}>{t.vide}</div>}

      {filtres.map(m => {
        const chiffres = (m.whatsapp || '').replace(/\D/g, '')
        let action
        if (m.statut === 'acceptee' && chiffres) {
          action = <a href={`https://wa.me/${chiffres}`} target="_blank" rel="noreferrer" style={{ ...bouton, background: '#16a34a', color: '#fff' }}>{t.whatsapp}</a>
        } else if (m.statut === 'en_attente') {
          action = <span style={{ ...bouton, background: '#EBF3FF', color: '#000E91' }}>{t.envoye}</span>
        } else if (m.statut === 'refusee') {
          action = <span style={{ ...bouton, background: '#f1f5f9', color: '#94a3b8' }}>{t.indisponible}</span>
        } else if (m.statut === 'expiree') {
          action = <span style={{ ...bouton, background: '#f1f5f9', color: '#94a3b8' }}>{t.expiree}</span>
        } else if (!m.joignable) {
          action = <span style={{ ...bouton, background: '#f1f5f9', color: '#94a3b8' }}>{t.pasContact}</span>
        } else {
          action = <button type="button" disabled={!data.actif || enCours === m.id} onClick={() => envoyer(m)} style={{ ...bouton, cursor: 'pointer', background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', opacity: enCours === m.id ? 0.6 : 1 }}>{t.demander}</button>
        }
        return (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 14, marginBottom: 8, background: '#fff' }}>
            {m.photo_url
              ? <img src={m.photo_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 28%', flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EBF3FF', color: '#000E91', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{initiales(m)}</div>}
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{[m.prenom, m.nom].filter(Boolean).join(' ')}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{[m.fonction, m.organisation].filter(Boolean).join(' · ')}</div>
            </div>
            <div style={{ flexShrink: 0 }}>{action}</div>
          </div>
        )
      })}
    </div>
  )
}
