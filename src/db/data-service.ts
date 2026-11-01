import { db } from './index.ts';
import { characters, arenas, users, userFavorites } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export async function getCharactersList(filterKind?: string) {
  try {
    if (filterKind && filterKind !== 'all') {
      return await db.select().from(characters).where(eq(characters.kind, filterKind));
    }
    return await db.select().from(characters);
  } catch (error) {
    console.error('Database query failed for getCharactersList:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getCharacterDetail(id: string) {
  try {
    const results = await db.select().from(characters).where(eq(characters.id, id));
    return results[0] || null;
  } catch (error) {
    console.error(`Database query failed for getCharacterDetail (${id}):`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getArenasList() {
  try {
    return await db.select().from(arenas);
  } catch (error) {
    console.error('Database query failed for getArenasList:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getArenaDetail(id: string) {
  try {
    const results = await db.select().from(arenas).where(eq(arenas.id, id));
    return results[0] || null;
  } catch (error) {
    console.error(`Database query failed for getArenaDetail (${id}):`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed for getOrCreateUser:', error);
    throw new Error('Failed to synchronize user.', { cause: error });
  }
}

export async function getUserFavoritesList(uid: string) {
  try {
    const userRes = await db.select().from(users).where(eq(users.uid, uid));
    if (!userRes[0]) return [];
    return await db.select().from(userFavorites).where(eq(userFavorites.userId, userRes[0].id));
  } catch (error) {
    console.error('Database query failed for getUserFavoritesList:', error);
    throw new Error('Failed to retrieve user favorites.', { cause: error });
  }
}

export async function toggleUserFavorite(uid: string, email: string, targetType: string, targetId: string) {
  try {
    const user = await getOrCreateUser(uid, email);
    const existing = await db.select().from(userFavorites).where(
      and(
        eq(userFavorites.userId, user.id),
        eq(userFavorites.targetType, targetType),
        eq(userFavorites.targetId, targetId)
      )
    );

    if (existing.length > 0) {
      await db.delete(userFavorites).where(eq(userFavorites.id, existing[0].id));
      return { favorited: false };
    } else {
      await db.insert(userFavorites).values({
        userId: user.id,
        targetType,
        targetId,
      });
      return { favorited: true };
    }
  } catch (error) {
    console.error('Database query failed for toggleUserFavorite:', error);
    throw new Error('Failed to update favorite status.', { cause: error });
  }
}
