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
import useTracker from './useTracker' // Votre hook personnalisé
import Partenariats from './pages/Partenariats'
import ExpositionDigitale from './pages/ExpositionDigitale'

// Composant de tracking automatique
const AnalyticsTracker = () => {
  useTracker() // Active le tracking sur chaque changement d'URL
  return null // Ce composant n'affiche rien visuellement
}

const MainSite = () => {
  return (
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
}

function App() {
  useEffect(() => {
    // Initialisation globale de Google Analytics
    import('react-ga4').then(({ default: ReactGA }) => {
      ReactGA.initialize('G-YV45FLXNXB')
    })
  }, [])

  return (
    <Router>
      {/* On place le tracker ici : il a accès au contexte du Router */}
      <AnalyticsTracker />
      
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/partenariats" element={<Partenariats />} />
        <Route path="/exposition-digitale" element={<ExpositionDigitale />} />
      </Routes>
    </Router>
  )
}

export default App