import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Programme from './components/Programme'
import Modules from './components/Modules'
import Inscription from './components/Inscription'
import Footer from './components/Footer'
import AdminDashboard from './components/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>

        {/* Site principal */}
        <Route path="/" element={
          <>
            <Navbar />
            <main>
              <Hero />
              <About />
              <Programme />
              <Modules />
              <Inscription />
            </main>
            <Footer />
          </>
        } />

        {/* Page admin — accessible sur /admin */}
        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>
    </Router>
  )
}

export default App