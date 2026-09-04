# COPAF 2026 Web Application

A React + Vite frontend for the COPAF 2026 conference (Casablanca, 19–21 October 2026):
- public site, programme, thematic axes, speakers, registration
- personal participant space (badge, documents, dossier tracking) via dossier + email, no password
- QR-code badge system with staff check-in scanning at the entrance
- delegation/group registrations — each member gets their own personal space and documents
- sponsor / partner / exhibitor contact flows
- live voting and result display
- Smart Port diagnostic questionnaire with AI-generated recommendations (10 axes)
- unified admin dashboard (registrations, participants, invoicing, polls, diagnostics, check-in)
- PDF generation (recap, proforma, definitive invoice, diagnostic report, badge)

## Stack

- React 19
- Vite
- React Router 7
- Supabase JS (Postgres, Auth, Storage, Realtime, Edge Functions)
- i18next + react-i18next (FR/EN)
- EmailJS browser SDK
- jsPDF
- qrcode + html5-qrcode (QR generation and camera scanning)
- Recharts
- Puppeteer (build-time prerendering only)
- Google Analytics 4

## Install & run

Copy `.env.example` to `.env` and fill in the real values (Supabase URL/key, Google Sheets Apps Script URLs). The app will not start without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

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

- `/` — landing page with hero, partners, programme, thematic axes, speakers, registration, contact
- `/inscription` — registration page
- `/verifier` — dossier verification (public) + personal space login (dossier + email → badge, documents, dossier tracking)
- `/badge/:token` — public badge page; shows a business-card view to anyone, and the full staff/check-in view only to authenticated staff
- `/partenariats` — sponsorship/partner request page
- `/exposition-digitale` — digital exhibitor request page
- `/visiter` — digital exhibition page
- `/vote` — active poll voting page
- `/sondage-live` / `/sondage-live/:id` — live poll results
- `/diagnostic` — Smart Port diagnostic questionnaire
- `/diagnostic/resultat/:id` — diagnostic result page with AI recommendations
- `/diagnostic/projection` — large-screen live aggregate projection
- `/tablette` — tablet hub (diagnostic kiosk mode)
- `/documentation` — downloadable programme/brochure PDFs (FR/EN)
- `/actualites`, `/actualites/:slug` — news articles
- `/live` — livestream page
- `/recommandations` — proceedings/recommendations page
- `/mentions-legales`, `/politique-confidentialite` — legal pages

### Admin / staff pages (Supabase Auth, see `admins` table)

- `/admin` — unified admin dashboard (registrations, delegation members, invoicing, polls, diagnostics). Accounts with scope `checkin` are redirected to `/staff/scan` instead of seeing this dashboard.
- `/staff/scan` — entrance staff page: camera QR scan (`html5-qrcode`) or manual search, redirects to `/badge/:token` for check-in
- `/admin/proforma`, `/admin/sondages`, `/admin/diagnostics` — legacy routes, redirect to `/admin` (now a single consolidated dashboard)

## Supabase architecture

### Client-side Supabase usage

Supabase client is initialized in `src/supabase.js` from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see `.env.example`). All tables are protected by row-level security.

Main tables:
- `contacts`, `inscriptions`, `inscription_participants` (delegation members registered individually under a shared payment)
- `exposants`, `sponsorships`, `rendezvous_exposants`
- `sondages`, `votes`
- `diagnostics`, `diagnostic_chat_messages`
- `documents_generes`, `documents_participants`, `preuves_paiement`
- `admins` (`user_id`, `email`, `scope` — one admin account = one scope: `all` or `checkin`)
- `sessions`, `page_views`, `events` (analytics)
- `agenda_participant`, `infos_importantes`, `tirage_entrees`, `brochure_leads`, `espace_login_attempts`

Storage buckets:
- `documents-inscription` — generated recap/invoice PDFs for the primary contact
- `documents-participants` — documents uploaded for individual delegation members
- `badges-photos` — participant photos used on badges
- `preuves-paiement` — proof-of-payment uploads

### Key RPC functions / Edge Functions

- `mon_dossier` — returns the authenticated participant's own dossier (primary contact or delegation member), including `badge_token` and documents
- `verifier_dossier` — public dossier/IBAN lookup for the anti-fraud verification page
- `badge_lookup` / `badge_checkin` — public badge display and staff check-in by token
- `staff_search` — staff manual search across `inscriptions` and `inscription_participants`
- `public_upsert_contact` — shared contact upsert used by registration, exhibitor and partner forms
- `lookup_contact_for_diagnostic` — requires dossier + email match (prevents PII leak from dossier number alone)
- `get_diagnostic_live_aggregate` / `get_diagnostic_global_aggregate` / `get_diagnostic_result` — diagnostic aggregation and result retrieval
- `get_diagnostic_chat_messages` / `send_diagnostic_chat_message` — per-port diagnostic respondent chat
- `next_numero_facture` — sequential invoice numbers (admin-only)
- `supabase/functions/diagnostic-recommandations` — Edge Function, calls Anthropic to generate the 3-part diagnostic analysis
- `supabase/functions/access-espace` — server-side dossier+email → Supabase Auth magic-link generation for the personal space (no "check your inbox" step on repeat visits)
- `supabase/functions/generate-espace-link` — generates the one-time magic link inserted into the registration confirmation email
- `supabase/functions/notify-telegram-inscription` — Database Webhook on `inscriptions` INSERT, posts a Telegram notification to the team
- `supabase/functions/create-session`, `supabase/functions/update-time-on-page` — analytics session tracking

