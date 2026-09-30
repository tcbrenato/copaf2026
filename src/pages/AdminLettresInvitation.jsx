// src/pages/AdminLettresInvitation.jsx
//
// Generateur de documents COPAF 2026 : "Lettre d'invitation" (intervenants)
// et "Ordre de mission" (equipe d'organisation). Meme logique pour les
// deux : formulaire + apercu en direct (canvas, memes positions que le PDF
// final — voir utils/generateLettreInvitationPDF.js et
// utils/generateOrdreMissionPDF.js) + liste de travail (ajout/edition/
// suppression, import colle depuis Excel, export PDF individuel ou ZIP
// groupe). Un selecteur en haut de page bascule entre les deux types ;
// chacun garde sa propre liste (deux documents distincts, deux publics).
//
// Les listes de travail sont gardees en localStorage (pas de table
// Supabase) : outil de preparation ponctuelle avant l'evenement, pas un
// registre a synchroniser entre plusieurs personnes/appareils.

import { useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { supabase } from '../supabase'
import {
  CIVILITES, FOND, dessinerApercu, generateLettreInvitationPDF, genererReference,
} from '../utils/generateLettreInvitationPDF'
import {
  CIVILITES as CIVILITES_OM, FOND as FOND_OM, dessinerApercu as dessinerApercuOM, generateOrdreMissionPDF,
} from '../utils/generateOrdreMissionPDF'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const CLE_LISTE_INVITATION = 'copaf_lettres_invitation_liste'
const CLE_LISTE_ORDRE = 'copaf_ordres_mission_liste'
const FAMILLE_APERCU = "'Open Sans', sans-serif"

// Pays (tels qu'enregistres dans la fiche intervenant) -> nationalite en
// toutes lettres pour les documents officiels. Repli sur le pays tel quel
// si absent de la liste (mieux qu'un champ vide, a corriger au besoin).
const NATIONALITES = {
  'bénin': 'Béninoise', 'benin': 'Béninoise',
  'maroc': 'Marocaine',
  'togo': 'Togolaise',
  "côte d'ivoire": 'Ivoirienne', "cote d'ivoire": 'Ivoirienne',
  'sénégal': 'Sénégalaise', 'senegal': 'Sénégalaise',
  'ghana': 'Ghanéenne',
  'nigeria': 'Nigériane',
  'cameroun': 'Camerounaise',
  'gabon': 'Gabonaise',
  'congo': 'Congolaise',
  'rdc': 'Congolaise', 'république démocratique du congo': 'Congolaise', 'republique democratique du congo': 'Congolaise',
  'guinée': 'Guinéenne', 'guinee': 'Guinéenne',
  'guinée-bissau': 'Bissau-Guinéenne', 'guinee-bissau': 'Bissau-Guinéenne',
  'mali': 'Malienne',
  'burkina faso': 'Burkinabè',
  'niger': 'Nigérienne',
  'tchad': 'Tchadienne',
  'mauritanie': 'Mauritanienne',
  'tunisie': 'Tunisienne',
  'algérie': 'Algérienne', 'algerie': 'Algérienne',
  'égypte': 'Égyptienne', 'egypte': 'Égyptienne',
  'afrique du sud': 'Sud-Africaine',
  'kenya': 'Kényane',
  'éthiopie': 'Éthiopienne', 'ethiopie': 'Éthiopienne',
  'sierra leone': 'Sierra-Léonaise',
  'liberia': 'Libérienne',
  'cap-vert': 'Cap-Verdienne',
  'gambie': 'Gambienne',
  'angola': 'Angolaise',
  'mozambique': 'Mozambicaine',
  'namibie': 'Namibienne',
  'tanzanie': 'Tanzanienne',
  'rwanda': 'Rwandaise',
  'ouganda': 'Ougandaise',
  'france': 'Française',
  'etats-unis': 'Américaine', 'états-unis': 'Américaine', 'usa': 'Américaine',
  'royaume-uni': 'Britannique',
  'espagne': 'Espagnole',
  'belgique': 'Belge',
  'chine': 'Chinoise',
  'turquie': 'Turque',
}
function nationaliteDepuisPays(pays) {
  const p = String(pays || '').trim()
  if (!p) return ''
  return NATIONALITES[p.toLowerCase()] || p
}

const CARTE = { background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)' }
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a' }
const LABEL = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }
const BTN = { padding: '9px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const BTN_PRIMARY = { ...BTN, background: NAVY, color: '#fff' }
const BTN_SOFT = { ...BTN, background: '#eef2ff', color: NAVY }

function chargerListe(cle) {
  try { return JSON.parse(localStorage.getItem(cle) || '[]') } catch { return [] }
}

function versDate(iso) {
  return iso ? new Date(`${iso}T12:00:00`) : null
}

// ─────────────────────────── Lettre d'invitation ───────────────────────────

const CHAMPS_VIDES_INVITATION = () => ({
  id: null,
  dossier: '',
  publie: false,
  lieu: 'Washington DC',
  dateLettre: new Date().toISOString().slice(0, 10),
  reference: genererReference(),
  civilite: 'M.',
  prenom: '', nom: '', fonction: '', institution: '', villePays: '', nationalite: '', passeport: '',
  sejourDebut: '2026-10-17', sejourFin: '2026-10-23',
})

function validerInvitation(f) {
  if (!f.nom?.trim()) return 'Le nom est requis.'
  if (!f.reference?.trim()) return 'La référence est requise.'
  if (!f.sejourDebut || !f.sejourFin) return 'Les dates de séjour sont requises.'
  if (versDate(f.sejourFin) < versDate(f.sejourDebut)) return 'La date de fin de séjour doit être après la date de début.'
  return ''
}

// Colle Excel : une personne par ligne, separateur tabulation ou
// point-virgule, colonnes Civilite/Prenom(s)/Nom/Fonction/Institution/
// Ville et pays/Nationalite/N° passeport. Ignore une eventuelle ligne
// d'en-tete (detectee par des mots-cles plutot qu'une position fixe).
function parserColleExcelInvitation(texte) {
  const lignes = texte.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lignes.length) return []
  const decouper = l => l.split(/\t|;/).map(c => c.trim())
  let depart = 0
  const premiere = decouper(lignes[0]).join(' ').toLowerCase()
  if (/civilit|prénom|pr.nom|\bnom\b/.test(premiere)) depart = 1
  return lignes.slice(depart).map(decouper).filter(c => c.some(Boolean)).map(cols => ({
    civilite: cols[0] || '', prenom: cols[1] || '', nom: cols[2] || '', fonction: cols[3] || '',
    institution: cols[4] || '', villePays: cols[5] || '', nationalite: cols[6] || '', passeport: cols[7] || '',
  }))
}

