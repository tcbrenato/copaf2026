import { useTranslation } from 'react-i18next'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'fr'

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {['fr', 'en'].map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          style={{
            background: current === lng ? '#0073F4' : 'transparent',
            color: current === lng ? '#ffffff' : '#ffffff',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: 999,
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.2,
            opacity: current === lng ? 1 : 0.75,
          }}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