## Important components

- `src/App.jsx` — route definitions
- `src/components/Inscription.jsx` — registration flow, contact upsert, inscription insertion, PDF generation, EmailJS confirmation email, Google Sheets sync
- `src/pages/VerifierDossier.jsx` — public dossier verification + personal space entry point, renders `ParticipantDashboard`
- `src/components/ParticipantDashboard.jsx` — participant's personal space (dossier tracking, documents, digital badge with QR linking to `/badge/:token`)
- `src/pages/BadgeToken.jsx` — public/staff badge page, calls `badge_lookup`/`badge_checkin`
- `src/pages/StaffScan.jsx` — entrance staff camera scanner + manual search
- `src/components/AdminDashboard.jsx` — unified admin dashboard: registrations, delegation members (with per-member badge, documents and arrival toggle), invoicing, polls, diagnostics monitoring
- `src/components/AuthGate.jsx` — Supabase Auth gate for `/admin` and `/staff/scan`, reads the account's `scope` from the `admins` table
- `src/pages/AdminProforma.jsx` — dossier lookup, status update, invoice management (rendered inside AdminDashboard)
- `src/pages/DiagnosticSmartPort.jsx` / `src/pages/DiagnosticResultat.jsx` — diagnostic questionnaire flow, submission and AI-recommendation display
- `src/components/DiagnosticChat.jsx` — live chat between respondents from the same port, scoped to a diagnostic room
- `src/useAnalytics.js` — GA4 pageview/event tracking, Supabase `sessions`/`page_views`/`events` writes

## Deployment

Build pipeline:
- `npm run build` runs `vite build` and then `scripts/prerender.mjs`
- `scripts/prerender.mjs` launches `vite preview`, renders static pages for key routes with Puppeteer, and writes HTML files under `dist/`

GitHub Actions in `.github/workflows/deploy.yml`:
- checkout code, install Node.js, install dependencies
- `npm run build`, with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SHEET_URL_INSCRIPTIONS`, `VITE_SHEET_URL_ADMIN` injected from GitHub secrets
- deploy `./dist/` to Hostinger via FTPS, retry with plain FTP if the first attempt fails
- both FTP steps exclude `documents/**` (no longer tracked locally) and use a dedicated `state-name` so the deploy action's remote sync-state can't drift from what the server actually has

## Secrets and environment notes

- `src/supabase.js` — Supabase URL/anon key, from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (env, not hardcoded)
- `VITE_SHEET_URL_INSCRIPTIONS`, `VITE_SHEET_URL_ADMIN` — Google Apps Script endpoints, from env (see `.env.example`)
- `src/components/Inscription.jsx` — EmailJS service/template IDs still hardcoded in source (not sensitive on their own, but should move to env for consistency)
- Supabase Edge Function secrets: `ANTHROPIC_API_KEY` (diagnostic recommendations), `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- GitHub Actions secrets: `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SHEET_URL_INSCRIPTIONS`, `VITE_SHEET_URL_ADMIN`

## Security cautions

- Admin/staff access is real Supabase Auth (email + password), gated by `src/components/AuthGate.jsx`, with row-level security enforcing scope server-side (`admins.scope`: `all` or `checkin`) — not client-side only.
- Supabase project is currently on the **Free plan**: no automatic backups/PITR, and the project auto-pauses after a period of inactivity. Upgrade to Pro before relying on it for the live event (see project notes).
- Live polling and diagnostics rely on Supabase realtime subscriptions and periodic refresh fallback.
- The verification page uses Supabase RPC functions and an official IBAN constant to prevent fraud.
- `access-espace` trades a stricter auth flow for lower friction (dossier + email instead of a one-time token); it rate-limits attempts per IP since dossier numbers are treated as public elsewhere in the app.

## Notes

- `src/i18n/i18n.js` configures language detection and uses French fallback; FR/EN copy lives in `src/i18n/locales/{fr,en}/translation.json`, the single source of truth for the Programme and Axes Thématiques sections.
- Some pages use local translation objects instead of the shared i18n instance.
- `src/components/HeaderStack.jsx` dynamically measures header height and exposes `--copaf-header-h` for page spacing.
- `src/utils` contains PDF, badge and export generation helpers.
