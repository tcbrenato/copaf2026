// Fond de carte du monde partage par toutes les cartes du site.
//
// Le fichier world-atlas separe le Sahara occidental (id 732) du Maroc (id 504),
// ce qui fait apparaitre le Maroc « coupe » dans sa partie sud. Les deux
// territoires sont donc fusionnes ici en une seule forme, rattachee au Maroc
// (id 504), pour que les cartes montrent le Royaume dans ses frontieres
// reconnues par les autorites marocaines.
import worldAtlas from 'world-atlas/countries-50m.json'
import { feature, merge } from 'topojson-client'

const pays = worldAtlas.objects.countries
const ID_MAROC = '504'
const ID_SAHARA_OCCIDENTAL = '732'

const autres = feature(worldAtlas, pays).features.filter(f => f.id !== ID_MAROC && f.id !== ID_SAHARA_OCCIDENTAL)
const maroc = feature(worldAtlas, pays).features.find(f => f.id === ID_MAROC)
const geometriesMaroc = pays.geometries.filter(g => g.id === ID_MAROC || g.id === ID_SAHARA_OCCIDENTAL)

const marocComplet = { ...maroc, geometry: merge(worldAtlas, geometriesMaroc) }

export const ATLAS_MONDE = [...autres, marocComplet]
