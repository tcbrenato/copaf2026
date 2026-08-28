import { useState } from "react";
import { useTranslation } from 'react-i18next'

const icons = {
  compass: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  gauge: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22a8 8 0 0 1 8-8h4a8 8 0 0 0 8-8V2"/><path d="M7 7c.9-1.9 3.1-3 5.5-2.8C15.2 4.4 17 6.5 17 9c0 3.3-3 5-5 7"/></svg>,
  user: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
}

const C = {
  navy: '#000E91', navyLight: '#0A1AAF', blue: '#0073F4',
  navyAlpha10: 'rgba(0,14,145,0.10)',
}

const categorieBadge = {
  Maison:     { bg: '#E8ECFF', color: '#000E91' },
  Partenaire: { bg: '#EBF3FF', color: '#0073F4' },
  Recruté:    { bg: '#FFF4E8', color: '#A35F00' },
}

// Reseaux regionaux de ports membres — memes pays que ceux deja utilises
// dans le formulaire d'inscription (voir src/utils/portsData.js), pour ne
// jamais afficher une liste differente de celle utilisee ailleurs sur le
// site. Structure generique pour pouvoir ajouter l'UAPNA sans dupliquer le
// composant modal.
const RESEAUX = {
  agpaoc: {
    titre: 'AGPAOC',
    sousTitre: "Association de Gestion des Ports de l'Afrique de l'Ouest et du Centre",
    color: C.blue,
    pays: [
      { nom: 'Mauritanie', code: 'mr' },
      { nom: 'Sénégal', code: 'sn' },
      { nom: 'Gambie', code: 'gm' },
      { nom: 'Guinée-Bissau', code: 'gw' },
      { nom: 'Guinée', code: 'gn' },
      { nom: 'Sierra Leone', code: 'sl' },
      { nom: 'Liberia', code: 'lr' },
      { nom: "Côte d'Ivoire", code: 'ci' },
      { nom: 'Ghana', code: 'gh' },
      { nom: 'Togo', code: 'tg' },
      { nom: 'Bénin', code: 'bj' },
      { nom: 'Nigeria', code: 'ng' },
      { nom: 'Cameroun', code: 'cm' },
      { nom: 'Guinée Équatoriale', code: 'gq' },
      { nom: 'Gabon', code: 'ga' },
      { nom: 'Congo', code: 'cg' },
      { nom: 'RD Congo', code: 'cd' },
      { nom: 'Angola', code: 'ao' },
      { nom: 'Cap-Vert', code: 'cv' },
      { nom: 'Mali', code: 'ml', associe: true },
      { nom: 'Burkina Faso', code: 'bf', associe: true },
      { nom: 'Niger', code: 'ne', associe: true },
      { nom: 'Tchad', code: 'td', associe: true },
      { nom: 'Centrafrique', code: 'cf', associe: true },
    ],
  },
  uapna: {
    titre: 'UAPNA',
    sousTitre: "Union des Administrations Portuaires du Nord de l'Afrique",
    color: '#3391F6',
    pays: [
      { nom: 'Maroc', code: 'ma' },
      { nom: 'Algérie', code: 'dz' },
      { nom: 'Tunisie', code: 'tn' },
      { nom: 'Libye', code: 'ly' },
      { nom: 'Égypte', code: 'eg' },
    ],
  },
}

