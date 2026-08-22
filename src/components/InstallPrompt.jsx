import { useState, useEffect, useRef } from 'react'

// ─── Reglages de rappel ────────────────────────────────────────────────────
// "Plus tard" (ou fermeture de la banniere iOS) repousse la prochaine
// proposition de SNOOZE_DAYS jours, stocke en localStorage (persiste entre
// sessions). Un flag distinct, pose apres une installation reussie ou un
// choix "accepted", masque definitivement la banniere.
const SNOOZE_DAYS = 7
const LS_KEY = 'copaf_install_prompt'

function readState() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function writeState(patch) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ ...readState(), ...patch })) } catch { /* localStorage indisponible */ }
}

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function shouldOffer() {
  if (isStandalone()) return false
  const state = readState()
  if (state.installed) return false
  if (state.dismissedAt && Date.now() - state.dismissedAt < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return false
  if (sessionStorage.getItem(LS_KEY + '_shown')) return false
  return true
}

const Ico = ({ name, size = 20, color = '#fff' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    close: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    share: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>,
  }
  return icons[name] || null
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState('android') // 'android' | 'ios'
  const deferredPrompt = useRef(null)

  useEffect(() => {
    if (!shouldOffer()) return

    if (isIOS()) {
      setMode('ios')
      const t = setTimeout(() => { setVisible(true); sessionStorage.setItem(LS_KEY + '_shown', '1') }, 2500)
      return () => clearTimeout(t)
    }

    const onBeforeInstall = e => {
      e.preventDefault()
      if (!shouldOffer()) return
      deferredPrompt.current = e
      setMode('android')
      setVisible(true)
      sessionStorage.setItem(LS_KEY + '_shown', '1')
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    const onInstalled = () => { writeState({ installed: true }); setVisible(false) }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => { writeState({ dismissedAt: Date.now() }); setVisible(false) }

  const install = async () => {
    const evt = deferredPrompt.current
    if (!evt) return
    evt.prompt()
    const { outcome } = await evt.userChoice
    deferredPrompt.current = null
    if (outcome === 'accepted') writeState({ installed: true })
    else writeState({ dismissedAt: Date.now() })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 950,
      padding: 'clamp(12px,3vw,20px)', display: 'flex', justifyContent: 'center',
      animation: 'copaf-install-up .35s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', gap: 14,
        background: 'linear-gradient(135deg,#000E91,#0a1450)', borderRadius: 18,
        padding: '16px 16px 16px 18px', boxShadow: '0 16px 40px rgba(0,14,145,.35)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <img src="/icons/icon-192.png" alt="COPAF 2026" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: '#fff' }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {mode === 'ios' ? (
            <>
              <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 800, marginBottom: 3 }}>Installez COPAF 2026</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                Appuyez sur <Ico name="share" size={13} color="rgba(255,255,255,0.9)" /> <strong>Partager</strong> puis <strong>Sur l'écran d'accueil</strong>
              </div>
            </>
          ) : (
            <>
              <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 800, marginBottom: 3 }}>Installez COPAF 2026</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.5 }}>Sur votre appareil pour un accès rapide</div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {mode === 'android' && (
            <button onClick={install} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: 'none',
              borderRadius: 11, background: '#fff', color: '#000E91', fontFamily: 'inherit',
              fontWeight: 800, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              <Ico name="download" size={14} color="#000E91" /> Installer
            </button>
          )}
          <button onClick={dismiss} aria-label={mode === 'ios' ? "J'ai compris" : 'Plus tard'} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, flexShrink: 0,
            border: 'none', borderRadius: 10, background: 'rgba(255,255,255,0.12)', cursor: 'pointer',
          }}>
            <Ico name="close" size={15} color="rgba(255,255,255,0.85)" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes copaf-install-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
