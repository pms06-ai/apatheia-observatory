// ─── Re-export source and generated types ───────────────────────────────
export * from './source';
export * from './generated';

// ─── Backward-compatible aliases ────────────────────────────────────────
// These map old type names to the new source types so existing components
// continue to compile without changes.

import type { SourceActor, SourceActorPhase, SourceEvidence, SourceContradiction, SourceStatement, SourceDocument, SourceExplainer, SourceFramingAnalysis } from './source';

/** @deprecated Use SourceActor */
export type Profile = SourceActor & {
  evidence_count: number;
  quote_count: number;
  sample_excerpt?: string;
};

/** @deprecated Use SourceActorPhase */
export type ProfilePhase = SourceActorPhase;

/** @deprecated Use SourceContradiction */
export type Contradiction = SourceContradiction;

/** @deprecated Use SourceEvidence */
export type Evidence = SourceEvidence & {
  doc_title?: string;
};

/** @deprecated Use SourceDocument */
export type DocumentItem = SourceDocument;

/** @deprecated Use SourceStatement */
export type Statement = SourceStatement & {
  actor: string; // display name (kept for backward compat)
};

/** @deprecated Use SourceExplainer */
export type ExplainerEntry = SourceExplainer;

/** @deprecated Use SourceFramingAnalysis */
export type FramingAnalysis = SourceFramingAnalysis & {
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
};

// Legacy types that don't map 1:1 to source schemas
export interface ActorSummary {
  name: string;
  evidence_count: number;
  dominant_themes: string[];
  sample_excerpt: string;
}

export interface ThemeItem {
  id?: string;
  name: string;
  evidence_count: number;
  examples?: string[];
  description?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  detail: string;
  focus: string[] | { actor?: string; theme?: string }[];
}

export interface DashboardData {
  manifest: {
    project: string;
    description: string;
    document_count: number;
    evidence_count: number;
    actor_count: number;
    theme_count: number;
  };
  top_insights: { title: string; detail: string }[];
  timeline: TimelineEvent[];
}

export interface PartyData {
  party: string;
  actor_count?: number;
  actors?: number;
  evidence_count?: number;
  evidence?: number;
}

export interface FilterState {
  search: string;
  theme: string;
  kind: string;
}
