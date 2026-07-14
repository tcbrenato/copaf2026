import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Programme from './components/Programme'
import Modules from './components/Modules'
import Intervenants from './components/Intervenants'
import Inscription from './components/Inscription'
import Footer from './components/Footer'
import AdminDashboard from './components/AdminDashboard'
import AdminGate from './components/AdminGate'
import Partners from './components/Partners'
import { useAnalytics } from './useAnalytics'
import Partenariats from './pages/Partenariats'
import ExpositionDigitale from './pages/ExpositionDigitale'
import VisiterExposition from './pages/VisiterExposition'
import VerifierDossier from './pages/VerifierDossier'

// ─── Tracker automatique sur chaque changement d'URL ─────────────────────────
const AnalyticsTracker = () => {
  useAnalytics()
  return null
}

// ─── Page d'accueil principale ────────────────────────────────────────────────
const MainSite = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Partners />
      <About />
      <Programme />
      <Modules />
      <Intervenants />
      <Inscription />
      <Footer />
    </main>
  </>
)

// ─── Page Inscription seule ───────────────────────────────────────────────────
const InscriptionPage = () => (
  <>
    <Navbar />
    <div style={{ paddingTop: 80 }}>
      <Inscription />
    </div>
    <Footer />
  </>
)

// ─── Page Verification anti-fraude ────────────────────────────────────────────
const VerifierPage = () => (
  <>
    <Navbar />
    <div style={{ paddingTop: 80 }}>
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

// ─── Application principale ───────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        <Route path="/"                    element={<MainSite />} />
        <Route path="/inscription"         element={<InscriptionPage />} />
        <Route path="/verifier"            element={<VerifierPage />} />
        <Route path="/partenariats"        element={<Partenariats />} />
        <Route path="/exposition-digitale" element={<ExpositionDigitale />} />
        <Route path="/admin"               element={<AdminPage />} />
        <Route path="/visiter" element={<VisiterExposition />} />
      </Routes>
    </Router>
  )
}

export default App
