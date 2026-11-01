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
      <span className="top-tag">DIVINE ARENA <b>•</b> V0.2.93</span>
      <div className="pwa-controls" style={{ display: 'flex', gap: '8px' }}>
        <button
          id="settings-button"
          className="icon-button gear-button"
          aria-label="Abrir ajustes"
          title="Ajustes"
          type="button"
          onClick={onOpenSettings}
        >
          ⚙ AJUSTES
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
          {isFullscreen ? '⛶ SALIR PANTALLA' : '⛶ PANTALLA COMPLETA'}
        </button>
      </div>
    </header>
  );
};
