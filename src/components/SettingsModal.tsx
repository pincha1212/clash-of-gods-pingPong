import React, { useEffect, useState } from 'react';
import { state } from '../game/state.js';
import { setSound, setVolume } from '../game/audio.js';
import { APP_VERSION_LABEL, APP_CODENAME } from '../version.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  arenaEventsEnabled: boolean;
  onArenaEventsChange: (val: boolean) => void;
  skillsEnabled: boolean;
  onSkillsChange: (val: boolean) => void;
  itemsEnabled: boolean;
  onItemsChange: (val: boolean) => void;
}

interface DiagnosticState {
  tested: boolean;
  loading: boolean;
  apiHealth: string;
  latencyMs: number;
  charactersCount: number;
  arenasCount: number;
  audioState: string;
  proxyConnected: boolean;
  error?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  arenaEventsEnabled,
  onArenaEventsChange,
  skillsEnabled,
  onSkillsChange,
  itemsEnabled,
  onItemsChange
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSettings = state.settings || {
    quality: 'balanced',
    reducedMotion: false,
    volume: 0.7,
    sound: true,
    touchControls: true
  };

  const [diag, setDiag] = useState<DiagnosticState>({
    tested: false,
    loading: false,
    apiHealth: 'Sin verificar',
    latencyMs: 0,
    charactersCount: 0,
    arenasCount: 0,
    audioState: 'Inactivo',
    proxyConnected: false,
  });
  const [showLogGlossary, setShowLogGlossary] = useState<boolean>(false);

  const runDiagnostics = async () => {
    setDiag(prev => ({ ...prev, loading: true, error: undefined }));
    const t0 = performance.now();
    try {
      const [resHealth, resChars, resArenas] = await Promise.all([
        fetch('/api/health').then(r => r.json()).catch(() => ({ status: 'error' })),
        fetch('/api/characters').then(r => r.json()).catch(() => []),
        fetch('/api/arenas').then(r => r.json()).catch(() => [])
      ]);
      const latency = Math.round(performance.now() - t0);
      const audioCtx = (state as any).audioContext;
      const audioCtxState = audioCtx ? audioCtx.state : 'suspendido (espera primer toque)';

      setDiag({
        tested: true,
        loading: false,
        apiHealth: resHealth?.status === 'ok' ? 'OK (200)' : 'Error de enlace',
        latencyMs: latency,
        charactersCount: Array.isArray(resChars) ? resChars.length : 0,
        arenasCount: Array.isArray(resArenas) ? resArenas.length : 0,
        audioState: audioCtxState,
        proxyConnected: resHealth?.status === 'ok' && Array.isArray(resChars) && resChars.length > 0
      });
    } catch (err: any) {
      setDiag({
        tested: true,
        loading: false,
        apiHealth: 'Fallo de red',
        latencyMs: Math.round(performance.now() - t0),
        charactersCount: 0,
        arenasCount: 0,
        audioState: 'error',
        proxyConnected: false,
        error: err.message
      });
    }
  };

  const handleQualityChange = (q: string) => {
    state.settings.quality = q;
  };

  const handleReducedMotionChange = (val: boolean) => {
    state.settings.reducedMotion = val;
  };

  const handleSoundToggle = (val: boolean) => {
    setSound(val);
    state.settings.sound = val;
    state.soundEnabled = val;
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    state.settings.volume = vol;
  };

