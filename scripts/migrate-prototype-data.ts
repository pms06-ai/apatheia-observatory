/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Migrate prototype JSON data into PostgreSQL via Prisma.
 *
 * Usage: npx tsx scripts/migrate-prototype-data.ts
 *
 * Requires DATABASE_URL in .env and `npx prisma db push` run first.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'data');

async function readJson<T>(filename: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Starting data migration...\n');

  // 1. Create topic
  console.log('Creating topic: iran-war-2026');
  const topic = await prisma.topic.upsert({
    where: { slug: 'iran-war-2026' },
    update: {},
    create: {
      slug: 'iran-war-2026',
      name: 'Iran War 2026',
      description:
        'Tracking political rhetoric, contradictions, and media coverage around the 2026 Iran war debate.',
      status: 'active',
    },
  });

  // 2. Import profiles as actors
  console.log('Importing actors from profiles.json...');
  const profiles: any[] = await readJson('profiles.json');
  const actorMap = new Map<string, string>(); // name -> id

  for (const p of profiles) {
    const actor = await prisma.actor.upsert({
      where: { slug: p.id || slugify(p.name) },
      update: {},
      create: {
        slug: p.id || slugify(p.name),
        name: p.name,
        type: 'politician',
        party: p.party || null,
        bloc: p.bloc || null,
        role: p.role || null,
        summary: p.summary || null,
        positioning: p.positioning || null,
        metadata: {
          signals: p.signals || [],
          watchpoints: p.watchpoints || [],
          phases: p.phases || [],
          linked_contradictions: p.linked_contradictions || [],
          evidence_count: p.evidence_count || 0,
          quote_count: p.quote_count || 0,
          dominant_themes: p.dominant_themes || [],
          sample_excerpt: p.sample_excerpt || '',
        },
      },
    });
    actorMap.set(p.name, actor.id);
  }

  // Also import actors from actors.json that aren't in profiles
  const actorsSummary: any[] = await readJson('actors.json');
  for (const a of actorsSummary) {
    if (!actorMap.has(a.name)) {
      const actor = await prisma.actor.upsert({
        where: { slug: slugify(a.name) },
        update: {},
        create: {
          slug: slugify(a.name),
          name: a.name,
          type: 'politician',
          metadata: {
            evidence_count: a.evidence_count || 0,
            dominant_themes: a.dominant_themes || [],
          },
        },
      });
      actorMap.set(a.name, actor.id);
    }
  }
  console.log(`  → ${actorMap.size} actors imported`);

  // 3. Import themes
  console.log('Importing themes...');
  const themes: any[] = await readJson('themes.json');
  const themeMap = new Map<string, string>(); // name -> id

  for (const t of themes) {
    const theme = await prisma.theme.upsert({
      where: { slug: slugify(t.name) },
      update: {},
      create: {
        slug: slugify(t.name),
        name: t.name,
      },
    });
    themeMap.set(t.name, theme.id);
  }
  console.log(`  → ${themeMap.size} themes imported`);

  // 4. Import documents as sources
  console.log('Importing documents as sources...');
  const documents: any[] = await readJson('documents.json');
  const sourceMap = new Map<string, string>(); // doc_id -> source_id

  for (const d of documents) {
    const source = await prisma.source.upsert({
      where: { slug: d.id },
      update: {},
      create: {
        slug: d.id,
        name: d.title || d.label,
        type: d.type || 'analysis',
        biasRating: 0,
        reliability: 0,
      },
    });
    sourceMap.set(d.id, source.id);
  }
  console.log(`  → ${sourceMap.size} sources imported`);

  // 5. Import contradictions
  console.log('Importing contradictions...');
  const contradictions: any[] = await readJson('contradictions.json');

  for (const c of contradictions) {
    // Find the actor ID
    let actorId = actorMap.get(c.actor);
    if (!actorId) {
      // Create the actor if not found
      const actor = await prisma.actor.upsert({
        where: { slug: slugify(c.actor) },
        update: {},
        create: {
          slug: slugify(c.actor),
          name: c.actor,
          type: 'politician',
        },
      });
      actorId = actor.id;
      actorMap.set(c.actor, actorId);
    }

    await prisma.contradiction.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        actorId,
        type: c.type || 'Cross-actor contradiction',
        severity: c.severity || 'medium',
        title: c.title,
        summary: c.summary || '',
        tension: c.tension || '',
        dateRange: c.date_range || '',
        themes: c.themes || [],
      },
    });
  }
  console.log(`  → ${contradictions.length} contradictions imported`);

  // 6. Import position drift from profile phases
  console.log('Importing position drift from profiles...');
  let driftCount = 0;

  for (const p of profiles) {
    const actorId = actorMap.get(p.name);
    if (!actorId || !p.phases?.length) continue;

    for (let i = 0; i < p.phases.length - 1; i++) {
      const from = p.phases[i];
      const to = p.phases[i + 1];

      await prisma.positionDrift.create({
        data: {
          actorId,
          topicId: topic.id,
          periodStart: new Date(from.date),
          periodEnd: new Date(to.date),
          fromPosition: `${from.stance}: ${from.label}`,
          toPosition: `${to.stance}: ${to.label}`,
        },
      });
      driftCount++;
    }
  }
  console.log(`  → ${driftCount} position drift records created`);

  console.log('\nMigration complete!');
  console.log(`  Topic: ${topic.name} (${topic.slug})`);
  console.log(`  Actors: ${actorMap.size}`);
  console.log(`  Themes: ${themeMap.size}`);
  console.log(`  Sources: ${sourceMap.size}`);
  console.log(`  Contradictions: ${contradictions.length}`);
  console.log(`  Position drifts: ${driftCount}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Migration failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
