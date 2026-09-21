import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'

// Bloc "Voyage" de la page personnelle /badge (apres connexion par dossier + secret) :
// la personne renseigne ses vols (ou depose son billet) et retrouve son guide et sa
// fiche de voyage quand ils sont disponibles. Les vols sont enregistres par
// badge_voyage_save (dossier + secret reverifies) ; le billet va dans un bucket PRIVE.

const TR = {
  fr: {
    titre: 'Voyage', aide: 'Vos informations de vol nous servent à organiser votre accueil et vos transferts.',
    aller: 'Vol aller (arrivée à Casablanca)', retour: 'Vol retour (départ de Casablanca)',
    compagnie: 'Compagnie', numero: 'N° de vol', date: 'Date', heure: 'Heure',
    billet: 'Ou déposez votre billet (PDF ou photo)', choisir: 'Choisir un fichier', billetOk: '✓ Billet reçu',
    enregistrer: 'Enregistrer mes informations de vol', envoi: 'Envoi...', ok: '✓ Enregistré', erreur: 'Erreur, réessayer', fichierNonValide: 'Fichier non valide (PDF ou image, 8 Mo max)',
    statutAucun: 'Vols : pas encore renseignés', statutVols: 'Vols reçus — fiche de voyage en préparation', statutPrete: 'Votre fiche de voyage est prête', statutEnvoyee: 'Votre fiche de voyage est prête',
    guide: 'Télécharger le guide du participant', fiche: 'Télécharger ma fiche de voyage', guideAVenir: 'Guide du participant : à venir',
  },
  en: {
    titre: 'Travel', aide: 'Your flight information helps us organise your welcome and transfers.',
    aller: 'Outbound flight (arrival in Casablanca)', retour: 'Return flight (departure from Casablanca)',
    compagnie: 'Airline', numero: 'Flight no.', date: 'Date', heure: 'Time',
    billet: 'Or upload your ticket (PDF or photo)', choisir: 'Choose a file', billetOk: '✓ Ticket received',
    enregistrer: 'Save my flight information', envoi: 'Uploading...', ok: '✓ Saved', erreur: 'Error, try again', fichierNonValide: 'Invalid file (PDF or image, 8 MB max)',
    statutAucun: 'Flights: not provided yet', statutVols: 'Flights received — travel sheet in preparation', statutPrete: 'Your travel sheet is ready', statutEnvoyee: 'Your travel sheet is ready',
    guide: 'Download the participant guide', fiche: 'Download my travel sheet', guideAVenir: 'Participant guide: coming soon',
  },
}

const VIDE = { compagnie: '', numero: '', date: '', heure: '' }
const CHAMP = {
  width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '9px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,.25)',
  background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 12.5, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark',
}
const BOUTON = {
  width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.2)',
  color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}

