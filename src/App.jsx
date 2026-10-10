import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { CLE_JETON_EN_ATTENTE } from './utils/tabletteSession'
import HeaderStack from './components/HeaderStack'
import Hero from './components/Hero'
import About from './components/About'
import Programme from './components/Programme'
import Modules from './components/Modules'
import Intervenants from './components/Intervenants'
import Inscription from './components/Inscription'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Partners from './components/Partners'
import { useAnalytics } from './useAnalytics'
import MapAgpaocUapna from './components/MapAgpaocUapna'
import HighlightsBanner from './components/HighlightsBanner'
import Newsletter from './components/Newsletter'
import CookieBanner from './components/CookieBanner'
import ContactHub from './components/ContactHub'
import ManifestTerrain from './components/ManifestTerrain'
import InstallPrompt from './components/InstallPrompt'
import PromoPopup from './components/PromoPopup'

// ─── Routes secondaires chargees a la demande (code-splitting) ───────────────
// Seule la homepage (import ci-dessus) a besoin d'etre disponible des le
// premier chargement. Tout le reste — admin, diagnostics, sondages, pages
// institutionnelles... — n'est telecharge que si le visiteur y accede
// vraiment, au lieu de gonfler le bundle initial envoye a 100% des visiteurs
// pour des sections que la plupart ne verront jamais.
const AdminDashboard       = lazy(() => import('./components/AdminDashboard'))
const AuthGate             = lazy(() => import('./components/AuthGate'))
const Partenariats         = lazy(() => import('./pages/Partenariats'))
const ExpositionDigitale   = lazy(() => import('./pages/ExpositionDigitale'))
const VisiterExposition    = lazy(() => import('./pages/VisiterExposition'))
const VerifierDossier      = lazy(() => import('./pages/VerifierDossier'))
const VoteSondage          = lazy(() => import('./pages/VoteSondage'))
const SondagesLiveIndex    = lazy(() => import('./pages/SondagesLiveIndex'))
const ResultatsSondage     = lazy(() => import('./pages/ResultatsSondage'))
const DiagnosticSmartPort  = lazy(() => import('./pages/DiagnosticSmartPort'))
const DiagnosticResultat   = lazy(() => import('./pages/DiagnosticResultat'))
const ProjectionDiagnostic = lazy(() => import('./pages/ProjectionDiagnostic'))
const TabletteHub          = lazy(() => import('./pages/TabletteHub'))
const OutilsHub            = lazy(() => import('./pages/OutilsHub'))
const TirageLive           = lazy(() => import('./pages/TirageLive'))
const Actualites           = lazy(() => import('./pages/Actualites'))
const ActualiteDetail      = lazy(() => import('./pages/ActualiteDetail'))
const MentionsLegales      = lazy(() => import('./pages/MentionsLegales'))
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite'))
const InfosPratiques       = lazy(() => import('./pages/InfosPratiques'))
const MotDuDG              = lazy(() => import('./pages/MotDuDG'))
const SuiviInscriptions    = lazy(() => import('./pages/SuiviInscriptions'))
const LiveStreaming        = lazy(() => import('./pages/LiveStreaming'))
const Documentation        = lazy(() => import('./pages/Documentation'))
const RecommandationsActes = lazy(() => import('./pages/RecommandationsActes'))
const BadgeToken           = lazy(() => import('./pages/BadgeToken'))
const StaffScan            = lazy(() => import('./pages/StaffScan'))
const Terrain               = lazy(() => import('./pages/Terrain'))
const EspaceIntervenant    = lazy(() => import('./pages/EspaceIntervenant'))
const EspaceEquipe         = lazy(() => import('./pages/EspaceEquipe'))
const InstallerTerrain     = lazy(() => import('./pages/InstallerTerrain'))
const VerifierAttestation  = lazy(() => import('./pages/VerifierAttestation'))

