import { useState } from "react";

const modules = [
  {
    num: "01",
    titre: "Vision Stratégique & Smart Port",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    items: [
      "L'IA comme levier de compétitivité dans la sous-région",
      "Benchmarks mondiaux : Tanger Med, Singapour, Rotterdam",
      "Élaboration d'une feuille de route digitale souveraine",
    ],
    color: "#0073f4",
  },
  {
    num: "02",
    titre: "Optimisation de la Chaîne Logistique",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    items: [
      "IA Prédictive : anticiper l'arrivée des navires (Berth Planning)",
      "Gestion des Terminaux (TOS) : rangement intelligent des conteneurs",
      "Maintenance Prédictive par analyse vibratoire et thermique",
    ],
    color: "#00b4d8",
  },
  {
    num: "03",
    titre: "IA, Sûreté & Facilitation du Commerce",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    items: [
      "Automatisation des Douanes : vision par ordinateur pour scanners",
      "Fluidification de l'Hinterland : rendez-vous camions intelligents",
      "Cyber sécurité : protéger les infrastructures critiques",
    ],
    color: "#7c3aed",
  },
  {
    num: "04",
    titre: "Transition Énergétique & Port Vert",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M2 22a8 8 0 0 1 8-8h4a8 8 0 0 0 8-8V2" />
        <path d="M7 7c.9-1.9 3.1-3 5.5-2.8C15.2 4.4 17 6.5 17 9c0 3.3-3 5-5 7" />
      </svg>
    ),
    items: [
      "IA pour optimiser la consommation énergétique des terminaux",
      "Gestion intelligente des déchets portuaires",
      "Suivi de l'empreinte carbone en temps réel",
    ],
    color: "#10b981",
  },
];