// ─────────────────────────── Ordre de mission ───────────────────────────

const CHAMPS_VIDES_ORDRE = () => ({
  id: null,
  dossier: '',
  publie: false,
  civilite: 'M.',
  prenom: '', nom: '', fonction: '', nationalite: '', passeport: '',
  depart: '2026-10-17', retour: '2026-10-23',
  lieuSignature: 'Cotonou', dateSignature: new Date().toISOString().slice(0, 10),
})

function validerOrdre(f) {
  if (!f.nom?.trim()) return 'Le nom est requis.'
  if (!f.depart || !f.retour) return 'Les dates de départ et de retour sont requises.'
  if (versDate(f.retour) < versDate(f.depart)) return 'La date de retour doit être après la date de départ.'
  return ''
}

// Colle Excel : colonnes Civilité, Prénom(s), Nom, Fonction, Nationalité,
// N° passeport. Les dates de mission et le lieu/date de signature du
// formulaire en cours s'appliquent a chaque personne importee.
function parserColleExcelOrdre(texte) {
  const lignes = texte.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lignes.length) return []
  const decouper = l => l.split(/\t|;/).map(c => c.trim())
  let depart = 0
  const premiere = decouper(lignes[0]).join(' ').toLowerCase()
  if (/civilit|prénom|pr.nom|\bnom\b/.test(premiere)) depart = 1
  return lignes.slice(depart).map(decouper).filter(c => c.some(Boolean)).map(cols => ({
    civilite: cols[0] || '', prenom: cols[1] || '', nom: cols[2] || '', fonction: cols[3] || '',
    nationalite: cols[4] || '', passeport: cols[5] || '',
  }))
}

