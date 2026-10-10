// src/pages/VerifierAttestation.jsx
//
// Page publique /verifier/:code (adresse encodée dans le QR code de chaque attestation).
// Appelle la fonction verifier_attestation (limitée à 10 requêtes/minute/IP, aucune donnée personnelle hors attestation)
// puis affiche : « Attestation authentique », l'attestation imprimable, et les boutons PDF / Imprimer / Copier le lien.

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import AttestationView from '../components/AttestationView'
import { normaliserCodeAttestation } from '../utils/attestationsConfig'
import { telecharger } from '../utils/tableur'

const NAVY = '#0B1F66'
const OR = '#B8902F'
const FOND = '#f1f4fb'

const TR = {
  FR: {
    chargement: 'Vérification en cours…',
    introuvable: 'Aucune attestation ne correspond à ce numéro',
    introuvableAide: 'Vérifiez le numéro (format COPAF-2026-EXEC-XXXX) ou scannez de nouveau le QR code de l\'attestation.',
    prepaTitre: 'Attestation en cours de préparation',
    prepaAide: "Cette attestation sera disponible à partir du 21 octobre 2026. Merci de revenir à cette date.",
    authentique: '✔ Attestation authentique',
    pdf: 'Télécharger en PDF', pdfEnCours: 'Préparation du PDF…', imprimer: 'Imprimer', copier: 'Copier le lien', copie: 'Lien copié ✓',
    autreLangue: 'English', retour: 'Vérifier un autre numéro', trop: 'Trop de tentatives. Réessayez dans une minute.', erreur: 'Vérification impossible pour le moment. Réessayez.',
    pdfErreur: 'Le PDF n\'a pas pu être généré. Utilisez « Imprimer » puis « Enregistrer au format PDF ».',
  },
  EN: {
    chargement: 'Verifying…',
    introuvable: 'No certificate matches this number',
    introuvableAide: 'Check the number (format COPAF-2026-EXEC-XXXX) or scan the certificate\'s QR code again.',
    prepaTitre: 'Certificate being prepared',
    prepaAide: 'This certificate will be available from 21 October 2026. Please come back on that date.',
    authentique: '✔ Authentic certificate',
    pdf: 'Download PDF', pdfEnCours: 'Preparing the PDF…', imprimer: 'Print', copier: 'Copy link', copie: 'Link copied ✓',
    autreLangue: 'Français', retour: 'Verify another number', trop: 'Too many attempts. Please try again in a minute.', erreur: 'Verification is unavailable right now. Please try again.',
    pdfErreur: 'The PDF could not be generated. Use "Print" then "Save as PDF".',
  },
}

const BTN = { minHeight: 46, padding: '0 20px', borderRadius: 12, border: `1.5px solid ${NAVY}`, background: '#fff', color: NAVY, fontSize: 14.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }

