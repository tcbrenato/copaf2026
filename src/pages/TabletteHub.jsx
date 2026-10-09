import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import LangToggle from '../components/LangToggle'
import { useLang } from '../i18n/useLang'
import { lireJetonEnAttente, oublierJeton, connecterParJeton, verifierSession, lireSession, lireIdentiteLocale, effacerSession } from '../utils/tabletteSession'

const CONTACT_EMAIL = 'contact@copaf-ports.com'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Ico = ({ name, size = 26, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    radar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>,
    poll: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    monitor: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
    users: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    handshake: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-4 4-4-4 4-4"/><path d="M18 12l4 4-4 4-4-4"/><path d="M7 17l4-4 3-3 3 3"/></svg>,
    mail: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    book: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    globe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  }
  return icons[name] || null
}

const TR = {
  fr: {
    welcome: 'Bienvenue à la Conférence des Ports Africains',
    hint: "Touchez une tuile pour accéder à l'outil ou à la section souhaitée.",
    qrAlt: 'QR code',
    scan: 'Scannez pour ouvrir cette page sur votre propre téléphone.',
    bonjour: 'Bonjour',
    chargement: 'Chargement…',
    invalideTitre: 'Lien invalide ou expiré',
    invalideTexte: "Ce lien personnel ne fonctionne plus. Contactez l'organisation COPAF pour en recevoir un nouveau.",
    limiteTexte: "Trop de tentatives. Patientez quelques minutes puis réessayez, ou contactez l'organisation COPAF.",
    reseauTitre: 'Connexion impossible',
    reseauTexte: 'La tablette ne parvient pas à joindre le serveur. Vérifiez le Wi-Fi puis réessayez.',
    reessayer: 'Réessayer',
    contactLabel: 'Contact :',
    horsLigne: 'Connexion perdue — reconnexion automatique dès que le réseau revient',
    tuiles: [
      { titre: 'Diagnostic Smart Port', sousTitre: 'Évaluez la maturité digitale de votre port', href: '/diagnostic', icone: 'radar', accent: true },
      { titre: 'Sondage en direct', sousTitre: 'Votez en temps réel pendant les sessions', href: '/vote', icone: 'poll', accent: true },
      { titre: 'Programme', sousTitre: 'Le déroulé complet des 3 jours', href: '/#programme', icone: 'calendar' },
      { titre: 'Livret du participant', sousTitre: 'À remplir avec Adobe Acrobat Reader (gratuit)', href: '/docs/COPAF_2026_Livret_Participant.pdf', icone: 'book', telechargement: true },
      { titre: 'Exposition digitale', sousTitre: 'Découvrez les solutions présentées', href: '/exposition-digitale', icone: 'monitor' },
      { titre: 'Intervenants', sousTitre: 'Qui parle, et à quel moment', href: '/#intervenants', icone: 'users' },
      { titre: 'Partenaires', sousTitre: 'Ils soutiennent la COPAF 2026', href: '/partenariats', icone: 'handshake' },
      { titre: 'Contact', sousTitre: 'Une question ? Écrivez-nous', href: '/#contact', icone: 'mail' },
    ],
  },
  en: {
    welcome: 'Welcome to the African Ports Conference',
    hint: 'Tap a tile to open the tool or section you want.',
    qrAlt: 'QR code',
    scan: 'Scan to open this page on your own phone.',
    bonjour: 'Hello',
    chargement: 'Loading…',
    invalideTitre: 'Invalid or expired link',
    invalideTexte: 'This personal link no longer works. Please contact the COPAF organisation to get a new one.',
    limiteTexte: 'Too many attempts. Please wait a few minutes and try again, or contact the COPAF organisation.',
    reseauTitre: 'Cannot connect',
    reseauTexte: 'The tablet cannot reach the server. Check the Wi-Fi and try again.',
    reessayer: 'Try again',
    contactLabel: 'Contact:',
    horsLigne: 'Connection lost — reconnecting automatically when the network is back',
    tuiles: [
      { titre: 'Smart Port Diagnostic', sousTitre: "Assess your port's digital maturity", href: '/diagnostic', icone: 'radar', accent: true },
      { titre: 'Live poll', sousTitre: 'Vote in real time during the sessions', href: '/vote', icone: 'poll', accent: true },
      { titre: 'Programme', sousTitre: 'The full schedule of the 3 days', href: '/#programme', icone: 'calendar' },
      { titre: 'Participant notebook', sousTitre: 'Fill it in with Adobe Acrobat Reader (free)', href: '/docs/COPAF_2026_Livret_Participant.pdf', icone: 'book', telechargement: true },
      { titre: 'Digital exhibition', sousTitre: 'Discover the solutions on show', href: '/exposition-digitale', icone: 'monitor' },
      { titre: 'Speakers', sousTitre: 'Who is speaking, and when', href: '/#intervenants', icone: 'users' },
      { titre: 'Partners', sousTitre: 'They support COPAF 2026', href: '/partenariats', icone: 'handshake' },
      { titre: 'Contact', sousTitre: 'A question? Write to us', href: '/#contact', icone: 'mail' },
    ],
  },
}

