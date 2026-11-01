import { auth } from '../lib/firebase.ts';

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
    console.warn('Failed to fetch characters from server, using fallback:', error);
    return [];
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
    console.warn(`Failed to fetch character ${id} from server:`, error);
    return null;
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
    console.warn('Failed to fetch arenas from server:', error);
    return [];
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
    console.warn(`Failed to fetch arena ${id} from server:`, error);
    return null;
  }
}

export async function fetchUserFavorites(): Promise<any[]> {
  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) return [];
    const res = await fetch('/api/favorites', { headers });
    if (!res.ok) return [];
    return await res.json();
  } catch (_) {
    return [];
  }
}

export async function toggleFavorite(targetType: 'character' | 'arena', targetId: string): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) return false;
    const res = await fetch('/api/favorites/toggle', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.favorited;
  } catch (_) {
    return false;
  }
}
