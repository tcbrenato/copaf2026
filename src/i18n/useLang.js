import { useTranslation } from 'react-i18next'

// Langue courante du site ('fr' | 'en'), pilotee par le selecteur du header
// (i18next). Les pages a textes integres l'utilisent pour choisir leurs libelles.
export function useLang() {
  const { i18n } = useTranslation()
  return i18n.language?.startsWith('en') ? 'en' : 'fr'
}
