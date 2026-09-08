import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import worldAtlas from 'world-atlas/countries-50m.json'
import { AGPAOC_UAPNA_COUNTRIES, NEUTRAL_COUNTRY_COLOR } from '../data/agpaocUapnaCountries'

const NUMERIC_TO_COUNTRY = new Map(AGPAOC_UAPNA_COUNTRIES.map((c) => [c.isoNumeric, c]))

// Degrade d'intensite navy (0 inscrit) -> sky blue (maximum d'inscrits parmi
// les pays AGPAOC/UAPNA), pour un rendu "carte de chaleur" simple sans
// dependance externe de colorimetrie.
function intensityColor(count, max) {
  if (count <= 0) return '#e2e8f0'
  const t = max > 0 ? count / max : 0
  const from = [0, 54, 127]   // #00367F
  const to = [23, 152, 244]   // #1798F4
  const rgb = from.map((c, i) => Math.round(c + (to[i] - c) * t))
  return `rgb(${rgb.join(',')})`
}

export default function SgInscriptionsMap({ countsByCountry }) {
  const max = Math.max(0, ...AGPAOC_UAPNA_COUNTRIES.map((c) => countsByCountry.get(c.name_fr) || 0))

  return (
    <div className="sg-map-card">
      <h3 className="sg-map-title">Répartition géographique</h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 300, center: [18, 4] }}
        width={760}
        height={640}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={worldAtlas}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const country = NUMERIC_TO_COUNTRY.get(geo.id)
              const count = country ? (countsByCountry.get(country.name_fr) || 0) : 0
              const fill = country ? intensityColor(count, max) : NEUTRAL_COUNTRY_COLOR
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="rgba(15,23,42,0.2)"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', opacity: country ? 0.85 : 1, cursor: country ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                >
                  {country && <title>{`${country.name_fr} — ${count} participant${count > 1 ? 's' : ''}`}</title>}
                </Geography>
              )
            })
          }
        </Geographies>
      </ComposableMap>

      <div className="sg-map-legend">
        <span className="sg-map-legend-label">Moins</span>
        <div className="sg-map-legend-bar" />
        <span className="sg-map-legend-label">Plus</span>
      </div>

      <style>{`
        .sg-map-card { background: #fff; border-radius: 16px; padding: clamp(20px, 3vw, 32px); border: 1px solid rgba(0,54,127,0.08); box-shadow: 0 8px 24px rgba(0,54,127,0.05); }
        .sg-map-title { font-size: 15px; font-weight: 800; color: #0a1128; margin: 0 0 16px; }
        .sg-map-legend { display: flex; align-items: center; gap: 10px; margin-top: 14px; max-width: 220px; }
        .sg-map-legend-label { font-size: 11px; color: #94a3b8; font-weight: 600; }
        .sg-map-legend-bar { flex: 1; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #e2e8f0, #00367F, #1798F4); }
      `}</style>
    </div>
  )
}
