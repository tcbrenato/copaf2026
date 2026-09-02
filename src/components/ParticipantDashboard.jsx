import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../supabase'
import i18n from '../i18n/i18n'
import { Ico, Card, DocRow, ProgressTimeline } from '../utils/dossierUi'
import { fmtEur, WHATSAPP_NUMBER, BANK_INFO, cardBtnStyle } from '../utils/dossierConstants'

const TR = {
  fr: {
    tabApercu: 'Aperçu', tabBadge: 'Badge', tabProgramme: 'Programme', tabDocuments: 'Documents & paiement', tabSupport: 'Support',
    apercuStatut: 'Statut du dossier', apercuMontant: 'Montant', apercuDocuments: 'documents disponibles', apercuAgenda: 'sessions dans mon agenda',
    badgeConfirmeTip: 'Présentez ce QR code à l\'accueil pour un enregistrement rapide.',
    badgeLocked: 'Votre badge sera disponible ici dès que votre paiement sera confirmé par notre équipe.',
    badgeDownload: 'Télécharger le badge (PNG)',
    programmeIntro: 'Ajoutez les sessions qui vous intéressent pour construire votre agenda personnel.',
    programmeAdd: 'Ajouter', programmeRemove: 'Retirer', programmeInAgenda: 'Dans mon agenda',
    paiementSectionTitle: 'Paiement', ribCopy: 'Copier l\'IBAN', ribCopied: 'IBAN copié !',
    preuveTitle: 'Preuve de virement', preuveIntro: 'Déposez une capture ou un PDF de votre virement pour accélérer la validation.',
    preuveUpload: 'Téléverser une preuve de virement', preuveUploading: 'Envoi en cours...',
    preuveStatutLabel: { en_attente: 'En attente de vérification', validee: 'Validée', rejetee: 'Rejetée' },
    preuveVoir: 'Voir le fichier',
    supportIntro: 'Une question sur votre dossier, votre paiement ou votre venue ?',
    supportHotelTitle: 'Hébergement & visa',
    supportHotelText: "Nous n'avons pas encore publié de liste d'hôtels partenaires pour cette édition. Contactez l'organisation par WhatsApp pour des recommandations d'hébergement à Casablanca.",
    supportVisaText: 'Les conditions d\'entrée au Maroc varient selon votre nationalité : renseignez-vous auprès du consulat ou de l\'ambassade du Maroc le plus proche avant de réserver votre voyage.',
  },
  en: {
    tabApercu: 'Overview', tabBadge: 'Badge', tabProgramme: 'Programme', tabDocuments: 'Documents & payment', tabSupport: 'Support',
    apercuStatut: 'File status', apercuMontant: 'Amount', apercuDocuments: 'documents available', apercuAgenda: 'sessions in my agenda',
    badgeConfirmeTip: 'Show this QR code at the front desk for quick check-in.',
    badgeLocked: 'Your badge will be available here as soon as your payment is confirmed by our team.',
    badgeDownload: 'Download badge (PNG)',
    programmeIntro: 'Add the sessions you are interested in to build your personal agenda.',
    programmeAdd: 'Add', programmeRemove: 'Remove', programmeInAgenda: 'In my agenda',
    paiementSectionTitle: 'Payment', ribCopy: 'Copy IBAN', ribCopied: 'IBAN copied!',
    preuveTitle: 'Proof of transfer', preuveIntro: 'Upload a screenshot or PDF of your transfer to speed up validation.',
    preuveUpload: 'Upload a proof of transfer', preuveUploading: 'Uploading...',
    preuveStatutLabel: { en_attente: 'Awaiting review', validee: 'Validated', rejetee: 'Rejected' },
    preuveVoir: 'View file',
    supportIntro: 'A question about your file, your payment or your visit?',
    supportHotelTitle: 'Accommodation & visa',
    supportHotelText: "We haven't published a partner hotel list for this edition yet. Contact the organisers on WhatsApp for accommodation recommendations in Casablanca.",
    supportVisaText: 'Entry requirements for Morocco vary by nationality: check with the nearest Moroccan consulate or embassy before booking your trip.',
  },
}

