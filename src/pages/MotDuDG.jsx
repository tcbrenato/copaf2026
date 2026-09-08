import { Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const BLUE = '#0073F4'

export default function MotDuDG() {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language?.toLowerCase().startsWith('en')

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title={isEn ? 'A Word from the Director General — COPAF 2026' : 'Le Mot du Directeur Général — COPAF 2026'}
        description={isEn
          ? "Dr William ODAH, Director General of CRF Perfection, shares his vision of COPAF 2026's challenges."
          : "Le Dr William ODAH, Directeur Général de CRF Perfection, partage sa vision des enjeux de la COPAF 2026."}
        canonical="https://copaf-ports.com/mot-du-dg"
        type="article"
      />
      <Navbar />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 100px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>
          {t('highlights.dgMessage.eyebrow')}
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', margin: '12px 0 40px', letterSpacing: '-0.02em' }}>
          {t('highlights.dgMessage.title')}
        </h1>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 32 }}>
          <img
            src="/william.jpg"
            alt="Dr William ODAH"
            style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${BLUE}` }}
          />
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>Dr William ODAH</p>
            <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748b' }}>{t('intervenants.odahTitre')} — CRF Perfection</p>
          </div>
        </div>

        <div style={{
          position: 'relative',
          background: '#fff', borderRadius: '18px', padding: 'clamp(28px, 4vw, 44px)',
          border: '1px solid rgba(0,14,145,0.08)', boxShadow: '0 15px 40px rgba(0,14,145,0.06)',
        }}>
          <Quote size={34} color={BLUE} style={{ opacity: 0.35, marginBottom: 12 }} />
          {/* TODO: remplacer par la citation officielle du DG — texte placeholder en attendant */}
          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: '#1e293b', lineHeight: 1.8, fontStyle: 'italic', margin: 0 }}>
            {t('highlights.dgMessage.placeholderQuote')}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
