import { useTranslation } from 'react-i18next'

// Petit selecteur FR / EN flottant pour les pages "outil" (tablette, sondage)
// qui n'ont pas la barre de navigation du site. Il pilote la meme langue
// (i18next) que le selecteur du header.
export default function LangToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'fr'

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'flex', gap: 4, padding: 4, borderRadius: 100,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    }}>
      {['fr', 'en'].map(lng => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          style={{
            border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 100, fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 12, fontWeight: 800, letterSpacing: 1,
            background: current === lng ? '#0073F4' : 'transparent', color: '#fff', opacity: current === lng ? 1 : 0.7,
          }}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
