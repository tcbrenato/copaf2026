import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import { useLang } from '../i18n/useLang'

// ─── SHEET URL ────────────────────────────────────────────────────────────────
const SHEET_URL = import.meta.env.VITE_SHEET_URL_INSCRIPTIONS

// ─── ROUTE VERS LA PAGE "VISITER L'EXPOSITION" ─────────────────────────────────
const VISITER_ROUTE = '/visiter'

// ─── ICONES SVG ──────────────────────────────────────────────────────────────
const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    leaf:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
    calendar:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    barChart:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    target:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    zap:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    globe:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    tablet:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    mic:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    archive:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    check:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    checkCircle:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    star:       <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    plus:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    minus:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    close:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    arrow:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    arrowRight: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    mail:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    send:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    users:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    map:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    clock:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    shield:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    trending:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    wifi:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 16 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    monitor:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
    eye:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  }
  return icons[name] || null
}

// ─── TEXTES & DONNÉES (fr / en) ───────────────────────────────────────────────
const TR = {
  fr: {
    floatCta: 'Réserver ma place',
    heroBadge: 'CASABLANCA · MAROC · 2026',
    heroA: "L'Exposition",
    heroB: '100% Digitale',
    heroSub: "Votre technologie directement dans les mains des décideurs portuaires - sans stand, sans logistique, avec plus d'impact.",
    btnBook: 'Réserver ma place',
    btnVisit: "Visiter l'exposition",
    whyEyebrow: 'Pourquoi digital ?',
    whyTitle: "5 raisons de choisir l'exposition digitale",
    cmpEyebrow: 'Stand classique vs Digital',
    cmpTitle: 'Un tableau qui convainc en 30 secondes',
    cmpCriterion: 'Critère',
    cmpPhysical: 'Stand Physique',
    cmpDigital: 'COPAF Digital',
    cmpPhysShort: 'Physique',
    cmpDigShort: 'Digital',
    pilEyebrow: 'Le dispositif',
    pilTitle: '4 piliers pour une présence maximale',
    pilSub: 'Cliquez sur chaque pilier pour découvrir les détails.',
    pillar: 'PILIER',
    learnMore: 'En savoir plus',
    wfEyebrow: 'Le parcours exposant',
    wfTitle: "5 étapes, de l'inscription au rapport",
    offerEyebrow: 'Notre offre',
    offerTitle: 'Une formule unique, tout inclus',
    offerSub: 'Un tarif simple et accessible pour une visibilité maximale.',
    offerName: 'Exposition Digitale',
    oneOff: 'paiement unique',
    faqEyebrow: 'Questions fréquentes',
    faqTitle: 'Tout ce que vous devez savoir',
    sentTitle: 'Demande reçue !',
    sentBefore: 'Notre équipe COPAF vous contactera dans les ',
    sentStrong: '24 heures',
    sentAfter: ' pour confirmer votre exposition.',
    formTitle: 'Réservez votre exposition',
    formSub: 'Soumettez votre demande pour COPAF 2026. Notre équipe vous contacte sous 24h.',
    company: 'Entreprise *', companyPh: 'Ex : Port Tech Solutions',
    sector: 'Secteur', sectorPh: 'Ex : Logistique portuaire',
    name: 'Nom & Prénom *', namePh: 'Prénom Nom',
    role: 'Poste', rolePh: 'Ex : Directeur Général',
    email: 'Email *',
    phone: 'Téléphone / WhatsApp',
    offerLine: 'Offre Exposition Digitale',
    offerPrice: '2 000 €',
    goals: 'Vos objectifs pour COPAF 2026',
    goalsPh: "Ex : Trouver des partenaires en Afrique de l'Ouest, présenter notre solution...",
    sending: 'Envoi en cours...',
    send: 'Envoyer ma demande',
    replyNote: 'Notre équipe vous répondra sous 24h ouvrées.',
    errFill: 'Veuillez remplir : entreprise, nom et email.',
    errEmail: 'Adresse email invalide.',
    errPrefix: 'Erreur : ',
    footer: '© 2026 COPAF - Casablanca · Exposition 100% Digitale · Tous droits réservés',
    stats: [
      { num: '500+', label: 'Décideurs présents',   icon: 'users'    },
      { num: '32',   label: 'Pays représentés',     icon: 'map'      },
      { num: '12',   label: 'Mois de visibilité',   icon: 'calendar' },
      { num: '0 €',  label: 'Frais de transport',   icon: 'zap'      },
    ],
    avantages: [
      { icon: 'leaf',     title: 'Impact Carbone Zéro',   desc: 'Aucun transport de matériel physique. Empreinte écologique nulle.' },
      { icon: 'calendar', title: 'Visibilité 365 jours',  desc: 'Votre stand reste en ligne un an après la conférence.' },
      { icon: 'barChart', title: 'Data Précise',          desc: 'Rapport détaillé des vues, clics et contacts inclus.' },
      { icon: 'target',   title: 'Lead Gen Direct',       desc: 'Les décideurs vous contactent en un clic depuis la vitrine.' },
      { icon: 'zap',      title: 'Zéro Logistique',       desc: 'Concentrez-vous sur vos pitchs, nous gérons le reste.' },
    ],
    comparaison: [
      { critere: 'Coût transport & montage',  classique: '5 000 € – 20 000 €',   digital: '0 €' },
      { critere: 'Frais de douane',           classique: 'Imprévisibles',        digital: 'Aucun' },
      { critere: 'Durée de visibilité',       classique: '2 – 3 jours',          digital: '12 mois' },
      { critere: 'Mesure de performance',     classique: 'Impossible',           digital: 'Rapport PDF inclus' },
      { critere: 'Accès aux décideurs',       classique: 'Sur place uniquement', digital: 'Sur place + à distance' },
      { critere: 'Accessible aux PME',        classique: 'Budget prohibitif',    digital: '2 000 € tout inclus' },
      { critere: 'Bilan carbone',             classique: 'Impact lourd',         digital: 'Impact zéro' },
    ],
    piliers: [
      {
        id: '01', color: '#0073F4', icon: 'globe',
        title: 'Vitrine Web Exclusive',
        short: 'Votre hub digital permanent sur le portail COPAF.',
        full: "Dès votre inscription, nous créons une page dédiée hautement optimisée pour le SEO. Elle inclut votre présentation stratégique, vos liens officiels et un formulaire de captation de leads direct.",
        features: ['Indexation Google garantie', 'Formulaire de contact direct', 'Statistiques en temps réel'],
      },
      {
        id: '02', color: '#000E91', icon: 'tablet',
        title: 'Immersion Tablettes',
        short: 'Vos solutions préchargées sur les outils des participants confirmés.',
        full: "À Casablanca, chaque participant confirmé reçoit une tablette tactile haut de gamme. Vos brochures et vidéos y sont intégrées nativement pour une consultation fluide, même sans connexion internet.",
        features: ['Accès 100% Offline', 'Lecture vidéo fluide', 'Expérience tactile premium'],
      },
      {
        id: '03', color: '#0073F4', icon: 'mic',
        title: 'Session Pitch & Demo',
        short: 'Une prise de parole magistrale en auditorium.',
        full: "Bénéficiez d'un créneau stratégique dans le programme officiel pour présenter vos innovations devant l'ensemble des délégations et autorités portuaires présentes.",
        features: ['Auditorium de 500+ décideurs', 'Captation vidéo HD offerte', 'QR Code interactif sur écran'],
      },
      {
        id: '04', color: '#000E91', icon: 'archive',
        title: 'Héritage Post-Event',
        short: 'Une visibilité qui dure 12 mois après Casablanca.',
        full: "L'exposition ne s'arrête pas à la clôture. Votre vitrine reste active pendant un an sur le site COPAF, servant de référence pour les futurs appels d'offres du secteur.",
        features: ['Référencement annuel', 'Inclusion dans les Actes officiels', 'Réseautage continu'],
      },
    ],
    workflow: [
      { num: '1', title: 'Inscription',      desc: 'Choix de formule et paiement sécurisé.' },
      { num: '2', title: 'Upload',           desc: 'Dépôt de logos, PDF et vidéos via votre espace privé.' },
      { num: '3', title: 'Validation',       desc: 'Notre équipe publie votre vitrine et génère votre Smart Badge.' },
      { num: '4', title: 'Live Casablanca',  desc: 'Pitch en auditorium + démos sur tablettes lors des pauses réseau.' },
      { num: '5', title: 'Rapport PDF',      desc: 'Vues, contacts générés et téléchargements détaillés post-event.' },
    ],
    offerPriceValue: '2 000',
    offerFeatures: [
      'Vitrine digitale sur copaf-ports.com, avec mise en relation directe avec les décideurs et acteurs clés du secteur',
      'Visibilité sur la carte interactive des pays participants du site',
      'Espace publicitaire et publirédactionnel dans le tout premier numéro du Magazine des Ports Africains (MPA), diffusé en physique à Casablanca et en numérique',
      "Visibilité grand format devant l'audience de la conférence, sur place à Casablanca",
    ],
    faqs: [
      { q: "Qui gère les tablettes sur place ?", a: "COPAF met à disposition des tablettes aux participants confirmés. Notre équipe assure l'intégralité de la logistique : acquisition, préchargement, distribution et collecte en fin d'événement." },
      { q: "Comment fonctionne le mode offline ?", a: "Grâce à la technologie Service Worker, tous vos fichiers sont téléchargés avant l'événement. Les participants y accèdent instantanément même sans Wi-Fi." },
      { q: "Comment le rapport est-il produit ?", a: "Chaque participant est authentifié via son badge QR. Chaque consultation, téléchargement ou clic sur votre vitrine est tracé nominalement." },
      { q: "Ma vitrine reste-t-elle 12 mois en ligne ?", a: "Oui, sans frais supplémentaires. Votre page reste indexée sur le portail COPAF et accessible via Google pendant 12 mois." },
      { q: "Puis-je modifier mes contenus après l'upload ?", a: "Oui, jusqu'à 7 jours avant l'événement. Passé ce délai, les fichiers sont verrouillés pour le préchargement sur les tablettes." },
      { q: "Quelle est la date limite d'inscription ?", a: "30 jours avant la conférence. Il est conseillé de s'inscrire au moins 60 jours à l'avance pour une vitrine SEO optimisée." },
    ],
  },
  en: {
    floatCta: 'Book my spot',
    heroBadge: 'CASABLANCA · MOROCCO · 2026',
    heroA: 'The',
    heroB: '100% Digital Exhibition',
    heroSub: 'Your technology directly in the hands of port decision-makers - no booth, no logistics, more impact.',
    btnBook: 'Book my spot',
    btnVisit: 'Visit the exhibition',
    whyEyebrow: 'Why digital?',
    whyTitle: '5 reasons to choose the digital exhibition',
    cmpEyebrow: 'Physical booth vs Digital',
    cmpTitle: 'A table that convinces in 30 seconds',
    cmpCriterion: 'Criterion',
    cmpPhysical: 'Physical Booth',
    cmpDigital: 'COPAF Digital',
    cmpPhysShort: 'Physical',
    cmpDigShort: 'Digital',
    pilEyebrow: 'The set-up',
    pilTitle: '4 pillars for maximum presence',
    pilSub: 'Click on each pillar to discover the details.',
    pillar: 'PILLAR',
    learnMore: 'Learn more',
    wfEyebrow: 'The exhibitor journey',
    wfTitle: '5 steps, from registration to report',
    offerEyebrow: 'Our offer',
    offerTitle: 'A single package, all inclusive',
    offerSub: 'A simple, affordable price for maximum visibility.',
    offerName: 'Digital Exhibition',
    oneOff: 'one-time payment',
    faqEyebrow: 'Frequently asked questions',
    faqTitle: 'Everything you need to know',
    sentTitle: 'Request received!',
    sentBefore: 'Our COPAF team will contact you within ',
    sentStrong: '24 hours',
    sentAfter: ' to confirm your exhibition.',
    formTitle: 'Book your exhibition',
    formSub: 'Submit your request for COPAF 2026. Our team will contact you within 24h.',
    company: 'Company *', companyPh: 'E.g. Port Tech Solutions',
    sector: 'Sector', sectorPh: 'E.g. Port logistics',
    name: 'Full name *', namePh: 'First name Last name',
    role: 'Position', rolePh: 'E.g. General Manager',
    email: 'Email *',
    phone: 'Phone / WhatsApp',
    offerLine: 'Digital Exhibition offer',
    offerPrice: '€2,000',
    goals: 'Your goals for COPAF 2026',
    goalsPh: 'E.g. Find partners in West Africa, present our solution...',
    sending: 'Sending...',
    send: 'Send my request',
    replyNote: 'Our team will reply within 24 working hours.',
    errFill: 'Please fill in: company, name and email.',
    errEmail: 'Invalid email address.',
    errPrefix: 'Error: ',
    footer: '© 2026 COPAF - Casablanca · 100% Digital Exhibition · All rights reserved',
    stats: [
      { num: '500+', label: 'Decision-makers attending', icon: 'users'    },
      { num: '32',   label: 'Countries represented',     icon: 'map'      },
      { num: '12',   label: 'Months of visibility',      icon: 'calendar' },
      { num: '€0',   label: 'Transport costs',           icon: 'zap'      },
    ],
    avantages: [
      { icon: 'leaf',     title: 'Zero Carbon Impact',  desc: 'No physical equipment shipped. Zero ecological footprint.' },
      { icon: 'calendar', title: '365-Day Visibility',  desc: 'Your booth stays online for a year after the conference.' },
      { icon: 'barChart', title: 'Accurate Data',       desc: 'Detailed report of views, clicks and contacts included.' },
      { icon: 'target',   title: 'Direct Lead Gen',     desc: 'Decision-makers contact you in one click from your showcase.' },
      { icon: 'zap',      title: 'Zero Logistics',      desc: 'Focus on your pitches, we handle the rest.' },
    ],
    comparaison: [
      { critere: 'Transport & set-up cost',   classique: '€5,000 – €20,000',    digital: '€0' },
      { critere: 'Customs fees',              classique: 'Unpredictable',       digital: 'None' },
      { critere: 'Duration of visibility',    classique: '2 – 3 days',          digital: '12 months' },
      { critere: 'Performance measurement',   classique: 'Impossible',          digital: 'PDF report included' },
      { critere: 'Access to decision-makers', classique: 'On site only',        digital: 'On site + remote' },
      { critere: 'Accessible to SMEs',        classique: 'Prohibitive budget',  digital: '€2,000 all-inclusive' },
      { critere: 'Carbon footprint',          classique: 'Heavy impact',        digital: 'Zero impact' },
    ],
    piliers: [
      {
        id: '01', color: '#0073F4', icon: 'globe',
        title: 'Exclusive Web Showcase',
        short: 'Your permanent digital hub on the COPAF portal.',
        full: 'From the moment you register, we create a dedicated page highly optimised for SEO. It includes your strategic presentation, your official links and a direct lead-capture form.',
        features: ['Guaranteed Google indexing', 'Direct contact form', 'Real-time statistics'],
      },
      {
        id: '02', color: '#000E91', icon: 'tablet',
        title: 'Tablet Immersion',
        short: 'Your solutions preloaded on the tools of confirmed participants.',
        full: 'In Casablanca, each confirmed participant receives a high-end touchscreen tablet. Your brochures and videos are natively built in for smooth viewing, even without an internet connection.',
        features: ['100% offline access', 'Smooth video playback', 'Premium touch experience'],
      },
      {
        id: '03', color: '#0073F4', icon: 'mic',
        title: 'Pitch & Demo Session',
        short: 'A masterful address in the auditorium.',
        full: 'Benefit from a strategic slot in the official programme to present your innovations to all the delegations and port authorities present.',
        features: ['Auditorium of 500+ decision-makers', 'Free HD video recording', 'Interactive QR code on screen'],
      },
      {
        id: '04', color: '#000E91', icon: 'archive',
        title: 'Post-Event Legacy',
        short: 'Visibility that lasts 12 months after Casablanca.',
        full: 'The exhibition does not end at the close. Your showcase stays active for a year on the COPAF site, serving as a reference for future tenders in the sector.',
        features: ['Annual listing', 'Inclusion in the official Proceedings', 'Continuous networking'],
      },
    ],
    workflow: [
      { num: '1', title: 'Registration',    desc: 'Choice of package and secure payment.' },
      { num: '2', title: 'Upload',          desc: 'Submission of logos, PDFs and videos via your private space.' },
      { num: '3', title: 'Validation',      desc: 'Our team publishes your showcase and generates your Smart Badge.' },
      { num: '4', title: 'Live Casablanca', desc: 'Auditorium pitch + demos on tablets during networking breaks.' },
      { num: '5', title: 'PDF Report',      desc: 'Views, generated contacts and downloads detailed after the event.' },
    ],
    offerPriceValue: '2,000',
    offerFeatures: [
      'Digital showcase on copaf-ports.com, with direct connection to decision-makers and key players in the sector',
      "Visibility on the site's interactive map of participating countries",
      'Advertising and advertorial space in the very first issue of the African Ports Magazine (MPA), distributed in print in Casablanca and digitally',
      'Large-format visibility in front of the conference audience, on site in Casablanca',
    ],
    faqs: [
      { q: 'Who manages the tablets on site?', a: 'COPAF provides tablets to confirmed participants. Our team handles all the logistics: purchase, preloading, distribution and collection at the end of the event.' },
      { q: 'How does offline mode work?', a: 'Thanks to Service Worker technology, all your files are downloaded before the event. Participants access them instantly even without Wi-Fi.' },
      { q: 'How is the report produced?', a: 'Each participant is authenticated via their QR badge. Every view, download or click on your showcase is tracked by name.' },
      { q: 'Does my showcase stay online for 12 months?', a: 'Yes, at no extra cost. Your page stays indexed on the COPAF portal and accessible via Google for 12 months.' },
      { q: 'Can I change my content after uploading?', a: 'Yes, up to 7 days before the event. After that, the files are locked for preloading onto the tablets.' },
      { q: 'What is the registration deadline?', a: '30 days before the conference. We recommend registering at least 60 days in advance for an optimised SEO showcase.' },
    ],
  },
}

