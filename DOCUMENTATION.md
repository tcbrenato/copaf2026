# COPAF 2026 Architecture

## Overview

The COPAF 2026 web application is a React + Vite single-page app that serves public event pages, participant registration, fraud verification, live polling, and diagnostics. It uses Supabase as the backend for data storage, realtime subscriptions, RPC functions, file uploads, and analytics.

## Project structure

- `src/`
  - `App.jsx` — central route configuration and page loader
  - `main.jsx` — React root bootstrap
  - `supabase.js` — Supabase client setup
  - `useAnalytics.js` — analytics instrumentation and Supabase event logging
  - `components/` — reusable UI and form flows
  - `pages/` — route-specific pages for public and admin sections
  - `utils/` — PDF and export helpers
  - `i18n/` — translation configuration and locale files
- `scripts/prerender.mjs` — static prerendering script that generates HTML from the built app
- `.github/workflows/deploy.yml` — CI/CD build and FTP deploy pipeline
- `public/` — static assets and fallback HTML

## Frontend routing

`src/App.jsx` defines the application routes.

Public routes:
- `/` — homepage
- `/inscription` — registration
- `/verifier` — dossier and IBAN verification
- `/partenariats` — partner/sponsorship contact form
- `/exposition-digitale` — digital exhibitor contact form
- `/visiter` — exhibition access page
- `/vote` — live polling page
- `/sondage-live/:id` — live poll results
- `/diagnostic` — diagnostic questionnaire
- `/diagnostic/resultat/:id` — diagnostic results
- `/tablette` — tablet hub

Admin routes:
- `/admin` — admin dashboard
- `/admin/proforma` — proforma / invoice manager
- `/admin/sondages` — poll management
- `/admin/diagnostics` — diagnostics monitoring

## Supabase usage

`src/supabase.js` creates a Supabase client with project URL and anon key.

Client-side features:
- CRUD operations for tables and records
- RPC calls for server-side checks and generated values
- Storage uploads for generated PDF documents
- Realtime subscriptions for polls and diagnostics

### Core tables

- `contacts` — store contact details and visitor interactions
- `inscriptions` — participant registrations and document metadata
- `exposants` — exhibitor requests
- `sponsorships` — sponsor / partner requests
- `sondages` — live polls definitions and active status
- `votes` — poll votes and device tracking
- `diagnostics` — submitted questionnaires and results
- `sessions` — analytics sessions and page view tracking
- `page_views` — pageview analytics
- `events` — custom analytics events
- `documents_generes` — generated PDF/document metadata

### Storage

- Bucket: `documents-inscription`
- Used for upload and retrieval of generated registration documents

### RPC / Edge Functions

- `verifier_dossier` — verify a dossier number or IBAN and return dossier details
- `suivi_dossier` — validate personal email for document access and tracking
- `next_numero_facture` — compute the next invoice number for admin proforma generation
- `diagnostic-recommandations` — Supabase Edge Function invoked to generate AI recommendations for a diagnostic result

## Feature flows

### Registration flow

`src/components/Inscription.jsx` handles registration:
- upserts visitor contact data to `contacts`
- inserts a registration record in `inscriptions`
- generates a PDF recap / badge using utilities from `src/utils`
- uploads generated PDF to Supabase storage
- sends confirmation email via EmailJS
- syncs data to Google Sheets through Apps Script endpoints

### Fraud verification

`src/pages/VerifierDossier.jsx` implements:
- dossier / IBAN lookup
- verification via Supabase RPC
- personal email validation and resume retrieval
- document and badge exports (PDF, ICS calendar, badge)
- support for delegated access and verification history

### Live polling

`src/pages/AdminSondages.jsx`, `src/pages/VoteSondage.jsx`, and `src/pages/ResultatsSondage.jsx` support:
- poll creation and editing in admin UI
- active poll management and realtime vote counts
- public vote submission with device token deduplication
- results display with live refresh

### Diagnostics

- `src/pages/DiagnosticSmartPort.jsx` collects a questionnaire across 10 smart port axes
- Submits results to `diagnostics`
- `src/pages/DiagnosticResultat.jsx` displays results and invokes AI recommendation generation via the Edge Function
- `src/pages/AdminDiagnostics.jsx` displays diagnostic submissions for admin monitoring

### Admin dashboard

`src/components/AdminDashboard.jsx` provides:
- analytics summaries for registrations, sponsors, exhibitors, diagnostics, and polls
- data tables for contacts, inscriptions, sponsorships, and exhibitors
- status updates and sheet synchronization via Google Sheets script URLs

## Analytics

`src/useAnalytics.js` integrates:
- Google Analytics 4 pageview and event tracking
- Supabase table writes for sessions, page views, and custom events
- visitor identification and anonymous device tracking

## Internationalization

`src/i18n/i18n.js` configures `i18next`.
- detects language from `localStorage` or browser settings
- defaults to French
- translations are stored under `src/i18n/locales/en/translation.json` and `src/i18n/locales/fr/translation.json`
- some pages also use local translation objects for dynamic text

## PDF and export utilities

`src/utils/` holds helpers for document exports:
- `generateBadge.js` — badge creation
- `generateDiagnosticPDF.js` — diagnostic report PDF
- `generateFactureDefinitivePDF.js` — invoice/definitive PDF
- `generateICS.js` — calendar export
- `generateProformaPDF.js` — proforma PDF
- `generateRecapPDF.js` — registration recap PDF

## Static prerendering

`scripts/prerender.mjs` is used in production builds to improve SEO and static page delivery:
- Runs `vite preview`
- Uses Puppeteer to open routes: `/`, `/inscription`, `/partenariats`, `/exposition-digitale`, `/visiter`, `/verifier`
- Saves the rendered HTML to `dist/`

## Deployment pipeline

The GitHub Actions workflow in `.github/workflows/deploy.yml`:
- checks out repository code
- installs Node and dependencies
- builds the app
- deploys built output via FTPS to a Hostinger server
- includes a fallback FTP deploy step if FTPS fails

### Secrets referenced in CI/CD

- `FTP_HOST`
- `FTP_USERNAME`
- `FTP_PASSWORD`

## Security concerns

Current areas that require attention:
- hardcoded Supabase keys and EmailJS credentials in frontend source
- admin page protection only via client-side password gate
- Google Sheets sync using hardcoded Apps Script URLs
- public RPC and storage access in frontend means sensitive operations should be moved to server-side API or secured with proper auth

## Recommended improvements

1. Move all secrets out of source code into environment variables or secret storage.
2. Replace client-side admin gating with server-side authentication.
3. Secure Supabase access with row-level policies and service roles where needed.
4. Use server-side endpoints for email delivery and spreadsheet syncing.
5. Add automated tests for route flows, Supabase interactions, and PDF generation.

## Notes for contributors

- Start from `src/App.jsx` to understand the route layout.
- Use `src/supabase.js` to modify the Supabase client configuration.
- Admin pages are available behind `src/components/AdminGate.jsx` and are not protected by a backend-auth mechanism.
- Check `src/i18n/i18n.js` before adding new translated content.
- Keep generated document helpers in `src/utils/` to centralize export logic.
