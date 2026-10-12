// src/components/traducteur/TraducteurDocuments.jsx
//
// Page « Documents » : fichiers regroupés par catégorie, avec titre, langue, date d'ajout et statut bien visible
// (Disponible / En attente). Un document passé récemment de « En attente » à « Disponible » porte le badge « Nouveau ».

import { Download } from 'lucide-react'
import { INK, MUTED, LINE, NAVY, CARTE } from '../equipe/equipeTheme'
import { CATEGORIES_DOC, dans } from './traducteurUtils'

const dateAjout = (iso, lang) => {
  try { return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', { timeZone: 'Africa/Casablanca', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) } catch { return '' }
}

export default function TraducteurDocuments({ documents, nouveaux, lang, t }) {
  const attente = documents.filter(d => d.statut !== 'disponible').length
  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: 14, color: MUTED }}>
        {documents.length - attente} {t.disponibles} · <strong style={{ color: attente ? '#b45309' : MUTED }}>{attente} {t.enAttente}</strong>
      </p>
      {CATEGORIES_DOC.map(cat => {
        const liste = documents.filter(d => d.categorie === cat)
        if (!liste.length) return null
        return (
          <section key={cat} style={{ ...CARTE, marginBottom: 14 }} aria-label={t.categoriesDoc[cat]}>
            <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 900, color: NAVY }}>{t.categoriesDoc[cat]}</h2>
            {liste.map(d => {
              const dispo = d.statut === 'disponible' && !!d.url
              const nouveau = dispo && nouveaux.has(d.id)
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', padding: '10px 0', borderTop: `1px solid ${LINE}` }}>
                  <div style={{ flex: '1 1 220px', minWidth: 0, marginRight: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: INK, overflowWrap: 'anywhere' }}>{dans(d, 'titre', lang)}</div>
                    <div style={{ marginTop: 3, fontSize: 12.5, color: MUTED }}>
                      <span style={{ display: 'inline-block', padding: '1px 9px', borderRadius: 100, background: '#e0efff', color: NAVY, fontWeight: 800, marginRight: 8 }}>{d.langue === 'FR/EN' ? 'FR / EN' : d.langue}</span>
                      {t.ajouteLe} {dateAjout(d.ajoute_le, lang)}
                    </div>
                  </div>
                  <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 900, marginRight: 8, marginTop: 4,
                    background: dispo ? '#dcfce7' : '#fef3c7', color: dispo ? '#166534' : '#92400e', border: `1.5px solid ${dispo ? '#86efac' : '#fcd34d'}` }}>
                    {dispo ? t.statutDisponible : t.statutAttente}
                  </span>
                  {nouveau && <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: 100, fontSize: 12, fontWeight: 900, background: '#dc2626', color: '#fff', marginRight: 8, marginTop: 4 }}>{t.nouveau}</span>}
                  {dispo ? (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" download
                      style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', marginTop: 4, borderRadius: 12, background: NAVY, color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                      <Download size={17} aria-hidden="true" style={{ marginRight: 7 }} />{t.telecharger}
                    </a>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', marginTop: 4, borderRadius: 12, background: '#f1f5f9', color: '#94a3b8', fontSize: 14, fontWeight: 800 }}>{t.pasEncore}</span>
                  )}
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
