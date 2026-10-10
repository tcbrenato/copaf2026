// src/utils/attestationsTextes.js
//
// Texte officiel de l'attestation de participation COPAF 2026 (FR / EN), dimensions et couleurs de la mise en page.
// Partagé par l'affichage HTML (AttestationView.jsx) et le PDF (generateAttestationPDF.js).

export const LARGEUR = 1123
export const HAUTEUR = 794
export const NAVY = '#0B1F66'
export const OR = '#B8902F'

export const TEXTES = {
  FR: {
    organisateurs: 'AGPAOC | UAPNA | ANP | CRF PERFECTION',
    conference: 'CONFÉRENCE DES PORTS AFRICAINS (COPAF 2026)',
    titre: "ATTESTATION DE FORMATION ET D'IMMERSION TECHNIQUE",
    certifie: "Le Comité d'Organisation de la COPAF 2026 certifie que :",
    fonction: 'Fonction : ',
    organisme: 'Organisme : ',
    suivi: "a suivi avec succès le programme de formation exécutive et d'immersion technique dans le cadre de la Conférence des Ports Africains (COPAF 2026) sur le thème : « Smart Port Africain : IA et Cybersécurité au service de la performance »",
    tenue: 'Tenue au Port Community Building de Casablanca (Maroc), du 19 au 21 Octobre 2026 (Durée : 21 heures).',
    delivre: 'Délivré à Casablanca, le 21 Octobre 2026.',
    signataires: [
      { nom: 'Dr. William ODAH', role: 'Expert en Gouvernance Portuaire / CRF' },
      { nom: 'Jean-Marie KOFFI', role: "Secrétariat Général de l'AGPAOC" },
    ],
    numero: "N° d'enregistrement : ",
    qr: 'QR code de vérification',
  },
  EN: {
    organisateurs: 'AGPAOC | UAPNA | ANP | CRF PERFECTION',
    conference: 'CONFERENCE OF AFRICAN PORTS (COPAF 2026)',
    titre: 'CERTIFICATE OF TRAINING AND TECHNICAL IMMERSION',
    certifie: 'The Organizing Committee of COPAF 2026 certifies that:',
    fonction: 'Position: ',
    organisme: 'Organization: ',
    suivi: 'has successfully completed the executive training and technical immersion program held within the framework of the African Ports Conference (COPAF 2026) on the theme: "African Smart Port: AI and Cybersecurity for Enhanced Performance"',
    tenue: 'Held at the Port Community Building in Casablanca (Morocco), from October 19 to 21, 2026 (Duration: 21 hours).',
    delivre: 'Issued in Casablanca, on October 21, 2026.',
    signataires: [
      { nom: 'Dr. William ODAH', role: 'Port Governance Expert / CRF' },
      { nom: 'Jean-Marie KOFFI', role: 'Secretary General of PMAWCA (AGPAOC)' },
    ],
    numero: 'Registration No.: ',
    qr: 'Verification QR code',
  },
}

export const LOGOS = [
  { src: '/logoagpaoc.png', alt: 'AGPAOC' }, { src: '/uapna.png', alt: 'UAPNA' },
  { src: '/ANP.png', alt: 'ANP' }, { src: '/logocrf.png', alt: 'CRF Perfection' },
]

