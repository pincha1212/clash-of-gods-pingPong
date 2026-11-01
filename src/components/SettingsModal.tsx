import React, { useEffect } from 'react';
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
            <p><b>Teléfono o tablet</b><span>Arrastra tu lado de la cancha o usa los botones táctiles.</span></p>
            <p><b>Pausa</b><span>Esc o botón PAUSA</span></p>
          </div>
        </section>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
          <span>CLASH OF GODS · {APP_CODENAME}</span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{APP_VERSION_LABEL}</span>
        </div>
      </div>
    </div>
  );
};
