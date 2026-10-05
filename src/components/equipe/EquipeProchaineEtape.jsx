import { NAVY, SKY, aujourdhui, libelleJour, nettoyer } from './equipeTheme'

// Encadré « Prochaine étape » en haut de l'espace : texte saisi dans l'admin ; à défaut, la prochaine ligne du planning.
export default function EquipeProchaineEtape({ membre, planning, lang, t }) {
  let texte = nettoyer(membre.prochaine_etape)

  if (!texte) {
    const prochaine = (planning || []).find(l => l.jour >= aujourdhui() && nettoyer(l.tache))
    if (prochaine) {
      const horaire = nettoyer(prochaine.horaire)
      const lieu = nettoyer(prochaine.lieu)
      const quand = [libelleJour(prochaine.jour, lang), horaire].filter(Boolean).join(', ')
      texte = `${quand} : ${nettoyer(prochaine.tache)}${lieu ? ` (${lieu})` : ''}`
    }
  }
  if (!texte) return null

  return (
    <aside aria-label={t.prochaineEtape} style={{ margin: '0 0 14px', padding: '14px 16px', borderRadius: 16, background: '#eaf5ff', border: `1.5px solid ${SKY}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: SKY }}>{t.prochaineEtape}</span>
      <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, color: NAVY, overflowWrap: 'anywhere' }}>{texte}</span>
    </aside>
  )
}
