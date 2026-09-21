import { useState } from 'react'
import { Ico, Card } from '../utils/dossierUi'

// Acces direct, depuis l'espace participant, aux 4 documents de l'evenement :
// guide du participant, fiche de voyage individuelle, programme et attestation de participation.
// Un bouton indisponible reste visible (grise) avec « en preparation » / « bientot disponible ».
// L'attestation n'est pas generee par le site : l'equipe depose le fichier dans l'espace de la personne
// (admin > documents du dossier > « Definir comme attestation »).

const TR = {
  fr: {
    titre: 'Mes documents COPAF',
    guide: 'Guide du participant', guideOk: 'Télécharger le PDF', guideNon: 'Bientôt disponible',
    fiche: 'Fiche de voyage individuelle', ficheOk: 'Télécharger le PDF', ficheNon: 'En cours de préparation',
    programme: 'Programme', programmeOk: 'Sessions, horaires et intervenants',
    attestation: 'Attestation de participation', attestationOk: 'Télécharger le PDF', attestationNon: 'Bientôt disponible',
    erreur: 'Téléchargement impossible, réessayez.',
  },
  en: {
    titre: 'My COPAF documents',
    guide: 'Participant guide', guideOk: 'Download the PDF', guideNon: 'Coming soon',
    fiche: 'Individual travel sheet', ficheOk: 'Download the PDF', ficheNon: 'Being prepared',
    programme: 'Programme', programmeOk: 'Sessions, schedule and speakers',
    attestation: 'Certificate of participation', attestationOk: 'Download the PDF', attestationNon: 'Coming soon',
    erreur: 'Download failed, please try again.',
  },
}

function Bouton({ icone, titre, sous, actif, chargement, onClick }) {
  return (
    <button
      type="button" disabled={!actif || chargement} onClick={actif ? onClick : undefined} aria-disabled={!actif}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', boxSizing: 'border-box', textAlign: 'left', fontFamily: 'inherit',
        padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${actif ? '#bfdbfe' : '#e2e8f0'}`,
        background: actif ? '#EBF3FF' : '#f8fafc', cursor: actif ? 'pointer' : 'not-allowed', opacity: actif ? 1 : 0.85,
      }}
    >
      <span style={{ width: 36, height: 36, borderRadius: 10, background: actif ? '#000E91' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {chargement ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.35)' }} /> : <Ico name={icone} size={17} color="#fff" />}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: actif ? '#0f172a' : '#64748b' }}>{titre}</span>
        <span style={{ display: 'block', fontSize: 11.5, lineHeight: 1.5, marginTop: 2, color: actif ? '#0369a1' : '#94a3b8', fontWeight: 600 }}>{sous}</span>
      </span>
    </button>
  )
}

export default function BoutonsEvenement({ lang, myDossier, voyage, onOpenProgramme }) {
  const t = TR[lang === 'en' ? 'en' : 'fr']
  const l = lang === 'en' ? 'en' : 'fr'
  const [gen, setGen] = useState('')
  const [erreur, setErreur] = useState(false)

  const telecharger = async genre => {
    setGen(genre); setErreur(false)
    try {
      const m = await import('../utils/generateVoyagePDF')
      if (genre === 'guide') await m.generateGuidePDF({ config: voyage.guide, lang: l, download: true })
      else await m.generateFichePDF({ voyage, config: voyage.guide || { fr: {}, en: {} }, lang: l, download: true })
    } catch (e) {
      console.error(e)
      setErreur(true)
    } finally {
      setGen('')
    }
  }

  const guideOk = !!voyage?.guide
  const ficheOk = !!voyage?.fiche
  // Derniere attestation deposee (et rendue visible) par l'equipe
  const attestation = [...(myDossier.documents || [])].reverse().find(d => d.type === 'attestation' && d.url)

  return (
    <Card icon="download" title={t.titre}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
        <Bouton icone="info" titre={t.guide} sous={guideOk ? t.guideOk : t.guideNon} actif={guideOk} chargement={gen === 'guide'} onClick={() => telecharger('guide')} />
        <Bouton icone="hotel" titre={t.fiche} sous={ficheOk ? t.ficheOk : t.ficheNon} actif={ficheOk} chargement={gen === 'fiche'} onClick={() => telecharger('fiche')} />
        <Bouton icone="calendar" titre={t.programme} sous={t.programmeOk} actif onClick={onOpenProgramme} />
        <Bouton icone="shield" titre={t.attestation} sous={attestation ? t.attestationOk : t.attestationNon} actif={!!attestation} onClick={() => window.open(attestation.url, '_blank', 'noopener')} />
      </div>
      {erreur && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#dc2626', fontWeight: 700 }}>{t.erreur}</p>}
    </Card>
  )
}
