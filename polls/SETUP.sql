-- ΠΡΟΣΟΧΗ (2026-07-12): ΞΕΠΕΡΑΣΜΕΝΟ. Το ανοιχτό anon SELECT ήταν ευπάθεια.
-- Χρησιμοποιήστε το SETUP_v2_hardening.sql (κλειστό read, RPC με κλειδί, throttle).

-- ============================================================
--  SUPABASE SETUP — Αντιγράψτε ΟΛΟ αυτό στο SQL Editor και πατήστε RUN.
-- ============================================================

-- 1) Πίνακας που κρατά κάθε ψήφο ως μία γραμμή
create table if not exists votes (
  id        bigint generated always as identity primary key,
  slot      text not null,
  data      jsonb not null,
  created_at timestamptz not null default now()
);

-- 2) Ενεργοποίηση Row Level Security
alter table votes enable row level security;

-- 3) Πολιτική: επιτρέπεται σε οποιονδήποτε (anon) να ΕΙΣΑΓΕΙ ψήφο
create policy "anon_insert_votes"
  on votes for insert
  to anon
  with check (true);

-- 4) Πολιτική: επιτρέπεται σε οποιονδήποτε να ΔΙΑΒΑΖΕΙ (για το dashboard)
create policy "anon_read_votes"
  on votes for select
  to anon
  using (true);

-- (Σημ.: anon = το public key. Κανείς δεν μπορεί να σβήσει/τροποποιήσει,
--  μόνο insert & read. Αρκεί για live polls.)
