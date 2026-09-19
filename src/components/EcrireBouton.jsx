// src/components/EcrireBouton.jsx
//
// Bouton "Ecrire" affiche dans la fiche admin d'une personne (participant,
// membre de delegation, intervenant) : ouvre le formulaire d'envoi d'email
// avec l'adresse de la personne deja remplie. `dossier` est le dossier
// INDIVIDUEL de la personne (meme cle que ValidationDocuments).

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Mail, X } from 'lucide-react'
import { supabase } from '../supabase'
import EmailComposer from './EmailComposer'

// Retrouve nom + email d'un dossier dans les 3 tables (meme cascade que
// badge_lookup_by_dossier, mais avec l'email : l'admin y a acces par ses droits).
async function trouverContact(dossier) {
  const { data: insc } = await supabase.from('inscriptions').select('contacts(nom, prenom, email)').eq('dossier', dossier).maybeSingle()
  if (insc?.contacts) return insc.contacts
  const { data: part } = await supabase.from('inscription_participants').select('nom, prenom, email').eq('dossier', dossier).maybeSingle()
  if (part) return part
  const { data: interv } = await supabase.from('intervenants').select('nom, prenom, email').eq('dossier', dossier).maybeSingle()
  return interv || null
}

export default function EcrireBouton({ dossier }) {
  const [ouvert, setOuvert] = useState(false)
  const [contact, setContact] = useState(null)
  const [chargement, setChargement] = useState(false)

  if (!dossier) return null

  const ouvrir = async () => {
    setChargement(true)
    setContact(await trouverContact(dossier))
    setChargement(false)
    setOuvert(true)
  }

  const nom = contact ? `${contact.prenom || ''} ${contact.nom || ''}`.trim() : ''

  return (
    <>
      <button
        type="button" onClick={ouvrir} disabled={chargement}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#000E91', fontSize: 12.5, fontWeight: 700, cursor: chargement ? 'wait' : 'pointer', fontFamily: 'inherit' }}
      >
        <Mail size={14} /> {chargement ? 'Ouverture…' : 'Écrire à cette personne'}
      </button>

      {ouvert && createPortal((
        <div onClick={() => setOuvert(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,17,40,.6)', zIndex: 9000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 780, margin: 'auto', padding: 28, position: 'relative' }}>
            <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer" style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0a1128' }}>Écrire{nom ? ` à ${nom}` : ''}</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
              {contact?.email ? 'Son adresse est déjà renseignée ci-dessous.' : "Aucune adresse email n'est enregistrée pour cette personne : saisissez-en une."}
            </p>
            <EmailComposer initialTo={contact?.email ? [contact.email] : []} dossier={dossier} />
          </div>
        </div>
      ), document.body)}
    </>
  )
}
