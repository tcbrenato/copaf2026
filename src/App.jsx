import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import HeaderStack from './components/HeaderStack'
import Hero from './components/Hero'
import About from './components/About'
import Programme from './components/Programme'
import Modules from './components/Modules'
import Intervenants from './components/Intervenants'
import Inscription from './components/Inscription'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminDashboard from './components/AdminDashboard'
import AuthGate from './components/AuthGate'
import Partners from './components/Partners'
import { useAnalytics } from './useAnalytics'
import Partenariats from './pages/Partenariats'
import ExpositionDigitale from './pages/ExpositionDigitale'
import VisiterExposition from './pages/VisiterExposition'
import VerifierDossier from './pages/VerifierDossier'
import VoteSondage from './pages/VoteSondage'
import SondagesLiveIndex from './pages/SondagesLiveIndex'
import ResultatsSondage from './pages/ResultatsSondage'
import DiagnosticSmartPort from './pages/DiagnosticSmartPort'
import DiagnosticResultat from './pages/DiagnosticResultat'
import ProjectionDiagnostic from './pages/ProjectionDiagnostic'
import TabletteHub from './pages/TabletteHub'
import Actualites from './pages/Actualites'
import ActualiteDetail from './pages/ActualiteDetail'
import MentionsLegales from './pages/MentionsLegales'
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite'
import LiveStreaming from './pages/LiveStreaming'
import Documentation from './pages/Documentation'
import WhatsAppButton from './components/WhatsAppButton'
import CookieBanner from './components/CookieBanner'

// ─── Tracker automatique sur chaque changement d'URL ─────────────────────────
const AnalyticsTracker = () => {
  useAnalytics()
  return null
}

// ─── Bandeau cookies : partout sauf /admin, meme exclusion que le tracking
// analytics lui-meme (voir useAnalytics.js) — pas de sens a demander un
// consentement de tracking sur une page qui n'est pas trackee.
const CookieBannerGate = () => {
  const location = useLocation()
  if (location.pathname.includes('/admin')) return null
  return <CookieBanner />
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
      <Partners />
      <About />
      <Programme />
      <Modules />
      <Intervenants />
      <Inscription />
      <Contact />
      <Footer />
    </main>
    <WhatsAppButton />
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
    <WhatsAppButton />
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
    <WhatsAppButton />
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

// ─── Application principale ───────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <CookieBannerGate />
      <Routes>
        <Route path="/"                       element={<MainSite />} />
        <Route path="/inscription"            element={<InscriptionPage />} />
        <Route path="/verifier"               element={<VerifierPage />} />
        <Route path="/partenariats"           element={<><Partenariats /><WhatsAppButton /></>} />
        <Route path="/exposition-digitale"    element={<><ExpositionDigitale /><WhatsAppButton /></>} />
        <Route path="/actualites"             element={<><Actualites /><WhatsAppButton /></>} />
        <Route path="/actualites/:slug"       element={<><ActualiteDetail /><WhatsAppButton /></>} />
        <Route path="/mentions-legales"       element={<MentionsLegales />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/live"                   element={<><LiveStreaming /><WhatsAppButton /></>} />
        <Route path="/documentation"          element={<><Documentation /><WhatsAppButton /></>} />
        <Route path="/admin"                  element={<AdminPage />} />
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
        <Route path="/visiter" element={<VisiterExposition />} />
      </Routes>
    </Router>
  )
}

export default App