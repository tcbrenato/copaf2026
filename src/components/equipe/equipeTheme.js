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

export const libelleJour = (jour, lang) =>
  new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${jour}T12:00:00Z`))

export const initiales = nom =>
  String(nom || '').split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0]).join('').toUpperCase()
