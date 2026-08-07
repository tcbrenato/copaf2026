import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AXES_LABELS: Record<string, string> = {
  infrastructure: 'Infrastructure digitale & guichet unique',
  automatisation: 'Automatisation des opérations physiques',
  tracabilite: 'Traçabilité & partage de données',
  ia: 'Intelligence artificielle & aide à la décision',
  cybersecurite: 'Cybersécurité',
  surete: 'Sûreté & sécurité opérationnelle',
  environnement: 'Énergie & environnement',
  synchromodalite: 'Synchromodalité & intégration multimodale',
  competences: 'Capacités organisationnelles & compétences',
  parties_prenantes: 'Engagement des parties prenantes',
}

const NOMS_NIVEAUX = ['Nul', 'Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { diagnosticId } = await req.json()
    if (!diagnosticId) {
      return new Response(JSON.stringify({ error: 'diagnosticId manquant' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: diag, error: fetchErr } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('id', diagnosticId)
      .single()

    if (fetchErr || !diag) {
      return new Response(JSON.stringify({ error: 'Diagnostic introuvable' }), { status: 404, headers: corsHeaders })
    }

    if (diag.recommandations) {
      return new Response(JSON.stringify({ recommandations: diag.recommandations }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const scores = diag.scores || {}
    const profil = Object.keys(AXES_LABELS)
      .map(key => `- ${AXES_LABELS[key]} : ${scores[key] ?? 0}/5 (${NOMS_NIVEAUX[scores[key] ?? 0]})`)
      .join('\n')

    const prompt = `Tu es un expert en transformation digitale portuaire, pour la conférence COPAF 2026 (Conférence des Ports Africains).

Voici le profil de maturité Smart Port de "${diag.organisation || 'ce port'}" (${diag.pays || ''}), sur 10 axes, notés de 0 (nul) à 5 (très bon) :

${profil}

Rédige une analyse courte et actionnable (250 mots maximum), en français, structurée ainsi :
1. Un constat général sur le profil (1-2 phrases, ton factuel et bienveillant, pas alarmiste)
2. Les 2 axes prioritaires à améliorer en premier (les plus faibles), avec pour chacun une action concrète et réaliste à court terme
3. Un point fort à valoriser (l'axe le plus élevé)

Adresse-toi directement au port ("vous"). Sois concret, évite le jargon consultant creux, et n'invente aucun chiffre ou fait qui n'est pas dans les données fournies.`

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiResp.ok) {
      const errText = await aiResp.text()
      console.error('Anthropic API error:', errText)
      return new Response(JSON.stringify({ error: 'Erreur du service IA' }), { status: 502, headers: corsHeaders })
    }

    const aiData = await aiResp.json()
    const recommandations = aiData.content?.[0]?.text?.trim() || "Impossible de générer une analyse pour le moment."

    await supabase.from('diagnostics').update({ recommandations, updated_at: new Date().toISOString() }).eq('id', diagnosticId)

    return new Response(JSON.stringify({ recommandations }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Erreur interne' }), { status: 500, headers: corsHeaders })
  }
})