import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { generateLettreMissionPDF } from '../utils/generateLettreMissionPDF'
import { pdfEnBase64 } from '../utils/generateVoyagePDF'
import { PRESETS_LETTRE_MISSION, MODELE_INTERVENANT } from '../utils/lettreMissionPresets'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const CARTE = { background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)' }
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a' }
const LABEL = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }
const BTN = { padding: '9px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const BTN_PRIMARY = { ...BTN, background: NAVY, color: '#fff' }
const BTN_SOFT = { ...BTN, background: '#eef2ff', color: NAVY }
const ATTRIBUTIONS_MAX = 260
const ITINERAIRE_DEFAUT = 'Cotonou – Abidjan – Istanbul – Casablanca (aller-retour)'
const ITINERAIRES_SUGGERES = [
  'Cotonou – Abidjan – Istanbul – Casablanca (aller-retour)',
  'Cotonou – Casablanca – Cotonou',
]

const STATUTS = {
  aucun:   { label: 'Pas commencée', bg: '#f1f5f9', fg: '#475569' },
  prete:   { label: 'Prête', bg: '#fef3c7', fg: '#92400e' },
  envoyee: { label: 'Envoyée', bg: '#dcfce7', fg: '#166534' },
}
const QUALITES = [
  { id: 'comite', label: 'Comité d\'organisation' },
  { id: 'equipe', label: 'Équipe d\'organisation' },
  { id: 'intervenant', label: 'Intervenant(e)' },
  { id: 'autre', label: 'Autre' },
]

function Pastille({ statut }) {
  const s = STATUTS[statut] || STATUTS.aucun
  return <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 100, padding: '3px 10px', background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>{s.label}</span>
}

const ouvrirBlob = doc => window.open(URL.createObjectURL(doc.output('blob')), '_blank', 'noopener')

// Prochaine reference sequentielle COPAF2026-LM-XXX, a partir des lettres
// deja enregistrees (jamais recalculee pour une lettre existante).
function prochaineReference(personnes) {
  let max = 0
  personnes.forEach(p => {
    const m = /^COPAF2026-LM-(\d{3,})$/.exec(p.mission?.reference || '')
    if (m) max = Math.max(max, parseInt(m[1], 10))
  })
  return `COPAF2026-LM-${String(max + 1).padStart(3, '0')}`
}

export default function AdminLettreMission() {
  const [personnes, setPersonnes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [edition, setEdition] = useState(null) // { personne, nouvelle }

  const charger = useCallback(async () => {
    setErreur('')
    const [iv, lm] = await Promise.all([
      supabase.from('intervenants').select('dossier, nom, prenom, organisation, fonction, pays, numero_passeport, equipe, email, langue'),
      supabase.from('lettres_mission').select('*'),
    ])
    if (iv.error || lm.error) { setErreur('Chargement impossible (droits administrateur requis).'); return }
    const lettres = Object.fromEntries((lm.data || []).map(l => [l.dossier, l]))
    const dossiersConnus = new Set((iv.data || []).map(p => p.dossier))
    const liste = [
      ...(iv.data || []).map(p => ({ ...p, mission: lettres[p.dossier] || null, placeholder: false })),
      // Lettres creees pour des personnes pas encore dans la table intervenants
      // (ex. membres d'equipe pas encore accredites) : on les affiche quand
      // meme, avec les infos de la lettre elle-meme.
      ...(lm.data || []).filter(l => !dossiersConnus.has(l.dossier)).map(l => ({
        dossier: l.dossier, nom: l.nom_libre || '', prenom: '', organisation: l.organisation_libre || '',
        fonction: l.fonction_libre || '', pays: '', numero_passeport: '', equipe: l.qualite === 'equipe',
        email: null, langue: 'fr', mission: l, placeholder: true,
      })),
    ].sort((a, b) => (a.organisation || '').localeCompare(b.organisation || '') || (a.nom || '').localeCompare(b.nom || ''))
    setPersonnes(liste)
  }, [])

  useEffect(() => { charger() }, [charger])

  const affiches = personnes ? personnes.filter(p => filtre === 'tous' || (p.mission?.statut || 'aucun') === filtre) : []
  const compte = s => (personnes || []).filter(p => (p.mission?.statut || 'aucun') === s).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Lettres de mission</h2>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, maxWidth: 640 }}>
            Un document par personne (équipe, intervenants, comité d'organisation). Utilisez un préréglage pour aller vite, tout reste modifiable.
          </p>
        </div>
        <button type="button" style={BTN_PRIMARY} onClick={() => setEdition({ personne: null, nouvelle: true })}>+ Nouvelle lettre</button>
      </div>
      {erreur && <p style={{ color: '#dc2626', fontSize: 13.5, margin: 0 }}>{erreur}</p>}
      {personnes === null && !erreur && <p style={{ color: '#64748b', fontSize: 13.5, margin: 0 }}>Chargement…</p>}

      {personnes !== null && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[['tous', `Tous (${personnes.length})`], ['aucun', `Pas commencée (${compte('aucun')})`], ['prete', `Prête (${compte('prete')})`], ['envoyee', `Envoyée (${compte('envoyee')})`]].map(([id, lib]) => (
              <button key={id} type="button" onClick={() => setFiltre(id)} style={{ ...BTN, padding: '7px 14px', background: filtre === id ? NAVY : '#f1f5f9', color: filtre === id ? '#fff' : '#334155' }}>{lib}</button>
            ))}
          </div>
          <div style={{ ...CARTE, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8faff' }}>
                  {['Personne', 'Organisation', 'Qualité', 'Statut', ''].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {affiches.length === 0 && <tr><td colSpan={5} style={{ padding: 18, color: '#64748b' }}>Aucune personne pour ce filtre.</td></tr>}
                {affiches.map(p => (
                  <tr key={p.dossier} style={{ borderTop: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                      {p.prenom} {p.nom}
                      {p.placeholder && <span style={{ marginLeft: 6, fontSize: 9.5, fontWeight: 800, color: '#92400e', background: '#fef3c7', borderRadius: 20, padding: '1px 6px' }}>pas encore accrédité(e)</span>}
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{p.dossier}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{p.organisation || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{QUALITES.find(q => q.id === (p.mission?.qualite || (p.equipe ? 'equipe' : 'intervenant')))?.label}</td>
                    <td style={{ padding: '10px 14px' }}><Pastille statut={p.mission?.statut || 'aucun'} /></td>
                    <td style={{ padding: '10px 14px' }}><button type="button" style={{ ...BTN_SOFT, padding: '6px 12px' }} onClick={() => setEdition({ personne: p, nouvelle: false })}>Ouvrir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {edition && (
        <FenetreLettre
          personne={edition.personne}
          annuaire={personnes || []}
          referenceSuggeree={prochaineReference(personnes || [])}
          onClose={() => setEdition(null)}
          onSaved={() => { charger() }}
        />
      )}
    </div>
  )
}

function FenetreLettre({ personne, annuaire, referenceSuggeree, onClose, onSaved }) {
  const [lien, setLien] = useState(null) // fiche intervenant retrouvee via le préréglage
  const p0 = personne || {}
  const m0 = p0.mission || {}
  const cible = personne || lien || {}

  const [presetId, setPresetId] = useState('libre')
  const [dossier, setDossier] = useState(p0.dossier || '')
  const [nom, setNom] = useState(p0.placeholder ? p0.nom : `${p0.prenom || ''} ${p0.nom || ''}`.trim())
  const [fonction, setFonction] = useState(p0.fonction || '')
  const [organisation, setOrganisation] = useState(p0.organisation || '')
  const [paysNat, setPaysNat] = useState(p0.pays || '')
  const [passeport, setPasseport] = useState(p0.numero_passeport || '')

  const [qualite, setQualite] = useState(m0.qualite || (p0.equipe ? 'equipe' : 'intervenant'))
  const [qualiteAutre, setQualiteAutre] = useState(m0.qualite_autre || '')
  const [role, setRole] = useState(m0.role_attributions || '')
  const [dateDebut, setDateDebut] = useState(m0.date_debut || '2026-10-17')
  const [dateFin, setDateFin] = useState(m0.date_fin || '2026-10-22')
  const [itineraire, setItineraire] = useState(m0.itineraire || ITINERAIRE_DEFAUT)
  const [frais, setFrais] = useState({
    transport: m0.frais_transport || false, hebergement: m0.frais_hebergement || false,
    restauration: m0.frais_restauration || false, transferts: m0.frais_transferts || false,
  })
  const [reference, setReference] = useState(m0.reference || referenceSuggeree)
  const [lieuSignature, setLieuSignature] = useState(m0.lieu_signature || '')
  const [statut, setStatut] = useState(m0.statut || 'aucun')
  const [occupe, setOccupe] = useState(false)
  const [msg, setMsg] = useState('')

  // Mode "Nouvel intervenant" : Titre / Date / Heure de session -> texte
  // des attributions genere en direct a partir de MODELE_INTERVENANT.
  const [sessionTitre, setSessionTitre] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionHeure, setSessionHeure] = useState('')
  const modeNouvelIntervenant = presetId === 'nouvel_intervenant'

  useEffect(() => {
    if (!modeNouvelIntervenant) return
    const texte = MODELE_INTERVENANT
      .replace('{titre}', sessionTitre || '…')
      .replace('{date}', sessionDate ? new Date(sessionDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }) : '…')
      .replace('{heure}', sessionHeure || '…')
    setRole(texte.slice(0, ATTRIBUTIONS_MAX))
  }, [modeNouvelIntervenant, sessionTitre, sessionDate, sessionHeure])

  const appliquerPreset = id => {
    setPresetId(id)
    setMsg('')
    if (id === 'libre') {
      setNom(''); setFonction(''); setOrganisation(''); setQualite('intervenant'); setRole('')
      return
    }
    if (id === 'nouvel_intervenant') {
      setQualite('intervenant')
      setSessionTitre(''); setSessionDate(''); setSessionHeure('')
      setRole('')
      return
    }
    const preset = PRESETS_LETTRE_MISSION.find(pr => pr.id === id)
    if (!preset) return
    setNom(preset.nom); setFonction(preset.fonction); setOrganisation(preset.organisation)
    setQualite(preset.qualite); setRole(preset.attributions.slice(0, ATTRIBUTIONS_MAX))
    // Rattache la fiche intervenant : dossier, passeport, nationalité (jamais pour une autre personne que celle ouverte)
    const fiche = preset.dossier && (!personne || personne.dossier === preset.dossier)
      ? annuaire.find(a => a.dossier === preset.dossier) : null
    setLien(fiche || null)
    if (fiche) {
      if (!personne) setDossier(fiche.dossier)
      setPasseport(fiche.numero_passeport || '')
      setPaysNat(fiche.pays || '')
    }
  }

  const donnees = () => ({
    dossier: dossier.trim(), qualite, qualite_autre: qualite === 'autre' ? qualiteAutre.trim() : null,
    role_attributions: role.trim() || null, date_debut: dateDebut || null, date_fin: dateFin || null,
    itineraire: itineraire.trim() || null,
    frais_transport: frais.transport, frais_hebergement: frais.hebergement,
    frais_restauration: frais.restauration, frais_transferts: frais.transferts,
    reference: reference.trim() || null, lieu_signature: lieuSignature.trim() || null,
    nom_libre: nom.trim() || null, prenom_libre: null, fonction_libre: fonction.trim() || null, organisation_libre: organisation.trim() || null,
  })

  const enregistrer = async (nouveauStatut = statut) => {
    if (!dossier.trim()) { setMsg('Le numéro de dossier est requis (sert de référence pour cette personne).'); return false }
    if (!nom.trim()) { setMsg('Le nom et prénoms sont requis.'); return false }
    setOccupe(true); setMsg('')
    const ligne = { ...donnees(), statut: nouveauStatut, updated_at: new Date().toISOString() }
    if (nouveauStatut === 'prete' || nouveauStatut === 'envoyee') ligne.genere_le = new Date().toISOString()
    const { error } = await supabase.from('lettres_mission').upsert(ligne, { onConflict: 'dossier' })
    setOccupe(false)
    if (error) { setMsg("Échec de l'enregistrement : " + error.message); return false }
    setStatut(nouveauStatut); setMsg('Enregistré ✓'); onSaved()
    return true
  }

  const construitPersonneEtMission = () => ({
    personne: { prenom: '', nom, fonction, organisation, pays: paysNat, numero_passeport: passeport },
    mission: donnees(),
  })

  const apercu = async () => {
    if (!nom.trim()) { setMsg('Le nom et prénoms sont requis.'); return }
    try {
      const { personne: pers, mission } = construitPersonneEtMission()
      const doc = await generateLettreMissionPDF({ personne: pers, mission, lang: cible.langue === 'en' ? 'en' : 'fr', download: false })
      ouvrirBlob(doc)
    } catch (e) { setMsg(e.message || 'Génération impossible.') }
  }

  const telecharger = async () => {
    if (!nom.trim()) { setMsg('Le nom et prénoms sont requis.'); return }
    try {
      const { personne: pers, mission } = construitPersonneEtMission()
      await generateLettreMissionPDF({ personne: pers, mission, lang: cible.langue === 'en' ? 'en' : 'fr', download: true })
    } catch (e) { setMsg(e.message || 'Génération impossible.') }
  }

  const marquerPrete = async () => { await enregistrer('prete') }

  const envoyerParEmail = async () => {
    if (!nom.trim()) { setMsg('Le nom et prénoms sont requis.'); return }
    if (!cible.email) { setMsg("Cette personne n'a pas d'email enregistré (dossier intervenant introuvable ou non accrédité)."); return }
    if (!window.confirm(`Envoyer la lettre de mission à ${nom} (${cible.email}) ?`)) return
    setOccupe(true); setMsg('')
    try {
      const ok = await enregistrer('prete')
      if (!ok) { setOccupe(false); return }
      const { personne: pers, mission } = construitPersonneEtMission()
      const doc = await generateLettreMissionPDF({ personne: pers, mission, lang: cible.langue === 'en' ? 'en' : 'fr', download: false })
      const filename = `Lettre_de_mission_${(nom || '').replace(/[^A-Za-z0-9]+/g, '')}.pdf`
      const { data, error } = await supabase.functions.invoke('voyage-notify', {
        body: { action: 'envoyer', kind: 'lettre_mission', dossier: dossier.trim(), pdf: pdfEnBase64(doc), filename },
      })
      if (error || !data?.success) {
        setMsg(data?.raison === 'sans_email' ? "Cette personne n'a pas d'email enregistré." : "Échec de l'envoi de l'email.")
      } else {
        setStatut('envoyee'); setMsg('Lettre envoyée par email ✓'); onSaved()
      }
    } catch (e) { setMsg(e.message || "Échec de l'envoi.") }
    setOccupe(false)
  }

  const inp = (val, set, type = 'text', placeholder) => (
    <input type={type} style={INPUT} value={val} placeholder={placeholder} onChange={e => { setMsg(''); set(e.target.value) }} />
  )

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '92vh', overflow: 'auto' }}>
        <div style={{ background: NAVY, color: '#fff', padding: '18px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Lettre de mission</div>
            <div style={{ fontSize: 12.5, color: '#93c5fd', marginTop: 4 }}>{nom || 'Nouvelle personne'} {dossier ? `· ${dossier}` : ''}</div>
          </div>
          <Pastille statut={statut} />
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LABEL}>Personne</label>
            <select style={INPUT} value={presetId} onChange={e => appliquerPreset(e.target.value)}>
              <option value="libre">— Choisir un préréglage —</option>
              {PRESETS_LETTRE_MISSION.map(pr => <option key={pr.id} value={pr.id}>{pr.nom}</option>)}
              <option value="nouvel_intervenant">Nouvel intervenant (à partir d'une session)</option>
              <option value="saisie_libre_explicite" disabled>──────────</option>
            </select>
            <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '6px 0 0' }}>
              Un préréglage remplit nom/fonction/organisation/qualité/rôle — tout reste modifiable ensuite. Choisissez « — Choisir... —» pour une saisie 100% libre.
            </p>
          </div>

          <div>
            <label style={LABEL}>Numéro de dossier *</label>
            {personne ? (
              <div style={{ ...INPUT, background: '#f1f5f9', color: '#475569' }}>{dossier}</div>
            ) : inp(dossier, setDossier, 'text', 'Ex : INT2026-014')}
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
              Sert de clé pour retrouver cette lettre. Si la personne a déjà un dossier intervenant (même numéro), elle pourra la télécharger elle-même depuis son espace dès que la lettre est « prête ».
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LABEL}>Nom et prénoms *</label>{inp(nom, setNom)}</div>
            <div><label style={LABEL}>Fonction / Titre</label>{inp(fonction, setFonction)}</div>
            <div><label style={LABEL}>Organisation / Structure</label>{inp(organisation, setOrganisation)}</div>
            <div><label style={LABEL}>Nationalité</label>{inp(paysNat, setPaysNat)}</div>
            <div><label style={LABEL}>N° de passeport</label>{inp(passeport, setPasseport)}</div>
          </div>

          <div>
            <label style={LABEL}>Qualité</label>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {QUALITES.map(q => (
                <label key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="qualite" checked={qualite === q.id} onChange={() => { setMsg(''); setQualite(q.id) }} /> {q.label}
                </label>
              ))}
            </div>
            {qualite === 'autre' && <div style={{ marginTop: 8 }}>{inp(qualiteAutre, setQualiteAutre)}</div>}
          </div>

          {modeNouvelIntervenant && (
            <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: NAVY, textTransform: 'uppercase', letterSpacing: 0.4 }}>Session de l'intervenant</div>
              <div><label style={LABEL}>Titre de la session</label>{inp(sessionTitre, setSessionTitre, 'text', 'Ex : Cybersécurité portuaire')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={LABEL}>Date</label>{inp(sessionDate, setSessionDate, 'date')}</div>
                <div><label style={LABEL}>Heure</label>{inp(sessionHeure, setSessionHeure, 'text', 'Ex : 13h30 – 14h45')}</div>
              </div>
            </div>
          )}

          <div>
            <label style={LABEL}>Rôle et attributions</label>
            <textarea
              style={{ ...INPUT, minHeight: 70, resize: 'vertical' }} value={role} maxLength={ATTRIBUTIONS_MAX}
              onChange={e => { setMsg(''); setRole(e.target.value.slice(0, ATTRIBUTIONS_MAX)) }}
              placeholder="Ex : Assurer la modération de la session plénière du Jour 2, coordonner les intervenants de l'atelier Cybersécurité."
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: role.length > ATTRIBUTIONS_MAX - 20 ? '#b45309' : '#94a3b8', marginTop: 3 }}>{role.length} / {ATTRIBUTIONS_MAX}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LABEL}>Date de début</label>{inp(dateDebut, setDateDebut, 'date')}</div>
            <div><label style={LABEL}>Date de fin</label>{inp(dateFin, setDateFin, 'date')}</div>
          </div>
          <div>
            <label style={LABEL}>Itinéraire</label>
            <input
              style={INPUT} value={itineraire} list="itineraires-suggeres"
              onChange={e => { setMsg(''); setItineraire(e.target.value) }}
              placeholder="Choisissez une suggestion ou saisissez librement"
            />
            <datalist id="itineraires-suggeres">
              {ITINERAIRES_SUGGERES.map(it => <option key={it} value={it} />)}
            </datalist>
          </div>

          <div>
            <label style={LABEL}>Frais pris en charge par l'organisation</label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[['transport', 'Transport aérien'], ['hebergement', 'Hébergement'], ['restauration', 'Restauration'], ['transferts', 'Transferts locaux']].map(([k, lib]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={frais[k]} onChange={e => { setMsg(''); setFrais(f => ({ ...f, [k]: e.target.checked })) }} /> {lib}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LABEL}>Référence</label>{inp(reference, setReference)}</div>
            <div><label style={LABEL}>Fait à</label>{inp(lieuSignature, setLieuSignature, 'text', 'Ex : Casablanca')}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 6 }}>
            <button type="button" style={BTN_PRIMARY} disabled={occupe} onClick={() => enregistrer()}>Enregistrer</button>
            <button type="button" style={BTN_SOFT} onClick={apercu}>Aperçu PDF</button>
            <button type="button" style={BTN_SOFT} onClick={telecharger}>Télécharger le PDF</button>
            {statut !== 'prete' && statut !== 'envoyee' && <button type="button" style={BTN_SOFT} disabled={occupe} onClick={marquerPrete}>Marquer « prête »</button>}
            <button type="button" style={{ ...BTN, background: '#16a34a', color: '#fff' }} disabled={occupe || !cible.email} onClick={envoyerParEmail} title={cible.email || "Aucun email enregistré pour cette personne"}>
              {statut === 'envoyee' ? 'Renvoyer par email' : 'Envoyer par email'}
            </button>
            <button type="button" style={{ ...BTN, background: '#f1f5f9', color: '#334155', marginLeft: 'auto' }} onClick={onClose}>Fermer</button>
          </div>
          {msg && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: msg.includes('✓') ? '#16a34a' : '#b45309' }}>{msg}</p>}
          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>
            « Prête » rend la lettre téléchargeable par la personne elle-même depuis son espace intervenant, si son numéro de dossier correspond à un compte intervenant existant.
          </p>
        </div>
      </div>
    </div>
  )
}
