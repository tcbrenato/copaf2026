import { CARTE, NAVY, SKY, INK, MUTED, aujourdhui } from './equipeTheme'

// Les attestations sont téléchargeables à partir du jour 3 de la conférence.
const DATE_ATTESTATION = '2026-10-21'

const BOUTON = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '0 18px',
  borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: 'none', border: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

// Rubrique « Documents de la mission » : charte, programme, plan du site (liens), puis l'attestation.
export default function EquipeDocuments({ documents, membre, t }) {
  const attestationOuverte = aujourdhui() >= DATE_ATTESTATION
  const attestationUrl = String(membre.attestation_url || '').trim()
  const attestationActive = attestationOuverte && !!attestationUrl

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <section style={CARTE}>
        {(documents || []).length === 0 && <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{t.docsVide}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(documents || []).map(d => {
            const actif = !!String(d.url || '').trim()
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 14, background: actif ? '#f8fbff' : '#f8fafc' }}>
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, overflowWrap: 'anywhere' }}>{d.titre}</div>
                  <div style={{ fontSize: 12, color: SKY, fontWeight: 700, marginTop: 2 }}>{t.typesDoc[d.type] || d.type}</div>
                </div>
                {actif ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ ...BOUTON, background: NAVY, color: '#fff' }}>{t.telecharger}</a>
                ) : (
                  <span style={{ ...BOUTON, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }} aria-disabled="true">{t.bientot}</span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section style={CARTE}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, marginBottom: 4 }}>{t.attestation}</div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{attestationOuverte ? t.attestationTexteOuverte : t.attestationTexte}</p>
        {attestationActive ? (
          <a href={attestationUrl} target="_blank" rel="noopener noreferrer" style={{ ...BOUTON, background: SKY, color: '#fff' }}>{t.attestationBtn}</a>
        ) : (
          <button type="button" disabled style={{ ...BOUTON, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }}>{t.attestationBtn}</button>
        )}
      </section>
    </div>
  )
}
