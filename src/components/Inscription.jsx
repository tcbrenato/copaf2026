import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import emailjs from '@emailjs/browser'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbz7r-LgcYhTnR7VjHzq0KsrRUAp5fNrzn6Y4wnPf9rzc1-bd2j8aMbT8guG3P2i-kbe/exec'
const PRIX_UNITAIRE = 3500
const EMAILJS_SVC   = 'service_x07g4et'
const EMAILJS_TPL   = 'template_7wrkmm1'
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

const PAYS = [
  { value: 'Benin',               label: 'Benin' },
  { value: 'Togo',                label: 'Togo' },
  { value: "Cote d'Ivoire",       label: "Cote d'Ivoire" },
  { value: 'Senegal',             label: 'Senegal' },
  { value: 'Guinee',              label: 'Guinee' },
  { value: 'Mauritanie',          label: 'Mauritanie' },
  { value: 'Nigeria',             label: 'Nigeria' },
  { value: 'Ghana',               label: 'Ghana' },
  { value: 'Gambie',              label: 'Gambie' },
  { value: 'Sierra Leone',        label: 'Sierra Leone' },
  { value: 'Liberia',             label: 'Liberia' },
  { value: 'Cameroun',            label: 'Cameroun' },
  { value: 'Gabon',               label: 'Gabon' },
  { value: 'Congo',               label: 'Congo (Brazzaville)' },
  { value: 'RDC',                 label: 'RDC (Congo)' },
  { value: 'Angola',              label: 'Angola' },
  { value: 'Cap-Vert',            label: 'Cap-Vert' },
  { value: 'Afrique du Sud',      label: 'Afrique du Sud' },
  { value: 'Algerie',             label: 'Algerie' },
  { value: 'Maroc',               label: 'Maroc' },
  { value: 'Tunisie',             label: 'Tunisie' },
  { value: 'Egypte',              label: 'Egypte' },
  { value: 'Kenya',               label: 'Kenya' },
  { value: 'Tanzanie',            label: 'Tanzanie' },
  { value: 'Emirats Arabes Unis', label: 'Emirats Arabes Unis' },
  { value: 'Arabie Saoudite',     label: 'Arabie Saoudite' },
  { value: 'Chine',               label: 'Chine' },
  { value: 'Inde',                label: 'Inde' },
  { value: 'France',              label: 'France' },
  { value: 'Belgique',            label: 'Belgique' },
  { value: 'Allemagne',           label: 'Allemagne' },
  { value: 'Pays-Bas',            label: 'Pays-Bas' },
  { value: 'Etats-Unis',          label: 'Etats-Unis' },
  { value: 'Canada',              label: 'Canada' },
  { value: 'Bresil',              label: 'Bresil' },
  { value: 'Autre',               label: 'Autre pays' },
]

const TYPES = [
  { id:'participant', icon:'badge',   label:'Participant',        sublabel:'Je participe a la conference',       desc:'Ports, autorites portuaires, logisticiens, shippers et tout professionnel du maritime.', prix:'3 500 EUR', tag:'par personne',         cta:"S'inscrire maintenant", redirect:false,  color:'#0073F4', bg:'#EBF3FF' },
  { id:'sponsor',     icon:'diamond', label:'Sponsor / Partenaire', sublabel:'Visibilite & partenariat',         desc:'Sponsors Platine, Or, Argent, Bronze ou partenariat institutionnel, media, academique.',  prix:'Des 8 000 EUR', tag:'sponsors & partenaires', cta:'Voir les offres',      redirect:true,   redirectTo:'/partenariats',        color:'#000E91', bg:'rgba(0,14,145,0.06)' },
  { id:'exposant',    icon:'monitor', label:'Exposant Digital',   sublabel:'Vitrine digitale de vos solutions',  desc:'Exposition 100% digitale sur le site COPAF et les tablettes distribuees aux participants.', prix:'Des 500 EUR',  tag:'digital - site + tablettes', cta:'Voir les formules',    redirect:true,   redirectTo:'/exposition-digitale', color:'#0891b2', bg:'rgba(8,145,178,0.06)' },
]

