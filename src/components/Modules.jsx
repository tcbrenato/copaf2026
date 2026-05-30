import { useState, useEffect, useRef } from "react";

const modules = [
  {
    num: "01",
    titre: "IA & Logistique",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    items: [
      "Optimisation algorithmique pour une fluidification inédite des flux de conteneurs",
      "Automatisation des opérations portuaires par l'Intelligence Artificielle",
      "Benchmarks mondiaux : Tanger Med, Singapour, Rotterdam",
    ],
    color: "#0073f4",
    bg: "rgba(0,115,244,0.08)",
    stat: { value: "3", label: "Keynotes" },
    duration: "6h",
    level: "Stratégique",
  },
  {
    num: "02",
    titre: "Cybersécurité Portuaire",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    items: [
      "Protection des actifs numériques et sécurisation des échanges douaniers",
      "Faire face aux nouvelles menaces cyber dans les infrastructures critiques",
      "Stratégies de résilience et de continuité d'activité portuaire",
    ],
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    stat: { value: "4", label: "Panels" },
    duration: "6h",
    level: "Expert",
  },
  {
    num: "03",
    titre: "Maintenance Prédictive & IoT",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    items: [
      "Anticiper les défaillances pour garantir la disponibilité continue des infrastructures critiques",
      "Capteurs IoT et analyse vibratoire pour la maintenance proactive",
      "Réduction des coûts opérationnels grâce aux données temps réel",
    ],
    color: "#00b4d8",
    bg: "rgba(0,180,216,0.08)",
    stat: { value: "5", label: "Ateliers" },
    duration: "8h",
    level: "Opérationnel",
  },
  {
    num: "04",
    titre: "Gouvernance Data-Driven",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M2 22a8 8 0 0 1 8-8h4a8 8 0 0 0 8-8V2" />
        <path d="M7 7c.9-1.9 3.1-3 5.5-2.8C15.2 4.4 17 6.5 17 9c0 3.3-3 5-5 7" />
      </svg>
    ),
    items: [
      "Pilotage en temps réel et aide à la décision via des tableaux de bord prédictifs avancés",
      "Structurer une gouvernance de la donnée souveraine et performante",
      "KPIs portuaires intelligents pour une compétitivité continentale renforcée",
    ],
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    stat: { value: "6", label: "Cas pratiques" },
    duration: "7h",
    level: "Avancé",
  },
];

const objectifs = [
  { num: "01", text: "Comprendre les fondamentaux de l'IA et de la data science appliquée aux ports" },
  { num: "02", text: "Concevoir et structurer un projet IA adapté à la gestion portuaire africaine" },
  { num: "03", text: "Utiliser les données prédictives pour anticiper les flux logistiques" },
  { num: "04", text: "Intégrer l'IA dans la gestion opérationnelle quotidienne des terminaux" },
  { num: "05", text: "Identifier les gisements de productivité : temps d'attente, maintenance, congestion" },
  { num: "06", text: "Maîtriser la gouvernance de la donnée et la cybersécurité portuaire" },
  { num: "07", text: "Positionner le port comme maillon performant des corridors de commerce africains" },
];

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <polyline points="3 8 6.5 11.5 13 4.5" />
  </svg>
);

const FloatingParticles = () => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
    {[
      { cx: "8%",  cy: "15%", r: 1.5, delay: 0 },
      { cx: "92%", cy: "20%", r: 2,   delay: 1.2 },
      { cx: "20%", cy: "80%", r: 1,   delay: 2.5 },
      { cx: "75%", cy: "70%", r: 2.5, delay: 0.7 },
      { cx: "50%", cy: "5%",  r: 1.5, delay: 1.8 },
      { cx: "35%", cy: "92%", r: 1,   delay: 3.1 },
      { cx: "88%", cy: "55%", r: 2,   delay: 0.3 },
      { cx: "12%", cy: "45%", r: 1.5, delay: 2.0 },
    ].map((p, i) => (
      <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#0073f4" opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.6;0.35" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${p.delay}s`} />
      </circle>
    ))}
    {[
      ["8%","15%","20%","80%"], ["92%","20%","75%","70%"], ["50%","5%","88%","55%"],
    ].map(([x1,y1,x2,y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0073f4" strokeWidth="0.5" opacity="0.1" />
    ))}
  </svg>
);

