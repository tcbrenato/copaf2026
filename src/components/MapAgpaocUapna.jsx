import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import worldAtlas from 'world-atlas/countries-50m.json'
import { AGPAOC_UAPNA_COUNTRIES, GROUP_COLORS, NEUTRAL_COUNTRY_COLOR } from '../data/agpaocUapnaCountries'

const CYCLE_MS = 4000
const CLICK_PAUSE_MS = 6000 // pause auto-cycle apres un tap tactile, puis reprise (usage kiosque/tablette)

const COUNTRY_BY_NUMERIC = new Map(AGPAOC_UAPNA_COUNTRIES.map((c) => [c.isoNumeric, c]))

const GROUP_LABELS = {
  fr: { AGPAOC: 'AGPAOC', UAPNA: 'UAPNA', DUAL: 'Double appartenance' },
  en: { AGPAOC: 'AGPAOC', UAPNA: 'UAPNA', DUAL: 'Dual membership' },
}

const UI_TEXT = {
  fr: {
    eyebrow: 'Réseau AGPAOC — UAPNA',
    title: 'Une communauté portuaire panafricaine',
    subtitle: 'Découvrez les autorités portuaires membres de l’AGPAOC et de l’UAPNA à travers le continent.',
    portsLabel: 'Autorité(s) portuaire(s)',
    timeLabel: 'Heure locale',
    hint: 'Survolez ou touchez un pays pour l’explorer.',
  },
  en: {
    eyebrow: 'AGPAOC — UAPNA network',
    title: 'A pan-African port community',
    subtitle: 'Explore the port authorities that make up AGPAOC and UAPNA across the continent.',
    portsLabel: 'Port authority(ies)',
    timeLabel: 'Local time',
    hint: 'Hover or tap a country to explore it.',
  },
}