export default function VoyageBadge({ dossier, secret, lang }) {
  const t = TR[lang === 'en' ? 'en' : 'fr']
  const [voyage, setVoyage] = useState(null)
  const [aller, setAller] = useState(VIDE)
  const [retour, setRetour] = useState(VIDE)
  const [fichier, setFichier] = useState(null)
  const [etat, setEtat] = useState('idle') // idle | loading | done | error | invalide
  const [telechargement, setTelechargement] = useState('')

  const appliquer = useCallback(v => {
    setVoyage(v)
    setAller({ ...VIDE, ...(v?.vol_aller || {}) })
    setRetour({ ...VIDE, ...(v?.vol_retour || {}) })
  }, [])

  useEffect(() => {
    let annule = false
    supabase.rpc('badge_voyage', { p_dossier: dossier, p_secret: secret }).then(({ data }) => { if (!annule && data) appliquer(data) })
    return () => { annule = true }
  }, [dossier, secret, appliquer])

  const nettoie = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v || '').trim()]).filter(([, v]) => v))

  const enregistrer = async () => {
    setEtat('loading')
    try {
      let chemin = null
      if (fichier) {
        const ok = (fichier.type === 'application/pdf' || fichier.type.startsWith('image/')) && fichier.size <= 8 * 1024 * 1024
        if (!ok) { setEtat('invalide'); return }
        const ext = (fichier.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'pdf'
        chemin = `${crypto.randomUUID()}/billet.${ext}`
        const { error: upErr } = await supabase.storage.from('billets-avion').upload(chemin, fichier)
        if (upErr) throw upErr
      }
      const { data, error } = await supabase.rpc('badge_voyage_save', {
        p_dossier: dossier, p_secret: secret, p_aller: nettoie(aller), p_retour: nettoie(retour), p_billet: chemin,
      })
      if (error || !data) throw error || new Error('Refusé')
      appliquer(data)
      setFichier(null)
      setEtat('done')
      supabase.functions.invoke('voyage-notify', { body: { action: 'vols_recus', dossier } }).catch(() => {})
    } catch {
      setEtat('error')
    }
  }

  const telecharger = async genre => {
    if (!voyage) return
    setTelechargement(genre)
    try {
      const m = await import('../utils/generateVoyagePDF')
      const l = voyage.langue === 'en' ? 'en' : 'fr'
      if (genre === 'guide') await m.generateGuidePDF({ config: voyage.guide, lang: l, download: true })
      else await m.generateFichePDF({ voyage, config: voyage.guide || { fr: {}, en: {} }, lang: l, download: true })
    } catch (e) {
      console.error(e)
    } finally {
      setTelechargement('')
    }
  }

  const vols = (titre, val, set) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.85 }}>{titre}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <input style={CHAMP} placeholder={t.compagnie} maxLength={80} value={val.compagnie} onChange={e => { setEtat('idle'); set(v => ({ ...v, compagnie: e.target.value })) }} />
        <input style={CHAMP} placeholder={t.numero} maxLength={20} value={val.numero} onChange={e => { setEtat('idle'); set(v => ({ ...v, numero: e.target.value })) }} />
        <input style={CHAMP} type="date" aria-label={t.date} value={val.date} onChange={e => { setEtat('idle'); set(v => ({ ...v, date: e.target.value })) }} />
        <input style={CHAMP} type="time" aria-label={t.heure} value={val.heure} onChange={e => { setEtat('idle'); set(v => ({ ...v, heure: e.target.value })) }} />
      </div>
    </div>
  )

  const statut = voyage?.statut || 'aucun'
  const libelleStatut = { aucun: t.statutAucun, vols_recus: t.statutVols, fiche_prete: t.statutPrete, fiche_envoyee: t.statutEnvoyee }[statut]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.2)' }}>
      <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 700 }}>{t.titre}</div>
      <div style={{ fontSize: 10.5, opacity: 0.65, lineHeight: 1.5, marginTop: -4 }}>{t.aide}</div>
      {vols(t.aller, aller, setAller)}
      {vols(t.retour, retour, setRetour)}

      <label style={{ ...CHAMP, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'pointer' }}>
        <span style={{ fontSize: 12 }}>{voyage?.billet_depose && !fichier ? t.billetOk : t.billet}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.9 }}>{fichier ? fichier.name.slice(0, 18) : t.choisir}</span>
        <input type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={e => { setEtat('idle'); setFichier(e.target.files?.[0] || null) }} />
      </label>

      <button type="button" style={{ ...BOUTON, opacity: etat === 'loading' ? 0.6 : 1 }} disabled={etat === 'loading'} onClick={enregistrer}>
        {etat === 'loading' ? t.envoi : etat === 'done' ? t.ok : etat === 'error' ? t.erreur : etat === 'invalide' ? t.fichierNonValide : t.enregistrer}
      </button>

      <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.9, textAlign: 'left' }}>{libelleStatut}</div>
      {voyage?.guide
        ? <button type="button" style={BOUTON} disabled={!!telechargement} onClick={() => telecharger('guide')}>{telechargement === 'guide' ? '…' : t.guide}</button>
        : <div style={{ fontSize: 11, opacity: 0.6, textAlign: 'left' }}>{t.guideAVenir}</div>}
      {voyage?.fiche && (
        <button type="button" style={BOUTON} disabled={!!telechargement} onClick={() => telecharger('fiche')}>{telechargement === 'fiche' ? '…' : t.fiche}</button>
      )}
    </div>
  )
}
