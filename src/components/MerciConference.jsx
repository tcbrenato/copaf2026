import { useLang } from '../i18n/useLang'

const SKY = '#1798F4'
const LIGHT = '#A9C8F0'
const PORTS = [
  { img: '/merci/npa.png', alt: 'Nigerian Ports Authority' },
  { img: '/merci/slpha.png', alt: 'Sierra Leone Ports and Harbours Authority' },
  { img: '/merci/lome.png', alt: 'Port Autonome de Lomé' },
  { img: '/merci/abidjan.png', alt: 'Port Autonome d’Abidjan' },
  { img: '/merci/pasp.png', alt: 'Port Autonome de San-Pédro' },
]

const TR = {
  fr: {
    eyebrow: 'CONFÉRENCE DES PORTS AFRICAINS · COPAF 2026', a: 'MERCI', b: 'À TOUS',
    dest: 'Chers participants, chers intervenants, chers partenaires,',
    paras: [
      'Du 19 au 21 octobre 2026, Casablanca a réuni les autorités portuaires africaines autour d’un thème qui engage l’avenir de nos ports : le Smart Port africain, avec l’IA et la cybersécurité au service de la performance.',
      'Je tiens à vous remercier chaleureusement. Votre présence, la qualité de vos échanges et votre engagement ont donné tout son sens à ces trois jours. Merci aux autorités portuaires venues du Nigeria, de la Sierra Leone, du Togo et de la Côte d’Ivoire, à l’AGPAOC, à nos intervenants, et à toute l’équipe qui a rendu cette conférence possible.',
      'Les échanges ne s’arrêtent pas ici. Gardons le lien, partageons nos avancées et construisons ensemble les ports africains de demain.',
    ],
    clo: 'Avec toute ma reconnaissance,', nom: 'Dr William ODAH', t1: 'Directeur Général, CRF Perfection', t2: 'Directeur du Comité d’Organisation de la COPAF',
    lieu: 'Casablanca, Maroc · 19 – 21 octobre 2026', ports: 'Ports participants', pays: ['Nigeria', 'Sierra Leone', 'Togo', 'Côte d’Ivoire', 'Côte d’Ivoire'],
    dl: 'Télécharger la lettre (PDF)', dlAutre: 'English version (PDF)', urlDl: '/lettre-remerciement-copaf2026-fr.pdf', urlAutre: '/lettre-remerciement-copaf2026-en.pdf',
  },
  en: {
    eyebrow: 'AFRICAN PORTS CONFERENCE · COPAF 2026', a: 'THANK YOU', b: 'ALL',
    dest: 'Dear participants, speakers and partners,',
    paras: [
      'From 19 to 21 October 2026, Casablanca brought together African port authorities around a theme that shapes the future of our ports: the African Smart Port, with AI and cybersecurity driving performance.',
      'I would like to thank you warmly. Your presence, the quality of your exchanges and your commitment gave these three days their full meaning. Thank you to the port authorities who came from Nigeria, Sierra Leone, Togo and Côte d’Ivoire, to AGPAOC, to our speakers, and to the whole team who made this conference possible.',
      'The conversation does not stop here. Let us stay connected, share our progress and build together the African ports of tomorrow.',
    ],
    clo: 'With all my gratitude,', nom: 'Dr William ODAH', t1: 'Director General, CRF Perfection', t2: 'Director of the COPAF Organising Committee',
    lieu: 'Casablanca, Morocco · 19 – 21 October 2026', ports: 'Participating ports', pays: ['Nigeria', 'Sierra Leone', 'Togo', 'Côte d’Ivoire', 'Côte d’Ivoire'],
    dl: 'Download the letter (PDF)', dlAutre: 'Version française (PDF)', urlDl: '/lettre-remerciement-copaf2026-en.pdf', urlAutre: '/lettre-remerciement-copaf2026-fr.pdf',
  },
}

