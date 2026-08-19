import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Section = ({ titre, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a1128', marginBottom: 10 }}>{titre}</h2>
    <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.8 }}>{children}</div>
  </div>
)

const AProof = ({ children }) => <mark style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{children}</mark>

export default function MentionsLegales() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Mentions légales — COPAF 2026"
        description="Mentions légales du site COPAF 2026, Conférence des Ports Africains."
        canonical="https://copaf-ports.com/mentions-legales"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 80px' }}>
        <span style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 50,
          background: 'rgba(0, 115, 244, 0.1)', fontSize: 12, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase', color: BLUE, marginBottom: 16,
        }}>
          COPAF 2026
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', margin: '0 0 36px', letterSpacing: '-0.02em' }}>
          Mentions légales
        </h1>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '16px 20px', marginBottom: 36, fontSize: 13.5, color: '#92400e', lineHeight: 1.7 }}>
          L'adresse de l'hébergeur ci-dessous est <strong>à vérifier</strong> par l'organisation avant publication officielle — c'est celle que je connais pour Hostinger, mais elle peut avoir changé.
        </div>

        <Section titre="Éditeur du site">
          Le site COPAF 2026 (copaf-ports.com) est édité par CRF Perfection, SARL Unipersonnelle,
          dont le siège social est situé à Cotonou, Carré 1735, Akogbato, Bénin.
          <br /><br />
          Numéro de téléphone : +229 0169 30 30 19<br />
          Email : contact@copaf-ports.com<br />
          Numéro d'immatriculation : RCCM RB/COT/15-B-13727 — IFU 87015034851
        </Section>

        <Section titre="Directeur de la publication">
          M. TCHOBO Rénato
        </Section>

        <Section titre="Hébergement">
          Ce site est hébergé par Hostinger International Ltd.<br />
          <AProof>61 Lordou Vironos Street, 6023 Larnaca, Chypre</AProof><br />
          <a href="https://www.hostinger.com" target="_blank" rel="noopener noreferrer" style={{ color: NAVY }}>www.hostinger.com</a>
        </Section>

        <Section titre="Propriété intellectuelle">
          L'ensemble des contenus présents sur ce site (textes, logos, visuels, programme, marque COPAF) est la propriété de CRF Perfection et de ses partenaires organisateurs (AGPAOC, ANP), sauf mention contraire. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable est interdite.
        </Section>

        <Section titre="Organisateurs">
          La Conférence des Ports Africains (COPAF) 2026 est organisée par CRF Perfection, en partenariat avec l'AGPAOC et l'Agence Nationale des Ports (ANP) du Maroc.
        </Section>

        <Section titre="Contact">
          Pour toute question relative à ces mentions légales : contact@copaf-ports.com
        </Section>

        <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 40 }}>
          Voir également notre <a href="/politique-confidentialite" style={{ color: BLUE, fontWeight: 700 }}>politique de confidentialité</a>.
        </p>
      </div>

      <Footer />
    </div>
  )
}
