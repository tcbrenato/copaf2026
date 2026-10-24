// supabase/functions/demande-presentations/index.ts
//
// Demande d'accès aux présentations de la conférence depuis la page publique
// Documentation : les présentations ne sont visibles que depuis les espaces
// personnels, donc toute autre personne passe par ce formulaire. La demande est
// enregistrée (table demandes_presentations), l'équipe est prévenue par email
// (reply-to = le demandeur) et le demandeur reçoit un accusé de réception.
//
// Protections : champ piège (website), limite de 3 demandes par email et par
// 24 h, 30 demandes par heure au total, tailles de champs bornées.
//
// DEPLOIEMENT : supabase functions deploy demande-presentations --no-verify-jwt --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/
const DEST_EQUIPE = 'contact@copaf-ports.com'

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

async function envoyer(to: string, subject: string, html: string, replyTo?: string) {
  const key = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM_EMAIL') || 'COPAF 2026 <onboarding@resend.dev>'
  if (!key) return false
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  })
  return resp.ok
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const b = await req.json().catch(() => ({}))
    if (txt(b.website, 200)) return json({ success: true }) // champ piège rempli : on fait semblant

    const nom = txt(b.nom, 120)
    const email = txt(b.email, 160).toLowerCase()
    const organisation = txt(b.organisation, 160)
    const pays = txt(b.pays, 80)
    const message = txt(b.message, 1000)
    const langue = b.langue === 'en' ? 'en' : 'fr'

    if (!nom || !EMAIL_RE.test(email)) return json({ error: langue === 'en' ? 'Name and a valid email are required' : 'Nom et email valide obligatoires' }, 400)

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const il24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const ilYa1h = new Date(Date.now() - 3600 * 1000).toISOString()
    const { count: parEmail } = await supabase.from('demandes_presentations').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', il24h)
    const { count: global } = await supabase.from('demandes_presentations').select('id', { count: 'exact', head: true }).gte('created_at', ilYa1h)
    if ((parEmail ?? 0) >= 3 || (global ?? 0) >= 30) return json({ error: langue === 'en' ? 'Too many requests, please try again later' : 'Trop de demandes, réessayez plus tard' }, 429)

    const { error: insErr } = await supabase.from('demandes_presentations').insert({ nom, email, organisation: organisation || null, pays: pays || null, message: message || null, langue })
    if (insErr) { console.error('insert demande:', insErr.message); return json({ error: 'Erreur interne' }, 500) }

    const ligne = (k: string, v: string) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#64748B">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>` : '')
    await envoyer(
      DEST_EQUIPE,
      `Demande d'accès aux présentations COPAF 2026 : ${nom}`,
      `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1E293B"><p>Nouvelle demande d'accès aux présentations de la conférence (formulaire de la page Documentation).</p><table>${ligne('Nom', nom)}${ligne('Email', email)}${ligne('Organisation', organisation)}${ligne('Pays', pays)}${ligne('Langue', langue)}</table>${message ? `<p style="margin-top:12px"><i>${esc(message).replace(/\n/g, '<br>')}</i></p>` : ''}<p style="color:#64748B;font-size:12px">Répondez directement à ce message pour écrire au demandeur.</p></div>`,
      email,
    ).catch(e => console.error('mail equipe:', e))

    const accuse = langue === 'en'
      ? { s: 'Your request for the COPAF 2026 presentations', h: `<p>Hello ${esc(nom)},</p><p>We have received your request for access to the COPAF 2026 presentations. Our team will get back to you shortly.</p><p>Best regards,<br>The COPAF 2026 team</p>` }
      : { s: 'Votre demande de présentations COPAF 2026', h: `<p>Bonjour ${esc(nom)},</p><p>Nous avons bien reçu votre demande d'accès aux présentations de la COPAF 2026. Notre équipe vous répondra très prochainement.</p><p>Cordialement,<br>L'équipe COPAF 2026</p>` }
    await envoyer(email, accuse.s, `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1E293B">${accuse.h}</div>`, DEST_EQUIPE).catch(e => console.error('mail accuse:', e))

    return json({ success: true })
  } catch (err) {
    console.error('Erreur interne demande-presentations:', err)
    return json({ error: 'Erreur interne' }, 500)
  }
})
