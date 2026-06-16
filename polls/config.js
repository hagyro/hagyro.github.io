// ============================================================
//  ΡΥΘΜΙΣΕΙΣ SUPABASE — Συμπληρώστε τα δικά σας στοιχεία ΕΔΩ.
//  (Αλλάζετε ΜΟΝΟ αυτό το αρχείο μία φορά· όλα τα polls το διαβάζουν.)
// ============================================================

const SUPABASE_URL  = "https://lmkmafacididwwkjivhn.supabase.co";        // ← Project URL
const SUPABASE_ANON = "sb_publishable_8HMyRiA_qQz26BCF4y9Ouw_L6ZysJ0-";  // ← publishable (public) key

// ----- Μην αλλάζετε τίποτα κάτω από εδώ -----
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// Καταγραφή ψήφου (γράφει μία γραμμή στον πίνακα "votes")
async function castVote(slot, payload) {
  return await sb.from("votes").insert([{ slot: slot, data: payload }]);
}

// Προστασία: 1 ψήφος ανά συσκευή ανά slot (localStorage)
function alreadyVoted(slot) {
  return localStorage.getItem("voted_" + slot) === "1";
}
function markVoted(slot) {
  localStorage.setItem("voted_" + slot, "1");
}