const CGV_CONTENT = [
  { title:'1. Objet', text:"Les presentes conditions generales de vente regissent les inscriptions a la Conference des Ports Africains (COPAF 2026) organisee par CRF Perfection, prevue du 15 au 17 septembre 2026 a Tanger Med, Maroc." },
  { title:'2. Inscription et confirmation', text:"Toute inscription n'est definitivement confirmee qu'apres reception du paiement integral. Apres reception du mail de confirmation automatique, le participant doit contacter l'organisation par WhatsApp au +229 01 97 67 22 00 ou par email a inscriptions@copaf-ports.com pour valider son inscription et recevoir les instructions de paiement." },
  { title:'3. Tarifs et paiement', text:"Le tarif est fixe a 3 500 EUR par personne. Le paiement s'effectue exclusivement par virement bancaire. Le paiement doit etre effectue dans les 7 jours ouvrables suivant la confirmation d'inscription. En cas de reservation (paiement differe), le reglement doit intervenir avant le 1er aout 2026." },
  { title:'4. Politique de non-remboursement', text:"Les inscriptions sont fermes et definitives. Aucun remboursement ne sera effectue, quelle que soit la raison de l'annulation (raison personnelle, professionnelle, medicale, force majeure, refus de visa, etc.). En cas d'empechement, le participant peut se faire remplacer par une autre personne de son organisation sous reserve de notification ecrite au moins 72h avant l'evenement." },
  { title:'5. Annulation par l\'organisateur', text:"En cas d'annulation de l'evenement par l'organisateur pour des raisons de force majeure, un avoir sera propose pour l'edition suivante. Aucun remboursement en numeraire ne sera effectue." },
  { title:'6. Droits et obligations', text:"Le participant s'engage a respecter le reglement interieur de l'evenement et a se comporter de maniere professionnelle. L'organisateur se reserve le droit d'exclure tout participant ne respectant pas ces regles sans remboursement." },
  { title:'7. Responsabilite', text:"L'organisateur ne saurait etre tenu responsable des frais de deplacement, d'hebergement ou de visa engages par les participants. Il est recommande de contracter une assurance annulation." },
  { title:'8. Litiges', text:"En cas de litige, les parties s'engagent a rechercher une solution amiable. A defaut, les tribunaux competents de Cotonou, Benin, seront saisis." },
]

const RGPD_CONTENT = [
  { title:'1. Responsable du traitement', text:"CRF Perfection, organisant la COPAF 2026, est responsable du traitement. Contact : inscriptions@copaf-ports.com" },
  { title:'2. Donnees collectees', text:"Nous collectons : nom, prenom, email, telephone, organisation, poste, pays. Ces donnees sont collectees lors de votre inscription." },
  { title:'3. Finalites', text:"Vos donnees servent a : la gestion de votre inscription, l'envoi des confirmations, la creation de votre badge, la communication sur les editions futures." },
  { title:'4. Base legale', text:"Le traitement est fonde sur l'execution du contrat d'inscription (article 6.1.b du RGPD) et votre consentement explicite." },
  { title:'5. Conservation', text:"Vos donnees sont conservees pendant 3 ans a compter de la date de l'evenement, sauf obligation legale contraire." },
  { title:'6. Destinataires', text:"Vos donnees peuvent etre transmises aux partenaires organisant l'evenement dans la stricte limite necessaire. Elles ne sont jamais vendues." },
  { title:'7. Vos droits', text:"Vous disposez des droits d'acces, de rectification, d'effacement, de limitation, d'opposition et de portabilite. Contactez-nous a inscriptions@copaf-ports.com." },
  { title:'8. Securite', text:"Nous mettons en oeuvre toutes les mesures techniques et organisationnelles appropriees pour proteger vos donnees." },
]

const genDossier = () => `COPAF2026-${Math.floor(Math.random() * 90000) + 10000}`

async function upsertContact(form) {
  const { data, error } = await supabase.from('contacts').upsert({ email:form.email, prenom:form.prenom, nom:form.nom, telephone:form.telephone, organisation:form.organisation, poste:form.poste, pays:form.pays, source:'inscription' }, { onConflict:'email' }).select('id').single()
  if (error) throw new Error(error.message)
  return data.id
}