export default function AdminLettresInvitation() {
  const [docType, setDocType] = useState('invitation') // 'invitation' | 'ordre'

  // ── Etat Lettre d'invitation ──
  const [formInv, setFormInv] = useState(CHAMPS_VIDES_INVITATION)
  const [listeInv, setListeInv] = useState(() => chargerListe(CLE_LISTE_INVITATION))
  const [pasteInv, setPasteInv] = useState('')

  // ── Etat Ordre de mission ──
  const [formOm, setFormOm] = useState(CHAMPS_VIDES_ORDRE)
  const [listeOm, setListeOm] = useState(() => chargerListe(CLE_LISTE_ORDRE))
  const [pasteOm, setPasteOm] = useState('')

  const [msg, setMsg] = useState('')
  const [genEnCours, setGenEnCours] = useState(false)
  const [imagePrete, setImagePrete] = useState(false)
  const [policePrete, setPolicePrete] = useState(false)
  const [annuaire, setAnnuaire] = useState([])
  const canvasRef = useRef(null)
  const imageInvRef = useRef(null)
  const imageOmRef = useRef(null)

  // Annuaire des intervenants deja accredites, pour le selecteur "Choisir
  // une personne" (auto-remplissage du formulaire). Charge une fois — la
  // liste ne change pas pendant une session d'edition.
  useEffect(() => {
    supabase.from('intervenants').select('dossier, civilite, nom, prenom, nom_passeport, prenom_passeport, fonction, organisation, pays, numero_passeport')
      .order('nom').then(({ data }) => setAnnuaire(data || []))
  }, [])

  useEffect(() => {
    let restants = 2
    const fini = () => { restants -= 1; if (restants === 0) setImagePrete(true) }
    const imgInv = new Image(); imgInv.onload = () => { imageInvRef.current = imgInv; fini() }; imgInv.src = FOND
    const imgOm = new Image(); imgOm.onload = () => { imageOmRef.current = imgOm; fini() }; imgOm.src = FOND_OM
  }, [])

  useEffect(() => {
    Promise.all([document.fonts.load("700 16px 'Open Sans'"), document.fonts.load("400 16px 'Open Sans'")])
      .finally(() => setPolicePrete(true))
  }, [])

  useEffect(() => { localStorage.setItem(CLE_LISTE_INVITATION, JSON.stringify(listeInv)) }, [listeInv])
  useEffect(() => { localStorage.setItem(CLE_LISTE_ORDRE, JSON.stringify(listeOm)) }, [listeOm])

  const estInvitation = docType === 'invitation'
  const form = estInvitation ? formInv : formOm
  const setForm = estInvitation ? setFormInv : setFormOm
  const liste = estInvitation ? listeInv : listeOm
  const setListe = estInvitation ? setListeInv : setListeOm
  const paste = estInvitation ? pasteInv : pasteOm
  const setPaste = estInvitation ? setPasteInv : setPasteOm
  const valider = estInvitation ? validerInvitation : validerOrdre
  const champsVides = estInvitation ? CHAMPS_VIDES_INVITATION : CHAMPS_VIDES_ORDRE
  const parserColle = estInvitation ? parserColleExcelInvitation : parserColleExcelOrdre
  const generatePDF = estInvitation ? generateLettreInvitationPDF : generateOrdreMissionPDF

  const setChamp = (champ, valeur) => { setMsg(''); setForm(f => ({ ...f, [champ]: valeur })) }

  const donneesRendu = useMemo(() => {
    if (estInvitation) {
      return { ...formInv, dateLettre: versDate(formInv.dateLettre), sejourDebut: versDate(formInv.sejourDebut), sejourFin: versDate(formInv.sejourFin) }
    }
    return { ...formOm, depart: versDate(formOm.depart), retour: versDate(formOm.retour), dateSignature: versDate(formOm.dateSignature) }
  }, [estInvitation, formInv, formOm])

  useEffect(() => {
    if (!imagePrete || !policePrete || !canvasRef.current) return
    if (estInvitation) dessinerApercu(canvasRef.current, imageInvRef.current, FAMILLE_APERCU, donneesRendu)
    else dessinerApercuOM(canvasRef.current, imageOmRef.current, FAMILLE_APERCU, donneesRendu)
  }, [imagePrete, policePrete, donneesRendu, estInvitation])

  const nouveauNumero = () => setChamp('reference', genererReference())

  const chargerDansFormulaire = personne => { setForm(personne); setMsg('') }

  // Pre-remplit nom/prenom (version passeport si disponible)/nationalite/
  // passeport depuis la fiche intervenant existante des que le dossier est
  // renseigne a la main — jamais ecrase si l'admin a deja mis quelque chose
  // dans ces champs.
  const chargerDepuisIntervenant = async () => {
    const dossierTrim = form.dossier?.trim()
    if (!dossierTrim) return
    const { data } = await supabase.from('intervenants').select('nom, prenom, nom_passeport, prenom_passeport, pays, numero_passeport').ilike('dossier', dossierTrim).maybeSingle()
    if (!data) return
    setForm(f => (f.dossier?.trim() !== dossierTrim ? f : {
      ...f,
      nom: f.nom || data.nom_passeport || data.nom || '',
      prenom: f.prenom || data.prenom_passeport || data.prenom || '',
      nationalite: f.nationalite || nationaliteDepuisPays(data.pays),
      passeport: f.passeport || data.numero_passeport || '',
    }))
  }

  // Selecteur "Choisir une personne" : remplit tout le formulaire d'un coup
  // depuis l'annuaire des intervenants deja accredites, sans avoir a
  // ressaisir dossier/nom/fonction/nationalite/passeport a la main.
  const choisirPersonne = dossier => {
    const iv = annuaire.find(a => a.dossier === dossier)
    if (!iv) return
    setMsg('')
    // Le nom/prenom "passeport" (saisi exactement comme sur le document) est
    // prioritaire pour ces courriers officiels — le nom d'usage (nom/prenom)
    // ne sert que de repli si la personne n'a pas encore renseigne le sien.
    const nom = iv.nom_passeport || iv.nom || ''
    const prenom = iv.prenom_passeport || iv.prenom || ''
    if (estInvitation) {
      setFormInv(f => ({
        ...f, dossier: iv.dossier, civilite: iv.civilite || f.civilite, prenom, nom,
        fonction: iv.fonction || '', institution: iv.organisation || '',
        villePays: f.villePays || iv.pays || '', nationalite: nationaliteDepuisPays(iv.pays), passeport: iv.numero_passeport || '',
      }))
    } else {
      setFormOm(f => ({
        ...f, dossier: iv.dossier, civilite: iv.civilite || f.civilite, prenom, nom,
        fonction: iv.fonction || '', nationalite: nationaliteDepuisPays(iv.pays), passeport: iv.numero_passeport || '',
      }))
    }
  }

  const ajouterOuMettreAJour = () => {
    const err = valider(form)
    if (err) { setMsg(err); return }
    setListe(l => {
      if (form.id && l.some(p => p.id === form.id)) return l.map(p => (p.id === form.id ? form : p))
      const nouvelle = { ...form, id: crypto.randomUUID() }
      setForm(nouvelle)
      return [...l, nouvelle]
    })
    setMsg('Ajouté à la liste ✓')
  }

  const retirer = id => {
    setListe(l => l.filter(p => p.id !== id))
    if (form.id === id) setForm(champsVides())
  }

  const nouveauDocument = () => setForm(champsVides())

  // Publication vers l'espace intervenant : la liste de travail reste en
  // localStorage (outil de preparation), mais une personne "publiee" a en
  // plus sa ligne dans lettres_invitation/ordres_mission (Supabase), lues
  // par le RPC public correspondant pour le bouton de telechargement
  // personnel dans EspaceIntervenant.jsx.
  const ligneDb = f => (estInvitation
    ? {
      dossier: f.dossier.trim(), lieu: f.lieu || null, date_lettre: f.dateLettre || null, reference: f.reference || null,
      civilite: f.civilite || null, prenom: f.prenom || null, nom: f.nom || null, fonction: f.fonction || null,
      institution: f.institution || null, ville_pays: f.villePays || null, nationalite: f.nationalite || null,
      passeport: f.passeport || null, sejour_debut: f.sejourDebut || null, sejour_fin: f.sejourFin || null,
    }
    : {
      dossier: f.dossier.trim(), civilite: f.civilite || null, prenom: f.prenom || null, nom: f.nom || null,
      fonction: f.fonction || null, nationalite: f.nationalite || null, passeport: f.passeport || null,
      depart: f.depart || null, retour: f.retour || null, lieu_signature: f.lieuSignature || null,
      date_signature: f.dateSignature || null,
    })

  const publier = async personne => {
    if (!personne.dossier?.trim()) { setMsg("Un numéro de dossier (ex. INT2026-014) est requis pour publier vers l'espace intervenant."); return }
    const err = valider(personne)
    if (err) { setMsg(err); return }
    const nomAffiche = [personne.civilite, personne.nom, personne.prenom].filter(Boolean).join(' ') || 'cette personne'
    if (!window.confirm(`Publier le document de ${nomAffiche} et l'en avertir par email maintenant ?`)) return

    setGenEnCours(true); setMsg('')
    const table = estInvitation ? 'lettres_invitation' : 'ordres_mission'
    const { error } = await supabase.from(table).upsert({ ...ligneDb(personne), publie: true, updated_at: new Date().toISOString() }, { onConflict: 'dossier' })
    if (error) { setGenEnCours(false); setMsg('Échec de la publication : ' + error.message); return }

    // Ajoute a la liste de travail au passage si la personne n'y etait pas
    // deja (evite l'aller-retour "Ajouter a la liste" puis "Publier").
    const idFinal = personne.id || crypto.randomUUID()
    setListe(l => (l.some(p => p.id === idFinal)
      ? l.map(p => (p.id === idFinal ? { ...p, publie: true } : p))
      : [...l, { ...personne, id: idFinal, publie: true }]))
    if (!personne.id || form.id === personne.id) setForm(f => ({ ...f, id: idFinal, publie: true }))

    const { data: sessionData } = await supabase.auth.getSession()
    let notifie = false
    if (sessionData?.session) {
      const { data } = await supabase.functions.invoke('voyage-notify', {
        body: { action: 'notifier_document', dossier: personne.dossier.trim(), kind: estInvitation ? 'lettre_invitation' : 'ordre_mission' },
      })
      notifie = !!data?.success
    }
    setGenEnCours(false)
    setMsg(notifie ? 'Publié et personne notifiée par email ✓' : 'Publié ✓ (email non envoyé — vérifiez que cette personne a un email enregistré)')
  }

  const depublier = async personne => {
    if (!personne.dossier?.trim()) return
    setGenEnCours(true); setMsg('')
    const table = estInvitation ? 'lettres_invitation' : 'ordres_mission'
    const { error } = await supabase.from(table).update({ publie: false, updated_at: new Date().toISOString() }).eq('dossier', personne.dossier.trim())
    setGenEnCours(false)
    if (error) { setMsg('Échec : ' + error.message); return }
    setListe(l => l.map(p => (p.id === personne.id ? { ...p, publie: false } : p)))
    if (form.id === personne.id) setForm(f => ({ ...f, publie: false }))
    setMsg('Retiré de l\'espace intervenant')
  }

  const donneesGeneration = f => (estInvitation
    ? { ...f, dateLettre: versDate(f.dateLettre), sejourDebut: versDate(f.sejourDebut), sejourFin: versDate(f.sejourFin) }
    : { ...f, depart: versDate(f.depart), retour: versDate(f.retour), dateSignature: versDate(f.dateSignature) })

  const telechargerCourant = async () => {
    const err = valider(form)
    if (err) { setMsg(err); return }
    setGenEnCours(true)
    try {
      await generatePDF(donneesGeneration(form))
    } catch (e) {
      setMsg(e.message || 'Génération impossible.')
    } finally {
      setGenEnCours(false)
    }
  }

  const telechargerPersonne = async personne => {
    const err = valider(personne)
    if (err) { setMsg(err); return }
    setGenEnCours(true); setMsg('')
    try {
      await generatePDF(donneesGeneration(personne))
    } catch (e) {
      setMsg(e.message || 'Génération impossible.')
    } finally {
      setGenEnCours(false)
    }
  }

  const importerColle = () => {
    const personnes = parserColle(paste)
    if (!personnes.length) { setMsg('Aucune ligne reconnue dans le texte collé.'); return }
    const base = estInvitation
      ? { lieu: formInv.lieu, dateLettre: formInv.dateLettre, sejourDebut: formInv.sejourDebut, sejourFin: formInv.sejourFin }
      : { depart: formOm.depart, retour: formOm.retour, lieuSignature: formOm.lieuSignature, dateSignature: formOm.dateSignature }
    const nouvelles = personnes.map(p => ({
      id: crypto.randomUUID(), ...base, ...(estInvitation ? { reference: genererReference() } : {}), ...p,
    }))
    setListe(l => [...l, ...nouvelles])
    setPaste('')
    setMsg(`${nouvelles.length} personne(s) importée(s) ✓`)
  }

  const telechargerZip = async () => {
    if (!liste.length) { setMsg('La liste est vide.'); return }
    setGenEnCours(true)
    setMsg('')
    try {
      const zip = new JSZip()
      let compte = 0
      for (const personne of liste) {
        const err = valider(personne)
        if (err) continue
        const { doc, nomFichier } = await generatePDF({ ...donneesGeneration(personne), download: false })
        zip.file(nomFichier, doc.output('blob'))
        compte += 1
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = estInvitation ? 'Lettres_invitation_COPAF2026.zip' : `Ordres_de_mission_COPAF2026_${compte}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setMsg(e.message || 'Échec de la génération groupée.')
    } finally {
      setGenEnCours(false)
    }
  }

  const changerType = t => { setDocType(t); setMsg('') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');`}</style>
      <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, borderRadius: 16, padding: '20px 26px', color: '#fff' }}>
        <h2 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 4px' }}>
          {estInvitation ? "Lettres d'invitation COPAF 2026" : 'Ordres de mission COPAF 2026'}
        </h2>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>
          {estInvitation
            ? "Remplissez les informations de l'intervenant, vérifiez l'aperçu, puis téléchargez la lettre signée en PDF."
            : "Remplissez les informations du membre de l'équipe d'organisation, vérifiez l'aperçu, puis téléchargez l'ordre de mission signé en PDF."}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" onClick={() => changerType('invitation')} style={{
            ...BTN, padding: '7px 14px', fontSize: 12.5,
            background: estInvitation ? '#fff' : 'rgba(255,255,255,0.15)', color: estInvitation ? NAVY : '#fff',
          }}>
            Lettres d'invitation (intervenants)
          </button>
          <button type="button" onClick={() => changerType('ordre')} style={{
            ...BTN, padding: '7px 14px', fontSize: 12.5,
            background: !estInvitation ? '#fff' : 'rgba(255,255,255,0.15)', color: !estInvitation ? NAVY : '#fff',
          }}>
            Ordres de mission (équipe)
          </button>
        </div>
      </div>

      {msg && <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '10px 14px', color: NAVY, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── Formulaire ── */}
        <div style={{ ...CARTE, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0a1128' }}>{form.id ? 'Document en cours (liste)' : 'Nouveau document'}</div>
            <button type="button" onClick={nouveauDocument} style={{ ...BTN, padding: '5px 10px', background: '#f1f5f9', color: '#334155', fontSize: 11.5 }}>+ Nouveau</button>
          </div>

          <div>
            <label style={LABEL}>Choisir une personne (optionnel)</label>
            <select style={INPUT} value="" onChange={e => e.target.value && choisirPersonne(e.target.value)}>
              <option value="">— Remplir manuellement —</option>
              {annuaire.map(a => <option key={a.dossier} value={a.dossier}>{[a.nom, a.prenom].filter(Boolean).join(' ')} — {a.dossier}</option>)}
            </select>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
              Remplit tout le formulaire (nom, fonction, nationalité, passeport…) depuis la fiche de la personne déjà accréditée.
            </p>
          </div>

          <div>
            <label style={LABEL}>Numéro de dossier</label>
            <input style={INPUT} value={form.dossier} onChange={e => setChamp('dossier', e.target.value)} onBlur={chargerDepuisIntervenant} placeholder="Ex : INT2026-014" />
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
              Requis pour « Publier » — permet à la personne de télécharger elle-même ce document depuis son espace intervenant (dossier + email), avec notification automatique.
            </p>
          </div>

          {estInvitation ? (
            <>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>En-tête</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={LABEL}>Lieu</label><input style={INPUT} value={formInv.lieu} onChange={e => setChamp('lieu', e.target.value)} /></div>
                  <div><label style={LABEL}>Date de la lettre</label><input type="date" style={INPUT} value={formInv.dateLettre} onChange={e => setChamp('dateLettre', e.target.value)} /></div>
                </div>
              </div>

              <div>
                <label style={LABEL}>Référence</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={INPUT} value={formInv.reference} onChange={e => setChamp('reference', e.target.value)} />
                  <button type="button" onClick={nouveauNumero} style={{ ...BTN_SOFT, flexShrink: 0 }}>Nouveau n°</button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Intervenant invité</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10 }}>
                    <div>
                      <label style={LABEL}>Civilité</label>
                      <select style={INPUT} value={formInv.civilite} onChange={e => setChamp('civilite', e.target.value)}>
                        {CIVILITES.map(c => <option key={c} value={c}>{c || 'Aucune'}</option>)}
                      </select>
                    </div>
                    <div><label style={LABEL}>Prénom(s)</label><input style={INPUT} value={formInv.prenom} onChange={e => setChamp('prenom', e.target.value)} /></div>
                  </div>
                  <div><label style={LABEL}>Nom *</label><input style={INPUT} value={formInv.nom} onChange={e => setChamp('nom', e.target.value)} /></div>
                  <div><label style={LABEL}>Fonction</label><input style={INPUT} value={formInv.fonction} onChange={e => setChamp('fonction', e.target.value)} /></div>
                  <div><label style={LABEL}>Institution</label><input style={INPUT} value={formInv.institution} onChange={e => setChamp('institution', e.target.value)} /></div>
                  <div><label style={LABEL}>Ville et pays</label><input style={INPUT} value={formInv.villePays} onChange={e => setChamp('villePays', e.target.value)} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><label style={LABEL}>Nationalité</label><input style={INPUT} value={formInv.nationalite} onChange={e => setChamp('nationalite', e.target.value)} /></div>
                    <div><label style={LABEL}>N° de passeport</label><input style={INPUT} value={formInv.passeport} onChange={e => setChamp('passeport', e.target.value)} /></div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Séjour pris en charge</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={LABEL}>Début *</label><input type="date" style={INPUT} value={formInv.sejourDebut} onChange={e => setChamp('sejourDebut', e.target.value)} /></div>
                  <div><label style={LABEL}>Fin *</label><input type="date" style={INPUT} value={formInv.sejourFin} onChange={e => setChamp('sejourFin', e.target.value)} /></div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Missionnaire</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10 }}>
                    <div>
                      <label style={LABEL}>Civilité</label>
                      <select style={INPUT} value={formOm.civilite} onChange={e => setChamp('civilite', e.target.value)}>
                        {CIVILITES_OM.map(c => <option key={c} value={c}>{c || 'Aucune'}</option>)}
                      </select>
                    </div>
                    <div><label style={LABEL}>Prénom(s)</label><input style={INPUT} value={formOm.prenom} onChange={e => setChamp('prenom', e.target.value)} /></div>
                  </div>
                  <div><label style={LABEL}>Nom *</label><input style={INPUT} value={formOm.nom} onChange={e => setChamp('nom', e.target.value)} /></div>
                  <div><label style={LABEL}>Fonction</label><input style={INPUT} value={formOm.fonction} onChange={e => setChamp('fonction', e.target.value)} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><label style={LABEL}>Nationalité</label><input style={INPUT} value={formOm.nationalite} onChange={e => setChamp('nationalite', e.target.value)} /></div>
                    <div><label style={LABEL}>N° de passeport</label><input style={INPUT} value={formOm.passeport} onChange={e => setChamp('passeport', e.target.value)} /></div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Période de mission</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={LABEL}>Départ *</label><input type="date" style={INPUT} value={formOm.depart} onChange={e => setChamp('depart', e.target.value)} /></div>
                  <div><label style={LABEL}>Retour *</label><input type="date" style={INPUT} value={formOm.retour} onChange={e => setChamp('retour', e.target.value)} /></div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Lieu et date de signature</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={LABEL}>Lieu</label><input style={INPUT} value={formOm.lieuSignature} onChange={e => setChamp('lieuSignature', e.target.value)} /></div>
                  <div><label style={LABEL}>Date</label><input type="date" style={INPUT} value={formOm.dateSignature} onChange={e => setChamp('dateSignature', e.target.value)} /></div>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <button type="button" style={BTN_PRIMARY} disabled={genEnCours} onClick={telechargerCourant}>Télécharger le PDF</button>
            <button type="button" style={BTN_SOFT} onClick={ajouterOuMettreAJour}>{form.id ? 'Mettre à jour dans la liste' : 'Ajouter à la liste'}</button>
            {form.dossier?.trim() && (form.publie
              ? <button type="button" style={{ ...BTN, background: '#fef2f2', color: '#dc2626' }} disabled={genEnCours} onClick={() => depublier(form)}>Retirer de l'espace intervenant</button>
              : <button type="button" style={{ ...BTN, background: '#16a34a', color: '#fff' }} disabled={genEnCours} onClick={() => publier(form)}>Publier + notifier la personne</button>)}
          </div>
          {form.dossier?.trim() && (
            <p style={{ fontSize: 11, color: form.publie ? '#16a34a' : '#94a3b8', margin: '-8px 0 0', fontWeight: form.publie ? 700 : 400 }}>
              {form.publie ? '✓ Publié — visible dans l\'espace intervenant' : 'Non publié — visible uniquement ici'}
            </p>
          )}
        </div>

        {/* ── Aperçu en direct ── */}
        <div style={{ ...CARTE, padding: 16, position: 'sticky', top: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Aperçu en direct</div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #eef1f8', boxShadow: '0 4px 14px -4px rgba(15,23,42,.1)' }}>
            <canvas ref={canvasRef} width={1414} height={2000} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </div>

      {/* ── Liste de travail ── */}
      <div style={{ ...CARTE, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0a1128' }}>Liste de travail ({liste.length})</div>
          <button type="button" style={{ ...BTN, background: '#16a34a', color: '#fff' }} disabled={genEnCours || !liste.length} onClick={telechargerZip}>
            Télécharger tous les documents (ZIP)
          </button>
        </div>

        {liste.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
            {liste.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#f8faff', borderRadius: 10, gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => chargerDansFormulaire(p)} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', flex: 1, minWidth: 160, fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {[p.civilite, p.nom, p.prenom].filter(Boolean).join(' ') || 'Sans nom'}
                    {p.publie && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#166534', background: '#dcfce7', borderRadius: 20, padding: '1px 6px' }}>publié</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {estInvitation ? `${p.institution || '—'} · ${p.reference}` : (p.fonction || '—')}
                    {p.dossier ? ` · ${p.dossier}` : ''}
                  </div>
                </button>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" disabled={genEnCours} onClick={() => telechargerPersonne(p)} style={{ ...BTN, padding: '5px 10px', background: '#eef2ff', color: NAVY, fontSize: 11.5 }}>Télécharger</button>
                  {p.publie
                    ? <button type="button" disabled={genEnCours} onClick={() => depublier(p)} style={{ ...BTN, padding: '5px 10px', background: '#fef3c7', color: '#92400e', fontSize: 11.5 }}>Dépublier</button>
                    : <button type="button" disabled={genEnCours} onClick={() => publier(p)} style={{ ...BTN, padding: '5px 10px', background: '#dcfce7', color: '#166534', fontSize: 11.5 }}>Publier</button>}
                  <button type="button" onClick={() => retirer(p.id)} style={{ ...BTN, padding: '5px 10px', background: '#fef2f2', color: '#dc2626', fontSize: 11.5 }}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
          <label style={LABEL}>
            {estInvitation
              ? 'Importer depuis Excel (coller les lignes : Civilité, Prénom(s), Nom, Fonction, Institution, Ville et pays, Nationalité, N° passeport)'
              : 'Importer depuis Excel (coller les lignes : Civilité, Prénom(s), Nom, Fonction, Nationalité, N° passeport)'}
          </label>
          <textarea
            value={paste} onChange={e => setPaste(e.target.value)}
            placeholder={estInvitation
              ? 'M.\tRénato\tTCHOBO\tDirecteur Numérique & IT\tCRF Perfection\tCotonou, Bénin\tBéninoise\tB1234567'
              : 'M.\tRénato\tTCHOBO\tDirecteur Numérique & IT\tBéninoise\tB1234567'}
            style={{ ...INPUT, minHeight: 90, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
          />
          <button type="button" style={{ ...BTN_SOFT, marginTop: 8 }} onClick={importerColle} disabled={!paste.trim()}>Importer</button>
        </div>
      </div>
    </div>
  )
}
