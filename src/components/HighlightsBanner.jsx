import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, Plane, Quote, Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCountdown } from '../hooks/useCountdown'

const NAVY = '#000E91'
const BLUE = '#0073F4'

// Dates fixes de l'evenement (calendrier local du visiteur, pas UTC — un
// decompte de jours n'a pas besoin de precision de fuseau horaire).
const EVENT_START_MS = new Date(2026, 9, 19).getTime() // 19 octobre 2026
const EVENT_END_MS = new Date(2026, 9, 21, 23, 59, 59).getTime() // 21 octobre 2026, fin de journee

const HighlightCard = (props) => {
  const Icon = props.icon
  const CtaIcon = props.ctaIcon
  return (
    <div className="highlight-banner-card">
      <div className="highlight-banner-peek" aria-hidden="true" />
      <div className="highlight-banner-main">
        <div className="highlight-banner-icon"><Icon size={38} strokeWidth={1.8} /></div>
        <div className="highlight-banner-body">
          <span className="highlight-banner-eyebrow">{props.eyebrow}</span>
          <h3 className="highlight-banner-title">{props.title}</h3>
          {props.subtitle && <p className="highlight-banner-subtitle">{props.subtitle}</p>}
          <div className="highlight-banner-ctas">
            <button type="button" className="highlight-banner-cta" onClick={props.onCta}>
              <CtaIcon size={16} strokeWidth={2.4} />
              {props.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modale generique — meme mecanique que celle d'Intervenants.jsx (portail
// vers document.body pour echapper au contexte d'empilement du header fixe).
const HighlightModal = ({ onClose, children }) =>
  createPortal((
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10, 17, 40, 0.6)',
        backdropFilter: 'blur(8px)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto', position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            background: 'rgba(0,0,0,0.05)', border: 'none',
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a1128',
          }}
        >
          <X size={18} />
        </button>
        <div style={{ padding: 'clamp(28px, 5vw, 44px)' }}>{children}</div>
      </div>
    </div>
  ), document.body)

