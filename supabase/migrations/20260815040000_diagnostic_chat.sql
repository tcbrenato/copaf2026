-- Diagnostic Smart Port — chat entre repondants du meme port (post-phase 4).
-- Portee par "room_key" (organisation_id[:site_id], ou une cle stable
-- derivee du nom pour les organisations saisies en "Autre"), calculee cote
-- client. Aucune authentification requise (comme le reste du diagnostic) :
-- pseudo libre, table verrouillee en RLS, acces uniquement via les deux RPC
-- SECURITY DEFINER ci-dessous (meme principe que get_diagnostic_live_aggregate).

create table if not exists public.diagnostic_chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_key text not null,
  auteur text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint diagnostic_chat_auteur_len check (char_length(auteur) between 1 and 60),
  constraint diagnostic_chat_message_len check (char_length(message) between 1 and 500)
);

create index if not exists diagnostic_chat_messages_room_idx
  on public.diagnostic_chat_messages (room_key, created_at);

alter table public.diagnostic_chat_messages enable row level security;
-- Pas de policy anon/authenticated : tout passe par les RPC SECURITY DEFINER.

create or replace function public.get_diagnostic_chat_messages(p_room_key text)
returns setof public.diagnostic_chat_messages
language sql
security definer
set search_path = public
stable
as $$
  select * from public.diagnostic_chat_messages
  where room_key = p_room_key
  order by created_at asc
  limit 200;
$$;

create or replace function public.send_diagnostic_chat_message(
  p_room_key text,
  p_auteur text,
  p_message text
) returns public.diagnostic_chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.diagnostic_chat_messages;
begin
  insert into public.diagnostic_chat_messages (room_key, auteur, message)
  values (trim(p_room_key), trim(p_auteur), trim(p_message))
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.get_diagnostic_chat_messages(text) to anon, authenticated;
grant execute on function public.send_diagnostic_chat_message(text, text, text) to anon, authenticated;
