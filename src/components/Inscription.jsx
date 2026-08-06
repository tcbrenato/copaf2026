import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import emailjs from '@emailjs/browser'
import { generateRecapPDF } from '../utils/generateRecapPDF'
import { generateProformaPDF } from '../utils/generateProformaPDF'
import { useAnalytics } from '../useAnalytics'
import { PORTS_AUTRE, getOrgOptionsForCountry, findPortByValue } from '../utils/portsData'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbz7r-LgcYhTnR7VjHzq0KsrRUAp5fNrzn6Y4wnPf9rzc1-bd2j8aMbT8guG3P2i-kbe/exec'
const PRIX_UNITAIRE = 3500
const EMAILJS_SVC   = 'service_x07g4et'
const EMAILJS_TPL_FR = 'template_7wrkmm1'
const EMAILJS_TPL_EN = 'template_y2q8tlq'
const EMAILJS_KEY   = 'zBZAZxCfznICTKLJK'
const WHATSAPP_NUM  = '22997672200'
const CONTACT_EMAIL = 'inscriptions@copaf-ports.com'

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    user:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    mail:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    phone:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>,
    globe:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    bank:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    shield:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    file:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    lock:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    card:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    check:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    close:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    whatsapp: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    badge:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    diamond:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M12 22V9"/><path d="M6 3l6 6 6-6"/></svg>,
    monitor:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
    arrow:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    info:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    ban:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  }
  return icons[name] || null
}

/* ============================================================
   PAYS — value = identifiant stable (stocke en base, INCHANGE),
   label = { fr, en } pour l'affichage selon la langue choisie.
   ============================================================ */
const PAYS = [
  { value: 'Maroc',               label: { fr: 'Maroc',               en: 'Morocco' } },
  { value: 'Benin',               label: { fr: 'Benin',               en: 'Benin' } },
  { value: 'Togo',                label: { fr: 'Togo',                en: 'Togo' } },
  { value: "Cote d'Ivoire",       label: { fr: "Cote d'Ivoire",       en: 'Ivory Coast' } },
  { value: 'Senegal',             label: { fr: 'Senegal',             en: 'Senegal' } },
  { value: 'Guinee',              label: { fr: 'Guinee',              en: 'Guinea' } },
  { value: 'Guinee-Bissau',       label: { fr: 'Guinee-Bissau',       en: 'Guinea-Bissau' } },
  { value: 'Guinee Equatoriale',  label: { fr: 'Guinee Equatoriale',  en: 'Equatorial Guinea' } },
  { value: 'Mauritanie',          label: { fr: 'Mauritanie',          en: 'Mauritania' } },
  { value: 'Mali',                label: { fr: 'Mali',                en: 'Mali' } },
  { value: 'Burkina Faso',        label: { fr: 'Burkina Faso',        en: 'Burkina Faso' } },
  { value: 'Niger',               label: { fr: 'Niger',               en: 'Niger' } },
  { value: 'Nigeria',             label: { fr: 'Nigeria',             en: 'Nigeria' } },
  { value: 'Ghana',               label: { fr: 'Ghana',               en: 'Ghana' } },
  { value: 'Gambie',              label: { fr: 'Gambie',              en: 'The Gambia' } },
  { value: 'Sierra Leone',        label: { fr: 'Sierra Leone',        en: 'Sierra Leone' } },
  { value: 'Liberia',             label: { fr: 'Liberia',             en: 'Liberia' } },
  { value: 'Cameroun',            label: { fr: 'Cameroun',            en: 'Cameroon' } },
  { value: 'Gabon',               label: { fr: 'Gabon',               en: 'Gabon' } },
  { value: 'Congo',               label: { fr: 'Congo (Brazzaville)', en: 'Congo (Brazzaville)' } },
  { value: 'RDC',                 label: { fr: 'RDC (Congo)',         en: 'DR Congo' } },
  { value: 'Sao Tome-et-Principe',label: { fr: 'Sao Tome-et-Principe',en: 'Sao Tome and Principe' } },
  { value: 'Tchad',               label: { fr: 'Tchad',               en: 'Chad' } },
  { value: 'Republique Centrafricaine', label: { fr: 'Republique Centrafricaine', en: 'Central African Republic' } },
  { value: 'Angola',              label: { fr: 'Angola',              en: 'Angola' } },
  { value: 'Cap-Vert',            label: { fr: 'Cap-Vert',            en: 'Cape Verde' } },
  { value: 'Afrique du Sud',      label: { fr: 'Afrique du Sud',      en: 'South Africa' } },
  { value: 'Namibie',             label: { fr: 'Namibie',             en: 'Namibia' } },
  { value: 'Mozambique',          label: { fr: 'Mozambique',          en: 'Mozambique' } },
  { value: 'Madagascar',          label: { fr: 'Madagascar',          en: 'Madagascar' } },
  { value: 'Comores',             label: { fr: 'Comores',             en: 'Comoros' } },
  { value: 'Seychelles',          label: { fr: 'Seychelles',          en: 'Seychelles' } },
  { value: 'Maurice',             label: { fr: 'Maurice',             en: 'Mauritius' } },
  { value: 'Algerie',             label: { fr: 'Algerie',             en: 'Algeria' } },
  { value: 'Tunisie',             label: { fr: 'Tunisie',             en: 'Tunisia' } },
  { value: 'Libye',               label: { fr: 'Libye',               en: 'Libya' } },
  { value: 'Egypte',              label: { fr: 'Egypte',              en: 'Egypt' } },
  { value: 'Kenya',               label: { fr: 'Kenya',               en: 'Kenya' } },
  { value: 'Tanzanie',            label: { fr: 'Tanzanie',            en: 'Tanzania' } },
  { value: 'Djibouti',            label: { fr: 'Djibouti',            en: 'Djibouti' } },
  { value: 'Soudan',              label: { fr: 'Soudan',              en: 'Sudan' } },
  { value: 'Somalie',             label: { fr: 'Somalie',             en: 'Somalia' } },
  { value: 'Erythree',            label: { fr: 'Erythree',            en: 'Eritrea' } },
  { value: 'Ethiopie',            label: { fr: 'Ethiopie',            en: 'Ethiopia' } },
  { value: 'Rwanda',              label: { fr: 'Rwanda',              en: 'Rwanda' } },
  { value: 'Ouganda',             label: { fr: 'Ouganda',             en: 'Uganda' } },
  { value: 'Emirats Arabes Unis', label: { fr: 'Emirats Arabes Unis', en: 'United Arab Emirates' } },
  { value: 'Arabie Saoudite',     label: { fr: 'Arabie Saoudite',     en: 'Saudi Arabia' } },
  { value: 'Turquie',             label: { fr: 'Turquie',             en: 'Turkey' } },
  { value: 'Chine',               label: { fr: 'Chine',               en: 'China' } },
  { value: 'Inde',                label: { fr: 'Inde',                en: 'India' } },
  { value: 'France',              label: { fr: 'France',              en: 'France' } },
  { value: 'Belgique',            label: { fr: 'Belgique',            en: 'Belgium' } },
  { value: 'Allemagne',           label: { fr: 'Allemagne',           en: 'Germany' } },
  { value: 'Pays-Bas',            label: { fr: 'Pays-Bas',            en: 'Netherlands' } },
  { value: 'Espagne',             label: { fr: 'Espagne',             en: 'Spain' } },
  { value: 'Portugal',            label: { fr: 'Portugal',            en: 'Portugal' } },
  { value: 'Italie',              label: { fr: 'Italie',              en: 'Italy' } },
  { value: 'Royaume-Uni',         label: { fr: 'Royaume-Uni',         en: 'United Kingdom' } },
  { value: 'Etats-Unis',          label: { fr: 'Etats-Unis',          en: 'United States' } },
  { value: 'Canada',              label: { fr: 'Canada',              en: 'Canada' } },
  { value: 'Bresil',              label: { fr: 'Bresil',              en: 'Brazil' } },
  { value: 'Autre',               label: { fr: 'Autre pays',          en: 'Other country' } },
]

/* ============================================================
   TRADUCTIONS — toutes les chaines statiques de l'interface.
   ============================================================ */
