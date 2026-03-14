// ─── Source JSON schemas (canonical files in /data/source/) ──────────────

export type ActorType = 'politician' | 'journalist' | 'outlet';
export type PartyAffiliation = 'Democrat' | 'Republican' | 'Independent' | 'Foreign government';
export type EvidenceKind = 'quote' | 'claim' | 'excerpt' | 'section';
export type ContradictionType = 'Cross-actor contradiction' | 'Temporal contradiction' | 'Internal tension' | 'Cross-time contradiction';
export type Severity = 'high' | 'medium' | 'low';
export type ExplainerCategory =
  | 'legal'
  | 'military'
  | 'nuclear'
  | 'iranian'
  | 'media'
  | 'geopolitical'
  | 'fallacies'
  | 'strategy';

// ─── actors.json ────────────────────────────────────────────────────────

export interface SourceActor {
  id: string;
  name: string;
  type: ActorType;
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
  dominant_themes: string[]; // theme IDs
  phases: SourceActorPhase[];
  linked_contradictions: string[]; // contradiction IDs
  tags: string[];
  outlet: string | null;
  bloc?: string;
}

export interface SourceActorPhase {
  date: string;
  label: string;
  stance: string;
  detail: string;
}

// ─── evidence.json ──────────────────────────────────────────────────────

export interface SourceEvidence {
  id: string;
  doc_id: string;
  kind: EvidenceKind;
  title: string;
  text: string;
  actors: string[]; // actor IDs
  themes: string[]; // theme IDs
  dates: string[];
}

// ─── contradictions.json ────────────────────────────────────────────────

export interface SourceContradiction {
  id: string;
  title: string;
  actor: string; // actor ID
  counterparty: string | null; // actor ID
  type: string;
  severity: Severity;
  date_range: string;
  summary: string;
  tension: string;
  themes: string[]; // theme IDs
  related_documents: string[]; // document IDs
}

// ─── statements.json ────────────────────────────────────────────────────

export interface SourceStatement {
  id: string;
  actor_id: string; // actor ID
  date: string;
  context: string;
  text: string;
  source: string;
  source_url: string | null;
  type: 'official_statement' | 'public_sentiment' | 'historical_record';
  themes: string[]; // theme IDs
  stance: string;
  verified: boolean;
  significance: string;
  media_reception: string;
}

// ─── documents.json ─────────────────────────────────────────────────────

export interface SourceDocument {
  id: string;
  file: string;
  label: string;
  type: string;
  title: string;
  word_count: number;
  section_count: number;
  quote_count: number;
  table_line_count: number;
  themes: string[]; // theme IDs
  actors: string[]; // actor IDs
  dates: string[];
}

// ─── themes.json ────────────────────────────────────────────────────────

export interface SourceTheme {
  id: string;
  name: string;
  description: string;
}

// ─── framing-analysis.json ──────────────────────────────────────────────

export interface SourceFramingAnalysis {
  id: string;
  title: string;
  category: string;
  severity: string;
  date: string;
  summary: string;
  analysis?: string;
  actor_ids: string[]; // actor IDs
  themes: string[]; // theme IDs
  [key: string]: unknown;
}

// ─── explainers.json ────────────────────────────────────────────────────

export interface SourceExplainer {
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

// ─── timeline.json ──────────────────────────────────────────────────────

export interface SourceTimelineEvent {
  date: string;
  title: string;
  detail: string;
  focus: string[]; // mixed actor IDs and theme IDs
}
