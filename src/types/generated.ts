// ─── Generated bundle types (output of build-data pipeline) ─────────────

import type {
  SourceActor,
  SourceEvidence,
  SourceContradiction,
  SourceStatement,
  SourceTheme,
} from './source';

// ─── Per-page bundles ───────────────────────────────────────────────────

export interface ActorPageData {
  profile: SourceActor;
  evidence: SourceEvidence[];
  contradictions: SourceContradiction[];
  statements: SourceStatement[];
  relatedActors: RelatedActor[];
  contradictionNetwork: Record<string, string[]>; // counterparty ID → contradiction IDs
}

export interface RelatedActor {
  id: string;
  name: string;
  sharedThemes: number;
  sharedContradictions: number;
}

export interface ThemePageData {
  theme: SourceTheme;
  evidence: SourceEvidence[];
  actors: ThemeActor[];
  contradictions: SourceContradiction[];
  statements: SourceStatement[];
  relatedThemes: RelatedTheme[];
}

export interface ThemeActor {
  id: string;
  name: string;
  evidenceCount: number;
}

export interface RelatedTheme {
  id: string;
  name: string;
  overlap: number; // co-occurrence count
}

export interface DashboardPageData {
  manifest: DashboardManifest;
  topInsights: DashboardInsight[];
  timeline: DashboardTimelineEvent[];
  themeDistribution: { id: string; name: string; count: number }[];
  partySummary: { party: string; actorCount: number; evidenceCount: number }[];
  topContradictions: SourceContradiction[];
  mostContradictoryActors: ActorScore[];
  rhetoricTrends: TemporalBucket[];
}

export interface DashboardManifest {
  project: string;
  description: string;
  documentCount: number;
  evidenceCount: number;
  actorCount: number;
  themeCount: number;
  contradictionCount: number;
  highSeverityCount: number;
}

export interface DashboardInsight {
  title: string;
  detail: string;
  related?: { type: string; id: string; label: string }[];
}

export interface DashboardTimelineEvent {
  date: string;
  title: string;
  detail: string;
  focus: string[];
}

// ─── Aggregations ───────────────────────────────────────────────────────

export interface ActorScore {
  id: string;
  name: string;
  evidenceCount: number;
  contradictionCount: number;
  contradictionRate: number; // contradictions / evidence
  themeBreadth: number; // unique theme count
  party: string | null;
}

export interface TemporalBucket {
  month: string; // YYYY-MM
  evidenceCount: number;
  statementCount: number;
}

export interface ThemeCoverage {
  themeId: string;
  themeName: string;
  actors: { id: string; name: string; count: number; party: string | null }[];
}

// ─── Facets ─────────────────────────────────────────────────────────────

export interface EvidenceFacets {
  themes: { id: string; name: string; count: number }[];
  kinds: { value: string; count: number }[];
  actors: { id: string; name: string; count: number }[];
}

// ─── Search ─────────────────────────────────────────────────────────────

export interface SearchDocument {
  id: string;
  type: 'actor' | 'theme' | 'evidence' | 'contradiction' | 'explainer' | 'document' | 'framing';
  title: string;
  subtitle: string;
  href: string;
  searchable: string; // lowercased concatenation of searchable fields
}
