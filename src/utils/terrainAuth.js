// src/utils/terrainAuth.js
//
// Detection du niveau d'acces partagee entre Terrain.jsx et StaffScan.jsx :
// compte Supabase Auth admin (scope checkin/all) d'abord, sinon dossier+PIN
// (voir migration 20260929090000_terrain_acces_pin.sql / _terrain_niveau).
// Pas de session persistee en localStorage : le PIN ne vit qu'en memoire du
// composant, meme convention que BadgeToken.jsx.

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

export function useNiveauTerrain() {
  const [niveau, setNiveau] = useState(null) // null=detection en cours, 'admin' | 'limite' | 'anonyme'
  const [identite, setIdentite] = useState(null) // { dossier, pin, nom, prenom } quand niveau === 'limite'

  useEffect(() => {
    let annule = false
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { if (!annule) setNiveau('anonyme'); return }
      const { data: adminRow } = await supabase.from('admins').select('scope').eq('user_id', data.session.user.id).maybeSingle()
      if (annule) return
      setNiveau(adminRow && (adminRow.scope === 'all' || adminRow.scope === 'checkin') ? 'admin' : 'anonyme')
    })
    return () => { annule = true }
  }, [])

  const acces = useMemo(() => (
    niveau === 'limite' ? { p_dossier: identite.dossier, p_pin: identite.pin } : {}
  ), [niveau, identite])

  const connecter = (dossier, pin, id) => { setIdentite({ dossier, pin, ...id }); setNiveau('limite') }

  return { niveau, identite, acces, connecter }
}
