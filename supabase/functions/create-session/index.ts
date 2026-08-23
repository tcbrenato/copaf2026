// supabase/functions/create-session/index.ts
//
// Cree une ligne "sessions" en resolvant le pays depuis l'IP reelle du
// visiteur (en-tete x-forwarded-for, transmis de maniere fiable par la
// plateforme Supabase) plutot que par un appel a une API de geolocalisation
// depuis le navigateur — insensible aux bloqueurs de pub/vie privee qui
// bloquent souvent ce genre d'appel cote client.
//
// DEPLOIEMENT :
//   supabase functions deploy create-session --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { contact_id = null } = await req.json().catch(() => ({}))

    const forwardedFor = req.headers.get('x-forwarded-for') || ''
    const clientIp = forwardedFor.split(',')[0].trim()
    const userAgent = (req.headers.get('user-agent') || '').slice(0, 200)

    let country: string | null = null
    if (clientIp && clientIp !== '127.0.0.1') {
      try {
        const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`)
        if (geoRes.ok) {
          const geo = await geoRes.json()
          country = geo.country_name ?? null
        }
      } catch (geoErr) {
        // Jamais bloquant : une session sans pays reste une session valide.
        console.error('Geolocalisation echouee:', geoErr)
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase
      .from('sessions')
      .insert([{ contact_id, user_agent: userAgent, country, page_count: 0 }])
      .select('id')
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ id: data.id, country }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur create-session:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
