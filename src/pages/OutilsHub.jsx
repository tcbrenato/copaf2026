// Page interne (pas de login) qui regroupe les outils "live" a utiliser
// pendant la conference (vote, diagnostic, projection, tablette, tirage),
// pour que l'ordinateur de presentation n'ait jamais besoin d'ouvrir /admin.
// Le tirage reste protege par un mot de passe operateur (TirageGate), car
// contrairement aux autres il permet de modifier des donnees (la liste).

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Ico = ({ name, size = 26, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    radar:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>,
    poll:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    monitor:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
    tablet:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    gift:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="14" rx="1"/><path d="M12 8v14M2 12h20"/><path d="M12 8c-1.5-4-6-4-6-1.5S9 8 12 8c3 0 6-1 6-3.5S13.5 4 12 8z"/></svg>,
    globe:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  }
  return icons[name] || null
}

const TUILES = [
  { titre: 'Diagnostic Smart Port', sousTitre: 'Auto-évaluation - à faire remplir par les participants', href: '/diagnostic', icone: 'radar', accent: true },
  { titre: 'Sondage - vote public', sousTitre: 'Page à faire scanner par la salle pour voter', href: '/vote', icone: 'poll', accent: true },
  { titre: 'Sondage - choisir / projeter', sousTitre: 'Poste opérateur : sélectionner le sondage actif et projeter ses résultats', href: '/sondage-live', icone: 'monitor' },
  { titre: 'Diagnostic - écran de projection', sousTitre: 'Vue collective en direct (moyennes uniquement, jamais de nom)', href: '/diagnostic/projection', icone: 'radar' },
  { titre: 'Menu tablette', sousTitre: 'Écran d\'accueil pour les tablettes prêtées aux participants', href: '/tablette', icone: 'tablet' },
  { titre: 'Tirage au sort', sousTitre: 'Roue des participants - mot de passe opérateur requis', href: '/tirage', icone: 'gift' },
]

export default function OutilsHub() {
  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 20px', color: '#f8fafc' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -2, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.75) saturate(1.2)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.55) 0%, rgba(9,13,22,0.78) 70%)' }

  return (
    <div style={wrap}>
      <div style={bgImage} />
      <div style={bgOverlay} />

      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
            COPAF 2026 · POSTE OPÉRATEUR
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Outils live de la conférence
          </div>
          <p style={{ fontSize: 14.5, color: '#94a3b8' }}>
            Aucune connexion requise — rien ici ne montre de donnée sensible (paiements, participants, revenus).
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
        }}>
          {TUILES.map(t => (
            <a
              key={t.href}
              href={t.href}
              style={{
                display: 'flex', flexDirection: 'column', gap: 14, padding: '26px 22px',
                borderRadius: 20, textDecoration: 'none', cursor: 'pointer',
                background: t.accent ? 'linear-gradient(135deg, rgba(0,115,244,0.22), rgba(0,14,145,0.35))' : 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(12px)',
                border: t.accent ? '1px solid rgba(0,115,244,0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: t.accent ? '0 10px 30px rgba(0,115,244,0.25)' : '0 10px 30px rgba(0,0,0,0.5)',
                minHeight: 150,
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: t.accent ? 'linear-gradient(135deg,#0073F4,#000E91)' : 'rgba(96,165,250,0.15)',
                border: t.accent ? 'none' : '1px solid rgba(96,165,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ico name={t.icone} size={26} color={t.accent ? '#fff' : '#60a5fa'} />
              </div>
              <div>
                <div style={{ fontSize: 16.5, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.titre}</div>
                <div style={{ fontSize: 12.5, color: t.accent ? 'rgba(255,255,255,0.8)' : '#94a3b8', lineHeight: 1.4 }}>{t.sousTitre}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#94a3b8', textDecoration: 'none' }}>
            <Ico name="globe" size={13} color="#94a3b8" /> copaf-ports.com/outils
          </a>
        </div>
      </div>
    </div>
  )
}
