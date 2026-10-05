import { NAVY, SKY, aujourdhui, libelleJour } from './equipeTheme'

// Encadré « Prochaine étape » en haut de l'espace : texte saisi dans l'admin ; à défaut, la prochaine ligne du planning.
export default function EquipeProchaineEtape({ membre, planning, lang, t }) {
  let texte = String(membre.prochaine_etape || '').trim()

  if (!texte) {
    const prochaine = (planning || []).find(l => l.jour >= aujourdhui())
    if (prochaine) {
      const quand = [libelleJour(prochaine.jour, lang), prochaine.horaire].filter(Boolean).join(', ')
      texte = `${quand} : ${prochaine.tache}${prochaine.lieu ? ` (${prochaine.lieu})` : ''}`
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
