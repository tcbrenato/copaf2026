import { Card } from '../utils/dossierUi'
import { Bouton } from './BoutonsEvenement'

// Boutons de l'Espace Intervenant reserves aux membres de l'equipe COPAF (intervenants.equipe = true) :
// Guide du participant, Fiche de voyage, Programme et Attestation. Les fichiers sont deposes par l'admin dans
// les documents de la personne (admin > Intervenants > Documents), avec le type correspondant ;
// tant qu'il n'y en a pas, le bouton reste visible et indique « bientot disponible ».

const TR = {
  fr: {
    titre: 'Mes documents COPAF',
    guide: 'Guide du participant', fiche: 'Fiche de voyage individuelle', programme: 'Programme', attestation: 'Attestation de participation',
    ok: 'Ouvrir le document', bientot: 'Bientôt disponible', preparation: 'En cours de préparation', programmeOk: 'Sessions, horaires et intervenants',
  },
  en: {
    titre: 'My COPAF documents',
    guide: 'Participant guide', fiche: 'Individual travel sheet', programme: 'Programme', attestation: 'Certificate of participation',
    ok: 'Open the document', bientot: 'Coming soon', preparation: 'Being prepared', programmeOk: 'Sessions, schedule and speakers',
  },
}

const ACCENT = '#0284C7'

export default function BoutonsEquipe({ lang, docs }) {
  const t = TR[lang === 'en' ? 'en' : 'fr']
  // Dernier document visible du type demande (docs est trie par date de depot)
  const trouve = type => [...(docs || [])].reverse().find(d => d.type === type && d.visible !== false && d.url)
  const ouvre = doc => () => window.open(doc.url, '_blank', 'noopener')
  const guide = trouve('guide')
  const fiche = trouve('fiche')
  const attestation = trouve('attestation')

  return (
    <Card icon="download" title={t.titre}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
        <Bouton accent={ACCENT} icone="info" titre={t.guide} sous={guide ? t.ok : t.bientot} actif={!!guide} onClick={guide && ouvre(guide)} />
        <Bouton accent={ACCENT} icone="hotel" titre={t.fiche} sous={fiche ? t.ok : t.preparation} actif={!!fiche} onClick={fiche && ouvre(fiche)} />
        <Bouton accent={ACCENT} icone="calendar" titre={t.programme} sous={t.programmeOk} actif onClick={() => { window.location.href = '/#programme' }} />
        <Bouton accent={ACCENT} icone="shield" titre={t.attestation} sous={attestation ? t.ok : t.bientot} actif={!!attestation} onClick={attestation && ouvre(attestation)} />
      </div>
    </Card>
  )
}
