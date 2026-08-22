// supabase/functions/notify-telegram-inscription/index.ts
//
// Notifie l'equipe COPAF sur Telegram a chaque nouvelle inscription.
// Declenchee par un Database Webhook Supabase (table "inscriptions",
// evenement INSERT) — pas d'appel direct depuis le navigateur : le token
// du bot Telegram ne doit jamais transiter par le client.
//
// La notification est un bonus, jamais une dependance critique : toute
// erreur (Telegram down, token invalide, contact introuvable...) est
// loggee via console.error mais la fonction repond quand meme 200, pour
// ne jamais faire apparaitre l'inscription comme "en echec" cote Supabase
// a cause d'un probleme de notification.
//
// DEPLOIEMENT (a faire une seule fois depuis un terminal) :
//   1. npm install -g supabase          (si pas deja installe)
//   2. supabase login
//   3. supabase link --project-ref <ton-project-ref>   (ex: pdtohaxbsgpxccopgnmd)
//   4. supabase secrets set TELEGRAM_BOT_TOKEN=123456:ABC-...
//      supabase secrets set TELEGRAM_CHAT_ID=-1001234567890
//   5. supabase functions deploy notify-telegram-inscription
//
// Puis configurer le Database Webhook dans Supabase Studio
// (Database → Webhooks → Create a new webhook) — voir le guide complet
// dans README-notify-telegram-inscription.md a cote de ce fichier.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface InscriptionRecord {
  id: string
  contact_id: string | null
  dossier: string | null
  participants: number | null
  montant: number | string | null
  paiement_status: string | null
  paiement_mode: string | null
  langue: string | null
  created_at: string
}

interface WebhookPayload {
  type: string
  table: string
  record: InscriptionRecord
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Echappe les caracteres speciaux HTML pour ne jamais casser le parsing
// Telegram (parse_mode: "HTML") si un nom/organisation contient & < >.
function escapeHtml(value: unknown): string {
  const str = value === null || value === undefined || value === '' ? '—' : String(value)
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildMessage(record: InscriptionRecord, contact: { prenom: string | null; nom: string | null; organisation: string | null; pays: string | null } | null) {
  const prenom = escapeHtml(contact?.prenom)
  const nom = escapeHtml(contact?.nom)
  const organisation = escapeHtml(contact?.organisation)
  const pays = escapeHtml(contact?.pays)
  const participants = escapeHtml(record.participants ?? 1)
  const montant = escapeHtml(record.montant)
  const statut = escapeHtml(record.paiement_status)
  const dossier = escapeHtml(record.dossier)
  const langue = escapeHtml(record.langue)

  return `🎉 Nouvelle inscription COPAF 2026 !

👤 ${prenom} ${nom}
🏢 ${organisation}
🌍 ${pays}
👥 ${participants} participant(s)
💰 ${montant}€ — Statut : ${statut}
📋 Dossier : ${dossier}
🌐 Langue : ${langue}`
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = (await req.json()) as WebhookPayload
    const record = payload?.record

    if (!record) {
      return new Response(JSON.stringify({ error: 'Payload invalide : "record" manquant' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let contact: { prenom: string | null; nom: string | null; organisation: string | null; pays: string | null } | null = null
    if (record.contact_id) {
      const { data, error } = await supabase
        .from('contacts')
        .select('prenom, nom, organisation, pays')
        .eq('id', record.contact_id)
        .single()
      if (error) console.error('Contact introuvable pour', record.contact_id, error)
      else contact = data
    }

    const message = buildMessage(record, contact)

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      console.error('TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manquant dans les secrets de la fonction')
      return new Response(JSON.stringify({ success: true, warning: 'Telegram non configuré' }), { headers: corsHeaders })
    }

    try {
      const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      })

      if (!tgResp.ok) {
        const errText = await tgResp.text()
        console.error('Erreur API Telegram:', tgResp.status, errText)
      }
    } catch (tgErr) {
      // Reseau indisponible, timeout, etc. — jamais bloquant pour l'inscription.
      console.error('Echec de l\'appel a l\'API Telegram:', tgErr)
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    // Meme en cas d'erreur interne inattendue, on repond 200 : la
    // notification ne doit jamais faire apparaitre l'inscription comme
    // en echec cote webhook Supabase.
    console.error('Erreur interne notify-telegram-inscription:', err)
    return new Response(JSON.stringify({ success: true, warning: 'Erreur interne lors de la notification' }), { headers: corsHeaders })
  }
})