const TR = {
  fr: {
    langName: 'FR', langSwitchTo: 'English',
    kicker: 'Rejoindre la COPAF 2026',
    titleStep1a: 'Choisissez votre ', titleStep1b: 'participation',
    titleStep2a: 'Formulaire ', titleStep2b: "d'inscription",
    subtitleStep1: 'Selectionnez la categorie correspondant a votre profil.',
    subtitleStep2: 'Remplissez le formulaire. Paiement securise par virement bancaire.',
    tutoBtn: "Voir le tutoriel video : comment s'inscrire",
    backBtn: '\u2190 Changer de categorie',
    types: {
      participant: { label:'Participant', sublabel:'Je participe a la conference', desc:'Ports, autorites portuaires, logisticiens, shippers et tout professionnel du maritime.', tag:'par personne', cta:"S'inscrire maintenant" },
      sponsor:     { label:'Sponsor / Partenaire', sublabel:'Visibilite & partenariat', desc:'Sponsors Platine, Or, Argent, Bronze ou partenariat institutionnel, media, academique.', tag:'sponsors & partenaires', cta:'Voir les offres' },
      exposant:    { label:'Exposant Digital', sublabel:'Vitrine digitale de vos solutions', desc:'Exposition 100% digitale sur le site COPAF et les tablettes distribuees aux participants.', tag:'digital - site + tablettes', cta:'Voir les formules' },
    },
    pageDediee: 'Page dediee \u2192',
    voirInclus: 'Voir ce qui est inclus',
    inclusTitle: 'Ce qui est inclus',
    inclusTarif: 'Tarif Participant \u2014 3 500 EUR',
    inclusList: [
      "Accueil a l'aeroport et installation a l'hotel",
      'Navette Aeroport <-> Hotel (aller-retour)',
      'Hebergement 4 nuitees en Hotel 4 etoiles',
      'Petit-dejeuner & dejeuner pendant les 3 jours',
      'Acces aux conferences, ateliers & networking',
      'Visite guidee du port de Casablanca',
      'Tablette pre-chargee avec etudes de cas',
      'Attestation de participation',
    ],
    formTitle: 'Vos informations',
    fields: {
      nom:'Nom *', prenom:'Prenom *', email:'Email *', telephone:'Telephone *',
      organisation:'Organisation *', poste:'Poste *', pays:'Pays *', participants:'Nombre de participants',
    },
    ph: { nom:'Votre nom', prenom:'Votre prenom', email:'votre@email.com', telephone:'+229 01 XX XX XX', organisation:'Port / Entreprise', poste:'Votre fonction' },
    paysPlaceholder: 'Selectionnez votre pays',
    orgPlaceholder: 'Selectionnez votre port / organisation',
    orgPlaceholderNoCountry: "Choisissez d'abord votre pays ci-dessus",
    participantsOpt: n => `${n} participant${n>1?'s':''} - ${(n*PRIX_UNITAIRE).toLocaleString('fr-FR')} EUR`,
    messageLabel: 'Message / Besoins specifiques',
    messagePh: 'Questions, besoins alimentaires, accessibilite...',
    paiementLabel: 'Mode de paiement *',
    paiementOpts: [
      { value:'maintenant', title:'Payer maintenant', desc:'Virement sous 7 jours ouvrables' },
      { value:'plus_tard',  title:'Reserver ma place', desc:'Paiement avant le 31 aout 2026' },
    ],
    avantValiderTitle: 'A savoir avant de valider',
    avantValider1: 'Les inscriptions sont **fermes et definitives** : aucun remboursement, quel que soit le motif (un collegue peut vous remplacer avec notification 72h avant).',
    avantValider2: 'Apres votre email de confirmation, contactez-nous par WhatsApp ou email pour finaliser le paiement.',
    securityTitle: '🔒 Sécurité de vos paiements',
    securityText: (
      <>Avant tout virement, vérifiez toujours nos coordonnées bancaires officielles sur notre page sécurisée{' '}
      <a href="/verifier" target="_blank" rel="noopener noreferrer" style={{ color:'#991b1b', fontWeight:700 }}>copaf-ports.com/verifier</a>.
      Toute demande de virement vers un RIB non listé sur cette page doit être considérée comme suspecte.</>
    ),
    cgvLabel: "J'ai lu et j'accepte les ",
    cgvLink: 'conditions generales de vente',
    cgvSuffix: ' incluant la politique de non-remboursement.',
    rgpdLabel: "J'accepte le traitement de mes donnees conformement a la ",
    rgpdLink: 'politique de confidentialite',
    rgpdSuffix: '.',
    submitPay: 'Confirmer mon inscription', submitReserve: 'Reserver ma place', submitLoading: 'Envoi en cours...',
    secureNote: 'Paiement 100% securise par virement bancaire. Aucune carte bancaire requise.',
    successTitlePay: 'Inscription enregistree !', successTitleReserve: 'Place reservee !',
    successThanks: (p,n) => <>Merci <strong style={{ color:'#0f172a' }}>{p} {n}</strong>.<br/>Un email de confirmation a ete envoye a </>,
    downloadPdf: 'Telecharger mon recapitulatif (PDF)',
    dossierLabel: 'Numero de dossier',
    actionTitle: 'Action obligatoire - Contactez-nous pour finaliser',
    actionText: 'Apres reception de votre email de confirmation, vous devez obligatoirement nous contacter par WhatsApp ou email pour valider votre inscription et recevoir les instructions de virement.',
    prochainesTitle: 'Prochaines etapes',
    steps: [
      'Email de confirmation automatique envoye',
      'Vous nous contactez par WhatsApp ou email',
      'Reception des instructions de virement',
      { pay:'Paiement sous 7 jours ouvrables', reserve:'Paiement avant le 31 aout 2026' },
      'Badge et acces participant envoyes apres paiement',
    ],
    verifRib: 'Verifiez toujours le RIB avant de payer sur notre page dediee.',
    verifNow: 'Verifier maintenant \u2192',
    rappelTitle: 'Rappel :', rappelText: ' Les inscriptions sont fermes et definitives. Aucun remboursement ne sera effectue. En cas d\'empechement, vous pouvez vous faire remplacer par un collegue (notification 72h avant).',
    recapTitle: 'Recapitulatif', recapParticipants: 'Participants', recapTarif: 'Tarif unitaire', recapTotal: 'Total',
    virementTitle: 'Paiement par virement',
    verifAuth: "Verifier l'authenticite de ce RIB",
    aideTitle: "Besoin d'aide ?", waContact: 'Contacter sur WhatsApp',
    nonRembTitle: 'Non remboursable',
    nonRembText: 'Les inscriptions sont definitives. Consultez nos ',
    nonRembCgv: 'CGV', nonRembSuffix: ' pour plus d\'informations.',
    cgvModalTitle: 'Conditions Generales de Vente',
    rgpdModalTitle: 'Politique de Confidentialite (RGPD)',
    modalClose: "J'ai lu et compris",
    cgvContent: [
      { title:'1. Objet', text:"Les presentes conditions generales de vente regissent les inscriptions a la Conference des Ports Africains (COPAF 2026) organisee par CRF Perfection, prevue du 15 au 17 septembre 2026 a Tanger Med, Maroc." },
      { title:'2. Inscription et confirmation', text:"Toute inscription n'est definitivement confirmee qu'apres reception du paiement integral. Apres reception du mail de confirmation automatique, le participant doit contacter l'organisation par WhatsApp au +229 01 97 67 22 00 ou par email a inscriptions@copaf-ports.com pour valider son inscription et recevoir les instructions de paiement." },
      { title:'3. Tarifs et paiement', text:"Le tarif est fixe a 3 500 EUR par personne. Le paiement s'effectue exclusivement par virement bancaire. Le paiement doit etre effectue dans les 7 jours ouvrables suivant la confirmation d'inscription. En cas de reservation (paiement differe), le reglement doit intervenir avant le 31 aout 2026." },
      { title:'4. Politique de non-remboursement', text:"Les inscriptions sont fermes et definitives. Aucun remboursement ne sera effectue, quelle que soit la raison de l'annulation (raison personnelle, professionnelle, medicale, force majeure, refus de visa, etc.). En cas d'empechement, le participant peut se faire remplacer par une autre personne de son organisation sous reserve de notification ecrite au moins 72h avant l'evenement." },
      { title:"5. Annulation par l'organisateur", text:"En cas d'annulation de l'evenement par l'organisateur pour des raisons de force majeure, un avoir sera propose pour l'edition suivante. Aucun remboursement en numeraire ne sera effectue." },
      { title:'6. Droits et obligations', text:"Le participant s'engage a respecter le reglement interieur de l'evenement et a se comporter de maniere professionnelle. L'organisateur se reserve le droit d'exclure tout participant ne respectant pas ces regles sans remboursement." },
      { title:'7. Responsabilite', text:"L'organisateur ne saurait etre tenu responsable des frais de deplacement, d'hebergement ou de visa engages par les participants. Il est recommande de contracter une assurance annulation." },
      { title:'8. Litiges', text:"En cas de litige, les parties s'engagent a rechercher une solution amiable. A defaut, les tribunaux competents de Cotonou, Benin, seront saisis." },
    ],
    rgpdContent: [
      { title:'1. Responsable du traitement', text:"CRF Perfection, organisant la COPAF 2026, est responsable du traitement. Contact : inscriptions@copaf-ports.com" },
      { title:'2. Donnees collectees', text:"Nous collectons : nom, prenom, email, telephone, organisation, poste, pays. Ces donnees sont collectees lors de votre inscription." },
      { title:'3. Finalites', text:"Vos donnees servent a : la gestion de votre inscription, l'envoi des confirmations, la creation de votre badge, la communication sur les editions futures." },
      { title:'4. Base legale', text:"Le traitement est fonde sur l'execution du contrat d'inscription (article 6.1.b du RGPD) et votre consentement explicite." },
      { title:'5. Conservation', text:"Vos donnees sont conservees pendant 3 ans a compter de la date de l'evenement, sauf obligation legale contraire." },
      { title:'6. Destinataires', text:"Vos donnees peuvent etre transmises aux partenaires organisant l'evenement dans la stricte limite necessaire. Elles ne sont jamais vendues." },
      { title:'7. Vos droits', text:"Vous disposez des droits d'acces, de rectification, d'effacement, de limitation, d'opposition et de portabilite. Contactez-nous a inscriptions@copaf-ports.com." },
      { title:'8. Securite', text:"Nous mettons en oeuvre toutes les mesures techniques et organisationnelles appropriees pour proteger vos donnees." },
    ],
    nonRembBanner: 'Politique de non-remboursement - Important',
    nonRembBannerText: "Les inscriptions sont **fermes et definitives**. Aucun remboursement ne sera effectue quelle que soit la raison de l'annulation. En cas d'empechement, le participant peut etre remplace par un collegue avec notification 72h avant l'evenement.",
    docOfficiel: 'Page dediee',
    waMsgFinaliser: dossier => `Bonjour, j'ai recu la confirmation de mon inscription COPAF 2026. Dossier : ${dossier}. Je souhaite finaliser.`,
    waMsgQuestion: `Bonjour, j'ai une question concernant mon inscription a la COPAF 2026.`,
    emailSubject: dossier => `Finalisation inscription COPAF 2026 - ${dossier}`,
    emailBody: dossier => `Bonjour, mon dossier est ${dossier}. Je souhaite finaliser mon inscription.`,
    errorPrefix: 'Une erreur est survenue : ',
  },
  en: {
    langName: 'EN', langSwitchTo: 'Francais',
    kicker: 'Join COPAF 2026',
    titleStep1a: 'Choose your ', titleStep1b: 'participation',
    titleStep2a: 'Registration ', titleStep2b: 'form',
    subtitleStep1: 'Select the category matching your profile.',
    subtitleStep2: 'Fill in the form. Secure payment by bank transfer.',
    tutoBtn: 'Watch the video tutorial: how to register',
    backBtn: '\u2190 Change category',
    types: {
      participant: { label:'Participant', sublabel:'I am attending the conference', desc:'Ports, port authorities, logistics operators, shippers and all maritime professionals.', tag:'per person', cta:'Register now' },
      sponsor:     { label:'Sponsor / Partner', sublabel:'Visibility & partnership', desc:'Platinum, Gold, Silver, Bronze sponsorships or institutional, media, academic partnership.', tag:'sponsors & partners', cta:'View offers' },
      exposant:    { label:'Digital Exhibitor', sublabel:'A digital showcase for your solutions', desc:'100% digital exhibition on the COPAF website and on the tablets distributed to participants.', tag:'digital - website + tablets', cta:'View packages' },
    },
    pageDediee: 'Dedicated page \u2192',
    voirInclus: "See what's included",
    inclusTitle: "What's included",
    inclusTarif: 'Participant rate \u2014 EUR 3,500',
    inclusList: [
      'Airport welcome and hotel check-in',
      'Airport <-> Hotel shuttle (round trip)',
      '4-night stay in a 4-star hotel',
      'Breakfast & lunch throughout the 3 days',
      'Access to conferences, workshops & networking',
      'Guided tour of the Port of Casablanca',
      'Pre-loaded tablet with case studies',
      'Certificate of attendance',
    ],
    formTitle: 'Your information',
    fields: {
      nom:'Last name *', prenom:'First name *', email:'Email *', telephone:'Phone *',
      organisation:'Organisation *', poste:'Position *', pays:'Country *', participants:'Number of participants',
    },
    ph: { nom:'Your last name', prenom:'Your first name', email:'your@email.com', telephone:'+229 01 XX XX XX', organisation:'Port / Company', poste:'Your role' },
    paysPlaceholder: 'Select your country',
    orgPlaceholder: 'Select your port / organisation',
    orgPlaceholderNoCountry: 'Choose your country above first',
    participantsOpt: n => `${n} participant${n>1?'s':''} - EUR ${(n*PRIX_UNITAIRE).toLocaleString('en-US')}`,
    messageLabel: 'Message / Specific needs',
    messagePh: 'Questions, dietary needs, accessibility...',
    paiementLabel: 'Payment method *',
    paiementOpts: [
      { value:'maintenant', title:'Pay now', desc:'Bank transfer within 7 business days' },
      { value:'plus_tard',  title:'Reserve my spot', desc:'Payment before August 31, 2026' },
    ],
    avantValiderTitle: 'Before you confirm',
    avantValider1: 'Registrations are **firm and final**: no refunds, whatever the reason (a colleague may replace you with 72h notice).',
    avantValider2: 'After your confirmation email, contact us on WhatsApp or email to finalise payment.',
    securityTitle: '🔒 Payment security',
    securityText: (
      <>Before making any transfer, always verify our official bank details on our secure page{' '}
      <a href="/verifier" target="_blank" rel="noopener noreferrer" style={{ color:'#991b1b', fontWeight:700 }}>copaf-ports.com/verifier</a>.
      Any transfer request to a bank account not listed on this page should be considered suspicious.</>
    ),
    cgvLabel: 'I have read and accept the ',
    cgvLink: 'terms and conditions of sale',
    cgvSuffix: ', including the no-refund policy.',
    rgpdLabel: 'I accept the processing of my data in accordance with the ',
    rgpdLink: 'privacy policy',
    rgpdSuffix: '.',
    submitPay: 'Confirm my registration', submitReserve: 'Reserve my spot', submitLoading: 'Sending...',
    secureNote: '100% secure payment by bank transfer. No credit card required.',
    successTitlePay: 'Registration recorded!', successTitleReserve: 'Spot reserved!',
    successThanks: (p,n) => <>Thank you <strong style={{ color:'#0f172a' }}>{p} {n}</strong>.<br/>A confirmation email has been sent to </>,
    downloadPdf: 'Download my summary (PDF)',
    dossierLabel: 'Reference number',
    actionTitle: 'Action required - Contact us to finalise',
    actionText: 'After receiving your confirmation email, you must contact us on WhatsApp or email to validate your registration and receive the transfer instructions.',
    prochainesTitle: 'Next steps',
    steps: [
      'Automatic confirmation email sent',
      'You contact us on WhatsApp or email',
      'You receive the transfer instructions',
      { pay:'Payment within 7 business days', reserve:'Payment before August 31, 2026' },
      'Badge and participant access sent after payment',
    ],
    verifRib: 'Always check the bank details before paying, on our dedicated page.',
    verifNow: 'Verify now \u2192',
    rappelTitle: 'Reminder:', rappelText: ' Registrations are firm and final. No refunds will be issued. In case of impediment, you may be replaced by a colleague (72h notice required).',
    recapTitle: 'Summary', recapParticipants: 'Participants', recapTarif: 'Unit rate', recapTotal: 'Total',
    virementTitle: 'Payment by bank transfer',
    verifAuth: 'Verify the authenticity of these bank details',
    aideTitle: 'Need help?', waContact: 'Contact us on WhatsApp',
    nonRembTitle: 'Non-refundable',
    nonRembText: 'Registrations are final. See our ',
    nonRembCgv: 'terms', nonRembSuffix: ' for more information.',
    cgvModalTitle: 'Terms and Conditions of Sale',
    rgpdModalTitle: 'Privacy Policy (GDPR)',
    modalClose: 'I have read and understood',
    cgvContent: [
      { title:'1. Purpose', text:'These terms and conditions of sale govern registrations for the Conference of African Ports (COPAF 2026), organised by CRF Perfection, to be held from 15 to 17 September 2026 in Tanger Med, Morocco.' },
      { title:'2. Registration and confirmation', text:'A registration is only definitively confirmed upon receipt of full payment. After receiving the automatic confirmation email, the participant must contact the organisation via WhatsApp at +229 01 97 67 22 00 or by email at inscriptions@copaf-ports.com to validate their registration and receive payment instructions.' },
      { title:'3. Rates and payment', text:'The rate is set at EUR 3,500 per person. Payment is made exclusively by bank transfer. Payment must be made within 7 business days of registration confirmation. For deferred (reserved) payments, settlement must occur before 31 August 2026.' },
      { title:'4. No-refund policy', text:'Registrations are firm and final. No refund will be issued, whatever the reason for cancellation (personal, professional, medical, force majeure, visa refusal, etc.). In case of impediment, the participant may be replaced by another person from their organisation, subject to written notice at least 72h before the event.' },
      { title:'5. Cancellation by the organiser', text:'Should the organiser cancel the event for reasons of force majeure, a credit will be offered for the next edition. No cash refund will be issued.' },
      { title:'6. Rights and obligations', text:'The participant agrees to comply with the event rules and to behave professionally. The organiser reserves the right to exclude any participant who fails to comply with these rules, without refund.' },
      { title:'7. Liability', text:'The organiser cannot be held responsible for travel, accommodation or visa costs incurred by participants. Cancellation insurance is recommended.' },
      { title:'8. Disputes', text:'In the event of a dispute, the parties agree to seek an amicable solution. Failing that, the competent courts of Cotonou, Benin, shall have jurisdiction.' },
    ],
    rgpdContent: [
      { title:'1. Data controller', text:'CRF Perfection, organiser of COPAF 2026, is the data controller. Contact: inscriptions@copaf-ports.com' },
      { title:'2. Data collected', text:'We collect: last name, first name, email, phone, organisation, position, country. This data is collected during registration.' },
      { title:'3. Purposes', text:'Your data is used to: manage your registration, send confirmations, create your badge, and communicate about future editions.' },
      { title:'4. Legal basis', text:'Processing is based on the performance of the registration contract (Article 6.1.b GDPR) and your explicit consent.' },
      { title:'5. Retention', text:'Your data is kept for 3 years from the date of the event, unless otherwise required by law.' },
      { title:'6. Recipients', text:'Your data may be shared with partners organising the event, strictly as necessary. It is never sold.' },
      { title:'7. Your rights', text:'You have the right to access, rectify, erase, restrict, object to and port your data. Contact us at inscriptions@copaf-ports.com.' },
      { title:'8. Security', text:'We implement all appropriate technical and organisational measures to protect your data.' },
    ],
    nonRembBanner: 'No-refund policy - Important',
    nonRembBannerText: 'Registrations are **firm and final**. No refund will be issued regardless of the reason for cancellation. In case of impediment, the participant may be replaced by a colleague, with 72h notice before the event.',
    docOfficiel: 'Dedicated page',
    waMsgFinaliser: dossier => `Hello, I have received the confirmation of my COPAF 2026 registration. File: ${dossier}. I would like to finalise it.`,
    waMsgQuestion: 'Hello, I have a question about my COPAF 2026 registration.',
    emailSubject: dossier => `Finalising COPAF 2026 registration - ${dossier}`,
    emailBody: dossier => `Hello, my reference is ${dossier}. I would like to finalise my registration.`,
    errorPrefix: 'An error occurred: ',
  },
}