// ─── Repli affiche pendant le telechargement d'une route secondaire ──────────
const RouteFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 34, height: 34, border: '3px solid #e2e8f0', borderTopColor: '#000E91', borderRadius: '50%', animation: 'route-spin .8s linear infinite' }} />
    <style>{`@keyframes route-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

// ─── Tracker automatique sur chaque changement d'URL ─────────────────────────
const AnalyticsTracker = () => {
  useAnalytics()
  return null
}

// /admin/tablettes : ouvre l'onglet « Tablettes » de l'administration (l'onglet actif est gardé dans localStorage)
const AdminTablettesRedirect = () => {
  try { localStorage.setItem('copaf_admin_active_module', 'tablettes') } catch { /* localStorage indisponible */ }
  return <Navigate to="/admin" replace />
}

// Lien court /t/CODE (si le script d'en-tête de index.html n'a pas déjà fait la redirection) : range le code puis
// ouvre l'outil Diagnostic, qui échange le code contre la session et pré-remplit l'identité.
const LienTablette = () => {
  const { code } = useParams()
  try { sessionStorage.setItem(CLE_JETON_EN_ATTENTE, code || '') } catch { /* stockage indisponible */ }
  return <Navigate to="/diagnostic" replace />
}

// Tablettes remises aux participants : pas de bandeau cookies ni d'invitation a installer l'appli sur les pages
// d'outils, ni sur les navigateurs anciens (classe « lite » posee par polyfills.js), pour ne pas masquer l'outil.
const PAGES_OUTILS_TABLETTE = /^\/(tablette|diagnostic|vote|sondage-live|t)(\/|$)/
const masquerSurTablette = pathname =>
  PAGES_OUTILS_TABLETTE.test(pathname) || document.documentElement.classList.contains('lite')

// ─── Bandeau cookies : partout sauf /admin, meme exclusion que le tracking
// analytics lui-meme (voir useAnalytics.js) — pas de sens a demander un
// consentement de tracking sur une page qui n'est pas trackee.
const CookieBannerGate = () => {
  const location = useLocation()
  if (location.pathname.includes('/admin')) return null
  if (location.pathname.includes('/suivi-inscriptions')) return null
  if (masquerSurTablette(location.pathname)) return null
  return <CookieBanner />
}

// ─── Bouton flottant de contact : partout sauf /admin et les ecrans de pure
// projection (sondage-live/diagnostic) affiches sur grand ecran en salle, ou
// un bouton de contact n'a pas de sens.
const ContactHubGate = () => {
  const location = useLocation()
  const { pathname } = location
  if (pathname.includes('/admin')) return null
  if (pathname.includes('/suivi-inscriptions')) return null
  if (/^\/sondage-live\/[^/]+/.test(pathname)) return null
  if (pathname === '/diagnostic/projection') return null
  if (pathname === '/terrain-app') return null
  return <ContactHub />
}

// ─── Banniere d'installation PWA : memes exclusions que ContactHub (pas de
// sens sur les ecrans de projection en salle, ni sur l'admin).
const InstallPromptGate = () => {
  const location = useLocation()
  const { pathname } = location
  if (pathname.includes('/admin')) return null
  if (pathname.includes('/suivi-inscriptions')) return null
  if (/^\/sondage-live\/[^/]+/.test(pathname)) return null
  if (pathname === '/diagnostic/projection') return null
  if (pathname === '/terrain-app') return null
  if (/^\/verifier\/[^/]+/.test(pathname)) return null
  if (masquerSurTablette(pathname)) return null
  return <InstallPrompt />
}

// ─── Remonte en haut de page a chaque changement de route : react-router ne
// le fait pas tout seul, donc un lien vers /inscription (ou toute autre
// page) depuis le bas d'une page precedente atterrissait la ou on avait
// scrolle avant, potentiellement tout en bas (le footer), au lieu du haut
// de la nouvelle page. Ne reagit qu'au changement de CHEMIN, pas de hash,
// pour ne jamais casser un lien d'ancrage interne (#section) sur la meme
// page.
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// ─── Popup promo (visuel COPAF 2026, une seule apparition par visite) : memes
// exclusions que ContactHub/InstallPrompt, + pas de sens sur la page
// d'inscription elle-meme (le visiteur y est deja).
const PromoPopupGate = () => {
  const location = useLocation()
  const { pathname } = location
  if (pathname.includes('/admin')) return null
  if (pathname.includes('/suivi-inscriptions')) return null
  if (pathname === '/inscription') return null
  if (/^\/sondage-live\/[^/]+/.test(pathname)) return null
  if (pathname === '/diagnostic/projection') return null
  if (pathname === '/staff/scan' || pathname === '/terrain' || pathname === '/terrain-app' || pathname.startsWith('/badge/')) return null
  if (/^\/verifier\/[^/]+/.test(pathname)) return null
  if (masquerSurTablette(pathname)) return null
  return <PromoPopup />
}

// NOTE SUR L'ESPACEMENT : --copaf-header-h est mise a jour en continu par
// HeaderStack.jsx (mesure reelle de sa hauteur). Le fallback (130px) ne sert
// qu'avant le tout premier rendu, le temps que la variable se pose.

// ─── Page d'accueil principale ────────────────────────────────────────────────
const MainSite = () => (
  <>
    <HeaderStack />
    <main style={{ paddingTop: 'var(--copaf-header-h, 130px)' }}>
      <Hero />
      <MapAgpaocUapna />
      <HighlightsBanner />
      <Partners />
      <About />
      <Programme />
      <Modules />
      <Intervenants />
      <Inscription />
      <Contact />
      <Newsletter />
      <Footer />
    </main>
  </>
)

// ─── Page Inscription seule ───────────────────────────────────────────────────
const InscriptionPage = () => (
  <>
    <HeaderStack />
    <div style={{ paddingTop: 'var(--copaf-header-h, 130px)' }}>
      <Inscription />
    </div>
    <Footer />
  </>
)

// ─── Page Verification anti-fraude ────────────────────────────────────────────
const VerifierPage = () => (
  <>
    <HeaderStack />
    <div style={{ paddingTop: 'var(--copaf-header-h, 130px)' }}>
      <VerifierDossier />
    </div>
    <Footer />
  </>
)

// ─── Espace Admin : tableau de bord unique protege par une vraie connexion ────
// (Supabase Auth). Le compte connecte determine les sections visibles :
// scope "all" voit tout, scope "proforma"/"sondages"/"diagnostics" ne voit
// que sa section dediee (voir src/components/AdminDashboard.jsx).
const AdminPage = () => (
  <AuthGate title="COPAF 2026" subtitle="Accès réservé à l'administration">
    <AdminDashboard />
  </AuthGate>
)

// ─── Scan badges (accueil) : pas d'AuthGate, StaffScan.jsx gere lui-meme
// les deux niveaux d'acces (compte admin OU dossier+PIN), comme Terrain.jsx.

// Pas d'AuthGate ici : Terrain.jsx gere lui-meme les deux niveaux d'acces
// (compte admin Supabase Auth OU dossier+PIN pour le personnel terrain
// sans compte admin) - AuthGate ne propose que la connexion admin.

// ─── Application principale ───────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnalyticsTracker />
      <CookieBannerGate />
      <ManifestTerrain />
      <ContactHubGate />
      <InstallPromptGate />
      <PromoPopupGate />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/"                       element={<MainSite />} />
        <Route path="/inscription"            element={<InscriptionPage />} />
        <Route path="/verifier"               element={<VerifierPage />} />
        <Route path="/verifier/:code"         element={<VerifierAttestation />} />
        <Route path="/partenariats"           element={<Partenariats />} />
        <Route path="/exposition-digitale"    element={<ExpositionDigitale />} />
        <Route path="/actualites"             element={<Actualites />} />
        <Route path="/actualites/:slug"       element={<ActualiteDetail />} />
        <Route path="/mentions-legales"       element={<MentionsLegales />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/live"                   element={<LiveStreaming />} />
        <Route path="/documentation"          element={<Documentation />} />
        <Route path="/recommandations"        element={<RecommandationsActes />} />
        <Route path="/infos-pratiques"        element={<InfosPratiques />} />
        <Route path="/mot-du-dg"              element={<MotDuDG />} />
        <Route path="/suivi-inscriptions"     element={<SuiviInscriptions />} />
        <Route path="/admin"                  element={<AdminPage />} />
        <Route path="/badge"                  element={<BadgeToken />} />
        <Route path="/badge/:token"           element={<BadgeToken />} />
        <Route path="/intervenant"            element={<EspaceIntervenant />} />
        <Route path="/espace-equipe"          element={<EspaceEquipe />} />
        <Route path="/staff/scan"             element={<StaffScan />} />
        <Route path="/terrain"                element={<Terrain />} />
        <Route path="/terrain-app"            element={<InstallerTerrain />} />
        <Route path="/admin/tablettes"        element={<AdminTablettesRedirect />} />
        <Route path="/admin/proforma"         element={<Navigate to="/admin" replace />} />
        <Route path="/admin/sondages"         element={<Navigate to="/admin" replace />} />
        <Route path="/admin/diagnostics"      element={<Navigate to="/admin" replace />} />
        <Route path="/vote"                   element={<VoteSondage />} />
        <Route path="/sondage-live"           element={<SondagesLiveIndex />} />
        <Route path="/sondage-live/:id"       element={<ResultatsSondage />} />
        <Route path="/diagnostic"             element={<DiagnosticSmartPort />} />
        <Route path="/diagnostic/resultat/:id" element={<DiagnosticResultat />} />
        <Route path="/diagnostic/projection"   element={<ProjectionDiagnostic />} />
        <Route path="/tablette"                element={<TabletteHub />} />
        <Route path="/t/:code"                 element={<LienTablette />} />
        <Route path="/outils"                  element={<OutilsHub />} />
        <Route path="/tirage"                  element={<TirageLive />} />
        <Route path="/visiter" element={<VisiterExposition />} />
      </Routes>
      </Suspense>
    </Router>
  )
}

export default App