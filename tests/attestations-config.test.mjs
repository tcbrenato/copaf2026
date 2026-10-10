// Tests des fonctions pures des attestations : node tests/attestations-config.test.mjs
import assert from 'node:assert/strict'
import {
  trouverPays, langueDepuisPays, nomPays, normaliserCodeAttestation, extraireCodeAttestation, urlVerification,
  normaliserCivilite, prenomAffiche, nomAffiche, cleDoublon, PAYS, ALPHABET_CODE,
} from '../src/utils/attestationsConfig.js'

// Code valide / variantes tolérées
assert.equal(normaliserCodeAttestation('COPAF-2026-EXEC-AB3K'), 'COPAF-2026-EXEC-AB3K')
assert.equal(normaliserCodeAttestation('  copaf 2026 exec ab3k '), 'COPAF-2026-EXEC-AB3K')
assert.equal(normaliserCodeAttestation('copaf2026execab3k'), 'COPAF-2026-EXEC-AB3K')
// Code invalide
assert.equal(normaliserCodeAttestation('COPAF-2026-EXEC-AB3'), null)
assert.equal(normaliserCodeAttestation('COPAF2026-33111'), null) // numéro de dossier : pas une attestation
assert.equal(normaliserCodeAttestation(''), null)
// Adresse du QR
assert.equal(extraireCodeAttestation('https://copaf-ports.com/verifier/COPAF-2026-EXEC-AB3K'), 'COPAF-2026-EXEC-AB3K')
assert.equal(extraireCodeAttestation(urlVerification('COPAF-2026-EXEC-XY7Z')), 'COPAF-2026-EXEC-XY7Z')

// Langue automatique : francophones FR, anglophones et lusophones EN
for (const [pays, langue] of [['Bénin', 'FR'], ['Benin', 'FR'], ["Cote d'Ivoire", 'FR'], ['Togo', 'FR'], ['Sénégal', 'FR'], ['Cameroun', 'FR'], ['Maroc', 'FR'],
  ['Nigeria', 'EN'], ['Ghana', 'EN'], ['Sierra Leone', 'EN'], ['Liberia', 'EN'], ['Gambie', 'EN'], ['Kenya', 'EN'], ['Tanzanie', 'EN'], ['Afrique du Sud', 'EN'], ['Égypte', 'EN'],
  ['Cap-Vert', 'EN'], ['Guinée-Bissau', 'EN'], ['Angola', 'EN'], ['Mozambique', 'EN'], ['Somalie', 'EN']]) {
  assert.equal(langueDepuisPays(pays), langue, pays)
}
assert.equal(trouverPays('COTE D IVOIRE').iso2, 'CI')
assert.equal(trouverPays('Etats-Unis').iso2, 'US')
assert.equal(trouverPays('Pays inconnu'), null)
assert.equal(langueDepuisPays('Pays inconnu'), 'FR')
// Noms de pays
assert.equal(nomPays('NG', 'FR'), 'Nigeria')
assert.equal(nomPays('CI', 'EN'), 'Côte d’Ivoire')
assert.equal(nomPays('NG', 'EN'), 'Nigeria')
// Codes ISO uniques et alphabet sans caractères ambigus
assert.equal(new Set(PAYS.map(p => p[0])).size, PAYS.length)
assert.ok(!/[O0I1]/.test(ALPHABET_CODE) && ALPHABET_CODE.length === 32)
// Civilité, noms, doublons
assert.equal(normaliserCivilite('Monsieur'), 'M.'); assert.equal(normaliserCivilite('Mrs'), 'Mme'); assert.equal(normaliserCivilite('?'), '')
assert.equal(prenomAffiche('ABUBAKAR MAHMUD'), 'Abubakar Mahmud'); assert.equal(prenomAffiche("n'faye"), "N'Faye"); assert.equal(nomAffiche(' Kouyaté '), 'KOUYATÉ')
assert.equal(cleDoublon({ prenom: 'Élie', nom: 'Sy', autorite_portuaire: 'PAA ' }), cleDoublon({ prenom: 'elie', nom: 'SY', autorite_portuaire: 'paa' }))
console.log('OK : tous les tests de configuration passent')
