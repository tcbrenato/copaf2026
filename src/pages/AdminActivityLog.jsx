import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const PAGE_SIZE = 50

// Journal unifie (vue journal_plateforme) : modifications de donnees (par
// l'equipe ou par les personnes elles-memes depuis leur espace), connexions
// aux espaces personnels et emails de notification envoyes.

const CATEGORIES = [
  { value: '', label: 'Toute l\'activité' },
  { value: 'connexion', label: 'Connexions aux espaces' },
  { value: 'documents', label: 'Documents' },
  { value: 'paiements', label: 'Preuves de paiement' },
  { value: 'inscriptions', label: 'Inscriptions & participants' },
  { value: 'intervenants', label: 'Intervenants' },
  { value: 'partenaires', label: 'Sponsoring & exposants' },
  { value: 'email', label: 'Emails envoyés' },
]

const ACTEURS = [
  { value: '', label: 'Tous les acteurs' },
  { value: 'equipe', label: 'Équipe (admin)' },
  { value: 'public', label: 'Participants / public' },
]

const CANAUX = { badge: 'via /badge', espace: 'via Mon espace', intervenant: 'espace intervenant' }

const EMAIL_TYPES = {
  photo: 'photo reçue', passeport: 'passeport reçu', email: 'email enregistré', telephone: 'téléphone enregistré',
  document: 'document reçu', preuve_paiement: 'preuve de paiement reçue', document_admin: 'document déposé par l\'équipe',
  document_valide: 'document validé', document_rejete: 'document à corriger', statut_confirme: 'inscription confirmée',
  relance_dossier: 'rappel dossier incomplet', documentation_intervenant: 'documentation de référence',
  manuel: 'message manuel',
}

const TYPE_PERSONNE = { inscriptions: 'Participant', inscription_participants: 'Membre de délégation', intervenants: 'Intervenant' }

const TABLE_LABELS = {
  inscriptions: 'Inscriptions', inscription_participants: 'Participants', intervenants: 'Intervenants',
  documents_participants: 'Documents', documents_intervenants: 'Documents intervenants', preuves_paiement: 'Preuves de paiement',
  sponsorships: 'Sponsoring / Partenariats', exposants: 'Exposants',
}

const TONES = {
  connexion: { bg: '#ede9fe', color: '#6d28d9' },
  insert: { bg: '#dcfce7', color: '#16a34a' },
  update: { bg: '#dbeafe', color: '#0073F4' },
  delete: { bg: '#fee2e2', color: '#dc2626' },
  email: { bg: '#fef3c7', color: '#b45309' },
}

