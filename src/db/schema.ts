import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla de usuarios sincronizada con Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla relacional de personajes mitológicos (124 dioses, héroes, titanes y monstruos)
export const characters = pgTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  kind: text('kind').notNull(), // 'god' | 'hero' | 'titan' | 'monster'
  symbol: text('symbol').notNull(),
  color: text('color').notNull(),
  role: text('role').notNull(),
  description: text('description').notNull(),
  skillName: text('skill_name').notNull(),
  skillCooldown: integer('skill_cooldown').notNull(),
  skillDescription: text('skill_description').notNull(),
  speed: text('speed').notNull(),
  size: integer('size').notNull(),
  power: integer('power').notNull(),
  heroPower: text('hero_power'),
  abilityPower: text('ability_power'),
  culture: text('culture'),
  arenaId: text('arena_id'),
  aliases: jsonb('aliases'),
  domains: jsonb('domains'),
  story: text('story'),
  curiosity: text('curiosity'),
  symbols: jsonb('symbols'),
  mythicRelations: jsonb('mythic_relations'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla relacional de arenas mitológicas (17 arenas con arte y lore procedural)
export const arenas = pgTable('arenas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  style: text('style').notNull(),
  bg: text('bg').notNull(),
  field: text('field').notNull(),
  accent: text('accent').notNull(),
  line: text('line').notNull(),
  mythology: text('mythology').notNull(),
  summary: text('summary'),
  lore: text('lore'),
  mechanicTitle: text('mechanic_title'),
  mechanicDesc: text('mechanic_desc'),
  hazard: text('hazard'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla de favoritos persistentes por usuario
export const userFavorites = pgTable('user_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  targetType: text('target_type').notNull(), // 'character' | 'arena'
  targetId: text('target_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(userFavorites),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
}));
