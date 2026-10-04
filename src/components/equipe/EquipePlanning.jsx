import { CARTE, NAVY, SKY, INK, MUTED, aujourdhui, libelleJour } from './equipeTheme'

// Rubrique « Mon planning » : lignes groupées par jour (jour / horaire / tâche / lieu).
export default function EquipePlanning({ planning, lang, t }) {
  const aujourdHui = aujourdhui()
  const jours = []
  ;(planning || []).forEach(ligne => {
    let groupe = jours.find(g => g.jour === ligne.jour)
    if (!groupe) { groupe = { jour: ligne.jour, lignes: [] }; jours.push(groupe) }
    groupe.lignes.push(ligne)
  })

  if (jours.length === 0) {
    return <section style={CARTE}><p style={{ margin: 0, fontSize: 14, color: MUTED }}>{t.planningVide}</p></section>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {jours.map(({ jour, lignes }) => {
        const estAujourdHui = jour === aujourdHui
        return (
          <section key={jour} style={{ ...CARTE, padding: 0, overflow: 'hidden', borderColor: estAujourdHui ? SKY : '#e2e8f0' }}>
            <h3 style={{ margin: 0, padding: '12px 16px', background: estAujourdHui ? SKY : NAVY, color: '#fff', fontSize: 14, fontWeight: 800, textTransform: 'capitalize', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>{libelleJour(jour, lang)}</span>
              {estAujourdHui && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.aujourdhui}</span>}
            </h3>
            <div>
              {lignes.map((l, i) => (
                <div key={l.id || i} style={{ display: 'grid', gridTemplateColumns: 'minmax(86px, 120px) 1fr', gap: 12, padding: '12px 16px', borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.4 }}>{l.horaire}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{l.tache}</div>
                    {l.lieu && <div style={{ marginTop: 3, fontSize: 12.5, color: MUTED }}>{t.lieu} : {l.lieu}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
