import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generateProformaPDF } from '../utils/generateProformaPDF'
import { generateRecapPDF } from '../utils/generateRecapPDF'
import { generateBadge } from '../utils/generateBadge'
import { generateFactureDefinitivePDF } from '../utils/generateFactureDefinitivePDF'

const NAVY = '#000E91'
const MAROON = '#96182A'

const STATUT_OPTIONS = [
  { value: 'en_attente', label: 'En attente', color: '#d97706', bg: '#fef3c7' },
  { value: 'reserve',    label: 'Réservé',    color: '#2563eb', bg: '#dbeafe' },
  { value: 'confirme',   label: 'Confirmé',   color: '#059669', bg: '#d1fae5' },
  { value: 'annule',     label: 'Annulé',     color: '#dc2626', bg: '#fee2e2' },
]

// Langues disponibles pour la génération des documents (proforma, récap, facture)
const LANG_OPTIONS = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English',  flag: '🇬🇧' },
]

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    file:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    alert:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    badge:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    receipt:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>,
    clock:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    save:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>,
  }
  return icons[name] || null
}

const fmtDateTime = d => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const DOC_LABELS = { proforma: 'Facture proforma', recap: 'Récapitulatif', badge: 'Badge', facture_definitive: 'Facture définitive' }

export default function AdminProforma() {
  const [dossierInput, setDossierInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [recents, setRecents] = useState([])
  const [genLoading, setGenLoading] = useState('')
  const [statutSaving, setStatutSaving] = useState(false)
  const [noteSaving, setNoteSaving] = useState(false)
  const [historique, setHistorique] = useState([])
  const [toast, setToast] = useState('')
  const [lang, setLang] = useState('fr') // langue des documents générés (fr | en)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  useEffect(() => {
    loadRecents()
  }, [])

  const loadRecents = async () => {
    const { data: rows } = await supabase
      .from('inscriptions')
      .select('dossier, paiement_status, created_at, contacts(nom, prenom, organisation)')
      .order('created_at', { ascending: false })
      .limit(8)
    setRecents(rows || [])
  }

  const loadHistorique = async dossier => {
    const { data: rows } = await supabase
      .from('documents_generes')
      .select('type, generated_at')
      .eq('dossier', dossier)
      .order('generated_at', { ascending: false })
    setHistorique(rows || [])
  }

  const loadDossier = async dossier => {
    setLoading(true); setError(''); setData(null)
    const { data: rows, error: err } = await supabase
      .from('inscriptions')
      .select('dossier, participants, montant, paiement_status, note_interne, numero_facture, contacts(nom, prenom, organisation, poste, pays, email, telephone)')
      .eq('dossier', dossier.trim())
      .limit(1)

    if (err) { setError('Erreur : ' + err.message); setLoading(false); return }
    if (!rows || rows.length === 0) { setError('Aucun dossier trouvé avec cette référence.'); setLoading(false); return }

    const row = rows[0]
    setData({
      dossier: row.dossier,
      participants: row.participants,
      montant: row.montant,
      statut: row.paiement_status,
      noteInterne: row.note_interne || '',
      numeroFacture: row.numero_facture || null,
      nom: row.contacts?.nom || '',
      prenom: row.contacts?.prenom || '',
      organisation: row.contacts?.organisation || '',
      poste: row.contacts?.poste || '',
      pays: row.contacts?.pays || '',
      email: row.contacts?.email || '',
      telephone: row.contacts?.telephone || '',
    })
    setLang('fr') // reinit à chaque nouvelle recherche ; ajuster ici si detection auto souhaitée
    await loadHistorique(row.dossier)
    setLoading(false)
  }

  const handleSearch = e => {
    e.preventDefault()
    if (!dossierInput.trim()) return
    loadDossier(dossierInput)
  }

  const handleField = (field, value) => setData(d => ({ ...d, [field]: value }))

  const logDocument = async (dossier, type) => {
    await supabase.from('documents_generes').insert([{ dossier, type, langue: lang }])
    loadHistorique(dossier)
  }

  const formData = () => ({
    nom: data.nom, prenom: data.prenom, organisation: data.organisation,
    poste: data.poste, pays: data.pays, email: data.email, telephone: data.telephone,
  })

  const handleGenerateProforma = async () => {
    setGenLoading('proforma')
    try {
      await generateProformaPDF({ form: formData(), dossier: data.dossier, nb: Number(data.participants) || 1, total: Number(data.montant) || 0, lang })
      await logDocument(data.dossier, 'proforma')
    } finally { setGenLoading('') }
  }

  const handleGenerateRecap = async () => {
    setGenLoading('recap')
    try {
      await generateRecapPDF({ form: formData(), dossier: data.dossier, nb: Number(data.participants) || 1, total: Number(data.montant) || 0, paiementMode: data.statut === 'reserve' ? 'plus_tard' : 'maintenant', lang })
      await logDocument(data.dossier, 'recap')
    } finally { setGenLoading('') }
  }

  const handleGenerateBadge = async () => {
    setGenLoading('badge')
    try {
      await generateBadge({ nomPrenom: `${data.prenom} ${data.nom}`, fonction: data.poste || '', dossier: data.dossier, photoSrc: null, lang })
      await logDocument(data.dossier, 'badge')
    } finally { setGenLoading('') }
  }

  const handleGenerateFactureDefinitive = async () => {
    setGenLoading('facture')
    try {
      let numero = data.numeroFacture
      if (!numero) {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('next_numero_facture')
        if (rpcErr) throw new Error(rpcErr.message)
        numero = rpcData
        await supabase.from('inscriptions').update({ numero_facture: numero, facture_definitive_date: new Date().toISOString() }).eq('dossier', data.dossier)
        setData(d => ({ ...d, numeroFacture: numero }))
      }
      await generateFactureDefinitivePDF({ form: formData(), dossier: data.dossier, numeroFacture: numero, nb: Number(data.participants) || 1, total: Number(data.montant) || 0, lang })
      await logDocument(data.dossier, 'facture_definitive')
    } catch (err) {
      showToast('Erreur : ' + err.message)
    } finally { setGenLoading('') }
  }

  const handleSaveStatut = async () => {
    setStatutSaving(true)
    const { error: err } = await supabase.from('inscriptions').update({ paiement_status: data.statut }).eq('dossier', data.dossier)
    setStatutSaving(false)
    if (err) showToast('Erreur : ' + err.message)
    else { showToast('Statut mis à jour'); loadRecents() }
  }

  const handleSaveNote = async () => {
    setNoteSaving(true)
    const { error: err } = await supabase.from('inscriptions').update({ note_interne: data.noteInterne }).eq('dossier', data.dossier)
    setNoteSaving(false)
    if (err) showToast('Erreur : ' + err.message)
    else showToast('Note enregistrée')
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
    color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }
  const actionBtn = (bg, color, border) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
    background: bg, border: `1.5px solid ${border}`, borderRadius: 10, color,
    fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
  })

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Espace Secrétariat</div>
        <div style={{ fontSize: 13.5, color: '#64748b' }}>Recherchez un dossier pour générer ses documents, mettre à jour son statut et ajouter une note.</div>
      </div>

      {toast && (
        <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Recherche */}
      <form onSubmit={handleSearch} style={{
        background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20,
        marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', boxShadow: '0 4px 16px rgba(0,14,145,.05)',
      }}>
        <input
          value={dossierInput}
          onChange={e => setDossierInput(e.target.value)}
          placeholder="Numéro de dossier (ex: COPAF2026-30561)"
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <button type="submit" disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          background: NAVY, border: 'none', borderRadius: 10, color: '#fff',
          fontWeight: 700, fontSize: 13.5, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
        }}>
          <Ico name="search" size={15} color="#fff" />
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {/* Dossiers recents */}
      {!data && recents.length > 0 && (
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Dossiers récents</div>
          {recents.map((r, i) => {
            const cfg = STATUT_OPTIONS.find(s => s.value === r.paiement_status) || STATUT_OPTIONS[0]
            return (
              <div key={i} onClick={() => loadDossier(r.dossier)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                padding: '10px 4px', borderBottom: i < recents.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.contacts?.prenom} {r.contacts?.nom}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{r.dossier} · {r.contacts?.organisation}</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Ico name="alert" size={16} color="#dc2626" />
          <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* Fiche dossier */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 1.5, textTransform: 'uppercase' }}>Dossier {data.dossier}</div>
              <button onClick={() => { setData(null); setDossierInput('') }} style={{ background: 'none', border: 'none', fontSize: 12, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                &larr; Nouvelle recherche
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div><label style={labelStyle}>Prénom</label><input style={inputStyle} value={data.prenom} onChange={e => handleField('prenom', e.target.value)} /></div>
              <div><label style={labelStyle}>Nom</label><input style={inputStyle} value={data.nom} onChange={e => handleField('nom', e.target.value)} /></div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Organisation</label>
              <input style={inputStyle} value={data.organisation} onChange={e => handleField('organisation', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div><label style={labelStyle}>Poste</label><input style={inputStyle} value={data.poste} onChange={e => handleField('poste', e.target.value)} /></div>
              <div><label style={labelStyle}>Pays</label><input style={inputStyle} value={data.pays} onChange={e => handleField('pays', e.target.value)} /></div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} value={data.email} onChange={e => handleField('email', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div><label style={labelStyle}>Participants</label><input type="number" min="1" style={inputStyle} value={data.participants} onChange={e => handleField('participants', e.target.value)} /></div>
              <div><label style={labelStyle}>Montant (EUR)</label><input type="number" min="0" style={inputStyle} value={data.montant} onChange={e => handleField('montant', e.target.value)} /></div>
            </div>

            {/* Statut */}
            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle}>Statut de paiement</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {STATUT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => handleField('statut', opt.value)} style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', border: `1.5px solid ${data.statut === opt.value ? opt.color : '#e2e8f0'}`,
                    background: data.statut === opt.value ? opt.bg : '#fff', color: data.statut === opt.value ? opt.color : '#64748b',
                  }}>{opt.label}</button>
                ))}
              </div>
              <button onClick={handleSaveStatut} disabled={statutSaving} style={{
                ...actionBtn('#f1f5f9', '#334155', '#e2e8f0'), fontSize: 12, padding: '8px 14px',
              }}>
                <Ico name="save" size={13} color="#334155" />
                {statutSaving ? 'Enregistrement...' : 'Enregistrer le statut'}
              </button>
            </div>
          </div>

          {/* Note interne */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
            <label style={labelStyle}>Note interne (visible uniquement par l'équipe)</label>
            <textarea
              value={data.noteInterne}
              onChange={e => handleField('noteInterne', e.target.value)}
              rows={3}
              placeholder="Ex : Relancé le 20/07, en attente de virement..."
              style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }}
            />
            <button onClick={handleSaveNote} disabled={noteSaving} style={actionBtn('#f1f5f9', '#334155', '#e2e8f0')}>
              <Ico name="save" size={14} color="#334155" />
              {noteSaving ? 'Enregistrement...' : 'Enregistrer la note'}
            </button>
          </div>

          {/* Documents */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>Documents</div>

              {/* Sélecteur de langue des documents */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginRight: 2 }}>Langue :</span>
                {LANG_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setLang(opt.value)} style={{
                    padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', border: `1.5px solid ${lang === opt.value ? NAVY : '#e2e8f0'}`,
                    background: lang === opt.value ? '#EBF3FF' : '#fff', color: lang === opt.value ? NAVY : '#64748b',
                  }}>{opt.flag} {opt.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={handleGenerateProforma} disabled={genLoading === 'proforma'} style={actionBtn('#fdf2f4', MAROON, '#f3c9d0')}>
                <Ico name="file" size={15} color={MAROON} />
                {genLoading === 'proforma' ? 'Génération...' : 'Facture proforma'}
              </button>

              <button onClick={handleGenerateRecap} disabled={genLoading === 'recap'} style={actionBtn('#EBF3FF', NAVY, '#bfdbfe')}>
                <Ico name="file" size={15} color={NAVY} />
                {genLoading === 'recap' ? 'Génération...' : 'Récapitulatif'}
              </button>

              {data.statut === 'confirme' && (
                <>
                  <button onClick={handleGenerateBadge} disabled={genLoading === 'badge'} style={actionBtn('#d1fae5', '#065f46', '#6ee7b7')}>
                    <Ico name="badge" size={15} color="#065f46" />
                    {genLoading === 'badge' ? 'Génération...' : 'Badge'}
                  </button>

                  <button onClick={handleGenerateFactureDefinitive} disabled={genLoading === 'facture'} style={actionBtn('#fef3c7', '#92400e', '#fcd34d')}>
                    <Ico name="receipt" size={15} color="#92400e" />
                    {genLoading === 'facture' ? 'Génération...' : (data.numeroFacture ? `Facture (${data.numeroFacture})` : 'Facture définitive')}
                  </button>
                </>
              )}
            </div>
            {data.statut !== 'confirme' && (
              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 10, marginBottom: 0 }}>
                Le badge et la facture définitive seront disponibles une fois le statut passé à "Confirmé".
              </p>
            )}
          </div>

          {/* Historique */}
          {historique.length > 0 && (
            <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Historique des documents générés</div>
              {historique.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < historique.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <Ico name="clock" size={13} color="#94a3b8" />
                  <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 600 }}>{DOC_LABELS[h.type] || h.type}</span>
                  <span style={{ fontSize: 11.5, color: '#94a3b8', marginLeft: 'auto' }}>{fmtDateTime(h.generated_at)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}