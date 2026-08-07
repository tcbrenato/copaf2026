import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import AdminGate from './components/AdminGate'
import Partners from './components/Partners'
import { useAnalytics } from './useAnalytics'
import Partenariats from './pages/Partenariats'
import ExpositionDigitale from './pages/ExpositionDigitale'
import VisiterExposition from './pages/VisiterExposition'
import VerifierDossier from './pages/VerifierDossier'
import AdminProforma from './pages/AdminProforma'
import VoteSondage from './pages/VoteSondage'
import AdminSondages from './pages/AdminSondages'
import ResultatsSondage from './pages/ResultatsSondage'
import DiagnosticSmartPort from './pages/DiagnosticSmartPort'
import DiagnosticResultat from './pages/DiagnosticResultat'
import AdminDiagnostics from './pages/AdminDiagnostics'

// ─── Tracker automatique sur chaque changement d'URL ─────────────────────────
const AnalyticsTracker = () => {
  useAnalytics()
  return null
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

// ─── Page Admin protegee par mot de passe ─────────────────────────────────────
const AdminPage = () => (
  <AdminGate>
    <AdminDashboard />
  </AdminGate>
)

// ─── Page Facture Proforma, protegee par un mot de passe dedie au secretariat ──
const AdminProformaPage = () => (
  <AdminGate
    password="PROFORMA2026"
    storageKey="copaf_proforma_auth"
    title="COPAF 2026"
    subtitle="Génération des factures proforma"
  >
    <AdminProforma />
  </AdminGate>
)

// ─── Page Admin Sondages, protegee par un mot de passe dedie ──────────────────
const AdminSondagesPage = () => (
  <AdminGate
    password="SONDAGES2026"
    storageKey="copaf_sondages_auth"
    title="COPAF 2026"
    subtitle="Contrôle des sondages en direct"
  >
    <AdminSondages />
  </AdminGate>
)

// ─── Page Admin Diagnostics Smart Port, protegee par un mot de passe dedie ────
const AdminDiagnosticsPage = () => (
  <AdminGate
    password="DIAGNOSTIC2026"
    storageKey="copaf_diagnostics_auth"
    title="COPAF 2026"
    subtitle="Diagnostics Smart Port"
  >
    <AdminDiagnostics />
  </AdminGate>
)

// ─── Application principale ───────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        <Route path="/"                       element={<MainSite />} />
        <Route path="/inscription"            element={<InscriptionPage />} />
        <Route path="/verifier"               element={<VerifierPage />} />
        <Route path="/partenariats"           element={<Partenariats />} />
        <Route path="/exposition-digitale"    element={<ExpositionDigitale />} />
        <Route path="/admin"                  element={<AdminPage />} />
        <Route path="/admin/proforma"         element={<AdminProformaPage />} />
        <Route path="/admin/sondages"         element={<AdminSondagesPage />} />
        <Route path="/admin/diagnostics"      element={<AdminDiagnosticsPage />} />
        <Route path="/vote"                   element={<VoteSondage />} />
        <Route path="/sondage-live/:id"       element={<ResultatsSondage />} />
        <Route path="/diagnostic"             element={<DiagnosticSmartPort />} />
        <Route path="/diagnostic/resultat/:id" element={<DiagnosticResultat />} />
        <Route path="/visiter" element={<VisiterExposition />} />
      </Routes>
    </Router>
  )
}

export default App