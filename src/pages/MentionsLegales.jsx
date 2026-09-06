import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Section = ({ titre, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a1128', marginBottom: 12, letterSpacing: '-0.01em' }}>{titre}</h2>
    <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: '10px' }}>{children}</div>
  </div>
)

export default function MentionsLegales() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Mentions Légales — COPAF 2026"
        description="Mentions légales et informations officielles du site COPAF 2026, Conférence des Ports Africains."
        canonical="https://copaf-ports.com/mentions-legales"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', margin: '0 0 12px', letterSpacing: '-0.02em', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Informations Légales</span>
          <span style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: BLUE }}>Mentions Légales</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 40, borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          Conformément aux dispositions des lois en vigueur sur la confiance dans l'économie numérique et la protection des données.
        </p>

        <Section titre="1. Éditeur du site">
          <p>
            Le site officiel de la <strong>Conférence des Ports Africains (COPAF 2026)</strong>, accessible à l'adresse <code>https://copaf-ports.com</code>, est édité et administré par la société <strong>CRF Perfection</strong>.
          </p>
          <div style={{ background: '#edf2f7', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${BLUE}`, marginTop: '8px' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#0a1128' }}>Coordonnées de l'entreprise :</p>
            <p style={{ margin: '6px 0 0 0' }}>• <strong>Forme juridique :</strong> SARL Unipersonnelle</p>
            <p style={{ margin: '4px 0 0 0' }}>• <strong>Siège social :</strong> Cotonou, Carré 1735, Akogbato, Bénin</p>
            <p style={{ margin: '4px 0 0 0' }}>• <strong>Téléphone / WhatsApp :</strong> +229 01 69 30 30 19</p>
            <p style={{ margin: '4px 0 0 0' }}>• <strong>Courrier électronique :</strong> <a href="mailto:contact@copaf-ports.com" style={{ color: BLUE, textDecoration: 'none' }}>contact@copaf-ports.com</a></p>
            <p style={{ margin: '4px 0 0 0' }}>• <strong>Immatriculation :</strong> RCCM RB/COT/15-B-13727 — IFU 87015034851</p>
          </div>
        </Section>

        <Section titre="2. Direction de la publication">
          <p>
            <strong>Directeur de la publication :</strong> Direction Générale de CRF Perfection.
          </p>
          <p>
            Pour toute réclamation, notification de contenu ou demande d'information concernant les publications sur ce site, veuillez nous contacter par e-mail à <a href="mailto:contact@copaf-ports.com" style={{ color: BLUE, textDecoration: 'none' }}>contact@copaf-ports.com</a>.
          </p>
        </Section>

        <Section titre="3. Hébergement technique">
          <p>
            L'infrastructure et l'hébergement du site sont assurés par la société :
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Hostinger International Ltd.</strong><br />
            61 Lordou Vironos Street, 6023 Larnaca, Chypre<br />
            Site web : <a href="https://www.hostinger.com" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: 'none' }}>www.hostinger.com</a>
          </p>
        </Section>

        <Section titre="4. Propriété intellectuelle et contrefaçon">
          <p>
            L'ensemble des éléments graphiques, textuels, photographiques, bases de données, programmes informatiques, logotypes et marques (notamment la marque <strong>COPAF</strong> et les visuels institutionnels) affichés sur ce site sont la propriété exclusive de <strong>CRF Perfection</strong> et de ses partenaires institutionnels (AGPAOC, ANP), sauf mention contraire explicite.
          </p>
          <p>
            Toute reproduction, représentation, modification, diffusion ou exploitation totale ou partielle de ces contenus, par quelque procédé que ce soit, sans l'autorisation écrite préalable et expresse des ayants droit, est strictement interdite et constitue une infraction passible de poursuites.
          </p>
        </Section>

        <Section titre="5. Cadre institutionnel et organisateurs">
          <p>
            La <strong>Conférence des Ports Africains (COPAF 2026)</strong> est un événement d'envergure internationale organisé par <strong>CRF Perfection</strong>, sous l'égide conjointe de l'<strong>AGPAOC</strong> (Association de Gestion des Ports de l'Afrique de l'Ouest et du Centre) et de l'<strong>UAPNA / ANP</strong> (Union des Administrations Portuaires du Nord de l'Afrique / Agence Nationale des Ports du Maroc).
          </p>
        </Section>

        <Section titre="6. Limitation de responsabilité">
          <p>
            L'équipe organisatrice s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, elle ne saurait être tenue pour responsable des erreurs, omissions, d'une indisponibilité temporaire des services ou des éventuels dommages directs ou indirects liés à l'utilisation des contenus de la plateforme.
          </p>
        </Section>

        <Section titre="7. Contact et réclamations">
          <p>
            Pour toute question relative aux présentes mentions légales ou pour notifier un contenu litigieux, vous pouvez nous joindre à l'adresse suivante : <a href="mailto:contact@copaf-ports.com" style={{ color: BLUE, textDecoration: 'none' }}>contact@copaf-ports.com</a>.
          </p>
        </Section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '15px' }}>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Consultez également notre <a href="/politique-confidentialite" style={{ color: BLUE, fontWeight: 700, textDecoration: 'none' }}>politique de confidentialité</a>.
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ fontSize: '13px', color: BLUE, fontWeight: 600, textDecoration: 'none' }}>
            ↑ Remonter en haut
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}