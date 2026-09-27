import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { generateLettreMissionPDF } from '../utils/generateLettreMissionPDF'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const CARTE = { background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)' }
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a' }
const LABEL = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }
const BTN = { padding: '9px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const BTN_PRIMARY = { ...BTN, background: NAVY, color: '#fff' }
const BTN_SOFT = { ...BTN, background: '#eef2ff', color: NAVY }

const STATUTS = {
  aucun:   { label: 'Pas commencée', bg: '#f1f5f9', fg: '#475569' },
  prete:   { label: 'Prête', bg: '#fef3c7', fg: '#92400e' },
  envoyee: { label: 'Envoyée', bg: '#dcfce7', fg: '#166534' },
}
const QUALITES = [
  { id: 'comite', label: 'Comité d\'organisation' },
  { id: 'equipe', label: 'Équipe d\'organisation' },
  { id: 'intervenant', label: 'Intervenant(e)' },
  { id: 'autre', label: 'Autre' },
]

function Pastille({ statut }) {
  const s = STATUTS[statut] || STATUTS.aucun
  return <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 100, padding: '3px 10px', background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>{s.label}</span>
}

const ouvrirBlob = doc => window.open(URL.createObjectURL(doc.output('blob')), '_blank', 'noopener')

export default function AdminLettreMission() {
  const [personnes, setPersonnes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [edition, setEdition] = useState(null)

  const charger = useCallback(async () => {
    setErreur('')
    const [iv, lm] = await Promise.all([
      supabase.from('intervenants').select('dossier, nom, prenom, organisation, fonction, pays, numero_passeport, equipe, email, langue'),
      supabase.from('lettres_mission').select('*'),
    ])
    if (iv.error || lm.error) { setErreur('Chargement impossible (droits administrateur requis).'); return }
    const lettres = Object.fromEntries((lm.data || []).map(l => [l.dossier, l]))
    const liste = (iv.data || [])
      .map(p => ({ ...p, mission: lettres[p.dossier] || null }))
      .sort((a, b) => (a.organisation || '').localeCompare(b.organisation || '') || (a.nom || '').localeCompare(b.nom || ''))
    setPersonnes(liste)
  }, [])

  useEffect(() => { charger() }, [charger])

  const affiches = personnes ? personnes.filter(p => filtre === 'tous' || (p.mission?.statut || 'aucun') === filtre) : []
  const compte = s => (personnes || []).filter(p => (p.mission?.statut || 'aucun') === s).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1000 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Lettres de mission</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Un document par personne (équipe, intervenants, comité d'organisation) : nom/fonction/organisation/passeport sont repris
          automatiquement, vous complétez seulement le rôle, les dates et les frais pris en charge.
        </p>
      </div>
      {erreur && <p style={{ color: '#dc2626', fontSize: 13.5, margin: 0 }}>{erreur}</p>}
      {personnes === null && !erreur && <p style={{ color: '#64748b', fontSize: 13.5, margin: 0 }}>Chargement…</p>}

      {personnes !== null && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[['tous', `Tous (${personnes.length})`], ['aucun', `Pas commencée (${compte('aucun')})`], ['prete', `Prête (${compte('prete')})`], ['envoyee', `Envoyée (${compte('envoyee')})`]].map(([id, lib]) => (
              <button key={id} type="button" onClick={() => setFiltre(id)} style={{ ...BTN, padding: '7px 14px', background: filtre === id ? NAVY : '#f1f5f9', color: filtre === id ? '#fff' : '#334155' }}>{lib}</button>
            ))}
          </div>
          <div style={{ ...CARTE, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8faff' }}>
                  {['Personne', 'Organisation', 'Qualité', 'Statut', ''].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {affiches.length === 0 && <tr><td colSpan={5} style={{ padding: 18, color: '#64748b' }}>Aucune personne pour ce filtre.</td></tr>}
                {affiches.map(p => (
                  <tr key={p.dossier} style={{ borderTop: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.prenom} {p.nom}<div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{p.dossier}</div></td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{p.organisation || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{QUALITES.find(q => q.id === (p.mission?.qualite || (p.equipe ? 'equipe' : 'intervenant')))?.label}</td>
                    <td style={{ padding: '10px 14px' }}><Pastille statut={p.mission?.statut || 'aucun'} /></td>
                    <td style={{ padding: '10px 14px' }}><button type="button" style={{ ...BTN_SOFT, padding: '6px 12px' }} onClick={() => setEdition(p)}>Ouvrir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {edition && <FenetreLettre personne={edition} onClose={() => setEdition(null)} onSaved={() => { charger() }} />}
    </div>
  )
}

function FenetreLettre({ personne, onClose, onSaved }) {
  const m0 = personne.mission || {}
  const [qualite, setQualite] = useState(m0.qualite || (personne.equipe ? 'equipe' : 'intervenant'))
  const [qualiteAutre, setQualiteAutre] = useState(m0.qualite_autre || '')
  const [role, setRole] = useState(m0.role_attributions || '')
  const [dateDebut, setDateDebut] = useState(m0.date_debut || '2026-10-17')
  const [dateFin, setDateFin] = useState(m0.date_fin || '2026-10-22')
  const [itineraire, setItineraire] = useState(m0.itineraire || '')
  const [frais, setFrais] = useState({
    transport: m0.frais_transport || false, hebergement: m0.frais_hebergement || false,
    restauration: m0.frais_restauration || false, transferts: m0.frais_transferts || false,
  })
  const [reference, setReference] = useState(m0.reference || `LM-${personne.dossier}`)
  const [lieuSignature, setLieuSignature] = useState(m0.lieu_signature || 'Casablanca')
  const [statut, setStatut] = useState(m0.statut || 'aucun')
  const [occupe, setOccupe] = useState(false)
  const [msg, setMsg] = useState('')

  const donnees = () => ({
    dossier: personne.dossier, qualite, qualite_autre: qualite === 'autre' ? qualiteAutre.trim() : null,
    role_attributions: role.trim() || null, date_debut: dateDebut || null, date_fin: dateFin || null,
    itineraire: itineraire.trim() || null,
    frais_transport: frais.transport, frais_hebergement: frais.hebergement,
    frais_restauration: frais.restauration, frais_transferts: frais.transferts,
    reference: reference.trim() || null, lieu_signature: lieuSignature.trim() || 'Casablanca',
  })

  const enregistrer = async (nouveauStatut = statut) => {
    setOccupe(true); setMsg('')
    const ligne = { ...donnees(), statut: nouveauStatut, updated_at: new Date().toISOString() }
    if (nouveauStatut === 'prete' || nouveauStatut === 'envoyee') ligne.genere_le = new Date().toISOString()
    const { error } = await supabase.from('lettres_mission').upsert(ligne, { onConflict: 'dossier' })
    setOccupe(false)
    if (error) { setMsg("Échec de l'enregistrement."); return false }
    setStatut(nouveauStatut); setMsg('Enregistré ✓'); onSaved()
    return true
  }

  const apercu = async () => {
    try {
      const doc = await generateLettreMissionPDF({ personne, mission: donnees(), lang: personne.langue === 'en' ? 'en' : 'fr', download: false })
      ouvrirBlob(doc)
    } catch (e) { setMsg(e.message || 'Génération impossible.') }
  }

  const marquerPrete = async () => { await enregistrer('prete') }

  const inp = (val, set, type = 'text') => (
    <input type={type} style={INPUT} value={val} onChange={e => { setMsg(''); set(e.target.value) }} />
  )

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '92vh', overflow: 'auto' }}>
        <div style={{ background: NAVY, color: '#fff', padding: '18px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Lettre de mission</div>
            <div style={{ fontSize: 12.5, color: '#93c5fd', marginTop: 4 }}>{personne.prenom} {personne.nom} · {personne.dossier}</div>
          </div>
          <Pastille statut={statut} />
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Nom, fonction, organisation, nationalité et passeport sont repris automatiquement depuis la fiche intervenant — modifiez-les
            là-bas si besoin (Admin &gt; Intervenants).
          </div>

          <div>
            <label style={LABEL}>Qualité</label>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {QUALITES.map(q => (
                <label key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="qualite" checked={qualite === q.id} onChange={() => { setMsg(''); setQualite(q.id) }} /> {q.label}
                </label>
              ))}
            </div>
            {qualite === 'autre' && <div style={{ marginTop: 8 }}>{inp(qualiteAutre, setQualiteAutre)}</div>}
          </div>

          <div>
            <label style={LABEL}>Rôle et attributions</label>
            <textarea style={{ ...INPUT, minHeight: 70, resize: 'vertical' }} value={role} onChange={e => { setMsg(''); setRole(e.target.value) }} placeholder="Ex : Assurer la modération de la session plénière du Jour 2, coordonner les intervenants de l'atelier Cybersécurité." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LABEL}>Date de début</label>{inp(dateDebut, setDateDebut, 'date')}</div>
            <div><label style={LABEL}>Date de fin</label>{inp(dateFin, setDateFin, 'date')}</div>
          </div>
          <div><label style={LABEL}>Itinéraire</label>{inp(itineraire, setItineraire)}</div>

          <div>
            <label style={LABEL}>Frais pris en charge par l'organisation</label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[['transport', 'Transport aérien'], ['hebergement', 'Hébergement'], ['restauration', 'Restauration'], ['transferts', 'Transferts locaux']].map(([k, lib]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={frais[k]} onChange={e => { setMsg(''); setFrais(f => ({ ...f, [k]: e.target.checked })) }} /> {lib}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={LABEL}>Référence</label>{inp(reference, setReference)}</div>
            <div><label style={LABEL}>Fait à</label>{inp(lieuSignature, setLieuSignature)}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 6 }}>
            <button type="button" style={BTN_PRIMARY} disabled={occupe} onClick={() => enregistrer()}>Enregistrer</button>
            <button type="button" style={BTN_SOFT} onClick={apercu}>Aperçu PDF</button>
            {statut !== 'prete' && statut !== 'envoyee' && <button type="button" style={BTN_SOFT} disabled={occupe} onClick={marquerPrete}>Marquer « prête »</button>}
            <button type="button" style={{ ...BTN, background: '#f1f5f9', color: '#334155', marginLeft: 'auto' }} onClick={onClose}>Fermer</button>
          </div>
          {msg && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: msg.includes('✓') ? '#16a34a' : '#b45309' }}>{msg}</p>}
          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>
            « Prête » rend la lettre téléchargeable par la personne elle-même depuis son espace intervenant.
          </p>
        </div>
      </div>
    </div>
  )
}
