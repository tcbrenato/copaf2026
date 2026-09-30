// src/pages/AdminLettresInvitation.jsx
//
// Generateur de "Lettres d'invitation" COPAF 2026 pour les intervenants
// (document distinct de la lettre de mission/ordre de mission de l'equipe
// d'organisation). Formulaire + apercu en direct (canvas, memes positions
// que le PDF final — voir utils/generateLettreInvitationPDF.js) + liste de
// travail (ajout/edition/suppression, import colle depuis Excel, export
// PDF individuel ou ZIP groupe).
//
// La liste de travail est gardee en localStorage (pas de table Supabase) :
// outil de preparation ponctuelle avant l'evenement, pas un registre a
// synchroniser entre plusieurs personnes/appareils.

import { useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import {
  CIVILITES, FOND, dessinerApercu, generateLettreInvitationPDF, genererReference,
} from '../utils/generateLettreInvitationPDF'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const CLE_LISTE = 'copaf_lettres_invitation_liste'
const FAMILLE_APERCU = "'Open Sans', sans-serif"

const CARTE = { background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)' }
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a' }
const LABEL = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }
const BTN = { padding: '9px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const BTN_PRIMARY = { ...BTN, background: NAVY, color: '#fff' }
const BTN_SOFT = { ...BTN, background: '#eef2ff', color: NAVY }

const CHAMPS_VIDES = () => ({
  id: null,
  lieu: 'Washington DC',
  dateLettre: new Date().toISOString().slice(0, 10),
  reference: genererReference(),
  civilite: 'M.',
  prenom: '', nom: '', fonction: '', institution: '', villePays: '', nationalite: '', passeport: '',
  sejourDebut: '2026-10-17', sejourFin: '2026-10-23',
})

function versDate(iso) {
  return iso ? new Date(`${iso}T12:00:00`) : null
}

function valider(f) {
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
function parserColleExcel(texte) {
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

export default function AdminLettresInvitation() {
  const [form, setForm] = useState(CHAMPS_VIDES)
  const [liste, setListe] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CLE_LISTE) || '[]') } catch { return [] }
  })
  const [pasteTexte, setPasteTexte] = useState('')
  const [msg, setMsg] = useState('')
  const [genEnCours, setGenEnCours] = useState(false)
  const [imagePrete, setImagePrete] = useState(false)
  const [policePrete, setPolicePrete] = useState(false)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => { imageRef.current = img; setImagePrete(true) }
    img.src = FOND
  }, [])

  useEffect(() => {
    Promise.all([document.fonts.load("700 16px 'Open Sans'"), document.fonts.load("400 16px 'Open Sans'")])
      .finally(() => setPolicePrete(true))
  }, [])

  useEffect(() => { localStorage.setItem(CLE_LISTE, JSON.stringify(liste)) }, [liste])

  const setChamp = (champ, valeur) => { setMsg(''); setForm(f => ({ ...f, [champ]: valeur })) }

  const donneesRendu = useMemo(() => ({
    ...form,
    dateLettre: versDate(form.dateLettre),
    sejourDebut: versDate(form.sejourDebut),
    sejourFin: versDate(form.sejourFin),
  }), [form])

  useEffect(() => {
    if (!imagePrete || !policePrete || !canvasRef.current) return
    dessinerApercu(canvasRef.current, imageRef.current, FAMILLE_APERCU, donneesRendu)
  }, [imagePrete, policePrete, donneesRendu])

  const nouveauNumero = () => setChamp('reference', genererReference())

  const chargerDansFormulaire = personne => { setForm(personne); setMsg('') }

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
    if (form.id === id) setForm(CHAMPS_VIDES())
  }

  const nouvelleLettre = () => setForm(CHAMPS_VIDES())

  const telechargerCourante = async () => {
    const err = valider(form)
    if (err) { setMsg(err); return }
    setGenEnCours(true)
    try {
      await generateLettreInvitationPDF({ ...form, dateLettre: versDate(form.dateLettre), sejourDebut: versDate(form.sejourDebut), sejourFin: versDate(form.sejourFin) })
    } catch (e) {
      setMsg(e.message || 'Génération impossible.')
    } finally {
      setGenEnCours(false)
    }
  }

  const importerColle = () => {
    const personnes = parserColleExcel(pasteTexte)
    if (!personnes.length) { setMsg('Aucune ligne reconnue dans le texte collé.'); return }
    const base = { lieu: form.lieu, dateLettre: form.dateLettre, sejourDebut: form.sejourDebut, sejourFin: form.sejourFin }
    const nouvelles = personnes.map(p => ({ id: crypto.randomUUID(), ...base, reference: genererReference(), ...p }))
    setListe(l => [...l, ...nouvelles])
    setPasteTexte('')
    setMsg(`${nouvelles.length} personne(s) importée(s) ✓`)
  }

  const telechargerZip = async () => {
    if (!liste.length) { setMsg('La liste est vide.'); return }
    setGenEnCours(true)
    setMsg('')
    try {
      const zip = new JSZip()
      for (const personne of liste) {
        const err = valider(personne)
        if (err) continue
        const { doc, nomFichier } = await generateLettreInvitationPDF({
          ...personne, dateLettre: versDate(personne.dateLettre), sejourDebut: versDate(personne.sejourDebut), sejourFin: versDate(personne.sejourFin), download: false,
        })
        zip.file(nomFichier, doc.output('blob'))
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'Lettres_invitation_COPAF2026.zip'; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setMsg(e.message || 'Échec de la génération groupée.')
    } finally {
      setGenEnCours(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');`}</style>
      <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, borderRadius: 16, padding: '20px 26px', color: '#fff' }}>
        <h2 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 4px' }}>Lettres d'invitation COPAF 2026</h2>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Remplissez les informations de l'intervenant, vérifiez l'aperçu, puis téléchargez la lettre signée en PDF.</p>
      </div>

      {msg && <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '10px 14px', color: NAVY, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── Formulaire ── */}
        <div style={{ ...CARTE, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0a1128' }}>{form.id ? 'Lettre en cours (liste)' : 'Nouvelle lettre'}</div>
            <button type="button" onClick={nouvelleLettre} style={{ ...BTN, padding: '5px 10px', background: '#f1f5f9', color: '#334155', fontSize: 11.5 }}>+ Nouvelle</button>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>En-tête</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={LABEL}>Lieu</label><input style={INPUT} value={form.lieu} onChange={e => setChamp('lieu', e.target.value)} /></div>
              <div><label style={LABEL}>Date de la lettre</label><input type="date" style={INPUT} value={form.dateLettre} onChange={e => setChamp('dateLettre', e.target.value)} /></div>
            </div>
          </div>

          <div>
            <label style={LABEL}>Référence</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={INPUT} value={form.reference} onChange={e => setChamp('reference', e.target.value)} />
              <button type="button" onClick={nouveauNumero} style={{ ...BTN_SOFT, flexShrink: 0 }}>Nouveau n°</button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Intervenant invité</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10 }}>
                <div>
                  <label style={LABEL}>Civilité</label>
                  <select style={INPUT} value={form.civilite} onChange={e => setChamp('civilite', e.target.value)}>
                    {CIVILITES.map(c => <option key={c} value={c}>{c || 'Aucune'}</option>)}
                  </select>
                </div>
                <div><label style={LABEL}>Prénom(s)</label><input style={INPUT} value={form.prenom} onChange={e => setChamp('prenom', e.target.value)} /></div>
              </div>
              <div><label style={LABEL}>Nom *</label><input style={INPUT} value={form.nom} onChange={e => setChamp('nom', e.target.value)} /></div>
              <div><label style={LABEL}>Fonction</label><input style={INPUT} value={form.fonction} onChange={e => setChamp('fonction', e.target.value)} /></div>
              <div><label style={LABEL}>Institution</label><input style={INPUT} value={form.institution} onChange={e => setChamp('institution', e.target.value)} /></div>
              <div><label style={LABEL}>Ville et pays</label><input style={INPUT} value={form.villePays} onChange={e => setChamp('villePays', e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={LABEL}>Nationalité</label><input style={INPUT} value={form.nationalite} onChange={e => setChamp('nationalite', e.target.value)} /></div>
                <div><label style={LABEL}>N° de passeport</label><input style={INPUT} value={form.passeport} onChange={e => setChamp('passeport', e.target.value)} /></div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Séjour pris en charge</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={LABEL}>Début *</label><input type="date" style={INPUT} value={form.sejourDebut} onChange={e => setChamp('sejourDebut', e.target.value)} /></div>
              <div><label style={LABEL}>Fin *</label><input type="date" style={INPUT} value={form.sejourFin} onChange={e => setChamp('sejourFin', e.target.value)} /></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <button type="button" style={BTN_PRIMARY} disabled={genEnCours} onClick={telechargerCourante}>Télécharger le PDF</button>
            <button type="button" style={BTN_SOFT} onClick={ajouterOuMettreAJour}>{form.id ? 'Mettre à jour dans la liste' : 'Ajouter à la liste'}</button>
          </div>
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
            Télécharger toutes les lettres (ZIP)
          </button>
        </div>

        {liste.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
            {liste.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#f8faff', borderRadius: 10, gap: 10 }}>
                <button type="button" onClick={() => chargerDansFormulaire(p)} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', flex: 1, fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{[p.civilite, p.nom, p.prenom].filter(Boolean).join(' ') || 'Sans nom'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.institution || '—'} · {p.reference}</div>
                </button>
                <button type="button" onClick={() => retirer(p.id)} style={{ ...BTN, padding: '5px 10px', background: '#fef2f2', color: '#dc2626', fontSize: 11.5, flexShrink: 0 }}>Retirer</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
          <label style={LABEL}>Importer depuis Excel (coller les lignes : Civilité, Prénom(s), Nom, Fonction, Institution, Ville et pays, Nationalité, N° passeport)</label>
          <textarea
            value={pasteTexte} onChange={e => setPasteTexte(e.target.value)}
            placeholder={'M.\tRénato\tTCHOBO\tDirecteur Numérique & IT\tCRF Perfection\tCotonou, Bénin\tBéninoise\tB1234567'}
            style={{ ...INPUT, minHeight: 90, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
          />
          <button type="button" style={{ ...BTN_SOFT, marginTop: 8 }} onClick={importerColle} disabled={!pasteTexte.trim()}>Importer</button>
        </div>
      </div>
    </div>
  )
}
