import { useEffect } from 'react'
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
import Partners from './components/Partners'
import { useAnalytics } from './useAnalytics'
import Partenariats from './pages/Partenariats'
import ExpositionDigitale from './pages/ExpositionDigitale'

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

// ─── Application principale ───────────────────────────────────────────────────
function App() {
  useEffect(() => {
    import('react-ga4').then(({ default: ReactGA }) => {
      ReactGA.initialize('G-YV45FLXNXB')
    })
  }, [])

  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        <Route path="/"                    element={<MainSite />} />
        <Route path="/inscription"         element={<InscriptionPage />} />
        <Route path="/partenariats"        element={<Partenariats />} />
        <Route path="/exposition-digitale" element={<ExpositionDigitale />} />
        <Route path="/admin"               element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App