// Phrase lisible pour un evenement du journal.
function decrire(r) {
  const d = r.details && typeof r.details === 'object' ? r.details : {}

  if (r.source === 'email') {
    const type = EMAIL_TYPES[r.cible] || r.cible
    const objet = r.cible === 'manuel' && d.sujet ? ` : ${d.sujet}` : ''
    return {
      tone: r.ok ? 'email' : 'delete',
      texte: `Email « ${type}${objet} » ${r.ok ? 'envoyé' : 'NON envoyé'}`,
      sous: d.destinataire ? `à ${d.destinataire}` : (d.detail || null),
    }
  }

  if (r.action === 'connexion') {
    return { tone: 'connexion', texte: `Connexion à son espace (${CANAUX[d.canal] || d.canal || '—'})` }
  }

  if (r.cible === 'documents_participants' || r.cible === 'documents_intervenants') {
    if (r.action === 'insert') return { tone: 'insert', texte: 'Document déposé', sous: d.label }
    if (r.action === 'delete') return { tone: 'delete', texte: 'Document supprimé', sous: d.label }
    const phrases = []
    if (d.visible) phrases.push(d.visible.apres ? 'Document rendu visible' : 'Document masqué')
    if (d.url) phrases.push('Fichier remplacé')
    if (d.label) phrases.push(`Document renommé : ${d.label.apres}`)
    return { tone: 'update', texte: phrases.join(' · ') || 'Document modifié' }
  }

  if (r.cible === 'preuves_paiement') {
    if (r.action === 'insert') return { tone: 'insert', texte: 'Preuve de paiement envoyée' }
    if (r.action === 'delete') return { tone: 'delete', texte: 'Preuve de paiement supprimée' }
    if (d.statut) return { tone: 'update', texte: `Preuve de paiement : ${d.statut.apres}` }
    return { tone: 'update', texte: 'Preuve de paiement modifiée' }
  }

  const NOMS = { inscriptions: 'Inscription', inscription_participants: 'Participant', intervenants: 'Intervenant', sponsorships: 'Dossier sponsoring', exposants: 'Exposant' }
  const nom = NOMS[r.cible] || r.cible

  if (r.action === 'insert') return { tone: 'insert', texte: `${nom} créé(e)` }
  if (r.action === 'delete') return { tone: 'delete', texte: `${nom} supprimé(e)` }

  const phrases = []
  const change = (champ) => d[champ]
  if (change('photo_url')) phrases.push(change('photo_url').apres ? 'Photo de badge envoyée' : 'Photo supprimée')
  if (change('passeport_url')) phrases.push(change('passeport_url').apres ? 'Copie du passeport envoyée' : 'Copie du passeport supprimée')
  if (change('email')) phrases.push(change('email').apres ? 'Email renseigné' : 'Email retiré')
  if (change('telephone')) phrases.push(change('telephone').apres ? 'Téléphone renseigné' : 'Téléphone retiré')
  if (change('numero_passeport')) phrases.push('N° de passeport renseigné')
  if (change('paiement_status')) phrases.push(`Statut de paiement : ${change('paiement_status').avant} → ${change('paiement_status').apres}`)
  if (change('arrived')) phrases.push(change('arrived').apres ? 'Pointé arrivé' : 'Pointage annulé')
  if (change('statut')) phrases.push(`Statut : ${change('statut').avant} → ${change('statut').apres}`)
  return { tone: 'update', texte: phrases.join(' · ') || `${nom} modifié(e)` }
}

function DetailsSummary({ action, details }) {
  if (!details || typeof details !== 'object') return null
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== '')
  if (entries.length === 0) return <span style={{ color: '#94a3b8' }}>—</span>

  if (action === 'update') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map(([field, change]) => (
          <div key={field} style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: '#334155' }}>{field}</span>
            {' : '}
            <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>{String(change?.avant ?? '—')}</span>
            {' → '}
            <span style={{ color: NAVY, fontWeight: 600 }}>{String(change?.apres ?? '—')}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ fontSize: 12, color: '#64748b', wordBreak: 'break-word' }}>
      {entries.slice(0, 8).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ')}
    </div>
  )
}

// Retrouve les noms des personnes pour une liste de dossiers.
async function chargerPersonnes(dossiers) {
  if (dossiers.length === 0) return {}
  const [insc, parts, intervs] = await Promise.all([
    supabase.from('inscriptions').select('dossier, contacts(nom, prenom, organisation)').in('dossier', dossiers),
    supabase.from('inscription_participants').select('dossier, nom, prenom').in('dossier', dossiers),
    supabase.from('intervenants').select('dossier, nom, prenom, organisation').in('dossier', dossiers),
  ])
  const map = {}
  ;(insc.data || []).forEach(r => { map[r.dossier] = { nom: `${r.contacts?.prenom || ''} ${r.contacts?.nom || ''}`.trim(), org: r.contacts?.organisation, type: TYPE_PERSONNE.inscriptions } })
  ;(parts.data || []).forEach(r => { map[r.dossier] = { nom: `${r.prenom || ''} ${r.nom || ''}`.trim(), type: TYPE_PERSONNE.inscription_participants } })
  ;(intervs.data || []).forEach(r => { map[r.dossier] = { nom: `${r.prenom || ''} ${r.nom || ''}`.trim(), org: r.organisation, type: TYPE_PERSONNE.intervenants } })
  return map
}

