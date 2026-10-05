import { CARTE, NAVY, SKY, INK, MUTED, nettoyerMembre } from './equipeTheme'

const ETIQ = { fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: SKY }
const LIGNE = { display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }
const VALEUR = { fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.5, overflowWrap: 'anywhere' }
const BOUTON = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '0 14px', borderRadius: 12,
  fontSize: 14, fontWeight: 800, textDecoration: 'none', boxSizing: 'border-box',
}

const chiffres = tel => String(tel || '').replace(/[^+\d]/g, '')
const lienTel = tel => `tel:${chiffres(tel)}`
const lienWhatsApp = tel => `https://wa.me/${chiffres(tel).replace(/^\+/, '')}`
const estNumero = v => chiffres(v).replace('+', '').length >= 8 && /^[+\d\s().-]+$/.test(String(v || '').trim())

// Les couleurs de la tenue s'écrivent {#00367F} dans le texte : elles s'affichent en pastille colorée.
function AvecPastilles({ texte }) {
  return String(texte || '').split(/(\{#[0-9a-fA-F]{6}\})/).map((morceau, i) => {
    const m = morceau.match(/^\{(#[0-9a-fA-F]{6})\}$/)
    if (!m) return <span key={i}>{morceau}</span>
    return <span key={i} role="img" aria-label={m[1]} style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: m[1], border: '1px solid rgba(15,23,42,.25)', verticalAlign: '-2px', margin: '0 2px' }} />
  })
}

const IcoTel = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
)
const IcoWa = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
)

// Rubrique « Ma mission » : rôle, équipe, dates, responsables (appel + WhatsApp), tenue, badge, rendez-vous, arrivée,
// consignes et bloc « En cas de problème ». Un champ vide n'affiche rien.
export default function EquipeMission({ membre: membreBrut, t }) {
  const membre = nettoyerMembre(membreBrut)
  const texte = v => String(v || '').trim()

  // Responsables : liste saisie dans l'admin ; à défaut l'ancien couple nom/téléphone
  let responsables = (Array.isArray(membre.responsables) ? membre.responsables : []).filter(r => texte(r.nom))
  if (responsables.length === 0 && texte(membre.responsable_nom)) {
    responsables = [{ nom: membre.responsable_nom, role: '', tel: membre.responsable_tel, whatsapp: '' }]
  }

  const consignes = membre.consignes
  const missions = membre.missions
  const lieu = [membre.rdv_lieu, membre.rdv_detail].map(texte).filter(Boolean).join(', ')
  const lienLieu = texte(membre.rdv_lien)
  const probleme = texte(membre.probleme_contact)
  const problemeHoraires = texte(membre.probleme_horaires)

  const lignes = [
    [t.role, texte(membre.role) && <span style={VALEUR}>{membre.role}</span>],
    [t.equipe, [membre.equipe, membre.comite].map(texte).filter(Boolean).join(' · ') && <span style={VALEUR}>{[membre.equipe, membre.comite].map(texte).filter(Boolean).join(' · ')}</span>],
    [t.dates, texte(membre.dates_mission) && <span style={VALEUR}>{membre.dates_mission}</span>],
    [t.responsables, responsables.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {responsables.map((r, i) => {
          const tel = texte(r.tel)
          const wa = texte(r.whatsapp) || tel
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={VALEUR}>{r.nom}{texte(r.role) ? ` (${r.role})` : ''}</span>
              {(tel || wa) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tel && <a href={lienTel(tel)} style={{ ...BOUTON, background: '#eaf5ff', color: NAVY }}><IcoTel />{tel}</a>}
                  {wa && <a href={lienWhatsApp(wa)} target="_blank" rel="noopener noreferrer" style={{ ...BOUTON, background: '#e8f8ee', color: '#15803d' }}><IcoWa />{t.whatsapp}</a>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )],
    [t.tenue, texte(membre.tenue) && <span style={VALEUR}><AvecPastilles texte={membre.tenue} /></span>],
    [t.badgeLigne, texte(membre.badge_info) && <span style={VALEUR}>{membre.badge_info}</span>],
    [t.rdv, (lieu || lienLieu) && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lieu && <span style={VALEUR}>{lieu}</span>}
        {lienLieu && <a href={lienLieu} target="_blank" rel="noopener noreferrer" style={{ ...BOUTON, alignSelf: 'flex-start', background: '#eaf5ff', color: NAVY }}>{t.ouvrirMaps}</a>}
      </div>
    )],
    [t.arrivee, texte(membre.horaire_arrivee) && <span style={VALEUR}>{membre.horaire_arrivee}</span>],
  ].filter(([, contenu]) => contenu)

  const vide = lignes.length === 0 && consignes.length === 0 && missions.length === 0 && !probleme

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <section style={CARTE} aria-label={t.mission}>
        {vide && <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{t.missionVide}</p>}
        {lignes.map(([etiquette, contenu], i) => (
          <div key={etiquette} style={{ ...LIGNE, borderBottom: i === lignes.length - 1 ? 'none' : LIGNE.borderBottom }}>
            <span style={ETIQ}>{etiquette}</span>
            {contenu}
          </div>
        ))}
      </section>

      {missions.length > 0 && (
        <section style={CARTE} aria-label={t.missions}>
          <span style={ETIQ}>{t.missions}</span>
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missions.map((c, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14.5, lineHeight: 1.5, color: INK, fontWeight: 600 }}>
                <span aria-hidden="true" style={{ marginTop: 7, width: 8, height: 8, borderRadius: '50%', background: NAVY, flexShrink: 0 }} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {consignes.length > 0 && (
        <section style={CARTE} aria-label={t.consignes}>
          <span style={ETIQ}>{t.consignes}</span>
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {consignes.map((c, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14.5, lineHeight: 1.5, color: INK }}>
                <span aria-hidden="true" style={{ marginTop: 7, width: 7, height: 7, borderRadius: '50%', background: SKY, flexShrink: 0 }} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {probleme && (
        <section style={{ ...CARTE, background: '#fff7ed', borderColor: '#fed7aa' }} aria-label={t.probleme}>
          <span style={{ ...ETIQ, color: '#c2410c' }}>{t.probleme}</span>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.6, color: INK }}>
            {t.contactCoordination} :{' '}
            {estNumero(probleme) ? <a href={lienTel(probleme)} style={{ color: NAVY, fontWeight: 800 }}>{probleme}</a> : <strong>{probleme}</strong>}
            {problemeHoraires && <> · {t.disponible} {problemeHoraires}</>}.
          </p>
        </section>
      )}
    </div>
  )
}
