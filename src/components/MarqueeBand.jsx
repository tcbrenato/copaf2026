// Double bandeau defilant en diagonale, sens opposes (gauche / droite) —
// place juste apres le Hero pour un effet dynamique immediat. Chaque ligne
// a son propre contenu, duplique plusieurs fois dans une piste plus large
// que l'ecran ; l'anim ne fait que translater cette piste de -50% (le
// doublon exact prend le relais sans coupure visible).

const LIGNE_1 = ['COPAF 2026 — CASABLANCA', 'CONFÉRENCE DES PORTS AFRICAINS', '15–17 SEPTEMBRE 2026']
const LIGNE_2 = ['SMART PORT & IA', 'CYBERSÉCURITÉ PORTUAIRE', 'INSCRIPTIONS OUVERTES']
const REPEAT = 4

function Band({ background, direction, skew, phrases }) {
  const track = Array.from({ length: REPEAT }).flatMap(() => phrases)
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', background,
      transform: `skewY(${skew}deg)`, boxShadow: '0 8px 24px rgba(0,14,145,0.25)',
      padding: 'clamp(14px, 2.2vw, 22px) 0',
    }}>
      {/* Pas de contre-inclinaison ici : le texte doit suivre l'inclinaison
          du bandeau (comme sur la reference), pas rester horizontal. */}
      <div
        className={`copaf-marquee-track ${direction === 'right' ? 'copaf-marquee-reverse' : ''}`}
        style={{ display: 'flex', alignItems: 'center', width: 'max-content' }}
        aria-hidden="true"
      >
        {[...track, ...track].map((phrase, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 'clamp(14px, 2vw, 22px)',
            flexShrink: 0, paddingRight: 'clamp(14px, 2vw, 22px)',
            fontSize: 'clamp(20px, 3.6vw, 40px)', fontWeight: 900, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(18px, 2.8vw, 28px)' }}>✦</span>
            {phrase}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MarqueeBand() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(10px, 2vw, 18px) 0', background: '#050B3D' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.2vw, 12px)' }}>
        <Band background="linear-gradient(90deg, #000E91, #0073F4)" direction="left" skew={-7} phrases={LIGNE_1} />
        <Band background="linear-gradient(90deg, #0073F4, #000E91)" direction="right" skew={-7} phrases={LIGNE_2} />
      </div>

      <style>{`
        .copaf-marquee-track {
          animation: copaf-marquee-scroll 55s linear infinite;
          will-change: transform;
        }
        .copaf-marquee-reverse {
          animation-direction: reverse;
        }
        @keyframes copaf-marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (max-width: 640px) {
          .copaf-marquee-track { animation-duration: 34s; }
        }
        @media (prefers-reduced-motion: reduce) {
          .copaf-marquee-track { animation: none; }
        }
      `}</style>
    </div>
  )
}
