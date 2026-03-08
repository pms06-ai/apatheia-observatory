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

  // Transform Supabase contradictions to match app's expected format
  function transformContradiction(c) {
    return {
      id: c.id,
      title: c.summary ? c.summary.slice(0, 80) : c.id,
      type: c.type || 'Cross-actor contradiction',
      severity: c.severity || 'medium',
      actor: c.actor_a || 'Unknown',
      counterparty: c.actor_b || 'Unknown',
      date_range: c.date_range || '',
      summary: c.summary || '',
      tension: c.tension || '',
      themes: [],
      related_documents: [],
      resolution_status: c.resolution_status || 'unresolved'
    };
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

      if (typeof state === 'undefined' || !state.data) return;

      // Only replace arrays where Supabase has data
      if (politicians.length) state.data.politicians = politicians;
      if (claims.length) state.data.claims = claims;
      if (issues.length) state.data.issues = issues;
      if (talkingPoints.length) state.data.talking_points = talkingPoints;
      if (positionHistory.length) state.data.position_history = positionHistory;
      if (sources.length) state.data.sources_db = sources;

      // Transform and merge contradictions (don't replace static ones)
      if (contradictions.length) {
        const transformed = contradictions.map(transformContradiction);
        const existingIds = new Set((state.data.contradictions || []).map(c => c.id));
        const newOnes = transformed.filter(c => !existingIds.has(c.id));
        state.data.contradictions = [...(state.data.contradictions || []), ...newOnes];
      }

      // Update stats
      state.data.stats = state.data.stats || {};
      state.data.stats.total_politicians = (state.data.politicians || []).length;
      state.data.stats.total_claims = (state.data.claims || []).length;
      state.data.stats.total_issues = (state.data.issues || []).length;
      state.data.stats.total_positions = (state.data.position_history || []).length;
      state.data.stats.total_sources = (state.data.sources_db || []).length;
      state.data.stats.total_contradictions = (state.data.contradictions || []).length;
      state.data.stats.total_talking_points = (state.data.talking_points || []).length;

      // Re-render if available
      if (typeof renderAnalytics === 'function') renderAnalytics();
      if (typeof renderContradictions === 'function') renderContradictions();

      console.log('Supabase data merged:', state.data.stats);
    } catch (err) {
      console.warn('Supabase merge failed, using static data:', err);
    }
  }

  function waitAndMerge() {
    const check = setInterval(() => {
      if (typeof state !== 'undefined' && state.data) {
        clearInterval(check);
        mergeSupabaseData();
      }
    }, 200);
    setTimeout(() => clearInterval(check), 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndMerge);
  } else {
    waitAndMerge();
  }
})();
