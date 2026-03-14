// ─── Core Domain Types (matching JSON shapes) ──────────────────────────

export type ActorType = 'politician' | 'journalist' | 'outlet';
export type PartyAffiliation = 'Democrat' | 'Republican' | 'Independent' | 'Foreign government';
export type EvidenceKind = 'quote' | 'claim' | 'excerpt' | 'section';
export type ContradictionType = 'Cross-actor contradiction' | 'Temporal contradiction' | 'Internal tension';
export type Severity = 'high' | 'medium' | 'low';

// Actors from actors.json (legacy slim format)
export interface ActorSummary {
  name: string;
  evidence_count: number;
  dominant_themes: string[];
  sample_excerpt: string;
}

// Full profile from all-profiles.json
export interface Profile {
  id: string;
  name: string;
  type: 'politician' | 'outlet' | 'journalist';
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
  phases: ProfilePhase[];
  linked_contradictions: string[];
  tags: string[];
  outlet: string | null;
  // Legacy fields from profiles.json
  bloc?: string;
  sample_excerpt?: string;
}

export interface ProfilePhase {
  date: string;
  label: string;
  stance: string;
  detail: string;
}

export interface Contradiction {
  id: string;
  title: string;
  actor: string;
  counterparty: string | null;
  type: string;
  severity: Severity;
  date_range: string;
  summary: string;
  tension: string;
  themes: string[];
  related_documents: string[];
}

export interface Evidence {
  id?: string;
  doc_id: string;
  doc_title: string;
  kind: EvidenceKind;
  title: string;
  text: string;
  actors: string[];
  themes: string[];
  dates: string[];
}

export interface ThemeItem {
  name: string;
  evidence_count: number;
  examples: string[];
}

export interface DocumentItem {
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

export interface TimelineEvent {
  date: string;
  title: string;
  detail: string;
  focus: { actor?: string; theme?: string }[];
}

export interface DashboardManifest {
  project: string;
  description: string;
  document_count: number;
  evidence_count: number;
  actor_count: number;
  theme_count: number;
}

export interface DashboardInsight {
  title: string;
  detail: string;
}

export interface DashboardData {
  manifest: DashboardManifest;
  top_insights: DashboardInsight[];
  timeline: TimelineEvent[];
}

export interface PartyData {
  party: string;
  actors: number;
  evidence: number;
}

export interface FilterState {
  search: string;
  theme: string;
  kind: string;
}

// ─── Statements ─────────────────────────────────────────────────────────

export interface Statement {
  id: string;
  actor: string;
  actor_id: string;
  date: string;
  context: string;
  text: string;
  source: string;
  source_url: string | null;
  type: 'official_statement' | 'public_sentiment' | 'historical_record';
  themes: string[];
  stance: string;
  verified: boolean;
  significance: string;
  media_reception: string;
}

// ─── Explainers ────────────────────────────────────────────────────────

export type ExplainerCategory =
  | 'legal'
  | 'military'
  | 'nuclear'
  | 'iranian'
  | 'media'
  | 'geopolitical'
  | 'fallacies'
  | 'strategy';

export interface ExplainerEntry {
  id: string;
  term: string;
  category: ExplainerCategory;
  also_known_as: string[];
  definition: string;
  how_it_works: string;
  why_it_matters: string;
  common_misconceptions: string[];
  in_context: string;
  related_terms: string[];
  sources: string[];
}

// ─── Framing Analysis ───────────────────────────────────────────────────

export interface FramingAnalysis {
  id: string;
  title: string;
  category: string;
  severity: string;
  date: string;
  summary: string;
  analysis?: string;
  amplified_story?: Record<string, unknown>;
  suppressed_story?: Record<string, unknown>;
  the_demand?: Record<string, unknown>;
  the_reality?: Record<string, unknown>;
  the_frame?: Record<string, unknown>;
  timeline?: Array<{ date: string; position: string; stance: string }>;
  the_contradiction?: string;
  media_accountability?: string;
  who_claims_moral_authority?: Array<{ actor: string; claim: string; what_they_ignore: string }>;
  the_real_moral_question?: string;
  event_coverage?: Array<Record<string, string>>;
  what_honest_coverage_looks_like?: string;
  themes: string[];
  [key: string]: unknown;
}
