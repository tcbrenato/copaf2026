import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import EmailComposer from '../components/EmailComposer'

const CARTE = { background: '#fff', borderRadius: 16, border: '1px solid rgba(0,14,145,0.06)', boxShadow: '0 10px 30px -5px rgba(0,14,145,0.05)' }

// Espace d'envoi manuel d'emails : composeur (objet, message mis en forme,
// signature) + historique des derniers envois manuels.
export default function AdminEmails() {
  const [envois, setEnvois] = useState(null)
  const [erreur, setErreur] = useState('')

  const charger = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications_log')
      .select('id, created_at, destinataire, sujet, envoye_par, ok, detail, dossier')
      .eq('type', 'manuel')
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) { setErreur("Impossible de charger l'historique."); return }
    setEnvois(data || [])
  }, [])

  useEffect(() => { charger() }, [charger]) // eslint-disable-line react-hooks/set-state-in-effect

  const th = { textAlign: 'left', padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a1128', margin: '0 0 6px' }}>Envoyer un email</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
          Rédigez un message mis en forme et envoyez-le à un ou plusieurs participants ou intervenants. Depuis la fiche d'une personne,
          le bouton « Écrire » ouvre ce même formulaire avec son adresse déjà remplie.
        </p>
      </div>

      <div style={{ ...CARTE, padding: 24 }}>
        <EmailComposer onSent={charger} />
      </div>

      <div style={{ ...CARTE, overflowX: 'auto' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0a1128' }}>Derniers envois manuels</h3>
        </div>
        {erreur && <p style={{ padding: 18, margin: 0, color: '#dc2626', fontSize: 13.5 }}>{erreur}</p>}
        {envois === null && !erreur && <p style={{ padding: 18, margin: 0, color: '#64748b', fontSize: 13.5 }}>Chargement…</p>}
        {envois !== null && envois.length === 0 && <p style={{ padding: 18, margin: 0, color: '#64748b', fontSize: 13.5 }}>Aucun email envoyé manuellement pour le moment.</p>}
        {envois !== null && envois.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1px solid rgba(0,14,145,0.08)' }}>
                <th style={th}>Date</th><th style={th}>Destinataire</th><th style={th}>Objet</th><th style={th}>Envoyé par</th><th style={th}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {envois.map((e, i) => (
                <tr key={e.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', verticalAlign: 'top' }}>
                  <td style={{ padding: '12px 18px', whiteSpace: 'nowrap', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(e.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '12px 18px', color: '#0a1128', fontWeight: 600 }}>{e.destinataire}</td>
                  <td style={{ padding: '12px 18px', color: '#334155', maxWidth: 280 }}>{e.sujet || '—'}</td>
                  <td style={{ padding: '12px 18px', color: '#64748b', fontSize: 12.5 }}>{e.envoye_par || '—'}</td>
                  <td style={{ padding: '12px 18px' }}>
                    <span title={e.ok ? '' : e.detail || ''} style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 100, padding: '3px 10px', background: e.ok ? '#dcfce7' : '#fee2e2', color: e.ok ? '#16a34a' : '#dc2626' }}>
                      {e.ok ? 'Envoyé' : 'Échec'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