// Lettre de remerciement du DG apres la conference : placee juste sous le hero de la page d'accueil.
export default function MerciConference() {
  const lang = useLang()
  const t = TR[lang === 'en' ? 'en' : 'fr']
  const nb = s => (lang === 'en' ? s : s.replace(/ ([;:?!»])/g, ' $1').replace(/«/g, '« '))

  return (
    <section id="merci" aria-labelledby="merci-titre" style={{ position: 'relative', overflow: 'hidden', color: '#fff', textAlign: 'center', background: 'url(/merci/fond.jpg) center/cover, #001E4E', fontFamily: "'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @font-face{font-family:'Poppins';font-weight:400;font-display:swap;src:url(/fonts/Poppins-Regular.ttf) format('truetype')}
        @font-face{font-family:'Poppins';font-weight:500;font-display:swap;src:url(/fonts/Poppins-Medium.ttf) format('truetype')}
        @font-face{font-family:'Poppins';font-weight:700;font-display:swap;src:url(/fonts/Poppins-Bold.ttf) format('truetype')}
        .merci-carte p{margin:0 0 16px}
        .merci-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 24px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;transition:transform .15s ease,box-shadow .15s ease}
        .merci-btn:hover{transform:translateY(-2px)}
        .merci-port{display:flex;flex-direction:column;align-items:center;gap:6px}
      `}</style>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,67,152,.5) 0%, rgba(0,53,126,.3) 40%, rgba(0,21,57,.88) 100%)' }} />

      <div style={{ position: 'relative', maxWidth: 920, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <img src="/merci/crf.png" alt="CRF Perfection" width="96" height="58" style={{ height: 'clamp(42px, 8vw, 58px)', width: 'auto' }} />
          <img src="/merci/copaf-blanc.png" alt="COPAF" width="200" height="75" style={{ height: 'clamp(36px, 7vw, 54px)', width: 'auto' }} />
          <img src="/merci/agpaoc.png" alt="AGPAOC" width="96" height="58" style={{ height: 'clamp(42px, 8vw, 58px)', width: 'auto' }} />
        </div>

        <div style={{ marginTop: 'clamp(24px, 4vw, 40px)', fontWeight: 700, fontSize: 12, letterSpacing: '.2em', color: LIGHT }}>{t.eyebrow}</div>
        <h2 id="merci-titre" style={{ margin: '10px 0 0', fontWeight: 700, fontSize: 'clamp(32px, 6vw, 54px)', lineHeight: 1.1, color: '#fff' }}>
          {t.a} <span style={{ color: SKY }}>{t.b}</span>
        </h2>
        <div aria-hidden="true" style={{ width: 70, height: 4, background: SKY, borderRadius: 3, margin: '18px auto 28px' }} />

        <div className="merci-carte" style={{ background: '#fff', color: '#1E293B', borderRadius: 20, borderTop: `5px solid ${SKY}`, padding: 'clamp(22px, 4vw, 44px) clamp(18px, 4.5vw, 50px)', textAlign: 'left', boxShadow: '0 12px 40px rgba(0,15,50,.45)' }}>
          <p style={{ fontWeight: 700, fontSize: 'clamp(15px, 2.2vw, 18px)', color: '#00357E', marginBottom: 20 }}>{t.dest}</p>
          {t.paras.map((p, i) => <p key={i} style={{ fontSize: 'clamp(14px, 1.9vw, 16px)', lineHeight: 1.8 }}>{nb(p)}</p>)}
          <p style={{ marginTop: 26, fontSize: 'clamp(14px, 1.9vw, 16px)', color: '#334155' }}>{t.clo}</p>
          <div style={{ paddingTop: 14, borderTop: '1px solid #D5DEEB' }}>
            <div style={{ fontWeight: 700, fontSize: 'clamp(16px, 2.4vw, 20px)', color: '#00357E' }}>{t.nom}</div>
            <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>{t.t1}<br />{t.t2}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
          <a className="merci-btn" href={t.urlDl} target="_blank" rel="noopener noreferrer" download style={{ background: `linear-gradient(135deg, ${SKY}, #0A5BB5)`, color: '#fff', boxShadow: '0 6px 20px rgba(23,152,244,.4)' }}>{t.dl}</a>
          <a className="merci-btn" href={t.urlAutre} target="_blank" rel="noopener noreferrer" download style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(169,200,240,.5)' }}>{t.dlAutre}</a>
        </div>

        <div style={{ marginTop: 34, fontSize: 13, color: LIGHT }}>{t.lieu}</div>
        <div style={{ marginTop: 18, fontWeight: 700, fontSize: 14 }}>{t.ports}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap', marginTop: 14 }}>
          {PORTS.map((p, i) => (
            <div className="merci-port" key={i}>
              <img src={p.img} alt={p.alt} loading="lazy" width="120" height="75" style={{ height: 'clamp(52px, 9vw, 72px)', width: 'auto' }} />
              <span style={{ fontSize: 11.5, color: LIGHT }}>{t.pays[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
