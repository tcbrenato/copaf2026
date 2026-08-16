import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const COULEURS = ['#0073F4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
const DUREE_SPIN_MS = 4600

const Ico = ({ name, size = 16, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    plus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    trash: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>,
    shuffle: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  }
  return icons[name] || null
}

export default function AdminTirage() {
  const [entrees, setEntrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [nouveauNom, setNouveauNom] = useState('')
  const [texteEnMasse, setTexteEnMasse] = useState('')
  const [important, setImportant] = useState(false)

  const [rotation, setRotation] = useState(0)
  const [tournant, setTournant] = useState(false)
  const [gagnant, setGagnant] = useState(null)
  const roueRef = useRef([]) // capture de l'ordre au moment du lancer, pour retrouver le gagnant apres l'animation

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tirage_entrees')
      .select('id, nom, actif')
      .eq('actif', true)
      .order('created_at', { ascending: true })
    setEntrees(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const ajouterUn = async () => {
    if (!nouveauNom.trim()) return
    const { error } = await supabase.from('tirage_entrees').insert([{ nom: nouveauNom.trim() }])
    if (error) { showToast('Erreur : ' + error.message); return }
    setNouveauNom('')
    load()
  }

  const ajouterEnMasse = async () => {
    const noms = texteEnMasse.split('\n').map(l => l.trim()).filter(Boolean)
    if (noms.length === 0) return
    const { error } = await supabase.from('tirage_entrees').insert(noms.map(nom => ({ nom })))
    if (error) { showToast('Erreur : ' + error.message); return }
    setTexteEnMasse('')
    showToast(`${noms.length} participant(s) ajouté(s)`)
    load()
  }

  const importerInscrits = async () => {
    setImportant(true)
    const { data, error } = await supabase
      .from('inscriptions')
      .select('contacts(nom, prenom)')
      .eq('paiement_status', 'confirme')
    setImportant(false)
    if (error) { showToast('Erreur : ' + error.message); return }

    const dejaPresents = new Set(entrees.map(e => e.nom))
    const nouveaux = (data || [])
      .map(r => `${r.contacts?.prenom || ''} ${r.contacts?.nom || ''}`.trim())
      .filter(nom => nom && !dejaPresents.has(nom))

    if (nouveaux.length === 0) { showToast('Aucun nouvel inscrit confirmé à importer'); return }

    const { error: insErr } = await supabase.from('tirage_entrees').insert(nouveaux.map(nom => ({ nom })))
    if (insErr) { showToast('Erreur : ' + insErr.message); return }
    showToast(`${nouveaux.length} inscrit(s) confirmé(s) importé(s)`)
    load()
  }

  const retirerEntree = async id => {
    await supabase.from('tirage_entrees').delete().eq('id', id)
    load()
  }

  const viderTout = async () => {
    if (entrees.length === 0) return
    await supabase.from('tirage_entrees').delete().not('id', 'is', null)
    load()
  }

  const melanger = () => {
    setEntrees(e => {
      const copie = [...e]
      for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copie[i], copie[j]] = [copie[j], copie[i]]
      }
      return copie
    })
  }

  const lancerRoue = () => {
    if (tournant || entrees.length < 2) return
    const roue = [...entrees]
    roueRef.current = roue
    const n = roue.length
    const seg = 360 / n
    const winnerIdx = Math.floor(Math.random() * n)
    const midAngle = winnerIdx * seg + seg / 2

    const currentMod = ((rotation % 360) + 360) % 360
    const targetMod = (((-90 - midAngle) % 360) + 360) % 360
    let delta = targetMod - currentMod
    if (delta <= 0) delta += 360

    setTournant(true)
    setGagnant(null)
    setRotation(r => r + 5 * 360 + delta)

    setTimeout(() => {
      setTournant(false)
      setGagnant(roueRef.current[winnerIdx])
    }, DUREE_SPIN_MS)
  }

  const fermerModal = () => setGagnant(null)
  const retirerGagnant = async () => {
    if (gagnant) await retirerEntree(gagnant.id)
    setGagnant(null)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
    color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  }
  const actionBtn = (bg, color, border) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
    background: bg, border: `1.5px solid ${border}`, borderRadius: 10, color,
    fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
  })

  // ─── Geometrie de la roue ────────────────────────────────────────────────
  const taille = 380
  const cx = taille / 2
  const cy = taille / 2
  const r = taille / 2 - 6
  const n = entrees.length
  const seg = n > 0 ? 360 / n : 360

  const pointSurCercle = (angleDeg, rayon) => {
    const rad = (angleDeg * Math.PI) / 180
    return [cx + rayon * Math.cos(rad), cy + rayon * Math.sin(rad)]
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Tirage au sort</div>
        <div style={{ fontSize: 13.5, color: '#64748b' }}>Tombola, animation de formation, tirage clients — préparez la liste puis lancez la roue sur l'écran connecté au projecteur.</div>
      </div>

      {toast && (
        <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Roue */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: taille, height: taille }}>
            {/* Pointeur fixe */}
            <div style={{
              position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', zIndex: 2,
              width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent',
              borderTop: `22px solid ${NAVY}`,
            }} />
            <svg
              width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: tournant ? `transform ${DUREE_SPIN_MS}ms cubic-bezier(0.15, 0.65, 0.15, 1)` : 'none',
                borderRadius: '50%', boxShadow: '0 10px 40px rgba(0,14,145,.25)',
              }}
            >
              {n === 0 && <circle cx={cx} cy={cy} r={r} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />}
              {entrees.map((e, i) => {
                const startAngle = i * seg
                const endAngle = (i + 1) * seg
                const [x1, y1] = pointSurCercle(startAngle, r)
                const [x2, y2] = pointSurCercle(endAngle, r)
                const largeArc = seg > 180 ? 1 : 0
                const midAngle = startAngle + seg / 2
                const [tx, ty] = pointSurCercle(midAngle, r * 0.62)
                return (
                  <g key={e.id}>
                    <path
                      d={n === 1 ? undefined : `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={COULEURS[i % COULEURS.length]}
                      stroke="#fff" strokeWidth="1.5"
                    />
                    {n === 1 && <circle cx={cx} cy={cy} r={r} fill={COULEURS[0]} stroke="#fff" strokeWidth="1.5" />}
                    <text
                      x={tx} y={ty} fill="#fff" fontSize={n > 14 ? 10 : 13} fontWeight="800"
                      textAnchor="middle" dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                    >
                      {e.nom.length > 16 ? e.nom.slice(0, 15) + '…' : e.nom}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <button
            onClick={lancerRoue}
            disabled={tournant || entrees.length < 2}
            style={{
              ...actionBtn(BLUE, '#fff', BLUE), padding: '14px 36px', fontSize: 15, borderRadius: 30,
              opacity: tournant || entrees.length < 2 ? 0.5 : 1, cursor: tournant || entrees.length < 2 ? 'default' : 'pointer',
            }}
          >
            {tournant ? 'Ça tourne...' : 'Lancer la roue'}
          </button>
          {entrees.length < 2 && <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>Ajoutez au moins 2 participants pour lancer la roue.</p>}
        </div>

        {/* Gestion des entrees */}
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
              Ajouter des participants
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                style={inputStyle} placeholder="Nom du participant" value={nouveauNom}
                onChange={e => setNouveauNom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && ajouterUn()}
              />
              <button onClick={ajouterUn} style={{ ...actionBtn(BLUE, '#fff', BLUE), padding: '10px 14px' }}>
                <Ico name="plus" size={15} color="#fff" />
              </button>
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical', marginBottom: 8 }}
              placeholder={'Ou collez une liste, un nom par ligne :\nMarie Diallo\nJean Kouassi\n...'}
              value={texteEnMasse}
              onChange={e => setTexteEnMasse(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={ajouterEnMasse} style={actionBtn('#f1f5f9', '#334155', '#e2e8f0')}>Ajouter la liste</button>
              <button onClick={importerInscrits} disabled={important} style={actionBtn('#EBF3FF', NAVY, '#bfdbfe')}>
                <Ico name="download" size={14} color={NAVY} />
                {important ? 'Import...' : 'Importer les inscrits confirmés'}
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>
                Participants {!loading && `(${entrees.length})`}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={melanger} title="Mélanger" style={{ ...actionBtn('#f1f5f9', '#334155', '#e2e8f0'), padding: '6px 10px' }}>
                  <Ico name="shuffle" size={13} color="#334155" />
                </button>
                <button onClick={viderTout} title="Tout retirer" style={{ ...actionBtn('#fef2f2', '#dc2626', '#fecaca'), padding: '6px 10px' }}>
                  <Ico name="trash" size={13} color="#dc2626" />
                </button>
              </div>
            </div>

            {loading && <div style={{ color: '#94a3b8', fontSize: 13 }}>Chargement...</div>}
            {!loading && entrees.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucun participant pour l'instant.</div>}

            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entrees.map((e, i) => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  padding: '8px 12px', borderRadius: 10, background: '#f8fafc',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: COULEURS[i % COULEURS.length], flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nom}</span>
                  </span>
                  <button onClick={() => retirerEntree(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <Ico name="trash" size={13} color="#cbd5e1" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modale gagnant */}
      {gagnant && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.75)', backdropFilter: 'blur(6px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={fermerModal}>
          <div style={{
            background: '#fff', borderRadius: 20, overflow: 'hidden', maxWidth: 480, width: '100%',
            boxShadow: '0 25px 60px rgba(0,0,0,.4)', animation: 'copaf-tirage-in .35s cubic-bezier(0.34,1.56,0.64,1)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#dc2626', color: '#fff', padding: '18px 24px', fontSize: 16, fontWeight: 800 }}>
              🎉 Nous avons un gagnant !
            </div>
            <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 34, fontWeight: 900, color: '#0f172a' }}>
              {gagnant.nom}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={fermerModal} style={actionBtn('#f1f5f9', '#334155', '#e2e8f0')}>Fermer</button>
              <button onClick={retirerGagnant} style={actionBtn(BLUE, '#fff', BLUE)}>Retirer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes copaf-tirage-in { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  )
}
