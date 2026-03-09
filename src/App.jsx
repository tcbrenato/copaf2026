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
import Admin from './components/Admin'

function App() {
  useEffect(() => {
    ReactGA.initialize('G-XXXXXXXXXX')
    ReactGA.send('pageview')
  }, [])

  return (
    <Router>
      <Routes>

        {/* Page principale */}
        <Route path="/" element={
          <>
            <Navbar />
            <main>
              <Hero />
              <About />
              <Programme />
              <Modules />
              <Inscription />
              <Footer />
            </main>
          </>
        } />

        {/* Dashboard Admin */}
        <Route path="/admin" element={<Admin />} />

      </Routes>
    </Router>
  )
}

export default App