import { createContext, useContext } from 'react'

// Contexte partagé par les pages admin fusionnées dans le tableau de bord :
// expose le scope ('all' | 'proforma' | 'sondages' | 'diagnostics') du
// compte connecté, pour que chaque section puisse s'afficher/se masquer.
// `role` ('admin' | 'dg' | 'manager' | 'secretariat' | 'sg') est la couche
// de permission plus fine ajoutee en complement : dg/manager n'ont pas de
// scope (accès large en lecture via RLS dediee), donc l'UI doit se baser
// sur role pour savoir si des actions d'ecriture doivent s'afficher.
export const AdminAuthContext = createContext({ scope: null, role: null, session: null, signOut: () => {} })

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
