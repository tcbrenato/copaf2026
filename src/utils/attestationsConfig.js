// src/utils/attestationsConfig.js
//
// Configuration des attestations de participation COPAF 2026 :
//  - table des pays (code ISO2, nom FR/EN) et LANGUE de l'attestation par pays (francophones → FR ; anglophones et lusophones → EN) ;
//  - normalisation / détection du numéro d'enregistrement COPAF-2026-EXEC-XXXX.
// Pour changer la langue d'un pays, modifier la colonne `langue` ci-dessous (ou la langue d'une ligne dans l'administration).

export const PAYS = [
  // iso, nom français, nom anglais, langue, alias facultatifs (saisies courantes)
  ['DZ', 'Algérie', 'Algeria', 'FR'], ['AO', 'Angola', 'Angola', 'EN'], ['BJ', 'Bénin', 'Benin', 'FR'],
  ['BW', 'Botswana', 'Botswana', 'EN'], ['BF', 'Burkina Faso', 'Burkina Faso', 'FR'], ['BI', 'Burundi', 'Burundi', 'FR'],
  ['CV', 'Cap-Vert', 'Cape Verde', 'EN', ['Cabo Verde']], ['CM', 'Cameroun', 'Cameroon', 'FR'],
  ['CF', 'République centrafricaine', 'Central African Republic', 'FR', ['Centrafrique']], ['TD', 'Tchad', 'Chad', 'FR'],
  ['KM', 'Comores', 'Comoros', 'FR'], ['CG', 'Congo', 'Congo', 'FR', ['Congo-Brazzaville', 'République du Congo']],
  ['CD', 'RDC', 'DR Congo', 'FR', ['République démocratique du Congo', 'Congo-Kinshasa', 'Democratic Republic of the Congo', 'DRC']],
  ['CI', "Côte d'Ivoire", 'Ivory Coast', 'FR', ['Cote dIvoire']], ['DJ', 'Djibouti', 'Djibouti', 'FR'],
  ['EG', 'Égypte', 'Egypt', 'EN'], ['GQ', 'Guinée équatoriale', 'Equatorial Guinea', 'FR'], ['ER', 'Érythrée', 'Eritrea', 'EN'],
  ['SZ', 'Eswatini', 'Eswatini', 'EN', ['Swaziland']], ['ET', 'Éthiopie', 'Ethiopia', 'EN'], ['GA', 'Gabon', 'Gabon', 'FR'],
  ['GM', 'Gambie', 'Gambia', 'EN', ['The Gambia']], ['GH', 'Ghana', 'Ghana', 'EN'], ['GN', 'Guinée', 'Guinea', 'FR', ['Guinée Conakry']],
  ['GW', 'Guinée-Bissau', 'Guinea-Bissau', 'EN'], ['KE', 'Kenya', 'Kenya', 'EN'], ['LS', 'Lesotho', 'Lesotho', 'EN'],
  ['LR', 'Liberia', 'Liberia', 'EN'], ['LY', 'Libye', 'Libya', 'EN'], ['MG', 'Madagascar', 'Madagascar', 'FR'],
  ['MW', 'Malawi', 'Malawi', 'EN'], ['ML', 'Mali', 'Mali', 'FR'], ['MR', 'Mauritanie', 'Mauritania', 'FR'],
  ['MU', 'Maurice', 'Mauritius', 'EN'], ['MA', 'Maroc', 'Morocco', 'FR'], ['MZ', 'Mozambique', 'Mozambique', 'EN'],
  ['NA', 'Namibie', 'Namibia', 'EN'], ['NE', 'Niger', 'Niger', 'FR'], ['NG', 'Nigeria', 'Nigeria', 'EN', ['Nigéria']],
  ['RW', 'Rwanda', 'Rwanda', 'EN'], ['ST', 'Sao Tomé-et-Principe', 'Sao Tome and Principe', 'EN', ['Sao Tome-et-Principe']],
  ['SN', 'Sénégal', 'Senegal', 'FR'], ['SC', 'Seychelles', 'Seychelles', 'EN'], ['SL', 'Sierra Leone', 'Sierra Leone', 'EN'],
  ['SO', 'Somalie', 'Somalia', 'EN'], ['ZA', 'Afrique du Sud', 'South Africa', 'EN'], ['SS', 'Soudan du Sud', 'South Sudan', 'EN'],
  ['SD', 'Soudan', 'Sudan', 'EN'], ['TZ', 'Tanzanie', 'Tanzania', 'EN'], ['TG', 'Togo', 'Togo', 'FR'],
  ['TN', 'Tunisie', 'Tunisia', 'FR'], ['UG', 'Ouganda', 'Uganda', 'EN'], ['ZM', 'Zambie', 'Zambia', 'EN'], ['ZW', 'Zimbabwe', 'Zimbabwe', 'EN'],
  // hors Afrique (invités, partenaires)
  ['FR', 'France', 'France', 'FR'], ['BE', 'Belgique', 'Belgium', 'FR'], ['CH', 'Suisse', 'Switzerland', 'FR'],
  ['CA', 'Canada', 'Canada', 'EN'], ['US', 'États-Unis', 'United States', 'EN', ['USA', 'Etats Unis d Amerique']],
  ['GB', 'Royaume-Uni', 'United Kingdom', 'EN', ['UK', 'Angleterre']], ['DE', 'Allemagne', 'Germany', 'EN'], ['ES', 'Espagne', 'Spain', 'EN'],
  ['PT', 'Portugal', 'Portugal', 'EN'], ['IT', 'Italie', 'Italy', 'EN'], ['NL', 'Pays-Bas', 'Netherlands', 'EN', ['Hollande']],
  ['TR', 'Turquie', 'Turkey', 'EN'], ['CN', 'Chine', 'China', 'EN'], ['IN', 'Inde', 'India', 'EN'],
  ['AE', 'Émirats arabes unis', 'United Arab Emirates', 'EN', ['EAU', 'UAE']], ['SA', 'Arabie saoudite', 'Saudi Arabia', 'EN'], ['BR', 'Brésil', 'Brazil', 'EN'],
]

