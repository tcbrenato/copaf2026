# COPAF 2026 Architecture

## Overview

The COPAF 2026 web application is a React + Vite single-page app that serves the public conference site, participant registration and personal space, a QR-code badge/check-in system, sponsor/exhibitor flows, live polling, and a Smart Port diagnostic tool. It uses Supabase as the backend for data storage, authentication, realtime subscriptions, RPC functions, file uploads, Edge Functions, and analytics. The built site is deployed as a static bundle to Hostinger via FTP.

## Project structure

- `src/`
  - `App.jsx` — central route configuration and page loader
  - `main.jsx` — React root bootstrap
  - `supabase.js` — Supabase client setup (from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`)
  - `useAnalytics.js` — analytics instrumentation and Supabase event logging
  - `components/` — reusable UI and form flows
  - `pages/` — route-specific pages for public, participant, and admin sections
  - `utils/` — PDF, badge and export helpers, static data (tariffs, diagnostic axes, ports)
  - `i18n/` — translation configuration and locale files (FR/EN)
- `scripts/prerender.mjs` — static prerendering script that generates HTML from the built app
- `supabase/functions/` — Edge Functions (Deno)
- `.github/workflows/deploy.yml` — CI/CD build and FTP deploy pipeline
- `public/` — static assets, PDFs (programme/brochure FR/EN) and fallback HTML

## Frontend routing

`src/App.jsx` defines the application routes.

Public routes:
- `/` — homepage (hero, partners, programme, thematic axes, speakers, registration, contact)
- `/inscription` — registration
- `/verifier` — dossier verification (public) and personal space login (dossier + email)
- `/badge/:token` — public badge page (business-card view for anyone; full check-in view for authenticated staff)
- `/partenariats` — partner/sponsorship contact form
- `/exposition-digitale` — digital exhibitor contact form
- `/visiter` — exhibition access page
- `/vote` — live polling page
- `/sondage-live`, `/sondage-live/:id` — live poll results
- `/diagnostic` — diagnostic questionnaire
- `/diagnostic/resultat/:id` — diagnostic results
- `/diagnostic/projection` — large-screen live aggregate projection
- `/tablette` — tablet hub (diagnostic kiosk)
- `/documentation`, `/actualites`, `/actualites/:slug`, `/live`, `/recommandations`, `/mentions-legales`, `/politique-confidentialite`

Admin/staff routes (behind Supabase Auth, see `AuthGate.jsx`):
- `/admin` — unified admin dashboard
- `/staff/scan` — entrance staff scanning page (camera QR + manual search)
- `/admin/proforma`, `/admin/sondages`, `/admin/diagnostics` — legacy paths, now redirect to `/admin`

## Supabase usage

`src/supabase.js` creates a Supabase client from environment variables (`.env`, or GitHub Actions secrets at build time).

Client-side features:
- CRUD operations for tables and records, protected by row-level security
- RPC calls for server-side checks, aggregation and generated values
- Storage uploads/downloads for generated PDFs, participant documents, badge photos and payment proofs
- Realtime subscriptions for polls and diagnostics
- Supabase Auth for the personal participant space (magic link) and for admin/staff accounts (email + password)

### Core tables

- `contacts` — visitor/participant contact details
- `inscriptions` — registrations (primary contact of a dossier, possibly a delegation)
- `inscription_participants` — individual delegation members registered under one shared payment; each gets their own `badge_token`, documents and personal-space access
- `inscriptions_backup_doublons` — manual backup table of removed duplicate registrations
- `exposants` — exhibitor requests
- `sponsorships` — sponsor/partner requests
- `rendezvous_exposants` — exhibitor meeting requests
- `sondages` / `votes` — live polls and votes
- `diagnostics` — submitted Smart Port questionnaires and AI-generated results
- `diagnostic_chat_messages` — per-port chat between diagnostic respondents
- `admins` — admin/staff accounts; `user_id` (PK) → `email`, `scope`. One account = exactly one scope (`all` = full admin dashboard, `checkin` = entrance staff, redirected to `/staff/scan`)
- `documents_generes` — generated PDF metadata for the primary contact
- `documents_participants` — documents uploaded for individual delegation members
- `preuves_paiement` — proof-of-payment uploads
- `agenda_participant` — personal agenda/session picks
- `infos_importantes` — admin-editable notices shown to participants
- `tirage_entrees` — prize draw entries
- `brochure_leads` — brochure-download lead capture
- `espace_login_attempts` — rate-limiting log for `access-espace` (per-IP attempt counter)
- `sessions`, `page_views`, `events` — analytics

### Storage

- `documents-inscription` — generated recap/invoice PDFs for the dossier's primary contact
- `documents-participants` — documents uploaded for individual delegation members
- `badges-photos` — participant photos used on digital/printed badges
- `preuves-paiement` — proof-of-payment uploads

### RPC / Edge Functions

RPC (Postgres functions, called via `supabase.rpc(...)`):
- `mon_dossier` — returns the authenticated user's own dossier (primary contact or delegation member fallback), with `badge_token` and unioned documents
- `verifier_dossier` — public dossier/IBAN lookup for the anti-fraud verification page
- `badge_lookup` — public badge lookup by token (business-card view)
- `badge_checkin` — marks a badge as checked in (staff only, enforced by RLS)
- `staff_search` — staff manual search across `inscriptions` and `inscription_participants`
- `public_upsert_contact` — shared contact upsert used by registration, exhibitor and partner forms
- `lookup_contact_for_diagnostic` — requires dossier **and** email match (hardened after a PII-leak fix; dossier number alone is not enough)
- `get_diagnostic_live_aggregate` / `get_diagnostic_global_aggregate` — live/global diagnostic score aggregation for projection screens
- `get_diagnostic_result` — fetches a diagnostic result (structured `recommandations_v2`, with legacy free-text `recommandations` as fallback)
- `get_diagnostic_chat_messages` / `send_diagnostic_chat_message` — diagnostic room chat
- `next_numero_facture` — sequential invoice numbering, admin-only (checked via `is_admin()`)

Edge Functions (`supabase/functions/`, Deno):
- `diagnostic-recommandations` — calls the Anthropic API server-side (key never exposed to the browser) to generate a structured 3-part diagnostic analysis (general assessment → per-axis analysis of all 10 axes → action plan), in that fixed order per specification
- `access-espace` — dossier + email → generates a Supabase Auth magic link server-side and returns it directly (no email round-trip on repeat visits); checks both `inscriptions` and `inscription_participants`; rate-limited per IP via `espace_login_attempts`
- `generate-espace-link` — generates the one-time magic link embedded in the registration confirmation email; only accepts a (dossier, one-time token) pair generated client-side at submission, never an arbitrary email
- `notify-telegram-inscription` — triggered by a Database Webhook on `inscriptions` INSERT; posts a Telegram notification to the team; failures are logged but never fail the registration itself
- `create-session`, `update-time-on-page` — analytics session tracking

## Feature flows

### Registration flow

`src/components/Inscription.jsx`:
- upserts contact data via `public_upsert_contact`
- inserts a registration record in `inscriptions` (and `inscription_participants` rows for delegation members)
- generates a PDF recap using `src/utils/generateRecapPDF.js`
- uploads the generated PDF to Supabase Storage (`documents-inscription`)
- sends a confirmation email via EmailJS, including the magic-link personal-space URL from `generate-espace-link`
- syncs data to Google Sheets through an Apps Script endpoint (`VITE_SHEET_URL_INSCRIPTIONS`)

### Personal space & badges

- `src/pages/VerifierDossier.jsx` — dossier/IBAN verification (public) and personal space entry (dossier + email, or an existing magic-link session)
- `src/components/ParticipantDashboard.jsx` — participant's personal space: dossier status timeline, document downloads, digital badge with QR code linking to `/badge/:token`
- `src/pages/BadgeToken.jsx` — public `/badge/:token` page; shows a minimal business-card view to any visitor, and the full identity + check-in view to authenticated staff (via `badge_lookup` / `badge_checkin`)
- Delegation members (registered individually in `inscription_participants`) get the same personal-space access, badge and document upload as the primary contact, without being counted as separate paying registrations

### Entrance staff / check-in

- `src/pages/StaffScan.jsx` — `/staff/scan`, behind `AuthGate` with `scope = 'checkin'`; camera QR scanning via `html5-qrcode` redirects straight to `/badge/:token`; a manual search (`staff_search` RPC) covers both primary contacts and delegation members
- Accounts with `scope = 'checkin'` never see the admin dashboard: `AdminDashboard.jsx` redirects them to `/staff/scan` immediately
- After a check-in, a "scan next / search next" action returns straight to scanning — staff never has to navigate back manually

### Fraud verification

`src/pages/VerifierDossier.jsx` also implements the original anti-fraud check:
- dossier / IBAN lookup via `verifier_dossier`
- compares the submitted IBAN against the official constant to confirm authenticity of a bank transfer

### Live polling

`src/pages/AdminSondages.jsx` (now rendered inside `AdminDashboard.jsx`), `src/pages/VoteSondage.jsx`, and `src/pages/ResultatsSondage.jsx` support:
- poll creation and activation in the admin UI
- public vote submission with device token deduplication
- results display with realtime refresh

### Diagnostics

- `src/pages/DiagnosticSmartPort.jsx` collects a questionnaire across 10 Smart Port axes (`src/utils/diagnosticAxes.js`)
- Submits results to `diagnostics`; triggers `diagnostic-recommandations` for AI analysis
- `src/components/DiagnosticChat.jsx` — chat between respondents from the same port organisation while filling the questionnaire
- `src/pages/DiagnosticResultat.jsx` displays the structured result (assessment / per-axis analysis / action plan) and the PDF export
- `src/pages/ProjectionDiagnostic.jsx` — large-screen live aggregate view for events
- `src/pages/AdminDiagnostics.jsx` (rendered inside `AdminDashboard.jsx`) — submissions monitoring

### Admin dashboard

`src/components/AdminDashboard.jsx` is now a single consolidated dashboard (the former `/admin/proforma`, `/admin/sondages`, `/admin/diagnostics` routes redirect here):
- KPI summaries: registrations, revenue, sponsors, exhibitors, diagnostics, arrivals ("Présence")
- Participants table: real registrations plus synthetic rows for each delegation member (`inscription_participants`), each opening its own modal
- Per-dossier / per-member detail: badge QR display and download, documents section (shared component reused everywhere a document can be attached to a dossier or a member), "mark arrived" toggle
- Invoicing (former AdminProforma): dossier lookup, status update, proforma/definitive invoice PDF generation
- Poll management (former AdminSondages) and diagnostics monitoring (former AdminDiagnostics)
- Sidebar link to `/staff/scan` for quick access from an `all`-scope account

## Analytics

`src/useAnalytics.js` integrates:
- Google Analytics 4 pageview and event tracking
- Supabase table writes for `sessions`, `page_views`, and `events`
- visitor identification and anonymous device tracking
- excluded on `/admin` and on projection screens (`/sondage-live/:id`, `/diagnostic/projection`) — tracking a screen nobody is browsing makes no sense

## Internationalization

`src/i18n/i18n.js` configures `i18next`.
- detects language from `localStorage` or browser settings, defaults to French
- translations under `src/i18n/locales/fr/translation.json` and `src/i18n/locales/en/translation.json` — this is the single source of truth for the Programme (`programme.days`, `programme.tabs`) and Axes Thématiques (`modules.axes`) sections; both draw from the same underlying content, so a wording fix must be applied once per language file, not per section
- some pages also use local translation objects for dynamic text

## PDF and export utilities

`src/utils/` holds helpers for document exports:
- `generateBadge.js` — badge creation (QR code + identity)
- `generateDiagnosticPDF.js` — diagnostic report PDF
- `generateFactureDefinitivePDF.js` — definitive invoice PDF
- `generateICS.js` — calendar export
- `generateProformaPDF.js` — proforma invoice PDF
- `generateRecapPDF.js` — registration recap PDF

## Static prerendering

`scripts/prerender.mjs` is used in production builds to improve SEO and static page delivery:
- Runs `vite preview`
- Uses Puppeteer to open key public routes and save the rendered HTML to `dist/`

## Deployment pipeline

The GitHub Actions workflow in `.github/workflows/deploy.yml`:
- checks out repository code, installs Node and dependencies
- builds the app, injecting `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SHEET_URL_INSCRIPTIONS`, `VITE_SHEET_URL_ADMIN` from GitHub secrets
- deploys the built output via FTPS to the Hostinger server, with a plain-FTP retry step if the FTPS attempt fails
- both FTP steps exclude `documents/**` (a path that no longer exists locally but that an earlier deploy's remote state still referenced, which used to break the sync) and use a dedicated `state-name` so the deploy action's idea of "what's on the server" can't silently drift from reality again

### Secrets referenced in CI/CD

- `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_SHEET_URL_INSCRIPTIONS`, `VITE_SHEET_URL_ADMIN`

## Security posture

Fixed in this project's lifetime (kept here as context, not a to-do list):
- Supabase URL/anon key moved from hardcoded source into `VITE_*` environment variables
- Admin/staff access uses real Supabase Auth (not just a client-side password gate), with `admins.scope` enforced through row-level security
- `security_definer` views that exposed revenue/funnel data to any authenticated participant were switched to `security_invoker`
- `lookup_contact_for_diagnostic` now requires dossier **and** email match (previously dossier number alone was enough — a PII leak)
- `next_numero_facture` now checks `is_admin()` before issuing an invoice number

Still open / worth watching:
- EmailJS service/template IDs remain hardcoded in `src/components/Inscription.jsx`
- Google Sheets sync depends on Apps Script endpoints reachable with just their URL
- The Supabase project is on the **Free plan**: no automatic backups or point-in-time recovery, and the project auto-pauses after a period without any API activity — worth upgrading to Pro before the event depends on uninterrupted uptime
- `access-espace` intentionally trades a stricter flow (one-time token) for lower friction (dossier + email); mitigated with per-IP rate limiting, but still weaker than a token-based flow by design

## Notes for contributors

- Start from `src/App.jsx` to understand the route layout.
- Use `src/supabase.js` to modify the Supabase client configuration; never hardcode credentials there again.
- Admin/staff pages are behind `src/components/AuthGate.jsx`, backed by real Supabase Auth and the `admins.scope` column — not a client-side-only gate.
- Check `src/i18n/i18n.js` and `src/i18n/locales/*/translation.json` before adding or editing Programme/Axes Thématiques content — fix the shared JSON, not a per-component copy.
- Keep generated document helpers in `src/utils/` to centralize export logic.
