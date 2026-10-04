import { CARTE, NAVY, SKY, INK, MUTED } from './equipeTheme'

// Rubrique « Ma mission » : rôle, équipe, responsable (téléphone cliquable), tenue/badge, consignes, rendez-vous.
export default function EquipeMission({ membre, t }) {
  const tel = String(membre.responsable_tel || '').trim()
  const consignes = (membre.consignes || []).filter(c => String(c || '').trim())
  const rdv = [membre.rdv_lieu, membre.rdv_detail].map(v => String(v || '').trim()).filter(Boolean)

  const lignes = [
    [t.role, membre.role],
    [t.equipe, [membre.equipe, membre.comite].map(v => String(v || '').trim()).filter(Boolean).join(' · ')],
    [t.responsable, membre.responsable_nom, tel],
    [t.tenue, membre.tenue],
  ].filter(([, valeur]) => String(valeur || '').trim())

  const vide = lignes.length === 0 && consignes.length === 0 && rdv.length === 0

  return (
    <section style={CARTE} aria-label={t.mission}>
      {vide && <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{t.missionVide}</p>}

      {lignes.map(([etiquette, valeur, telephone]) => (
        <div key={etiquette} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: SKY }}>{etiquette}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{valeur}</span>
          {telephone && (
            <a href={`tel:${telephone.replace(/[^+\d]/g, '')}`} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 14px', marginTop: 4, borderRadius: 12, background: '#eaf5ff', color: NAVY, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              {telephone}
            </a>
          )}
        </div>
      ))}

      {rdv.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '12px 0', borderBottom: consignes.length ? '1px solid #f1f5f9' : 'none' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: SKY }}>{t.rdv}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.5 }}>{rdv.join(' — ')}</span>
        </div>
      )}

      {consignes.length > 0 && (
        <div style={{ padding: '12px 0 0' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: SKY }}>{t.consignes}</span>
          <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {consignes.map((c, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14.5, lineHeight: 1.5, color: INK }}>
                <span aria-hidden="true" style={{ marginTop: 7, width: 7, height: 7, borderRadius: '50%', background: SKY, flexShrink: 0 }} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