const AxesThematiques = () => {
  const { t } = useTranslation()
  const [activeAxe, setActiveAxe] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [activeReseau, setActiveReseau] = useState(null);
  const axesData = t('modules.axes', { returnObjects: true })
  const outcomes = t('modules.outcomes', { returnObjects: true })
  const axesMeta = [
    { icon: icons.compass, color: '#0073f4', bg: 'rgba(0,115,244,0.08)' },
    { icon: icons.shield, color: '#000e91', bg: 'rgba(0,14,145,0.08)' },
    { icon: icons.gauge, color: '#3391f6', bg: 'rgba(51,145,246,0.08)' },
  ]

  return (
    <section id="axes-thematiques" style={{
      padding: "clamp(60px, 10vw, 100px) 0",
      background: "#ffffff",
      fontFamily: "'Outfit', 'Roboto', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap');
        .axe-card { transition: all 0.25s cubic-bezier(.4,0,.2,1) !important; }
        .axe-card:hover { transform: translateY(-5px); }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-animate { animation: modalIn 0.3s cubic-bezier(.34,1.56,.64,1) forwards; }
        .axes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 820px) { .axes-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px, 5vw, 40px)" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 60px)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: C.navy, borderRadius: 100, padding: "7px 20px", marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue }} />
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>{t('modules.eyebrow')}</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4.5vw, 44px)", fontWeight: 900, color: C.navy, margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {t('modules.titlePart1')}{' '}
            <span style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.navyLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t('modules.titlePart2')}</span>
          </h2>
          <p style={{ fontSize: "clamp(13px, 1.8vw, 16px)", color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            {t('modules.subtitle')}
          </p>
        </div>

        {/* CARTES JOUR */}
        <div className="axes-grid">
          {axesData.map((axe, i) => {
            const isHover = hovered === i;
            const meta = axesMeta[i] || {}
            const axeWithMeta = { ...axe, icon: meta.icon, color: meta.color, bg: meta.bg }
            return (
              <div key={i} className="axe-card"
                onClick={() => setActiveAxe(axeWithMeta)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#fff", borderRadius: 20, padding: "clamp(24px, 3.5vw, 32px)",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                  border: `1.5px solid ${C.navyAlpha10}`,
                  boxShadow: isHover ? `0 20px 44px ${meta.color}30` : "0 4px 16px rgba(0,14,145,0.05)",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: meta.color }} />
                <div style={{
                  width: 56, height: 56, borderRadius: 16, marginBottom: 18,
                  background: meta.bg, border: `1px solid ${meta.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: meta.color,
                }}>{meta.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: meta.color, marginBottom: 6 }}>
                  {axe.jour} · {axe.date}
                </div>
                <div style={{ fontSize: "clamp(16px, 2.3vw, 19px)", fontWeight: 900, color: C.navy, lineHeight: 1.25, marginBottom: 10 }}>
                  {axe.titre}
                </div>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>{axe.sousTitre}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, borderRadius: 20, padding: "4px 10px" }}>{t('modules.activitiesCount')}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: meta.color }}>
                    {t('modules.viewDetails')} {icons.arrow}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* OBJECTIFS */}
        <div style={{
          marginTop: "clamp(40px, 6vw, 64px)",
          background: "#F8FAFC", borderRadius: 20,
          padding: "clamp(24px, 4vw, 40px)", border: "1px solid #E2E8F0",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h3 style={{ fontSize: "clamp(18px, 2.8vw, 26px)", fontWeight: 900, color: C.navy, marginBottom: 8 }}>
              {t('modules.ceQueVousAllez')}
            </h3>
            <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>{t('modules.kept')}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            {outcomes.map((o, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "14px 16px", background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0",
              }}>
                <div style={{
                  flexShrink: 0, width: 28, height: 28, background: `linear-gradient(135deg, ${C.blue}, ${C.navy})`,
                  borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#fff",
                }}>{o.num}</div>
                <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.55, paddingTop: 3 }}>{o.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CERTIFICATIONS */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 32 }}>
          {[
            { titre: "AGPAOC", desc: "Secrétariat Général", color: C.blue, reseau: 'agpaoc' },
            { titre: "UAPNA", desc: "Union Portuaire Afrique du Nord", color: RESEAUX.uapna.color, reseau: 'uapna' },
            { titre: "CRF Perfection", desc: "Expertise Panafricaine", color: C.navy },
          ].map((c, i) => (
            <div key={i}
              onClick={c.reseau ? () => setActiveReseau(c.reseau) : undefined}
              onMouseEnter={c.reseau ? () => setHovered('reseau-' + c.reseau) : undefined}
              onMouseLeave={c.reseau ? () => setHovered(null) : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#F8FAFC", border: `1px solid ${hovered === 'reseau-' + c.reseau ? c.color : '#E2E8F0'}`, borderRadius: 16,
                padding: "16px 22px", minWidth: 220, flex: "1 1 220px", maxWidth: 320,
                cursor: c.reseau ? 'pointer' : 'default', transition: 'border-color .2s, transform .2s',
                transform: hovered === 'reseau-' + c.reseau ? 'translateY(-2px)' : 'none',
              }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: `${c.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0, fontWeight: 900,
              }}>{c.titre[0]}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.navy }}>{c.titre}</div>
                <div style={{ fontSize: 10.5, color: c.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{c.desc}</div>
              </div>
              {c.reseau && (
                <div style={{ color: c.color, flexShrink: 0, display: 'flex' }}>{icons.arrow}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL RESEAU (pays membres AGPAOC / UAPNA) */}
      {activeReseau && RESEAUX[activeReseau] && (() => {
        const r = RESEAUX[activeReseau]
        return (
          <div onClick={() => setActiveReseau(null)} style={{
            position: "fixed", inset: 0, background: "rgba(0,14,145,0.45)",
            backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 9999, padding: 20,
          }}>
            <div className="modal-animate" onClick={e => e.stopPropagation()} style={{
              background: "#fff", borderRadius: 24, maxWidth: 640, width: "100%",
              maxHeight: "88vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,14,145,0.3)",
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)`,
                padding: "clamp(20px, 4vw, 28px)", display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", gap: 12, position: "sticky", top: 0, zIndex: 1,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 900, color: "#fff", marginBottom: 6 }}>
                    Réseau {r.titre} · {r.pays.length} pays
                  </div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{r.sousTitre}</div>
                </div>
                <button onClick={() => setActiveReseau(null)} style={{
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                  width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{icons.close}</button>
              </div>

              <div style={{ padding: "clamp(20px, 4vw, 26px)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                  {r.pays.map((p, i) => (
                    <div key={i} title={p.associe ? 'Membre associé' : undefined} style={{
                      display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
                      background: p.associe ? "#fff" : "#F8FAFC", border: `1px solid ${p.associe ? '#E2E8F0' : '#E2E8F0'}`,
                      borderStyle: p.associe ? 'dashed' : 'solid', borderRadius: 12,
                    }}>
                      <span className={`fi fi-${p.code}`} style={{ borderRadius: 3, flexShrink: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, lineHeight: 1.25 }}>{p.nom}{p.associe && <sup style={{ marginLeft: 2 }}>*</sup>}</span>
                    </div>
                  ))}
                </div>
                {r.pays.some(p => p.associe) && (
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 16, lineHeight: 1.6 }}>
                    * Pays sans façade maritime, membres associés.
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL DU JOUR */}
      {activeAxe && (
        <div onClick={() => setActiveAxe(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,14,145,0.45)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999, padding: 20,
        }}>
          <div className="modal-animate" onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 24, maxWidth: 560, width: "100%",
            maxHeight: "88vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,14,145,0.3)",
          }}>
            {/* Header modal */}
            <div style={{
              background: `linear-gradient(135deg, ${activeAxe.color}, ${activeAxe.color}cc)`,
              padding: "clamp(20px, 4vw, 28px)", display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", gap: 12, position: "sticky", top: 0, zIndex: 1,
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                }}>{activeAxe.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
                    {activeAxe.jour} · {activeAxe.date}
                  </div>
                  <div style={{ fontSize: "clamp(15px, 3vw, 19px)", fontWeight: 900, color: "#fff", lineHeight: 1.25, wordBreak: "break-word" }}>
                    {activeAxe.titre}
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveAxe(null)} style={{
                background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{icons.close}</button>
            </div>

            {/* Corps modal */}
            <div style={{ padding: "clamp(20px, 4vw, 26px)" }}>
              <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
                {activeAxe.sousTitre}
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: activeAxe.bg, color: activeAxe.color }}>{activeAxe.level}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "#F1F5F9", color: "#64748b" }}>⏱ {activeAxe.duration}</span>
              </div>

              <div style={{ fontSize: 10, color: activeAxe.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                {t('modules.modalActivitiesTitle')}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeAxe.activities.map((act, k) => {
                  const cat = categorieBadge[act.categorie] || categorieBadge.Partenaire;
                  return (
                    <div key={k} style={{
                      background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14,
                      padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: activeAxe.color, marginBottom: 5 }}>
                        {act.type}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: act.desc ? 4 : 8, lineHeight: 1.4 }}>
                        {act.titre}
                      </div>
                      {act.desc && (
                        <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.55, marginBottom: 8 }}>
                          {act.desc}
                        </div>
                      )}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 10.5, fontWeight: 700, color: cat.color,
                        background: cat.bg, borderRadius: 20, padding: "3px 9px 3px 7px",
                      }}>
                        <span style={{ display: "flex" }}>{icons.user}</span>
                        {act.intervenant}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => setActiveAxe(null)} style={{
                marginTop: 22, width: "100%",
                background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                color: "#fff", border: "none", padding: 14, borderRadius: 12,
                fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
              }}>{t('modules.modalClose')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AxesThematiques;