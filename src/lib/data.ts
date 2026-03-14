import type {
  Profile,
  Contradiction,
  Evidence,
  ThemeItem,
  DocumentItem,
  TimelineEvent,
  Statement,
  FramingAnalysis,
  ExplainerEntry,
} from '@/types';
import type {
  ActorPageData,
  DashboardPageData,
  ThemePageData,
  EvidenceFacets,
  SearchDocument,
} from '@/types/generated';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// ─── Cached JSON reader ─────────────────────────────────────────────────
// During SSG, Next.js renders many pages in the same Node process.
// The cache eliminates redundant parses of the same file across pages.

const jsonCache = new Map<string, unknown>();

async function readJson<T>(filename: string): Promise<T> {
  if (jsonCache.has(filename)) {
    return jsonCache.get(filename) as T;
  }
  const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
  const parsed = JSON.parse(raw) as T;
  jsonCache.set(filename, parsed);
  return parsed;
}

// ─── Generated per-page slice loaders ───────────────────────────────────

export async function getActorPageData(slug: string): Promise<ActorPageData | null> {
  try {
    return await readJson<ActorPageData>(`generated/pages/actor/${slug}.json`);
  } catch {
    return null;
  }
}

export async function getDashboardPageData(): Promise<DashboardPageData> {
  return readJson<DashboardPageData>('generated/pages/dashboard.json');
}

export async function getThemePageData(slug: string): Promise<ThemePageData | null> {
  try {
    return await readJson<ThemePageData>(`generated/pages/theme/${slug}.json`);
  } catch {
    return null;
  }
}

export async function getEvidenceFacets(): Promise<EvidenceFacets> {
  return readJson<EvidenceFacets>('generated/pages/evidence-facets.json');
}

export async function getSearchIndex(): Promise<SearchDocument[]> {
  return readJson<SearchDocument[]>('generated/search/search-index.json');
}

// ─── Enriched list loaders (single file read, no runtime enrichment) ────

export async function getProfiles(): Promise<Profile[]> {
  return readJson<Profile[]>('generated/lists/profiles.json');
}

export async function getEvidence(): Promise<Evidence[]> {
  return readJson<Evidence[]>('generated/lists/evidence.json');
}

export async function getContradictions(): Promise<Contradiction[]> {
  return readJson<Contradiction[]>('generated/lists/contradictions.json');
}

export async function getStatements(): Promise<Statement[]> {
  return readJson<Statement[]>('generated/lists/statements.json');
}

export async function getThemes(): Promise<ThemeItem[]> {
  return readJson<ThemeItem[]>('generated/lists/themes.json');
}

// ─── Source data loaders (no enrichment needed) ─────────────────────────

export async function getDocuments(): Promise<DocumentItem[]> {
  return readJson<DocumentItem[]>('source/documents.json');
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  return readJson<TimelineEvent[]>('source/timeline.json');
}

export async function getFramingAnalysis(): Promise<FramingAnalysis[]> {
  return readJson<FramingAnalysis[]>('source/framing-analysis.json');
}

export async function getExplainers(): Promise<ExplainerEntry[]> {
  return readJson<ExplainerEntry[]>('source/explainers.json');
}

// ─── Re-exports ─────────────────────────────────────────────────────────

export { slugify } from './slugify';
