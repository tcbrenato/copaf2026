import Navbar from './Navbar'
import FlashInfoTicker from './FlashInfoTicker'

// Regroupe le Navbar et le bandeau flash infos dans un seul conteneur fixe.
// Le Navbar lui-même n'est plus en position:fixed (voir Navbar.jsx) — c'est
// ce conteneur qui gère la fixation en haut de l'écran pour les deux blocs.
const HeaderStack = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
    <Navbar />
    <FlashInfoTicker />
  </div>
)

export default HeaderStack