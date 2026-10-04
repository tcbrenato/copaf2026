import { useState } from 'react'
import { supabase } from '../../supabase'
import AdminEquipePlanning from './AdminEquipePlanning'

const INPUT = { padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 9, outline: 'none', boxSizing: 'border-box', width: '100%', background: '#fff' }
const ETIQ = { fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }
const BTN_PRIMARY = { padding: '10px 18px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: '#00367F', cursor: 'pointer', fontFamily: 'inherit' }

const CHAMPS_TEXTE = [
  ['nom', 'Nom *'], ['dossier', 'Dossier (INT2026-0XX, lien avec la fiche intervenant)'], ['email', 'Email de connexion'], ['email2', 'Email secondaire (connexion)'],
  ['role', 'Rôle'], ['equipe', 'Équipe'], ['comite', 'Comité'], ['titre', 'Titre professionnel (badge digital)'],
  ['responsable_nom', 'Responsable (nom)'], ['responsable_tel', 'Responsable (téléphone)'],
  ['rdv_lieu', 'Point de rendez-vous : lieu'], ['rdv_detail', 'Point de rendez-vous : détail'],
  ['badge_url', 'Lien du badge (vide = badge public automatique)'], ['attestation_url', 'Lien de l’attestation (actif à partir du 21 oct.)'],
]

// Fiche d'un membre : tous les champs de l'espace équipe + son planning.
export default function AdminEquipeMembre({ membre, onSaved }) {
  const [f, setF] = useState({ ...membre, consignesTxt: (membre.consignes || []).join('\n') })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [photoEnCours, setPhotoEnCours] = useState(false)

  const maj = (cle, valeur) => { setMsg(''); setF(x => ({ ...x, [cle]: valeur })) }
  const vide = v => (String(v ?? '').trim() === '' ? null : String(v).trim())

  const televerserPhoto = async e => {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    setPhotoEnCours(true); setMsg('')
    const ext = (fichier.name.split('.').pop() || 'jpg').toLowerCase()
    const chemin = `${f.dossier || 'EQUIPE'}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('badges-photos').upload(chemin, fichier, { upsert: true })
    setPhotoEnCours(false)
    if (error) { setMsg(`Échec de l'envoi de la photo : ${error.message}`); return }
    maj('photo_url', supabase.storage.from('badges-photos').getPublicUrl(chemin).data.publicUrl)
  }

  const enregistrer = async () => {
    if (!String(f.nom || '').trim()) { setMsg('Le nom est obligatoire.'); return }
    setSaving(true); setMsg('')
    const champs = {
      nom: f.nom.trim(), dossier: vide(f.dossier), email: vide(f.email), email2: vide(f.email2), photo_url: vide(f.photo_url),
      role: vide(f.role), equipe: vide(f.equipe), comite: vide(f.comite), titre: vide(f.titre), biographie: vide(f.biographie),
      responsable_nom: vide(f.responsable_nom), responsable_tel: vide(f.responsable_tel), tenue: vide(f.tenue),
      consignes: String(f.consignesTxt || '').split('\n').map(l => l.trim()).filter(Boolean),
      rdv_lieu: vide(f.rdv_lieu), rdv_detail: vide(f.rdv_detail), badge_url: vide(f.badge_url), attestation_url: vide(f.attestation_url),
      ordre: Number(f.ordre) || 0,
    }
    const { error } = await supabase.from('equipe_membres').update(champs).eq('id', membre.id)
    setSaving(false)
    if (error) { setMsg(error.message); return }
    setMsg('Enregistré ✓')
    onSaved?.()
  }

  const bio = String(f.biographie || '')

  return (
    <div style={{ padding: 16, borderTop: '1px solid #eef2f7', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {CHAMPS_TEXTE.map(([cle, etiquette]) => (
          <div key={cle}>
            <label style={ETIQ}>{etiquette}</label>
            <input value={f[cle] || ''} onChange={e => maj(cle, e.target.value)} style={INPUT} />
          </div>
        ))}
        <div>
          <label style={ETIQ}>Ordre d'affichage</label>
          <input type="number" value={f.ordre ?? 0} onChange={e => maj('ordre', e.target.value)} style={INPUT} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={ETIQ}>Photo (vide = photo de la fiche intervenant)</label>
            <input type="file" accept="image/*" onChange={televerserPhoto} disabled={photoEnCours} style={{ fontSize: 12 }} />
          </div>
          {f.photo_url && <img src={f.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />}
        </div>
      </div>

      <div>
        <label style={ETIQ}>Tenue / badge</label>
        <textarea value={f.tenue || ''} onChange={e => maj('tenue', e.target.value)} rows={2} style={{ ...INPUT, resize: 'vertical' }} />
      </div>
      <div>
        <label style={ETIQ}>Consignes — une par ligne</label>
        <textarea value={f.consignesTxt} onChange={e => maj('consignesTxt', e.target.value)} rows={5} style={{ ...INPUT, resize: 'vertical' }} />
      </div>
      <div>
        <label style={ETIQ}>Biographie (badge digital, retours à la ligne conservés) — {bio.length} caractère{bio.length > 1 ? 's' : ''}</label>
        <textarea value={f.biographie || ''} onChange={e => maj('biographie', e.target.value)} rows={7} style={{ ...INPUT, resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={enregistrer} disabled={saving} style={BTN_PRIMARY}>{saving ? 'Enregistrement…' : 'Enregistrer la fiche'}</button>
        {msg && <span style={{ fontSize: 13, fontWeight: 700, color: msg.includes('✓') ? '#16a34a' : '#dc2626' }}>{msg}</span>}
      </div>

      <AdminEquipePlanning membreId={membre.id} />
    </div>
  )
}