const TYPE_IDS = ['participant', 'sponsor', 'exposant']
const TYPE_META = {
  participant: { icon:'badge',   prix:'3 500 EUR', redirect:false, color:'#0073F4', bg:'#EBF3FF' },
  sponsor:     { icon:'diamond', prix:'A partir de 8\u00A0000 EUR', redirect:true, redirectTo:'/partenariats', color:'#000E91', bg:'rgba(0,14,145,0.06)' },
  exposant:    { icon:'monitor', prix:'A partir de 500 EUR', redirect:true, redirectTo:'/exposition-digitale', color:'#0891b2', bg:'rgba(8,145,178,0.06)' },
}
const TYPE_PRIX_EN = { participant:'EUR 3,500', sponsor:'From EUR 8,000', exposant:'From EUR 500' }

const genDossier = () => `COPAF2026-${Math.floor(Math.random() * 90000) + 10000}`

async function upsertContact(form) {
  const { data, error } = await supabase.from('contacts').upsert({ email:form.email, prenom:form.prenom, nom:form.nom, telephone:form.telephone, organisation:form.organisation, poste:form.poste, pays:form.pays, source:'inscription' }, { onConflict:'email' }).select('id').single()
  if (error) throw new Error(error.message)
  return data.id
}

async function createInscription(contactId, form, nb, montant, paiementMode, dossier, lang) {
  const { error } = await supabase.from('inscriptions').insert([{ contact_id:contactId, dossier, participants:nb, montant, paiement_status:paiementMode==='maintenant'?'en_attente':'reserve', paiement_mode:paiementMode, message:form.message, langue:lang }])
  if (error) throw new Error(error.message)
}

