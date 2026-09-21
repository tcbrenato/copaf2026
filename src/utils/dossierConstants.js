// ── Constantes partagees entre VerifierDossier et ParticipantDashboard ──

export const fmtEur = n => `${Number(n || 0).toLocaleString('fr-FR')} EUR`

export const WHATSAPP_NUMBER = '2290169303019'

export const BANK_INFO = {
  banque: 'Société Générale Bénin (SGB)',
  iban: 'BJ66 BJ10 4010 0103 7628 1201 0162',
  bic: 'SOGEBJBJ',
  titulaire: 'CRF PERFECTION',
}

// ── Bouton secondaire pleine largeur (utilise avec Card de dossierUi.jsx) ──
export const cardBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', padding: '11px 14px', marginTop: 6, boxSizing: 'border-box',
  background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: 10,
  color: '#0f172a', fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
  cursor: 'pointer', fontFamily: 'inherit',
}

// Tolere les saisies courantes du numero de dossier : « COPAF-45839 », « copaf2026-45839 » ou « 45839 »
// donnent toutes « COPAF2026-45839 ». Les autres formes (ex. COPAF2026-NPA-04) restent inchangees.
export function normaliserDossier(saisie) {
  const s = String(saisie || '').trim().replace(/\s+/g, '')
  const m = s.match(/^(?:COPAF(?:2026)?[-_]?)?(\d{4,6})$/i)
  return m ? `COPAF2026-${m[1]}` : s
}