// « Côte d'Ivoire », « cote d ivoire », « COTE-D'IVOIRE » → « cote d ivoire »
export const normaliserTexte = s => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const INDEX = new Map()
PAYS.forEach(p => {
  const [, fr, en, , alias = []] = p
  ;[fr, en, ...alias].forEach(nom => INDEX.set(normaliserTexte(nom), p))
})

// Pays reconnu à partir d'un nom saisi (FR, EN ou alias, accents et casse indifférents) ; null si inconnu.
export function trouverPays(nom) {
  const p = INDEX.get(normaliserTexte(nom))
  return p ? { iso2: p[0], fr: p[1], en: p[2], langue: p[3] } : null
}

// Langue de l'attestation selon le pays (FR/EN). Pays inconnu : FR (langue du site), à corriger dans l'administration.
export const langueDepuisPays = nom => trouverPays(nom)?.langue || 'FR'

// Nom du pays dans la langue de l'attestation (Intl.DisplayNames si disponible, sinon la table ci-dessus, sinon la saisie)
export function nomPays(iso2, langue, repli = '') {
  const code = String(iso2 || '').toUpperCase()
  if (!code) return repli
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const n = new Intl.DisplayNames([langue === 'EN' ? 'en' : 'fr'], { type: 'region' }).of(code)
      if (n && n !== code) return n
    }
  } catch { /* navigateur ancien */ }
  const p = PAYS.find(x => x[0] === code)
  return p ? (langue === 'EN' ? p[2] : p[1]) : repli
}

// ─── Numéro d'enregistrement : COPAF-2026-EXEC-XXXX (insensible à la casse, espaces et tirets tolérés) ───
export const PREFIXE_CODE = 'COPAF-2026-EXEC-'
export const ALPHABET_CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 32 caractères, sans O, 0, I, 1

export function normaliserCodeAttestation(saisie) {
  const brut = String(saisie || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  const m = brut.match(/^COPAF2026EXEC([A-Z0-9]{4})$/)
  return m ? `${PREFIXE_CODE}${m[1]}` : null
}

// Reconnaît un code collé ou scanné : code seul, ou adresse …/verifier/CODE
export function extraireCodeAttestation(texte) {
  const t = String(texte || '').trim()
  const dansUrl = t.match(/\/verifier\/([^/?#\s]+)/i)
  return normaliserCodeAttestation(dansUrl ? decodeURIComponent(dansUrl[1]) : t)
}

export const urlVerification = (code, origine = 'https://copaf-ports.com') => `${origine}/verifier/${code}`

// ─── Civilité ───
export function normaliserCivilite(valeur) {
  const v = normaliserTexte(valeur)
  if (['m', 'mr', 'monsieur', 'mister', 'sir'].includes(v)) return 'M.'
  if (['mme', 'madame', 'mrs', 'ms', 'miss', 'mlle', 'mademoiselle'].includes(v)) return 'Mme'
  return ''
}
export const civiliteAffichee = (civilite, langue) => (langue === 'EN' ? (civilite === 'Mme' ? 'Ms.' : civilite === 'M.' ? 'Mr.' : '') : civilite || '')

// ─── Noms ───
export const nomAffiche = nom => String(nom || '').trim().toUpperCase()
export const prenomAffiche = prenom => String(prenom || '').trim().toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())

// Clé de détection des doublons : prénom + nom + autorité portuaire (accents, casse et ponctuation ignorés)
export const cleDoublon = a => [a.prenom, a.nom, a.autorite_portuaire].map(normaliserTexte).join('|')
