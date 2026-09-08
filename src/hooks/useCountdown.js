import { useEffect, useState } from 'react'

const DAY_MS = 24 * 60 * 60 * 1000

function daysUntil(targetTimestamp) {
  return Math.ceil((targetTimestamp - Date.now()) / DAY_MS)
}

// Nombre de jours restants avant `targetTimestamp` (ms epoch — passer un
// nombre stable, pas un `new Date()` recree a chaque rendu, sinon l'effet
// se relance en boucle). Negatif une fois la date passee.
//
// SSR/pre-rendu-safe : `Date.now()` n'est pas une API navigateur (contrairement
// a `window`/`document`), donc l'etat initial peut etre calcule directement au
// premier rendu — le snapshot capture par scripts/prerender.mjs affiche ainsi
// un vrai decompte plutot qu'un skeleton vide.
export function useCountdown(targetTimestamp) {
  const [daysLeft, setDaysLeft] = useState(() => daysUntil(targetTimestamp))

  useEffect(() => {
    // Toutes les heures suffit largement pour un decompte en jours.
    const id = setInterval(() => setDaysLeft(daysUntil(targetTimestamp)), 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [targetTimestamp])

  return daysLeft
}
