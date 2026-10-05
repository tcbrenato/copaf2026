-- « Ma mission » détaillée : dates, responsables avec boutons d'appel/WhatsApp, badge, lien de lieu, horaire d'arrivée,
-- encadré « Prochaine étape » et bloc « En cas de problème ». Tout reste éditable depuis l'onglet admin « Équipe ».
alter table public.equipe_membres add column if not exists dates_mission    text;
alter table public.equipe_membres add column if not exists responsables     jsonb not null default '[]'::jsonb;  -- [{nom, role, tel, whatsapp}]
alter table public.equipe_membres add column if not exists badge_info       text;
alter table public.equipe_membres add column if not exists rdv_lien         text;   -- lien Google Maps du lieu de rendez-vous
alter table public.equipe_membres add column if not exists horaire_arrivee  text;
alter table public.equipe_membres add column if not exists prochaine_etape  text;   -- vide = prochaine ligne du planning
alter table public.equipe_membres add column if not exists probleme_contact text;
alter table public.equipe_membres add column if not exists probleme_horaires text;

-- Fatima, Wiame, Mohamed : fiches identiques (accueil et assistance des participants)
update public.equipe_membres set
  dates_mission = 'Du 18 au 21 octobre 2026',
  responsables = '[
    {"nom": "Yvette FANOU", "role": "accueil", "tel": "+229 61 74 42 42", "whatsapp": "+229 61 74 42 42"},
    {"nom": "Rénato TCHOBO", "role": "technique", "tel": "", "whatsapp": "+229 69 02 43 49"}
  ]'::jsonb,
  tenue = 'Tenue professionnelle aux couleurs COPAF : bleu marine {#00367F} et bleu ciel {#1798F4}',
  badge_info = 'Remis à l''hôtel avant le début de la mission. À porter visible en permanence.',
  rdv_lieu = '[Nom de l''hôtel]',
  rdv_detail = 'hall d''accueil',
  rdv_lien = null,
  horaire_arrivee = 'Jour 1 : 8h30 (ouverture à 9h) · Jours 2 et 3 : voir « Mon planning »',
  prochaine_etape = '18 octobre, [heure] : accueil des participants à l''hôtel, hall d''accueil.',
  probleme_contact = '[numéro unique]',
  probleme_horaires = '[horaires]',
  consignes = array[
    'Arriver 30 minutes avant le début de chaque journée.',
    'Toute question sans réponse est transmise à la coordination, sans improviser.',
    'Aucune information sur les paiements, les tarifs ou le statut des ports.',
    'Photos et publications sur les réseaux sociaux uniquement si elles sont validées par la DCM.'
  ]::text[]
where dossier in ('INT2026-010', 'INT2026-011', 'INT2026-012');

-- Leur mission court du 18 au 21 octobre : on retire du planning les lignes provisoires hors de ces dates
delete from public.equipe_planning p
using public.equipe_membres m
where p.membre_id = m.id
  and m.dossier in ('INT2026-010', 'INT2026-011', 'INT2026-012')
  and (p.jour < date '2026-10-18' or p.jour > date '2026-10-21');
