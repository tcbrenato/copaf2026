# COPAF 2026 Web Application

A React + Vite frontend for the COPAF 2026 event:
- public registration and fraud verification
- sponsor / partner / exhibitor contact flows
- live voting and result display
- diagnostic questionnaire and AI-generated recommendations
- admin dashboards, PDF generation and Supabase analytics

## Stack

- React 19
- Vite
- Supabase JS
- i18next + react-i18next
- EmailJS browser SDK
- jsPDF
- Recharts
- Puppeteer
- Google Analytics 4

## Install & run

```bash
npm install
npm run dev
```

Build and prerender:

```bash
npm run build
```

Preview production locally:

```bash
npm run preview
```

## Main routes

### Public pages

- `/` — landing page with hero, partners, programme, modules, intervenants, inscription, contact
- `/inscription` — registration page
- `/verifier` — dossier / IBAN verification, personal document access
- `/partenariats` — sponsorship/partner request page
- `/exposition-digitale` — digital exhibitor request page
- `/visiter` — digital exhibition page
- `/vote` — active poll voting page
- `/sondage-live/:id` — live poll results page
- `/diagnostic` — Smart Port diagnostic questionnaire
- `/diagnostic/resultat/:id` — diagnostic result page with recommendations
- `/tablette` — tablet hub

### Admin pages

- `/admin` — main admin dashboard
- `/admin/proforma` — invoice/proforma management
- `/admin/sondages` — live poll creation and activation
- `/admin/diagnostics` — diagnostic monitoring

## Supabase architecture

### Client-side Supabase usage

Supabase initialization is in `src/supabase.js` using hardcoded values.

Major tables used:
- `contacts`
- `inscriptions`
- `exposants`
- `sponsorships`
- `sondages`
- `votes`
- `diagnostics`
- `sessions`
- `page_views`
- `events`
- `documents_generes`

Storage bucket:
- `documents-inscription`

RPC / Edge Function:
- `verifier_dossier` — validates dossier and returns dossier details for `/verifier`
- `suivi_dossier` — verifies email and returns dossier tracking details
- `next_numero_facture` — used by admin proforma page to create invoice numbers
- `supabase/functions/diagnostic-recommandations` — generates AI recommendations for diagnostic results

## Important components

- `src/App.jsx` — route definitions
- `src/components/Inscription.jsx` — registration flow, contact upsert, inscription insertion, PDF generation, EmailJS email send, Google Sheets sync
- `src/pages/VerifierDossier.jsx` — dossier/IBAN verification, personal document access, PDF/badge/calendar exports
- `src/pages/AdminProforma.jsx` — dossier lookup, status update, note update, PDF generation, invoice management
- `src/pages/AdminSondages.jsx` — poll creation and activation, live poll management
- `src/pages/VoteSondage.jsx` — poll voting page with device token and realtime refresh
- `src/pages/ResultatsSondage.jsx` — poll result display with realtime update
- `src/pages/DiagnosticSmartPort.jsx` — diagnostic questionnaire flow and submission
- `src/pages/DiagnosticResultat.jsx` — diagnostic result display and AI recommendation invocation
- `src/components/AdminDashboard.jsx` — summary dashboard, analytics, data table management
- `src/useAnalytics.js` — GA4 pageview and event tracking, Supabase session/page_views/events writes

## Deployment

Build pipeline:
- `npm run build` runs `vite build` and then `scripts/prerender.mjs`
- `scripts/prerender.mjs` launches `vite preview`, renders static pages for key routes with Puppeteer, and writes HTML files under `dist/`

GitHub Actions in `.github/workflows/deploy.yml`:
- checkout code
- install Node.js
- install dependencies
- run build
- deploy `./dist/` via FTPS, retry with FTP if needed

## Secrets and environment notes

Sensitive values are currently embedded in source. These should be moved to environment variables or secret storage.

- `src/supabase.js` — Supabase URL and anon key
- `src/components/Inscription.jsx` — EmailJS service/template IDs and user key
- `src/pages/AdminProforma.jsx` — EmailJS settings and Google Sheets script URL
- `src/components/AdminDashboard.jsx` — Google Sheets script URL
- `src/pages/ExpositionDigitale.jsx` — Google Sheets script URL
- `src/pages/Partenariats.jsx` — Google Sheets script URL
- Supabase function secrets: `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- GitHub Actions secrets: `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`

## Security cautions

- Admin protection is client-side only via `AdminGate.jsx` with hardcoded passwords in the frontend.
- Live polling and diagnostics rely on Supabase realtime subscriptions and periodic refresh fallback.
- The verification page uses a Supabase RPC function and an official IBAN constant to prevent fraud.

## Notes

- `src/i18n/i18n.js` configures language detection and uses French fallback.
- Some pages use local translation objects instead of the shared i18n instance.
- `src/components/HeaderStack.jsx` dynamically measures header height and exposes `--copaf-header-h` for page spacing.
- `src/utils` contains PDF and badge generation helpers.