async function createInscription(contactId, form, nb, montant, paiementMode, dossier) {
  const { error } = await supabase.from('inscriptions').insert([{ contact_id:contactId, dossier, participants:nb, montant, paiement_status:paiementMode==='maintenant'?'en_attente':'reserve', paiement_mode:paiementMode, message:form.message }])
  if (error) throw new Error(error.message)
}

function ModalDocument({ type, onClose }) {
  const isCgv   = type === 'cgv'
  const content = isCgv ? CGV_CONTENT : RGPD_CONTENT
  const title   = isCgv ? 'Conditions Generales de Vente' : 'Politique de Confidentialite (RGPD)'

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
                  <div style={{ fontSize:13, fontWeight:700, color:'#dc2626', marginBottom:6 }}>Politique de non-remboursement - Important</div>
                  <p style={{ fontSize:13, color:'#7f1d1d', lineHeight:1.7, margin:0 }}>Les inscriptions sont <strong>fermes et definitives</strong>. Aucun remboursement ne sera effectue quelle que soit la raison de l'annulation. En cas d'empechement, le participant peut etre remplace par un collegue avec notification 72h avant l'evenement.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:'16px 28px', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
          <button onClick={onClose} style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#0073F4,#000E91)', border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            J'ai lu et compris
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Inscription() {
  const navigate = useNavigate()
  const [etape,        setEtape]        = useState(1)
  const [form,         setForm]         = useState({ nom:'', prenom:'', email:'', telephone:'', organisation:'', poste:'', pays:'', participants:'1', message:'' })
  const [paiementMode, setPaiementMode] = useState('maintenant')
  const [cgv,          setCgv]          = useState(false)
  const [rgpd,         setRgpd]         = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [errorMsg,     setErrorMsg]     = useState('')
  const [dossierNum,   setDossierNum]   = useState('')
  const [focused,      setFocused]      = useState('')
  const [modal,        setModal]        = useState(null)

  const nb    = parseInt(form.participants) || 1
  const total = nb * PRIX_UNITAIRE

  const handleChange     = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleTypeSelect = type => { if (type.redirect) navigate(type.redirectTo); else setEtape(2) }

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setErrorMsg('')
    const dossier = genDossier()
    try {
      const contactId = await upsertContact(form)
      await createInscription(contactId, form, nb, total, paiementMode, dossier)
      fetch(SHEET_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form,montant:total,dossier,paiement:paiementMode}) }).catch(()=>{})
      await emailjs.send(EMAILJS_SVC, EMAILJS_TPL, { prenom:form.prenom, nom:form.nom, email:form.email, organisation:form.organisation, poste:form.poste, pays:form.pays, participants:form.participants, montant:`${total.toLocaleString('fr-FR')} EUR`, tarif:`${PRIX_UNITAIRE.toLocaleString('fr-FR')} EUR/pers.`, dossier, paiement_mode:paiementMode==='maintenant'?'Paiement immediat':'Reservation differee', paiement_maintenant:paiementMode==='maintenant'?'true':'', paiement_reserve:paiementMode==='plus_tard'?'true':'' }, EMAILJS_KEY)
      setDossierNum(dossier); setSubmitted(true)
    } catch(err) { setErrorMsg('Une erreur est survenue : ' + err.message) }
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
        @media(max-width:768px){input,select,textarea{font-size:16px !important}}
      `}</style>

      {modal && <ModalDocument type={modal} onClose={() => setModal(null)} />}

      <section id="inscription" style={{ padding:'clamp(64px,10vw,120px) 0', background:'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', minHeight:'100vh', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(circle at 10% 15%,rgba(0,115,244,.08) 0%,transparent 50%),radial-gradient(circle at 90% 85%,rgba(0,14,145,.06) 0%,transparent 50%)' }} />

        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto', padding:'0 clamp(16px,5vw,48px)', minWidth:0 }}>

          {/* HEADER */}
          <div className="fade-up" style={{ textAlign:'center', marginBottom:'clamp(40px,6vw,72px)' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#000E91', borderRadius:100, padding:'8px 22px', marginBottom:24 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#0073F4', flexShrink:0 }} />
              <span style={{ color:'#fff', fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase' }}>Rejoindre la COPAF 2026</span>
            </div>
            <h2 style={{ fontSize:'clamp(24px,5vw,54px)', fontWeight:900, color:'#0f172a', marginBottom:16, lineHeight:1.1, letterSpacing:'-0.03em' }}>
              {etape===1 ? <>Choisissez votre <span style={{ background:'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>participation</span></> : <>Formulaire <span style={{ background:'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>d'inscription</span></>}
            </h2>
            <p style={{ fontSize:'clamp(14px,2vw,17px)', color:'#64748b', maxWidth:500, margin:'0 auto', lineHeight:1.8 }}>
              {etape===1 ? 'Selectionnez la categorie correspondant a votre profil.' : 'Remplissez le formulaire. Paiement securise par virement bancaire.'}
            </p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:20 }}>
              {[1,2].map(s => <div key={s} className="step-dot" style={{ width:etape===s?24:8, background:etape===s?'#0073F4':'#cbd5e1', borderRadius:etape===s?4:'50%' }} />)}
            </div>
            {etape===2 && !submitted && (
              <button onClick={() => setEtape(1)} style={{ background:'none', border:'1.5px solid #e2e8f0', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, color:'#475569', fontSize:13, fontWeight:600, padding:'8px 18px', borderRadius:100, marginTop:16, fontFamily:'inherit', transition:'all .2s' }}
                onMouseEnter={e => {e.currentTarget.style.borderColor='#0073F4';e.currentTarget.style.color='#0073F4'}}
                onMouseLeave={e => {e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#475569'}}>
                &larr; Changer de categorie
              </button>
            )}
          </div>

          {/* ETAPE 1 */}
          {etape===1 && (
            <div className="cards-grid">
              {TYPES.map((type, idx) => (
                <div key={type.id} className={`type-card fade-up-${idx+1}${idx===2?' card-last':''}`} onClick={() => handleTypeSelect(type)}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${type.color},${type.color}99)`, borderRadius:'18px 18px 0 0' }} />
                  {type.redirect && <div style={{ position:'absolute', top:16, right:16, background:type.bg, border:`1px solid ${type.color}30`, borderRadius:100, padding:'3px 10px', fontSize:10, color:type.color, fontWeight:700 }}>Page dediee &rarr;</div>}
                  <div style={{ width:52, height:52, borderRadius:15, background:type.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, marginTop:8, border:`1px solid ${type.color}20` }}>
                    <Ico name={type.icon} size={24} color={type.color} />
                  </div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', marginBottom:4 }}>{type.label}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:type.color, marginBottom:14 }}>{type.sublabel}</div>
                  <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.7, marginBottom:20 }}>{type.desc}</p>
                  <div style={{ background:type.bg, borderRadius:12, padding:'12px 16px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>{type.prix}</span>
                    <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{type.tag}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', background:`linear-gradient(135deg,${type.color},${type.color}cc)`, borderRadius:12, color:'#fff', fontSize:13, fontWeight:700 }}>
                    <span>{type.cta}</span>
                    <Ico name="arrow" size={16} color="#fff" />
                  </div>
                </div>
              ))}
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
                    <h3 style={{ fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:'#0f172a', marginBottom:8 }}>{paiementMode==='maintenant'?'Inscription enregistree !':'Place reservee !'}</h3>
                    <p style={{ fontSize:14, color:'#64748b', marginBottom:24, lineHeight:1.8 }}>Merci <strong style={{ color:'#0f172a' }}>{form.prenom} {form.nom}</strong>.<br/>Un email de confirmation a ete envoye a <strong style={{ color:'#0073F4' }}>{form.email}</strong>.</p>

                    <div style={{ background:'linear-gradient(135deg,#000E91,#0073F4)', borderRadius:16, padding:'20px 32px', display:'inline-block', marginBottom:28, boxShadow:'0 10px 32px rgba(0,14,145,.25)' }}>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.55)', letterSpacing:2.5, textTransform:'uppercase', marginBottom:8 }}>Numero de dossier</div>
                      <div style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:900, color:'#fff', letterSpacing:2 }}>{dossierNum}</div>
                    </div>

                    {/* Action requise */}
                    <div style={{ background:'#fffbeb', border:'1.5px solid #fcd34d', borderRadius:16, padding:'20px', marginBottom:24, textAlign:'left' }}>
                      <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:16 }}>
                        <Ico name="alert" size={20} color="#d97706" />
                        <div>
                          <div style={{ fontSize:14, fontWeight:800, color:'#92400e', marginBottom:4 }}>Action obligatoire - Contactez-nous pour finaliser</div>
                          <p style={{ fontSize:13, color:'#78350f', lineHeight:1.7, margin:0 }}>Apres reception de votre email de confirmation, vous devez <strong>obligatoirement nous contacter</strong> par WhatsApp ou email pour valider votre inscription et recevoir les instructions de virement.</p>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        <a href={`https://wa.me/${WHATSAPP_NUM}?text=Bonjour, j'ai recu la confirmation de mon inscription COPAF 2026. Dossier : ${dossierNum}. Je souhaite finaliser.`} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ background:'#25D366', color:'#fff' }}>
                          <Ico name="whatsapp" size={18} color="#fff" />
                          WhatsApp
                        </a>
                        <a href={`mailto:${CONTACT_EMAIL}?subject=Finalisation inscription COPAF 2026 - ${dossierNum}&body=Bonjour, mon dossier est ${dossierNum}. Je souhaite finaliser mon inscription.`} className="cta-btn" style={{ background:'#EBF3FF', color:'#000E91', border:'1.5px solid #bfdbfe' }}>
                          <Ico name="mail" size={18} color="#000E91" />
                          Email
                        </a>
                      </div>
                    </div>

                    {/* Etapes suivantes */}
                    <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'16px 20px', textAlign:'left', marginBottom:16 }}>
                      <div style={{ fontSize:10, color:'#0073F4', fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', marginBottom:14 }}>Prochaines etapes</div>
                      {[
                        {icon:'mail',     text:'Email de confirmation automatique envoye'},
                        {icon:'whatsapp', text:'Vous nous contactez par WhatsApp ou email'},
                        {icon:'bank',     text:'Reception des instructions de virement'},
                        {icon:'card',     text:paiementMode==='maintenant'?'Paiement sous 7 jours ouvrables':'Paiement avant le 1er aout 2026'},
                        {icon:'badge',    text:'Badge et acces participant envoyes apres paiement'},
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
                        <p style={{ fontSize:12.5, color:'#1e40af', lineHeight:1.6, margin:0 }}>Verifiez toujours le RIB avant de payer sur notre page dediee.</p>
                      </div>
                      <a href="/verifier" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, fontWeight:700, color:'#0073F4', textDecoration:'underline', whiteSpace:'nowrap' }}>Verifier maintenant &rarr;</a>
                    </div>

                    {/* Rappel non-remboursement */}
                    <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start', textAlign:'left' }}>
                      <Ico name="ban" size={16} color="#dc2626" />
                      <p style={{ fontSize:12.5, color:'#7f1d1d', lineHeight:1.65, margin:0 }}><strong>Rappel :</strong> Les inscriptions sont fermes et definitives. Aucun remboursement ne sera effectue. En cas d'empechement, vous pouvez vous faire remplacer par un collegue (notification 72h avant).</p>
                    </div>
                  </div>

                ) : (
                  /* FORMULAIRE */
                  <form onSubmit={handleSubmit} noValidate style={{ minWidth:0 }}>
                    <h3 style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginBottom:28, textAlign:'center' }}>Vos informations</h3>

                    <div className="field-row">
                      {[{name:'nom',label:'Nom *',ph:'Votre nom'},{name:'prenom',label:'Prenom *',ph:'Votre prenom'}].map(f => (
                        <div key={f.name}><label style={lbl}>{f.label}</label><input name={f.name} type="text" required value={form[f.name]} onChange={handleChange} placeholder={f.ph} style={inp(f.name)} onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')} /></div>
                      ))}
                    </div>

                    <div className="field-row">
                      {[{name:'email',label:'Email *',ph:'votre@email.com',type:'email'},{name:'telephone',label:'Telephone *',ph:'+229 01 XX XX XX',type:'tel'}].map(f => (
                        <div key={f.name}><label style={lbl}>{f.label}</label><input name={f.name} type={f.type} required value={form[f.name]} onChange={handleChange} placeholder={f.ph} style={inp(f.name)} onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')} /></div>
                      ))}
                    </div>

                    <div className="field-row">
                      {[{name:'organisation',label:'Organisation *',ph:'Port / Entreprise'},{name:'poste',label:'Poste *',ph:'Votre fonction'}].map(f => (
                        <div key={f.name}><label style={lbl}>{f.label}</label><input name={f.name} type="text" required value={form[f.name]} onChange={handleChange} placeholder={f.ph} style={inp(f.name)} onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')} /></div>
                      ))}
                    </div>

                    <div className="field-row">
                      <div>
                        <label style={lbl}>Pays *</label>
                        <select name="pays" required value={form.pays} onChange={handleChange} style={{ ...inp('pays'), cursor:'pointer', color:form.pays?'#0f172a':'#94a3b8' }} onFocus={() => setFocused('pays')} onBlur={() => setFocused('')}>
                          <option value="" disabled>Selectionnez votre pays</option>
                          {PAYS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Nombre de participants</label>
                        <select name="participants" value={form.participants} onChange={handleChange} style={{ ...inp('participants'), cursor:'pointer' }} onFocus={() => setFocused('participants')} onBlur={() => setFocused('')}>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} participant{n>1?'s':''} - {(n*PRIX_UNITAIRE).toLocaleString('fr-FR')} EUR</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom:22 }}>
                      <label style={lbl}>Message / Besoins specifiques</label>
                      <textarea name="message" rows={3} value={form.message} onChange={handleChange} placeholder="Questions, besoins alimentaires, accessibilite..." style={{ ...inp('message'), resize:'vertical', minHeight:80 }} onFocus={() => setFocused('message')} onBlur={() => setFocused('')} />
                    </div>

                    {/* Mode paiement */}
                    <div style={{ marginBottom:18 }}>
                      <label style={lbl}>Mode de paiement *</label>
                      <div className="pay-grid">
                        {[{value:'maintenant',icon:'card',title:'Payer maintenant',desc:'Virement sous 7 jours ouvrables'},{value:'plus_tard',icon:'calendar',title:'Reserver ma place',desc:'Paiement avant le 1er aout 2026'}].map(opt => {
                          const active = paiementMode===opt.value
                          return (
                            <button key={opt.value} type="button" onClick={() => setPaiementMode(opt.value)} style={{ background:active?'#EBF3FF':'#f8fafc', border:`2px solid ${active?'#0073F4':'#e2e8f0'}`, borderRadius:14, padding:'14px 16px', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all .2s', display:'flex', flexDirection:'column', gap:8, minHeight:75 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:32, height:32, borderRadius:8, background:active?'#fff':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
                                  <Ico name={opt.icon} size={16} color={active?'#0073F4':'#64748b'} />
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
                        <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:6 }}>A savoir avant de valider</div>
                        <p style={{ fontSize:12, color:'#78350f', lineHeight:1.65, margin:'0 0 6px' }}>Les inscriptions sont <strong>fermes et definitives</strong> : aucun remboursement, quel que soit le motif (un collegue peut vous remplacer avec notification 72h avant).</p>
                        <p style={{ fontSize:12, color:'#78350f', lineHeight:1.65, margin:0 }}>Apres votre email de confirmation, contactez-nous par WhatsApp ou email pour finaliser le paiement.</p>
                      </div>
                    </div>

                    {/* CGV & RGPD */}
                    <div style={{ marginBottom:24 }}>
                      <label className="check-row">
                        <input type="checkbox" checked={cgv} onChange={e => setCgv(e.target.checked)} required />
                        <span>J'ai lu et j'accepte les{' '}<button type="button" className="doc-link" onClick={() => setModal('cgv')}>conditions generales de vente</button>{' '}incluant la politique de non-remboursement.</span>
                      </label>
                      <label className="check-row">
                        <input type="checkbox" checked={rgpd} onChange={e => setRgpd(e.target.checked)} required />
                        <span>J'accepte le traitement de mes donnees conformement a la{' '}<button type="button" className="doc-link" onClick={() => setModal('rgpd')}>politique de confidentialite</button>.</span>
                      </label>
                    </div>

                    {errorMsg && (
                      <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#dc2626', marginBottom:18, display:'flex', gap:8, alignItems:'flex-start' }}>
                        <Ico name="alert" size={16} color="#dc2626" />
                        {errorMsg}
                      </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading || !cgv || !rgpd}>
                      {loading ? <><div className="spinner" /> Envoi en cours...</> : <>{paiementMode==='maintenant'?'Confirmer mon inscription':'Reserver ma place'} <Ico name="arrow" size={16} color="#fff" /></>}
                    </button>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:14 }}>
                      <Ico name="lock" size={13} color="#94a3b8" />
                      <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Paiement 100% securise par virement bancaire. Aucune carte bancaire requise.</p>
                    </div>
                  </form>
                )}
              </div>

              {/* SIDEBAR */}
              <div className="sidebar" style={{ minWidth:0, display:'flex', flexDirection:'column', gap:16 }}>

                <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:20, padding:'24px 20px', boxShadow:'0 4px 20px rgba(0,14,145,.06)' }}>
                  <div style={{ fontSize:10, color:'#0073F4', fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', marginBottom:16 }}>Recapitulatif</div>
                  {[{l:'Participants',v:nb},{l:'Tarif unitaire',v:`${PRIX_UNITAIRE.toLocaleString('fr-FR')} EUR`}].map((r,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14, color:'#64748b', padding:'10px 0', borderBottom:'1px solid #f1f5f9', gap:8 }}>
                      <span>{r.l}</span><strong style={{ color:'#0f172a' }}>{r.v}</strong>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, padding:'14px 16px', background:'linear-gradient(135deg,#000E91,#0073F4)', borderRadius:12 }}>
                    <span style={{ color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:600 }}>Total</span>
                    <span style={{ fontSize:22, fontWeight:900, color:'#fff' }}>{total.toLocaleString('fr-FR')} EUR</span>
                  </div>
                </div>

                <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:20, padding:'22px 20px', boxShadow:'0 4px 20px rgba(0,14,145,.06)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:'#EBF3FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Ico name="bank" size={18} color="#0073F4" />
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Paiement par virement</div>
                  </div>
                  {[{l:'Banque',v:'SGBE Benin'},{l:'IBAN',v:'BJ66 BJ083 01001 00050273980 97'},{l:'BIC',v:'SGBEBJ BX'},{l:'Titulaire',v:'COPAF 2026'}].map((item,i) => (
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
                    Verifier l'authenticite de ce RIB
                  </a>
                </div>

                <div style={{ background:'#EBF3FF', border:'1.5px solid #bfdbfe', borderRadius:20, padding:'20px' }}>
                  <div style={{ fontSize:10, color:'#000E91', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>Besoin d'aide ?</div>
                  {[{icon:'phone',text:'+229 01 97 67 22 00'},{icon:'mail',text:'inscriptions@copaf-ports.com'},{icon:'globe',text:'www.copaf-ports.com'}].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#1e40af', fontWeight:500, marginBottom:i<2?10:0 }}>
                      <Ico name={item.icon} size={15} color="#0073F4" />
                      <span style={{ wordBreak:'break-word', overflowWrap:'break-word' }}>{item.text}</span>
                    </div>
                  ))}
                  <a href={`https://wa.me/${WHATSAPP_NUM}?text=Bonjour, j'ai une question concernant mon inscription a la COPAF 2026.`} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:14, padding:'11px', background:'#25D366', borderRadius:12, color:'#fff', fontSize:13, fontWeight:700, textDecoration:'none', transition:'opacity .2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    <Ico name="whatsapp" size={16} color="#fff" />
                    Contacter sur WhatsApp
                  </a>
                </div>

                <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:16, padding:'16px' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                    <Ico name="ban" size={16} color="#dc2626" />
                    <div style={{ fontSize:11, fontWeight:700, color:'#dc2626', textTransform:'uppercase', letterSpacing:.5 }}>Non remboursable</div>
                  </div>
                  <p style={{ fontSize:12, color:'#7f1d1d', lineHeight:1.65, margin:0 }}>
                    Les inscriptions sont definitives. Consultez nos{' '}
                    <button type="button" className="doc-link" style={{ fontSize:12, color:'#dc2626' }} onClick={() => setModal('cgv')}>CGV</button>
                    {' '}pour plus d'informations.
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