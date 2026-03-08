/**
 * Supabase REST API client for Apatheia Observatory
 * Auto-patches state.data with live Supabase data after app init
 */
(function() {
  const SUPABASE_URL = 'https://ffvhuhpisbiwgqrbcipn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_BPpqWB3lFYhtNVPWIuM4AQ_LCQtfMiR';

  async function supabaseFetch(table, query) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) return [];
    return res.json();
  }

  async function mergeSupabaseData() {
    try {
      const [politicians, claims, issues, talkingPoints, positionHistory, contradictions, sources] = await Promise.all([
        supabaseFetch('politicians', 'select=*'),
        supabaseFetch('claims', 'select=*&order=date.desc'),
        supabaseFetch('issues', 'select=*'),
        supabaseFetch('talking_points', 'select=*'),
        supabaseFetch('position_history', 'select=*&order=date.desc'),
        supabaseFetch('contradictions', 'select=*'),
        supabaseFetch('sources', 'select=*&order=date.desc')
      ]);

      // Wait for state to be available
      if (typeof state === 'undefined' || !state.data) return;

      // Merge arrays - append Supabase data that doesn't exist in static JSON
      if (politicians.length) state.data.politicians = politicians;
      if (claims.length) state.data.claims = claims;
      if (issues.length) state.data.issues = issues;
      if (talkingPoints.length) state.data.talking_points = talkingPoints;
      if (positionHistory.length) state.data.position_history = positionHistory;
      if (contradictions.length) state.data.contradictions = contradictions;
      if (sources.length) state.data.sources_db = sources;

      // Update stats
      state.data.stats = state.data.stats || {};
      state.data.stats.total_politicians = (state.data.politicians || []).length;
      state.data.stats.total_claims = (state.data.claims || []).length;
      state.data.stats.total_issues = (state.data.issues || []).length;
      state.data.stats.total_positions = (state.data.position_history || []).length;
      state.data.stats.total_sources = (state.data.sources_db || []).length;
      state.data.stats.total_contradictions = (state.data.contradictions || []).length;
      state.data.stats.total_talking_points = (state.data.talking_points || []).length;

      // Re-render analytics if available
      if (typeof renderAnalytics === 'function') renderAnalytics();
      if (typeof renderContradictions === 'function') renderContradictions();

      console.log('Supabase data merged:', state.data.stats);
    } catch (err) {
      console.warn('Supabase merge failed, using static data:', err);
    }
  }

  // Poll for state.data availability then merge
  function waitAndMerge() {
    const check = setInterval(() => {
      if (typeof state !== 'undefined' && state.data) {
        clearInterval(check);
        mergeSupabaseData();
      }
    }, 200);
    // Stop checking after 10s
    setTimeout(() => clearInterval(check), 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndMerge);
  } else {
    waitAndMerge();
  }
})();
