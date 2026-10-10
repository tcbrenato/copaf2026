// Tests de lecture/écriture des tableurs : node tests/tableur.test.mjs
import assert from 'node:assert/strict'
import { lireTableur, ecrireXlsx, ecrireCsv } from '../src/utils/tableur.js'

const lignes = [
  ['Civilité', 'Prénom', 'Nom', 'Fonction', 'Autorité portuaire', 'Pays'],
  ['M.', 'Komla Piwedeou', 'AMEDRO', "Responsable de la Sécurité des Systèmes d'Information", 'Port Autonome de Lomé', 'Togo'],
  ['Mme', 'Vivian', 'RICHARD-EDET', 'Executive Director F&A <Finance>', 'Nigerian Ports Authority (NPA)', 'Nigeria'],
  ['M.', 'Test', 'GUILLEMET "X"', 'Ligne1\nLigne2', '', 'Côte d’Ivoire'],
]

// xlsx : écriture puis relecture à l'identique
const blob = await ecrireXlsx(lignes, { nomFeuille: 'Participants', largeurs: [10, 20, 20, 40, 40, 20] })
const relu = await lireTableur(await blob.arrayBuffer())
assert.deepEqual(relu.map(l => l.slice(0, 6)), lignes.map(l => l.map(v => v.trim())))
// CSV « ; » avec guillemets et retour à la ligne dans une cellule
const csv = ecrireCsv(lignes)
const reluCsv = await lireTableur(await csv.arrayBuffer())
assert.deepEqual(reluCsv, lignes.map(l => l.map(v => v.trim())).filter(l => l.some(v => v !== '')))
// CSV « , » classique et « \t »
assert.deepEqual(await lireTableur(new TextEncoder().encode('a,b,c\r\n1,"x,y",3\r\n').buffer), [['a', 'b', 'c'], ['1', 'x,y', '3']])
assert.deepEqual(await lireTableur(new TextEncoder().encode('a\tb\n1\t2').buffer), [['a', 'b'], ['1', '2']])
console.log('OK : lecture/écriture xlsx et csv')
