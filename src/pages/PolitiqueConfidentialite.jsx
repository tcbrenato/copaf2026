import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SeoHead from '../components/SeoHead'
import { useLang } from '../i18n/useLang'

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

const ulStyle = { paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '6px' }
const Mail = () => (
  <a href="mailto:contact@copaf-ports.com" style={{ color: BLUE, textDecoration: 'none' }}>contact@copaf-ports.com</a>
)

// Contenu bilingue : le texte francais est la reference, la version anglaise en est la traduction.
const TR = {
  fr: {
    seoTitle: 'Politique de Confidentialité et Protection des Données - COPAF 2026',
    seoDesc: 'Politique officielle de protection des données personnelles, conformité RGPD et gestion des cookies du site COPAF 2026, Conférence des Ports Africains.',
    h1a: 'Conformité & Transparence',
    h1b: 'Politique de Confidentialité',
    intro: 'Dernière mise à jour : 17 août 2026 - Conforme aux standards internationaux de protection des données (RGPD et lois en vigueur).',
    sections: [
      {
        titre: '1. Préambule et Responsable du Traitement',
        body: (
          <>
            <p>
              La présente Politique de confidentialité s'applique au site web officiel de la <strong>Conférence des Ports Africains (COPAF 2026)</strong>, accessible à l'adresse <code>https://copaf-ports.com</code>.
              Nous accordons une importance majeure à la protection de la vie privée et des données à caractère personnel de nos congressistes, partenaires, exposants et visiteurs.
            </p>
            <p>
              Le responsable de la collecte et du traitement des données est l'équipe organisationnelle conjointe de la COPAF 2026 et de <strong>CRF Perfection</strong>, basée à Cotonou, Bénin.
            </p>
          </>
        ),
      },
      {
        titre: '2. Données personnelles collectées',
        body: (
          <>
            <p>
              Nous collectons uniquement les informations strictement nécessaires à l'organisation de l'événement, à la gestion logistique et aux communications institutionnelles. Les données recueillies incluent :
            </p>
            <ul style={ulStyle}>
              <li><strong>Données d'identification :</strong> Nom, prénom, civilité.</li>
              <li><strong>Données de contact :</strong> Adresse e-mail professionnelle ou personnelle, numéro de téléphone (avec indicateur WhatsApp).</li>
              <li><strong>Données professionnelles :</strong> Intitulé du poste, nom de l'organisation/autorité portuaire, pays de résidence.</li>
              <li><strong>Données spécifiques aux formulaires :</strong> Choix d'inscription, formules de sponsoring, réservations d'espaces d'exposition, ou réponses aux outils interactifs (ex. scores et métriques du diagnostic Smart Port).</li>
            </ul>
            <p>Ces données sont transmises directement par vos soins lors de la validation de nos formulaires en ligne.</p>
          </>
        ),
      },
      {
        titre: '3. Finalités des traitements et bases légales',
        body: (
          <>
            <p>
              Les informations recueillies font l'objet d'un traitement informatique automatisé fondé sur l'exécution des mesures précontractuelles ou contractuelles liées à votre participation (article 6.1.b du RGPD) ainsi que sur notre intérêt légitime à promouvoir l'événement portuaire :
            </p>
            <ul style={ulStyle}>
              <li>Traitement et validation des dossiers d'inscription et de participation aux assises.</li>
              <li>Génération automatisée des documents justificatifs (factures pro forma, reçus, badges officiels d'accès).</li>
              <li>Communication logistique, mises à jour du programme, et envoi d'informations pratiques relatives à la conférence.</li>
              <li>Suivi des partenariats et des opportunités d'exposition commerciale.</li>
            </ul>
          </>
        ),
      },
      {
        titre: "4. Cookies, traceurs et outils de mesure d'audience",
        body: (
          <>
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
          </>
        ),
      },
      {
        titre: '5. Partage, hébergement et sous-traitants tiers',
        body: (
          <>
            <p>
              Vos données personnelles ne font l'objet d'aucune commercialisation ou cession à des tiers à des fins publicitaires. Elles sont partagées exclusivement avec les prestataires techniques indispensables au fonctionnement de la plateforme :
            </p>
            <ul style={ulStyle}>
              <li><strong>Supabase :</strong> Hébergement sécurisé des bases de données relationnelles et authentification.</li>
              <li><strong>EmailJS :</strong> Service tiers automatisé pour l'acheminement sécurisé des e-mails de confirmation et de notification.</li>
              <li><strong>Google Sheets (Apps Script) :</strong> Synchronisation interne et centralisation administrative à usage exclusif de l'équipe d'organisation.</li>
            </ul>
          </>
        ),
      },
      {
        titre: '6. Durée de conservation des données',
        body: (
          <p>
            Les informations collectées sont conservées pour une durée strictement nécessaire aux finalités pour lesquelles elles ont été collectées, incluant la période de l'événement COPAF 2026, l'apurement des obligations comptables, fiscales et légales, ainsi qu'un archivage intermédiaire de sécurité conforme aux prescriptions en vigueur.
          </p>
        ),
      },
      {
        titre: '7. Sécurité des informations',
        body: (
          <p>
            Nous mettons en œuvre des mesures techniques, organisationnelles et logistiques de pointe (chiffrement des flux HTTPS, cloisonnement des bases de données Supabase, politiques d'accès restreint) pour protéger vos données contre toute destruction accidentelle ou illicite, perte altération, diffusion ou accès non autorisé.
          </p>
        ),
      },
      {
        titre: '8. Vos droits en matière de protection des données',
        body: (
          <>
            <p>
              Conformément aux réglementations internationales en vigueur, vous disposez d'un droit d'accès, de rectification, de mise à jour, de limitation, ainsi que d'un droit d'opposition et de suppression des données vous concernant.
            </p>
            <p>
              Pour exercer l'un de ces droits ou pour toute question relative à la confidentialité de vos données, vous pouvez contacter directement notre équipe dédiée :
            </p>
            <div style={{ background: '#edf2f7', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${BLUE}`, marginTop: '8px' }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#0a1128' }}>Canaux officiels de réclamation :</p>
              <p style={{ margin: '6px 0 0 0' }}>• E-mail : <Mail /></p>
              <p style={{ margin: '4px 0 0 0' }}>• WhatsApp / Téléphone : +229 01 69 30 30 19</p>
            </div>
          </>
        ),
      },
    ],
    alsoSee: 'Consultez également nos',
    alsoSeeLink: 'mentions légales',
    top: '↑ Remonter en haut',
  },
  en: {
    seoTitle: 'Privacy Policy and Data Protection - COPAF 2026',
    seoDesc: 'Official policy on the protection of personal data, GDPR compliance and cookie management of the COPAF 2026 website, the African Ports Conference.',
    h1a: 'Compliance & Transparency',
    h1b: 'Privacy Policy',
    intro: 'Last updated: August 17, 2026 - In line with international data protection standards (GDPR and applicable laws).',
    sections: [
      {
        titre: '1. Preamble and Data Controller',
        body: (
          <>
            <p>
              This Privacy Policy applies to the official website of the <strong>African Ports Conference (COPAF 2026)</strong>, available at <code>https://copaf-ports.com</code>.
              We attach major importance to the protection of the privacy and personal data of our conference attendees, partners, exhibitors and visitors.
            </p>
            <p>
              The party responsible for collecting and processing the data is the joint organising team of COPAF 2026 and <strong>CRF Perfection</strong>, based in Cotonou, Benin.
            </p>
          </>
        ),
      },
      {
        titre: '2. Personal data collected',
        body: (
          <>
            <p>
              We collect only the information strictly necessary for organising the event, managing logistics and institutional communications. The data collected includes:
            </p>
            <ul style={ulStyle}>
              <li><strong>Identification data:</strong> Last name, first name, title.</li>
              <li><strong>Contact data:</strong> Professional or personal email address, telephone number (with WhatsApp indicator).</li>
              <li><strong>Professional data:</strong> Job title, name of the organisation/port authority, country of residence.</li>
              <li><strong>Form-specific data:</strong> Registration choices, sponsorship packages, exhibition space bookings, or answers to interactive tools (e.g. scores and metrics of the Smart Port diagnostic).</li>
            </ul>
            <p>This data is provided directly by you when you submit our online forms.</p>
          </>
        ),
      },
      {
        titre: '3. Purposes of processing and legal bases',
        body: (
          <>
            <p>
              The information collected is subject to automated computer processing based on the performance of pre-contractual or contractual measures related to your participation (Article 6.1.b of the GDPR) as well as on our legitimate interest in promoting the port event:
            </p>
            <ul style={ulStyle}>
              <li>Processing and validation of registration and conference participation files.</li>
              <li>Automated generation of supporting documents (pro forma invoices, receipts, official access badges).</li>
              <li>Logistical communication, programme updates, and sending of practical information about the conference.</li>
              <li>Follow-up of partnerships and commercial exhibition opportunities.</li>
            </ul>
          </>
        ),
      },
      {
        titre: '4. Cookies, trackers and audience measurement tools',
        body: (
          <>
            <p>
              Our site uses trackers (cookies) to optimise the user experience, analyse overall traffic and evaluate the performance of our information campaigns. You have full control over these trackers.
            </p>
            <div style={{ marginTop: 12, marginBottom: 8, overflowX: 'auto' }}>
              <Outil nom="Google Analytics 4" finalite="Anonymised traffic statistics (pages viewed, browsing paths, overall geographic origin)." duree="Up to 14 months" />
              <Outil nom="Internal measurement (Supabase)" finalite="Secure technical tracking of sessions and integrity of form requests." duree="Session / project duration" />
              <Outil nom="LinkedIn Insight Tag" finalite="Measurement of the effectiveness and conversions resulting from our professional communication actions on LinkedIn." duree="According to LinkedIn standards" />
              <Outil nom="Meta Pixel" finalite="Measurement of audience and advertising conversions from Meta social networks (Facebook, Instagram)." duree="According to Meta standards" />
            </div>
            <p style={{ fontSize: '13.5px', color: '#475569', fontStyle: 'italic' }}>
              You can set up your browser at any time to refuse the installation of these cookies. The site remains fully accessible; only the audience statistics of your session will not be counted.
            </p>
          </>
        ),
      },
      {
        titre: '5. Sharing, hosting and third-party processors',
        body: (
          <>
            <p>
              Your personal data is not sold or transferred to third parties for advertising purposes. It is shared exclusively with the technical providers essential to the operation of the platform:
            </p>
            <ul style={ulStyle}>
              <li><strong>Supabase:</strong> Secure hosting of relational databases and authentication.</li>
              <li><strong>EmailJS:</strong> Automated third-party service for the secure delivery of confirmation and notification emails.</li>
              <li><strong>Google Sheets (Apps Script):</strong> Internal synchronisation and administrative centralisation for the exclusive use of the organising team.</li>
            </ul>
          </>
        ),
      },
      {
        titre: '6. Data retention period',
        body: (
          <p>
            The information collected is kept for a period strictly necessary for the purposes for which it was collected, including the period of the COPAF 2026 event, the settlement of accounting, tax and legal obligations, as well as an intermediate security archive in accordance with the applicable requirements.
          </p>
        ),
      },
      {
        titre: '7. Information security',
        body: (
          <p>
            We implement state-of-the-art technical, organisational and logistical measures (HTTPS encryption of data flows, segregation of Supabase databases, restricted access policies) to protect your data against accidental or unlawful destruction, loss, alteration, disclosure or unauthorised access.
          </p>
        ),
      },
      {
        titre: '8. Your data protection rights',
        body: (
          <>
            <p>
              In accordance with the international regulations in force, you have the right of access, rectification, updating and restriction, as well as the right to object to and to erase the data concerning you.
            </p>
            <p>
              To exercise any of these rights or for any question regarding the confidentiality of your data, you can contact our dedicated team directly:
            </p>
            <div style={{ background: '#edf2f7', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${BLUE}`, marginTop: '8px' }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#0a1128' }}>Official complaint channels:</p>
              <p style={{ margin: '6px 0 0 0' }}>• Email: <Mail /></p>
              <p style={{ margin: '4px 0 0 0' }}>• WhatsApp / Phone: +229 01 69 30 30 19</p>
            </div>
          </>
        ),
      },
    ],
    alsoSee: 'See also our',
    alsoSeeLink: 'legal notice',
    top: '↑ Back to top',
  },
}

export default function PolitiqueConfidentialite() {
  const t = TR[useLang()]
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', background: '#f8faff' }}>
      <SeoHead
        title={t.seoTitle}
        description={t.seoDesc}
        canonical="https://copaf-ports.com/politique-confidentialite"
        type="website"
      />
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(110px, 14vw, 150px) clamp(20px, 5vw, 40px) 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0a1128', margin: '0 0 12px', letterSpacing: '-0.02em', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>{t.h1a}</span>
          <span style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: BLUE }}>{t.h1b}</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 40, borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          {t.intro}
        </p>

        {t.sections.map(s => <Section key={s.titre} titre={s.titre}>{s.body}</Section>)}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '15px' }}>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            {t.alsoSee} <a href="/mentions-legales" style={{ color: BLUE, fontWeight: 700, textDecoration: 'none' }}>{t.alsoSeeLink}</a>.
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ fontSize: '13px', color: BLUE, fontWeight: 600, textDecoration: 'none' }}>
            {t.top}
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
