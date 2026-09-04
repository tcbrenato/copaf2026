import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Ico = ({ name, size = 22, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    file: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  }
  return icons[name] || null
}

const DOCUMENTS = [
  { titre: 'Programme officiel', langue: 'Français', desc: 'Le déroulé complet des 3 jours de conférence, session par session.', href: '/programmecopaf2026FRmaj.pdf' },
  { titre: 'Official Programme', langue: 'English', desc: 'The full 3-day conference schedule, session by session.', href: '/ProgrammcopafENG.pdf' },
  { titre: 'Brochure de présentation', langue: 'Français', desc: "Présentation générale de la conférence, ses thématiques et ses partenaires.", href: '/Brochurecopaf2026FR.pdf' },
  { titre: 'Presentation Brochure', langue: 'English', desc: 'General overview of the conference, its themes and partners.', href: '/copafbrochureEN.pdf' },
]

function DocCard({ doc }) {
  const disponible = !!doc.href
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 18, padding: '22px 24px',
      border: '1px solid rgba(0, 115, 244, 0.08)', boxShadow: '0 10px 30px -5px rgba(0, 14, 145, 0.05)',
      opacity: disponible ? 1 : 0.65,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: disponible ? 'linear-gradient(135deg,#0073F4,#000E91)' : '#e2e8f0',
      }}>
        <Ico name={disponible ? 'file' : 'clock'} size={22} color={disponible ? '#fff' : '#94a3b8'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0a1128' }}>{doc.titre}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: 'rgba(0,115,244,0.1)', color: BLUE, textTransform: 'uppercase', letterSpacing: 0.4 }}>{doc.langue}</span>
        </div>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{doc.desc}</p>
      </div>
      {disponible ? (
        <a href={doc.href} download target="_blank" rel="noopener noreferrer" style={{
          flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 10,
          background: '#EBF3FF', color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: 'none',
        }}>
          <Ico name="download" size={15} color={NAVY} />
          Télécharger
        </a>
      ) : (
        <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: '#94a3b8' }}>À venir</span>
      )}
    </div>
  )
}

export default function Documentation() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Documentation — COPAF 2026"
        description="Téléchargez le programme, la brochure et les documents logistiques de la COPAF 2026, Conférence des Ports Africains."
        canonical="https://copaf-ports.com/documentation"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 50,
            background: 'rgba(0, 115, 244, 0.1)', fontSize: 12, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: BLUE, marginBottom: 16,
          }}>
            COPAF 2026
          </span>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 900, color: '#0a1128', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Documentation
          </h1>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            Tous les documents officiels de la conférence, en français et en anglais.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {DOCUMENTS.map(doc => <DocCard key={doc.titre} doc={doc} />)}
          <DocCard doc={{ titre: 'Guide logistique', langue: 'FR / EN', desc: 'Informations pratiques : lieu, hébergement, transport, visa.', href: null }} />
        </div>
      </div>

      <Footer />
    </div>
  )
}
