import { CARTE, NAVY, SKY, INK, MUTED, aujourdhui, libelleJour, nettoyer } from './equipeTheme'

// Rubrique « Mon planning » : lignes groupées par jour (jour / horaire / tâche / lieu).
export default function EquipePlanning({ planning, membre, lang, t }) {
  const role = nettoyer(membre?.role)
  const aujourdHui = aujourdhui()
  const jours = []
  ;(planning || []).forEach(brut => {
    const tache = nettoyer(brut.tache)
    if (!tache) return
    // Horaire provisoire (crochets) : formulation neutre ; lieu provisoire : ligne de lieu masquée
    const ligne = { ...brut, tache, horaire: nettoyer(brut.horaire) || (String(brut.horaire || '').trim() ? t.heureCoord : ''), lieu: nettoyer(brut.lieu) }
    let groupe = jours.find(g => g.jour === ligne.jour)
    if (!groupe) { groupe = { jour: ligne.jour, lignes: [] }; jours.push(groupe) }
    groupe.lignes.push(ligne)
  })

  if (jours.length === 0) {
    return <section style={CARTE}><p style={{ margin: 0, fontSize: 14, color: MUTED }}>{t.planningVide}</p></section>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {role && (
        <div style={{ padding: '10px 16px', borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0', fontSize: 13.5, color: INK }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: SKY }}>{t.role}</span>
          <div style={{ fontWeight: 700, marginTop: 2 }}>{role}</div>
        </div>
      )}
      <a href={t.programmeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 16px', borderRadius: 14, background: '#eaf5ff', border: '1.5px solid #bfdbfe', textDecoration: 'none' }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: NAVY }}>{t.voirProgramme} ↗</span>
        <span style={{ fontSize: 12.5, color: MUTED }}>{t.programmeNote}</span>
      </a>
      {jours.map(({ jour, lignes }) => {
        const estAujourdHui = jour === aujourdHui
        return (
          <section key={jour} style={{ ...CARTE, padding: 0, overflow: 'hidden', borderColor: estAujourdHui ? SKY : '#e2e8f0' }}>
            <h3 style={{ margin: 0, padding: '12px 16px', background: estAujourdHui ? SKY : NAVY, color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>{libelleJour(jour, lang)}</span>
              {estAujourdHui && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.aujourdhui}</span>}
            </h3>
            <div>
              {lignes.map((l, i) => (
                <div key={l.id || i} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 128px) 1fr', gap: 12, padding: '12px 16px', borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
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
