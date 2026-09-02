import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabase'

// ============================================================
// EXPOSITION DIGITALE — COPAF 2026
// ============================================================
// Chaque exposant est affiché avec EXACTEMENT le format de carte
// "kiosque virtuel" validé (vidéo, brochure, catalogue, galerie,
// coordonnées, WhatsApp/Discuter). Pour l'instant un seul kiosque
// réel (COPAF) est renseigné — les prochains exposants viendront
// s'ajouter au tableau EXHIBITORS ci-dessous, avec à terme une
// table Supabase dédiée (nom, logo, video_url, brochure_url,
// catalogue_url, galerie[], contacts, statut vérifié).

const EXHIBITORS = [
  {
    id: 'copaf',
    nom: 'COPAF 2026',
    tagline: 'Conférence des Ports Africains',
    logo: '/logocopaf.png',
    verifie: true,
    videoUrl: '/inscriptioncopaf.mp4',
    videoLabel: "Comment s'inscrire à la COPAF 2026",
    videoPoster: '/lieucopaf.jpg',
    brochureUrl: '/Brochurecopaf2026FR.pdf',
    catalogueUrl: '/Brochurecopaf2026FR.pdf', // à remplacer par un vrai fichier catalogue quand disponible
    galerie: ['/hero1.png', '/hero2.png', '/hero3.png', '/lieucopaf.jpg'],
    email: 'contactcrfperfection@gmail.com',
    telephone: '+229 0169 30 30 19',
    siteWeb: 'copaf-ports.com',
    whatsappNumero: '2290169303019',
  },
  {
    id: 'crf-perfection',
    nom: 'CRF PERFECTION',
    tagline: 'Cabinet de Recherche et de Formation Perfection',
    logo: '/logocrf.png',
    verifie: true,
    email: 'contactcrfperfection@gmail.com',
    telephone: '+229 01 69 30 30 19',
    siteWeb: 'copaf-ports.com',
    whatsappNumero: '2290169303019',
  },
]

// ─── ICONS ────────────────────────────────────────────────────────────────────

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    play: <svg style={s} viewBox="0 0 24 24" fill={color}><polygon points="6 3 20 12 6 21 6 3" /></svg>,
    file: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    book: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    image: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
    mail: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    phone: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2z" /></svg>,
    globe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    close: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    whatsapp: <svg style={s} viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>,
    chat: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  }
  return icons[name] || null
}

// ─── MODALS (vidéo + galerie) ──────────────────────────────────────────────────

function VideoModal({ url, label, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.75)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#000', borderRadius: 16, width: '100%', maxWidth: 820, boxShadow: '0 24px 60px rgba(0,0,0,.4)', overflow: 'hidden', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.15)', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <Ico name="close" size={16} color="#fff" />
        </button>
        <video src={url} controls autoPlay style={{ width: '100%', display: 'block', maxHeight: '80vh' }} />
        <div style={{ padding: '12px 20px', color: 'rgba(255,255,255,.8)', fontSize: 13 }}>{label}</div>
      </div>
    </div>
  )
}

function GalleryLightbox({ images, index, onClose, onNav }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.85)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.15)', border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ico name="close" size={18} color="#fff" />
      </button>
      <button onClick={e => { e.stopPropagation(); onNav(-1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,.15)', border: 'none', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', color: '#fff', fontSize: 20 }}>‹</button>
      <img src={images[index]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '85%', maxHeight: '85vh', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,.5)' }} />
      <button onClick={e => { e.stopPropagation(); onNav(1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,.15)', border: 'none', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', color: '#fff', fontSize: 20 }}>›</button>
    </div>
  )
}

// ─── PRISE DE RENDEZ-VOUS DIRECTE ──────────────────────────────────────────────
// Formulaire de demande de rencontre individuelle avec un exposant, sur son
// stand, pendant la COPAF 2026 (Casablanca, 19-21 octobre 2026). Le contact
// est enregistre via la meme RPC publique que les autres formulaires du site,
// puis la demande est journalisee dans rendezvous_exposants pour suivi.

