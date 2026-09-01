// src/utils/generateICS.js
//
// Genere un fichier .ics telechargeable pour ajouter la COPAF 2026
// au calendrier du participant (Google Calendar, Outlook, Apple Calendar).
// Aucune dependance externe, aucun compte requis.
//
// NOTE : structure du fichier .ics strictement inchangee. Seul le texte
// (titre, description, rappel) varie selon `lang` (fr|en).

function toICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

const TXT = {
  fr: {
    title: 'COPAF 2026 — Conférence des Ports Africains',
    description: "Smart Port Africain : Intelligence Artificielle et cybersécurité au service de la performance.",
    location: 'Port de Casablanca, Royaume du Maroc',
    plusInfos: "Plus d'infos",
    rappel: 'Rappel — COPAF 2026 dans 7 jours',
  },
  en: {
    title: 'COPAF 2026 — Conference of African Ports',
    description: 'Smart African Port: Artificial Intelligence and cybersecurity for enhanced performance.',
    location: 'Port of Casablanca, Kingdom of Morocco',
    plusInfos: 'More information',
    rappel: 'Reminder — COPAF 2026 in 7 days',
  },
}

export function generateICS({
  dossier,
  lang = 'fr',
  title,
  description,
  location,
  start = new Date('2026-10-19T09:00:00'),
  end = new Date('2026-10-21T17:30:00'),
} = {}) {
  const L = TXT[lang] || TXT.fr
  const finalTitle = title || L.title
  const finalDescription = description || L.description
  const finalLocation = location || L.location

  const uid = `${dossier || 'copaf2026'}-${Date.now()}@copaf-ports.com`
  const now = toICSDate(new Date())

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//COPAF 2026//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${finalTitle}`,
    `DESCRIPTION:${finalDescription}\\n\\n${L.plusInfos} : https://copaf-ports.com`,
    `LOCATION:${finalLocation}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${L.rappel}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'COPAF2026.ics'
  a.click()
  URL.revokeObjectURL(url)
}