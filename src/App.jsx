import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ReactGA from 'react-ga4'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Programme from './components/Programme'
import Modules from './components/Modules'
import Inscription from './components/Inscription'
import Footer from './components/Footer'
import AdminDashboard from './components/AdminDashboard'
import Partners from './components/Partners'
import useTracker from './useTracker'
import Sponsors from './pages/Sponsors'
import Exposants from './pages/Exposants'

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
        <Inscription />
        <Footer />
      </main>
    </>
  )
}

function App() {
  useEffect(() => {
    ReactGA.initialize('G-YV45FLXNXB')
    ReactGA.send('pageview')
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/exposants" element={<Exposants />} />
      </Routes>
    </Router>
  )
}

export default App