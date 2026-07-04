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

  // api.country.is est compatible CORS — remplace ipapi.co
  let country = null
  try {
    const r = await fetch('https://api.country.is/', { signal: AbortSignal.timeout(2000) })
    const d = await r.json()
    country = d.country || null
  } catch {}

  const contactId = localStorage.getItem(CONTACT_KEY) || null
  const { data, error } = await supabase
    .from('sessions')
    .insert([{
      contact_id: contactId,
      user_agent: navigator.userAgent.slice(0, 200),
      country,
      page_count: 0,
    }])
    .select('id')
    .single()

  if (error || !data) return null
  sessionStorage.setItem(SESSION_KEY, data.id)
  return data.id
}

async function pingSession(sessionId) {
  if (!sessionId) return
  await supabase
    .from('sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId)
}

export function useAnalytics() {
  const location     = useLocation()
  const sessionRef   = useRef(null)
  const pageStartRef = useRef(Date.now())

  // Initialisation GA4 (une seule fois) + création/récupération de la session Supabase
  useEffect(() => {
    if (window.location.pathname.includes('/admin')) return
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

    // Pas de tracking sur le panneau admin
    if (location.pathname.includes('/admin')) return

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
      await supabase.from('page_views').insert([{
        session_id:  sessionId,
        contact_id:  contactId,
        path:        location.pathname,
        referrer:    document.referrer || null,
        time_on_page: 0,
        ...getUtmParams(),
      }])
      pageStartRef.current = Date.now()
      await pingSession(sessionId)
    }
    trackView()
  }, [location?.pathname])

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
      await supabase
        .from('sessions')
        .update({ contact_id: contactId })
        .eq('id', sessionId)
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