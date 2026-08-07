// supabase/functions/diagnostic-recommandations/index.ts
//
// Fonction serveur (Supabase Edge Function) qui genere les
// recommandations personnalisees d'un diagnostic Smart Port.
//
// Pourquoi une fonction serveur et pas un appel direct depuis la
// tablette ? Parce qu'un appel direct depuis le navigateur obligerait
// a exposer la cle API Anthropic dans le code JS visible par tous —
// n'importe qui pourrait la recuperer et l'utiliser a nos frais. Ici,
// la cle reste uniquement sur le serveur Supabase, jamais envoyee au
// navigateur.
//
// DEPLOIEMENT (a faire une seule fois depuis un terminal) :
//   1. npm install -g supabase          (si pas deja installe)
//   2. supabase login
//   3. supabase link --project-ref <ton-project-ref>   (ex: pdtohaxbsgpxccopgnmd)
//   4. supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   5. supabase functions deploy diagnostic-recommandations

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

    // Reutilise les recommandations existantes si deja generees,
    // pour eviter de refaire un appel IA (et donc des frais) a chaque
    // fois que quelqu'un revisite la page resultat.
    if (diag.recommandations) {
      return new Response(JSON.stringify({ recommandations: diag.recommandations }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const scores = diag.scores || {}
    const profil = Object.keys(AXES_LABELS)
      .map(key => `- ${AXES_LABELS[key]} : ${scores[key] ?? 0}/5 (${NOMS_NIVEAUX[scores[key] ?? 0]})`)
      .join('\n')

    const prompt = `Tu es un consultant senior en transformation digitale portuaire, intervenant pour la conférence COPAF 2026 (Conférence des Ports Africains). Tu connais precisement les outils et normes du secteur : Port Community System (PCS), Terminal Operating System (TOS), EDI/UN-EDIFACT, capteurs IoT sur portiques et grues, jumeaux numeriques, Code ISPS, normes ISO 27001/28000, guichets uniques portuaires (type GUCE), plateformes de suivi de conteneurs (type TradeLens/successeurs), systemes SCADA pour l'energie, etc.

Voici le profil de maturité Smart Port de "${diag.organisation || 'ce port'}" (${diag.pays || ''}), sur 10 axes, notés de 0 (nul) à 5 (très bon) :

${profil}

Rédige une analyse dense et directement actionnable (350 mots maximum), en français. Consignes strictes de format :
- TEXTE BRUT UNIQUEMENT. Aucun symbole Markdown : pas de #, pas de ##, pas de **, pas de tirets de liste, pas de crochets.
- Pour les titres de section, écris-les simplement en majuscules suivies de deux-points, sur leur propre ligne (ex : CONSTAT GENERAL :).
- Pour mettre un mot en avant, utilise des guillemets ou rien du tout — jamais d'astérisques.

Structure attendue :
CONSTAT GENERAL : 1-2 phrases factuelles et directes sur le profil global (pas de langue de bois, pas de ton alarmiste non plus).

AXES PRIORITAIRES : les 2 axes les plus faibles. Pour chacun, ne te contente pas de "faites un audit" — nomme un outil, une norme, un type de dispositif ou une pratique precise et realiste que ce port pourrait concretement mettre en place ou explorer en premier (ex : deployer un PCS national, se rapprocher de la certification ISO 27001, installer des capteurs IoT sur 2-3 portiques pilotes, adherer a un standard EDI existant dans sa region, etc.), avec une premiere etape tres concrete a faire dans le mois qui vient.

POINT FORT A VALORISER : l'axe le plus eleve, et comment ce port pourrait s'en servir comme argument ou comme base pour progresser sur un axe faible connexe.

Adresse-toi directement au port ("vous"). Sois precis et technique sans etre jargonneux au point d'etre incomprehensible. N'invente aucun chiffre, aucun nom de fournisseur specifique, ni aucun fait qui n'est pas dans les donnees fournies — reste sur des categories d'outils/normes reconnues du secteur, pas des marques.`

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 750,
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