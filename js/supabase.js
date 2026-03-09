import { getMetaContent } from "./utils.js";

const SUPABASE_URL = getMetaContent("supabase-url");
const SUPABASE_KEY = getMetaContent("supabase-key");

async function supabaseFetch(table, query) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return [];
  }
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (_) {
    return [];
  }
}

function transformContradiction(c) {
  return {
    id: c.id,
    title: c.summary ? c.summary.slice(0, 80) : c.id,
    type: c.type || "Cross-actor contradiction",
    severity: c.severity || "medium",
    actor: c.actor_a || c.actor || "Unknown",
    counterparty: c.actor_b || c.counterparty || "Unknown",
    date_range: c.date_range || "",
    summary: c.summary || "",
    tension: c.tension || "",
    themes: c.themes || [],
    related_documents: c.related_documents || [],
    resolution_status: c.resolution_status || "unresolved",
  };
}

export async function mergeSupabaseData() {
  try {
    const [politicians, claims, issues, talkingPoints, positionHistory, contradictions, sources] =
      await Promise.all([
        supabaseFetch("politicians", "select=*"),
        supabaseFetch("claims", "select=*&order=date.desc"),
        supabaseFetch("issues", "select=*"),
        supabaseFetch("talking_points", "select=*"),
        supabaseFetch("position_history", "select=*&order=date.desc"),
        supabaseFetch("contradictions", "select=*"),
        supabaseFetch("sources", "select=*&order=date.desc"),
      ]);

    const appState = window.state;
    if (!appState || !appState.data) {
      return;
    }

    if (politicians.length) appState.data.politicians = politicians;
    if (claims.length) appState.data.claims = claims;
    if (issues.length) appState.data.issues = issues;
    if (talkingPoints.length) appState.data.talking_points = talkingPoints;
    if (positionHistory.length) appState.data.position_history = positionHistory;
    if (sources.length) appState.data.sources_db = sources;

    if (contradictions.length) {
      const transformed = contradictions.map(transformContradiction);
      const existingIds = new Set((appState.data.contradictions || []).map((item) => item.id));
      const newOnes = transformed.filter((item) => !existingIds.has(item.id));
      appState.data.contradictions = [...(appState.data.contradictions || []), ...newOnes];
    }

    appState.data.stats = appState.data.stats || {};
    appState.data.stats.total_politicians = (appState.data.politicians || []).length;
    appState.data.stats.total_claims = (appState.data.claims || []).length;
    appState.data.stats.total_issues = (appState.data.issues || []).length;
    appState.data.stats.total_positions = (appState.data.position_history || []).length;
    appState.data.stats.total_sources = (appState.data.sources_db || []).length;
    appState.data.stats.total_contradictions = (appState.data.contradictions || []).length;
    appState.data.stats.total_talking_points = (appState.data.talking_points || []).length;

    if (typeof window.render === "function") {
      window.render();
    }
  } catch (err) {
    console.warn("Supabase merge failed, using static data:", err);
  }
}

export function startSupabaseMerge() {
  if (window.state && window.state.data) {
    mergeSupabaseData();
    return;
  }
  document.addEventListener("apatheia:data-ready", mergeSupabaseData, { once: true });
}