const objectifs = [
  { num: "01", text: "Comprendre les fondamentaux de l'IA et de la data science" },
  { num: "02", text: "Concevoir et structurer un projet IA adapté à la gestion portuaire" },
  { num: "03", text: "Utiliser les données prédictives pour anticiper les flux" },
  { num: "04", text: "Intégrer l'IA dans la gestion opérationnelle" },
  { num: "05", text: "Identifier les gisements de productivité (temps d'attente, maintenance)" },
  { num: "06", text: "Maîtriser la gouvernance de la donnée et la cyber sécurité" },
  { num: "07", text: "Positionner le port comme maillon performant des corridors africains" },
];

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="3 8 6.5 11.5 13 4.5" />
  </svg>
);

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const ModuleCard = ({ m, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? m.color : "rgba(255,255,255,0.1)"}`,
        borderRadius: 20,
        padding: "36px 32px",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        cursor: "default",
        overflow: "hidden",
      }}
    >
      {/* Decorative background number */}
      <div style={{
        position: "absolute",
        top: -10,
        right: 16,
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 110,
        fontWeight: 900,
        color: hovered ? `${m.color}18` : "rgba(255,255,255,0.04)",
        lineHeight: 1,
        userSelect: "none",
        transition: "color 0.35s ease",
        pointerEvents: "none",
      }}>
        {m.num}
      </div>

      {/* Accent top bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: m.color,
        borderRadius: "20px 20px 0 0",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.35s ease",
      }} />

      {/* Icon container */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: `${m.color}20`,
        border: `1px solid ${m.color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        color: m.color,
        transition: "background 0.35s ease",
      }}>
        {m.icon}
      </div>

      {/* Module label */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: m.color,
        marginBottom: 10,
      }}>
        Module {m.num}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 22,
        fontWeight: 400,
        color: "#FFFFFF",
        marginBottom: 24,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
      }}>
        {m.titre}
      </h3>

      {/* Divider */}
      <div style={{
        width: 40,
        height: 1,
        background: `${m.color}60`,
        marginBottom: 20,
      }} />

      {/* Items */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {m.items.map((item, j) => (
          <li key={j} style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
          }}>
            <span style={{
              flexShrink: 0,
              width: 18,
              height: 18,
              borderRadius: 6,
              background: `${m.color}25`,
              color: m.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 2,
            }}>
              <CheckIcon />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Modules = () => {
  return (
    <section id="modules" style={{
      padding: "clamp(80px, 10vw, 130px) clamp(20px, 5vw, 80px)",
      background: "linear-gradient(170deg, #020924 0%, #001156 50%, #020924 100%)",
      color: "#FFFFFF",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,115,244,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,115,244,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 700,
        height: 400,
        background: "radial-gradient(ellipse, rgba(0,115,244,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>

        {/* === HEADER === */}
        <div style={{ textAlign: "center", marginBottom: "clamp(56px, 8vw, 90px)" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,115,244,0.12)",
            border: "1px solid rgba(0,115,244,0.3)",
            borderRadius: 100,
            padding: "7px 20px",
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0073f4" }} />
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#0073f4",
            }}>
              Programme Académique
            </span>
          </div>

          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            marginBottom: 20,
            maxWidth: 780,
            margin: "0 auto 20px",
          }}>
            4 Modules d'échanges lors de cette{" "}
            <span style={{
              background: "linear-gradient(135deg, #0073f4 0%, #00b4d8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              conférence
            </span>
          </h2>

          <p style={{
            fontSize: "clamp(15px, 2vw, 17px)",
            color: "rgba(255,255,255,0.55)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.8,
          }}>
            Un cursus intensif conçu spécifiquement pour répondre aux défis technologiques des ports africains.
          </p>
        </div>

        {/* === MODULES GRID === */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))",
          gap: "clamp(16px, 2.5vw, 28px)",
          marginBottom: "clamp(56px, 8vw, 90px)",
        }}>
          {modules.map((m, i) => (
            <ModuleCard key={i} m={m} index={i} />
          ))}
        </div>

        {/* === OBJECTIFS === */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "clamp(36px, 6vw, 64px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
          marginBottom: "clamp(40px, 6vw, 64px)",
        }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px, 4vw, 44px)" }}>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(24px, 3.5vw, 38px)",
              fontWeight: 400,
              color: "#0a1128",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}>
              Objectifs de la{" "}
              <span style={{ color: "#0073f4" }}>conférence</span>
            </h3>
            <p style={{
              fontSize: 15,
              color: "#64748b",
              marginTop: 12,
              maxWidth: 500,
              margin: "12px auto 0",
              lineHeight: 1.7,
            }}>
              À l'issue de cette conférence, chaque participant sera en mesure de :
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
            gap: "clamp(10px, 2vw, 16px)",
          }}>
            {objectifs.map((o, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                padding: "16px 18px",
                background: "#F8FAFC",
                borderRadius: 14,
                border: "1px solid #E2E8F0",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#0073f4";
                  e.currentTarget.style.background = "#EEF4FF";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  background: "linear-gradient(135deg, #0073f4 0%, #0055c4 100%)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: 0.5,
                }}>
                  {o.num}
                </div>
                <div style={{
                  fontSize: "clamp(13px, 1.6vw, 14.5px)",
                  color: "#334155",
                  fontWeight: 500,
                  lineHeight: 1.6,
                  paddingTop: 4,
                }}>
                  {o.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === CERTIFICATIONS === */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "clamp(14px, 3vw, 24px)",
          flexWrap: "wrap",
        }}>
          {[
            {
              icon: <GraduationIcon />,
              color: "#0073f4",
              titre: "Digital & Numeric Academy",
              desc: "Certification Internationale",
            },
            {
              icon: <AwardIcon />,
              color: "#10b981",
              titre: "CRF Perfection",
              desc: "Expertise Panafricaine",
            },
          ].map((c, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 18,
              padding: "22px 32px",
              minWidth: 280,
              flex: "1 1 280px",
              maxWidth: 400,
              transition: "border-color 0.3s ease, background 0.3s ease",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${c.color}60`;
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `${c.color}20`,
                border: `1px solid ${c.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: c.color,
                flexShrink: 0,
              }}>
                {c.icon}
              </div>
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#FFFFFF",
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}>
                  {c.titre}
                </div>
                <div style={{
                  fontSize: 12,
                  color: c.color,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}>
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Modules;