import { createContext, useContext } from 'react'

// Contexte partagé par les pages admin fusionnées dans le tableau de bord :
// expose le scope ('all' | 'proforma' | 'sondages' | 'diagnostics') du
// compte connecté, pour que chaque section puisse s'afficher/se masquer.
export const AdminAuthContext = createContext({ scope: null, session: null, signOut: () => {} })

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