  return (
    <div
      className="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="settings-panel">
        <div className="settings-heading">
          <div>
            <p className="eyebrow">DIVINE ARENA / PREFERENCIAS · {APP_VERSION_LABEL}</p>
            <h2 id="settings-title">AJUSTES <em>DEL JUEGO</em></h2>
          </div>
          <button className="settings-close" aria-label="Cerrar ajustes" onClick={onClose}>
            ×
          </button>
        </div>

        <section className="settings-section">
          <h3>▣ VIDEO</h3>
          <label htmlFor="video-quality">Calidad gráfica</label>
          <select
            id="video-quality"
            defaultValue={currentSettings.quality || 'balanced'}
            onChange={(e) => handleQualityChange(e.target.value)}
          >
            <option value="low">Rendimiento — máximo ahorro</option>
            <option value="balanced">Equilibrada</option>
            <option value="high">Alta — más detalles</option>
          </select>
          <label className="settings-check">
            <span>Reducir efectos y partículas</span>
            <input
              type="checkbox"
              defaultChecked={currentSettings.reducedMotion}
              onChange={(e) => handleReducedMotionChange(e.target.checked)}
            />
            <i></i>
          </label>
        </section>

        <section className="settings-section">
          <h3>⚔ REGLAS DE COMBATE</h3>
          <label className="settings-check">
            <span>Eventos ambientales de las arenas</span>
            <input
              type="checkbox"
              checked={arenaEventsEnabled}
              onChange={(e) => onArenaEventsChange(e.target.checked)}
            />
            <i></i>
          </label>
          <small className="settings-note">
            Controla fenómenos periódicos de las arenas y crónicas.
          </small>

          <label className="settings-check">
            <span>Power-ups y objetos</span>
            <input
              type="checkbox"
              checked={itemsEnabled}
              onChange={(e) => onItemsChange(e.target.checked)}
            />
            <i></i>
          </label>
          <small className="settings-note">
            Activa o desactiva los objetos normales de combate.
          </small>

          <label className="settings-check">
            <span>Habilidades de personaje</span>
            <input
              type="checkbox"
              checked={skillsEnabled}
              onChange={(e) => onSkillsChange(e.target.checked)}
            />
            <i></i>
          </label>
          <small className="settings-note">
            Permite o bloquea nuevas activaciones de poderes únicos.
          </small>
        </section>

        <section className="settings-section">
          <h3>♫ SONIDO</h3>
          <label className="settings-check">
            <span>Efectos de sonido</span>
            <input
              type="checkbox"
              defaultChecked={state.soundEnabled}
              onChange={(e) => handleSoundToggle(e.target.checked)}
            />
            <i></i>
          </label>
          <label htmlFor="sound-volume">Volumen general</label>
          <input
            id="sound-volume"
            className="volume-range"
            type="range"
            min="0"
            max="1"
            step="0.05"
            defaultValue={currentSettings.volume ?? 0.7}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          />
        </section>

        <section className="settings-section">
          <h3>⌖ CONTROLES</h3>
          <div className="controls-reference">
            <p><b>Jugador 1</b><span>W / S · Poder: Espacio</span></p>
            <p><b>Jugador 2 local</b><span>↑ / ↓ · Poder: Enter</span></p>
            <p><b>Teléfono o tablet</b><span>Arrastra tu lado de la cancha (gesto directo) o doble toque para poder.</span></p>
            <p><b>Pausa</b><span>Esc o botón PAUSA</span></p>
          </div>
        </section>

        <section className="settings-section" style={{ borderBottom: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>📊 AUDITORÍA Y DICCIONARIO DE LOGS</h3>
            <button
              type="button"
              className="button button-quiet"
              style={{ padding: '6px 12px', fontSize: '9px', borderColor: 'var(--gold)', color: 'var(--gold)' }}
              onClick={runDiagnostics}
              disabled={diag.loading}
            >
              {diag.loading ? 'COMPROBANDO...' : diag.tested ? 'REPETIR TEST' : 'PROBAR CONEXIONES'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: '#0a0d16', border: '1px solid var(--line)', padding: '9px 11px', borderRadius: '4px' }}>
              <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cloud SQL & API</span>
              <b style={{ fontSize: '13px', color: diag.tested ? (diag.proxyConnected ? '#70e4e9' : '#ff7a7a') : 'var(--muted)', display: 'block', marginTop: '2px' }}>
                {diag.tested ? diag.apiHealth : 'Pendiente'}
              </b>
              <small style={{ fontSize: '8px', color: 'var(--muted)' }}>
                {diag.tested ? `Latencia: ${diag.latencyMs} ms` : 'Pulsa Probar Conexiones'}
              </small>
            </div>

            <div style={{ background: '#0a0d16', border: '1px solid var(--line)', padding: '9px 11px', borderRadius: '4px' }}>
              <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Base de Datos</span>
              <b style={{ fontSize: '13px', color: diag.tested ? 'var(--gold)' : 'var(--muted)', display: 'block', marginTop: '2px' }}>
                {diag.tested ? `${diag.charactersCount} Dioses` : 'PostgreSQL'}
              </b>
              <small style={{ fontSize: '8px', color: 'var(--muted)' }}>
                {diag.tested ? `${diag.arenasCount} Arenas activas` : 'us-east1 Developer'}
              </small>
            </div>

            <div style={{ background: '#0a0d16', border: '1px solid var(--line)', padding: '9px 11px', borderRadius: '4px' }}>
              <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Motor Web Audio</span>
              <b style={{ fontSize: '12px', color: state.soundEnabled ? '#b9dc86' : 'var(--muted)', display: 'block', marginTop: '2px' }}>
                {state.soundEnabled ? 'Habilitado' : 'Silenciado'}
              </b>
              <small style={{ fontSize: '8px', color: 'var(--muted)' }}>
                {diag.tested ? `Contexto: ${diag.audioState}` : 'Sintetizador polifónico'}
              </small>
            </div>
          </div>

          <button
            type="button"
            className="button button-quiet"
            style={{ width: '100%', fontSize: '9px', textAlign: 'left', padding: '8px 12px', borderColor: 'var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => setShowLogGlossary(!showLogGlossary)}
          >
            <span>{showLogGlossary ? '▾ Ocultar Glosario de Logs y Errores' : '▸ ¿Qué significan los errores y los logs? (Guía de auditoría)'}</span>
            <span style={{ color: 'var(--gold)' }}>{showLogGlossary ? 'CERRAR' : 'VER GUÍA'}</span>
          </button>

          {showLogGlossary && (
            <div style={{ marginTop: '10px', background: '#090b14', border: '1px solid var(--line)', padding: '12px', fontSize: '9px', lineHeight: 1.6, color: '#c5cad8' }}>
              <div style={{ marginBottom: '10px' }}>
                <b style={{ color: 'var(--gold)', display: 'block' }}>1. Peticiones HTTP /api/* (200 OK vs 304 Not Modified):</b>
                <span>Indica que el cliente se comunicó con el servidor Express y Cloud SQL en `us-east1`. Un código 200 significa datos frescos transferidos con éxito; 304 indica que el navegador reutilizó la copia en caché para máxima velocidad.</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <b style={{ color: 'var(--gold)', display: 'block' }}>2. Alerta "AudioContext was not allowed to start":</b>
                <span>No es un fallo del juego. Los navegadores modernos imponen una política de seguridad (Autoplay Policy) que suspende el audio hasta que el usuario realiza su primer toque o clic en la pantalla. Al interactuar, se reanuda automáticamente.</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <b style={{ color: 'var(--gold)', display: 'block' }}>3. Cloud SQL Proxy en Unix Socket (/app/cloudsql):</b>
                <span>Túnel de comunicación seguro con Google Cloud SQL PostgreSQL. Permite ejecutar queries y siembras relacionales de los 124 personajes y 17 arenas sin exponer credenciales a la web.</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <b style={{ color: 'var(--gold)', display: 'block' }}>4. Vite [HMR] WebSocket en AI Studio:</b>
                <span>Avisos de recarga de módulos en caliente del entorno de desarrollo. En modo incrustado iFrame, los websockets están aislados por seguridad sin afectar la ejecución autónoma del juego.</span>
              </div>
              <div>
                <b style={{ color: 'var(--gold)', display: 'block' }}>5. Motor de Gestos (Touch Engine & Deltas):</b>
                <span>Registra el arrastre 1:1 en pantalla táctil y detección de doble toque para habilidades, sustituyendo los botones flotantes de versiones anteriores.</span>
              </div>
            </div>
          )}
        </section>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
          <span>CLASH OF GODS · {APP_CODENAME}</span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{APP_VERSION_LABEL}</span>
        </div>
      </div>
    </div>
  );
};
