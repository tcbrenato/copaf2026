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

const rowStyle = { display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #eef2f7' }
const Outil = ({ nom, finalite, duree }) => (
  <div style={rowStyle}>
    <div style={{ width: 170, flexShrink: 0, fontWeight: 700, color: '#0a1128', fontSize: 13.5 }}>{nom}</div>
    <div style={{ flex: 1, fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>{finalite}</div>
    <div style={{ width: 130, flexShrink: 0, fontSize: 12.5, color: '#94a3b8', textAlign: 'right' }}>{duree}</div>
  </div>
)

export default function PolitiqueConfidentialite() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Politique de confidentialité — COPAF 2026"
        description="Politique de confidentialité et de gestion des cookies du site COPAF 2026, Conférence des Ports Africains."
        canonical="https://copaf-ports.com/politique-confidentialite"
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
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Politique de confidentialité
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 36 }}>Dernière mise à jour : 17 août 2026</p>

        <Section titre="1. Données que nous collectons">
          Lorsque vous remplissez un formulaire sur ce site (inscription, sponsoring, exposition, diagnostic Smart Port), nous collectons les informations que vous saisissez vous-même : nom, prénom, email, téléphone, organisation, pays, et selon le formulaire, les réponses fournies (ex. scores du diagnostic).
          Ces données sont stockées de façon sécurisée sur nos serveurs (Supabase) et ne sont utilisées que pour traiter votre demande, vous recontacter, et générer les documents liés à votre inscription (facture, badge).
        </Section>

        <Section titre="2. Cookies et outils de mesure d'audience">
          En navigant sur ce site, plusieurs outils tiers ou internes peuvent déposer des cookies ou traceurs sur votre appareil, pour mesurer la fréquentation et améliorer nos campagnes :
          <div style={{ marginTop: 16, marginBottom: 4 }}>
            <Outil nom="Google Analytics 4" finalite="Statistiques de fréquentation anonymisées (pages visitées, provenance, durée de visite)." duree="jusqu'à 14 mois" />
            <Outil nom="Mesure interne (Supabase)" finalite="Suivi technique des sessions et des pages consultées, pour nos propres statistiques (indépendant de Google)." duree="durée du projet" />
            <Outil nom="LinkedIn Insight Tag" finalite="Mesure des conversions issues de nos publications et campagnes LinkedIn." duree="selon LinkedIn" />
            <Outil nom="Meta Pixel" finalite="Mesure des conversions issues de nos publications et campagnes Facebook/Instagram." duree="selon Meta" />
          </div>
          Vous pouvez à tout moment bloquer ces cookies depuis les paramètres de votre navigateur ; le site reste utilisable sans eux, à l'exception des statistiques qui ne seront alors plus enregistrées pour votre visite.
        </Section>

        <Section titre="3. Autres services utilisés">
          <strong>EmailJS</strong> : utilisé pour vous envoyer les emails de confirmation liés à votre inscription.<br />
          <strong>Google Sheets (Apps Script)</strong> : certaines données de formulaire sont également synchronisées vers un tableur interne, à usage exclusif de l'équipe organisatrice.
        </Section>

        <Section titre="4. Vos droits">
          Conformément à la réglementation applicable en matière de protection des données personnelles, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez-nous à contact@copaf-ports.com ou par WhatsApp au +229 0169 30 30 19.
        </Section>

        <Section titre="5. Conservation des données">
          Les données d'inscription sont conservées pendant la durée nécessaire à l'organisation de la conférence et à nos obligations comptables, puis archivées ou supprimées.
        </Section>

        <Section titre="6. Sécurité">
          Vos données sont hébergées sur une infrastructure sécurisée (Supabase), avec un accès restreint aux seules personnes de l'équipe organisatrice qui en ont besoin pour traiter votre dossier.
        </Section>

        <Section titre="Contact">
          Pour toute question sur cette politique : contact@copaf-ports.com
        </Section>

        <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 40 }}>
          Voir également nos <a href="/mentions-legales" style={{ color: BLUE, fontWeight: 700 }}>mentions légales</a>.
        </p>
      </div>

      <Footer />
    </div>
  )
}
