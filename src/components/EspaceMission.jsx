import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Card, Ico } from '../utils/dossierUi'
import { Bouton } from './BoutonsEvenement'

// Espace équipe / bénévoles (intervenants.equipe = true) : « Ma mission », « Documents de la mission »
// et « Mon badge digital ». Tout est saisi par l'admin :
//   - mission (rôle, équipe, responsable, tenue, consignes, point de rendez-vous) : fiche de la personne ;
//   - planning : les lignes « Interventions » de la fiche (jour | horaire | tâche | lieu) ;
//   - documents communs (charte, programme, plan du site) : Admin > Intervenants > « Documents communs de l'équipe »
//     (dossier EQUIPE de documents_intervenants) ; l'attestation reste un document personnel (BoutonsEquipe).

const ACCENT = '#0284C7'

const TR = {
  fr: {
    missionTitre: 'Ma mission', planTitre: 'Mon planning',
    role: 'Rôle', equipe: 'Équipe', responsable: 'Responsable', tenue: 'Tenue / badge', consignes: 'Consignes', rdv: 'Point de rendez-vous',
    missionVide: 'Votre mission vous sera communiquée prochainement.', planVide: 'Votre planning sera communiqué prochainement.',
    jour: 'Jour', lieu: 'Lieu',
    docsTitre: 'Documents de la mission', docsVide: 'Les documents seront disponibles prochainement.',
    charte: 'Charte du bénévole / de la mission', programme: 'Programme de l’événement', plan: 'Plan du site', autre: 'Document',
    ouvrir: 'Télécharger', attestationNote: 'Votre attestation de participation sera disponible ici après l’événement (voir « Mes documents COPAF »).',
    badgeTitre: 'Mon badge digital', badgeTexte: 'Votre QR code personnel pour l’accréditation et le pointage. Présentez-le à l’accueil.', badgeBtn: 'Ouvrir mon badge',
  },
  en: {
    missionTitre: 'My mission', planTitre: 'My schedule',
    role: 'Role', equipe: 'Team', responsable: 'Manager', tenue: 'Outfit / badge', consignes: 'Instructions', rdv: 'Meeting point',
    missionVide: 'Your mission will be shared with you soon.', planVide: 'Your schedule will be shared with you soon.',
    jour: 'Day', lieu: 'Place',
    docsTitre: 'Mission documents', docsVide: 'Documents will be available soon.',
    charte: 'Volunteer / mission charter', programme: 'Event programme', plan: 'Site map', autre: 'Document',
    ouvrir: 'Download', attestationNote: 'Your certificate of participation will be available here after the event (see “My COPAF documents”).',
    badgeTitre: 'My digital badge', badgeTexte: 'Your personal QR code for accreditation and check-in. Show it at the welcome desk.', badgeBtn: 'Open my badge',
  },
}

const JOURS = { fr: { 1: '19 oct.', 2: '20 oct.', 3: '21 oct.' }, en: { 1: '19 Oct.', 2: '20 Oct.', 3: '21 Oct.' } }

const LIGNE = { display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13.5, lineHeight: 1.5 }
const ETIQ = { width: 130, flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: 2 }

export default function EspaceMission({ intervenant, lang, qr }) {
  const l = lang === 'en' ? 'en' : 'fr'
  const t = TR[l]
  const mission = intervenant.mission || {}
  const planning = Array.isArray(intervenant.interventions) ? intervenant.interventions : []
  const [communs, setCommuns] = useState([])

  useEffect(() => {
    let annule = false
    supabase.from('documents_intervenants').select('*').eq('dossier', 'EQUIPE').order('created_at').then(({ data }) => {
      if (!annule) setCommuns((data || []).filter(d => d.visible !== false && d.url))
    })
    return () => { annule = true }
  }, [])

  const champs = [['role', t.role], ['equipe', t.equipe], ['responsable', t.responsable], ['tenue', t.tenue], ['consignes', t.consignes], ['rdv', t.rdv]]
    .filter(([cle]) => String(mission[cle] || '').trim())
  const telResp = String(mission.responsable_tel || '').trim()

  return (
    <>
      <Card icon="user" title={t.missionTitre}>
        {champs.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: '#64748b' }}>{t.missionVide}</p>}
        {champs.map(([cle, etiquette]) => (
          <div key={cle} style={LIGNE}>
            <span style={ETIQ}>{etiquette}</span>
            <span style={{ color: '#0f172a', fontWeight: 600, whiteSpace: 'pre-line', minWidth: 0, overflowWrap: 'anywhere' }}>
              {mission[cle]}
              {cle === 'responsable' && telResp && (
                <> · <a href={`tel:${telResp.replace(/[^+\d]/g, '')}`} style={{ color: ACCENT, fontWeight: 700, textDecoration: 'none' }}>{telResp}</a></>
              )}
            </span>
          </div>
        ))}
      </Card>

      <Card icon="calendar" title={t.planTitre}>
        {planning.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: '#64748b' }}>{t.planVide}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {planning.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: ACCENT, background: '#E0F2FE', padding: '4px 9px', borderRadius: 7, whiteSpace: 'nowrap' }}>
                {JOURS[l][p.jour] || `${t.jour} ${p.jour}`} · {p.heure}
              </span>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{p.titre}</div>
                {p.avec && <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>{t.lieu} : {p.avec}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card icon="download" title={t.docsTitre}>
        {communs.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13.5, color: '#64748b' }}>{t.docsVide}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
            {communs.map(d => (
              <Bouton key={d.id} accent={ACCENT} icone="download" titre={d.label || t[d.type] || t.autre} sous={t[d.type] && d.label ? t[d.type] : t.ouvrir} actif onClick={() => window.open(d.url, '_blank', 'noopener')} />
            ))}
          </div>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{t.attestationNote}</p>
      </Card>

      {intervenant.badge_token && (
        <Card icon="badge" title={t.badgeTitre}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {qr && (
              <div style={{ background: '#fff', padding: 8, borderRadius: 12, border: '1px solid #E2E8F0', flexShrink: 0 }}>
                <img src={qr} alt="QR" style={{ width: 112, height: 112, display: 'block' }} />
              </div>
            )}
            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>{t.badgeTexte}</p>
              <a href={`/badge/${intervenant.badge_token}`} target="_blank" rel="noopener" className="btn-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, fontSize: 13.5, textDecoration: 'none' }}>
                <Ico name="badge" size={15} color="#fff" /> {t.badgeBtn}
              </a>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
