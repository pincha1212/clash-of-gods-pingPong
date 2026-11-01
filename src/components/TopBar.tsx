import React, { useState } from 'react';
import { setSound, playTone } from '../game/audio.js';
import { state } from '../game/state.js';

interface TopBarProps {
  onOpenSettings: () => void;
  onNavigateHome: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onNavigateHome }) => {
  const [soundOn, setSoundOn] = useState<boolean>(state.soundEnabled ?? true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSound(next);
    state.soundEnabled = next;
    if (state.settings) state.settings.sound = next;
    setSoundOn(next);
    if (next) playTone(550, 0.07);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="topbar">
      <a
        className="wordmark"
        href="#menu"
        aria-label="Clash of Gods inicio"
        onClick={(e) => {
          e.preventDefault();
          onNavigateHome();
        }}
      >
        <span className="mark">✦</span>
        <span>CLASH <i>OF</i> GODS</span>
      </a>

      <span className="top-tag">DIVINE ARENA <b>•</b> V0.2.95</span>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          id="settings-button"
          className="icon-button gear-button"
          aria-label="Abrir ajustes"
          title="Ajustes"
          type="button"
          onClick={onOpenSettings}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <button
          id="sound-toggle"
          className="icon-button"
          aria-label="Activar o desactivar sonido"
          type="button"
          onClick={toggleSound}
        >
          SONIDO: {soundOn ? 'ON' : 'OFF'}
        </button>

        <button
          id="fullscreen-button"
          className="icon-button fullscreen-header-button"
          type="button"
          aria-label="Activar pantalla completa"
          title="Pantalla completa"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? '⛶ SALIR' : '⛶ PANTALLA COMPLETA'}
        </button>
      </div>
    </header>
  );
};
