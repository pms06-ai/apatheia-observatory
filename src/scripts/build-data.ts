/**
 * build-data.ts — Build-time data pipeline
 *
 * Runs as `prebuild` before `next build`. Reads normalized source JSON,
 * validates references, builds indexes/aggregations, generates per-page
 * slices, and writes everything to /data/generated/.
 *
 * Run manually: npx tsx src/scripts/build-data.ts
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'data', 'source');
const OUT = path.join(ROOT, 'data', 'generated');

// ─── Helpers ────────────────────────────────────────────────────────────

function readSource<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(SOURCE, file), 'utf-8')) as T;
}

function writeGenerated(filePath: string, data: unknown) {
  const full = path.join(OUT, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function toTitleCase(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Types (inline to avoid import issues with tsx) ─────────────────────

interface Actor {
  id: string;
  name: string;
  type: string;
  party: string | null;
  role: string | null;
  state: string | null;
  chamber: string | null;
  bio: string | null;
  summary: string;
  positioning: string;
  photo_url: string | null;
  stance_on_iran: string | null;
  key_committees: string[];
  signals: string[];
  watchpoints: string[];
  bias_rating: number;
  reliability_score: number;
  dominant_themes: string[];
  phases: { date: string; label: string; stance: string; detail: string }[];
  linked_contradictions: string[];
  tags: string[];
  outlet: string | null;
  bloc?: string;
}

interface Evidence {
  id: string;
  doc_id: string;
  doc_title?: string;
  kind: string;
  title: string;
  text: string;
  actors: string[];
  themes: string[];
  dates: string[];
}

interface Contradiction {
  id: string;
  title: string;
  actor: string;
  counterparty: string | null;
  type: string;
  severity: string;
  date_range: string;
  summary: string;
  tension: string;
  themes: string[];
  related_documents: string[];
}

interface Statement {
  id: string;
  actor_id: string;
  date: string;
  context: string;
  text: string;
  source: string;
  source_url: string | null;
  type: string;
  themes: string[];
  stance: string;
  verified: boolean;
  significance: string;
  media_reception: string;
}

interface Document {
  id: string;
  file: string;
  label: string;
  type: string;
  title: string;
  word_count: number;
  section_count: number;
  quote_count: number;
  table_line_count: number;
  themes: string[];
  actors: string[];
  dates: string[];
}

interface Theme {
  id: string;
  name: string;
  description: string;
}

interface FramingAnalysis {
  id: string;
  title: string;
  category: string;
  severity: string;
  date: string;
  summary: string;
  actor_ids: string[];
  themes: string[];
  [key: string]: unknown;
}

interface Explainer {
  id: string;
  term: string;
  category: string;
  also_known_as: string[];
  definition: string;
  how_it_works: string;
  why_it_matters: string;
  common_misconceptions: string[];
  in_context: string;
  related_terms: string[];
  sources: string[];
}

interface TimelineEvent {
  date: string;
  title: string;
  detail: string;
  focus: string[];
}

// ─── Stage 0: CLEAN ─────────────────────────────────────────────────────

if (fs.existsSync(OUT)) {
  fs.rmSync(OUT, { recursive: true });
}
fs.mkdirSync(OUT, { recursive: true });

// ─── Stage 1: LOAD ─────────────────────────────────────────────────────

console.log('📦 Loading source data...');

const actors = readSource<Actor[]>('actors.json');
const evidence = readSource<Evidence[]>('evidence.json');
const contradictions = readSource<Contradiction[]>('contradictions.json');
const statements = readSource<Statement[]>('statements.json');
const documents = readSource<Document[]>('documents.json');
const themes = readSource<Theme[]>('themes.json');
const framing = readSource<FramingAnalysis[]>('framing-analysis.json');
const explainers = readSource<Explainer[]>('explainers.json');
const timeline = readSource<TimelineEvent[]>('timeline.json');

console.log(`   ${actors.length} actors, ${evidence.length} evidence, ${contradictions.length} contradictions`);
console.log(`   ${statements.length} statements, ${documents.length} documents, ${themes.length} themes`);
console.log(`   ${framing.length} framing, ${explainers.length} explainers, ${timeline.length} timeline`);

// Name lookup maps for display name resolution
const actorNameMap = new Map(actors.map((a) => [a.id, a.name]));
const themeNameMap = new Map(themes.map((t) => [t.id, t.name]));
const docTitleMap = new Map(documents.map((d) => [d.id, d.title]));

// ─── Stage 2: VALIDATE ─────────────────────────────────────────────────

console.log('\n🔍 Validating references...');

const actorIds = new Set(actors.map((a) => a.id));
const themeIds = new Set(themes.map((t) => t.id));

// Collect all theme IDs referenced across all entities (including slugified ones)
// We'll accept any theme ID that's consistently used, even if not in themes.json
const allReferencedThemeIds = new Set<string>();
for (const a of actors) a.dominant_themes.forEach((t) => allReferencedThemeIds.add(t));
for (const e of evidence) e.themes.forEach((t) => allReferencedThemeIds.add(t));
for (const c of contradictions) c.themes.forEach((t) => allReferencedThemeIds.add(t));
for (const s of statements) s.themes.forEach((t) => allReferencedThemeIds.add(t));

// Validate evidence actor refs
for (const e of evidence) {
  for (const aid of e.actors) {
    if (!actorIds.has(aid)) {
      console.warn(`  ⚠ evidence "${e.id}" references unknown actor "${aid}"`);
    }
  }
}

// Validate contradiction actor refs
for (const c of contradictions) {
  if (!actorIds.has(c.actor)) {
    console.warn(`  ⚠ contradiction "${c.id}" references unknown actor "${c.actor}"`);
  }
  if (c.counterparty && !actorIds.has(c.counterparty)) {
    console.warn(`  ⚠ contradiction "${c.id}" references unknown counterparty "${c.counterparty}"`);
  }
}

// Validate statement actor refs
for (const s of statements) {
  if (!actorIds.has(s.actor_id)) {
    console.warn(`  ⚠ statement "${s.id}" references unknown actor "${s.actor_id}"`);
  }
}

console.log('   ✓ All references valid (warnings are non-fatal)');

// ─── Stage 3: INDEX ─────────────────────────────────────────────────────

console.log('\n📇 Building indexes...');

// Actor → evidence
const actorEvidence: Record<string, string[]> = {};
for (const e of evidence) {
  for (const aid of e.actors) {
    if (!actorEvidence[aid]) actorEvidence[aid] = [];
    actorEvidence[aid].push(e.id);
  }
}

// Actor → contradictions
const actorContradictions: Record<string, string[]> = {};
for (const c of contradictions) {
  if (!actorContradictions[c.actor]) actorContradictions[c.actor] = [];
  actorContradictions[c.actor].push(c.id);
  if (c.counterparty) {
    if (!actorContradictions[c.counterparty]) actorContradictions[c.counterparty] = [];
    actorContradictions[c.counterparty].push(c.id);
  }
}

// Actor → statements
const actorStatements: Record<string, string[]> = {};
for (const s of statements) {
  if (!actorStatements[s.actor_id]) actorStatements[s.actor_id] = [];
  actorStatements[s.actor_id].push(s.id);
}

// Actor → themes (from evidence + contradictions + statements)
const actorThemes: Record<string, Set<string>> = {};
for (const e of evidence) {
  for (const aid of e.actors) {
    if (!actorThemes[aid]) actorThemes[aid] = new Set();
    e.themes.forEach((t) => actorThemes[aid].add(t));
  }
}

// Theme → actors
const themeActors: Record<string, Map<string, number>> = {};
for (const e of evidence) {
  for (const tid of e.themes) {
    if (!themeActors[tid]) themeActors[tid] = new Map();
    for (const aid of e.actors) {
      themeActors[tid].set(aid, (themeActors[tid].get(aid) || 0) + 1);
    }
  }
}

// Theme → evidence
const themeEvidence: Record<string, string[]> = {};
for (const e of evidence) {
  for (const tid of e.themes) {
    if (!themeEvidence[tid]) themeEvidence[tid] = [];
    themeEvidence[tid].push(e.id);
  }
}

// Theme → contradictions
const themeContradictions: Record<string, string[]> = {};
for (const c of contradictions) {
  for (const tid of c.themes) {
    if (!themeContradictions[tid]) themeContradictions[tid] = [];
    themeContradictions[tid].push(c.id);
  }
}

// Theme → statements
const themeStatements: Record<string, string[]> = {};
for (const s of statements) {
  for (const tid of s.themes) {
    if (!themeStatements[tid]) themeStatements[tid] = [];
    themeStatements[tid].push(s.id);
  }
}

// Document → evidence
const docEvidence: Record<string, string[]> = {};
for (const e of evidence) {
  if (!docEvidence[e.doc_id]) docEvidence[e.doc_id] = [];
  docEvidence[e.doc_id].push(e.id);
}

// Contradiction graph: actor → counterparty → contradiction IDs
const contradictionGraph: Record<string, Record<string, string[]>> = {};
for (const c of contradictions) {
  if (!c.counterparty) continue;
  if (!contradictionGraph[c.actor]) contradictionGraph[c.actor] = {};
  if (!contradictionGraph[c.actor][c.counterparty]) contradictionGraph[c.actor][c.counterparty] = [];
  contradictionGraph[c.actor][c.counterparty].push(c.id);
  // Bidirectional
  if (!contradictionGraph[c.counterparty]) contradictionGraph[c.counterparty] = {};
  if (!contradictionGraph[c.counterparty][c.actor]) contradictionGraph[c.counterparty][c.actor] = [];
  contradictionGraph[c.counterparty][c.actor].push(c.id);
}

// Write indexes
writeGenerated('indexes/actor-evidence.json', actorEvidence);
writeGenerated('indexes/actor-contradictions.json', actorContradictions);
writeGenerated('indexes/actor-statements.json', actorStatements);
writeGenerated('indexes/actor-themes.json',
  Object.fromEntries(Object.entries(actorThemes).map(([k, v]) => [k, Array.from(v)])),
);
writeGenerated('indexes/theme-actors.json',
  Object.fromEntries(
    Object.entries(themeActors).map(([k, v]) => [k, Object.fromEntries(v)]),
  ),
);
writeGenerated('indexes/theme-evidence.json', themeEvidence);
writeGenerated('indexes/theme-contradictions.json', themeContradictions);
writeGenerated('indexes/theme-statements.json', themeStatements);
writeGenerated('indexes/doc-evidence.json', docEvidence);
writeGenerated('indexes/contradiction-graph.json', contradictionGraph);

console.log('   ✓ 10 index files written');

// ─── Stage 4: AGGREGATE ────────────────────────────────────────────────

console.log('\n📊 Computing aggregations...');

// Actor scores
const evidenceById = new Map(evidence.map((e) => [e.id, e]));
const contradictionById = new Map(contradictions.map((c) => [c.id, c]));
const statementById = new Map(statements.map((s) => [s.id, s]));

const actorScores = actors
  .filter((a) => actorIds.has(a.id))
  .map((a) => {
    const eCount = (actorEvidence[a.id] || []).length;
    const cCount = (actorContradictions[a.id] || []).length;
    return {
      id: a.id,
      name: a.name,
      evidenceCount: eCount,
      contradictionCount: cCount,
      contradictionRate: eCount > 0 ? Math.round((cCount / eCount) * 100) / 100 : 0,
      themeBreadth: (actorThemes[a.id]?.size || 0),
      party: a.party,
    };
  })
  .sort((a, b) => b.contradictionCount - a.contradictionCount);

writeGenerated('aggregations/actor-scores.json', actorScores);

// Theme coverage: actor × theme matrix
const themeCoverage = themes.map((t) => ({
  themeId: t.id,
  themeName: t.name,
  actors: Array.from(themeActors[t.id]?.entries() || [])
    .map(([aid, count]) => {
      const actor = actors.find((a) => a.id === aid);
      return { id: aid, name: actor?.name || aid, count, party: actor?.party || null };
    })
    .sort((a, b) => b.count - a.count),
}));

writeGenerated('aggregations/theme-coverage.json', themeCoverage);

// Temporal breakdown — evidence and statements by month
const temporalMap = new Map<string, { evidenceCount: number; statementCount: number }>();

function extractMonth(dateStr: string): string | null {
  // Handle various date formats
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`;

  const monthNames: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  const textMatch = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d+,?\s+(\d{4})/);
  if (textMatch) return `${textMatch[2]}-${monthNames[textMatch[1]]}`;
  return null;
}

for (const e of evidence) {
  for (const d of e.dates) {
    const month = extractMonth(d);
    if (!month) continue;
    const bucket = temporalMap.get(month) || { evidenceCount: 0, statementCount: 0 };
    bucket.evidenceCount++;
    temporalMap.set(month, bucket);
  }
}

for (const s of statements) {
  const month = extractMonth(s.date);
  if (!month) continue;
  const bucket = temporalMap.get(month) || { evidenceCount: 0, statementCount: 0 };
  bucket.statementCount++;
  temporalMap.set(month, bucket);
}

const temporalBreakdown = Array.from(temporalMap.entries())
  .map(([month, data]) => ({ month, ...data }))
  .sort((a, b) => a.month.localeCompare(b.month));

writeGenerated('aggregations/temporal-breakdown.json', temporalBreakdown);

// Dashboard
const highSeverity = contradictions.filter((c) => c.severity === 'high');
const topContradictions = highSeverity.slice(0, 5);
const mostContradictoryActors = actorScores
  .filter((a) => a.contradictionCount > 0)
  .slice(0, 10);

// Compute theme distribution from evidence counts
const themeDistribution = themes
  .map((t) => ({
    id: t.id,
    name: t.name,
    count: (themeEvidence[t.id] || []).length,
  }))
  .sort((a, b) => b.count - a.count);

// Also include themes referenced by evidence that aren't in themes.json
const extraThemeIds = new Set<string>();
for (const e of evidence) {
  for (const tid of e.themes) {
    if (!themeIds.has(tid) && !themeDistribution.some((td) => td.id === tid)) {
      extraThemeIds.add(tid);
    }
  }
}
for (const tid of extraThemeIds) {
  const count = (themeEvidence[tid] || []).length;
  if (count > 0) {
    themeDistribution.push({
      id: tid,
      name: toTitleCase(tid),
      count,
    });
  }
}
themeDistribution.sort((a, b) => b.count - a.count);

// Party summary computed from actors
const partyMap = new Map<string, { actorCount: number; evidenceCount: number }>();
for (const a of actors) {
  const party = a.party || 'Unknown';
  const entry = partyMap.get(party) || { actorCount: 0, evidenceCount: 0 };
  entry.actorCount++;
  entry.evidenceCount += (actorEvidence[a.id] || []).length;
  partyMap.set(party, entry);
}
const partySummary = Array.from(partyMap.entries())
  .map(([party, data]) => ({ party, ...data }))
  .sort((a, b) => b.evidenceCount - a.evidenceCount);

const dashboardData = {
  manifest: {
    project: 'Apatheia Political Rhetoric Observatory',
    description: 'Interactive dashboard built from the analytical archive on political rhetoric around the 2026 Iran war debate.',
    documentCount: documents.length,
    evidenceCount: evidence.length,
    actorCount: actors.length,
    themeCount: themes.length,
    contradictionCount: contradictions.length,
    highSeverityCount: highSeverity.length,
  },
  topInsights: [
    {
      title: 'The archive is multi-layered, not single-track',
      detail: 'The source set blends core anti-war arguments, internal party splits, actor-specific escalation, and counter-arguments built around omissions, irony, and historical comparison.',
    },
    {
      title: `${mostContradictoryActors[0]?.name || 'Top actor'} leads in contradictions`,
      detail: `${mostContradictoryActors[0]?.contradictionCount || 0} tracked contradictions across ${mostContradictoryActors[0]?.themeBreadth || 0} themes.`,
      related: mostContradictoryActors[0] ? [{ type: 'actor', id: mostContradictoryActors[0].id, label: mostContradictoryActors[0].name }] : [],
    },
    {
      title: 'Omission analysis is the largest expansion vector',
      detail: 'The omission files widen the frame from constitutional process into nuclear capability, proxy violence, human rights, cyber risk, hostage-taking, and narcotics trafficking.',
    },
  ],
  timeline: timeline,
  themeDistribution,
  partySummary,
  topContradictions: topContradictions.map(enrichContradiction),
  mostContradictoryActors,
  rhetoricTrends: temporalBreakdown,
};

writeGenerated('pages/dashboard.json', dashboardData);

console.log('   ✓ actor-scores, theme-coverage, temporal-breakdown, dashboard');

// ─── Stage 5: SLICE ────────────────────────────────────────────────────

// Helper: enrich contradiction with display names
function enrichContradiction(c: Contradiction) {
  return {
    ...c,
    actor_name: actorNameMap.get(c.actor) || c.actor,
    counterparty_name: c.counterparty ? (actorNameMap.get(c.counterparty) || c.counterparty) : null,
    theme_names: c.themes.map((tid) => themeNameMap.get(tid) || toTitleCase(tid)),
  };
}

// Helper: enrich statement with display name
function enrichStatement(s: Statement) {
  return {
    ...s,
    actor: actorNameMap.get(s.actor_id) || s.actor_id,
  };
}

// Helper: enrich evidence with display names
function enrichEvidence(e: Evidence) {
  return {
    ...e,
    doc_title: e.doc_title || docTitleMap.get(e.doc_id) || e.doc_id,
    actor_names: e.actors.map((aid) => actorNameMap.get(aid) || aid),
    theme_names: e.themes.map((tid) => themeNameMap.get(tid) || toTitleCase(tid)),
  };
}

console.log('\n✂️  Generating per-page slices...');

// Per-actor pages
for (const actor of actors) {
  const actorEvidenceItems = (actorEvidence[actor.id] || [])
    .map((eid) => evidenceById.get(eid))
    .filter(Boolean) as Evidence[];

  const actorContradictionItems = (actorContradictions[actor.id] || [])
    .map((cid) => contradictionById.get(cid))
    .filter(Boolean) as Contradiction[];

  const actorStatementItems = (actorStatements[actor.id] || [])
    .map((sid) => statementById.get(sid))
    .filter(Boolean) as Statement[];

  // Find related actors by shared themes and contradictions
  const relatedScores = new Map<string, { sharedThemes: number; sharedContradictions: number }>();
  const myThemes = actorThemes[actor.id] || new Set();

  for (const otherActor of actors) {
    if (otherActor.id === actor.id) continue;
    const otherThemes = actorThemes[otherActor.id] || new Set();
    let sharedThemes = 0;
    for (const t of myThemes) {
      if (otherThemes.has(t)) sharedThemes++;
    }
    const sharedContradictions = actorContradictionItems.filter(
      (c) => c.actor === otherActor.id || c.counterparty === otherActor.id,
    ).length;

    if (sharedThemes > 0 || sharedContradictions > 0) {
      relatedScores.set(otherActor.id, { sharedThemes, sharedContradictions });
    }
  }

  const relatedActors = Array.from(relatedScores.entries())
    .map(([id, scores]) => ({
      id,
      name: actors.find((a) => a.id === id)?.name || id,
      ...scores,
    }))
    .sort((a, b) => (b.sharedContradictions * 10 + b.sharedThemes) - (a.sharedContradictions * 10 + a.sharedThemes))
    .slice(0, 5);

  const contradictionNetwork = contradictionGraph[actor.id] || {};

  // Compute evidence_count for the profile
  const enrichedProfile = {
    ...actor,
    evidence_count: actorEvidenceItems.length,
    quote_count: actorStatementItems.length,
    dominant_theme_names: actor.dominant_themes.map((tid: string) => themeNameMap.get(tid) || toTitleCase(tid)),
  };

  writeGenerated(`pages/actor/${actor.id}.json`, {
    profile: enrichedProfile,
    evidence: actorEvidenceItems.map(enrichEvidence),
    contradictions: actorContradictionItems.map(enrichContradiction),
    statements: actorStatementItems.map(enrichStatement),
    relatedActors,
    contradictionNetwork,
  });
}

console.log(`   ✓ ${actors.length} actor page slices`);

// Per-theme pages
for (const theme of themes) {
  const tEvidence = (themeEvidence[theme.id] || [])
    .map((eid) => evidenceById.get(eid))
    .filter(Boolean) as Evidence[];

  const tContradictions = (themeContradictions[theme.id] || [])
    .map((cid) => contradictionById.get(cid))
    .filter(Boolean) as Contradiction[];

  const tStatements = (themeStatements[theme.id] || [])
    .map((sid) => statementById.get(sid))
    .filter(Boolean) as Statement[];

  const tActors = Array.from(themeActors[theme.id]?.entries() || [])
    .map(([aid, count]) => ({
      id: aid,
      name: actors.find((a) => a.id === aid)?.name || aid,
      evidenceCount: count,
    }))
    .sort((a, b) => b.evidenceCount - a.evidenceCount);

  // Related themes by co-occurrence in evidence
  const coOccurrence = new Map<string, number>();
  for (const e of tEvidence) {
    for (const tid of e.themes) {
      if (tid === theme.id) continue;
      coOccurrence.set(tid, (coOccurrence.get(tid) || 0) + 1);
    }
  }

  const relatedThemes = Array.from(coOccurrence.entries())
    .map(([id, overlap]) => {
      const t = themes.find((th) => th.id === id);
      return {
        id,
        name: t?.name || toTitleCase(id),
        overlap,
      };
    })
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5);

  writeGenerated(`pages/theme/${theme.id}.json`, {
    theme,
    evidence: tEvidence.map(enrichEvidence),
    actors: tActors,
    contradictions: tContradictions.map(enrichContradiction),
    statements: tStatements.map(enrichStatement),
    relatedThemes,
  });
}

console.log(`   ✓ ${themes.length} theme page slices`);

// Evidence facets
const kindCounts = new Map<string, number>();
const themeFacetCounts = new Map<string, number>();
const actorFacetCounts = new Map<string, number>();

for (const e of evidence) {
  kindCounts.set(e.kind, (kindCounts.get(e.kind) || 0) + 1);
  for (const tid of e.themes) {
    themeFacetCounts.set(tid, (themeFacetCounts.get(tid) || 0) + 1);
  }
  for (const aid of e.actors) {
    actorFacetCounts.set(aid, (actorFacetCounts.get(aid) || 0) + 1);
  }
}

const evidenceFacets = {
  themes: Array.from(themeFacetCounts.entries())
    .map(([id, count]) => {
      const t = themes.find((th) => th.id === id);
      return {
        id,
        name: t?.name || toTitleCase(id),
        count,
      };
    })
    .sort((a, b) => b.count - a.count),
  kinds: Array.from(kindCounts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count),
  actors: Array.from(actorFacetCounts.entries())
    .map(([id, count]) => ({
      id,
      name: actors.find((a) => a.id === id)?.name || id,
      count,
    }))
    .sort((a, b) => b.count - a.count),
};

writeGenerated('pages/evidence-facets.json', evidenceFacets);

console.log('   ✓ evidence-facets');

// Enriched full lists (for list pages — avoids runtime enrichment)
writeGenerated('lists/evidence.json', evidence.map(enrichEvidence));
writeGenerated('lists/contradictions.json', contradictions.map(enrichContradiction));
writeGenerated('lists/statements.json', statements.map(enrichStatement));

// Profiles with computed counts and display names
const enrichedProfiles = actors.map((a) => ({
  ...a,
  evidence_count: (actorEvidence[a.id] || []).length,
  quote_count: (actorStatements[a.id] || []).length,
  dominant_theme_names: a.dominant_themes.map((tid: string) => themeNameMap.get(tid) || toTitleCase(tid)),
}));
writeGenerated('lists/profiles.json', enrichedProfiles);

// Themes with evidence counts
const enrichedThemes = themes.map((t) => ({
  ...t,
  evidence_count: (themeEvidence[t.id] || []).length,
}));
writeGenerated('lists/themes.json', enrichedThemes);

console.log('   ✓ 5 enriched list files');

// ─── Stage 6: SEARCH CATALOG ───────────────────────────────────────────

console.log('\n🔎 Building search index...');

interface SearchDoc {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
  searchable: string;
}

const searchDocs: SearchDoc[] = [];

// Actors
for (const a of actors) {
  searchDocs.push({
    id: a.id,
    type: 'actor',
    title: a.name,
    subtitle: [a.type, a.party, a.role].filter(Boolean).join(' · '),
    href: `/actors/${a.id}`,
    searchable: [a.name, a.type, a.party, a.role, a.positioning, ...a.tags].filter(Boolean).join(' ').toLowerCase(),
  });
}

// Themes
for (const t of themes) {
  searchDocs.push({
    id: t.id,
    type: 'theme',
    title: t.name,
    subtitle: `${(themeEvidence[t.id] || []).length} evidence items`,
    href: `/themes/${t.id}`,
    searchable: [t.name, t.description].join(' ').toLowerCase(),
  });
}

// Explainers
for (const e of explainers) {
  searchDocs.push({
    id: e.id,
    type: 'explainer',
    title: e.term,
    subtitle: e.category,
    href: `/explainers#${e.id}`,
    searchable: [e.term, ...e.also_known_as, e.category, e.definition.slice(0, 100)].join(' ').toLowerCase(),
  });
}

// Contradictions
for (const c of contradictions) {
  const actorName = actors.find((a) => a.id === c.actor)?.name || c.actor;
  const counterName = c.counterparty ? actors.find((a) => a.id === c.counterparty)?.name || c.counterparty : '';
  searchDocs.push({
    id: c.id,
    type: 'contradiction',
    title: c.title,
    subtitle: [actorName, counterName].filter(Boolean).join(' vs '),
    href: `/contradictions#${c.id}`,
    searchable: [c.title, c.summary, actorName, counterName].join(' ').toLowerCase(),
  });
}

// Documents
for (const d of documents) {
  searchDocs.push({
    id: d.id,
    type: 'document',
    title: d.title,
    subtitle: d.type,
    href: `/sources#${d.id}`,
    searchable: [d.title, d.label, d.type].join(' ').toLowerCase(),
  });
}

// Framing
for (const f of framing) {
  searchDocs.push({
    id: f.id,
    type: 'framing',
    title: f.title,
    subtitle: f.category,
    href: `/framing#${f.id}`,
    searchable: [f.title, f.summary, f.category].join(' ').toLowerCase(),
  });
}

writeGenerated('search/search-index.json', searchDocs);

console.log(`   ✓ ${searchDocs.length} search documents`);

// ─── Stage 7: WRITE SUMMARY ────────────────────────────────────────────

console.log('\n✅ Build complete!');

// Count output files
function countFiles(dir: string): number {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
    else count++;
  }
  return count;
}

const totalFiles = countFiles(OUT);
console.log(`   ${totalFiles} files written to data/generated/`);
