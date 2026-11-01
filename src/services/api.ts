import { auth } from '../lib/firebase.ts';
import { GODS, ARENAS, ARENA_MYTHOLOGIES, CHARACTER_CULTURAL_CLASSIFICATION } from '../game/config.js';
import { CODEX_PROFILES } from '../game/codex-profiles.js';
import { CODEX_ARENA_PROFILES } from '../game/codex-arenas.js';
import { CODEX_CONNECTIONS } from '../game/codex-relations.js';

export interface DbCharacter {
  id: string;
  name: string;
  title: string;
  kind: string;
  symbol: string;
  color: string;
  role: string;
  description: string;
  skillName: string;
  skillCooldown: number;
  skillDescription: string;
  speed: string;
  size: number;
  power: number;
  heroPower?: string;
  abilityPower?: string;
  culture?: string;
  arenaId?: string;
  aliases?: string[];
  domains?: string[];
  story?: string;
  curiosity?: string;
  symbols?: string[];
  mythicRelations?: Array<{ from: string; to: string; type: string; note: string }>;
}

export interface DbArena {
  id: string;
  name: string;
  style: string;
  bg: string;
  field: string;
  accent: string;
  line: string;
  mythology: string;
  summary?: string;
  lore?: string;
  mechanicTitle?: string;
  mechanicDesc?: string;
  hazard?: string;
}

// In-memory cache for ultra-fast UI rendering
const cache = {
  characters: null as DbCharacter[] | null,
  characterDetails: new Map<string, DbCharacter>(),
  arenas: null as DbArena[] | null,
  arenaDetails: new Map<string, DbArena>(),
};

/**
 * Genera el catálogo completo de personajes empaquetado para despliegues estáticos (GitHub Pages)
 * o funcionamiento sin conexión a servidor Express.
 */
function getBundledCharacters(kind?: string): DbCharacter[] {
  const all: DbCharacter[] = Object.entries(GODS as Record<string, any>).map(([id, god]) => {
    const profile = (CODEX_PROFILES as any)[id] || {};
    const cultureInfo = (CHARACTER_CULTURAL_CLASSIFICATION as any)[id] || {};
    const relations = (CODEX_CONNECTIONS as any[]).filter(c => c.from === id || c.to === id);
    return {
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
      heroPower: god.heroPower || undefined,
      abilityPower: god.abilityPower || undefined,
      culture: cultureInfo.culture || 'Tradición mítica',
      arenaId: cultureInfo.arenaId || 'arena_greek',
      aliases: profile.aliases || [],
      domains: profile.domains || [],
      story: profile.story || '',
      curiosity: profile.curiosity || '',
      symbols: profile.symbols || [],
      mythicRelations: relations,
    };
  });

  if (!kind || kind === 'all') return all;
  return all.filter(c => c.kind === kind);
}

/**
 * Genera el catálogo completo de las 17 arenas empaquetado para GitHub Pages u operación autónoma.
 */
function getBundledArenas(): DbArena[] {
  return (ARENAS as any[]).map(a => {
    const profile = (CODEX_ARENA_PROFILES as any)[a.id] || {};
    return {
      id: a.id,
      name: a.name,
      style: a.style,
      bg: a.bg,
      field: a.field,
      accent: a.accent,
      line: a.line,
      mythology: (ARENA_MYTHOLOGIES as any)[a.id] || profile.subtitle || 'Mitología ancestral',
      summary: profile.overview || a.name,
      lore: profile.lore || '',
      mechanicTitle: profile.subtitle || a.name,
      mechanicDesc: profile.combat || '',
      hazard: profile.features ? JSON.stringify(profile.features) : undefined,
    };
  });
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
  } catch (_) {}
  return {};
}

export async function fetchCharacters(kind?: string): Promise<DbCharacter[]> {
  if (cache.characters && (!kind || kind === 'all')) {
    return cache.characters;
  }
  try {
    const url = kind && kind !== 'all' ? `/api/characters?kind=${encodeURIComponent(kind)}` : '/api/characters';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DbCharacter[] = await res.json();
    if (!kind || kind === 'all') {
      cache.characters = data;
      data.forEach(c => cache.characterDetails.set(c.id, c));
    }
    return data;
  } catch (error) {
    console.info('Modo estático/offline (GitHub Pages): cargando catálogo empaquetado de personajes.');
    const fallback = getBundledCharacters(kind);
    if (!kind || kind === 'all') {
      cache.characters = fallback;
      fallback.forEach(c => cache.characterDetails.set(c.id, c));
    }
    return fallback;
  }
}

export async function fetchCharacterDetail(id: string): Promise<DbCharacter | null> {
  if (cache.characterDetails.has(id)) {
    return cache.characterDetails.get(id)!;
  }
  try {
    const res = await fetch(`/api/characters/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DbCharacter = await res.json();
    cache.characterDetails.set(id, data);
    return data;
  } catch (error) {
    const fallback = getBundledCharacters('all').find(c => c.id === id) || null;
    if (fallback) cache.characterDetails.set(id, fallback);
    return fallback;
  }
}

export async function fetchArenas(): Promise<DbArena[]> {
  if (cache.arenas) {
    return cache.arenas;
  }
  try {
    const res = await fetch('/api/arenas');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DbArena[] = await res.json();
    cache.arenas = data;
    data.forEach(a => cache.arenaDetails.set(a.id, a));
    return data;
  } catch (error) {
    console.info('Modo estático/offline (GitHub Pages): cargando catálogo empaquetado de arenas.');
    const fallback = getBundledArenas();
    cache.arenas = fallback;
    fallback.forEach(a => cache.arenaDetails.set(a.id, a));
    return fallback;
  }
}

export async function fetchArenaDetail(id: string): Promise<DbArena | null> {
  if (cache.arenaDetails.has(id)) {
    return cache.arenaDetails.get(id)!;
  }
  try {
    const res = await fetch(`/api/arenas/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DbArena = await res.json();
    cache.arenaDetails.set(id, data);
    return data;
  } catch (error) {
    const fallback = getBundledArenas().find(a => a.id === id) || null;
    if (fallback) cache.arenaDetails.set(id, fallback);
    return fallback;
  }
}

export async function fetchUserFavorites(): Promise<any[]> {
  try {
    const headers = await getAuthHeader();
    if (headers.Authorization) {
      const res = await fetch('/api/favorites', { headers });
      if (res.ok) return await res.json();
    }
  } catch (_) {}
  try {
    const raw = localStorage.getItem('clash_local_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function toggleFavorite(targetType: 'character' | 'arena', targetId: string): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    if (headers.Authorization) {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId }),
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.favorited;
      }
    }
  } catch (_) {}
  try {
    const raw = localStorage.getItem('clash_local_favorites');
    let list: Array<{ targetType: string; targetId: string }> = raw ? JSON.parse(raw) : [];
    const exists = list.some(item => item.targetType === targetType && item.targetId === targetId);
    if (exists) {
      list = list.filter(item => !(item.targetType === targetType && item.targetId === targetId));
      localStorage.setItem('clash_local_favorites', JSON.stringify(list));
      return false;
    } else {
      list.push({ targetType, targetId });
      localStorage.setItem('clash_local_favorites', JSON.stringify(list));
      return true;
    }
  } catch (_) {
    return false;
  }
}
