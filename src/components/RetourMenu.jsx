// Bouton flottant "Retour au menu" — a placer en tout premier enfant du
// conteneur de chaque page outil (Diagnostic, Sondage) qui n'a pas de
// barre de navigation du site. Ramene vers le hub tablette /tablette.
export default function RetourMenu() {
  return (
    <a
      href="/tablette"
      style={{
        position: 'fixed', top: 16, left: 16, zIndex: 50,
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 16px', borderRadius: 100, textDecoration: 'none',
        background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12.5, fontWeight: 700,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Menu
    </a>
  )
}