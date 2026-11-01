import { db } from './index.ts';
import { characters, arenas } from './schema.ts';
import { GODS, ARENAS, CHARACTER_CULTURAL_CLASSIFICATION } from '../game/config.js';
import { CODEX_PROFILES } from '../game/codex-profiles.js';
import { CODEX_ARENA_PROFILES } from '../game/codex-arenas.js';
import { CODEX_CONNECTIONS } from '../game/codex-relations.js';

export async function seedDatabaseIfEmpty() {
  try {
    const existingChars = await db.select().from(characters).limit(1);
    if (existingChars.length > 0) {
      console.log('Database already seeded. Skipping initial seed.');
      return;
    }

    console.log('Seeding characters and arenas into Cloud SQL PostgreSQL...');

    // 1. Seed Arenas
    for (const a of ARENAS) {
      const profile = (CODEX_ARENA_PROFILES as any)[a.id] || {};
      await db.insert(arenas).values({
        id: a.id,
        name: a.name,
        style: a.style,
        bg: a.bg,
        field: a.field,
        accent: a.accent,
        line: a.line,
        mythology: (ARENAS as any).ARENA_MYTHOLOGIES?.[a.id] || profile.subtitle || 'Mitología ancestral',
        summary: profile.overview || a.name,
        lore: profile.lore || '',
        mechanicTitle: profile.subtitle || a.name,
        mechanicDesc: profile.combat || '',
        hazard: profile.features ? JSON.stringify(profile.features) : null,
      }).onConflictDoNothing();
    }

    // 2. Seed Characters
    for (const [id, god] of Object.entries(GODS as Record<string, any>)) {
      const profile = (CODEX_PROFILES as any)[id] || {};
      const cultureInfo = (CHARACTER_CULTURAL_CLASSIFICATION as any)[id] || {};
      const relations = (CODEX_CONNECTIONS as any[]).filter(c => c.from === id || c.to === id);

      await db.insert(characters).values({
        id,
        name: god.name || id,
        title: god.title || 'Ser mítico',
        kind: god.kind || 'god',
        symbol: god.symbol || '✦',
        color: god.color || '#e8bd72',
        role: god.role || 'Combatiente',
        description: god.description || '',
        skillName: god.skill?.name || 'Poder',
        skillCooldown: Math.round(god.skill?.cooldown || 8),
        skillDescription: god.skill?.description || '',
        speed: String(god.stats?.speed ?? 7.5),
        size: Math.round(god.stats?.size ?? 100),
        power: Math.round(god.stats?.power ?? 8),
        heroPower: god.heroPower || null,
        abilityPower: god.abilityPower || null,
        culture: cultureInfo.culture || profile.origin || 'Mitología mundial',
        arenaId: cultureInfo.arenaId || 'arena_greek',
        aliases: profile.aliases || [],
        domains: profile.domains || [],
        story: profile.story || god.description || '',
        curiosity: profile.curiosity || '',
        symbols: profile.symbols || [god.symbol],
        mythicRelations: relations || [],
      }).onConflictDoNothing();
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seed:', error);
  }
}
