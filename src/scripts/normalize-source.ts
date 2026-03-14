/**
 * normalize-source.ts
 *
 * One-time migration: reads legacy flat JSON files from /data/,
 * normalizes references to use IDs instead of display names,
 * and writes canonical files to /data/source/.
 *
 * Run: npx tsx src/scripts/normalize-source.ts
 */

import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(), 'data');
const OUT = path.join(DATA, 'source');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf-8')) as T;
}

function writeSource(file: string, data: unknown) {
  fs.writeFileSync(
    path.join(OUT, file),
    JSON.stringify(data, null, 2) + '\n',
    'utf-8',
  );
  console.log(`  ✓ ${file} (${Array.isArray(data) ? data.length + ' items' : 'object'})`);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Load legacy data ───────────────────────────────────────────────────

interface LegacyProfile {
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
  evidence_count: number;
  quote_count: number;
  phases: Array<{ date: string; label: string; stance: string; detail: string }>;
  linked_contradictions: string[];
  tags: string[];
  outlet: string | null;
  bloc?: string;
  sample_excerpt?: string;
}

interface LegacyEvidence {
  id?: string;
  doc_id: string;
  doc_title: string;
  kind: string;
  title: string;
  text: string;
  actors: string[];
  themes: string[];
  dates: string[];
}

interface LegacyContradiction {
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

interface LegacyStatement {
  id: string;
  actor: string;
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

interface LegacyDocument {
  id: string;
  file: string;
  label: string;
  type: string;
  scope?: string;
  title: string;
  word_count: number;
  section_count: number;
  quote_count: number;
  table_line_count: number;
  themes: string[];
  actors: string[];
  dates: string[];
}

interface LegacyTheme {
  name: string;
  evidence_count: number;
  examples: string[];
}

interface LegacyFraming {
  id: string;
  title: string;
  category: string;
  severity: string;
  date: string;
  summary: string;
  themes: string[];
  actors_amplifying?: string[];
  actors_providing_context?: string[];
  who_demands_it?: string[];
  who_explains_it?: string[];
  [key: string]: unknown;
}

interface LegacyTimeline {
  date: string;
  title: string;
  detail: string;
  focus: string[];
}

interface LegacyExplainer {
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

console.log('Loading legacy data...');

const allProfiles = readJson<LegacyProfile[]>('all-profiles.json');
const evidence = readJson<LegacyEvidence[]>('evidence.json');
const contradictions = readJson<LegacyContradiction[]>('contradictions.json');
const statements = readJson<LegacyStatement[]>('statements.json');
const documents = readJson<LegacyDocument[]>('documents.json');
const themes = readJson<LegacyTheme[]>('themes.json');
const framing = readJson<LegacyFraming[]>('framing-analysis.json');
const timeline = readJson<LegacyTimeline[]>('timeline.json');
const explainers = readJson<LegacyExplainer[]>('explainers.json');

// ─── Build lookup maps ──────────────────────────────────────────────────

// Actor name → ID map
const actorNameToId = new Map<string, string>();
for (const p of allProfiles) {
  actorNameToId.set(p.name.toLowerCase(), p.id);
  // Also index by ID in case some refs already use IDs
  actorNameToId.set(p.id.toLowerCase(), p.id);
}

// Theme name → ID map
const themeNameToId = new Map<string, string>();
for (const t of themes) {
  const id = slugify(t.name);
  themeNameToId.set(t.name.toLowerCase(), id);
  themeNameToId.set(id, id);
}

function resolveActorId(nameOrId: string): string {
  const lower = nameOrId.toLowerCase();
  const found = actorNameToId.get(lower);
  if (found) return found;
  // Fallback: slugify the name
  const slug = slugify(nameOrId);
  if (actorNameToId.has(slug)) return actorNameToId.get(slug)!;
  console.warn(`  ⚠ Unknown actor: "${nameOrId}" → using slug "${slug}"`);
  return slug;
}

function resolveThemeId(nameOrId: string): string {
  const lower = nameOrId.toLowerCase();
  const found = themeNameToId.get(lower);
  if (found) return found;
  const slug = slugify(nameOrId);
  if (themeNameToId.has(slug)) return themeNameToId.get(slug)!;
  console.warn(`  ⚠ Unknown theme: "${nameOrId}" → using slug "${slug}"`);
  return slug;
}

// ─── Normalize actors ───────────────────────────────────────────────────

console.log('\nNormalizing actors...');
const normalizedActors = allProfiles.map((p) => ({
  id: p.id,
  name: p.name,
  type: p.type,
  party: p.party,
  role: p.role,
  state: p.state,
  chamber: p.chamber,
  bio: p.bio,
  summary: p.summary,
  positioning: p.positioning,
  photo_url: p.photo_url,
  stance_on_iran: p.stance_on_iran,
  key_committees: p.key_committees || [],
  signals: p.signals || [],
  watchpoints: p.watchpoints || [],
  bias_rating: p.bias_rating ?? 0,
  reliability_score: p.reliability_score ?? 0,
  dominant_themes: (p.dominant_themes || []).map(resolveThemeId),
  phases: p.phases || [],
  linked_contradictions: p.linked_contradictions || [],
  tags: p.tags || [],
  outlet: p.outlet,
  ...(p.bloc ? { bloc: p.bloc } : {}),
}));

writeSource('actors.json', normalizedActors);

// ─── Normalize themes ───────────────────────────────────────────────────

console.log('Normalizing themes...');

// Start with canonical themes
const normalizedThemes: Array<{ id: string; name: string; description: string }> = themes.map((t) => ({
  id: slugify(t.name),
  name: t.name,
  description: t.examples?.[0]?.slice(0, 200) || '',
}));

// Collect ALL referenced theme names/IDs from profiles, evidence, contradictions, statements
const canonicalThemeIds = new Set(normalizedThemes.map((t) => t.id));
const extraThemeNames = new Set<string>();

for (const p of allProfiles) {
  for (const t of p.dominant_themes || []) {
    const id = resolveThemeId(t);
    if (!canonicalThemeIds.has(id)) extraThemeNames.add(t);
  }
}
for (const e of evidence) {
  for (const t of e.themes) {
    const id = resolveThemeId(t);
    if (!canonicalThemeIds.has(id)) extraThemeNames.add(t);
  }
}
for (const s of statements) {
  for (const t of s.themes) {
    const id = resolveThemeId(t);
    if (!canonicalThemeIds.has(id)) extraThemeNames.add(t);
  }
}

// Add extra themes with generated descriptions
for (const name of extraThemeNames) {
  const id = slugify(name);
  if (!canonicalThemeIds.has(id)) {
    normalizedThemes.push({ id, name, description: '' });
    canonicalThemeIds.add(id);
  }
}

console.log(`  ${themes.length} canonical + ${extraThemeNames.size} extended = ${normalizedThemes.length} total themes`);
writeSource('themes.json', normalizedThemes);

// ─── Normalize evidence ─────────────────────────────────────────────────

console.log('Normalizing evidence...');
let evidenceCounter = 0;
const normalizedEvidence = evidence.map((e) => {
  evidenceCounter++;
  return {
    id: e.id || `ev-${String(evidenceCounter).padStart(4, '0')}`,
    doc_id: e.doc_id,
    doc_title: e.doc_title, // Keep for UI display
    kind: e.kind,
    title: e.title,
    text: e.text,
    actors: e.actors.map(resolveActorId),
    themes: e.themes.map(resolveThemeId),
    dates: e.dates || [],
  };
});

writeSource('evidence.json', normalizedEvidence);

// ─── Normalize contradictions ───────────────────────────────────────────

console.log('Normalizing contradictions...');
const normalizedContradictions = contradictions.map((c) => ({
  id: c.id,
  title: c.title,
  actor: resolveActorId(c.actor),
  counterparty: c.counterparty ? resolveActorId(c.counterparty) : null,
  type: c.type,
  severity: c.severity,
  date_range: c.date_range,
  summary: c.summary,
  tension: c.tension,
  themes: c.themes.map(resolveThemeId),
  related_documents: c.related_documents || [],
}));

writeSource('contradictions.json', normalizedContradictions);

// ─── Normalize statements ───────────────────────────────────────────────

console.log('Normalizing statements...');
const normalizedStatements = statements.map((s) => ({
  id: s.id,
  actor_id: s.actor_id || resolveActorId(s.actor),
  date: s.date,
  context: s.context,
  text: s.text,
  source: s.source,
  source_url: s.source_url,
  type: s.type,
  themes: s.themes.map(resolveThemeId),
  stance: s.stance,
  verified: s.verified,
  significance: s.significance,
  media_reception: s.media_reception,
}));

writeSource('statements.json', normalizedStatements);

// ─── Normalize documents ────────────────────────────────────────────────

console.log('Normalizing documents...');
const normalizedDocuments = documents.map((d) => ({
  id: d.id,
  file: d.file,
  label: d.label,
  type: d.type,
  title: d.title,
  word_count: d.word_count,
  section_count: d.section_count,
  quote_count: d.quote_count,
  table_line_count: d.table_line_count,
  themes: d.themes.map(resolveThemeId),
  actors: d.actors.map(resolveActorId),
  dates: d.dates || [],
}));

writeSource('documents.json', normalizedDocuments);

// ─── Normalize framing analysis ─────────────────────────────────────────

console.log('Normalizing framing analysis...');
const normalizedFraming = framing.map((f) => {
  // Collect all actor names from various fields
  const actorNames = new Set<string>();
  for (const name of f.actors_amplifying || []) actorNames.add(name);
  for (const name of f.actors_providing_context || []) actorNames.add(name);
  if (Array.isArray(f.who_demands_it)) {
    for (const name of f.who_demands_it) actorNames.add(name);
  }
  if (Array.isArray(f.who_explains_it)) {
    for (const name of f.who_explains_it) actorNames.add(name);
  }

  // Keep all original fields but add actor_ids and normalize themes
  const { themes: fThemes, ...rest } = f;
  return {
    ...rest,
    actor_ids: Array.from(actorNames).map(resolveActorId),
    themes: fThemes.map(resolveThemeId),
  };
});

writeSource('framing-analysis.json', normalizedFraming);

// ─── Copy explainers (no structural change) ─────────────────────────────

console.log('Copying explainers...');
writeSource('explainers.json', explainers);

// ─── Normalize timeline ─────────────────────────────────────────────────

console.log('Normalizing timeline...');
// Focus is a flat string array with mixed actor names and theme names.
// We keep it as-is since the pipeline can resolve at build time.
const normalizedTimeline = timeline.map((t) => ({
  date: t.date,
  title: t.title,
  detail: t.detail,
  focus: t.focus.map((f) => {
    // Try actor first, then theme
    const actorId = actorNameToId.get(f.toLowerCase());
    if (actorId) return actorId;
    const themeId = themeNameToId.get(f.toLowerCase());
    if (themeId) return themeId;
    return slugify(f);
  }),
}));

writeSource('timeline.json', normalizedTimeline);

// ─── Summary ────────────────────────────────────────────────────────────

console.log('\n✅ Normalization complete!');
console.log(`   ${normalizedActors.length} actors`);
console.log(`   ${normalizedThemes.length} themes`);
console.log(`   ${normalizedEvidence.length} evidence items`);
console.log(`   ${normalizedContradictions.length} contradictions`);
console.log(`   ${normalizedStatements.length} statements`);
console.log(`   ${normalizedDocuments.length} documents`);
console.log(`   ${normalizedFraming.length} framing analyses`);
console.log(`   ${explainers.length} explainers`);
console.log(`   ${normalizedTimeline.length} timeline events`);
