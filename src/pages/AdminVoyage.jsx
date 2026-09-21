import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import {
  GUIDE_FIELDS, FICHE_CHAMPS_REQUIS, guideChampsManquants, fichesChampsCommunsManquants, generateGuidePDF, generateFichePDF, pdfEnBase64,
  octetsEnBase64, ouvrirOctets,
} from '../utils/generateVoyagePDF'

const NAVY = '#000E91'
const CARTE = { background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)' }
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a' }
const LABEL = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }
const BTN = { padding: '9px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const BTN_PRIMARY = { ...BTN, background: NAVY, color: '#fff' }
const BTN_SOFT = { ...BTN, background: '#eef2ff', color: NAVY }

const STATUTS = {
  aucun: { label: 'Aucun vol', bg: '#f1f5f9', fg: '#475569' },
  vols_recus: { label: 'Vols reçus', bg: '#dbeafe', fg: '#1e40af' },
  fiche_prete: { label: 'Fiche prête', bg: '#fef3c7', fg: '#92400e' },
  fiche_envoyee: { label: 'Fiche envoyée', bg: '#dcfce7', fg: '#166534' },
}

const fmtDate = d => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '')
const lignevol = v => (v ? [v.compagnie, v.numero, v.date, v.heure].filter(Boolean).join(' · ') : '')
const ouvrirBlob = doc => window.open(URL.createObjectURL(doc.output('blob')), '_blank', 'noopener')

function Pastille({ statut }) {
  const s = STATUTS[statut] || STATUTS.aucun
  return <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 100, padding: '3px 10px', background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>{s.label}</span>
}

