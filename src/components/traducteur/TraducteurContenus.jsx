// src/components/traducteur/TraducteurContenus.jsx
//
// Contenus des fenêtres « structurées » de l'espace traducteurs : programme, planning, intervenants, glossaire.
// Toutes les données viennent de l'admin (onglet « Traducteurs ») ; une ligne vide affiche un espace réservé « À compléter ».

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { INK, MUTED, LINE, NAVY, libelleJour } from '../equipe/equipeTheme'
import TraducteurTexte, { Marque } from './TraducteurTexte'
import { dans } from './traducteurUtils'

const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const DATES_JOURS = { 1: '2026-10-19', 2: '2026-10-20', 3: '2026-10-21' }
const BLOC = { border: `1px solid ${LINE}`, borderRadius: 14, padding: '12px 14px', background: '#fff', margin: '8px 0' }
const PUCE = { display: 'inline-block', padding: '2px 10px', borderRadius: 100, background: '#e0efff', color: NAVY, fontSize: 12, fontWeight: 800, marginRight: 6 }

function Vide({ texte }) {
  return <p style={{ ...BLOC, background: '#fffbeb', borderColor: '#fde68a', margin: '12px 0' }}><Marque texte={texte} /></p>
}

export function ContenuProgramme({ carte, programme, lang, t }) {
  return (
    <div>
      <TraducteurTexte texte={dans(carte, 'contenu', lang)} />
      {[1, 2, 3].map(jour => {
        const lignes = programme.filter(p => p.jour === jour)
        return (
          <section key={jour} style={{ marginTop: 20 }} aria-label={`${t.jour} ${jour}`}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 900, color: NAVY }}>{t.jour} {jour} · {libelleJour(DATES_JOURS[jour], lang)}</h3>
            {jour === 3 && (
              <p role="note" style={{ margin: '6px 0 10px', padding: '10px 14px', borderRadius: 12, background: '#fff7ed', border: '1.5px solid #fdba74', color: '#9a3412', fontWeight: 800 }}>
                {t.jour3}
              </p>
            )}
            {lignes.length === 0 && <Vide texte={t.aCompleter} />}
            {lignes.map(l => (
              <div key={l.id} style={BLOC}>
                <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>
                  {l.debut ? <span>{l.debut}{l.fin ? ` – ${l.fin}` : ''}</span> : <Marque texte={t.horaireACompleter} />}
                  {l.salle && <span style={{ color: MUTED, fontWeight: 700 }}> · {l.salle}</span>}
                </div>
                <div style={{ fontWeight: 700, marginTop: 2 }}><Marque texte={dans(l, 'titre', lang)} /></div>
                {dans(l, 'notes', lang) && <div style={{ fontSize: 13.5, color: MUTED, marginTop: 2 }}>{dans(l, 'notes', lang)}</div>}
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

export function ContenuPlanning({ carte, planning, traducteurs, dossier, lang, t }) {
  const nom = d => {
    const x = traducteurs.find(tr => tr.dossier === d)
    return x ? `${x.prenom || ''} ${x.nom || ''}`.trim() : ''
  }
  const miennes = planning.filter(p => p.traducteur_dossier === dossier).length
  return (
    <div>
      <TraducteurTexte texte={dans(carte, 'contenu', lang)} />
      {traducteurs.length > 0 && (
        <p style={{ margin: '10px 0', fontSize: 14 }}>
          <strong>{t.equipeTrad} :</strong> {traducteurs.map(x => `${x.prenom || ''} ${x.nom || ''}`.trim()).join(' · ')}
        </p>
      )}
      <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 800, color: NAVY }}>{t.mesSessions} : {miennes}</p>
      {planning.length === 0 && <Vide texte={t.aCompleter} />}
      {[1, 2, 3].map(jour => {
        const lignes = planning.filter(p => p.jour === jour)
        if (!lignes.length) return null
        return (
          <section key={jour} style={{ marginTop: 16 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 900, color: NAVY }}>{t.jour} {jour} · {libelleJour(DATES_JOURS[jour], lang)}</h3>
            {lignes.map(l => {
              const moi = l.traducteur_dossier === dossier
              return (
                <div key={l.id} style={{ ...BLOC, background: moi ? '#eff6ff' : '#fff', borderColor: moi ? NAVY : LINE, borderWidth: moi ? 2 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>
                    {l.horaire || <Marque texte={t.horaireACompleter} />}
                    {moi && <span style={{ ...PUCE, background: NAVY, color: '#fff', marginLeft: 8 }}>{t.vous}</span>}
                  </div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}><Marque texte={dans(l, 'session', lang)} /></div>
                  <div style={{ fontSize: 13.5, marginTop: 3 }}>
                    <span style={{ color: MUTED }}>{t.traducteurLabel} : </span>{nom(l.traducteur_dossier) || <Marque texte={t.aCompleter} />}
                    {l.relais && <span style={{ color: MUTED }}> · {t.relais} : {l.relais}</span>}
                  </div>
                  {dans(l, 'notes', lang) && <div style={{ fontSize: 13.5, color: MUTED, marginTop: 2 }}>{dans(l, 'notes', lang)}</div>}
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}

export function ContenuIntervenants({ carte, intervenants, lang, t }) {
  return (
    <div>
      <TraducteurTexte texte={dans(carte, 'contenu', lang)} />
      {intervenants.length === 0 && <Vide texte={t.aCompleter} />}
      {intervenants.map(s => (
        <div key={s.id} style={BLOC}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>{s.nom}</div>
          {s.prononciation && (
            <div style={{ fontSize: 13.5, color: NAVY, fontStyle: 'italic', margin: '1px 0 3px' }}>
              <span style={{ fontStyle: 'normal', fontWeight: 800 }}>{t.prononciation} : </span>{s.prononciation}
            </div>
          )}
          <div style={{ fontSize: 14 }}>{dans(s, 'fonction', lang) || <Marque texte={t.aCompleter} />}</div>
          <div style={{ marginTop: 4, fontSize: 13 }}>
            {s.pays && <span style={{ ...PUCE, background: '#f1f5f9', color: INK }}>{s.pays}</span>}
            <span style={PUCE}>{t.langueIntervention} : {s.langue === 'FR/EN' ? 'FR / EN' : s.langue}</span>
          </div>
          {dans(s, 'session', lang) && <div style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>{t.session} : {dans(s, 'session', lang)}</div>}
        </div>
      ))}
    </div>
  )
}

export function ContenuGlossaire({ carte, glossaire, lang, t }) {
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('tous')
  const autre = lang === 'en' ? 'fr' : 'en'
  const visibles = useMemo(() => {
    const q = sansAccent(recherche).trim()
    return glossaire.filter(g => {
      if (categorie !== 'tous' && g.categorie !== categorie) return false
      return !q || sansAccent(`${g.terme_fr} ${g.terme_en} ${g.definition_fr} ${g.definition_en}`).includes(q)
    })
  }, [glossaire, recherche, categorie])
  const categories = [['tous', t.toutes], ['portuaire', t.catPortuaire], ['ia', t.catIA], ['cyber', t.catCyber], ['sigle', t.catSigles]]
  return (
    <div>
      <TraducteurTexte texte={dans(carte, 'contenu', lang)} />
      <label style={{ display: 'flex', alignItems: 'center', margin: '12px 0 8px', border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '0 12px', background: '#fff' }}>
        <Search size={18} aria-hidden="true" color={MUTED} />
        <input type="search" value={recherche} onChange={e => setRecherche(e.target.value)} placeholder={t.rechercher} aria-label={t.rechercher}
          style={{ flex: 1, minWidth: 0, height: 46, border: 'none', outline: 'none', fontSize: 16, marginLeft: 8, fontFamily: 'inherit', background: 'transparent' }} />
      </label>
      <div role="group" aria-label={t.categories} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 6 }}>
        {categories.map(([id, libelle]) => (
          <button key={id} type="button" onClick={() => setCategorie(id)} aria-pressed={categorie === id}
            style={{ minHeight: 40, padding: '0 14px', margin: '0 6px 6px 0', borderRadius: 100, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              border: categorie === id ? 'none' : '1px solid #cbd5e1', background: categorie === id ? NAVY : '#fff', color: categorie === id ? '#fff' : '#475569' }}>
            {libelle}
          </button>
        ))}
      </div>
      <p style={{ margin: '4px 0', fontSize: 12.5, color: MUTED }}>{visibles.length} / {glossaire.length}</p>
      {glossaire.length === 0 && <Vide texte={t.aCompleter} />}
      {visibles.map(g => {
        const principal = g[`terme_${lang}`] || g[`terme_${autre}`]
        const secondaire = g[`terme_${autre}`]
        return (
          <div key={g.id} style={BLOC}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{principal}</div>
            {secondaire && secondaire !== principal && (
              <div style={{ fontSize: 14.5, color: NAVY, fontWeight: 700 }}>{autre.toUpperCase()} : {secondaire}</div>
            )}
            {dans(g, 'definition', lang) && <div style={{ fontSize: 14, color: INK, marginTop: 3 }}><Marque texte={dans(g, 'definition', lang)} /></div>}
          </div>
        )
      })}
    </div>
  )
}
