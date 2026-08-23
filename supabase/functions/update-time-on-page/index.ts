// supabase/functions/update-time-on-page/index.ts
//
// Recoit, au depart du visiteur d'une page (navigator.sendBeacon), l'id de
// la ligne "page_views" creee a l'arrivee et la duree passee en secondes,
// puis met a jour time_on_page. sendBeacon ne peut pas envoyer d'en-tete
// Authorization : cette fonction doit donc etre deployee avec la
// verification JWT desactivee (--no-verify-jwt), comme n'importe quel
// tracking analytics public — elle ne fait qu'une mise a jour non sensible
// d'un champ numerique.
//
// DEPLOIEMENT :
//   supabase functions deploy update-time-on-page --no-verify-jwt --project-ref pdtohaxbsgpxccopgnmd

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // sendBeacon envoie le corps en text/plain : on le parse nous-memes.
    const raw = await req.text()
    const { page_view_id, time_on_page } = JSON.parse(raw)

    if (!page_view_id || typeof time_on_page !== 'number') {
      return new Response(JSON.stringify({ error: 'page_view_id et time_on_page (nombre) requis' }), {
        status: 400, headers: corsHeaders,
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Borne a 30 min pour ecarter les onglets laisses ouverts toute la nuit.
    const clamped = Math.max(0, Math.min(Math.round(time_on_page), 1800))

    const { error } = await supabase
      .from('page_views')
      .update({ time_on_page: clamped })
      .eq('id', page_view_id)

    if (error) throw error

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur update-time-on-page:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