const HighlightsBanner = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(null) // null | 'practicalInfo' | 'dgMessage'

  const daysToStart = useCountdown(EVENT_START_MS)
  const daysToEnd = useCountdown(EVENT_END_MS)

  const countdownTitle =
    daysToStart > 0
      ? t('highlights.countdown.title', { n: daysToStart })
      : daysToEnd >= 0
        ? t('highlights.countdown.startedTitle')
        : t('highlights.countdown.endedTitle')

  // Seule la carte "Inscription" quitte cette page : elle defile vers la
  // section /#inscription (deja presente sur la homepage), comme le bouton
  // equivalent du Hero. Les 2 autres cartes ouvrent une modale sur place.
  const handleInscription = () => {
    const el = document.getElementById('inscription')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else navigate('/inscription')
  }

  return (
    <section className="highlights-banner" aria-label={t('highlights.sectionLabel')}>
      <div className="highlights-banner-inner">
        <HighlightCard
          icon={Calendar}
          eyebrow={t('highlights.countdown.eyebrow')}
          title={countdownTitle}
          subtitle={t('highlights.countdown.subtitle')}
          ctaLabel={t('highlights.countdown.cta')}
          ctaIcon={Eye}
          onCta={handleInscription}
        />
        <HighlightCard
          icon={Plane}
          eyebrow={t('highlights.practicalInfo.eyebrow')}
          title={t('highlights.practicalInfo.title')}
          subtitle={t('highlights.practicalInfo.subtitle')}
          ctaLabel={t('highlights.practicalInfo.cta')}
          ctaIcon={Eye}
          onCta={() => setOpenModal('practicalInfo')}
        />
        <HighlightCard
          icon={Quote}
          eyebrow={t('highlights.dgMessage.eyebrow')}
          title={t('highlights.dgMessage.title')}
          subtitle={t('highlights.dgMessage.subtitle')}
          ctaLabel={t('highlights.dgMessage.cta')}
          ctaIcon={Eye}
          onCta={() => setOpenModal('dgMessage')}
        />
      </div>

      {openModal === 'practicalInfo' && (
        <HighlightModal onClose={() => setOpenModal(null)}>
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: '#0a1128', margin: '0 0 12px' }}>
            {t('highlights.practicalInfo.title')}
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 20 }}>
            {t('highlights.practicalInfo.subtitle')}
          </p>
          <div style={{ background: '#edf2f7', borderRadius: 14, padding: 26, borderLeft: `4px solid ${BLUE}`, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, color: NAVY, fontWeight: 700 }}>{t('highlights.practicalInfo.comingSoon')}</p>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: '#64748b', lineHeight: 1.7 }}>{t('highlights.practicalInfo.comingSoonDetail')}</p>
          </div>
        </HighlightModal>
      )}

      {openModal === 'dgMessage' && (
        <HighlightModal onClose={() => setOpenModal(null)}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: BLUE }}>
            {t('highlights.dgMessage.eyebrow')}
          </span>
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: '#0a1128', margin: '10px 0 24px' }}>
            {t('highlights.dgMessage.title')}
          </h3>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 22 }}>
            <img
              src="/odah.png"
              alt="Dr William ODAH"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${BLUE}` }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>Dr William ODAH</p>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>{t('intervenants.odahTitre')} — CRF Perfection</p>
            </div>
          </div>
          <div style={{ background: '#f8faff', borderRadius: 14, padding: 22, border: '1px solid rgba(0,14,145,0.08)' }}>
            <Quote size={26} color={BLUE} style={{ opacity: 0.35, marginBottom: 8 }} />
            {/* TODO: remplacer par la citation officielle du DG — texte placeholder en attendant */}
            <p style={{ fontSize: 15, color: '#1e293b', lineHeight: 1.75, fontStyle: 'italic', margin: 0 }}>
              {t('highlights.dgMessage.placeholderQuote')}
            </p>
          </div>
        </HighlightModal>
      )}

      <style>{`
        .highlights-banner { padding: clamp(40px, 6vw, 70px) 0; background: #f9fafb; }
        .highlights-banner-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 24px;
          display: flex; flex-direction: column; gap: clamp(28px, 4vw, 40px);
        }
        .highlight-banner-card { position: relative; }
        .highlight-banner-peek {
          position: absolute; inset: 14px -10px -14px 24px;
          background: linear-gradient(90deg, #1798F4, #5CC3FF);
          border-radius: 18px;
          z-index: 0;
        }
        .highlight-banner-main {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: clamp(20px, 4vw, 40px);
          padding: clamp(28px, 4vw, 42px) clamp(28px, 5vw, 56px);
          border-radius: 18px;
          background: linear-gradient(90deg, #00204D 0%, #00367F 45%, #1798F4 100%);
          box-shadow: 0 20px 45px rgba(0, 32, 77, 0.25);
        }
        .highlight-banner-icon {
          flex-shrink: 0;
          width: clamp(84px, 9vw, 110px); height: clamp(84px, 9vw, 110px);
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
        }
        .highlight-banner-body { min-width: 0; }
        .highlight-banner-eyebrow {
          display: block;
          font-size: 11.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: #9fd4ff; margin-bottom: 10px;
        }
        .highlight-banner-title {
          font-size: clamp(20px, 2.6vw, 30px); font-weight: 800; color: #fff;
          line-height: 1.25; margin: 0 0 10px; letter-spacing: -0.01em;
        }
        .highlight-banner-subtitle {
          font-size: 14px; color: rgba(255,255,255,0.78); line-height: 1.6;
          margin: 0 0 18px; max-width: 520px;
        }
        .highlight-banner-ctas { display: flex; flex-wrap: wrap; gap: 24px; }
        .highlight-banner-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #7DD3FC;
          border: none; padding: 0;
          font-size: 13px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase;
          font-family: inherit; cursor: pointer;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .highlight-banner-cta:hover { color: #fff; transform: translateX(2px); }
        @media (max-width: 700px) {
          .highlight-banner-main { flex-direction: column; align-items: flex-start; text-align: left; }
          .highlight-banner-peek { inset: 10px -8px -10px 16px; }
        }
      `}</style>
    </section>
  )
}

export default HighlightsBanner
