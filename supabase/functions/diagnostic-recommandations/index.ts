// supabase/functions/diagnostic-recommandations/index.ts
//
// Fonction serveur (Supabase Edge Function) qui genere l'analyse
// personnalisee d'un diagnostic Smart Port.
//
// Format "board-ready" impose par le DG (v2 du format structure) : 3
// blocs courts et directement exploitables en reunion de direction —
// 1) diagnostic strategique (2 phrases max), 2) 3 priorites
// d'investissement (titre + explication chacune), 3) une recommandation
// pour le Conseil d'Administration (1-2 phrases). Le detail par axe
// (ancien `analyseParAxe`) est retire du texte IA : il est desormais
// fusionne avec les cartes de plan d'action statiques (deja ecrites par
// axe/palier dans diagnosticAxes.js) directement dans l'UI, pour ne plus
// dupliquer la meme information deux fois sur la page resultat. Le modele
// doit repondre en JSON structure, stocke dans `recommandations_v2`. Si le
// modele derape et renvoie du texte non structure, on retombe sur l'ancien
// format `recommandations` (texte brut) pour ne jamais planter — meme
// filet de securite que celui qui laisse les diagnostics deja generes
// avant ce changement inchanges.
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

type Priorite = { titre: string; explication: string }
type RecommandationsV2 = { diagnosticStrategique: string; prioritesInvestissement: Priorite[]; recommandationCA: string }

function estStructureValide(obj: unknown): obj is RecommandationsV2 {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  if (typeof o.diagnosticStrategique !== 'string' || !o.diagnosticStrategique.trim()) return false
  if (typeof o.recommandationCA !== 'string' || !o.recommandationCA.trim()) return false
  if (!Array.isArray(o.prioritesInvestissement) || o.prioritesInvestissement.length !== 3) return false
  return o.prioritesInvestissement.every(p =>
    p && typeof p === 'object'
    && typeof (p as Record<string, unknown>).titre === 'string' && (p as Record<string, unknown>).titre
    && typeof (p as Record<string, unknown>).explication === 'string' && (p as Record<string, unknown>).explication
  )
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
  "diagnosticStrategique": "...",
  "prioritesInvestissement": [
    { "titre": "...", "explication": "..." },
    { "titre": "...", "explication": "..." },
    { "titre": "...", "explication": "..." }
  ],
  "recommandationCA": "..."
}

Ce format doit pouvoir être lu tel quel dans une réunion de direction (board-ready) : court, direct, sans détour. Consignes de contenu :

1. "diagnosticStrategique" : 2 phrases MAXIMUM, factuelles et directes, qui résument le niveau global de maturité numérique de ce port et ce que ça signifie concrètement pour sa compétitivité — pas de langue de bois, pas de ton alarmiste.

2. "prioritesInvestissement" : EXACTEMENT 3 priorités d'investissement, classées par impact décroissant, en te basant sur les axes les plus faibles ET les plus stratégiques du profil. Pour chacune :
   - "titre" : 2 à 4 mots maximum, percutant (ex. "Guichet unique numérique", "Certification ISO 27001", "Suivi cargo temps réel").
   - "explication" : 1 phrase qui justifie pourquoi cette priorité compte pour CE port précis, en t'appuyant sur son score réel — nomme si pertinent un outil, une norme ou un dispositif concret et réaliste (ex : PCS national, ISO 27001, capteurs IoT, standard EDI régional).

3. "recommandationCA" : 1 à 2 phrases, formulées comme une note de synthèse destinée au Conseil d'Administration — une recommandation d'action ou d'arbitrage, pas un résumé de ce qui précède.

Règles générales : français uniquement, aucun symbole markdown dans les valeurs texte (pas de #, **, listes à tirets), adresse-toi directement au port ("vous") dans "diagnosticStrategique", ton de note de direction dans "recommandationCA", n'invente aucun chiffre ni nom de fournisseur spécifique ni aucun fait non fourni ci-dessus.`

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        // Format v2 (board-ready) beaucoup plus court que l'ancien detail
        // par axe, mais marge large conservee : une limite trop basse
        // tronque le JSON en plein milieu -> echec de parsing silencieux
        // plus bas.
        max_tokens: 1200,
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
