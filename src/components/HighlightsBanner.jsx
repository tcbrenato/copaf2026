import { Calendar, Plane, Quote, ArrowRight, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCountdown } from '../hooks/useCountdown'

// Dates fixes de l'evenement (calendrier local du visiteur, pas UTC — un
// decompte de jours n'a pas besoin de precision de fuseau horaire).
const EVENT_START_MS = new Date(2026, 9, 19).getTime() // 19 octobre 2026
const EVENT_END_MS = new Date(2026, 9, 21, 23, 59, 59).getTime() // 21 octobre 2026, fin de journee

const HighlightCard = (props) => {
  const Icon = props.icon
  const CtaIcon = props.ctaIcon
  return (
    <div className="highlight-card">
      <div className="highlight-card-icon"><Icon size={22} strokeWidth={2.2} /></div>
      <span className="highlight-card-eyebrow">{props.eyebrow}</span>
      <h3 className="highlight-card-title">{props.title}</h3>
      <p className="highlight-card-subtitle">{props.subtitle}</p>
      <button type="button" className="highlight-card-cta" onClick={props.onCta}>
        <CtaIcon size={16} strokeWidth={2.4} />
        {props.ctaLabel}
      </button>
    </div>
  )
}

const HighlightsBanner = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const daysToStart = useCountdown(EVENT_START_MS)
  const daysToEnd = useCountdown(EVENT_END_MS)

  const countdownTitle =
    daysToStart > 0
      ? t('highlights.countdown.title', { n: daysToStart })
      : daysToEnd >= 0
        ? t('highlights.countdown.startedTitle')
        : t('highlights.countdown.endedTitle')

  return (
    <section className="highlights-banner" aria-label={t('highlights.sectionLabel')}>
      <div className="highlights-banner-inner">
        <HighlightCard
          icon={Calendar}
          eyebrow={t('highlights.countdown.eyebrow')}
          title={countdownTitle}
          subtitle={t('highlights.countdown.subtitle')}
          ctaLabel={t('highlights.countdown.cta')}
          ctaIcon={ArrowRight}
          onCta={() => navigate('/inscription')}
        />
        <HighlightCard
          icon={Plane}
          eyebrow={t('highlights.practicalInfo.eyebrow')}
          title={t('highlights.practicalInfo.title')}
          subtitle={t('highlights.practicalInfo.subtitle')}
          ctaLabel={t('highlights.practicalInfo.cta')}
          ctaIcon={Eye}
          onCta={() => navigate('/infos-pratiques')}
        />
        <HighlightCard
          icon={Quote}
          eyebrow={t('highlights.dgMessage.eyebrow')}
          title={t('highlights.dgMessage.title')}
          subtitle={t('highlights.dgMessage.subtitle')}
          ctaLabel={t('highlights.dgMessage.cta')}
          ctaIcon={Eye}
          onCta={() => navigate('/mot-du-dg')}
        />
      </div>

      <style>{`
        .highlights-banner { padding: clamp(40px, 6vw, 70px) 0; background: #f9fafb; }
        .highlights-banner-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .highlight-card {
          position: relative;
          padding: 30px 26px;
          border-radius: 20px;
          background: linear-gradient(155deg, #00367F 0%, #005CA8 55%, #1798F4 130%);
          box-shadow: 0 15px 40px rgba(0, 54, 127, 0.22);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .highlight-card-icon {
          width: 46px; height: 46px; border-radius: 50%;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          color: #fff; margin-bottom: 18px; flex-shrink: 0;
        }
        .highlight-card-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;
          color: #9fd4ff; margin-bottom: 10px;
        }
        .highlight-card-title {
          font-size: clamp(17px, 1.9vw, 20px); font-weight: 800; color: #fff;
          line-height: 1.3; margin: 0 0 10px;
        }
        .highlight-card-subtitle {
          font-size: 13.5px; color: rgba(255,255,255,0.78); line-height: 1.6;
          margin: 0 0 22px; flex: 1;
        }
        .highlight-card-cta {
          align-self: flex-start;
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #00367F;
          border: none; border-radius: 10px;
          padding: 11px 18px; font-size: 13px; font-weight: 800;
          font-family: inherit; cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .highlight-card-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.18);
        }
        @media (max-width: 900px) {
          .highlights-banner-inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}

export default HighlightsBanner