const Modules = () => {
  const [activeTab, setActiveTab]   = useState(0);
  const [progress,  setProgress]    = useState(0);
  const [animIn,    setAnimIn]      = useState(true);
  const [objVisible, setObjVisible] = useState(false);
  const objRef   = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setAnimIn(false);
      setTimeout(() => {
        setActiveTab(prev => (prev + 1) % modules.length);
        setAnimIn(true);
        setProgress(0);
      }, 300);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 100 / 60;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setObjVisible(true); },
      { threshold: 0.2 }
    );
    if (objRef.current) observer.observe(objRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTabClick = (i) => {
    clearInterval(timerRef.current);
    setAnimIn(false);
    setTimeout(() => { setActiveTab(i); setAnimIn(true); setProgress(0); }, 250);
  };

  const m = modules[activeTab];

  return (
    <section id="modules" style={{
      padding: "clamp(80px, 10vw, 130px) clamp(20px, 5vw, 60px)",
      background: "linear-gradient(170deg, #020924 0%, #001156 50%, #020924 100%)",
      color: "#fff",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Grille de fond */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,115,244,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,115,244,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Glow radial */}
      <div style={{
        position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 400,
        background: "radial-gradient(ellipse, rgba(0,115,244,0.13) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <FloatingParticles />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "clamp(48px, 7vw, 80px)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,115,244,0.12)", border: "1px solid rgba(0,115,244,0.3)",
            borderRadius: 100, padding: "7px 20px", marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0073f4" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#0073f4" }}>
              Modules à Développer
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 4.5vw, 52px)",
            fontWeight: 800, lineHeight: 1.1,
            letterSpacing: "-0.02em", color: "#fff", marginBottom: 20,
          }}>
            4 Modules au cœur de la{" "}
            <span style={{
              background: "linear-gradient(135deg, #0073f4 0%, #00b4d8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>COPAF 2026</span>
          </h2>

          <p style={{ fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
            Des modules thématiques conçus pour répondre aux défis technologiques
            et opérationnels des ports africains d'aujourd'hui et de demain.
          </p>
        </div>

        {/* ONGLETS */}
        <div style={{
          display: "flex", gap: "clamp(8px, 1.5vw, 16px)",
          justifyContent: "center", flexWrap: "wrap",
          marginBottom: "clamp(32px, 5vw, 52px)",
        }}>
          {modules.map((mod, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px clamp(14px, 2vw, 24px)",
                borderRadius: 50,
                background: activeTab === i ? mod.color : "rgba(255,255,255,0.05)",
                border: `1px solid ${activeTab === i ? mod.color : "rgba(255,255,255,0.1)"}`,
                color: activeTab === i ? "#fff" : "rgba(255,255,255,0.5)",
                fontWeight: 600, fontSize: "clamp(12px, 1.2vw, 14px)",
                cursor: "pointer", transition: "all 0.3s ease",
                fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: activeTab === i ? "#fff" : mod.color, display: "flex" }}>{mod.icon}</span>
              <span className="tab-label">{mod.titre}</span>
            </button>
          ))}
        </div>

        {/* CONTENU MODULE */}
        <div
          className="module-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(20px, 3vw, 40px)",
            marginBottom: "clamp(48px, 7vw, 80px)",
            opacity: animIn ? 1 : 0,
            transform: animIn ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Panneau gauche */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${m.color}40`,
            borderRadius: 24, padding: "clamp(28px, 4vw, 48px)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Barre progression */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: "24px 24px 0 0" }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: `linear-gradient(90deg, ${m.color}, ${m.color}99)`,
                borderRadius: "24px 24px 0 0", transition: "width 0.1s linear",
              }} />
            </div>

            {/* Numéro décoratif */}
            <div style={{
              position: "absolute", top: -20, right: 20,
              fontSize: 120, fontWeight: 900, lineHeight: 1,
              color: `${m.color}0d`, userSelect: "none", pointerEvents: "none",
            }}>{m.num}</div>

            {/* Icon + badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: m.bg, border: `1px solid ${m.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: m.color,
              }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: m.color, marginBottom: 4 }}>
                  Module {m.num}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: `${m.color}20`, color: m.color }}>{m.level}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>⏱ {m.duration}</span>
                </div>
              </div>
            </div>

            <h3 style={{
              fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, color: "#fff",
              lineHeight: 1.2, marginBottom: 24, letterSpacing: "-0.01em",
            }}>{m.titre}</h3>

            <div style={{ width: 40, height: 2, background: m.color, borderRadius: 2, marginBottom: 24, opacity: 0.6 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {m.items.map((item, j) => (
                <div key={j}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${m.color}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
                >
                  <span style={{
                    flexShrink: 0, width: 20, height: 20, borderRadius: 6,
                    background: `${m.color}25`, color: m.color,
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                  }}><CheckIcon /></span>
                  <span style={{ fontSize: "clamp(13px, 1.4vw, 14.5px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panneau droit */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 24px)" }}>

            <div style={{
              background: `linear-gradient(135deg, ${m.color}22 0%, ${m.color}08 100%)`,
              border: `1px solid ${m.color}30`,
              borderRadius: 24, padding: "clamp(28px, 4vw, 44px)",
              textAlign: "center", flex: 1,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(circle at 50% 30%, ${m.color}15 0%, transparent 65%)`,
              }} />
              <div style={{ fontSize: "clamp(52px, 7vw, 80px)", fontWeight: 900, color: m.color, lineHeight: 1, marginBottom: 8, position: "relative" }}>
                {m.stat.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2, position: "relative" }}>
                {m.stat.label}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 32, position: "relative" }}>
                {modules.map((_, i) => (
                  <button key={i} onClick={() => handleTabClick(i)} style={{
                    width: activeTab === i ? 28 : 8, height: 8, borderRadius: 4,
                    background: activeTab === i ? m.color : "rgba(255,255,255,0.15)",
                    border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0,
                  }} />
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(12px, 1.5vw, 16px)" }}>
              {[
                { label: "Format", value: "Présentiel" },
                { label: "Langue", value: "FR / EN" },
                { label: "Attestation", value: "Incluse" },
                { label: "Support", value: "Tablette offerte" },
              ].map((info, i) => (
                <div key={i}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "16px 18px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = `${m.color}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{info.label}</div>
                  <div style={{ fontSize: "clamp(13px, 1.3vw, 15px)", color: "#fff", fontWeight: 700 }}>{info.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OBJECTIFS */}
        <div ref={objRef} style={{
          background: "#fff",
          borderRadius: 28,
          padding: "clamp(36px, 6vw, 64px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)",
          marginBottom: "clamp(40px, 6vw, 64px)",
        }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px, 4vw, 44px)" }}>
            <h3 style={{
              fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 900, color: "#0a1128",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>
              Ce que vous allez{" "}
              <span style={{ color: "#0073f4" }}>maîtriser</span>
            </h3>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 12, maxWidth: 500, margin: "12px auto 0", lineHeight: 1.7 }}>
              À l'issue de la COPAF 2026, chaque participant sera en mesure de :
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(10px, 1.5vw, 14px)",
          }}>
            {objectifs.map((o, i) => (
              <div key={i}
                style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  padding: "16px 18px",
                  background: "#F8FAFC", borderRadius: 14,
                  border: "1px solid #E2E8F0",
                  transition: "all 0.25s ease",
                  opacity: objVisible ? 1 : 0,
                  transform: objVisible ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${i * 80}ms`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0073f4"; e.currentTarget.style.background = "#EEF4FF"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  flexShrink: 0, width: 34, height: 34,
                  background: "linear-gradient(135deg, #0073f4 0%, #0055c4 100%)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 0.5,
                }}>{o.num}</div>
                <div style={{ fontSize: "clamp(13px, 1.5vw, 14.5px)", color: "#334155", fontWeight: 500, lineHeight: 1.6, paddingTop: 4 }}>
                  {o.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CERTIFICATIONS */}
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(14px, 2.5vw, 24px)", flexWrap: "wrap" }}>
          {[
            {
              icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>),
              color: "#0073f4", titre: "AGPAOC", desc: "Secrétariat Général",
            },
            {
              icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>),
              color: "#10b981", titre: "CRF Perfection", desc: "Expertise Panafricaine",
            },
          ].map((c, i) => (
            <div key={i}
              style={{
                display: "flex", alignItems: "center", gap: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18, padding: "22px 32px",
                minWidth: 260, flex: "1 1 260px", maxWidth: 400,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}60`; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `${c.color}20`, border: `1px solid ${c.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: c.color, flexShrink: 0,
              }}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 5, lineHeight: 1.3 }}>{c.titre}</div>
                <div style={{ fontSize: 11, color: c.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .module-grid { grid-template-columns: 1fr !important; }
          .tab-label { display: none; }
        }
        @media (max-width: 480px) {
          .tab-label { display: none; }
        }
      `}</style>
    </section>
  );
};

export default Modules;