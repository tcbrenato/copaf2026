import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Programme from './components/Programme'
import Modules from './components/Modules'
import Inscription from './components/Inscription'
import Footer from './components/Footer'

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Programme />
        <Modules />
        <Inscription />
        <Footer />
      </main>
    </Router>
  )
}

export default App