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
import useTracker from './useTracker'
import Partenariats from './pages/Partenariats'
import ExpositionDigitale from './pages/ExpositionDigitale'

const MainSite = () => {
  useTracker()
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
    import('react-ga4').then(({ default: ReactGA }) => {
      ReactGA.initialize('G-YV45FLXNXB')
      ReactGA.send('pageview')
    })
  }, [])

  return (
    <Router>
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