// Dossiers dont la personne correspond a un nom recherche.
async function dossiersParNom(q) {
  const motif = `%${q}%`
  const [insc, parts, intervs] = await Promise.all([
    supabase.from('contacts').select('inscriptions(dossier)').or(`nom.ilike.${motif},prenom.ilike.${motif}`).limit(50),
    supabase.from('inscription_participants').select('dossier').or(`nom.ilike.${motif},prenom.ilike.${motif}`).limit(50),
    supabase.from('intervenants').select('dossier').or(`nom.ilike.${motif},prenom.ilike.${motif}`).limit(50),
  ])
  return [
    ...(insc.data || []).flatMap(c => (c.inscriptions || []).map(i => i.dossier)),
    ...(parts.data || []).map(r => r.dossier),
    ...(intervs.data || []).map(r => r.dossier),
  ].filter(Boolean)
}

export default function AdminActivityLog() {
  const [rows, setRows] = useState(null)
  const [personnes, setPersonnes] = useState({})
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [ouvert, setOuvert] = useState({})

  const [recherche, setRecherche] = useState('')
  const [rechercheAppliquee, setRechercheAppliquee] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('')
  const [filterActeur, setFilterActeur] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const load = async (pageIndex = 0) => {
    setError('')
    let query = supabase
      .from('journal_plateforme')
      .select('id, created_at, source, acteur, action, cible, dossier, details, ok')
      .order('created_at', { ascending: false })
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1)

    if (filterCategorie === 'connexion') query = query.eq('action', 'connexion')
    else if (filterCategorie === 'email') query = query.eq('source', 'email')
    else if (filterCategorie === 'documents') query = query.in('cible', ['documents_participants', 'documents_intervenants'])
    else if (filterCategorie === 'paiements') query = query.eq('cible', 'preuves_paiement')
    else if (filterCategorie === 'inscriptions') query = query.in('cible', ['inscriptions', 'inscription_participants']).neq('action', 'connexion')
    else if (filterCategorie === 'intervenants') query = query.eq('cible', 'intervenants').neq('action', 'connexion')
    else if (filterCategorie === 'partenaires') query = query.in('cible', ['sponsorships', 'exposants'])

    if (filterActeur === 'equipe') query = query.not('acteur', 'is', null)
    else if (filterActeur === 'public') query = query.is('acteur', null).eq('source', 'activite')

    if (filterFrom) query = query.gte('created_at', filterFrom)
    if (filterTo) query = query.lte('created_at', filterTo + 'T23:59:59')

    if (rechercheAppliquee) {
      const parNom = await dossiersParNom(rechercheAppliquee)
      const liste = [...new Set(parNom)].map(d => `"${d}"`).join(',')
      const motif = `%${rechercheAppliquee}%`
      query = query.or(liste ? `dossier.ilike.${motif},dossier.in.(${liste})` : `dossier.ilike.${motif}`)
    }

    const { data, error: err } = await query
    if (err) { setError("Impossible de charger le journal d'activité."); return }

    const nouvelles = data || []
    const dossiersInconnus = [...new Set(nouvelles.map(r => r.dossier).filter(Boolean))].filter(d => !personnes[d])
    if (dossiersInconnus.length) {
      const trouvees = await chargerPersonnes(dossiersInconnus)
      setPersonnes(p => ({ ...p, ...trouvees }))
    }

    setRows(pageIndex === 0 ? nouvelles : [...(rows || []), ...nouvelles])
    setHasMore(nouvelles.length === PAGE_SIZE)
    setPage(pageIndex)
  }

  useEffect(() => { load(0) }, [rechercheAppliquee, filterCategorie, filterActeur, filterFrom, filterTo]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectStyle = { padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', color: '#0f172a', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 9, outline: 'none' }
  const th = { textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Journal d'activité</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Ce que font les participants, les intervenants et l'équipe : connexions aux espaces personnels, documents déposés,
          modifications de dossiers, paiements et emails envoyés.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setRechercheAppliquee(recherche.trim()) }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}
      >
        <input
          value={recherche} onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un nom ou un n° de dossier…"
          style={{ ...selectStyle, minWidth: 260, flex: 1 }}
        />
        <button type="submit" style={{ padding: '9px 18px', background: NAVY, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Rechercher
        </button>
        {rechercheAppliquee && (
          <button type="button" onClick={() => { setRecherche(''); setRechercheAppliquee('') }} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Effacer
          </button>
        )}
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} style={selectStyle}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterActeur} onChange={(e) => setFilterActeur(e.target.value)} style={selectStyle}>
          {ACTEURS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={selectStyle} />
        <span style={{ alignSelf: 'center', color: '#94a3b8', fontSize: 13 }}>à</span>
        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={selectStyle} />
        <button type="button" onClick={() => load(0)} style={{ ...selectStyle, cursor: 'pointer', fontWeight: 600 }}>Actualiser</button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16, color: '#dc2626', fontSize: 13.5 }}>{error}</div>
      )}

      {rows === null && !error && <p style={{ color: '#64748b', fontSize: 13.5 }}>Chargement…</p>}
      {rows !== null && rows.length === 0 && <p style={{ color: '#64748b', fontSize: 13.5 }}>Aucune activité enregistrée pour ces filtres.</p>}

      {rows !== null && rows.length > 0 && (
        <>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8faff', borderBottom: '1px solid rgba(0,14,145,0.08)' }}>
                  <th style={th}>Date</th>
                  <th style={th}>Personne concernée</th>
                  <th style={th}>Acteur</th>
                  <th style={th}>Événement</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const ev = decrire(r)
                  const tone = TONES[ev.tone] || TONES.update
                  const p = r.dossier ? personnes[r.dossier] : null
                  const acteur = r.source === 'email'
                    ? (r.acteur ? `Équipe · ${r.acteur}` : 'Système')
                    : r.action === 'connexion' ? 'La personne'
                    : r.acteur ? `Équipe · ${r.acteur}` : 'Participant / public'
                  return (
                    <tr key={`${r.source}-${r.id}`} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', verticalAlign: 'top' }}>
                      <td style={{ padding: '12px 18px', color: '#334155', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '12px 18px', minWidth: 190 }}>
                        {p ? (
                          <>
                            <div style={{ fontWeight: 700, color: '#0a1128' }}>{p.nom || '—'}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>{p.type}{p.org ? ` · ${p.org}` : ''}</div>
                          </>
                        ) : (
                          <div style={{ color: '#94a3b8', fontSize: 12.5 }}>{r.dossier ? 'Fiche supprimée' : '—'}</div>
                        )}
                        {r.dossier && <div style={{ fontSize: 11.5, fontFamily: 'ui-monospace, Menlo, monospace', color: NAVY }}>{r.dossier}</div>}
                      </td>
                      <td style={{ padding: '12px 18px', color: '#334155', fontSize: 12.5 }}>{acteur}</td>
                      <td style={{ padding: '12px 18px', maxWidth: 440 }}>
                        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '3px 10px', background: tone.bg, color: tone.color }}>
                          {ev.texte}
                        </span>
                        {ev.sous && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, wordBreak: 'break-word' }}>{ev.sous}</div>}
                        {r.source === 'activite' && r.action !== 'connexion' && (
                          <div style={{ marginTop: 4 }}>
                            <button
                              type="button" onClick={() => setOuvert(o => ({ ...o, [r.id]: !o[r.id] }))}
                              style={{ background: 'none', border: 'none', padding: 0, fontSize: 11.5, color: BLUE, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                            >
                              {ouvert[r.id] ? 'Masquer le détail' : `Détail technique (${TABLE_LABELS[r.cible] || r.cible})`}
                            </button>
                            {ouvert[r.id] && <div style={{ marginTop: 6 }}><DetailsSummary action={r.action} details={r.details} /></div>}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => load(page + 1)}
              style={{ marginTop: 16, padding: '10px 22px', background: '#fff', border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Voir plus
            </button>
          )}
        </>
      )}
    </div>
  )
}