const JOURS_COPAF = ['19 octobre 2026', '20 octobre 2026', '21 octobre 2026', 'Peu importe le jour']

function AppointmentModal({ exposant, onClose }) {
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', organisation: '', jour: '', message: '' })
  const [focused, setFocused] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleField = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))

  const inp = name => ({
    width: '100%', padding: '12px 14px', fontSize: 14.5, fontFamily: 'inherit', color: '#0f172a',
    background: focused === name ? '#fff' : '#f8fafc',
    border: `1.5px solid ${focused === name ? '#0073F4' : '#e2e8f0'}`,
    borderRadius: 11, outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,115,244,.12)' : 'none',
  })
  const foc = name => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') })
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }

  const submit = async e => {
    e.preventDefault(); setError('')
    if (!formData.nom || !formData.email) { setError('Merci de renseigner votre nom et votre email.'); return }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { setError('Adresse email invalide.'); return }
    setLoading(true)
    try {
      const { data: contactId, error: contactErr } = await supabase.rpc('public_upsert_contact', {
        p_email: formData.email, p_source: 'rdv-exposant', p_nom: formData.nom,
        p_telephone: formData.telephone, p_organisation: formData.organisation,
      })
      if (contactErr) throw new Error(contactErr.message)

      const { error: rdvErr } = await supabase.from('rendezvous_exposants').insert([{
        contact_id: contactId, exposant_id: exposant.id, exposant_nom: exposant.nom,
        jour_prefere: formData.jour || null, message: formData.message || null,
      }])
      if (rdvErr) throw new Error(rdvErr.message)

      setSent(true)
    } catch (err) { setError('Erreur : ' + err.message) }
    setLoading(false)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.35)', position: 'relative', padding: 'clamp(24px,5vw,36px)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico name="close" size={14} color="#64748b" />
        </button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#000E91)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 12px 32px rgba(0,14,145,.3)' }}>
              <Ico name="check" size={28} color="#fff" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Demande envoyée !</h3>
            <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.7 }}>
              {exposant.nom} vous contactera pour confirmer votre rendez-vous sur son stand pendant la COPAF 2026.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="calendar" size={19} color="#0073F4" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0073F4', letterSpacing: 1.5, textTransform: 'uppercase' }}>Prendre rendez-vous</div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Rencontrer {exposant.nom}</h2>
            <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.7, marginBottom: 22 }}>
              Planifiez une rencontre individuelle sur son stand, pendant les 3 jours de la COPAF 2026 à Casablanca (19–21 octobre 2026).
            </p>

            <form onSubmit={submit} noValidate>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Nom & Prénom *</label><input name="nom" value={formData.nom} onChange={handleField} required placeholder="Prénom Nom" style={inp('nom')} {...foc('nom')} autoComplete="name" /></div>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleField} required placeholder="vous@entreprise.com" style={inp('email')} {...foc('email')} autoComplete="email" /></div>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Téléphone / WhatsApp</label><input type="tel" name="telephone" value={formData.telephone} onChange={handleField} placeholder="+212 600 000 000" style={inp('telephone')} {...foc('telephone')} autoComplete="tel" /></div>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Organisation</label><input name="organisation" value={formData.organisation} onChange={handleField} placeholder="Votre entreprise / institution" style={inp('organisation')} {...foc('organisation')} autoComplete="organization" /></div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Jour préféré</label>
                <select name="jour" value={formData.jour} onChange={handleField} style={{ ...inp('jour'), cursor: 'pointer', color: formData.jour ? '#0f172a' : '#94a3b8' }} {...foc('jour')}>
                  <option value="">-- Sélectionnez --</option>
                  {JOURS_COPAF.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Message (optionnel)</label>
                <textarea name="message" value={formData.message} onChange={handleField} rows={3} placeholder="Ce que vous aimeriez aborder..." style={{ ...inp('message'), resize: 'vertical', minHeight: 70 }} {...foc('message')} />
              </div>
              {error && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 11, padding: '10px 14px', fontSize: 12.5, color: '#dc2626', marginBottom: 16 }}>{error}</div>
              )}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, border: 'none', borderRadius: 13, background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,115,244,.3)' }}>
                {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── CARTE KIOSQUE (design validé — utilisé tel quel pour chaque exposant) ─────

function KioskCard({ d }) {
  const [showVideo, setShowVideo] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [showRdv, setShowRdv] = useState(false)

  const galerie = d.galerie || []
  const navLightbox = dir => setLightboxIndex(i => (i + dir + galerie.length) % galerie.length)

  const waLink = `https://wa.me/${d.whatsappNumero}?text=${encodeURIComponent(`Bonjour ${d.nom}, je vous contacte depuis l'exposition digitale COPAF 2026.`)}`
  const chatLink = `mailto:${d.email}?subject=${encodeURIComponent(`Contact depuis l'exposition digitale - ${d.nom}`)}`

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      {showVideo && <VideoModal url={d.videoUrl} label={d.videoLabel} onClose={() => setShowVideo(false)} />}
      {lightboxIndex !== null && <GalleryLightbox images={galerie} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={navLightbox} />}
      {showRdv && <AppointmentModal exposant={d} onClose={() => setShowRdv(false)} />}

      <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,14,145,.12)', border: '1px solid #e2e8f0' }}>

        {/* Bandeau + logo */}
        <div style={{ background: 'linear-gradient(135deg,#000E91,#0073F4)', padding: '22px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 8, boxShadow: '0 4px 14px rgba(0,0,0,.15)' }}>
              <img src={d.logo} alt={d.nom} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{d.nom}</div>
                {d.verifie && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,.18)', borderRadius: 100, padding: '2px 8px 2px 6px' }}>
                    <Ico name="check" size={10} color="#4ade80" />
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff' }}>Vérifié</span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>{d.tagline}</div>
            </div>
          </div>
        </div>

        {/* Video preview */}
        {d.videoUrl && (
          <div onClick={() => setShowVideo(true)} style={{ position: 'relative', height: 180, background: '#0a1a5c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={d.videoPoster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,14,91,.85), rgba(0,14,91,.15))' }} />
            <div style={{ position: 'relative', width: 62, height: 62, borderRadius: '50%', background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}>
              <Ico name="play" size={26} color="#000E91" />
            </div>
            <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, color: '#fff', fontSize: 12.5, fontWeight: 600 }}>{d.videoLabel}</div>
          </div>
        )}

        <div style={{ padding: '20px 24px' }}>

          {/* Documents */}
          {(d.brochureUrl || d.catalogueUrl) && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Documents</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {d.brochureUrl && (
                  <a href={d.brochureUrl} download target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#EBF3FF', border: '1.5px solid #bfdbfe', borderRadius: 12, textDecoration: 'none', color: '#000E91', fontSize: 12.5, fontWeight: 700 }}>
                    <Ico name="file" size={15} color="#000E91" /> Brochure
                  </a>
                )}
                {d.catalogueUrl && (
                  <a href={d.catalogueUrl} download target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, textDecoration: 'none', color: '#334155', fontSize: 12.5, fontWeight: 700 }}>
                    <Ico name="book" size={15} color="#334155" /> Catalogue
                  </a>
                )}
              </div>
            </>
          )}

          {/* Galerie */}
          {galerie.length > 0 && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico name="image" size={12} color="#94a3b8" /> Galerie
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 20 }}>
                {galerie.map((img, i) => (
                  <div key={i} onClick={() => setLightboxIndex(i)} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Coordonnées */}
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Coordonnées</div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            {[
              { icon: 'mail', text: d.email },
              { icon: 'phone', text: d.telephone },
              { icon: 'globe', text: d.siteWeb },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: '#334155', padding: '5px 0' }}>
                <Ico name={c.icon} size={14} color="#0073F4" />
                {c.text}
              </div>
            ))}
          </div>

          {/* Bouton d'action principal — prise de rendez-vous directe */}
          <button onClick={() => setShowRdv(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', marginBottom: 10, background: 'linear-gradient(135deg,#000E91,#0073F4)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,14,145,.25)' }}>
            <Ico name="calendar" size={16} color="#fff" /> Prendre rendez-vous
          </button>

          {/* Boutons d'action secondaires */}
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px', background: '#25D366', borderRadius: 12, color: '#fff', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
              <Ico name="whatsapp" size={16} color="#fff" /> WhatsApp
            </a>
            <a href={chatLink} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, color: '#334155', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
              <Ico name="chat" size={15} color="#334155" /> Discuter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function VisiterExposition() {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes heroFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 680px) {
          .exp-h1 { font-size: 38px !important; }
          .exp-grid { grid-template-columns: 1fr !important; justify-items: center !important; }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <section style={{
        background: '#0A1128',
        paddingTop: 130, paddingBottom: 70,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div style={{
          position: 'absolute', right: -120, top: '30%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,115,244,0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{
            marginBottom: 36,
            display: 'flex', gap: 8, alignItems: 'center',
            fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            animation: 'heroFade 0.45s ease both',
          }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              onClick={() => navigate('/')}>
              Accueil
            </span>
            <span style={{ opacity: 0.3 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Exposition Digitale</span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 22,
            border: '1px solid rgba(0,115,244,0.4)', background: 'rgba(0,115,244,0.1)',
            borderRadius: 100, padding: '6px 14px',
            animation: 'heroFade 0.45s 0.04s ease both',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: '#5FB1FF', textTransform: 'uppercase' }}>
              Exposition 100% digitale
            </span>
          </div>

          <h1 className="exp-h1" style={{
            margin: '0 0 16px', fontSize: 52, fontWeight: 700,
            color: '#fff', lineHeight: 1.08, maxWidth: 620,
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: -1,
            animation: 'heroFade 0.45s 0.08s ease both',
          }}>
            L'exposition qui vient à vous.
          </h1>

          <p style={{
            margin: 0, fontSize: 15.5, color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.8, maxWidth: 460,
            fontFamily: "'Inter', sans-serif",
            animation: 'heroFade 0.45s 0.12s ease both',
          }}>
            Découvrez les exposants COPAF 2026 en un coup d'œil : vidéo de présentation, documents, galerie et contact direct — où que vous soyez dans le monde.
          </p>
        </div>
      </section>

      {/* ─── GRID DES KIOSQUES ─── */}
      <main style={{ background: '#F7F7F5', padding: '56px 32px 96px', minHeight: '50vh' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#B8B8B8',
            letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 28,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {EXHIBITORS.length} exposant{EXHIBITORS.length !== 1 ? 's' : ''}
          </p>

          <div className="exp-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: 28,
            justifyItems: 'start',
          }}>
            {EXHIBITORS.map((d, i) => (
              <div key={d.id} style={{ animation: `cardIn 0.4s ${i * 60}ms ease both` }}>
                <KioskCard d={d} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ─── CTA ─── */}
      <section style={{
        background: '#0A1128',
        padding: '80px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: -100, bottom: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,115,244,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{
            margin: '0 0 12px', fontSize: 30, fontWeight: 700,
            color: '#fff', fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: -0.5, lineHeight: 1.2,
          }}>
            Exposer votre organisation ?
          </h2>
          <p style={{
            margin: '0 0 32px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
            fontFamily: "'Inter', sans-serif",
          }}>
            Rejoignez les exposants de COPAF 2026 et présentez vos solutions sans contrainte géographique.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/exposition-digitale')} style={{
              padding: '12px 26px', borderRadius: 9,
              background: '#0073F4', color: '#fff', border: 'none',
              fontWeight: 700, fontSize: 11, letterSpacing: 1.2,
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", transition: 'opacity 0.18s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Réserver mon stand
            </button>
            <button onClick={() => navigate('/')} style={{
              padding: '12px 26px', borderRadius: 9,
              background: 'transparent', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.25)',
              fontWeight: 700, fontSize: 11, letterSpacing: 1.2,
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}