function ModalInclus({ onClose, t }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.55)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:480, boxShadow:'0 24px 60px rgba(0,0,0,.2)', overflow:'hidden' }}>
        <div style={{ padding:'24px 28px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'#EBF3FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Ico name="check" size={18} color="#0073F4" />
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>{t.inclusTitle}</div>
              <div style={{ fontSize:12, color:'#0073F4', fontWeight:600 }}>{t.inclusTarif}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', width:32, height:32, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Ico name="close" size={14} color="#64748b" />
          </button>
        </div>
        <div style={{ padding:'20px 28px 28px' }}>
          {t.inclusList.map((item, i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom: i < t.inclusList.length - 1 ? 14 : 0 }}>
              <div style={{ width:22, height:22, borderRadius:7, background:'#EBF3FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                <Ico name="check" size={12} color="#0073F4" />
              </div>
              <span style={{ fontSize:14, color:'#334155', lineHeight:1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModalDocument({ type, onClose, t }) {
  const isCgv   = type === 'cgv'
  const content = isCgv ? t.cgvContent : t.rgpdContent
  const title   = isCgv ? t.cgvModalTitle : t.rgpdModalTitle

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.55)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:660, maxHeight:'88vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,.2)', overflow:'hidden' }}>

        <div style={{ padding:'24px 28px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background: isCgv?'#EBF3FF':'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Ico name={isCgv?'file':'shield'} size={18} color={isCgv?'#0073F4':'#059669'} />
            </div>
            <div style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', width:32, height:32, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Ico name="close" size={14} color="#64748b" />
          </button>
        </div>

        <div style={{ overflowY:'auto', padding:'20px 28px', flex:1 }}>
          {content.map((s, i) => (
            <div key={i} style={{ marginBottom:20, paddingBottom:20, borderBottom: i<content.length-1?'1px solid #f1f5f9':'none' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background: isCgv?'#0073F4':'#059669', flexShrink:0, display:'inline-block' }} />
                {s.title}
              </div>
              <p style={{ fontSize:13, color:'#475569', lineHeight:1.75, margin:0 }}>{s.text}</p>
            </div>
          ))}
          {isCgv && (
            <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:14, padding:'16px 18px' }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <Ico name="ban" size={18} color="#dc2626" />
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#dc2626', marginBottom:6 }}>{t.nonRembBanner}</div>
                  <p style={{ fontSize:13, color:'#7f1d1d', lineHeight:1.7, margin:0 }}>{t.nonRembBannerText.replace(/\*\*/g,'')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:'16px 28px', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
          <button onClick={onClose} style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#0073F4,#000E91)', border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {t.modalClose}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Inscription() {
  const navigate = useNavigate()
  const { trackFormStart, trackConversion } = useAnalytics()
  const [lang,         setLang]        = useState('fr')
  const t = TR[lang]

  const [etape,        setEtape]        = useState(1)
  const [form,         setForm]         = useState({ nom:'', prenom:'', email:'', telephone:'', organisation:'', poste:'', pays:'', participants:'1', message:'' })
  const [orgSelect,    setOrgSelect]    = useState('')
  const [paiementMode, setPaiementMode] = useState('maintenant')
  const [cgv,          setCgv]          = useState(false)
  const [rgpd,         setRgpd]         = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [errorMsg,     setErrorMsg]     = useState('')
  const [dossierNum,   setDossierNum]   = useState('')
  const [focused,      setFocused]      = useState('')
  const [modal,        setModal]        = useState(null)
  const [showVideo,    setShowVideo]    = useState(false)
  const [showInclus,   setShowInclus]   = useState(false)

  const nb    = parseInt(form.participants) || 1
  const total = nb * PRIX_UNITAIRE

  const handleChange     = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleTypeSelect = typeId => { const meta = TYPE_META[typeId]; if (meta.redirect) navigate(meta.redirectTo); else { trackFormStart('inscription'); setEtape(2) } }

  // Le pays pilote la liste des organisations proposees juste en dessous
  // (evite un menu deroulant unique avec ~90 ports a parcourir). Changer de
  // pays reinitialise la selection d'organisation, car les options ne sont
  // plus les memes.
  const orgOptions = getOrgOptionsForCountry(form.pays)

  const handlePaysChange = e => {
    const val = e.target.value
    setForm(f => ({ ...f, pays: val, organisation: '' }))
    setOrgSelect('')
  }

  // Selection dans le menu deroulant Organisation (filtre par pays). Si
  // "Autre" est choisi, form.organisation reste un champ texte libre saisi
  // par l'utilisateur ; sinon on stocke le libelle localise de l'entree
  // choisie.
  const handleOrgSelect = e => {
    const val = e.target.value
    setOrgSelect(val)
    if (val === PORTS_AUTRE.value) {
      setForm(f => ({ ...f, organisation: '' }))
    } else {
      const opt = findPortByValue(val)
      setForm(f => ({ ...f, organisation: opt ? opt.label[lang] : '' }))
    }
  }

  // Si la langue change apres selection d'une organisation (hors "Autre"),
  // on re-synchronise le libelle stocke avec la nouvelle langue.
  const handleLangSwitch = () => {
    setLang(l => {
      const next = l === 'fr' ? 'en' : 'fr'
      if (orgSelect && orgSelect !== PORTS_AUTRE.value) {
        const opt = findPortByValue(orgSelect)
        if (opt) setForm(f => ({ ...f, organisation: opt.label[next] }))
      }
      return next
    })
  }

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setErrorMsg('')
    const dossier = genDossier()
    try {
      const contactId = await upsertContact(form)
      await createInscription(contactId, form, nb, total, paiementMode, dossier, lang)
      fetch(SHEET_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form,montant:total,dossier,paiement:paiementMode,langue:lang}) }).catch(()=>{})

      // ── Generation des 2 documents (Attestation + Proforma) ──
      // download:false => on recupere l'objet jsPDF sans declencher le
      // telechargement automatique, pour pouvoir a la fois le sauvegarder
      // nous-memes (comportement existant conserve, telechargement local)
      // ET l'uploader vers Supabase Storage pour obtenir un lien stable a
      // inserer dans l'email (EmailJS ne gere pas les pieces jointes
      // generees dynamiquement, il faut donc un lien).
      let attestationUrl = ''
      let proformaUrl = ''
      try {
        const attestationDoc = await generateRecapPDF({ form, dossier, nb, total, paiementMode, lang, download: false })
        attestationDoc.save(`COPAF2026-Attestation-${dossier}.pdf`)
        const attestationBlob = attestationDoc.output('blob')
        const attestationPath = `${dossier}-attestation-${lang}.pdf`
        await supabase.storage.from('documents-inscription').upload(attestationPath, attestationBlob, { upsert: true, contentType: 'application/pdf' })
        attestationUrl = supabase.storage.from('documents-inscription').getPublicUrl(attestationPath).data.publicUrl

        const proformaDoc = await generateProformaPDF({ form, dossier, nb, total, lang, download: false })
        const proformaBlob = proformaDoc.output('blob')
        const proformaPath = `${dossier}-proforma-${lang}.pdf`
        await supabase.storage.from('documents-inscription').upload(proformaPath, proformaBlob, { upsert: true, contentType: 'application/pdf' })
        proformaUrl = supabase.storage.from('documents-inscription').getPublicUrl(proformaPath).data.publicUrl
      } catch (uploadErr) {
        console.error('Erreur generation/upload documents:', uploadErr)
        // Repli : si l'upload echoue, on tente au moins le telechargement
        // direct habituel pour que le participant reparte avec son document.
        try { generateRecapPDF({ form, dossier, nb, total, paiementMode, lang }) } catch {}
      }

      // L'envoi de l'email se fait APRES la generation/upload des documents,
      // pour que les liens {{attestation_url}} et {{proforma_url}} soient
      // deja disponibles au moment ou EmailJS construit le message.
      const templateId = lang === 'en' ? EMAILJS_TPL_EN : EMAILJS_TPL_FR
      const locale = lang === 'en' ? 'en-US' : 'fr-FR'
      await emailjs.send(EMAILJS_SVC, templateId, {
        prenom:form.prenom, nom:form.nom, email:form.email, organisation:form.organisation,
        poste:form.poste, pays:form.pays, participants:form.participants,
        montant:`${total.toLocaleString(locale)} EUR`, tarif:`${PRIX_UNITAIRE.toLocaleString(locale)} EUR/pers.`,
        dossier, paiement_mode:paiementMode==='maintenant'?'Paiement immediat':'Reservation differee',
        paiement_maintenant:paiementMode==='maintenant'?'true':'', paiement_reserve:paiementMode==='plus_tard'?'true':'',
        langue:lang, attestation_url: attestationUrl, proforma_url: proformaUrl,
      }, EMAILJS_KEY)

      setDossierNum(dossier); setSubmitted(true)
      trackConversion('inscription', paiementMode, total)
    } catch(err) { setErrorMsg(t.errorPrefix + err.message) }
    setLoading(false)
  }

  const inp = name => ({ width:'100%', padding:'13px 16px', fontSize:15, fontFamily:'inherit', color:'#0f172a', background:focused===name?'#fff':'#f8fafc', border:`1.5px solid ${focused===name?'#0073F4':'#e2e8f0'}`, borderRadius:12, outline:'none', transition:'all .2s', boxSizing:'border-box', boxShadow:focused===name?'0 0 0 3px rgba(0,115,244,.12)':'none', WebkitAppearance:'none', appearance:'none' })
  const lbl = { display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html{overflow-x:clip;scroll-behavior:smooth;}
        body{overflow-x:clip;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,115,244,.35)}50%{box-shadow:0 0 0 10px rgba(0,115,244,0)}}
        .fade-up{animation:fadeUp .5s ease both}
        .fade-up-1{animation:fadeUp .5s .05s ease both}
        .fade-up-2{animation:fadeUp .5s .15s ease both}
        .fade-up-3{animation:fadeUp .5s .25s ease both}
        .scale-in{animation:scaleIn .4s ease both}
        .spinner{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
        .type-card{background:#fff;border:1.5px solid #e2e8f0;border-radius:20px;padding:28px 24px;cursor:pointer;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,border-color .25s;position:relative;overflow:hidden}
        .type-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,14,145,.12)}
        .type-card:active{transform:scale(.98)}
        @media(max-width:520px){.type-card:hover{transform:none}}
        .cards-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;max-width:960px;margin:0 auto}
        @media(max-width:820px){.cards-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.card-last{grid-column:1/-1;max-width:400px;margin:0 auto;width:100%}}
        @media(max-width:520px){.cards-grid{grid-template-columns:minmax(0,1fr);gap:14px}.card-last{grid-column:auto;max-width:100%}}
        .form-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:24px;align-items:start}
        @media(max-width:880px){.form-layout{grid-template-columns:minmax(0,1fr)}}
        .field-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:16px}
        @media(max-width:540px){.field-row{grid-template-columns:minmax(0,1fr)}}
        .pay-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
        @media(max-width:420px){.pay-grid{grid-template-columns:minmax(0,1fr)}}
        .sidebar{position:sticky;top:100px}
        @media(max-width:880px){.sidebar{position:static}}
        .check-row{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;color:#475569;line-height:1.6;margin-bottom:12px;cursor:pointer}
        .check-row input[type="checkbox"]{width:18px;height:18px;accent-color:#0073F4;flex-shrink:0;margin-top:2px;cursor:pointer}
        .doc-link{color:#0073F4;font-weight:700;text-decoration:underline;cursor:pointer;background:none;border:none;font-family:inherit;font-size:inherit;padding:0;display:inline}
        .doc-link:hover{color:#000E91}
        .submit-btn{width:100%;padding:16px 24px;background:linear-gradient(135deg,#0073F4,#000E91);border:none;border-radius:14px;color:#fff;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:10px;transition:opacity .2s,transform .15s,box-shadow .2s;box-shadow:0 8px 24px rgba(0,115,244,.3)}
        .submit-btn:hover:not(:disabled){opacity:.92;transform:translateY(-1px);box-shadow:0 12px 32px rgba(0,115,244,.4)}
        .submit-btn:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
        .step-dot{width:8px;height:8px;border-radius:50%;transition:all .3s}
        .cta-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;text-decoration:none;border:none;font-family:inherit}
        .lang-switch{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:#fff;border:1.5px solid #e2e8f0;border-radius:100px;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:700;color:#0073F4;transition:all .2s}
        .lang-switch:hover{border-color:#0073F4;background:#EBF3FF}
        @media(max-width:768px){input,select,textarea{font-size:16px !important}}
      `}</style>

      {modal && <ModalDocument type={modal} onClose={() => setModal(null)} t={t} />}

      {showVideo && (
        <div onClick={() => setShowVideo(false)} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.7)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#000', borderRadius:16, width:'100%', maxWidth:820, boxShadow:'0 24px 60px rgba(0,0,0,.4)', overflow:'hidden', position:'relative' }}>
            <button onClick={() => setShowVideo(false)} style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,.15)', border:'none', width:36, height:36, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
              <Ico name="close" size={16} color="#fff" />
            </button>
            <video src="/inscriptioncopaf.mp4" controls autoPlay style={{ width:'100%', display:'block', maxHeight:'80vh' }} />
          </div>
        </div>
      )}

      {showInclus && <ModalInclus onClose={() => setShowInclus(false)} t={t} />}

      <section id="inscription" style={{ padding:'clamp(64px,10vw,120px) 0', background:'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', minHeight:'100vh', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(circle at 10% 15%,rgba(0,115,244,.08) 0%,transparent 50%),radial-gradient(circle at 90% 85%,rgba(0,14,145,.06) 0%,transparent 50%)' }} />

        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto', padding:'0 clamp(16px,5vw,48px)', minWidth:0 }}>

          {/* SELECTEUR DE LANGUE */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
            <button className="lang-switch" onClick={handleLangSwitch} type="button">
              <Ico name="globe" size={14} color="#0073F4" />
              {lang === 'fr' ? 'FR \u00B7 English' : 'EN \u00B7 Fran\u00E7ais'}
            </button>
          </div>

          {/* HEADER */}
          <div className="fade-up" style={{ textAlign:'center', marginBottom:'clamp(40px,6vw,72px)' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#000E91', borderRadius:100, padding:'8px 22px', marginBottom:24 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#0073F4', flexShrink:0 }} />
              <span style={{ color:'#fff', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase' }}>{t.kicker}</span>
            </div>
            <h2 style={{ fontSize:'clamp(24px,5vw,54px)', fontWeight:900, color:'#0f172a', marginBottom:16, lineHeight:1.1, letterSpacing:'-0.03em' }}>
              {etape===1
                ? <>{t.titleStep1a}<span style={{ background:'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{t.titleStep1b}</span></>
                : <>{t.titleStep2a}<span style={{ background:'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{t.titleStep2b}</span></>}
            </h2>
            <p style={{ fontSize:'clamp(14px,2vw,17px)', color:'#64748b', maxWidth:500, margin:'0 auto', lineHeight:1.8 }}>
              {etape===1 ? t.subtitleStep1 : t.subtitleStep2}
            </p>
            {etape===1 && (
              <button onClick={() => setShowVideo(true)} style={{
                display:'inline-flex', alignItems:'center', gap:8, marginTop:18,
                padding:'10px 20px', background:'#fff', border:'1.5px solid #e2e8f0',
                borderRadius:100, cursor:'pointer', fontFamily:'inherit',
                fontSize:13, fontWeight:700, color:'#0073F4', transition:'all .2s',
              }}
                onMouseEnter={e => {e.currentTarget.style.borderColor='#0073F4'; e.currentTarget.style.background='#EBF3FF'}}
                onMouseLeave={e => {e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#fff'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0073F4"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {t.tutoBtn}
              </button>
            )}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:20 }}>
              {[1,2].map(s => <div key={s} className="step-dot" style={{ width:etape===s?24:8, background:etape===s?'#0073F4':'#cbd5e1', borderRadius:etape===s?4:'50%' }} />)}
            </div>
            {etape===2 && !submitted && (
              <button onClick={() => setEtape(1)} style={{ background:'none', border:'1.5px solid #e2e8f0', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, color:'#475569', fontSize:13, fontWeight:600, padding:'8px 18px', borderRadius:100, marginTop:16, fontFamily:'inherit', transition:'all .2s' }}
                onMouseEnter={e => {e.currentTarget.style.borderColor='#0073F4';e.currentTarget.style.color='#0073F4'}}
                onMouseLeave={e => {e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#475569'}}>
                {t.backBtn}
              </button>
            )}
          </div>

          {/* ETAPE 1 */}
          {etape===1 && (
            <div className="cards-grid">
              {TYPE_IDS.map((typeId, idx) => {
                const meta = TYPE_META[typeId]
                const tt   = t.types[typeId]
                const prix = lang === 'fr' ? meta.prix : TYPE_PRIX_EN[typeId]
                return (
                  <div key={typeId} className={`type-card fade-up-${idx+1}${idx===2?' card-last':''}`} onClick={() => handleTypeSelect(typeId)}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${meta.color},${meta.color}99)`, borderRadius:'18px 18px 0 0' }} />
                    {meta.redirect && <div style={{ position:'absolute', top:16, right:16, background:meta.bg, border:`1px solid ${meta.color}30`, borderRadius:100, padding:'3px 10px', fontSize:10, color:meta.color, fontWeight:700 }}>{t.pageDediee}</div>}
                    <div style={{ width:52, height:52, borderRadius:15, background:meta.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, marginTop:8, border:`1px solid ${meta.color}20` }}>
                      <Ico name={meta.icon} size={24} color={meta.color} />
                    </div>
                    <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:4 }}>{tt.label}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:meta.color, marginBottom:14 }}>{tt.sublabel}</div>
                    <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.7, marginBottom:20 }}>{tt.desc}</p>
                    <div style={{ background:meta.bg, borderRadius:12, padding:'12px 16px', marginBottom:typeId==='participant'?10:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>{prix}</span>
                      <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{tt.tag}</span>
                    </div>
                    {typeId === 'participant' && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setShowInclus(true) }}
                        style={{
                          display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
                          padding:0, marginBottom:18, cursor:'pointer', fontFamily:'inherit',
                          fontSize:12, fontWeight:700, color:'#0073F4', textDecoration:'underline',
                        }}
                      >
                        <Ico name="check" size={13} color="#0073F4" />
                        {t.voirInclus}
                      </button>
                    )}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', background:`linear-gradient(135deg,${meta.color},${meta.color}cc)`, borderRadius:12, color:'#fff', fontSize:13, fontWeight:700 }}>
                      <span>{tt.cta}</span>
                      <Ico name="arrow" size={16} color="#fff" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ETAPE 2 */}
          {etape===2 && (
            <div className="form-layout scale-in">

              <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:24, padding:'clamp(20px,5vw,44px)', boxShadow:'0 8px 40px rgba(0,14,145,.07)', minWidth:0 }}>

                {/* SUCCES */}
                {submitted ? (
                  <div className="scale-in" style={{ textAlign:'center', padding:'12px 0' }}>
                    <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#0073F4,#000E91)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 12px 40px rgba(0,115,244,.35)' }}>
                      <Ico name="check" size={36} color="#fff" />
                    </div>
                    <h3 style={{ fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:'#0f172a', marginBottom:8 }}>{paiementMode==='maintenant'?t.successTitlePay:t.successTitleReserve}</h3>
                    <p style={{ fontSize:14, color:'#64748b', marginBottom:24, lineHeight:1.8 }}>{t.successThanks(form.prenom, form.nom)}<strong style={{ color:'#0073F4' }}>{form.email}</strong>.</p>

                    <div style={{ background:'linear-gradient(135deg,#000E91,#0073F4)', borderRadius:16, padding:'20px 32px', display:'inline-block', marginBottom:16, boxShadow:'0 10px 32px rgba(0,14,145,.25)' }}>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.55)', letterSpacing:2.5, textTransform:'uppercase', marginBottom:8 }}>{t.dossierLabel}</div>
                      <div style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:900, color:'#fff', letterSpacing:2 }}>{dossierNum}</div>
                    </div>

                    <div style={{ marginBottom:28 }}>
                      <button
                        onClick={() => generateRecapPDF({ form, dossier: dossierNum, nb, total, paiementMode, lang })}
                        className="cta-btn"
                        style={{ background:'#EBF3FF', color:'#000E91', border:'1.5px solid #bfdbfe', margin:'0 auto' }}
                      >
                        <Ico name="file" size={18} color="#000E91" />
                        {t.downloadPdf}
                      </button>
                    </div>

                    {/* Action requise */}
                    <div style={{ background:'#fffbeb', border:'1.5px solid #fcd34d', borderRadius:16, padding:'20px', marginBottom:24, textAlign:'left' }}>
                      <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:16 }}>
                        <Ico name="alert" size={20} color="#d97706" />
                        <div>
                          <div style={{ fontSize:14, fontWeight:800, color:'#92400e', marginBottom:4 }}>{t.actionTitle}</div>
                          <p style={{ fontSize:13, color:'#78350f', lineHeight:1.7, margin:0 }}>{t.actionText}</p>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        <a href={`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(t.waMsgFinaliser(dossierNum))}`} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ background:'#25D366', color:'#fff' }}>
                          <Ico name="whatsapp" size={18} color="#fff" />
                          WhatsApp
                        </a>
                        <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.emailSubject(dossierNum))}&body=${encodeURIComponent(t.emailBody(dossierNum))}`} className="cta-btn" style={{ background:'#EBF3FF', color:'#000E91', border:'1.5px solid #bfdbfe' }}>
                          <Ico name="mail" size={18} color="#000E91" />
                          Email
                        </a>
                      </div>
                    </div>

                    {/* Etapes suivantes */}
                    <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'16px 20px', textAlign:'left', marginBottom:16 }}>
                      <div style={{ fontSize:10, color:'#0073F4', fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', marginBottom:14 }}>{t.prochainesTitle}</div>
                      {[
                        {icon:'mail',     text:t.steps[0]},
                        {icon:'whatsapp', text:t.steps[1]},
                        {icon:'bank',     text:t.steps[2]},
                        {icon:'card',     text:paiementMode==='maintenant'?t.steps[3].pay:t.steps[3].reserve},
                        {icon:'badge',    text:t.steps[4]},
                      ].map((step,i,arr) => (
                        <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid #f1f5f9':'none' }}>
                          <div style={{ width:28, height:28, borderRadius:8, background:'#EBF3FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Ico name={step.icon} size={14} color="#0073F4" />
                          </div>
                          <span style={{ fontSize:13, color:'#475569' }}>{step.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Verification anti-fraude */}
                    <div style={{ background:'#EBF3FF', border:'1.5px solid #bfdbfe', borderRadius:12, padding:'14px 16px', display:'flex', gap:10, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', textAlign:'left', marginBottom:16 }}>
                      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                        <Ico name="shield" size={16} color="#0073F4" />
                        <p style={{ fontSize:12.5, color:'#1e40af', lineHeight:1.6, margin:0 }}>{t.verifRib}</p>
                      </div>
                      <a href="/verifier" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, fontWeight:700, color:'#0073F4', textDecoration:'underline', whiteSpace:'nowrap' }}>{t.verifNow}</a>
                    </div>

                    {/* Rappel non-remboursement */}
                    <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start', textAlign:'left' }}>
                      <Ico name="ban" size={16} color="#dc2626" />
                      <p style={{ fontSize:12.5, color:'#7f1d1d', lineHeight:1.65, margin:0 }}><strong>{t.rappelTitle}</strong>{t.rappelText}</p>
                    </div>
                  </div>

                ) : (
                  /* FORMULAIRE */
                  <form onSubmit={handleSubmit} noValidate style={{ minWidth:0 }}>
                    <h3 style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginBottom:28, textAlign:'center' }}>{t.formTitle}</h3>

                    <div className="field-row">
                      {[{name:'nom',ph:t.ph.nom},{name:'prenom',ph:t.ph.prenom}].map(f => (
                        <div key={f.name}><label style={lbl}>{t.fields[f.name]}</label><input name={f.name} type="text" required value={form[f.name]} onChange={handleChange} placeholder={f.ph} style={inp(f.name)} onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')} /></div>
                      ))}
                    </div>

                    <div className="field-row">
                      {[{name:'email',ph:t.ph.email,type:'email'},{name:'telephone',ph:t.ph.telephone,type:'tel'}].map(f => (
                        <div key={f.name}><label style={lbl}>{t.fields[f.name]}</label><input name={f.name} type={f.type} required value={form[f.name]} onChange={handleChange} placeholder={f.ph} style={inp(f.name)} onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')} /></div>
                      ))}
                    </div>

                    <div className="field-row">
                      <div>
                        <label style={lbl}>{t.fields.pays}</label>
                        <select name="pays" required value={form.pays} onChange={handlePaysChange} style={{ ...inp('pays'), cursor:'pointer', color:form.pays?'#0f172a':'#94a3b8' }} onFocus={() => setFocused('pays')} onBlur={() => setFocused('')}>
                          <option value="" disabled>{t.paysPlaceholder}</option>
                          {PAYS.map(p => <option key={p.value} value={p.value}>{p.label[lang]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>{t.fields.poste}</label>
                        <input name="poste" type="text" required value={form.poste} onChange={handleChange} placeholder={t.ph.poste} style={inp('poste')} onFocus={() => setFocused('poste')} onBlur={() => setFocused('')} />
                      </div>
                    </div>

                    <div className="field-row">
                      <div>
                        <label style={lbl}>{t.fields.organisation}</label>
                        <select
                          name="orgSelect"
                          required
                          disabled={!form.pays}
                          value={orgSelect}
                          onChange={handleOrgSelect}
                          style={{ ...inp('orgSelect'), cursor: form.pays ? 'pointer' : 'not-allowed', opacity: form.pays ? 1 : 0.6, color: orgSelect ? '#0f172a' : '#94a3b8' }}
                          onFocus={() => setFocused('orgSelect')}
                          onBlur={() => setFocused('')}
                        >
                          <option value="" disabled>{form.pays ? t.orgPlaceholder : t.orgPlaceholderNoCountry}</option>
                          {orgOptions.map(o => (
                            <option key={o.value} value={o.value}>{o.label[lang]}</option>
                          ))}
                        </select>
                        {orgSelect === PORTS_AUTRE.value && (
                          <input
                            name="organisation"
                            type="text"
                            required
                            value={form.organisation}
                            onChange={handleChange}
                            placeholder={t.ph.organisation}
                            style={{ ...inp('organisation'), marginTop:10 }}
                            onFocus={() => setFocused('organisation')}
                            onBlur={() => setFocused('')}
                          />
                        )}
                      </div>
                      <div>
                        <label style={lbl}>{t.fields.participants}</label>
                        <select name="participants" value={form.participants} onChange={handleChange} style={{ ...inp('participants'), cursor:'pointer' }} onFocus={() => setFocused('participants')} onBlur={() => setFocused('')}>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{t.participantsOpt(n)}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom:22 }}>
                      <label style={lbl}>{t.messageLabel}</label>
                      <textarea name="message" rows={3} value={form.message} onChange={handleChange} placeholder={t.messagePh} style={{ ...inp('message'), resize:'vertical', minHeight:80 }} onFocus={() => setFocused('message')} onBlur={() => setFocused('')} />
                    </div>

                    {/* Mode paiement */}
                    <div style={{ marginBottom:18 }}>
                      <label style={lbl}>{t.paiementLabel}</label>
                      <div className="pay-grid">
                        {t.paiementOpts.map(opt => {
                          const active = paiementMode===opt.value
                          const icon = opt.value === 'maintenant' ? 'card' : 'calendar'
                          return (
                            <button key={opt.value} type="button" onClick={() => setPaiementMode(opt.value)} style={{ background:active?'#EBF3FF':'#f8fafc', border:`2px solid ${active?'#0073F4':'#e2e8f0'}`, borderRadius:14, padding:'14px 16px', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all .2s', display:'flex', flexDirection:'column', gap:8, minHeight:75 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:32, height:32, borderRadius:8, background:active?'#fff':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
                                  <Ico name={icon} size={16} color={active?'#0073F4':'#64748b'} />
                                </div>
                                <span style={{ fontSize:13, fontWeight:700, color:active?'#000E91':'#334155' }}>{opt.title}</span>
                              </div>
                              <span style={{ fontSize:11.5, color:'#64748b', lineHeight:1.4, paddingLeft:40 }}>{opt.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Alerte non-remboursement + confirmation, fusionnee */}
                    <div style={{ background:'#fffbeb', border:'1.5px solid #fcd34d', borderRadius:14, padding:'16px 18px', marginBottom:22, display:'flex', gap:10, alignItems:'flex-start' }}>
                      <Ico name="info" size={18} color="#d97706" />
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:6 }}>{t.avantValiderTitle}</div>
                        <p style={{ fontSize:12, color:'#78350f', lineHeight:1.65, margin:'0 0 6px' }}>{t.avantValider1.replace(/\*\*/g,'')}</p>
                        <p style={{ fontSize:12, color:'#78350f', lineHeight:1.65, margin:0 }}>{t.avantValider2}</p>
                      </div>
                    </div>

                    <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:14, padding:'16px 18px', marginBottom:18, display:'flex', gap:10, alignItems:'flex-start' }}>
                      <Ico name="shield" size={18} color="#991b1b" />
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:'#991b1b', marginBottom:6 }}>{t.securityTitle}</div>
                        <div style={{ fontSize:12, color:'#7f1d1d', lineHeight:1.7 }}>{t.securityText}</div>
                      </div>
                    </div>

                    {/* CGV & RGPD */}
                    <div style={{ marginBottom:24 }}>
                      <label className="check-row">
                        <input type="checkbox" checked={cgv} onChange={e => setCgv(e.target.checked)} required />
                        <span>{t.cgvLabel}<button type="button" className="doc-link" onClick={() => setModal('cgv')}>{t.cgvLink}</button>{t.cgvSuffix}</span>
                      </label>
                      <label className="check-row">
                        <input type="checkbox" checked={rgpd} onChange={e => setRgpd(e.target.checked)} required />
                        <span>{t.rgpdLabel}<button type="button" className="doc-link" onClick={() => setModal('rgpd')}>{t.rgpdLink}</button>{t.rgpdSuffix}</span>
                      </label>
                    </div>

                    {errorMsg && (
                      <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#dc2626', marginBottom:18, display:'flex', gap:8, alignItems:'flex-start' }}>
                        <Ico name="alert" size={16} color="#dc2626" />
                        {errorMsg}
                      </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading || !cgv || !rgpd}>
                      {loading ? <><div className="spinner" /> {t.submitLoading}</> : <>{paiementMode==='maintenant'?t.submitPay:t.submitReserve} <Ico name="arrow" size={16} color="#fff" /></>}
                    </button>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:14 }}>
                      <Ico name="lock" size={13} color="#94a3b8" />
                      <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>{t.secureNote}</p>
                    </div>
                  </form>
                )}
              </div>

              {/* SIDEBAR */}
              <div className="sidebar" style={{ minWidth:0, display:'flex', flexDirection:'column', gap:16 }}>

                <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:20, padding:'24px 20px', boxShadow:'0 4px 20px rgba(0,14,145,.06)' }}>
                  <div style={{ fontSize:10, color:'#0073F4', fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', marginBottom:16 }}>{t.recapTitle}</div>
                  {[{l:t.recapParticipants,v:nb},{l:t.recapTarif,v:`${PRIX_UNITAIRE.toLocaleString(lang==='fr'?'fr-FR':'en-US')} EUR`}].map((r,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14, color:'#64748b', padding:'10px 0', borderBottom:'1px solid #f1f5f9', gap:8 }}>
                      <span>{r.l}</span><strong style={{ color:'#0f172a' }}>{r.v}</strong>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, padding:'14px 16px', background:'linear-gradient(135deg,#000E91,#0073F4)', borderRadius:12 }}>
                    <span style={{ color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:600 }}>{t.recapTotal}</span>
                    <span style={{ fontSize:22, fontWeight:900, color:'#fff' }}>{total.toLocaleString(lang==='fr'?'fr-FR':'en-US')} EUR</span>
                  </div>
                </div>

                <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:20, padding:'22px 20px', boxShadow:'0 4px 20px rgba(0,14,145,.06)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:'#EBF3FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Ico name="bank" size={18} color="#0073F4" />
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{t.virementTitle}</div>
                  </div>
                  {[{l:lang==='fr'?'Banque':'Bank',v:'SGBE Benin'},{l:'IBAN',v:'BJ66 BJ083 01001 00050273980 97'},{l:'BIC',v:'SGBEBJ BX'},{l:lang==='fr'?'Titulaire':'Account holder',v:'COPAF 2026'}].map((item,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, padding:'8px 0', borderBottom:i<3?'1px solid #f1f5f9':'none' }}>
                      <span style={{ fontSize:12, color:'#94a3b8', fontWeight:600, flexShrink:0 }}>{item.l}</span>
                      <span style={{ fontSize:12, color:'#0f172a', fontWeight:700, textAlign:'right', wordBreak:'break-all' }}>{item.v}</span>
                    </div>
                  ))}
                  <a href="/verifier" target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    marginTop: 14, padding: '9px', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 10, color: '#0073F4', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  }}>
                    <Ico name="shield" size={13} color="#0073F4" />
                    {t.verifAuth}
                  </a>
                </div>

                <div style={{ background:'#EBF3FF', border:'1.5px solid #bfdbfe', borderRadius:20, padding:'20px' }}>
                  <div style={{ fontSize:10, color:'#000E91', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>{t.aideTitle}</div>
                  {[{icon:'phone',text:'+229 01 97 67 22 00'},{icon:'mail',text:'inscriptions@copaf-ports.com'},{icon:'globe',text:'www.copaf-ports.com'}].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#1e40af', fontWeight:500, marginBottom:i<2?10:0 }}>
                      <Ico name={item.icon} size={15} color="#0073F4" />
                      <span style={{ wordBreak:'break-word', overflowWrap:'break-word' }}>{item.text}</span>
                    </div>
                  ))}
                  <a href={`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(t.waMsgQuestion)}`} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:14, padding:'11px', background:'#25D366', borderRadius:12, color:'#fff', fontSize:13, fontWeight:700, textDecoration:'none', transition:'opacity .2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    <Ico name="whatsapp" size={16} color="#fff" />
                    {t.waContact}
                  </a>
                </div>

                <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:16, padding:'16px' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                    <Ico name="ban" size={16} color="#dc2626" />
                    <div style={{ fontSize:11, fontWeight:700, color:'#dc2626', textTransform:'uppercase', letterSpacing:.5 }}>{t.nonRembTitle}</div>
                  </div>
                  <p style={{ fontSize:12, color:'#7f1d1d', lineHeight:1.65, margin:0 }}>
                    {t.nonRembText}
                    <button type="button" className="doc-link" style={{ fontSize:12, color:'#dc2626' }} onClick={() => setModal('cgv')}>{t.nonRembCgv}</button>
                    {t.nonRembSuffix}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}