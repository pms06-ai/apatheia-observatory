/**
 * Supabase REST API client for Apatheia Observatory
 * Fetches live data from Supabase and merges with static dashboard.json
 */
const SUPABASE_URL = 'https://ffvhuhpisbiwgqrbcipn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BPpqWB3lFYhtNVPWIuM4AQ_LCQtfMiR';

async function supabaseFetch(table, query = '') {
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

async function loadSupabaseData() {
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

    const stats = {
      total_politicians: politicians.length,
      total_claims: claims.length,
      total_issues: issues.length,
      total_positions: positionHistory.length,
      total_sources: sources.length,
      total_contradictions: contradictions.length,
      total_talking_points: talkingPoints.length
    };

    return {
      politicians,
      claims,
      issues,
      talking_points: talkingPoints,
      position_history: positionHistory,
      contradictions_db: contradictions,
      sources_db: sources,
      stats
    };
  } catch (err) {
    console.warn('Supabase fetch failed, analytics will use static data:', err);
    return null;
  }
}

window.SupabaseClient = { loadSupabaseData, supabaseFetch };
