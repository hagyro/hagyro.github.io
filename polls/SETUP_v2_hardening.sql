-- ============================================================
--  SUPABASE HARDENING v2 (2026-07-12) — τρέξτε ΟΛΟ το αρχείο στο SQL Editor.
--
--  Τι διορθώνει σε σχέση με το αρχικό SETUP.sql:
--   1. Το anon SELECT στον πίνακα votes ΚΛΕΙΝΕΙ — κανείς δεν διαβάζει raw
--      δεδομένα με το public key. Το dashboard διαβάζει μέσω RPC get_votes()
--      που απαιτεί μυστικό κλειδί (περνιέται ως ?key=... στο URL του dashboard
--      και ΔΕΝ υπάρχει πουθενά στον δημόσιο κώδικα).
--   2. Το anon INSERT μένει (ανώνυμα polls), αλλά με: έλεγχο μορφής slot,
--      όριο μεγέθους payload (2 KB) και throttle 60 inserts/λεπτό/slot —
--      τέλος το ανεξέλεγκτο ballot-stuffing/garbage dumping.
--
--  ΠΡΙΝ ΤΟ RUN: αντικαταστήστε ΚΑΙ ΣΤΑ ΔΥΟ σημεία το REPLACE-WITH-YOUR-SECRET
--  με δικό σας μυστικό (π.χ. 20+ τυχαίοι χαρακτήρες). Το ίδιο μυστικό θα το
--  βάζετε στο URL: dashboard.html?key=ΤΟ-ΜΥΣΤΙΚΟ-ΣΑΣ
-- ============================================================

-- 0) Πίνακας μυστικού (private schema — αόρατος στο PostgREST API)
create schema if not exists private;
create table if not exists private.dashboard_secret (
  id boolean primary key default true check (id),
  secret text not null
);
insert into private.dashboard_secret (id, secret)
values (true, 'REPLACE-WITH-YOUR-SECRET')
on conflict (id) do update set secret = excluded.secret;

do $$ begin
  if (select secret from private.dashboard_secret) like 'REPLACE-WITH%' then
    raise exception 'Δεν αλλάξατε το REPLACE-WITH-YOUR-SECRET — σταματώ.';
  end if;
end $$;

-- 1) Κλείσιμο του ανοιχτού SELECT
drop policy if exists "anon_read_votes" on votes;

-- 2) Constraints στο INSERT (μορφή slot + μέγεθος payload)
alter table votes drop constraint if exists votes_slot_shape;
alter table votes add constraint votes_slot_shape
  check (slot ~ '^[A-Za-z0-9_-]{1,64}$');
alter table votes drop constraint if exists votes_payload_size;
alter table votes add constraint votes_payload_size
  check (pg_column_size(data) <= 2048);

-- 3) Throttle: max 60 inserts/λεπτό ανά slot
create or replace function public.votes_throttle() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from votes
      where slot = new.slot and created_at > now() - interval '1 minute') >= 60 then
    raise exception 'rate limit: too many votes for this slot, try again shortly';
  end if;
  return new;
end $$;
drop trigger if exists votes_throttle_trg on votes;
create trigger votes_throttle_trg before insert on votes
  for each row execute function public.votes_throttle();

-- 4) RPC ανάγνωσης για το dashboard (SECURITY DEFINER + έλεγχος μυστικού)
create or replace function public.get_votes(slots text[], k text)
returns table (slot text, data jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public, private as $$
begin
  if k is distinct from (select secret from private.dashboard_secret) then
    raise exception 'invalid dashboard key';
  end if;
  return query
    select v.slot, v.data, v.created_at from votes v
    where v.slot = any(slots)
    order by v.created_at;
end $$;

-- Δικαιώματα: μόνο εκτέλεση της RPC, τίποτα άλλο
revoke all on table votes from anon;
grant insert on table votes to anon;
grant execute on function public.get_votes(text[], text) to anon;
