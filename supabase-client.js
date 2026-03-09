// Optional Supabase bridge placeholder.
// The local workstation runs without Supabase; keep this file so index.html
// can load consistently in local/FastAPI and test environments.
(function () {
  window.apatheiaSupabase = window.apatheiaSupabase || {
    enabled: false,
    reason: "Supabase client not configured for this runtime.",
  };
})();