export default function MapAgpaocUapna() {
  const { i18n } = useTranslation()
  const isEn = i18n.language?.toLowerCase().startsWith('en')
  const lang = isEn ? 'en' : 'fr'
  const T = UI_TEXT[lang]

  // Index 0 = premier pays de la liste : rendu statique non vide, requis pour
  // que le pre-rendu (scripts/prerender.mjs, Puppeteer) capture un contenu
  // reel plutot qu'un panneau vide au premier paint.
  const [activeIndex, setActiveIndex] = useState(0)
  const [now, setNow] = useState(() => new Date())

  const cycleRef = useRef(null)
  const resumeTimeoutRef = useRef(null)
  const pausedRef = useRef(false)

  const activeCountry = AGPAOC_UAPNA_COUNTRIES[activeIndex]

  // Slideshow automatique — cycle toutes les ~4s tant qu'aucune interaction
  // (survol souris / tap tactile) ne met en pause.
  useEffect(() => {
    cycleRef.current = setInterval(() => {
      if (pausedRef.current) return
      setActiveIndex((i) => (i + 1) % AGPAOC_UAPNA_COUNTRIES.length)
    }, CYCLE_MS)
    return () => clearInterval(cycleRef.current)
  }, [])

  // Horloge locale du pays actif — remise a l'heure chaque seconde,
  // nettoyee a chaque changement de pays ou demontage.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [activeCountry.isoNumeric])

  useEffect(() => () => clearTimeout(resumeTimeoutRef.current), [])

  const handleEnter = (numeric) => {
    const country = COUNTRY_BY_NUMERIC.get(numeric)
    if (!country) return
    pausedRef.current = true
    clearTimeout(resumeTimeoutRef.current)
    setActiveIndex(AGPAOC_UAPNA_COUNTRIES.indexOf(country))
  }

  const handleLeave = () => {
    pausedRef.current = false
  }

  // Parite tactile : un tap equivaut a un survol, puis la reprise du cycle
  // est programmee automatiquement (pas de "mouseleave" sur tablette/mobile).
  const handleClick = (numeric) => {
    const country = COUNTRY_BY_NUMERIC.get(numeric)
    if (!country) return
    pausedRef.current = true
    clearTimeout(resumeTimeoutRef.current)
    setActiveIndex(AGPAOC_UAPNA_COUNTRIES.indexOf(country))
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false
    }, CLICK_PAUSE_MS)
  }

  let clockText = '--:--:--'
  try {
    clockText = new Intl.DateTimeFormat(isEn ? 'en-GB' : 'fr-FR', {
      timeZone: activeCountry.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now)
  } catch {
    // fuseau invalide : on garde le placeholder plutot que de casser le rendu
  }

  return (
    <section className="agpaoc-map-section" aria-labelledby="agpaoc-map-title">
      <div className="agpaoc-map-inner">
        <div className="agpaoc-map-heading">
          <span className="agpaoc-map-eyebrow">{T.eyebrow}</span>
          <h2 id="agpaoc-map-title">{T.title}</h2>
          <p>{T.subtitle}</p>
        </div>

        <div className="agpaoc-map-layout">
          <div className="agpaoc-map-canvas">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 340, center: [18, 4] }}
              width={760}
              height={720}
              style={{ width: '100%', height: 'auto' }}
            >
              <Geographies geography={worldAtlas}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const country = COUNTRY_BY_NUMERIC.get(geo.id)
                    const isActive = country && country.isoNumeric === activeCountry.isoNumeric
                    const fill = country ? GROUP_COLORS[country.group] : NEUTRAL_COUNTRY_COLOR

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isActive ? fill : country ? fill : NEUTRAL_COUNTRY_COLOR}
                        stroke={isActive ? '#ffffff' : 'rgba(15,23,42,0.25)'}
                        strokeWidth={isActive ? 1.6 : 0.4}
                        style={{
                          default: { outline: 'none', opacity: country ? (isActive ? 1 : 0.82) : 1, transition: 'opacity 0.25s, fill 0.25s' },
                          hover: { outline: 'none', opacity: 1, cursor: country ? 'pointer' : 'default' },
                          pressed: { outline: 'none' },
                        }}
                        onMouseEnter={() => country && handleEnter(geo.id)}
                        onMouseLeave={() => country && handleLeave()}
                        onClick={() => country && handleClick(geo.id)}
                      />
                    )
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          <aside className="agpaoc-map-card" aria-live="polite">
            <span className="agpaoc-map-card-label">{GROUP_LABELS[lang][activeCountry.group]}</span>
            <div className="agpaoc-map-status" style={{ backgroundColor: GROUP_COLORS[activeCountry.group] }} />
            <h3>{lang === 'en' ? activeCountry.name_en : activeCountry.name_fr}</h3>
            <dl>
              <div>
                <dt>{T.portsLabel}</dt>
                <dd>{activeCountry.ports}</dd>
              </div>
              <div>
                <dt>{T.timeLabel}</dt>
                <dd className="agpaoc-map-clock">{clockText}</dd>
              </div>
            </dl>

            <ul className="agpaoc-map-legend">
              <li><span className="dot" style={{ background: GROUP_COLORS.AGPAOC }} />{GROUP_LABELS[lang].AGPAOC}</li>
              <li><span className="dot" style={{ background: GROUP_COLORS.UAPNA }} />{GROUP_LABELS[lang].UAPNA}</li>
              <li><span className="dot" style={{ background: GROUP_COLORS.DUAL }} />{GROUP_LABELS[lang].DUAL}</li>
            </ul>

            <p className="agpaoc-map-hint">{T.hint}</p>
          </aside>
        </div>
      </div>

      <style>{`
        .agpaoc-map-section { background: #0f172a; color: #f8fafc; overflow: hidden; }
        .agpaoc-map-inner { max-width: 1240px; margin: 0 auto; padding: clamp(56px, 8vw, 96px) 24px; }
        .agpaoc-map-heading { max-width: 680px; margin-bottom: 26px; }
        .agpaoc-map-eyebrow { color: #1798F4; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
        .agpaoc-map-heading h2 { margin: 12px 0 14px; color: #fff; font-size: clamp(26px, 3.6vw, 44px); line-height: 1.1; }
        .agpaoc-map-heading p { margin: 0; color: #94a3b8; font-size: 16px; line-height: 1.7; }
        .agpaoc-map-layout { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(260px, 360px); align-items: center; gap: clamp(20px, 5vw, 60px); }
        .agpaoc-map-canvas { width: 100%; min-width: 0; }
        .agpaoc-map-card { position: relative; padding: 26px; border: 1px solid rgba(23,152,244,.3); border-radius: 8px; background: linear-gradient(145deg, rgba(15,52,96,.95), rgba(15,23,42,.96)); box-shadow: 0 20px 60px rgba(0,0,0,.24); }
        .agpaoc-map-card-label { color: #7dd3fc; font-size: 11px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
        .agpaoc-map-status { width: 38px; height: 4px; margin: 18px 0 14px; border-radius: 2px; }
        .agpaoc-map-card h3 { margin: 0 0 20px; color: #fff; font-size: clamp(20px, 2.2vw, 27px); line-height: 1.2; }
        .agpaoc-map-card dl { margin: 0; }
        .agpaoc-map-card dl div { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid rgba(148,163,184,.2); }
        .agpaoc-map-card dt { color: #94a3b8; font-size: 13px; flex-shrink: 0; }
        .agpaoc-map-card dd { margin: 0; color: #e0f2fe; font-size: 13px; font-weight: 700; text-align: right; }
        .agpaoc-map-clock { font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }
        .agpaoc-map-legend { list-style: none; display: flex; flex-wrap: wrap; gap: 10px 18px; margin: 20px 0 0; padding: 16px 0 0; border-top: 1px solid rgba(148,163,184,.2); }
        .agpaoc-map-legend li { display: flex; align-items: center; gap: 8px; color: #cbd5e1; font-size: 12px; }
        .agpaoc-map-legend .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .agpaoc-map-hint { margin: 18px 0 0; color: #64748b; font-size: 12px; line-height: 1.5; }
        @media (max-width: 760px) {
          .agpaoc-map-layout { grid-template-columns: 1fr; }
          .agpaoc-map-card { max-width: 520px; width: 100%; margin: 0 auto; }
        }
      `}</style>
    </section>
  )
}
