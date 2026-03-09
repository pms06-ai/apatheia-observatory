/**
 * Supabase REST API client for Apatheia Observatory
 * Auto-patches state.data with live Supabase data after app init
 */
(function() {
  const SUPABASE_URL = 'https://ffvhuhpisbiwgqrbcipn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_BPpqWB3lFYhtNVPWIuM4AQ_LCQtfMiR';

  async function supabaseFetch(table, query) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      clearTimeout(timeout);
      if (!res.ok) return [];
      return res.json();
    } catch (_) {
      return [];
    }
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

      const appState = window.state;
      if (!appState || !appState.data) return;

      // Only replace arrays where Supabase has data
      if (politicians.length) appState.data.politicians = politicians;
      if (claims.length) appState.data.claims = claims;
      if (issues.length) appState.data.issues = issues;
      if (talkingPoints.length) appState.data.talking_points = talkingPoints;
      if (positionHistory.length) appState.data.position_history = positionHistory;
      if (sources.length) appState.data.sources_db = sources;

      // Transform and merge contradictions (don't replace static ones)
      if (contradictions.length) {
        const transformed = contradictions.map(transformContradiction);
        const existingIds = new Set((appState.data.contradictions || []).map(c => c.id));
        const newOnes = transformed.filter(c => !existingIds.has(c.id));
        appState.data.contradictions = [...(appState.data.contradictions || []), ...newOnes];
      }

      // Update stats
      appState.data.stats = appState.data.stats || {};
      appState.data.stats.total_politicians = (appState.data.politicians || []).length;
      appState.data.stats.total_claims = (appState.data.claims || []).length;
      appState.data.stats.total_issues = (appState.data.issues || []).length;
      appState.data.stats.total_positions = (appState.data.position_history || []).length;
      appState.data.stats.total_sources = (appState.data.sources_db || []).length;
      appState.data.stats.total_contradictions = (appState.data.contradictions || []).length;
      appState.data.stats.total_talking_points = (appState.data.talking_points || []).length;

      // Request a full redraw through the app entry point.
      if (typeof window.render === 'function') window.render();

      console.log('Supabase data merged:', appState.data.stats);
    } catch (err) {
      console.warn('Supabase merge failed, using static data:', err);
    }
  }

  function waitAndMerge() {
    if (window.state && window.state.data) {
      mergeSupabaseData();
      return;
    }
    document.addEventListener('apatheia:data-ready', mergeSupabaseData, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndMerge);
  } else {
    waitAndMerge();
  }
})();