const FOND = '#0000A6'

// Plein écran sur tablette 8-10 pouces (portrait et paysage) : grandes zones tactiles, aucun survol requis.
function useEnLigne() {
  const [enLigne, setEnLigne] = useState(typeof navigator === 'undefined' ? true : navigator.onLine !== false)
  const etaitHorsLigne = useRef(false)
  useEffect(() => {
    const perdu = () => { etaitHorsLigne.current = true; setEnLigne(false) }
    const revenu = () => {
      setEnLigne(true)
      // Retour du réseau après une coupure : rechargement automatique pour repartir d'un état propre
      if (etaitHorsLigne.current) window.location.reload()
    }
    window.addEventListener('offline', perdu)
    window.addEventListener('online', revenu)
    return () => { window.removeEventListener('offline', perdu); window.removeEventListener('online', revenu) }
  }, [])
  return enLigne
}

function EcranMessage({ copy, titre, texte, onReessayer }) {
  return (
    <div style={{ minHeight: '100vh', background: FOND, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ display: 'inline-block', background: '#fff', borderRadius: 14, padding: '10px 18px', marginBottom: 28 }}>
          <img src="/logocopaf.png" alt="COPAF" style={{ height: 44, width: 'auto', display: 'block' }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>{titre}</div>
        <p style={{ fontSize: 17, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', margin: '0 0 24px' }}>{texte}</p>
        {onReessayer && (
          <button type="button" onClick={onReessayer} style={{ minHeight: 56, padding: '0 32px', borderRadius: 14, border: 'none', background: '#fff', color: FOND, fontSize: 17, fontWeight: 800, cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit' }}>
            {copy.reessayer}
          </button>
        )}
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)' }}>
          {copy.contactLabel} <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#fff', fontWeight: 800 }}>{CONTACT_EMAIL}</a>
        </div>
      </div>
    </div>
  )
}

export default function TabletteHub() {
  const copy = TR[useLang()]
  const [qrDataUrl, setQrDataUrl] = useState('')
  // chargement | ok | public | invalide | limite | reseau  (sans lien ni session : accueil public tout de suite)
  const [etat, setEtat] = useState(() => (lireJetonEnAttente() || lireSession() ? 'chargement' : 'public'))
  const [identite, setIdentite] = useState(null)
  const enLigne = useEnLigne()

  const demarrer = useCallback(async () => {
    const jeton = lireJetonEnAttente()
    if (jeton) {
      const r = await connecterParJeton(jeton)
      if (r.statut === 'reseau') {
        // Pas de réseau : on garde le jeton (non consommé) pour réessayer ; si une session existe déjà, on l'utilise.
        setIdentite(lireIdentiteLocale())
        setEtat(lireSession() ? 'ok' : 'reseau')
        return
      }
      oublierJeton()
      if (r.statut === 'ok') { setIdentite(r.identite); setEtat('ok') } else setEtat(r.statut)
      return
    }
    const r = await verifierSession()
    if (r.statut === 'ok') { setIdentite(r.identite); setEtat('ok') }
    else if (r.statut === 'reseau') { setIdentite(lireIdentiteLocale()); setEtat('ok') }
    else { effacerSession(); setIdentite(null); setEtat('invalide') }
  }, [])

  const reessayer = () => { setEtat('chargement'); demarrer() }

  useEffect(() => {
    if (etat !== 'chargement') return undefined
    const t = setTimeout(demarrer, 0)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Révocation immédiate : la session est revérifiée toutes les 5 minutes et au retour sur la tablette
  useEffect(() => {
    if (etat !== 'ok') return undefined
    const verifier = async () => {
      if (!lireSession()) return
      const r = await verifierSession()
      if (r.statut === 'ok') setIdentite(r.identite)
      else if (r.statut === 'invalide') { effacerSession(); setIdentite(null); setEtat('invalide') }
    }
    const minuteur = setInterval(verifier, 5 * 60 * 1000)
    const auRetour = () => { if (!document.hidden) verifier() }
    document.addEventListener('visibilitychange', auRetour)
    return () => { clearInterval(minuteur); document.removeEventListener('visibilitychange', auRetour) }
  }, [etat])

  useEffect(() => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/tablette` : 'https://copaf-ports.com/tablette'
    QRCode.toDataURL(url, { margin: 1, width: 200, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => {})
  }, [])

  if (etat === 'chargement') {
    return <EcranMessage copy={copy} titre={copy.chargement} texte="" />
  }
  if (etat === 'invalide' || etat === 'limite') {
    return <EcranMessage copy={copy} titre={copy.invalideTitre} texte={etat === 'limite' ? copy.limiteTexte : copy.invalideTexte} />
  }
  if (etat === 'reseau') {
    return <EcranMessage copy={copy} titre={copy.reseauTitre} texte={copy.reseauTexte} onReessayer={reessayer} />
  }

  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '0 20px 40px', color: '#f8fafc', background: FOND }
  const bgImage = { position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: -2, backgroundColor: FOND, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }
  const bgOverlay = { position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: -1, backgroundImage: 'linear-gradient(180deg, rgba(0,0,166,0.55) 0%, rgba(0,0,90,0.85) 100%)' }
  const nomComplet = identite ? `${identite.prenom || ''} ${identite.nom || ''}`.trim() : ''

  return (
    <div style={wrap}>
      <div style={bgImage} />
      <div style={bgOverlay} />

      {!enLigne && (
        <div role="status" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#b91c1c', color: '#fff', textAlign: 'center', padding: '12px 16px', fontSize: 16, fontWeight: 800 }}>
          {copy.horsLigne}
        </div>
      )}

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', margin: '0 -20px 28px', padding: '16px 150px 16px 24px', background: FOND, borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '8px 16px', marginRight: 16, marginBottom: 4 }}>
          <img src="/logocopaf.png" alt="COPAF 2026" style={{ height: 40, width: 'auto', display: 'block' }} />
        </div>
        {nomComplet ? (
          <div style={{ textAlign: 'right', marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{copy.bonjour}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{nomComplet}</div>
            {identite && identite.organisation && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{identite.organisation}</div>}
          </div>
        ) : <div />}
      </header>
      <LangToggle />

      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8 }}>
            {copy.welcome}
          </div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            {copy.hint}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {copy.tuiles.map(t => (
            <a
              key={t.href}
              href={t.href}
              {...(t.telechargement ? { download: true, target: '_blank', rel: 'noopener' } : {})}
              style={{
                display: 'flex', flexDirection: 'column', padding: '26px 22px',
                borderRadius: 20, textDecoration: 'none', cursor: 'pointer',
                background: t.accent ? 'linear-gradient(135deg, rgba(0,115,244,0.45), rgba(0,14,145,0.6))' : 'rgba(10, 16, 60, 0.72)',
                border: t.accent ? '1px solid rgba(96,165,250,0.6)' : '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                minHeight: 150,
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14, marginBottom: 14,
                background: t.accent ? 'linear-gradient(135deg,#0073F4,#000E91)' : 'rgba(96,165,250,0.15)',
                border: t.accent ? 'none' : '1px solid rgba(96,165,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ico name={t.icone} size={26} color={t.accent ? '#fff' : '#60a5fa'} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.titre}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{t.sousTitre}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10, 16, 60, 0.7)', border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 20, padding: 20, maxWidth: 440, margin: '0 auto',
        }}>
          {qrDataUrl && (
            <img src={qrDataUrl} alt={copy.qrAlt} style={{ width: 84, height: 84, borderRadius: 8, flexShrink: 0, marginRight: 20 }} />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <Ico name="globe" size={14} color="#93c5fd" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginLeft: 6 }}>copaf-ports.com/tablette</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
              {copy.scan}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
