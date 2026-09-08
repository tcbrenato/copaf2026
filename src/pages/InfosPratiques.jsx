import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const BLUE = '#0073F4'

// TODO: page placeholder — a completer avec le contenu reel (visa,
// hebergement, transport) des que disponible. Cree pour que le CTA
// "Consulter les infos pratiques" de HighlightsBanner ait une destination
// valide des maintenant plutot que de bloquer sur l'absence de contenu.
export default function InfosPratiques() {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language?.toLowerCase().startsWith('en')

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title={isEn ? 'Practical Information — COPAF 2026' : 'Infos Pratiques — COPAF 2026'}
        description={isEn
          ? 'Practical information for attending COPAF 2026 in Casablanca: visa, accommodation, transport.'
          : 'Informations pratiques pour se rendre à la COPAF 2026 à Casablanca : visa, hébergement, transport.'}
        canonical="https://copaf-ports.com/infos-pratiques"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 100px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          {t('highlights.practicalInfo.title')}
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 40, borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
          {t('highlights.practicalInfo.subtitle')}
        </p>

        <div style={{
          background: '#edf2f7', borderRadius: '14px', padding: '32px',
          borderLeft: `4px solid ${BLUE}`, textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 15, color: NAVY, fontWeight: 700 }}>
            {t('highlights.practicalInfo.comingSoon')}
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: '#64748b', lineHeight: 1.7 }}>
            {t('highlights.practicalInfo.comingSoonDetail')}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
