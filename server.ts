import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getCharactersList,
  getCharacterDetail,
  getArenasList,
  getArenaDetail,
  getUserFavoritesList,
  toggleUserFavorite,
  getOrCreateUser,
} from './src/db/data-service.ts';
import { seedDatabaseIfEmpty } from './src/db/seed.ts';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Obtener catálogo de personajes (aligera la carga del cliente)
app.get('/api/characters', async (req: Request, res: Response) => {
  try {
    const kind = req.query.kind as string | undefined;
    const list = await getCharactersList(kind);
    res.json(list);
  } catch (error: any) {
    console.error('Error in /api/characters:', error);
    res.status(500).json({ error: error.message || 'Error al obtener personajes' });
  }
});

// Detalle completo y relato de un personaje
app.get('/api/characters/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const char = await getCharacterDetail(id);
    if (!char) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }
    res.json(char);
  } catch (error: any) {
    console.error(`Error in /api/characters/${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Error al obtener detalle del personaje' });
  }
});

// Obtener catálogo de arenas mitológicas
app.get('/api/arenas', async (req: Request, res: Response) => {
  try {
    const list = await getArenasList();
    res.json(list);
  } catch (error: any) {
    console.error('Error in /api/arenas:', error);
    res.status(500).json({ error: error.message || 'Error al obtener arenas' });
  }
});

// Detalle de una arena
app.get('/api/arenas/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const arena = await getArenaDetail(id);
    if (!arena) {
      return res.status(404).json({ error: 'Arena no encontrada' });
    }
    res.json(arena);
  } catch (error: any) {
    console.error(`Error in /api/arenas/${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Error al obtener arena' });
  }
});

// Favoritos del usuario autenticado
app.get('/api/favorites', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'No autorizado' });
    const favorites = await getUserFavoritesList(uid);
    res.json(favorites);
  } catch (error: any) {
    console.error('Error in /api/favorites:', error);
    res.status(500).json({ error: error.message || 'Error al obtener favoritos' });
  }
});

// Alternar favorito
app.post('/api/favorites/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || 'user@example.com';
    const { targetType, targetId } = req.body;
    if (!uid || !targetType || !targetId) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }
    const result = await toggleUserFavorite(uid, email, targetType, targetId);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/favorites/toggle:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar favorito' });
  }
});

// Sincronizar usuario autenticado
app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || '';
    const name = (req.user as any)?.name || req.body.displayName || '';
    if (!uid) return res.status(401).json({ error: 'No autorizado' });
    const user = await getOrCreateUser(uid, email, name);
    res.json(user);
  } catch (error: any) {
    console.error('Error in /api/users/sync:', error);
    res.status(500).json({ error: error.message || 'Error al sincronizar usuario' });
  }
});

async function startServer() {
  // Inicializar y poblar base de datos de manera diferida si está vacía
  seedDatabaseIfEmpty().catch(err => {
    console.error('Initial database seed failed:', err);
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clash of Gods server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