export default function VerifierAttestation() {
  const { code: codeUrl } = useParams()
  const code = normaliserCodeAttestation(codeUrl)
  const [resultat, setResultat] = useState(null) // null = chargement
  const [langue, setLangue] = useState(null)
  const [copie, setCopie] = useState(false)
  const [pdfEnCours, setPdfEnCours] = useState(false)
  const [erreurPdf, setErreurPdf] = useState(false)

  // Pas d'indexation par les moteurs de recherche
  useEffect(() => {
    // modifie la balise robots du site si elle existe (sinon deux directives contradictoires), et la rétablit en partant
    let meta = document.head.querySelector('meta[name="robots"]')
    const cree = !meta
    if (cree) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta) }
    const avant = meta.content
    meta.content = 'noindex, nofollow'
    const titre = document.title
    document.title = 'Vérification d\'attestation - COPAF 2026'
    return () => { if (cree) document.head.removeChild(meta); else meta.content = avant; document.title = titre }
  }, [])

  useEffect(() => {
    let actif = true
    ;(async () => {
      if (!code) { if (actif) setResultat({ statut: 'introuvable' }); return }
      const { data, error } = await supabase.rpc('verifier_attestation', { p_code: code })
      if (!actif) return
      if (error) setResultat({ statut: /trop de tentatives/i.test(error.message || '') ? 'limite' : 'erreur' })
      else setResultat(data || { statut: 'introuvable' })
    })()
    return () => { actif = false }
  }, [code])

  const langueAffichee = langue || (resultat && resultat.langue) || 'FR'
  const T = TR[langueAffichee === 'EN' ? 'EN' : 'FR']

  const copierLien = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopie(true); setTimeout(() => setCopie(false), 2000) } catch { /* presse-papiers indisponible */ }
  }
  const telechargerPdf = async () => {
    setPdfEnCours(true); setErreurPdf(false)
    try {
      const { genererAttestationPDF } = await import('../utils/generateAttestationPDF')
      const blob = await genererAttestationPDF(resultat, { langue: langueAffichee })
      telecharger(blob, `COPAF-2026_Attestation_${resultat.code}_${langueAffichee}.pdf`)
    } catch { setErreurPdf(true) }
    setPdfEnCours(false)
  }

  const carte = { maxWidth: 560, margin: '0 auto', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: '28px 22px', textAlign: 'center', boxShadow: '0 8px 28px rgba(11,31,102,.08)' }
  const statut = resultat && resultat.statut

  return (
    <div style={{ minHeight: '100vh', background: FOND, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: '28px 14px 60px' }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap');"}</style>

      <div className="no-print-attestation" style={{ maxWidth: 1123, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Link to="/verifier" style={{ color: NAVY, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>← {T.retour}</Link>
        <button type="button" onClick={() => setLangue(langueAffichee === 'EN' ? 'FR' : 'EN')} style={{ ...BTN, minHeight: 38, padding: '0 16px', fontSize: 13 }} aria-label="Language">
          {T.autreLangue}
        </button>
      </div>

      {resultat === null && <div style={{ ...carte, color: '#64748b', fontWeight: 700 }}>{T.chargement}</div>}

      {(statut === 'introuvable') && (
        <div style={carte} role="alert">
          <div style={{ fontSize: 40 }}>?</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: NAVY, margin: '6px 0 8px' }}>{T.introuvable}</div>
          <p style={{ margin: 0, fontSize: 14.5, color: '#64748b', lineHeight: 1.6 }}>{T.introuvableAide}</p>
        </div>
      )}
      {(statut === 'limite' || statut === 'erreur') && (
        <div style={carte} role="alert"><div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c' }}>{statut === 'limite' ? T.trop : T.erreur}</div></div>
      )}
      {statut === 'en_preparation' && (
        <div style={carte}>
          <div style={{ fontSize: 40 }}>⏳</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: NAVY, margin: '6px 0 8px' }}>{T.prepaTitre}</div>
          <p style={{ margin: 0, fontSize: 14.5, color: '#64748b', lineHeight: 1.6 }}>{T.prepaAide}</p>
        </div>
      )}

      {statut === 'ok' && (
        <>
          <div className="no-print-attestation" style={{ maxWidth: 1123, margin: '0 auto 16px', background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: 14, padding: '13px 18px', color: '#065f46', fontSize: 17, fontWeight: 900, textAlign: 'center' }} role="status">
            {T.authentique}
          </div>
          <AttestationView att={resultat} langue={langueAffichee} />
          <div className="no-print-attestation" style={{ maxWidth: 1123, margin: '18px auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" onClick={telechargerPdf} disabled={pdfEnCours} style={{ ...BTN, background: NAVY, color: '#fff', margin: '0 8px 10px', opacity: pdfEnCours ? 0.7 : 1 }}>{pdfEnCours ? T.pdfEnCours : T.pdf}</button>
            <button type="button" onClick={() => window.print()} style={{ ...BTN, margin: '0 8px 10px' }}>{T.imprimer}</button>
            <button type="button" onClick={copierLien} style={{ ...BTN, margin: '0 8px 10px', borderColor: OR, color: '#7a5a12' }}>{copie ? T.copie : T.copier}</button>
          </div>
          {erreurPdf && <p className="no-print-attestation" style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13.5, fontWeight: 700 }}>{T.pdfErreur}</p>}
        </>
      )}
    </div>
  )
}
