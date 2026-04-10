import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const advantages = [
  "Impact Carbone Zéro : Pas de transport de matériel physique.",
  "Visibilité 365j : Votre stand reste en ligne un an après Tanger Med.",
  "Data Précise : Rapport détaillé des vues et clics inclus.",
  "Lead Gen Direct : Les décideurs vous contactent en un clic.",
  "Zéro Logistique : Concentrez-vous sur vos pitchs."
];

const steps = [
  {
    id: '01',
    title: 'Vitrine Web Exclusive',
    color: '#0073F4',
    short: 'Votre hub digital permanent sur le portail COPAF.',
    fullDesc: "Dès votre inscription, nous créons une page dédiée hautement optimisée pour le SEO. Elle inclut votre présentation stratégique, vos liens officiels et un formulaire de captation de leads direct.",
    features: ['Indexation Google garantie', 'Formulaire de contact direct', 'Statistiques en temps réel']
  },
  {
    id: '02',
    title: 'Immersion Tablettes',
    color: '#19269C',
    short: 'Vos solutions préchargées sur les outils des décideurs.',
    fullDesc: "À Tanger Med, chaque délégué reçoit une tablette tactile haut de gamme. Vos brochures et vidéos y sont intégrées nativement pour une consultation fluide, même sans connexion internet.",
    features: ['Accès 100% Offline', 'Lecture vidéo fluide', 'Expérience tactile premium']
  },
  {
    id: '03',
    title: 'Session Pitch & Démo',
    color: '#0073F4',
    short: 'Une prise de parole magistrale en auditorium.',
    fullDesc: "Bénéficiez d'un créneau stratégique dans le programme officiel pour présenter vos innovations devant l'ensemble des délégations et autorités portuaires présentes au Maroc.",
    features: ['Auditorium de 500+ décideurs', 'Captation vidéo HD offerte', 'QR Code interactif sur écran']
  },
  {
    id: '04',
    title: 'Héritage Post-Event',
    color: '#19269C',
    short: 'Une visibilité qui dure 12 mois après Tanger Med.',
    fullDesc: "L'exposition ne s'arrête pas à la clôture. Votre vitrine reste active pendant un an sur le site COPAF, servant de référence pour les futurs appels d'offres du secteur.",
    features: ['Référencement annuel', 'Inclusion dans les Actes officiels', 'Réseautage continu']
  }
];

const plans = [
  { name: "ESSENTIELLE", price: "500", color: "#64748B", features: ["Fiche portail officiel", "Logo + Description", "QR Code numérique", "1 Brochure PDF"] },
  { name: "AVANCÉE", price: "1500", color: "#0073F4", features: ["Tout Pack Essentielle", "3 Brochures PDF", "Vidéo de présentation HD", "1 Badge VIP inclus", "Session Pitch (10 min)"] },
  { name: "PREMIUM", price: "3000", color: "#19269C", features: ["Tout Pack Avancée", "Brochures Illimitées", "Pitch (15 min) + Q&A", "2 Badges VIP inclus", "Démonstration Live", "Captation Vidéo"] }
];

