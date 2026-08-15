// supabase/functions/smart-port-challenge-score/index.ts
//
// Calcule le score du "COPAF Smart Port Challenge" (demo tablette) et
// enregistre le resultat. Le calcul se fait ICI, jamais dans le
// navigateur : si le client pouvait envoyer son propre score, n'importe
// qui pourrait tricher en inserant 100/100 directement via l'API. Le
// client n'envoie que ses choix (quai, grues, digital) ; cette fonction
// est la seule source de verite pour le score, et la seule autorisee a
// ecrire dans copaf_demo_scores (cle service_role, la table n'a aucune
// policy RLS publique).
//
// DEPLOIEMENT :
//   supabase functions deploy smart-port-challenge-score

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calculer(quai: string, grues: number, digital: boolean) {
  let tempsBase = 10
  if (quai === 'quai-3') tempsBase -= 1.5
  if (grues === 3) tempsBase -= 1
  if (grues === 4) tempsBase -= 2
  if (digital) tempsBase *= 0.7

  const tempsFinal = Math.max(4, tempsBase)
  const coutFinal = Math.round(tempsFinal * 15000)
  const score = Math.min(100, Math.round(100 - tempsFinal * 4))

  return { tempsFinal, coutFinal, score }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { nom, prenom, email, port, quai, grues, digital } = await req.json()

    if (!nom || !prenom || !email || !quai || !grues) {
      return new Response(JSON.stringify({ error: 'Champs manquants' }), { status: 400, headers: corsHeaders })
    }
    if (!['quai-1', 'quai-2', 'quai-3'].includes(quai)) {
      return new Response(JSON.stringify({ error: 'Quai invalide' }), { status: 400, headers: corsHeaders })
    }
    if (![2, 3, 4].includes(grues)) {
      return new Response(JSON.stringify({ error: 'Nombre de grues invalide' }), { status: 400, headers: corsHeaders })
    }

    const avecDigital = calculer(quai, grues, !!digital)
    const sansDigital = calculer(quai, grues, false)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { error: insertErr } = await supabase.from('copaf_demo_scores').insert({
      email: String(email).toLowerCase().trim(),
      nom: `${prenom} ${nom}`.trim(),
      port: port || null,
      score: avecDigital.score,
      temps: avecDigital.tempsFinal,
      cout: avecDigital.coutFinal,
    })

    if (insertErr) {
      console.error('Erreur insertion copaf_demo_scores:', insertErr)
      return new Response(JSON.stringify({ error: 'Erreur enregistrement du score' }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({
      tempsFinal: avecDigital.tempsFinal,
      coutFinal: avecDigital.coutFinal,
      score: avecDigital.score,
      tempsSansDigital: sansDigital.tempsFinal,
      coutSansDigital: sansDigital.coutFinal,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Erreur interne' }), { status: 500, headers: corsHeaders })
  }
})
