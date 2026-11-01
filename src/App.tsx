import React, { useState, useEffect } from 'react';
import { GODS, ARENAS } from './game/config.js';
import { state } from './game/state.js';
import { engine } from './game/engine.js';
import {
  beginSurvival,
  resumeSavedSurvivalCampaign,
  survivalCampaign
} from './game/survival.js';

import { TopBar } from './components/TopBar';
import { ScreenMenu } from './components/ScreenMenu';
import { ScreenMode } from './components/ScreenMode';
import { ScreenSelect } from './components/ScreenSelect';
import { ScreenConfig } from './components/ScreenConfig';
import { ScreenReview } from './components/ScreenReview';
import { ScreenGame } from './components/ScreenGame';
import { ScreenResult } from './components/ScreenResult';
import { ScreenCodex } from './components/ScreenCodex';
import { CodexDetailModal } from './components/CodexDetailModal';
import { SettingsModal } from './components/SettingsModal';

const safeRead = (key: string, fallback: any) => {
  try {
    const val = JSON.parse(localStorage.getItem(key) || 'null');
    return val ?? fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export const App: React.FC = () => {
  const [screen, setScreen] = useState<
    'menu' | 'mode' | 'select' | 'config' | 'review' | 'game' | 'result' | 'codex'
  >('menu');

  const [preparationMode, setPreparationMode] = useState<
    'classic' | 'chronicles' | 'mutation' | 'survival'
  >('classic');

  const [rosterMode, setRosterMode] = useState<string>('gods');
  const [mythicMode, setMythicMode] = useState<string>('classic');
  const [arenaId, setArenaId] = useState<string>('arena_japanese');
  const [gameMode, setGameMode] = useState<'cpu' | 'local'>('cpu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [winScore, setWinScore] = useState<number>(7);
  const [arenaEventsEnabled, setArenaEventsEnabled] = useState<boolean>(true);
  const [skillsEnabled, setSkillsEnabled] = useState<boolean>(true);
  const [itemsEnabled, setItemsEnabled] = useState<boolean>(true);

  const [mutationP1Color, setMutationP1Color] = useState<string>('#45ff75');
  const [mutationP2Color, setMutationP2Color] = useState<string>('#42baff');

  const [selectedP1, setSelectedP1] = useState<string>('raijin');
  const [selectedP2, setSelectedP2] = useState<string>('fujin');

  const [matchResult, setMatchResult] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Codex Modals & State
  const [codexCharacterId, setCodexCharacterId] = useState<string | null>(null);
  const [codexArenaId, setCodexArenaId] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(safeRead('clashOfGods.codexFavorites', []).filter((id: string) => GODS[id]))
  );
  const [arenaFavorites, setArenaFavorites] = useState<Set<string>>(
    () => new Set(safeRead('clashOfGods.codexArenaFavorites', []).filter((id: string) => ARENAS.some(a => a.id === id)))
  );
  const [compareIds, setCompareIds] = useState<string[]>(
    () => safeRead('clashOfGods.codexCompare', []).filter((id: string) => GODS[id]).slice(0, 3)
  );
  const [readProgress, setReadProgress] = useState<Set<string>>(
    () => new Set(safeRead('clashOfGods.codexReadProgress', []).filter((id: string) => GODS[id]))
  );
  const [arenaReadProgress, setArenaReadProgress] = useState<Set<string>>(
    () => new Set(safeRead('clashOfGods.codexArenaReadProgress', []).filter((id: string) => ARENAS.some(a => a.id === id)))
  );

  // Synchronize state object with React state
  useEffect(() => {
    state.preparationMode = preparationMode;
    state.rosterMode = rosterMode;
    state.mythicMode = mythicMode;
    state.arenaId = arenaId;
    state.mode = gameMode;
    state.difficulty = difficulty;
    state.winScore = winScore;
    state.skillsEnabled = skillsEnabled;
    state.itemsEnabled = itemsEnabled;
    state.selected = { p1: selectedP1, p2: selectedP2 };
    state.mutationColors = { p1: mutationP1Color, p2: mutationP2Color };
    if (!state.settings) {
      state.settings = {
        quality: 'balanced',
        reducedMotion: false,
        volume: 0.7,
        sound: true,
        touchControls: true,
        arenaEvents: true
      };
    }
    state.settings.arenaEvents = arenaEventsEnabled;
  }, [
    preparationMode,
    rosterMode,
    mythicMode,
    arenaId,
    gameMode,
    difficulty,
    winScore,
    skillsEnabled,
    itemsEnabled,
    selectedP1,
    selectedP2,
    mutationP1Color,
    mutationP2Color,
    arenaEventsEnabled
  ]);

  const handleSelectMode = (mode: 'classic' | 'chronicles' | 'mutation' | 'survival') => {
    setPreparationMode(mode);
    state.preparationMode = mode;
    if (mode === 'chronicles') {
      setMythicMode('olympus');
      state.mythicMode = 'olympus';
      setSelectedP1('zeus');
      setSelectedP2('poseidon');
      setRosterMode('mythic-duel');
      setScreen('config');
    } else if (mode === 'survival') {
      setMythicMode('classic');
      setRosterMode('survival-all');
      setGameMode('cpu');
      setScreen('select');
    } else {
      setMythicMode('classic');
      setRosterMode('gods');
      setScreen('select');
    }
  };

  const handleResumeSurvival = () => {
    const campaign = resumeSavedSurvivalCampaign();
    if (!campaign) return;
    setPreparationMode('survival');
    state.preparationMode = 'survival';
    setGameMode('cpu');
    setSelectedP1(campaign.protagonistId);
    setSelectedP2(state.selected.p2);
    setScreen('game');
  };

  const handleStartBattle = () => {
    if (preparationMode === 'survival') {
      beginSurvival(selectedP1, { winScore });
    }
    setScreen('game');
  };

  const handleExitMatch = () => {
    engine.returnToMenu();
    setScreen('menu');
  };

  const handleMatchFinished = (result: any) => {
    setMatchResult(result);
    setScreen('result');
  };

  const handleRematch = () => {
    if (preparationMode === 'survival') {
      if (!survivalCampaign.active) {
        beginSurvival(selectedP1, { winScore });
      }
    }
    setScreen('game');
  };

  // Codex handlers
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      safeWrite('clashOfGods.codexFavorites', [...next]);
      return next;
    });
  };

  const handleToggleArenaFavorite = (id: string) => {
    setArenaFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      safeWrite('clashOfGods.codexArenaFavorites', [...next]);
      return next;
    });
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds(prev => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id);
      } else {
        if (prev.length >= 3) return prev;
        next = [...prev, id];
      }
      safeWrite('clashOfGods.codexCompare', next);
      return next;
    });
  };

  const handleRemoveCompare = (id: string) => {
    setCompareIds(prev => {
      const next = prev.filter(x => x !== id);
      safeWrite('clashOfGods.codexCompare', next);
      return next;
    });
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    safeWrite('clashOfGods.codexCompare', []);
  };

  const handleOpenCharacterDetail = (id: string) => {
    setCodexCharacterId(id);
    setCodexArenaId(null);
    setReadProgress(prev => {
      const next = new Set(prev);
      next.add(id);
      safeWrite('clashOfGods.codexReadProgress', [...next]);
      return next;
    });
  };

  const handleOpenArenaDetail = (id: string) => {
    setCodexArenaId(id);
    setCodexCharacterId(null);
    setArenaReadProgress(prev => {
      const next = new Set(prev);
      next.add(id);
      safeWrite('clashOfGods.codexArenaReadProgress', [...next]);
      return next;
    });
  };

  const handleResetReadProgress = () => {
    if (window.confirm('¿Reiniciar el progreso de lectura del Códice?')) {
      setReadProgress(new Set());
      safeWrite('clashOfGods.codexReadProgress', []);
    }
  };

  const handleResetArenaReadProgress = () => {
    if (window.confirm('¿Reiniciar el progreso de exploración de arenas?')) {
      setArenaReadProgress(new Set());
      safeWrite('clashOfGods.codexArenaReadProgress', []);
    }
  };

  return (
    <>
      <div className="ambient ambient-a"></div>
      <div className="ambient ambient-b"></div>

      <TopBar
        onOpenSettings={() => setSettingsOpen(true)}
        onNavigateHome={() => {
          engine.returnToMenu();
          setScreen('menu');
        }}
      />

      <main>
        {screen === 'menu' && (
          <ScreenMenu
            onStartCombat={() => setScreen('mode')}
            onOpenCodex={() => setScreen('codex')}
          />
        )}

        {screen === 'mode' && (
          <ScreenMode
            onSelectMode={handleSelectMode}
            onResumeSurvival={handleResumeSurvival}
            onBack={() => setScreen('menu')}
          />
        )}

        {screen === 'select' && (
          <ScreenSelect
            preparationMode={preparationMode}
            rosterMode={rosterMode}
            onRosterModeChange={setRosterMode}
            selectedP1={selectedP1}
            selectedP2={selectedP2}
            onSelectP1={setSelectedP1}
            onSelectP2={setSelectedP2}
            onContinue={() => setScreen('config')}
            onBack={() => setScreen('mode')}
          />
        )}

        {screen === 'config' && (
          <ScreenConfig
            preparationMode={preparationMode}
            mythicMode={mythicMode}
            onMythicModeChange={(m) => {
              setMythicMode(m);
              state.mythicMode = m;
              const duel: any = {
                olympus: ['zeus', 'poseidon'],
                ragnarok: ['thor', 'jormungandr'],
                throne: ['horus', 'seth'],
                waters: ['indra', 'vritra'],
                'boss-jormungandr': ['thor', 'jormungandr'],
                'boss-typhon': ['zeus', 'typhon']
              }[m];
              if (duel) {
                setSelectedP1(duel[0]);
                setSelectedP2(duel[1]);
              }
            }}
            arenaId={arenaId}
            onArenaChange={setArenaId}
            gameMode={gameMode}
            onGameModeChange={setGameMode}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            winScore={winScore}
            onWinScoreChange={setWinScore}
            arenaEventsEnabled={arenaEventsEnabled}
            onArenaEventsChange={setArenaEventsEnabled}
            skillsEnabled={skillsEnabled}
            onSkillsChange={setSkillsEnabled}
            itemsEnabled={itemsEnabled}
            onItemsChange={setItemsEnabled}
            mutationP1Color={mutationP1Color}
            onMutationP1ColorChange={setMutationP1Color}
            mutationP2Color={mutationP2Color}
            onMutationP2ColorChange={setMutationP2Color}
            selectedP1={selectedP1}
            selectedP2={selectedP2}
            onContinue={() => setScreen('review')}
            onBack={() => setScreen(preparationMode === 'chronicles' ? 'mode' : 'select')}
          />
        )}

        {screen === 'review' && (
          <ScreenReview
            preparationMode={preparationMode}
            mythicMode={mythicMode}
            arenaId={arenaId}
            gameMode={gameMode}
            winScore={winScore}
            selectedP1={selectedP1}
            selectedP2={selectedP2}
            onStartBattle={handleStartBattle}
            onBack={() => setScreen('config')}
          />
        )}

        {screen === 'game' && (
          <ScreenGame
            preparationMode={preparationMode}
            selectedP1={selectedP1}
            selectedP2={selectedP2}
            winScore={winScore}
            gameMode={gameMode}
            onExit={handleExitMatch}
            onMatchFinished={handleMatchFinished}
          />
        )}

        {screen === 'result' && (
          <ScreenResult
            result={matchResult}
            onRematch={handleRematch}
            onMainMenu={() => setScreen('menu')}
          />
        )}

        {screen === 'codex' && (
          <ScreenCodex
            onBack={() => setScreen('menu')}
            onOpenCharacterDetail={handleOpenCharacterDetail}
            onOpenArenaDetail={handleOpenArenaDetail}
            favorites={favorites}
            arenaFavorites={arenaFavorites}
            compareIds={compareIds}
            readProgress={readProgress}
            arenaReadProgress={arenaReadProgress}
            onToggleFavorite={handleToggleFavorite}
            onToggleArenaFavorite={handleToggleArenaFavorite}
            onToggleCompare={handleToggleCompare}
            onRemoveCompare={handleRemoveCompare}
            onClearCompare={handleClearCompare}
            onResetReadProgress={handleResetReadProgress}
            onResetArenaReadProgress={handleResetArenaReadProgress}
          />
        )}
      </main>

      <CodexDetailModal
        characterId={codexCharacterId}
        arenaId={codexArenaId}
        favorites={favorites}
        arenaFavorites={arenaFavorites}
        compareIds={compareIds}
        onToggleFavorite={handleToggleFavorite}
        onToggleArenaFavorite={handleToggleArenaFavorite}
        onToggleCompare={handleToggleCompare}
        onSelectRelatedCharacter={handleOpenCharacterDetail}
        onClose={() => {
          setCodexCharacterId(null);
          setCodexArenaId(null);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        arenaEventsEnabled={arenaEventsEnabled}
        onArenaEventsChange={setArenaEventsEnabled}
        skillsEnabled={skillsEnabled}
        onSkillsChange={setSkillsEnabled}
        itemsEnabled={itemsEnabled}
        onItemsChange={setItemsEnabled}
      />

      <footer className="site-footer">
        <span>CLASH OF GODS <i>／</i> DIVINE ARENA</span>
        <span>VERSIÓN · V0.2.93</span>
      </footer>
    </>
  );
};
