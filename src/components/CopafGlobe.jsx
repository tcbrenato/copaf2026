import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Globe from 'react-globe.gl'

export const PORTS = [
  { name: 'Port Autonome de Cotonou', country: 'Bénin', lat: 6.35, lng: 2.43, org: 'AGPAOC', traffic: '4,8 Mt / an' },
  { name: 'Port Autonome de Lomé', country: 'Togo', lat: 6.13, lng: 1.28, org: 'AGPAOC', traffic: '30,6 Mt / an' },
  { name: 'Port Autonome de Douala', country: 'Cameroun', lat: 4.05, lng: 9.7, org: 'AGPAOC', traffic: '15,2 Mt / an' },
  { name: 'Agence Nationale des Ports / Casablanca', country: 'Maroc', lat: 33.59, lng: -7.62, org: 'UAPNA', traffic: '35,0 Mt / an' },
  { name: "Port Autonome d'Abidjan", country: "Côte d'Ivoire", lat: 5.32, lng: -4.03, org: 'AGPAOC', traffic: '34,0 Mt / an' },
  { name: 'Port Autonome de Dakar', country: 'Sénégal', lat: 14.69, lng: -17.44, org: 'AGPAOC', traffic: '23,0 Mt / an' },
]

const ORG_COLOR = { AGPAOC: '#00367F', UAPNA: '#1798F4' }
const ATMOSPHERE_COLOR = new THREE.Color('#1798F4').getStyle()

export default function CopafGlobe() {
  const globeRef = useRef(null)
  const globeContainerRef = useRef(null)
  const [globeSize, setGlobeSize] = useState(560)
  const [hoveredPort, setHoveredPort] = useState(null)
  const [selectedPort, setSelectedPort] = useState(PORTS[0])

  useEffect(() => {
    const container = globeContainerRef.current
    if (!container) return undefined

    const resize = () => setGlobeSize(Math.min(container.clientWidth, 560))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    const controls = globe.controls()
    controls.autoRotate = !hoveredPort
    controls.autoRotateSpeed = 0.45

    if (hoveredPort) {
      setSelectedPort(hoveredPort)
      globe.pointOfView({ lat: hoveredPort.lat, lng: hoveredPort.lng, altitude: 1.8 }, 900)
    }
  }, [hoveredPort])

  return (
    <section className="copaf-globe-section" aria-labelledby="copaf-globe-title">
      <div className="copaf-globe-inner">
        <div className="copaf-globe-heading">
          <span className="copaf-globe-eyebrow">Réseau portuaire africain</span>
          <h2 id="copaf-globe-title">Une même vision, des ports connectés</h2>
          <p>Explorez les portes maritimes qui font vivre la coopération portée par la COPAF 2026.</p>
        </div>

        <div className="copaf-globe-layout">
          <div ref={globeContainerRef} className="copaf-globe-canvas">
            <Globe
              ref={globeRef}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundColor="rgba(0,0,0,0)"
              atmosphereColor={ATMOSPHERE_COLOR}
              atmosphereAltitude={0.18}
              rendererConfig={{ antialias: true, alpha: true }}
              pointsData={PORTS}
              pointLat={(port) => port.lat}
              pointLng={(port) => port.lng}
              pointColor={(port) => ORG_COLOR[port.org]}
              pointAltitude={(port) => (port === hoveredPort ? 0.08 : 0.018)}
              pointRadius={(port) => (port === hoveredPort ? 0.65 : 0.42)}
              pointLabel={(port) => `${port.name} - ${port.country}`}
              onPointHover={setHoveredPort}
              width={globeSize}
              height={globeSize}
            />
          </div>

          <aside className="copaf-globe-card" aria-live="polite">
            <span className="copaf-globe-card-label">Port sélectionné</span>
            <div className="copaf-globe-status" style={{ backgroundColor: ORG_COLOR[selectedPort.org] }} />
            <h3>{selectedPort.name}</h3>
            <dl>
              <div><dt>Pays</dt><dd>{selectedPort.country}</dd></div>
              <div><dt>Organisation</dt><dd>{selectedPort.org}</dd></div>
              <div><dt>Trafic estimé</dt><dd>{selectedPort.traffic}</dd></div>
            </dl>
            <p className="copaf-globe-hint">Survolez un point pour explorer le réseau.</p>
          </aside>
        </div>
      </div>

      <style>{`
        .copaf-globe-section { background: #0f172a; color: #f8fafc; overflow: hidden; }
        .copaf-globe-inner { max-width: 1240px; margin: 0 auto; padding: clamp(64px, 9vw, 112px) 24px; }
        .copaf-globe-heading { max-width: 680px; margin-bottom: 26px; }
        .copaf-globe-eyebrow { color: #1798F4; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
        .copaf-globe-heading h2 { margin: 12px 0 14px; color: #fff; font-size: clamp(28px, 4vw, 50px); line-height: 1.08; }
        .copaf-globe-heading p { margin: 0; color: #94a3b8; font-size: 16px; line-height: 1.7; }
        .copaf-globe-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 340px); align-items: center; gap: clamp(22px, 5vw, 76px); }
        .copaf-globe-canvas { width: 100%; min-width: 0; display: flex; justify-content: center; min-height: 280px; }
        .copaf-globe-card { position: relative; padding: 28px; border: 1px solid rgba(23,152,244,.3); border-radius: 8px; background: linear-gradient(145deg, rgba(15,52,96,.95), rgba(15,23,42,.96)); box-shadow: 0 20px 60px rgba(0,0,0,.24); }
        .copaf-globe-card-label { color: #7dd3fc; font-size: 11px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
        .copaf-globe-status { width: 38px; height: 4px; margin: 22px 0 16px; border-radius: 2px; }
        .copaf-globe-card h3 { margin: 0 0 24px; color: #fff; font-size: clamp(21px, 2.3vw, 29px); line-height: 1.2; }
        .copaf-globe-card dl { margin: 0; }
        .copaf-globe-card dl div { display: flex; justify-content: space-between; gap: 16px; padding: 13px 0; border-top: 1px solid rgba(148,163,184,.2); }
        .copaf-globe-card dt { color: #94a3b8; font-size: 13px; }
        .copaf-globe-card dd { margin: 0; color: #e0f2fe; font-size: 13px; font-weight: 700; text-align: right; }
        .copaf-globe-hint { margin: 24px 0 0; color: #64748b; font-size: 12px; line-height: 1.5; }
        @media (max-width: 760px) { .copaf-globe-layout { grid-template-columns: 1fr; } .copaf-globe-canvas { min-height: 0; } .copaf-globe-card { max-width: 520px; width: 100%; margin: 0 auto; } }
      `}</style>
    </section>
  )
}