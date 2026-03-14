import type {
  ActorSummary,
  Profile,
  Contradiction,
  Evidence,
  ThemeItem,
  DocumentItem,
  TimelineEvent,
  DashboardData,
  PartyData,
  Statement,
  FramingAnalysis,
  ExplainerEntry,
} from '@/types';
import fs from 'fs/promises';
import path from 'path';
import { slugify } from './slugify';

const DATA_DIR = path.join(process.cwd(), 'data');

async function readJson<T>(filename: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

export async function getDashboard(): Promise<DashboardData> {
  return readJson<DashboardData>('dashboard.json');
}

export async function getActors(): Promise<ActorSummary[]> {
  return readJson<ActorSummary[]>('actors.json');
}

export async function getProfiles(): Promise<Profile[]> {
  return readJson<Profile[]>('all-profiles.json');
}

export async function getProfilesByType(type: 'politician' | 'outlet' | 'journalist'): Promise<Profile[]> {
  const all = await getProfiles();
  return all.filter((p) => p.type === type);
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const profiles = await getProfiles();
  return profiles.find((p) => p.id === slug || slugify(p.name) === slug) ?? null;
}

export async function getEvidence(): Promise<Evidence[]> {
  return readJson<Evidence[]>('evidence.json');
}

export async function getContradictions(): Promise<Contradiction[]> {
  return readJson<Contradiction[]>('contradictions.json');
}

export async function getThemes(): Promise<ThemeItem[]> {
  return readJson<ThemeItem[]>('themes.json');
}

export async function getDocuments(): Promise<DocumentItem[]> {
  return readJson<DocumentItem[]>('documents.json');
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  return readJson<TimelineEvent[]>('timeline.json');
}

export async function getParties(): Promise<PartyData[]> {
  return readJson<PartyData[]>('parties.json');
}

export async function getMatrix(): Promise<Record<string, Record<string, number>>> {
  return readJson<Record<string, Record<string, number>>>('matrix.json');
}

export async function getStatements(): Promise<Statement[]> {
  return readJson<Statement[]>('statements.json');
}

export async function getFramingAnalysis(): Promise<FramingAnalysis[]> {
  return readJson<FramingAnalysis[]>('framing-analysis.json');
}

export async function getExplainers(): Promise<ExplainerEntry[]> {
  return readJson<ExplainerEntry[]>('explainers.json');
}

export function getActorStatements(statements: Statement[], actorName: string): Statement[] {
  const lower = actorName.toLowerCase();
  return statements.filter((s) => s.actor.toLowerCase() === lower);
}

// ─── Helpers ────────────────────────────────────────────────────────────

export { slugify } from './slugify';

export function getActorEvidence(evidence: Evidence[], actorName: string): Evidence[] {
  const lower = actorName.toLowerCase();
  return evidence.filter(
    (e) =>
      e.actors.some((a) => a.toLowerCase() === lower) ||
      e.title.toLowerCase().includes(lower) ||
      e.text.toLowerCase().includes(lower)
  );
}

export function getActorContradictions(
  contradictions: Contradiction[],
  actorName: string
): Contradiction[] {
  const lower = actorName.toLowerCase();
  return contradictions.filter(
    (c) =>
      c.actor?.toLowerCase() === lower ||
      c.counterparty?.toLowerCase() === lower
  );
}
