// src/utils/generateICS.js
//
// Genere un fichier .ics telechargeable pour ajouter la COPAF 2026
// au calendrier du participant (Google Calendar, Outlook, Apple Calendar).
// Aucune dependance externe, aucun compte requis.

function toICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export function generateICS({
  dossier,
  title = 'COPAF 2026 — Conférence des Ports Africains',
  description = "Smart Port Africain : Intelligence Artificielle et cybersécurité au service de la performance.",
  location = 'Port de Casablanca, Royaume du Maroc',
  start = new Date('2026-09-15T09:00:00'),
  end = new Date('2026-09-17T17:30:00'),
} = {}) {
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
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}\\n\\nPlus d'infos : https://copaf-ports.com`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel — COPAF 2026 dans 7 jours',
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