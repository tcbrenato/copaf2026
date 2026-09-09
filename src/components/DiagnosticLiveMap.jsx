import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import worldAtlas from 'world-atlas/countries-50m.json'
import { COUNTRY_ISO_BY_NAME, RESEAU_COLORS, NEUTRAL_COUNTRY_COLOR } from '../data/diagnosticCountries'

const COUNTRY_BY_NUMERIC = new Map(
  Object.entries(COUNTRY_ISO_BY_NAME).map(([name, c]) => [c.isoNumeric, { name, ...c }])
)

// Carte vectorielle des pays couverts par le Diagnostic Smart Port, coloree
// par reseau regional, avec un point de signal pulsant pour chaque pays ou
// au moins une personne repond actuellement (presence Realtime) — meme
// technique de rendu (react-simple-maps + world-atlas) que la carte
// AGPAOC/UAPNA de la page d'accueil (src/components/MapAgpaocUapna.jsx),
// etendue aux pays PMAESA et associes que le diagnostic couvre en plus.
export default function DiagnosticLiveMap({ liveCountries }) {
  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 340, center: [18, 4] }}
      width={760}
      height={720}
      style={{ width: '100%', height: 'auto' }}
    >
      <Geographies geography={worldAtlas}>
        {({ geographies }) =>
          geographies.map(geo => {
            const country = COUNTRY_BY_NUMERIC.get(geo.id)
            const fill = country ? RESEAU_COLORS[country.network] : NEUTRAL_COUNTRY_COLOR
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={fill}
                stroke="rgba(248,250,252,0.18)"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none', opacity: country ? 0.85 : 0.5 },
                  hover: { outline: 'none', opacity: country ? 0.85 : 0.5 },
                  pressed: { outline: 'none' },
                }}
              />
            )
          })
        }
      </Geographies>

      {Object.entries(COUNTRY_ISO_BY_NAME)
        .filter(([name]) => liveCountries.has(name))
        .map(([name, c]) => (
          <Marker key={name} coordinates={c.center}>
            <circle r={5} fill="#22c55e" opacity={0.95}>
              <animate attributeName="r" values="5;11;5" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.95;0.15;0.95" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle r={3} fill="#f0fdf4" />
          </Marker>
        ))}
    </ComposableMap>
  )
}
