import { supabase } from '../supabase'

// Appel de la fonction `reseau` (action demander) ; les intervenants joignent dossier + email.
export const demanderContact = (cibleId, identifiants) =>
  supabase.functions.invoke('reseau', { body: { action: 'demander', cible_id: cibleId, ...(identifiants || {}) } })
