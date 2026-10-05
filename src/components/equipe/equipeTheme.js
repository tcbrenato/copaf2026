// Charte de l'Espace équipe (/espace-equipe) et de son onglet admin.
export const NAVY = '#00367F'
export const SKY = '#1798F4'
export const INK = '#0f172a'
export const MUTED = '#64748b'
export const LINE = '#e2e8f0'

export const CARTE = {
  background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, padding: 18,
  boxShadow: '0 4px 16px rgba(0,54,127,.06)',
}

export const TZ = 'Africa/Casablanca'

// Date du jour à Casablanca au format AAAA-MM-JJ
export const aujourdhui = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

export const libelleJour = (jour, lang) => {
  const texte = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${jour}T12:00:00Z`))
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

// Aucun texte provisoire n'est affiché : un fragment entre crochets (« [à confirmer] », « [heure] », « [lien] »…)
// est retiré ; s'il ne reste rien, le champ est considéré comme vide et sa ligne n'apparaît pas.
export const nettoyer = texte =>
  String(texte ?? '')
    .replace(/\s*\[[^\]]*\]\s*/g, ' ')
    .replace(/\s+([,;.])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,;:·–-]+|[\s,;:·–-]+$/g, '')
    .trim()

const CHAMPS_TEXTE = ['role', 'equipe', 'comite', 'titre', 'dates_mission', 'tenue', 'badge_info', 'rdv_lieu', 'rdv_detail', 'rdv_lien', 'horaire_arrivee', 'prochaine_etape', 'probleme_contact', 'probleme_horaires', 'responsable_nom']
const CHAMPS_LISTE = ['consignes', 'missions']

// Copie de la fiche du membre dont tous les textes passent par le filtre ci-dessus
export const nettoyerMembre = membre => {
  const copie = { ...membre }
  CHAMPS_TEXTE.forEach(k => { copie[k] = nettoyer(membre[k]) })
  CHAMPS_LISTE.forEach(k => { copie[k] = (membre[k] || []).map(nettoyer).filter(Boolean) })
  return copie
}

export const initiales = nom =>
  String(nom || '').split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0]).join('').toUpperCase()
