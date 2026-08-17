// supabase/functions/diagnostic-recommandations/index.ts
//
// Fonction serveur (Supabase Edge Function) qui genere l'analyse
// personnalisee d'un diagnostic Smart Port.
//
// Structure imposee par le DG : le raisonnement doit suivre 3 etapes
// strictement separees et dans cet ordre — 1) constat general, 2) analyse
// interpretative de CHACUN des 10 axes, 3) recommandations/plan d'action —
// jamais l'inverse. Pour que le site ET le PDF puissent chacun afficher ces
// 3 parties distinctement (au lieu de deviner des titres dans un bloc de
// texte libre), le modele doit repondre en JSON structure, stocke dans la
// nouvelle colonne `recommandations_v2`. Si le modele derape et renvoie du
// texte non structure, on retombe sur l'ancien format `recommandations`
// (texte brut) pour ne jamais planter — meme filet de securite que celui
// qui laisse les diagnostics deja generes avant ce changement inchanges.
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

function estStructureValide(obj: unknown): obj is { constatGeneral: string; analyseParAxe: Record<string, string>; recommandations: string } {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  if (typeof o.constatGeneral !== 'string' || !o.constatGeneral.trim()) return false
  if (typeof o.recommandations !== 'string' || !o.recommandations.trim()) return false
  if (!o.analyseParAxe || typeof o.analyseParAxe !== 'object') return false
  const axes = o.analyseParAxe as Record<string, unknown>
  return Object.keys(AXES_LABELS).every(k => typeof axes[k] === 'string' && (axes[k] as string).trim().length > 0)
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

    // Reutilise l'analyse existante si deja generee, pour eviter un appel
    // IA (et donc des frais) a chaque fois que quelqu'un revisite la page
    // resultat. Priorite au nouveau format structure ; a defaut, ancien
    // format texte pour les diagnostics generes avant ce changement.
    if (diag.recommandations_v2) {
      return new Response(JSON.stringify({ recommandations_v2: diag.recommandations_v2 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
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

Réponds UNIQUEMENT avec un objet JSON valide — aucun texte avant ou après, aucune balise markdown, aucun bloc de code — respectant EXACTEMENT ce format :

{
  "constatGeneral": "...",
  "analyseParAxe": {
    "infrastructure": "...",
    "automatisation": "...",
    "tracabilite": "...",
    "ia": "...",
    "cybersecurite": "...",
    "surete": "...",
    "environnement": "...",
    "synchromodalite": "...",
    "competences": "...",
    "parties_prenantes": "..."
  },
  "recommandations": "..."
}

Consignes de contenu, dans cet ordre logique strict — ce sont 3 étapes de raisonnement séparées, ne mélange jamais l'analyse et la recommandation dans une même partie :

1. "constatGeneral" : 1 à 3 phrases factuelles et directes sur le profil global de ce port (pas de langue de bois, pas de ton alarmiste). C'est une OBSERVATION, pas encore une recommandation.

2. "analyseParAxe" : pour CHACUN des 10 axes, 1 à 2 phrases qui expliquent ce que le score obtenu révèle CONCRÈTEMENT sur la situation du port pour cet axe précis — jamais une phrase générique qui irait pour n'importe quel score. Appuie-toi sur le niveau réellement atteint (indiqué dans le profil ci-dessus). C'est de l'ANALYSE/INTERPRÉTATION, toujours pas une recommandation.

3. "recommandations" : SEULEMENT maintenant, en t'appuyant sur le constat et l'analyse ci-dessus, propose un plan d'action concret (350 mots maximum) : pour les 2 axes les plus faibles, nomme un outil, une norme, un type de dispositif ou une pratique précise et réaliste (ex : déployer un PCS national, viser la certification ISO 27001, installer des capteurs IoT sur 2-3 portiques pilotes, adhérer à un standard EDI existant dans sa région), avec une première étape très concrète à faire dans le mois qui vient. Termine par comment valoriser l'axe le plus fort.

Règles générales : français uniquement, aucun symbole markdown dans les valeurs texte (pas de #, **, listes à tirets), adresse-toi directement au port ("vous"), n'invente aucun chiffre ni nom de fournisseur spécifique ni aucun fait non fourni ci-dessus.`

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        // 10 paragraphes d'analyse + constat + recommandations, en francais,
        // avec la structure JSON en plus : ca depasse largement les 750
        // tokens qui suffisaient a l'ancien prompt (2 axes seulement). Une
        // limite trop basse ici tronque le JSON en plein milieu -> echec de
        // parsing silencieux plus bas. Marge large pour eviter ça.
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiResp.ok) {
      const errText = await aiResp.text()
      console.error('Anthropic API error:', errText)
      return new Response(JSON.stringify({ error: 'Erreur du service IA' }), { status: 502, headers: corsHeaders })
    }

    const aiData = await aiResp.json()
    const texteGenere = aiData.content?.[0]?.text?.trim()

    if (!texteGenere) {
      console.error('Reponse Anthropic sans texte exploitable:', JSON.stringify(aiData))
      return new Response(JSON.stringify({ error: 'Réponse vide du service IA' }), { status: 502, headers: corsHeaders })
    }

    // Le format structure est desormais la seule sortie acceptee pour une
    // NOUVELLE generation. Si le JSON est tronque (limite de tokens) ou mal
    // forme, on renvoie une erreur plutot que de sauvegarder un texte brut
    // casse en base — sans quoi ce texte casse resterait fige pour
    // toujours (le cache "deja genere" empecherait toute nouvelle tentative,
    // et le site afficherait le JSON brut a la place de l'analyse).
    let recommandationsV2: Record<string, unknown> | null = null
    try {
      const nettoye = texteGenere.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
      const parsed = JSON.parse(nettoye)
      if (estStructureValide(parsed)) {
        recommandationsV2 = parsed
      } else {
        throw new Error('Structure JSON incomplete ou champs manquants')
      }
    } catch (err) {
      console.error('Reponse IA non structuree ou tronquee, echec de generation:', err, texteGenere)
      return new Response(JSON.stringify({ error: 'La génération a échoué (réponse incomplète), réessayez.' }), { status: 502, headers: corsHeaders })
    }

    await supabase.from('diagnostics').update({ recommandations_v2: recommandationsV2, updated_at: new Date().toISOString() }).eq('id', diagnosticId)

    return new Response(JSON.stringify({ recommandations_v2: recommandationsV2 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Erreur interne' }), { status: 500, headers: corsHeaders })
  }
})
