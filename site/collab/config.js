/* Collaboration backend settings.
   Leave both blank to run in DEMO mode (everything stays in this browser only, nothing is shared).
   To go live: create a free Supabase project, run supabase/schema.sql in its SQL editor,
   then paste the Project URL and the "anon public" key below (see supabase/README.md).
   The anon key is meant to be public; the database's row-level security rules are what protect the data. */
window.SPC_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  storageBucket: "uploads"
};