const ExpositionDigitale = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [currentAdvantage, setCurrentAdvantage] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setShowToast(true);
      setCurrentAdvantage((prev) => (prev + 1) % advantages.length);
      setTimeout(() => setShowToast(false), 5000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      <Navbar />

      {/* POPUP CYCLIQUE */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <div className="toast-label">AVANTAGE COPAF</div>
        <div className="toast-text">{advantages[currentAdvantage]}</div>
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="badge">TANGER MED 2026</div>
        <h1>L'Exposition <span>100% Digitale</span></h1>
        <p>Une présence puissante sans les contraintes de stand physique. Votre technologie directement dans les mains des décideurs portuaires.</p>
        <button className="main-cta" onClick={() => document.getElementById('pricing').scrollIntoView({behavior:'smooth'})}>Voir les formules</button>
      </section>

      {/* PARTIE EXPLICATION (GRILLE) */}
      <section className="explanation-section">
        <div className="section-header">
          <h2>Comment ça fonctionne ?</h2>
          <p>Cliquez sur chaque étape pour découvrir les détails du dispositif.</p>
        </div>
        <div className="grid-container">
          {steps.map((step) => (
            <div key={step.id} className="expl-card" onClick={() => setActiveModal(step)}>
              <div className="step-number" style={{ color: step.color }}>{step.id}</div>
              <h3>{step.title}</h3>
              <p>{step.short}</p>
              <span className="more-link" style={{ color: step.color }}>En savoir plus →</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION TARIFS */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <h2>Nos Formules</h2>
          <p>Choisissez le niveau d'impact adapté à votre stratégie.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div key={i} className="price-card" style={{ borderTop: `6px solid ${plan.color}` }}>
              <h3 style={{ color: plan.color }}>{plan.name}</h3>
              <div className="amount">{plan.price}€</div>
              <ul className="feat-list">
                {plan.features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
              <button className="select-btn" style={{ background: plan.color }} onClick={() => {
                setSelectedPlan(plan.name);
                document.getElementById('form').scrollIntoView({behavior:'smooth'});
              }}>Choisir {plan.name}</button>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULAIRE */}
      <section id="form" className="form-section">
        <div className="form-box">
          <h2>Inscription</h2>
          <p>Soumettez votre demande d'exposition pour Tanger Med 2026.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} required>
              <option value="">Sélectionnez votre formule</option>
              <option value="ESSENTIELLE">ESSENTIELLE - 500€</option>
              <option value="AVANCÉE">AVANCÉE - 1500€</option>
              <option value="PREMIUM">PREMIUM - 3000€</option>
            </select>
            <input type="text" placeholder="Entreprise" required />
            <input type="email" placeholder="Email contact" required />
            <textarea placeholder="Vos objectifs pour cette conférence..." rows="3"></textarea>
            <button type="submit">Envoyer ma demande</button>
          </form>
        </div>
      </section>

      {/* MODALE EXPLICATION */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-x" onClick={() => setActiveModal(null)}>✕</button>
            <h2 style={{ color: activeModal.color }}>{activeModal.title}</h2>
            <p className="full-desc">{activeModal.fullDesc}</p>
            <div className="feat-chips">
              {activeModal.features.map((f, i) => (
                <div key={i} className="chip"><span style={{ background: activeModal.color }}></span>{f}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="footer">© 2026 COPAF — TANGER MED. Exposition 100% Digitale.</footer>

      <style jsx>{`
        .page-container { background: #FFFFFF; font-family: 'Inter', sans-serif; color: #1A1A1A; overflow-x: hidden; }
        .hero { padding: 120px 20px 80px; text-align: center; background: #F8FAFC; }
        .badge { display: inline-block; padding: 6px 16px; border-radius: 50px; background: #0073F415; color: #0073F4; font-weight: 800; font-size: 11px; margin-bottom: 20px; }
        h1 { font-size: clamp(30px, 8vw, 50px); color: #19269C; font-weight: 900; margin-bottom: 20px; line-height: 1.1; }
        h1 span { color: #0073F4; }
        .hero p { max-width: 600px; margin: 0 auto 30px; color: #64748B; font-size: 17px; }
        .main-cta { background: #19269C; color: white; border: none; padding: 16px 35px; border-radius: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(25,38,156,0.2); }

        .section-header { text-align: center; margin-bottom: 50px; padding: 0 20px; }
        h2 { font-size: 32px; font-weight: 900; color: #19269C; margin-bottom: 10px; }
        .section-header p { color: #64748B; font-size: 15px; }

        .explanation-section { padding: 80px 20px; }
        .grid-container { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; }
        .expl-card { background: white; padding: 40px 30px; border-radius: 20px; border: 1px solid #E2E8F0; text-align: center; cursor: pointer; transition: 0.3s; }
        .expl-card:hover { border-color: #0073F4; transform: translateY(-5px); }
        .step-number { font-size: 14px; font-weight: 900; margin-bottom: 15px; }
        .more-link { display: block; margin-top: 20px; font-size: 13px; font-weight: 700; }

        .pricing-section { padding: 80px 20px; background: #F8FAFC; }
        .pricing-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .price-card { background: white; padding: 50px 30px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .amount { font-size: 50px; font-weight: 900; margin: 25px 0; }
        .feat-list { list-style: none; padding: 0; margin-bottom: 35px; text-align: left; display: inline-block; }
        .feat-list li { font-size: 14px; color: #64748B; margin-bottom: 12px; padding-left: 20px; position: relative; }
        .feat-list li::before { content: '✓'; position: absolute; left: 0; color: #0073F4; font-weight: bold; }
        .select-btn { width: 100%; padding: 15px; border: none; border-radius: 10px; color: white; font-weight: 800; cursor: pointer; }

        .form-section { padding: 80px 20px; }
        .form-box { max-width: 600px; margin: 0 auto; text-align: center; }
        form { display: flex; flex-direction: column; gap: 15px; margin-top: 30px; }
        input, select, textarea { padding: 15px; border: 1px solid #E2E8F0; border-radius: 10px; font-family: inherit; }
        form button { background: #19269C; color: white; padding: 18px; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; }

        .toast { position: fixed; bottom: 20px; left: 15px; right: 15px; background: #19269C; color: white; padding: 18px; border-radius: 12px; z-index: 5000; transform: translateY(150%); transition: 0.5s ease; border-left: 6px solid #0073F4; max-width: 350px; }
        .toast.show { transform: translateY(0); }
        .toast-label { font-size: 10px; font-weight: 800; opacity: 0.7; margin-bottom: 4px; }
        .toast-text { font-size: 13px; font-weight: 500; line-height: 1.4; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(25, 38, 156, 0.2); backdrop-filter: blur(8px); z-index: 6000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { background: white; padding: 40px; border-radius: 25px; max-width: 500px; width: 100%; text-align: center; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .close-x { position: absolute; top: 20px; right: 20px; border: none; background: none; font-size: 20px; cursor: pointer; color: #64748B; }
        .full-desc { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 25px; }
        .feat-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .chip { display: flex; align-items: center; font-size: 12px; font-weight: 700; background: #F1F5F9; padding: 6px 12px; border-radius: 50px; }
        .chip span { width: 6px; height: 6px; border-radius: 50%; margin-right: 8px; }

        @media (max-width: 768px) {
          .toast { margin: 0 auto; text-align: center; }
          .pricing-grid { grid-template-columns: 1fr; }
          .expl-card { padding: 30px 20px; }
          .feat-list { display: block; }
        }
        .footer { padding: 40px; text-align: center; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
      `}</style>
    </div>
  );
};

export default ExpositionDigitale;