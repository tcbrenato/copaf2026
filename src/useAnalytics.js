import { useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { supabase } from './supabase'

const SESSION_KEY = 'copaf_session_id'
const CONTACT_KEY = 'copaf_contact_id'
const GA_MEASUREMENT_ID = 'G-57V7TBTS1F'

// Utilise un flag global sur window (plutôt qu'une variable de module) pour
// garantir une seule initialisation GA4, même si le module venait à être
// chargé plusieurs fois par le bundler.
function isGaInitialized() {
  return typeof window !== 'undefined' && window.__GA_INITIALIZED__ === true
}
function markGaInitialized() {
  if (typeof window !== 'undefined') window.__GA_INITIALIZED__ = true
}

function getUtmParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source:   p.get('utm_source')   || null,
    utm_medium:   p.get('utm_medium')   || null,
    utm_campaign: p.get('utm_campaign') || null,
  }
}

async function getOrCreateSession() {
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing

  // Resolution du pays cote serveur (Edge Function create-session) a partir
  // de l'IP reelle du visiteur (en-tete x-forwarded-for) — plus fiable que
  // l'appel a une API de geolocalisation depuis le navigateur, qui est
  // souvent bloque par les extensions anti-pub/vie privee.
  const contactId = localStorage.getItem(CONTACT_KEY) || null
  const { data, error } = await supabase.functions.invoke('create-session', {
    body: { contact_id: contactId },
  })

  if (error || !data?.id) return null
  sessionStorage.setItem(SESSION_KEY, data.id)
  return data.id
}

// Envoie la duree passee sur une page au moment ou le visiteur la quitte
// (changement de route SPA ou fermeture/rafraichissement d'onglet).
// sendBeacon (au lieu d'un fetch classique) garantit l'envoi meme quand la
// page est en train de se decharger, ce qu'un fetch normal ne peut pas
// promettre. La fonction Edge cible est deployee sans verification JWT
// (sendBeacon ne peut pas poser d'en-tete Authorization).
function sendTimeOnPage(pageViewId, enteredAt) {
  if (!pageViewId || !enteredAt) return
  const seconds = Math.round((Date.now() - enteredAt) / 1000)
  if (seconds <= 0) return
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-time-on-page`
  const body = new Blob([JSON.stringify({ page_view_id: pageViewId, time_on_page: seconds })], { type: 'text/plain' })
  navigator.sendBeacon?.(url, body)
}

export function useAnalytics() {
  const location        = useLocation()
  const sessionRef      = useRef(null)
  const pageStartRef    = useRef(0)
  const pageViewIdRef   = useRef(null)

  // Initialisation GA4 (une seule fois) + création/récupération de la session Supabase
  useEffect(() => {
    pageStartRef.current = Date.now()
    if (window.location.pathname.includes('/admin') || window.location.pathname.includes('/suivi-inscriptions')) return
    // Double vérification : le flag ET la présence réelle du script dans le DOM,
    // pour éviter toute injection en double du tag gtag.js.
    const scriptDejaPresent = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
    if (!isGaInitialized() && !scriptDejaPresent) {
      ReactGA.initialize(GA_MEASUREMENT_ID)
      markGaInitialized()
    }
    getOrCreateSession().then(id => { sessionRef.current = id })
  }, [])

  useEffect(() => {
    if (!location) return

    // Pas de tracking sur le panneau admin ni la page privee de suivi SG
    if (location.pathname.includes('/admin') || location.pathname.includes('/suivi-inscriptions')) return

    // ── Google Analytics 4 : pageview ──
    if (isGaInitialized()) {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname + location.search,
        title: document.title,
      })
    }

    // ── Tracking détaillé (Supabase : sessions / page_views) ──
    const trackView = async () => {
      const sessionId = sessionRef.current || await getOrCreateSession()
      if (!sessionId) return
      const contactId = localStorage.getItem(CONTACT_KEY) || null
      // Fonction serveur dediee (les tables de statistiques ne sont plus
      // accessibles directement en ecriture/lecture depuis le navigateur) ;
      // elle met aussi a jour la fin de session.
      const utm = getUtmParams()
      const { data } = await supabase.rpc('analytics_track_view', {
        p_session: sessionId,
        p_contact: contactId,
        p_path: location.pathname,
        p_referrer: document.referrer || null,
        p_utm_source: utm.utm_source,
        p_utm_medium: utm.utm_medium,
        p_utm_campaign: utm.utm_campaign,
      })
      pageViewIdRef.current = data || null
      pageStartRef.current = Date.now()
    }
    trackView()

    // Au changement de route (navigation SPA), on envoie la duree passee
    // sur la page qu'on quitte AVANT que trackView() n'en cree une nouvelle.
    return () => { sendTimeOnPage(pageViewIdRef.current, pageStartRef.current) }
  }, [location?.pathname])

  // Fermeture d'onglet / rafraichissement : le cleanup ci-dessus ne se
  // declenche pas dans ce cas (pas de changement de route), d'ou ce
  // listener separe pour capturer la derniere page vue de la session.
  useEffect(() => {
    const onHide = () => sendTimeOnPage(pageViewIdRef.current, pageStartRef.current)
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [])

  const trackEvent = useCallback(async (category, action, label = null, value = null, metadata = {}) => {
    // GA4
    if (isGaInitialized()) {
      ReactGA.event({ category, action, label: label || undefined, value: value || undefined })
    }

    // Supabase
    const sessionId = sessionRef.current
    const contactId = localStorage.getItem(CONTACT_KEY) || null
    await supabase.from('events').insert([{
      session_id: sessionId,
      contact_id: contactId,
      category,
      action,
      label,
      value,
      metadata,
    }])
  }, [])

  const identifyContact = useCallback(async (contactId) => {
    if (!contactId) return
    localStorage.setItem(CONTACT_KEY, contactId)
    const sessionId = sessionRef.current
    if (sessionId) {
      await supabase.rpc('analytics_identify', { p_session: sessionId, p_contact: contactId })
    }
  }, [])

  const trackFormStart  = useCallback((formName) =>
    trackEvent('inscription', 'form_start', formName),
  [trackEvent])

  const trackConversion = useCallback(async (type, label = null, value = null) =>
    await trackEvent('conversion', 'form_submit', label || type, value),
  [trackEvent])

  const trackClick = useCallback((label, metadata = {}) =>
    trackEvent('engagement', 'click', label, null, metadata),
  [trackEvent])

  return {
    trackEvent,
    trackConversion,
    trackFormStart,
    trackClick,
    identifyContact,
    sessionId: sessionRef.current,
  }
}