export default function AdminVoyage() {
  const [onglet, setOnglet] = useState('guide')
  const [config, setConfig] = useState({ fr: {}, en: {} })
  const [publie, setPublie] = useState(false)
  const [personnes, setPersonnes] = useState(null)
  const [erreur, setErreur] = useState('')

  const charger = useCallback(async () => {
    setErreur('')
    const [g, insc, parts, voy] = await Promise.all([
      supabase.from('guide_config').select('valeurs, publie').eq('id', 1).maybeSingle(),
      supabase.from('inscriptions').select('dossier, paiement_status, langue, contacts(nom, prenom, organisation, email)'),
      supabase.from('inscription_participants').select('dossier, nom, prenom, email, langue, inscriptions(paiement_status, langue, contacts(organisation))'),
      supabase.from('voyages').select('*'),
    ])
    if (g.error || insc.error || parts.error || voy.error) { setErreur('Chargement impossible (droits administrateur requis).'); return }
    setConfig({ fr: g.data?.valeurs?.fr || {}, en: g.data?.valeurs?.en || {} })
    setPublie(!!g.data?.publie)
    const voyages = Object.fromEntries((voy.data || []).map(v => [v.dossier, v]))
    const liste = [
      ...(insc.data || []).map(i => ({
        dossier: i.dossier, nom: i.contacts?.nom, prenom: i.contacts?.prenom, organisation: i.contacts?.organisation,
        email: i.contacts?.email, langue: i.langue === 'en' ? 'en' : 'fr', paiement: i.paiement_status, voyage: voyages[i.dossier] || null,
      })),
      ...(parts.data || []).map(p => ({
        dossier: p.dossier, nom: p.nom, prenom: p.prenom, organisation: p.inscriptions?.contacts?.organisation,
        email: p.email, langue: (p.langue || p.inscriptions?.langue) === 'en' ? 'en' : 'fr', paiement: p.inscriptions?.paiement_status, voyage: voyages[p.dossier] || null,
      })),
    ].filter(p => p.dossier).sort((a, b) => (a.organisation || '').localeCompare(b.organisation || '') || (a.nom || '').localeCompare(b.nom || ''))
    setPersonnes(liste)
  }, [])

  useEffect(() => { charger() }, [charger]) // eslint-disable-line react-hooks/set-state-in-effect

  const tab = id => ({
    ...BTN, background: onglet === id ? NAVY : '#fff', color: onglet === id ? '#fff' : '#334155', border: onglet === id ? 'none' : '1.5px solid #e2e8f0',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1000 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Voyages & Guide du participant</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Renseignez les informations du guide (identiques pour tous), puis envoyez-le quand vous le décidez. Chaque personne dépose ses vols
          sur sa page « Mon espace » ; vous saisissez ici l'hôtel et les transferts pour générer sa fiche de voyage.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={tab('guide')} onClick={() => setOnglet('guide')}>Guide du participant</button>
        <button type="button" style={tab('fiches')} onClick={() => setOnglet('fiches')}>Fiches de voyage</button>
      </div>
      {erreur && <p style={{ color: '#dc2626', fontSize: 13.5, margin: 0 }}>{erreur}</p>}
      {personnes === null && !erreur && <p style={{ color: '#64748b', fontSize: 13.5, margin: 0 }}>Chargement…</p>}
      {personnes !== null && onglet === 'guide' && <OngletGuide config={config} setConfig={setConfig} publie={publie} setPublie={setPublie} personnes={personnes} recharger={charger} />}
      {personnes !== null && onglet === 'fiches' && <OngletFiches config={config} personnes={personnes} recharger={charger} />}
    </div>
  )
}

// ─────────────────────────────── Guide ───────────────────────────────
function OngletGuide({ config, setConfig, publie, setPublie, personnes, recharger }) {
  const [lang, setLang] = useState('fr')
  const [sauve, setSauve] = useState('')
  const [occupe, setOccupe] = useState(false)
  const [seulementConfirmes, setSeulementConfirmes] = useState(true)
  const [choisis, setChoisis] = useState({})
  const [envoi, setEnvoi] = useState(null)

  const manqFr = guideChampsManquants(config, 'fr')
  const manqEn = guideChampsManquants(config, 'en')

  const modifier = (cle, valeur) => { setSauve(''); setConfig(c => ({ ...c, [lang]: { ...c[lang], [cle]: valeur } })) }

  const enregistrer = async () => {
    setOccupe(true)
    const { data: u } = await supabase.auth.getUser()
    const { error } = await supabase.from('guide_config').update({ valeurs: config, updated_at: new Date().toISOString(), updated_by: u?.user?.email || null }).eq('id', 1)
    setOccupe(false)
    setSauve(error ? "Échec de l'enregistrement." : 'Enregistré ✓')
  }

  const basculerPublication = async () => {
    const suivant = !publie
    if (suivant && !window.confirm("Publier le guide dans l'espace participant ? Chaque participant pourra le télécharger depuis /verifier.")) return
    const { error } = await supabase.from('guide_config').update({ valeurs: config, publie: suivant, updated_at: new Date().toISOString() }).eq('id', 1)
    if (!error) setPublie(suivant)
  }

  const apercu = async l => {
    const { doc } = await generateGuidePDF({ config, lang: l })
    ouvrirBlob(doc)
  }

  const destinataires = useMemo(() => personnes.filter(p => p.email && (!seulementConfirmes || p.paiement === 'confirme')), [personnes, seulementConfirmes])
  const selection = destinataires.filter(p => choisis[p.dossier])
  const langues = [...new Set(selection.map(p => p.langue))]
  const bloque = langues.some(l => guideChampsManquants(config, l).length > 0)

  const envoyerGuide = async () => {
    if (!selection.length || bloque) return
    if (!window.confirm(`Envoyer le guide à ${selection.length} personne(s) ?`)) return
    // On enregistre d'abord les valeurs affichées : ce sont celles du PDF envoyé.
    await supabase.from('guide_config').update({ valeurs: config, updated_at: new Date().toISOString() }).eq('id', 1)
    setEnvoi({ fait: 0, total: selection.length, echecs: [] })
    const cache = {}
    const echecs = []
    for (let i = 0; i < selection.length; i++) {
      const p = selection[i]
      try {
        if (!cache[p.langue]) {
          const { doc, filename } = await generateGuidePDF({ config, lang: p.langue })
          cache[p.langue] = { pdf: pdfEnBase64(doc), filename }
        }
        const { data, error } = await supabase.functions.invoke('voyage-notify', {
          body: { action: 'envoyer', kind: 'guide', dossier: p.dossier, pdf: cache[p.langue].pdf, filename: cache[p.langue].filename },
        })
        if (error || !data?.success) echecs.push(`${p.prenom || ''} ${p.nom || ''} (${p.dossier})`.trim())
      } catch { echecs.push(`${p.prenom || ''} ${p.nom || ''} (${p.dossier})`.trim()) }
      setEnvoi({ fait: i + 1, total: selection.length, echecs: [...echecs] })
    }
    setChoisis({})
    recharger()
  }

  return (
    <>
      <div style={{ ...CARTE, padding: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#0a1128' }}>Informations du guide</h3>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              À compléter : {manqFr.length} en français, {manqEn.length} en anglais (l'anglais reprend le français quand il est vide).
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['fr', 'en'].map(l => (
              <button key={l} type="button" onClick={() => setLang(l)} style={{ ...BTN, padding: '7px 14px', background: lang === l ? NAVY : '#f1f5f9', color: lang === l ? '#fff' : '#334155' }}>
                {l === 'fr' ? 'Français' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {GUIDE_FIELDS.map(f => {
            const vide = !(config[lang]?.[f.key] || '').trim() && !(f.defaut) && !(lang === 'en' && (config.fr?.[f.key] || '').trim())
            return (
              <div key={f.key}>
                <label style={LABEL}>{f[lang]}{vide && <span style={{ color: '#d97706' }}> · à compléter</span>}</label>
                <textarea
                  rows={f.key === 'programme_url' ? 1 : 2} value={config[lang]?.[f.key] || ''} onChange={e => modifier(f.key, e.target.value)}
                  placeholder={lang === 'en' && config.fr?.[f.key] ? `(repris du français) ${config.fr[f.key]}` : f.hint}
                  style={{ ...INPUT, resize: 'vertical', borderColor: vide ? '#fcd34d' : '#e2e8f0' }}
                />
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 18 }}>
          <button type="button" style={BTN_PRIMARY} onClick={enregistrer} disabled={occupe}>{occupe ? 'Enregistrement…' : 'Enregistrer'}</button>
          <button type="button" style={BTN_SOFT} onClick={() => apercu('fr')}>Aperçu PDF français</button>
          <button type="button" style={BTN_SOFT} onClick={() => apercu('en')}>Aperçu PDF anglais</button>
          {sauve && <span style={{ fontSize: 13, color: sauve.includes('Échec') ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{sauve}</span>}
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '10px 0 0' }}>Pensez à enregistrer avant l'aperçu : il utilise les valeurs affichées ici.</p>
      </div>

      <div style={{ ...CARTE, padding: 20 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: '#0a1128' }}>Espace participant</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
          Tant que le guide n'est pas publié, les participants voient « à venir » dans leur espace (<code>/verifier</code>). L'envoi par email est indépendant.
        </p>
        <button type="button" style={publie ? { ...BTN, background: '#fee2e2', color: '#991b1b' } : BTN_PRIMARY} onClick={basculerPublication}>
          {publie ? 'Retirer le guide de l’espace participant' : 'Publier le guide dans l’espace participant'}
        </button>
        <span style={{ marginLeft: 12, fontSize: 12.5, fontWeight: 700, color: publie ? '#16a34a' : '#94a3b8' }}>{publie ? '● Publié' : '○ Non publié'}</span>
      </div>

      <div style={{ ...CARTE, padding: 20 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: '#0a1128' }}>Envoyer le guide par email</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
          Le PDF part en pièce jointe, dans la langue de chaque personne. Rien n'est envoyé sans votre clic.
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', marginBottom: 10 }}>
          <input type="checkbox" checked={seulementConfirmes} onChange={e => setSeulementConfirmes(e.target.checked)} />
          Uniquement les inscriptions dont le paiement est confirmé
        </label>
        <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid #f1f5f9', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faff', position: 'sticky', top: 0 }}>
                <th style={{ padding: '8px 12px', width: 30 }}>
                  <input type="checkbox" checked={destinataires.length > 0 && selection.length === destinataires.length}
                    onChange={e => setChoisis(e.target.checked ? Object.fromEntries(destinataires.map(p => [p.dossier, true])) : {})} />
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#64748b' }}>PERSONNE</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#64748b' }}>ORGANISATION</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#64748b' }}>LANGUE</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#64748b' }}>GUIDE</th>
              </tr>
            </thead>
            <tbody>
              {destinataires.length === 0 && <tr><td colSpan={5} style={{ padding: 16, color: '#64748b' }}>Aucune personne avec email pour ce filtre.</td></tr>}
              {destinataires.map(p => (
                <tr key={p.dossier} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px' }}><input type="checkbox" checked={!!choisis[p.dossier]} onChange={e => setChoisis(c => ({ ...c, [p.dossier]: e.target.checked }))} /></td>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.prenom} {p.nom}<div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{p.dossier}</div></td>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>{p.organisation || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{p.langue.toUpperCase()}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: p.voyage?.guide_envoye_le ? '#16a34a' : '#94a3b8' }}>
                    {p.voyage?.guide_envoye_le ? `Envoyé le ${fmtDate(p.voyage.guide_envoye_le)}` : 'Pas envoyé'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bloque && (
          <p style={{ fontSize: 13, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', margin: '12px 0 0' }}>
            Envoi bloqué : il reste des champs à compléter ({langues.map(l => `${l === 'fr' ? 'français' : 'anglais'} : ${guideChampsManquants(config, l).length}`).join(', ')}). Enregistrez-les ci-dessus.
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" style={{ ...BTN_PRIMARY, opacity: !selection.length || bloque || (envoi && envoi.fait < envoi.total) ? 0.5 : 1 }}
            disabled={!selection.length || bloque || (envoi && envoi.fait < envoi.total)} onClick={envoyerGuide}>
            Envoyer le guide à {selection.length} personne{selection.length > 1 ? 's' : ''}
          </button>
          {envoi && (
            <span style={{ fontSize: 13, color: envoi.echecs.length ? '#b45309' : '#16a34a', fontWeight: 700 }}>
              {envoi.fait}/{envoi.total} traités{envoi.echecs.length ? ` — échecs : ${envoi.echecs.join(', ')}` : ''}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────── Fiches ───────────────────────────────
function OngletFiches({ config, personnes, recharger }) {
  const [filtre, setFiltre] = useState('tous')
  const [edition, setEdition] = useState(null)

  const affiches = personnes.filter(p => filtre === 'tous' || (p.voyage?.statut || 'aucun') === filtre)
  const compte = s => personnes.filter(p => (p.voyage?.statut || 'aucun') === s).length

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[['tous', `Tous (${personnes.length})`], ['vols_recus', `Vols reçus (${compte('vols_recus')})`], ['fiche_prete', `Fiche prête (${compte('fiche_prete')})`], ['fiche_envoyee', `Envoyée (${compte('fiche_envoyee')})`], ['aucun', `Sans vol (${compte('aucun')})`]].map(([id, lib]) => (
          <button key={id} type="button" onClick={() => setFiltre(id)} style={{ ...BTN, padding: '7px 14px', background: filtre === id ? NAVY : '#f1f5f9', color: filtre === id ? '#fff' : '#334155' }}>{lib}</button>
        ))}
      </div>
      <div style={{ ...CARTE, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8faff' }}>
              {['Personne', 'Organisation', 'Vols', 'Hôtel', 'Statut', ''].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {affiches.length === 0 && <tr><td colSpan={6} style={{ padding: 18, color: '#64748b' }}>Aucune personne pour ce filtre.</td></tr>}
            {affiches.map(p => (
              <tr key={p.dossier} style={{ borderTop: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.prenom} {p.nom}<div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{p.dossier}</div></td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>{p.organisation || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#334155' }}>
                  {lignevol(p.voyage?.vol_aller) ? <div>↘ {lignevol(p.voyage.vol_aller)}</div> : null}
                  {lignevol(p.voyage?.vol_retour) ? <div>↗ {lignevol(p.voyage.vol_retour)}</div> : null}
                  {p.voyage?.billet_path ? <div style={{ color: '#0369a1' }}>Billet déposé</div> : null}
                  {!lignevol(p.voyage?.vol_aller) && !lignevol(p.voyage?.vol_retour) && !p.voyage?.billet_path ? <span style={{ color: '#94a3b8' }}>—</span> : null}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#475569' }}>{p.voyage?.hotel || '—'}</td>
                <td style={{ padding: '10px 14px' }}><Pastille statut={p.voyage?.statut || 'aucun'} /></td>
                <td style={{ padding: '10px 14px' }}><button type="button" style={{ ...BTN_SOFT, padding: '6px 12px' }} onClick={() => setEdition(p)}>Ouvrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edition && <FenetreFiche personne={edition} config={config} onClose={() => setEdition(null)} onSaved={() => { recharger() }} />}
    </>
  )
}

const CHAMPS_HOTEL = [
  ['hotel', "Nom de l'hôtel"], ['hotel_categorie', 'Catégorie (ex. 4 étoiles)'], ['hotel_adresse', 'Adresse complète'],
  ['hotel_confirmation', 'N° de confirmation'],
  ['pickup', 'Aéroport → hôtel : heure, point de rencontre, reconnaissance'], ['chauffeur', 'Chauffeur / référent : nom et téléphone'],
  ['retour_transfert', 'Hôtel → aéroport (retour) : heure indicative'],
]

function FenetreFiche({ personne, config, onClose, onSaved }) {
  const v0 = personne.voyage || {}
  const [f, setF] = useState(() => Object.fromEntries(CHAMPS_HOTEL.map(([k]) => [k, v0[k] || ''])))
  const [aller, setAller] = useState({ compagnie: '', numero: '', date: '', heure: '', ...(v0.vol_aller || {}) })
  const [retour, setRetour] = useState({ compagnie: '', numero: '', date: '', heure: '', ...(v0.vol_retour || {}) })
  const [langue, setLangue] = useState(personne.langue)
  const [statut, setStatut] = useState(v0.statut || 'aucun')
  const [msg, setMsg] = useState('')
  const [occupe, setOccupe] = useState(false)

  const nettoie = o => { const r = Object.fromEntries(Object.entries(o).filter(([, x]) => String(x || '').trim())); return Object.keys(r).length ? r : null }
  const manquants = FICHE_CHAMPS_REQUIS.filter(k => !String(f[k] || '').trim())
  const manquantsVols = [!nettoie(aller) && 'vol aller', !nettoie(retour) && 'vol retour'].filter(Boolean)
  const manquantsCommun = fichesChampsCommunsManquants(config, langue)
  const bloquant = () => {
    if (manquants.length) return `Champs obligatoires manquants : ${manquants.length}`
    if (manquantsVols.length) return `Renseignez d'abord : ${manquantsVols.join(' et ')}`
    if (manquantsCommun.length) return 'Complétez les réglages communs des fiches (navette, référent) dans l’onglet Guide'
    return ''
  }

  const donneesVoyage = () => ({
    dossier: personne.dossier, nom: personne.nom, prenom: personne.prenom, organisation: personne.organisation,
    vol_aller: nettoie(aller), vol_retour: nettoie(retour), fiche: { ...f },
  })

  const enregistrer = async (nouveauStatut = statut) => {
    setOccupe(true); setMsg('')
    if (nouveauStatut === 'aucun' && (nettoie(aller) || nettoie(retour))) nouveauStatut = 'vols_recus'
    const ligne = {
      dossier: personne.dossier, ...f, vol_aller: nettoie(aller), vol_retour: nettoie(retour), statut: nouveauStatut, updated_at: new Date().toISOString(),
    }
    Object.keys(f).forEach(k => { ligne[k] = String(f[k] || '').trim() || null })
    const { error } = await supabase.from('voyages').upsert(ligne, { onConflict: 'dossier' })
    setOccupe(false)
    if (error) { setMsg("Échec de l'enregistrement."); return false }
    setStatut(nouveauStatut); setMsg('Enregistré ✓'); onSaved()
    return true
  }

  const alertes = r => [
    r.tronques?.length ? `Texte tronqué (trop long) : ${r.tronques.join(', ')}` : '',
    r.remplaces?.length ? `Caractères non pris en charge remplacés par « ? » : ${r.remplaces.join(', ')}` : '',
  ].filter(Boolean).join(' — ')

  const apercu = async () => {
    try {
      const r = await generateFichePDF({ voyage: donneesVoyage(), config, lang: langue })
      ouvrirOctets(r.octets)
      setMsg(alertes(r))
    } catch (e) { setMsg(e.message || 'Génération impossible.') }
  }

  const marquerPrete = async () => {
    if (bloquant()) { setMsg(bloquant()); return }
    await enregistrer('fiche_prete')
  }

  const envoyer = async () => {
    if (bloquant()) { setMsg(bloquant()); return }
    if (!personne.email) { setMsg('Cette personne n’a pas d’email enregistré.'); return }
    if (!window.confirm(`Envoyer la fiche de voyage à ${personne.prenom || ''} ${personne.nom || ''} ?`)) return
    const ok = await enregistrer(statut === 'fiche_envoyee' ? 'fiche_envoyee' : 'fiche_prete')
    if (!ok) return
    setOccupe(true)
    try {
      const r = await generateFichePDF({ voyage: donneesVoyage(), config, lang: langue })
      const { data, error } = await supabase.functions.invoke('voyage-notify', { body: { action: 'envoyer', kind: 'fiche', dossier: personne.dossier, pdf: octetsEnBase64(r.octets), filename: r.filename } })
      if (error || !data?.success) setMsg("Échec de l'envoi.")
      else { setStatut('fiche_envoyee'); setMsg(`Fiche envoyée ✓ ${alertes(r)}`.trim()); onSaved() }
    } catch (e) { setMsg(e.message || "Échec de l'envoi.") }
    setOccupe(false)
  }

  const voirBillet = async () => {
    const { data, error } = await supabase.storage.from('billets-avion').createSignedUrl(v0.billet_path, 300)
    if (error || !data?.signedUrl) { setMsg('Billet illisible.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  const volInputs = (titre, val, set) => (
    <div>
      <div style={{ ...LABEL, color: '#0a1128' }}>{titre}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input style={INPUT} placeholder="Compagnie" value={val.compagnie} onChange={e => set(x => ({ ...x, compagnie: e.target.value }))} />
        <input style={INPUT} placeholder="N° de vol" value={val.numero} onChange={e => set(x => ({ ...x, numero: e.target.value }))} />
        <input style={INPUT} type="date" value={val.date} onChange={e => set(x => ({ ...x, date: e.target.value }))} />
        <input style={INPUT} type="time" value={val.heure} onChange={e => set(x => ({ ...x, heure: e.target.value }))} />
      </div>
    </div>
  )

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 720, maxHeight: '92vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#0a1128' }}>{personne.prenom} {personne.nom}</h3>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>{personne.dossier} · {personne.organisation || '—'} · {personne.email || 'pas d’email'}</span>
          </div>
          <Pastille statut={statut} />
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {volInputs('Vol aller (arrivée à Casablanca)', aller, setAller)}
            {volInputs('Vol retour (départ de Casablanca)', retour, setRetour)}
          </div>
          {v0.billet_path && <div><button type="button" style={BTN_SOFT} onClick={voirBillet}>Voir le billet déposé</button></div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {CHAMPS_HOTEL.map(([k, lib]) => (
              <div key={k} style={{ gridColumn: ['hotel_adresse', 'pickup'].includes(k) ? '1 / -1' : undefined }}>
                <label style={LABEL}>{lib}{FICHE_CHAMPS_REQUIS.includes(k) && <span style={{ color: '#dc2626' }}> *</span>}</label>
                <input style={INPUT} value={f[k]} onChange={e => { setMsg(''); setF(x => ({ ...x, [k]: e.target.value })) }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 700 }}>Langue de la fiche :</span>
            {['fr', 'en'].map(l => <button key={l} type="button" onClick={() => setLangue(l)} style={{ ...BTN, padding: '6px 12px', background: langue === l ? NAVY : '#f1f5f9', color: langue === l ? '#fff' : '#334155' }}>{l.toUpperCase()}</button>)}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 18 }}>
          <button type="button" style={BTN_PRIMARY} disabled={occupe} onClick={() => enregistrer()}>Enregistrer</button>
          <button type="button" style={BTN_SOFT} onClick={apercu}>Aperçu PDF</button>
          {statut !== 'fiche_prete' && statut !== 'fiche_envoyee' && <button type="button" style={BTN_SOFT} disabled={occupe} onClick={marquerPrete}>Marquer « prête »</button>}
          <button type="button" style={{ ...BTN, background: '#16a34a', color: '#fff' }} disabled={occupe} onClick={envoyer}>{statut === 'fiche_envoyee' ? 'Renvoyer la fiche' : 'Envoyer la fiche'}</button>
          <button type="button" style={{ ...BTN, background: '#f1f5f9', color: '#334155', marginLeft: 'auto' }} onClick={onClose}>Fermer</button>
        </div>
        {msg && <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700, color: msg.includes('✓') ? '#16a34a' : '#b45309' }}>{msg}</p>}
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '10px 0 0' }}>Champs marqués * obligatoires avant de marquer la fiche « prête » ou de l'envoyer.</p>
      </div>
    </div>
  )
}
