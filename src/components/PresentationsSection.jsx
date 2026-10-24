import { useEffect, useState } from 'react'

const TR = {
  fr: {
    titre: 'Présentations de la conférence',
    intro: 'Les présentations des intervenants, en français et en anglais. Réservées aux participants et intervenants de la conférence.',
    jour: 'Jour', fr: 'Français', en: 'English', chargement: 'Chargement…',
    vide: 'Les présentations seront disponibles ici très prochainement.',
    erreur: 'Impossible de charger les présentations pour le moment. Réessayez plus tard.',
  },
  en: {
    titre: 'Conference presentations',
    intro: 'The speakers’ presentations, in French and English. Available to conference participants and speakers only.',
    jour: 'Day', fr: 'Français', en: 'English', chargement: 'Loading…',
    vide: 'The presentations will be available here very soon.',
    erreur: 'Unable to load the presentations right now. Please try again later.',
  },
}

const boutonStyle = actif => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
  textDecoration: 'none', border: '1.5px solid ' + (actif ? '#0073F4' : '#e2e8f0'),
  background: actif ? '#EBF3FF' : '#f8fafc', color: actif ? '#000E91' : '#94a3b8', pointerEvents: actif ? 'auto' : 'none',
})

// `charger` renvoie la liste (rpc presentations_participant ou presentations_intervenant).
export default function PresentationsSection({ charger, lang = 'fr' }) {
  const t = TR[lang === 'en' ? 'en' : 'fr']
  const [liste, setListe] = useState(undefined)

  useEffect(() => {
    let annule = false
    Promise.resolve(charger())
      .then(({ data, error }) => { if (!annule) setListe(error ? 'erreur' : (Array.isArray(data) ? data : [])) })
      .catch(() => { if (!annule) setListe('erreur') })
    return () => { annule = true }
  }, [charger])

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{t.titre}</h3>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>{t.intro}</p>

      {liste === undefined && <div style={{ fontSize: 13, color: '#94a3b8' }}>{t.chargement}</div>}
      {liste === 'erreur' && <div style={{ fontSize: 13, color: '#991b1b' }}>{t.erreur}</div>}
      {Array.isArray(liste) && liste.length === 0 && <div style={{ fontSize: 13, color: '#94a3b8' }}>{t.vide}</div>}

      {Array.isArray(liste) && liste.map(p => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px', border: '1.5px solid #e2e8f0', borderRadius: 14, marginBottom: 10, background: '#fff' }}>
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>{lang === 'en' ? p.titre_en : p.titre_fr}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
              {[p.jour ? `${t.jour} ${p.jour}` : null, p.intervenant].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a href={p.url_fr || undefined} target="_blank" rel="noreferrer" style={boutonStyle(!!p.url_fr)}>{t.fr}</a>
            <a href={p.url_en || undefined} target="_blank" rel="noreferrer" style={boutonStyle(!!p.url_en)}>{t.en}</a>
          </div>
        </div>
      ))}
    </div>
  )
}