const PREUVE_STATUT_COLOR = {
  en_attente: { bg: '#fef3c7', color: '#92400e' },
  validee:    { bg: '#d1fae5', color: '#065f46' },
  rejetee:    { bg: '#fee2e2', color: '#991b1b' },
}

const TABS = [
  { id: 'apercu',     icon: 'user' },
  { id: 'badge',      icon: 'badge' },
  { id: 'programme',  icon: 'calendar' },
  { id: 'documents',  icon: 'receipt' },
  { id: 'support',    icon: 'headset' },
]

export default function ParticipantDashboard({
  myDossier, lang, t, STATUTS, genLoading,
  onDownloadRecap, onDownloadProforma, onDownloadFacture, onDownloadBadge, onAddToCalendar,
  onSignOut, onRefresh,
}) {
  const tt = TR[lang]
  const [tab, setTab] = useState('apercu')

  const tabLabel = {
    apercu: tt.tabApercu, badge: tt.tabBadge, programme: tt.tabProgramme, documents: tt.tabDocuments, support: tt.tabSupport,
  }

  return (
    <div style={{ marginTop: 14 }}>
      <style>{`
        .pdash-nav { display: flex; flex-direction: column; gap: 4px; width: 190px; flex-shrink: 0; }
        .pdash-nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 700; color: #64748b; text-align: left; width: 100%; box-sizing: border-box; }
        .pdash-nav-btn.active { background: #EBF3FF; color: #000E91; }
        .pdash-layout { display: flex; gap: 20px; align-items: flex-start; }
        @media (max-width: 720px) {
          .pdash-layout { flex-direction: column; }
          .pdash-nav { flex-direction: row; width: 100%; overflow-x: auto; gap: 8px; padding-bottom: 4px; }
          .pdash-nav-btn { flex: 0 0 auto; white-space: nowrap; }
        }
      `}</style>

      {/* Bandeau dossier */}
      <div style={{
        background: 'linear-gradient(135deg,#000E91,#0073F4)', borderRadius: 18, padding: '20px 24px',
        color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 14, marginBottom: 18,
      }}>
        <div>
          <div style={{ fontSize: 11.5, opacity: 0.75, fontWeight: 600 }}>{t.recapLabels.dossier} {myDossier.dossier}</div>
          <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{myDossier.prenom} {myDossier.nom}</div>
          {(myDossier.organisation || myDossier.poste) && (
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
              {[myDossier.organisation, myDossier.poste].filter(Boolean).join(' — ')}
            </div>
          )}
        </div>
        <span style={{ background: 'rgba(255,255,255,.18)', padding: '8px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {(STATUTS[myDossier.statut] || {}).label || myDossier.statut}
        </span>
      </div>

      <div style={{ marginBottom: 22 }}>
        <ProgressTimeline statut={myDossier.statut} steps={t.timelineSteps} annuleLabel={t.timelineAnnule} />
      </div>

      <div className="pdash-layout">
        <nav className="pdash-nav">
          {TABS.map(tabDef => (
            <button
              key={tabDef.id} type="button"
              className={`pdash-nav-btn${tab === tabDef.id ? ' active' : ''}`}
              onClick={() => setTab(tabDef.id)}
            >
              <Ico name={tabDef.icon} size={15} color={tab === tabDef.id ? '#000E91' : '#94a3b8'} />
              {tabLabel[tabDef.id]}
            </button>
          ))}
          <button type="button" className="pdash-nav-btn" onClick={onSignOut} style={{ color: '#94a3b8', marginTop: 8 }}>
            <Ico name="logout" size={15} color="#94a3b8" />
            {t.signOut}
          </button>
        </nav>

        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === 'apercu' && (
            <TabApercu myDossier={myDossier} t={t} tt={tt} lang={lang} />
          )}
          {tab === 'badge' && (
            <TabBadge myDossier={myDossier} t={t} tt={tt} genLoading={genLoading} onDownloadBadge={onDownloadBadge} />
          )}
          {tab === 'programme' && (
            <TabProgramme myDossier={myDossier} tt={tt} lang={lang} onRefresh={onRefresh} />
          )}
          {tab === 'documents' && (
            <TabDocuments
              myDossier={myDossier} t={t} tt={tt} genLoading={genLoading}
              onDownloadRecap={onDownloadRecap} onDownloadProforma={onDownloadProforma}
              onDownloadFacture={onDownloadFacture} onDownloadBadge={onDownloadBadge}
              onAddToCalendar={onAddToCalendar} onRefresh={onRefresh}
            />
          )}
          {tab === 'support' && (
            <TabSupport myDossier={myDossier} t={t} tt={tt} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Aperçu ──
function TabApercu({ myDossier, t, tt }) {
  const paiementSub = myDossier.statut === 'confirme'
    ? t.paiementConfirme
    : myDossier.paiement_mode === 'plus_tard'
      ? t.paiementDifferee
      : t.paiementEnAttente

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 18 }}>
        <Card icon="bank" title={tt.apercuMontant}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{fmtEur(myDossier.montant)}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{paiementSub}</div>
        </Card>
        <Card icon="receipt" title={t.mesDocuments}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{(myDossier.documents || []).length + 2}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{tt.apercuDocuments}</div>
        </Card>
        <Card icon="calendar" title={t.programmeTitle}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{(myDossier.agenda || []).length}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{tt.apercuAgenda}</div>
        </Card>
      </div>

      {myDossier.infos_importantes && myDossier.infos_importantes.length > 0 && (
        <div style={{ background: '#EBF3FF', border: '1.5px solid #bfdbfe', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
          <Ico name="info" size={18} color="#0073F4" />
          <div>
            <div style={{ fontSize: 11, color: '#0073F4', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              {t.infosImportantes}
            </div>
            {myDossier.infos_importantes.map(info => (
              <p key={info.id} style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.6, margin: '0 0 6px' }}>{info.contenu}</p>
            ))}
          </div>
        </div>
      )}

      {myDossier.statut === 'confirme' && (
        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>{t.badgeTip}</p>
      )}
    </div>
  )
}

// ── Badge + QR ──
function TabBadge({ myDossier, t, tt, genLoading, onDownloadBadge }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const confirme = myDossier.statut === 'confirme'

  useEffect(() => {
    if (!confirme || !myDossier.badge_token) return
    let cancelled = false
    // Pointe vers /badge/{token} (pas le dossier en clair) : cette meme
    // page affiche soit la fiche complete + pointage arrivee (staff
    // accueil connecte), soit une simple carte de visite numerique
    // (n'importe qui d'autre qui scanne) — voir src/pages/BadgeToken.jsx.
    const badgeUrl = `https://copaf-ports.com/badge/${myDossier.badge_token}`
    QRCode.toDataURL(badgeUrl, { width: 220, margin: 1, color: { dark: '#000E91', light: '#FFFFFF' } })
      .then(url => { if (!cancelled) setQrDataUrl(url) })
      .catch(() => { if (!cancelled) setQrDataUrl('') })
    return () => { cancelled = true }
  }, [confirme, myDossier.badge_token])

  if (!confirme) {
    return (
      <Card icon="badge" title={t.docBadge}>
        <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 16, padding: '32px 20px', textAlign: 'center' }}>
          <Ico name="badge" size={32} color="#cbd5e1" />
          <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 10, lineHeight: 1.6 }}>{tt.badgeLocked}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card icon="badge" title={t.docBadge}>
      <div style={{
        background: 'linear-gradient(135deg,#000E91,#0073F4)', borderRadius: 20, padding: 24,
        color: '#fff', boxShadow: '0 12px 32px rgba(0,14,145,.3)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>COPAF 2026</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{myDossier.prenom} {myDossier.nom}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{myDossier.poste}</div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>{myDossier.organisation}</div>
          </div>
          {qrDataUrl && <img src={qrDataUrl} alt="QR code" style={{ width: 84, height: 84, borderRadius: 8, background: '#fff', padding: 4, flexShrink: 0 }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,.2)', paddingTop: 14 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: 1, opacity: 0.85 }}>{myDossier.dossier}</span>
          <span style={{ fontSize: 10, opacity: 0.6 }}>19–21 Oct. Casablanca</span>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '12px 0', lineHeight: 1.6, textAlign: 'center' }}>{tt.badgeConfirmeTip}</p>
      <button type="button" onClick={onDownloadBadge} disabled={genLoading === 'badge'} style={cardBtnStyle}>
        {genLoading === 'badge' ? <div className="spinner" style={{ width: 13, height: 13, borderTopColor: '#0f172a', borderColor: 'rgba(15,23,42,.25)' }} /> : <Ico name="download" size={14} color="#0f172a" />}
        {tt.badgeDownload}
      </button>
    </Card>
  )
}

// ── Programme / agenda personnalise en libre-service ──
function TabProgramme({ myDossier, tt, lang, onRefresh }) {
  const [pending, setPending] = useState(() => new Set())

  const days = useMemo(() => {
    try { return i18n.getFixedT(lang)('programme.days', { returnObjects: true }) || [] }
    catch { return [] }
  }, [lang])

  const agendaKeys = useMemo(() => new Set((myDossier.agenda || []).map(a => a.session_key)), [myDossier.agenda])

  const toggleSession = async (sessionKey, jour, heure, titre) => {
    setPending(prev => new Set(prev).add(sessionKey))
    try {
      if (agendaKeys.has(sessionKey)) {
        await supabase.from('agenda_participant').delete().eq('dossier', myDossier.dossier).eq('session_key', sessionKey)
      } else {
        await supabase.from('agenda_participant').insert({ dossier: myDossier.dossier, session_key: sessionKey, jour, heure, titre })
      }
      await onRefresh()
    } finally {
      setPending(prev => { const next = new Set(prev); next.delete(sessionKey); return next })
    }
  }

  return (
    <Card icon="calendar" title={tt.tabProgramme}>
      <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{tt.programmeIntro}</p>
      {days.map((day, di) => (
        <div key={di} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#000E91', marginBottom: 8 }}>{day.jour} · {day.date} — {day.titre}</div>
          {(day.sessions || []).map((session, si) => {
            const key = `j${di + 1}-s${si + 1}`
            const inAgenda = agendaKeys.has(key)
            const isPending = pending.has(key)
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, marginBottom: 6 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{session.heure}</div>
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{session.titre}</div>
                </div>
                <button
                  type="button" disabled={isPending}
                  onClick={() => toggleSession(key, day.jour, session.heure, session.titre)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 100, flexShrink: 0,
                    border: `1.5px solid ${inAgenda ? '#a7f3d0' : '#cbd5e1'}`, background: inAgenda ? '#ecfdf5' : '#fff',
                    color: inAgenda ? '#059669' : '#334155', fontSize: 11.5, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isPending ? <div className="spinner" style={{ width: 11, height: 11, borderTopColor: inAgenda ? '#059669' : '#334155', borderColor: 'rgba(0,0,0,.15)' }} />
                    : <Ico name={inAgenda ? 'check' : 'plus'} size={12} color={inAgenda ? '#059669' : '#334155'} />}
                  {inAgenda ? tt.programmeInAgenda : tt.programmeAdd}
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </Card>
  )
}

// ── Documents, paiement, preuve de virement ──
function TabDocuments({ myDossier, t, tt, genLoading, onDownloadRecap, onDownloadProforma, onDownloadFacture, onDownloadBadge, onAddToCalendar, onRefresh }) {
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [signedUrls, setSignedUrls] = useState({})
  const fileRef = useRef(null)

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.iban.replace(/\s+/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* clipboard unavailable */ }
  }

  const uploadPreuve = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `${myDossier.dossier}/${Date.now()}_${file.name}`.replace(/\s+/g, '_')
      const { error: upErr } = await supabase.storage.from('preuves-paiement').upload(path, file)
      if (!upErr) {
        await supabase.from('preuves_paiement').insert({ dossier: myDossier.dossier, storage_path: path })
        await onRefresh()
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const viewPreuve = async preuve => {
    if (signedUrls[preuve.id]) { window.open(signedUrls[preuve.id], '_blank', 'noreferrer'); return }
    const { data } = await supabase.storage.from('preuves-paiement').createSignedUrl(preuve.storage_path, 300)
    if (data?.signedUrl) {
      setSignedUrls(prev => ({ ...prev, [preuve.id]: data.signedUrl }))
      window.open(data.signedUrl, '_blank', 'noreferrer')
    }
  }

  const paiementSub = myDossier.statut === 'confirme'
    ? t.paiementConfirme
    : myDossier.paiement_mode === 'plus_tard'
      ? t.paiementDifferee
      : t.paiementEnAttente

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card icon="receipt" title={t.mesDocuments}>
        <DocRow icon="download" label={t.docRecap} onClick={onDownloadRecap} loading={genLoading === 'recap'} />
        <DocRow icon="receipt" label={t.docProforma} onClick={onDownloadProforma} loading={genLoading === 'proforma'} />
        {myDossier.numero_facture && (
          <DocRow icon="receipt" label={t.docFactureDef} onClick={onDownloadFacture} loading={genLoading === 'facture'} />
        )}
        {(myDossier.documents || []).map(doc => (
          <DocRow key={doc.id} icon="receipt" label={doc.label} href={doc.url} />
        ))}
        <DocRow
          icon="badge" label={t.docBadge} disabled={myDossier.statut !== 'confirme'}
          onClick={myDossier.statut === 'confirme' ? onDownloadBadge : undefined} loading={genLoading === 'badge'}
        />
        <DocRow icon="calendar" label={t.docCalendar} onClick={onAddToCalendar} />
      </Card>

      <Card icon="bank" title={tt.paiementSectionTitle}>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{fmtEur(myDossier.montant)}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 14 }}>{paiementSub}</div>
        {[
          { l: 'Banque', v: BANK_INFO.banque },
          { l: 'IBAN', v: BANK_INFO.iban },
          { l: 'BIC', v: BANK_INFO.bic },
          { l: 'Titulaire', v: BANK_INFO.titulaire },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none', fontSize: 12.5 }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>{row.l}</span>
            <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>{row.v}</span>
          </div>
        ))}
        <button type="button" onClick={copyIban} style={cardBtnStyle}>
          <Ico name={copied ? 'check' : 'receipt'} size={14} color={copied ? '#059669' : '#0f172a'} />
          {copied ? tt.ribCopied : tt.ribCopy}
        </button>
      </Card>

      <Card icon="upload" title={tt.preuveTitle}>
        <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>{tt.preuveIntro}</p>
        {(myDossier.preuves_paiement || []).map(preuve => {
          const cfg = PREUVE_STATUT_COLOR[preuve.statut] || PREUVE_STATUT_COLOR.en_attente
          return (
            <div key={preuve.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                  {tt.preuveStatutLabel[preuve.statut] || preuve.statut}
                </span>
                <button type="button" onClick={() => viewPreuve(preuve)} style={{ background: 'none', border: 'none', color: '#0073F4', fontWeight: 700, fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  {tt.preuveVoir}
                </button>
              </div>
              {preuve.commentaire_admin && (
                <p style={{ fontSize: 11.5, color: '#64748b', margin: '6px 0 0' }}>{preuve.commentaire_admin}</p>
              )}
            </div>
          )
        })}
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '11px 14px', border: '1.5px dashed #cbd5e1', borderRadius: 10,
          fontSize: 12.5, fontWeight: 700, color: '#64748b', cursor: uploading ? 'not-allowed' : 'pointer', marginTop: 4,
        }}>
          <Ico name="upload" size={14} color="#64748b" />
          {uploading ? tt.preuveUploading : tt.preuveUpload}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={uploadPreuve} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </Card>
    </div>
  )
}

// ── Support (contact + hebergement/visa) ──
function TabSupport({ myDossier, t, tt }) {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsappMsg(myDossier.dossier))}`
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card icon="headset" title={t.aideTitle}>
        <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, margin: '0 0 8px' }}>{tt.supportIntro}</p>
        <a href={whatsappHref} target="_blank" rel="noreferrer" style={cardBtnStyle}>
          <Ico name="mail" size={14} color="#0f172a" />
          {t.contacterOrg}
        </a>
      </Card>
      <Card icon="hotel" title={tt.supportHotelTitle}>
        <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 10 }}>{tt.supportHotelText}</p>
        <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>{tt.supportVisaText}</p>
      </Card>
    </div>
  )
}
