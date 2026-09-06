import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Section = ({ titre, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a1128', marginBottom: 12, letterSpacing: '-0.01em' }}>{titre}</h2>
    <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>
  </div>
)

const rowStyle = { display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #eef2f7', alignItems: 'center' }
const Outil = ({ nom, finalite, duree }) => (
  <div style={rowStyle}>
    <div style={{ width: 180, flexShrink: 0, fontWeight: 700, color: '#0a1128', fontSize: 13.5 }}>{nom}</div>
    <div style={{ flex: 1, fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>{finalite}</div>
    <div style={{ width: 130, flexShrink: 0, fontSize: 12.5, color: '#94a3b8', textAlign: 'right' }}>{duree}</div>
  </div>
)

export default function PolitiqueConfidentialite() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title="Politique de Confidentialité et Protection des Données - COPAF 2026"
        description="Politique officielle de protection des données personnelles, conformité RGPD et gestion des cookies du site COPAF 2026, Conférence des Ports Africains."
        canonical="https://copaf-ports.com/politique-confidentialite"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', margin: '0 0 12px', letterSpacing: '-0.02em', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Conformité & Transparence</span>
          <span style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: BLUE }}>Politique de Confidentialité</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 40, borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          Dernière mise à jour : 17 août 2026 - Conforme aux standards internationaux de protection des données (RGPD et lois en vigueur).
        </p>

        <Section titre="1. Préambule et Responsable du Traitement">
          <p>
            La présente Politique de confidentialité s'applique au site web officiel de la <strong>Conférence des Ports Africains (COPAF 2026)</strong>, accessible à l'adresse <code>https://copaf-ports.com</code>. 
            Nous accordons une importance majeure à la protection de la vie privée et des données à caractère personnel de nos congressistes, partenaires, exposants et visiteurs.
          </p>
          <p>
            Le responsable de la collecte et du traitement des données est l'équipe organisationnelle conjointe de la COPAF 2026 et de <strong>CRF Perfection</strong>, basée à Cotonou, Bénin.
          </p>
        </Section>

        <Section titre="2. Données personnelles collectées">
          <p>
            Nous collectons uniquement les informations strictement nécessaires à l'organisation de l'événement, à la gestion logistique et aux communications institutionnelles. Les données recueillies incluent :
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Données d'identification :</strong> Nom, prénom, civilité.</li>
            <li><strong>Données de contact :</strong> Adresse e-mail professionnelle ou personnelle, numéro de téléphone (avec indicateur WhatsApp).</li>
            <li><strong>Données professionnelles :</strong> Intitulé du poste, nom de l'organisation/autorité portuaire, pays de résidence.</li>
            <li><strong>Données spécifiques aux formulaires :</strong> Choix d'inscription, formules de sponsoring, réservations d'espaces d'exposition, ou réponses aux outils interactifs (ex. scores et métriques du diagnostic Smart Port).</li>
          </ul>
          <p>
            Ces données sont transmises directement par vos soins lors de la validation de nos formulaires en ligne.
          </p>
        </Section>

        <Section titre="3. Finalités des traitements et bases légales">
          <p>
            Les informations recueillies font l'objet d'un traitement informatique automatisé fondé sur l'exécution des mesures précontractuelles ou contractuelles liées à votre participation (article 6.1.b du RGPD) ainsi que sur notre intérêt légitime à promouvoir l'événement portuaire :
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Traitement et validation des dossiers d'inscription et de participation aux assises.</li>
            <li>Génération automatisée des documents justificatifs (factures pro forma, reçus, badges officiels d'accès).</li>
            <li>Communication logistique, mises à jour du programme, et envoi d'informations pratiques relatives à la conférence.</li>
            <li>Suivi des partenariats et des opportunités d'exposition commerciale.</li>
          </ul>
        </Section>

        <Section titre="4. Cookies, traceurs et outils de mesure d'audience">
          <p>
            Notre site utilise des traceurs (cookies) pour optimiser l'expérience utilisateur, analyser le trafic global et évaluer la performance de nos campagnes d'information. Vous disposez d'un contrôle total sur ces traceurs.
          </p>
          <div style={{ marginTop: 12, marginBottom: 8, overflowX: 'auto' }}>
            <Outil nom="Google Analytics 4" finalite="Statistiques de fréquentation anonymisées (pages consultées, parcours de navigation, origine géographique globale)." duree="Jusqu'à 14 mois" />
            <Outil nom="Mesure interne (Supabase)" finalite="Suivi technique sécurisé des sessions et intégrité des requêtes de formulaires." duree="Durée de la session / projet" />
            <Outil nom="LinkedIn Insight Tag" finalite="Mesure de l'efficacité et des conversions issues de nos actions de communication professionnelles sur LinkedIn." duree="Selon les standards LinkedIn" />
            <Outil nom="Meta Pixel" finalite="Mesure de l'audience et des conversions publicitaires provenant des réseaux sociaux Meta (Facebook, Instagram)." duree="Selon les standards Meta" />
          </div>
          <p style={{ fontSize: '13.5px', color: '#475569', fontStyle: 'italic' }}>
            Vous pouvez paramétrer votre navigateur à tout moment pour refuser l'installation de ces cookies. Le site reste entièrement consultable, seules les statistiques d'audience de votre session ne seront pas comptabilisées.
          </p>
        </Section>

        <Section titre="5. Partage, hébergement et sous-traitants tiers">
          <p>
            Vos données personnelles ne font l'objet d'aucune commercialisation ou cession à des tiers à des fins publicitaires. Elles sont partagées exclusivement avec les prestataires techniques indispensables au fonctionnement de la plateforme :
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Supabase :</strong> Hébergement sécurisé des bases de données relationnelles et authentification.</li>
            <li><strong>EmailJS :</strong> Service tiers automatisé pour l'acheminement sécurisé des e-mails de confirmation et de notification.</li>
            <li><strong>Google Sheets (Apps Script) :</strong> Synchronisation interne et centralisation administrative à usage exclusif de l'équipe d'organisation.</li>
          </ul>
        </Section>

        <Section titre="6. Durée de conservation des données">
          <p>
            Les informations collectées sont conservées pour une durée strictement nécessaire aux finalités pour lesquelles elles ont été collectées, incluant la période de l'événement COPAF 2026, l'apurement des obligations comptables, fiscales et légales, ainsi qu'un archivage intermédiaire de sécurité conforme aux prescriptions en vigueur.
          </p>
        </Section>

        <Section titre="7. Sécurité des informations">
          <p>
            Nous mettons en œuvre des mesures techniques, organisationnelles et logistiques de pointe (chiffrement des flux HTTPS, cloisonnement des bases de données Supabase, politiques d'accès restreint) pour protéger vos données contre toute destruction accidentelle ou illicite, perte altération, diffusion ou accès non autorisé.
          </p>
        </Section>

        <Section titre="8. Vos droits en matière de protection des données">
          <p>
            Conformément aux réglementations internationales en vigueur, vous disposez d'un droit d'accès, de rectification, de mise à jour, de limitation, ainsi que d'un droit d'opposition et de suppression des données vous concernant.
          </p>
          <p>
            Pour exercer l'un de ces droits ou pour toute question relative à la confidentialité de vos données, vous pouvez contacter directement notre équipe dédiée :
          </p>
          <div style={{ background: '#edf2f7', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${BLUE}`, marginTop: '8px' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#0a1128' }}>Canaux officiels de réclamation :</p>
            <p style={{ margin: '6px 0 0 0' }}>• E-mail : <a href="mailto:contact@copaf-ports.com" style={{ color: BLUE, textDecoration: 'none' }}>contact@copaf-ports.com</a></p>
            <p style={{ margin: '4px 0 0 0' }}>• WhatsApp / Téléphone : +229 01 69 30 30 19</p>
          </div>
        </Section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '15px' }}>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Consultez également nos <a href="/mentions-legales" style={{ color: BLUE, fontWeight: 700, textDecoration: 'none' }}>mentions légales</a>.
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