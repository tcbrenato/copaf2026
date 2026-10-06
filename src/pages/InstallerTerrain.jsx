// src/pages/InstallerTerrain.jsx
//
// Page à envoyer à l'équipe terrain : installation de l'application « COPAF Terrain ».
//   - Android : fichier APK à télécharger (autoriser l'installation d'applications inconnues), ou installation depuis Chrome ;
//   - iPhone : aucun fichier possible, ajout à l'écran d'accueil depuis Safari (application plein écran identique).
// L'application ouvre directement /terrain ; /staff/scan (scan des badges) est dans la même application.

import { useEffect, useState } from 'react'
import SeoHead from '../components/SeoHead'

const NAVY = '#00367F'
const SKY = '#1798F4'
const APK = '/downloads/COPAF-Terrain.apk'

const CARTE = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, boxShadow: '0 4px 16px rgba(0,54,127,.06)' }
const BOUTON = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 50, padding: '0 20px', borderRadius: 14, border: 'none',
  background: NAVY, color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none', fontFamily: 'inherit', cursor: 'pointer', width: '100%', boxSizing: 'border-box',
}
const ETAPES = { margin: '12px 0 0', paddingLeft: 20, fontSize: 14.5, lineHeight: 1.7, color: '#334155' }

export default function InstallerTerrain() {
  const [invite, setInvite] = useState(null)
  const [installee, setInstallee] = useState(false)
  const ios = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
  const dejaInstallee = typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone)

  useEffect(() => {
    const surInvite = e => { e.preventDefault(); setInvite(e) }
    const surInstallee = () => setInstallee(true)
    window.addEventListener('beforeinstallprompt', surInvite)
    window.addEventListener('appinstalled', surInstallee)
    return () => { window.removeEventListener('beforeinstallprompt', surInvite); window.removeEventListener('appinstalled', surInstallee) }
  }, [])

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  const installer = async () => {
    if (!invite) return
    invite.prompt()
    await invite.userChoice
    setInvite(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <SeoHead title="Installer COPAF Terrain" description="Installation de l'application COPAF Terrain pour l'équipe d'accueil." type="website" />
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');"}</style>

      <header style={{ background: `linear-gradient(135deg, ${NAVY}, ${SKY})`, color: '#fff', padding: '34px 16px 26px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/icons/terrain-192.png" alt="" width="72" height="72" style={{ borderRadius: 18, background: '#fff', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>COPAF 2026 · Équipe d'accueil</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 900 }}>COPAF Terrain</h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '18px 16px 60px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#334155' }}>
          L'application s'ouvre directement sur le suivi Terrain (accueil aéroport, hôtel, badge, tablette) et contient le scan des badges. Elle se connecte avec votre <strong>dossier</strong> et votre <strong>code PIN</strong>.
        </p>

        {(dejaInstallee || installee) && (
          <div style={{ ...CARTE, background: '#ecfdf5', borderColor: '#a7f3d0', fontSize: 14.5, fontWeight: 700, color: '#065f46' }}>
            ✓ L'application est installée sur cet appareil. Ouvrez-la depuis l'icône « COPAF Terrain ».
          </div>
        )}

        <section style={CARTE} aria-label="Android">
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>Téléphone Android</h2>
          <a href={APK} download="COPAF-Terrain.apk" style={{ ...BOUTON, marginTop: 14 }}>Télécharger l'application (fichier APK)</a>
          <ol style={ETAPES}>
            <li>Ouvrez le fichier téléchargé <strong>COPAF-Terrain.apk</strong>.</li>
            <li>Si Android le demande, autorisez « Installer des applications inconnues » pour votre navigateur ou votre gestionnaire de fichiers, puis revenez.</li>
            <li>Touchez <strong>Installer</strong>, puis <strong>Ouvrir</strong>.</li>
            <li>À la première utilisation du scan, acceptez l'accès à la <strong>caméra</strong>.</li>
          </ol>
          {invite && (
            <button type="button" onClick={installer} style={{ ...BOUTON, marginTop: 14, background: '#fff', color: NAVY, border: `2px solid ${NAVY}` }}>
              Ou installer directement depuis ce navigateur
            </button>
          )}
        </section>

        <section style={{ ...CARTE, borderColor: ios ? SKY : '#e2e8f0' }} aria-label="iPhone">
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>iPhone (Safari)</h2>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#64748b', lineHeight: 1.5 }}>
            Apple n'accepte pas l'installation par fichier : l'application s'ajoute depuis Safari, avec le même résultat (icône, plein écran, sans barre d'adresse).
          </p>
          <ol style={ETAPES}>
            <li>Ouvrez cette page <strong>dans Safari</strong> (pas dans Chrome ni dans WhatsApp).</li>
            <li>Touchez le bouton <strong>Partager</strong> (carré avec une flèche vers le haut).</li>
            <li>Faites défiler et touchez <strong>« Sur l'écran d'accueil »</strong>, puis <strong>Ajouter</strong>.</li>
            <li>Ouvrez l'icône <strong>COPAF Terrain</strong> sur votre écran d'accueil.</li>
          </ol>
        </section>

        <section style={CARTE} aria-label="Aide">
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>Bon à savoir</h2>
          <ul style={{ ...ETAPES, marginTop: 8 }}>
            <li>Le PIN est personnel : ne le partagez pas.</li>
            <li>Les mises à jour arrivent toutes seules : il n'y a rien à réinstaller.</li>
            <li>Une connexion Internet est nécessaire (Wi-Fi ou données).</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
