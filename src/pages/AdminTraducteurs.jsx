// src/pages/AdminTraducteurs.jsx
//
// Onglet admin « Traducteurs » : gère tout l'espace /espace-traducteur sans toucher au code :
//   Traducteurs (qui a accès) · Contenus (textes FR/EN des fenêtres) · Programme · Planning · Intervenants · Glossaire · Documents.
// Les comptes se créent dans l'onglet « Intervenants » (case « Traducteur »), ou ici en cochant un intervenant existant.

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import EditeurLignes from '../components/traducteur/EditeurLignes'

const NAVY = '#00367F'
const CARD = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(0,54,127,.05)' }
const BTN = { padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', marginRight: 8, marginBottom: 6 }
const INPUT = { padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', width: '100%', background: '#fff', color: '#0f172a' }

const SECTIONS = [['traducteurs', 'Traducteurs'], ['contenus', 'Contenus'], ['programme', 'Programme'], ['planning', 'Planning'], ['intervenants', 'Intervenants'], ['glossaire', 'Glossaire'], ['documents', 'Documents']]
const JOURS = [[1, 'Jour 1 (19 oct.)'], [2, 'Jour 2 (20 oct.)'], [3, 'Jour 3 (21 oct. · visite de terrain)']]
const LANGUES = [['FR', 'FR'], ['EN', 'EN'], ['FR/EN', 'FR / EN']]

const TRI_JOUR = ['jour', 'ordre']
const TRI_ORDRE = ['ordre']
const TRI_GLOSSAIRE = ['categorie', 'ordre']

const COLONNES_PROGRAMME = [
  { cle: 'jour', label: 'Jour', type: 'select', options: JOURS, nombre: true },
  { cle: 'debut', label: 'Début (ex. 09:00)' }, { cle: 'fin', label: 'Fin (ex. 10:30)' }, { cle: 'salle', label: 'Salle' },
  { cle: 'titre_fr', label: 'Titre (FR)', requis: true, large: true }, { cle: 'titre_en', label: 'Title (EN)', requis: true, large: true },
  { cle: 'notes_fr', label: 'Notes (FR)', type: 'area' }, { cle: 'notes_en', label: 'Notes (EN)', type: 'area' },
]
const COLONNES_INTERVENANTS = [
  { cle: 'nom', label: 'Nom', requis: true }, { cle: 'pays', label: 'Pays' }, { cle: 'langue', label: 'Langue d\'intervention', type: 'select', options: LANGUES },
  { cle: 'prononciation', label: 'Aide à la prononciation (ex. « Ibrahim Kouyaté : ee-bra-EEM koo-ya-TÉ »)', large: true },
  { cle: 'fonction_fr', label: 'Fonction (FR)' }, { cle: 'fonction_en', label: 'Position (EN)' },
  { cle: 'session_fr', label: 'Session (FR)' }, { cle: 'session_en', label: 'Session (EN)' },
]
const COLONNES_GLOSSAIRE = [
  { cle: 'categorie', label: 'Catégorie', type: 'select', options: [['portuaire', 'Portuaire / maritime'], ['ia', 'Intelligence artificielle'], ['cyber', 'Cybersécurité'], ['sigle', 'Sigles']] },
  { cle: 'terme_fr', label: 'Terme (FR)', requis: true }, { cle: 'terme_en', label: 'Term (EN)', requis: true },
  { cle: 'definition_fr', label: 'Définition (FR)', type: 'area' }, { cle: 'definition_en', label: 'Definition (EN)', type: 'area' },
]
const COLONNES_DOCUMENTS = [
  { cle: 'categorie', label: 'Catégorie', type: 'select', options: [['programme', 'Programme officiel'], ['carnet', 'Carnet de la conférence'], ['intervenants', 'Liste des intervenants'], ['presentations', 'Présentations et discours'], ['glossaire', 'Glossaire'], ['plan', 'Plan du lieu et des salles'], ['note', 'Note de cadrage traducteurs'], ['magazine', 'Magazine AMP/MPA']] },
  { cle: 'langue', label: 'Langue', type: 'select', options: LANGUES },
  { cle: 'statut', label: 'Statut', type: 'select', options: [['disponible', 'Disponible'], ['attente', 'En attente']] },
  { cle: 'titre_fr', label: 'Titre (FR)', requis: true, large: true }, { cle: 'titre_en', label: 'Title (EN)', requis: true, large: true },
  { cle: 'url', label: 'Fichier', type: 'fichier' },
  { cle: 'ajoute_le', label: 'Ajouté le', type: 'lecture' }, { cle: 'disponible_le', label: 'Passé en « Disponible » le', type: 'lecture' },
]

function Traducteurs({ liste, recharger }) {
  const [erreur, setErreur] = useState('')
  const [choix, setChoix] = useState('')
  const lien = `${window.location.origin}/espace-traducteur`
  const [copie, setCopie] = useState(false)
  const traducteurs = liste.filter(i => i.traducteur)
  const autres = liste.filter(i => !i.traducteur && !i.equipe)

  const regler = async (id, valeur) => {
    setErreur('')
    const { error } = await supabase.from('intervenants').update({ traducteur: valeur }).eq('id', id)
    if (error) { setErreur(error.message); return }
    setChoix(''); recharger()
  }
  const copier = async () => { try { await navigator.clipboard.writeText(lien); setCopie(true); setTimeout(() => setCopie(false), 2000) } catch { /* presse-papiers indisponible */ } }

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
        Les traducteurs accèdent à <code>{lien}</code> avec leur numéro de dossier et leur e-mail. Pour créer un compte : onglet <strong>Intervenants</strong> → ajouter la personne (nom, e-mail) et cocher « Traducteur ».
        Ils ne voient que le contenu de cet espace et le nom de leurs collègues traducteurs.
      </p>
      <button type="button" style={BTN} onClick={copier}>{copie ? 'Lien copié ✓' : 'Copier le lien de l\'espace'}</button>
      {erreur && <p role="alert" style={{ color: '#dc2626', fontSize: 13, fontWeight: 700 }}>{erreur}</p>}
      <div style={{ margin: '10px 0' }}>
        {traducteurs.length === 0 && <p style={{ fontSize: 13, color: '#b45309', fontWeight: 700 }}>Aucun traducteur pour l'instant.</p>}
        {traducteurs.map(i => (
          <div key={i.id} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{`${i.prenom || ''} ${i.nom || ''}`.trim()} <span style={{ fontWeight: 600, color: '#64748b', fontSize: 12 }}>· {i.dossier}</span></div>
              <div style={{ fontSize: 12, color: i.email ? '#64748b' : '#dc2626' }}>{i.email || 'E-mail manquant : connexion impossible'}{i.photo_url ? '' : ' · sans photo'}</div>
            </div>
            <button type="button" style={BTN} onClick={() => regler(i.id, false)}>Retirer l'accès</button>
          </div>
        ))}
      </div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Donner l'accès à un intervenant existant
        <div style={{ display: 'flex', marginTop: 4 }}>
          <select value={choix} onChange={e => setChoix(e.target.value)} style={{ ...INPUT, maxWidth: 360, marginRight: 8 }}>
            <option value="">— Choisir —</option>
            {autres.map(i => <option key={i.id} value={i.id}>{`${i.prenom || ''} ${i.nom || ''}`.trim()} ({i.dossier})</option>)}
          </select>
          <button type="button" style={{ ...BTN, background: NAVY, color: '#fff', borderColor: NAVY }} disabled={!choix} onClick={() => regler(choix, true)}>Donner l'accès</button>
        </div>
      </label>
    </div>
  )
}

function Contenus() {
  const [cartes, setCartes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')

  const charger = useCallback(async () => {
    const { data, error } = await supabase.from('traducteur_cartes').select('*').order('ordre')
    if (error) { setErreur(error.message); return }
    setCartes(data || [])
  }, [])
  useEffect(() => { const m = setTimeout(charger, 0); return () => clearTimeout(m) }, [charger])

  const maj = (id, champs) => setCartes(cs => cs.map(c => (c.id === id ? { ...c, ...champs } : c)))
  const sauver = async (id, champs) => {
    setErreur(''); setInfo('')
    const { error } = await supabase.from('traducteur_cartes').update({ ...champs, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) setErreur(error.message); else setInfo('Enregistré.')
  }

  if (cartes === null) return <p style={{ fontSize: 12.5, color: '#94a3b8' }}>{erreur || 'Chargement…'}</p>
  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
        Texte de chaque fenêtre, en français et en anglais. Mise en forme : <code>## Titre</code> pour un sous-titre, <code>- texte</code> pour une puce, une ligne vide pour un nouveau paragraphe.
        Les mots « À compléter » / « To be completed » s'affichent en orange pour les traducteurs : remplacez-les dès que vous avez l'information.
      </p>
      {erreur && <p role="alert" style={{ color: '#dc2626', fontSize: 13, fontWeight: 700 }}>{erreur}</p>}
      {info && <p role="status" style={{ color: '#166534', fontSize: 13, fontWeight: 700 }}>{info}</p>}
      {cartes.map(c => (
        <details key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px', background: '#f8fafc', marginBottom: 8 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>{c.ordre}. {c.titre_fr} <span style={{ color: '#94a3b8', fontWeight: 600 }}>/ {c.titre_en}</span></summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginTop: 10 }}>
            {[['titre_fr', 'Titre (FR)', false], ['titre_en', 'Title (EN)', false], ['contenu_fr', 'Contenu (FR)', true], ['contenu_en', 'Content (EN)', true]].map(([cle, libelle, long]) => (
              <label key={cle} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{libelle}
                {long
                  ? <textarea rows={10} value={c[cle]} onChange={e => maj(c.id, { [cle]: e.target.value })} onBlur={() => sauver(c.id, { [cle]: c[cle] })} style={{ ...INPUT, marginTop: 3, resize: 'vertical' }} />
                  : <input value={c[cle]} onChange={e => maj(c.id, { [cle]: e.target.value })} onBlur={() => c[cle].trim() && sauver(c.id, { [cle]: c[cle].trim() })} style={{ ...INPUT, marginTop: 3 }} />}
              </label>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

export default function AdminTraducteurs() {
  const [section, setSection] = useState('traducteurs')
  const [intervenants, setIntervenants] = useState(null)
  const [rechargeSpeakers, setRechargeSpeakers] = useState(0)
  const [info, setInfo] = useState('')

  const chargerIntervenants = useCallback(async () => {
    const { data } = await supabase.from('intervenants').select('id, dossier, prenom, nom, fonction, pays, email, photo_url, traducteur, equipe').order('ordre')
    setIntervenants(data || [])
  }, [])
  useEffect(() => { const m = setTimeout(chargerIntervenants, 0); return () => clearTimeout(m) }, [chargerIntervenants])

  const liste = intervenants || []
  const optionsTraducteurs = liste.filter(i => i.traducteur).map(i => [i.dossier, `${i.prenom || ''} ${i.nom || ''}`.trim()])
  const colonnesPlanning = [
    { cle: 'jour', label: 'Jour', type: 'select', options: JOURS, nombre: true }, { cle: 'horaire', label: 'Horaire (ex. 09:00 – 12:30)' },
    { cle: 'traducteur_dossier', label: 'Traducteur', type: 'select', options: optionsTraducteurs, optionnel: true }, { cle: 'relais', label: 'Relais (ex. relais à 11:00 avec …)' },
    { cle: 'session_fr', label: 'Session (FR)', requis: true, large: true }, { cle: 'session_en', label: 'Session (EN)', requis: true, large: true },
    { cle: 'notes_fr', label: 'Notes (FR)', type: 'area' }, { cle: 'notes_en', label: 'Notes (EN)', type: 'area' },
  ]

  // Reprend nom, fonction et pays des intervenants déjà saisis (champs publics uniquement), sans doublon
  const importerIntervenants = async () => {
    setInfo('')
    const { data: existants } = await supabase.from('traducteur_intervenants').select('nom')
    const noms = new Set((existants || []).map(x => String(x.nom).toLowerCase()))
    const aAjouter = liste.filter(i => !i.traducteur && !i.equipe && `${i.prenom || ''} ${i.nom || ''}`.trim() && !/^expert maroc/i.test(i.nom))
      .map((i, k) => ({ nom: `${i.prenom || ''} ${i.nom || ''}`.trim(), fonction_fr: i.fonction || null, pays: i.pays || null, langue: 'FR', ordre: 100 + k }))
      .filter(x => !noms.has(x.nom.toLowerCase()))
    if (!aAjouter.length) { setInfo('Tous les intervenants sont déjà dans la liste.'); return }
    const { error } = await supabase.from('traducteur_intervenants').insert(aAjouter)
    if (error) { setInfo(error.message); return }
    setInfo(`${aAjouter.length} intervenant(s) importé(s) : complétez la langue d'intervention, la session et la prononciation.`)
    setRechargeSpeakers(n => n + 1)
  }

  return (
    <div style={CARD}>
      <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>Espace traducteurs</div>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#475569' }}>Tout le contenu de <code>/espace-traducteur</code>, en français et en anglais.</p>
      <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 14 }}>
        {SECTIONS.map(([id, libelle]) => (
          <button key={id} type="button" role="tab" aria-selected={section === id} onClick={() => setSection(id)}
            style={{ ...BTN, background: section === id ? NAVY : '#fff', color: section === id ? '#fff' : '#475569', borderColor: section === id ? NAVY : '#e2e8f0' }}>{libelle}</button>
        ))}
      </div>

      {section === 'traducteurs' && (intervenants === null ? <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Chargement…</p> : <Traducteurs liste={liste} recharger={chargerIntervenants} />)}
      {section === 'contenus' && <Contenus />}
      {section === 'programme' && (
        <EditeurLignes table="traducteur_programme" colonnes={COLONNES_PROGRAMME} tri={TRI_JOUR} libelleAjout="Ajouter une session"
          defaut={{ jour: 1, titre_fr: 'À compléter', titre_en: 'To be completed' }} resume={l => l.titre_fr} />
      )}
      {section === 'planning' && (
        <EditeurLignes table="traducteur_planning" colonnes={colonnesPlanning} tri={TRI_JOUR} libelleAjout="Ajouter une session au planning"
          defaut={{ jour: 1, session_fr: 'À compléter', session_en: 'To be completed' }} resume={l => l.session_fr} />
      )}
      {section === 'intervenants' && (
        <EditeurLignes table="traducteur_intervenants" colonnes={COLONNES_INTERVENANTS} tri={TRI_ORDRE} libelleAjout="Ajouter un intervenant" cleRecharge={rechargeSpeakers}
          defaut={{ nom: 'À compléter', langue: 'FR' }} resume={l => l.nom}
          extra={<button type="button" style={BTN} onClick={importerIntervenants}>Importer depuis les intervenants (nom, fonction, pays)</button>} />
      )}
      {section === 'glossaire' && (
        <EditeurLignes table="traducteur_glossaire" colonnes={COLONNES_GLOSSAIRE} tri={TRI_GLOSSAIRE} libelleAjout="Ajouter un terme"
          defaut={{ categorie: 'portuaire', terme_fr: '', terme_en: '' }} resume={l => l.terme_fr || l.terme_en} />
      )}
      {section === 'documents' && (
        <>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
            Un document « En attente » est visible par les traducteurs avec un badge orange. Dès que vous le passez en « Disponible » (et qu'un fichier est associé), il devient téléchargeable
            et un bandeau « nouveau document » s'affiche à leur prochaine visite. Les fichiers téléversés ont un lien non devinable mais ne sont pas protégés par mot de passe.
          </p>
          <EditeurLignes table="traducteur_documents" colonnes={COLONNES_DOCUMENTS} tri={TRI_ORDRE} libelleAjout="Ajouter un document"
            defaut={{ categorie: 'presentations', titre_fr: 'Nouveau document', titre_en: 'New document', langue: 'FR/EN', statut: 'attente' }} resume={l => l.titre_fr} />
        </>
      )}
      {info && <p role="status" style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: '#166534' }}>{info}</p>}
    </div>
  )
}