// Couleur d'accent de l'offre unique (les textes sont dans TR)
const OFFER = { color: '#0073F4' }

// ─── BDD ─────────────────────────────────────────────────────────────────────
async function upsertContact({ email, nom, telephone, organisation, secteur }) {
  const { data, error } = await supabase.rpc('public_upsert_contact', {
    p_email: email, p_source: 'exposant', p_nom: nom, p_telephone: telephone, p_organisation: organisation, p_poste: secteur,
  })
  if (error) throw new Error(error.message)
  return data
}

async function createExposant({ contactId, entreprise, secteur, forfait, goals }) {
  const { error } = await supabase.from('exposants').insert([{ contact_id: contactId, entreprise, secteur, forfait, statut: 'nouveau', goals }])
  if (error) throw new Error(error.message)
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ─── SECTION ─────────────────────────────────────────────────────────────────
function Section({ children, alt, id }) {
  const [ref, visible] = useScrollReveal()
  return (
    <section ref={ref} id={id} style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,60px)', background: alt ? '#f8faff' : '#fff', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity .6s ease, transform .6s ease' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,56px)' }}>
      <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#0073F4', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 }}>{eyebrow}</div>
      <h2 style={{ fontSize: 'clamp(22px,4.5vw,40px)', fontWeight: 900, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ color: '#64748b', fontSize: 'clamp(14px,2vw,16px)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>{sub}</p>}
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function ExpositionDigitale() {
  const navigate = useNavigate()
  const t = TR[useLang()]
  const [activeModal,  setActiveModal]  = useState(null)
  const [selectedPlan] = useState('EXPOSITION')
  const [openFaq,      setOpenFaq]      = useState(null)
  const [focused,      setFocused]      = useState('')
  const [floatVisible, setFloatVisible] = useState(false)
  const [formData,     setFormData]     = useState({ company:'', sector:'', name:'', role:'', email:'', phone:'', goals:'' })
  const [formError,    setFormError]    = useState('')
  const [formSent,     setFormSent]     = useState(false)
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    const fn = () => setFloatVisible(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const modal = activeModal ? t.piliers.find(p => p.id === activeModal) : null
  const scrollTo   = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const handleField = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))

  const inp = name => ({
    width: '100%', padding: '13px 16px', fontSize: 15, fontFamily: 'inherit', color: '#0f172a',
    background: focused === name ? '#fff' : '#f8fafc',
    border: `1.5px solid ${focused === name ? '#0073F4' : '#e2e8f0'}`,
    borderRadius: 12, outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,115,244,.12)' : 'none',
    WebkitAppearance: 'none', appearance: 'none',
  })
  const foc = name => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') })
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b', marginBottom: 7 }

  const submitForm = async e => {
    e.preventDefault(); setFormError('')
    if (!formData.company || !formData.name || !formData.email) { setFormError(t.errFill); return }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { setFormError(t.errEmail); return }
    setLoading(true)
    try {
      const contactId = await upsertContact({ email: formData.email, nom: formData.name, telephone: formData.phone, organisation: formData.company, secteur: formData.sector })
      await createExposant({ contactId, entreprise: formData.company, secteur: formData.sector, forfait: selectedPlan, goals: formData.goals })

      // ─── Envoi Google Sheets ───────────────────────────────────────────────
      fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:         'exposant',
          prenom:       formData.name,
          nom:          '',
          email:        formData.email,
          telephone:    formData.phone,
          organisation: formData.company,
          poste:        formData.sector,
          pays:         '',
          participants: 1,
          montant:      selectedPlan,
          dossier:      'EXPO-' + Date.now(),
          paiement:     selectedPlan
        })
      }).catch(() => {})

      setFormSent(true)
    } catch (err) { setFormError(t.errPrefix + err.message) }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#0f172a', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { to   { transform:rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .05s ease both; }
        .fade-up-2 { animation: fadeUp .5s .15s ease both; }
        .fade-up-3 { animation: fadeUp .5s .25s ease both; }
        .spinner   { width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }

        .float-cta { position:fixed;bottom:24px;right:20px;z-index:9999;background:#000E91;color:#fff;border:none;padding:14px 24px;border-radius:50px;font-family:inherit;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 8px 24px rgba(0,14,145,.4);opacity:0;transform:translateY(20px);pointer-events:none;transition:opacity .3s,transform .3s;display:flex;align-items:center;gap:8px; }
        .float-cta.show { opacity:1;transform:translateY(0);pointer-events:auto; }
        .float-cta:hover { background:#0f1f8a; }

        .pilier-card { background:#fff;border:1.5px solid #e2e8f0;border-radius:20px;padding:clamp(20px,4vw,32px);cursor:pointer;transition:all .28s cubic-bezier(.34,1.56,.64,1); }
        .pilier-card:hover { transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,115,244,.13);border-color:#0073F4; }
        .pilier-card:active { transform:scale(.98); }
        @media(max-width:520px){.pilier-card:hover{transform:none}}

        .piliers-grid   { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px; }
        .pricing-grid   { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px; }
        .avantages-grid { display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px; }
        @media(max-width:1000px){ .pricing-grid { grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); } }
        @media(max-width:900px) { .avantages-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media(max-width:640px) { .pricing-grid { grid-template-columns:minmax(0,1fr); } .cmp-table { display:none; } .cmp-mobile { display:flex !important; } }
        @media(max-width:540px) { .piliers-grid,.avantages-grid { grid-template-columns:minmax(0,1fr); } }

        .cmp-table { width:100%;border-collapse:collapse;font-size:14px; }
        .cmp-table th,.cmp-table td { padding:14px 18px; }
        .cmp-table thead th { font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:.5px; }
        .cmp-table tbody td { border-bottom:1px solid #f1f5f9; }
        .cmp-table tbody tr:last-child td { border-bottom:none; }
        .cmp-mobile { display:none;flex-direction:column;gap:10px; }

        .workflow { display:flex;gap:0;align-items:flex-start; }
        @media(max-width:640px){ .workflow { flex-direction:column; } }

        .form-row-2 { display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:14px; }
        @media(max-width:520px){ .form-row-2 { grid-template-columns:minmax(0,1fr); } }

        .modal-overlay { position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(6px);z-index:10000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease; }
        .modal-box { background:#fff;border-radius:24px 24px 0 0;width:100%;max-height:88vh;padding:36px 24px 48px;overflow-y:auto;position:relative;box-shadow:0 -8px 40px rgba(0,0,0,.15);animation:slideUp .3s ease; }
        @media(min-width:640px){ .modal-overlay { align-items:center;padding:24px; } .modal-box { border-radius:24px;max-width:520px;max-height:80vh;padding:44px; } }

        .faq-item { background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:10px; }
        .faq-q { padding:18px 20px;font-weight:700;font-size:14px;color:#0f172a;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;user-select:none;line-height:1.4;transition:background .15s; }
        .faq-q:hover { background:#f8fafc; }
        .faq-a { padding:14px 20px 18px;color:#64748b;font-size:14px;line-height:1.75;border-top:1px solid #f1f5f9; }

        .btn-primary { background:linear-gradient(135deg,#0073F4,#000E91);color:#fff;border:none;border-radius:14px;padding:16px 28px;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 8px 24px rgba(0,115,244,.3);transition:all .2s;display:flex;align-items:center;gap:8px; }
        .btn-primary:hover { opacity:.9;transform:translateY(-1px); }
        .btn-outline { background:transparent;color:#0f172a;border:2px solid #e2e8f0;border-radius:14px;padding:14px 24px;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s; }
        .btn-outline:hover { border-color:#0073F4;color:#0073F4; }
        .select-btn { width:100%;padding:14px;border:none;border-radius:12px;color:#fff;font-family:inherit;font-weight:800;font-size:14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px; }
        .select-btn:hover { opacity:.88;transform:translateY(-1px); }
        .submit-btn { width:100%;padding:16px;border:none;border-radius:14px;background:linear-gradient(135deg,#0073F4,#000E91);color:#fff;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 24px rgba(0,115,244,.3); }
        .submit-btn:hover:not(:disabled) { opacity:.9;transform:translateY(-1px); }
        .submit-btn:disabled { opacity:.5;cursor:not-allowed; }

        @media(max-width:768px){ input,select,textarea { font-size:16px !important; } }
      `}</style>

      <Navbar />

      <button className={`float-cta ${floatVisible ? 'show' : ''}`} onClick={() => scrollTo('inscription')}>
        {t.floatCta}
        <Ico name="arrowRight" size={16} color="#fff" />
      </button>

      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: 'clamp(100px,14vw,160px) clamp(16px,5vw,60px) clamp(60px,10vw,120px)',
        backgroundImage: 'url(/bg9.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(1px)' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="fade-up" style={{ display: 'inline-block', padding: '7px 18px', background: 'rgba(0,115,244,.1)', color: '#0073F4', borderRadius: 100, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
            {t.heroBadge}
          </div>
          <h1 className="fade-up-1" style={{ fontSize: 'clamp(30px,7vw,62px)', fontWeight: 900, color: '#000E91', marginBottom: 20, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            {t.heroA}{' '}
            <span style={{ background: 'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t.heroB}
            </span>
          </h1>
          <p className="fade-up-2" style={{ color: '#475569', fontSize: 'clamp(15px,2.5vw,18px)', lineHeight: 1.8, marginBottom: 40, maxWidth: 540, margin: '0 auto 40px' }}>
            {t.heroSub}
          </p>
          <div className="fade-up-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => scrollTo('inscription')}>
              {t.btnBook}
              <Ico name="arrowRight" size={16} color="#fff" />
            </button>
            <button className="btn-outline" onClick={() => navigate(VISITER_ROUTE)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Ico name="eye" size={15} color="#0f172a" />
                {t.btnVisit}
              </span>
            </button>
          </div>
        </div>
      </section>

      <div style={{ background: '#000E91', padding: 'clamp(24px,4vw,40px) clamp(16px,5vw,60px)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
        {t.stats.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name={s.icon} size={18} color="rgba(255,255,255,.8)" />
            </div>
            <div style={{ fontSize: 'clamp(22px,5vw,40px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Section alt>
        <SectionHeader eyebrow={t.whyEyebrow} title={t.whyTitle} />
        <div className="avantages-grid">
          {t.avantages.map((a, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: 'clamp(18px,3vw,28px)', textAlign: 'center', transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,115,244,.1)'; e.currentTarget.style.borderColor = '#0073F4' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Ico name={a.icon} size={24} color="#0073F4" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{a.title}</div>
              <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow={t.cmpEyebrow} title={t.cmpTitle} />
        <div style={{ overflowX: 'auto', borderRadius: 18, border: '1.5px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
          <table className="cmp-table">
            <thead>
              <tr style={{ borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', color: '#64748b', padding: '16px 18px' }}>{t.cmpCriterion}</th>
                <th style={{ background: '#fef2f2', color: '#991b1b', textAlign: 'center', borderLeft: '1px solid #fecaca' }}>{t.cmpPhysical}</th>
                <th style={{ background: '#eff6ff', color: '#1e40af', textAlign: 'center', borderLeft: '1px solid #bfdbfe' }}>{t.cmpDigital}</th>
              </tr>
            </thead>
            <tbody>
              {t.comparaison.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>{row.critere}</td>
                  <td style={{ color: '#b91c1c', textAlign: 'center', background: '#fffafa', borderLeft: '1px solid #fecaca', fontSize: 13 }}>{row.classique}</td>
                  <td style={{ color: '#1e40af', textAlign: 'center', fontWeight: 700, background: '#f0f7ff', borderLeft: '1px solid #bfdbfe', fontSize: 13 }}>{row.digital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cmp-mobile">
          {t.comparaison.map((row, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{row.critere}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '12px 14px', background: '#fffafa', borderRight: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#991b1b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.cmpPhysShort}</div>
                  <div style={{ fontSize: 12, color: '#b91c1c' }}>{row.classique}</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f0f7ff', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#1e40af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{t.cmpDigShort}</div>
                  <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 700 }}>{row.digital}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section alt id="piliers">
        <SectionHeader eyebrow={t.pilEyebrow} title={t.pilTitle} sub={t.pilSub} />
        <div className="piliers-grid">
          {t.piliers.map(p => (
            <div key={p.id} className="pilier-card" onClick={() => setActiveModal(p.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: p.color + '15', border: `1.5px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ico name={p.icon} size={20} color={p.color} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: p.color, letterSpacing: 1 }}>{t.pillar} {p.id}</div>
              </div>
              <h3 style={{ fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{p.short}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color, fontSize: 13, fontWeight: 700 }}>
                {t.learnMore}
                <Ico name="arrowRight" size={14} color={p.color} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow={t.wfEyebrow} title={t.wfTitle} />
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="workflow">
            {t.workflow.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 0, flex: 1, flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {i < t.workflow.length - 1 && (
                  <div style={{ position: 'absolute', top: 22, left: '50%', width: '100%', height: 2, background: 'linear-gradient(90deg,#0073F4,#000E91)', zIndex: 0 }} />
                )}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: '0 4px 16px rgba(0,115,244,.3)' }}>
                  {w.num}
                </div>
                <div style={{ textAlign: 'center', padding: 'clamp(10px,2vw,16px) clamp(4px,1vw,12px) 0' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{w.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section alt id="tarifs">
        <SectionHeader eyebrow={t.offerEyebrow} title={t.offerTitle} sub={t.offerSub} />
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ background: '#fff', border: `1.5px solid ${OFFER.color}`, borderTop: `5px solid ${OFFER.color}`, borderRadius: 22, padding: 'clamp(24px,4vw,38px)', textAlign: 'center', position: 'relative', boxShadow: `0 16px 48px ${OFFER.color}22` }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: OFFER.color, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 }}>{t.offerName}</div>
            <div style={{ fontSize: 'clamp(38px,8vw,54px)', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>
              {t.offerPriceValue}<span style={{ fontSize: 20, verticalAlign: 'super' }}>€</span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>{t.oneOff}</div>
            <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 28, padding: 0 }}>
              {t.offerFeatures.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < t.offerFeatures.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: 13.5, color: '#334155' }}>
                  <Ico name="checkCircle" size={16} color="#22c55e" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="select-btn" style={{ background: `linear-gradient(135deg,${OFFER.color},${OFFER.color}cc)`, boxShadow: `0 6px 20px ${OFFER.color}30` }} onClick={() => scrollTo('inscription')}>
              {t.btnBook}
              <Ico name="arrowRight" size={15} color="#fff" />
            </button>
          </div>
        </div>
      </Section>

      <Section alt>
        <SectionHeader eyebrow={t.faqEyebrow} title={t.faqTitle} />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {t.faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: openFaq === i ? '#0073F4' : '#f1f5f9', color: openFaq === i ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .25s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                  <Ico name="plus" size={16} color={openFaq === i ? '#fff' : '#64748b'} />
                </div>
              </div>
              {openFaq === i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </Section>

      <section id="inscription" style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,60px)', backgroundImage: 'url(/bg9.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,14,145,0.88)' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(24px,5vw,52px)', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}>
            {formSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#000E91)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(0,14,145,.3)' }}>
                  <Ico name="check" size={32} color="#fff" />
                </div>
                <h3 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>{t.sentTitle}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8 }}>{t.sentBefore}<strong style={{ color: '#0073F4' }}>{t.sentStrong}</strong>{t.sentAfter}</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>{t.formTitle}</h2>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{t.formSub}</p>
                </div>
                <form onSubmit={submitForm} noValidate>
                  <div className="form-row-2">
                    <div><label style={lbl}>{t.company}</label><input name="company" value={formData.company} onChange={handleField} required placeholder={t.companyPh} style={inp('company')} {...foc('company')} autoComplete="organization" /></div>
                    <div><label style={lbl}>{t.sector}</label><input name="sector" value={formData.sector} onChange={handleField} placeholder={t.sectorPh} style={inp('sector')} {...foc('sector')} /></div>
                  </div>
                  <div className="form-row-2">
                    <div><label style={lbl}>{t.name}</label><input name="name" value={formData.name} onChange={handleField} required placeholder={t.namePh} style={inp('name')} {...foc('name')} autoComplete="name" /></div>
                    <div><label style={lbl}>{t.role}</label><input name="role" value={formData.role} onChange={handleField} placeholder={t.rolePh} style={inp('role')} {...foc('role')} /></div>
                  </div>
                  <div style={{ marginBottom: 14 }}><label style={lbl}>{t.email}</label><input type="email" name="email" value={formData.email} onChange={handleField} required placeholder="contact@entreprise.com" style={inp('email')} {...foc('email')} autoComplete="email" /></div>
                  <div style={{ marginBottom: 14 }}><label style={lbl}>{t.phone}</label><input type="tel" name="phone" value={formData.phone} onChange={handleField} placeholder="+212 600 000 000" style={inp('phone')} {...foc('phone')} autoComplete="tel" /></div>
                  <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#EBF3FF', border: '1.5px solid #bfdbfe', borderRadius: 12, padding: '13px 16px' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{t.offerLine}</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0073F4' }}>{t.offerPrice}</span>
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label style={lbl}>{t.goals}</label>
                    <textarea name="goals" value={formData.goals} onChange={handleField} rows={3} placeholder={t.goalsPh} style={{ ...inp('goals'), resize: 'vertical', minHeight: 80 }} {...foc('goals')} />
                  </div>
                  {formError && (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
                      {formError}
                    </div>
                  )}
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <><div className="spinner" />{t.sending}</> : <>{t.send} <Ico name="send" size={16} color="#fff" /></>}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 14, lineHeight: 1.6 }}>{t.replyNote}</p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <footer style={{ background: '#0a0f2c', padding: 'clamp(20px,4vw,32px) clamp(16px,5vw,60px)', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.8 }}>
        {t.footer}
      </footer>

      {modal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="close" size={14} color="#64748b" />
            </button>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 28px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: modal.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ico name={modal.icon} size={20} color={modal.color} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: modal.color, letterSpacing: 2, textTransform: 'uppercase' }}>{t.pillar} {modal.id}</div>
            </div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, color: '#0f172a', marginBottom: 14 }}>{modal.title}</h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75, marginBottom: 22 }}>{modal.full}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {modal.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 50, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: modal.color, flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}