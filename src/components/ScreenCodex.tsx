import React, { useState, useMemo, useEffect } from 'react';
import { GODS, ARENAS, ARENA_MYTHOLOGIES } from '../game/config.js';
import { getCodexProfile } from '../game/codex-profiles.js';
import { getCodexArenaProfile } from '../game/codex-arenas.js';
import { fetchCharacters, fetchArenas } from '../services/api.ts';

interface ScreenCodexProps {
  onBack: () => void;
  onOpenCharacterDetail: (id: string) => void;
  onOpenArenaDetail: (id: string) => void;
  favorites: Set<string>;
  arenaFavorites: Set<string>;
  compareIds: string[];
  readProgress: Set<string>;
  arenaReadProgress: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleArenaFavorite: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onRemoveCompare: (id: string) => void;
  onClearCompare: () => void;
  onResetReadProgress: () => void;
  onResetArenaReadProgress: () => void;
}

export const ScreenCodex: React.FC<ScreenCodexProps> = ({
  onBack,
  onOpenCharacterDetail,
  onOpenArenaDetail,
  favorites,
  arenaFavorites,
  compareIds,
  readProgress,
  arenaReadProgress,
  onToggleFavorite,
  onToggleArenaFavorite,
  onToggleCompare,
  onRemoveCompare,
  onClearCompare,
  onResetReadProgress,
  onResetArenaReadProgress
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'arenas'>('characters');
  const [selectedKind, setSelectedKind] = useState<string | null>(null); // 'god' | 'hero' | 'titan' | 'monster' | null (null shows category picker)
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOption, setSortOption] = useState<'name' | 'power' | 'speed'>('name');

  const [favoritesPanelOpen, setFavoritesPanelOpen] = useState(false);
  const [comparePanelOpen, setComparePanelOpen] = useState(compareIds.length > 0);
  const [arenaFavoritesOpen, setArenaFavoritesOpen] = useState(false);

  useEffect(() => {
    fetchCharacters().catch(() => {});
    fetchArenas().catch(() => {});
  }, []);

  const kindLabel = (g: any) => {
    const KIND_LABEL: Record<string, string> = { hero: 'HÉROE', titan: 'TITÁN', monster: 'MONSTRUO' };
    return KIND_LABEL[g.kind] || 'DIOS';
  };

  const countCodexKind = (kind: string) =>
    Object.values(GODS).filter((g: any) => (kind === 'god' ? (!g.kind || g.kind === 'god') : g.kind === kind)).length;

  const characterRoles = useMemo(() => {
    if (!selectedKind) return [];
    const match = (g: any) => (selectedKind === 'god' ? (!g.kind || g.kind === 'god') : g.kind === selectedKind);
    return [...new Set(Object.values(GODS).filter(match).map((g: any) => g.role).filter(Boolean))].sort((a: any, b: any) =>
      a.localeCompare(b, 'es')
    );
  }, [selectedKind]);

  const arenaMythologies = useMemo(() => {
    return [...new Set(ARENAS.map(a => (ARENA_MYTHOLOGIES as any)[a.id] || 'Mitología por clasificar'))].sort((a, b) =>
      a.localeCompare(b, 'es')
    );
  }, []);

  const filteredCharacters = useMemo(() => {
    if (activeTab !== 'characters' || !selectedKind) return [];
    const q = searchQuery.trim().toLowerCase();
    const match = (g: any) => (selectedKind === 'god' ? (!g.kind || g.kind === 'god') : g.kind === selectedKind);

    let entries = Object.values(GODS).filter(
      (g: any) => match(g) && (roleFilter === 'all' || g.role === roleFilter)
    );

    if (q) {
      entries = entries.filter((g: any) => {
        const text = [
          g.name,
          g.title,
          g.role,
          g.description,
          g.skill?.name,
          g.skill?.description,
          ...Object.values(getCodexProfile(g.id) || {}).flat()
        ].join(' ').toLowerCase();
        return text.includes(q);
      });
    }

    entries.sort((a: any, b: any) => {
      if (sortOption === 'power') return (b.stats.power - a.stats.power) || a.name.localeCompare(b.name, 'es');
      if (sortOption === 'speed') return (b.stats.speed - a.stats.speed) || a.name.localeCompare(b.name, 'es');
      return a.name.localeCompare(b.name, 'es');
    });

    return entries;
  }, [activeTab, selectedKind, searchQuery, roleFilter, sortOption]);

  const filteredArenas = useMemo(() => {
    if (activeTab !== 'arenas') return [];
    const q = searchQuery.trim().toLowerCase();

    let entries = ARENAS.filter(a => {
      const myth = (ARENA_MYTHOLOGIES as any)[a.id] || 'Mitología por clasificar';
      return roleFilter === 'all' || myth === roleFilter;
    });

    if (q) {
      entries = entries.filter(a => {
        const p = getCodexArenaProfile(a.id) || {};
        const myth = (ARENA_MYTHOLOGIES as any)[a.id] || '';
        const text = [a.name, myth, a.style, p.subtitle, p.overview, p.lore, ...(p.features || []), ...(p.discoveries || [])].join(' ').toLowerCase();
        return text.includes(q);
      });
    }

    entries.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return entries;
  }, [activeTab, searchQuery, roleFilter]);

  const handleRandomCharacter = () => {
    const list = Object.values(GODS) as any[];
    const pick = list[Math.floor(Math.random() * list.length)];
    onOpenCharacterDetail(pick.id);
  };

  const handleRandomArena = () => {
    const pick = ARENAS[Math.floor(Math.random() * ARENAS.length)];
    onOpenArenaDetail(pick.id);
  };

  const totalCharacters = Object.keys(GODS).length;
  const totalArenas = ARENAS.length;

  return (
    <section id="screen-codex" className="screen active codex-screen" aria-hidden="false">
      <div className="section-head codex-page-head">
        <div>
          <p className="eyebrow">ARCHIVO DE COMBATE / ENCICLOPEDIA</p>
          <h2>EL CÓDICE DE <em>CLASH OF GODS</em></h2>
          <p className="muted">
            Explorá personajes y arenas: sus relatos, identidades, símbolos y fenómenos de combate.
          </p>
        </div>
        <button className="button button-quiet" onClick={onBack}>
          ← VOLVER
        </button>
      </div>

      <nav className="codex-main-tabs" aria-label="Secciones principales del Códice" role="tablist">
        <button
          type="button"
          className={`codex-main-tab ${activeTab === 'characters' ? 'is-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'characters'}
          onClick={() => {
            setActiveTab('characters');
            setSelectedKind(null);
            setRoleFilter('all');
            setSearchQuery('');
          }}
        >
          <span className="codex-main-tab-icon" aria-hidden="true">⚔</span>
          <span>
            <strong>PERSONAJES</strong>
            <small>Dioses, héroes, titanes y monstruos</small>
          </span>
          <b>{totalCharacters}</b>
        </button>

        <button
          type="button"
          className={`codex-main-tab ${activeTab === 'arenas' ? 'is-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'arenas'}
          onClick={() => {
            setActiveTab('arenas');
            setSelectedKind(null);
            setRoleFilter('all');
            setSearchQuery('');
          }}
        >
          <span className="codex-main-tab-icon" aria-hidden="true">⌂</span>
          <span>
            <strong>ARENAS DE BATALLA</strong>
            <small>Escenarios, mitología y fenómenos</small>
          </span>
          <b>{totalArenas}</b>
        </button>
      </nav>

      <div className="codex-overview">
        <div>
          <span className="codex-overview-number">
            {activeTab === 'characters' ? totalCharacters : totalArenas}
          </span>
          <span className="codex-overview-label">REGISTROS</span>
        </div>
        <div className="codex-progress-copy">
          <p>
            {activeTab === 'characters'
              ? 'Explorá el elenco y sus perfiles, poderes, dominios y relaciones mitológicas.'
              : 'Explorá cada escenario, su contexto mitológico, sus elementos distintivos y su identidad dentro del combate.'}
          </p>
          <div className="codex-progress-line">
            <span>
              {activeTab === 'characters'
                ? `PERSONAJES LEÍDOS · ${readProgress.size}/${totalCharacters}`
                : `ARENAS EXPLORADAS · ${arenaReadProgress.size}/${totalArenas}`}
            </span>
            <i>
              <u
                style={{
                  width: `${
                    activeTab === 'characters'
                      ? (readProgress.size / Math.max(1, totalCharacters)) * 100
                      : (arenaReadProgress.size / Math.max(1, totalArenas)) * 100
                  }%`
                }}
              ></u>
            </i>
          </div>
        </div>
      </div>

      {/* Characters Category Picker */}
      {activeTab === 'characters' && !selectedKind && (
        <div id="codex-picker" className="codex-picker">
          <button
            className="codex-choice codex-choice-gods"
            onClick={() => { setSelectedKind('god'); setRoleFilter('all'); }}
          >
            <span className="codex-choice-index">01</span>
            <span className="god-symbol">☼</span>
            <strong>DIOSES</strong>
            <small><b>{countCodexKind('god')}</b> personajes · poderes y dominios</small>
            <span className="codex-choice-cta">EXPLORAR CATEGORÍA ↗</span>
          </button>

          <button
            className="codex-choice codex-choice-heroes"
            onClick={() => { setSelectedKind('hero'); setRoleFilter('all'); }}
          >
            <span className="codex-choice-index">02</span>
            <span className="god-symbol">⚔</span>
            <strong>HÉROES</strong>
            <small><b>{countCodexKind('hero')}</b> personajes · hazañas y destreza</small>
            <span className="codex-choice-cta">EXPLORAR CATEGORÍA ↗</span>
          </button>

          <button
            className="codex-choice codex-choice-titans"
            onClick={() => { setSelectedKind('titan'); setRoleFilter('all'); }}
          >
            <span className="codex-choice-index">03</span>
            <span className="god-symbol">♧</span>
            <strong>TITANES</strong>
            <small><b>{countCodexKind('titan')}</b> personajes · fuerzas primordiales</small>
            <span className="codex-choice-cta">EXPLORAR CATEGORÍA ↗</span>
          </button>

          <button
            className="codex-choice codex-choice-monsters"
            onClick={() => { setSelectedKind('monster'); setRoleFilter('all'); }}
          >
            <span className="codex-choice-index">04</span>
            <span className="god-symbol">☠</span>
            <strong>MONSTRUOS</strong>
            <small><b>{countCodexKind('monster')}</b> personajes · criaturas y amenazas</small>
            <span className="codex-choice-cta">EXPLORAR CATEGORÍA ↗</span>
          </button>
        </div>
      )}

      {/* Characters browser */}
      {activeTab === 'characters' && selectedKind && (
        <div className="codex-browser">
          <div className="codex-subhead">
            <button className="button button-quiet" onClick={() => setSelectedKind(null)}>
              ← CATEGORÍAS
            </button>
            <div>
              <p className="eyebrow">ESTÁS EXPLORANDO</p>
              <h3>
                {selectedKind === 'god' ? 'DIOSES' : selectedKind === 'hero' ? 'HÉROES' : selectedKind === 'titan' ? 'TITANES' : 'MONSTRUOS'}
              </h3>
            </div>
            <span className="codex-category-count">
              {filteredCharacters.length} REGISTROS
            </span>
          </div>

          <div className="codex-toolbar">
            <label className="codex-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Buscar por nombre, dominio o habilidad…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <label className="codex-filter-label">
              ROL{' '}
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Todos los roles</option>
                {characterRoles.map((r: string) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="codex-filter-label">
              ORDEN{' '}
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value as any)}>
                <option value="name">Nombre A–Z</option>
                <option value="power">Mayor potencia</option>
                <option value="speed">Mayor velocidad</option>
              </select>
            </label>
          </div>

          <p className="codex-results-note">
            Los resultados se actualizan al escribir o cambiar los filtros. Usá ☆ para guardar favoritos y ＋ para comparar.
          </p>

          <div className="codex-grid">
            {filteredCharacters.map((g: any, index: number) => {
              const isSaved = favorites.has(g.id);
              const isComparing = compareIds.includes(g.id);
              return (
                <article key={g.id} className="codex-card" style={{ '--god': g.color } as any}>
                  <div className="codex-card-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="codex-top">
                    <span className="god-symbol">{g.symbol}</span>
                    <div>
                      <h3>{g.name}</h3>
                      <small>{kindLabel(g)} <span aria-hidden="true">/</span> {g.title}</small>
                    </div>
                  </div>
                  <div className="codex-role-tag">{g.role}</div>
                  <p className="codex-description">{g.description}</p>
                  <div className="ability">
                    <b>{g.skill.name.toUpperCase()} <span>· {g.skill.cooldown} S</span></b>
                    <p>{g.skill.description}</p>
                  </div>
                  <div className="codex-stats">
                    <div>
                      <span>VELOCIDAD</span>
                      <b>{g.stats.speed}<small>/10</small></b>
                      <i><u style={{ width: `${Math.max(0, Math.min(100, g.stats.speed * 10))}%` }}></u></i>
                    </div>
                    <div>
                      <span>COBERTURA</span>
                      <b>{Math.round(g.stats.size / 12.4)}<small>/10</small></b>
                      <i><u style={{ width: `${Math.max(0, Math.min(100, (g.stats.size / 12.4) * 10))}%` }}></u></i>
                    </div>
                    <div>
                      <span>POTENCIA</span>
                      <b>{g.stats.power}<small>/10</small></b>
                      <i><u style={{ width: `${Math.max(0, Math.min(100, g.stats.power * 10))}%` }}></u></i>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="codex-detail-trigger"
                    onClick={() => onOpenCharacterDetail(g.id)}
                  >
                    EXPLORAR FICHA <span aria-hidden="true">↗</span>
                  </button>
                  <div className="codex-card-tools">
                    <button
                      type="button"
                      className="codex-favorite-action"
                      aria-pressed={isSaved}
                      onClick={() => onToggleFavorite(g.id)}
                    >
                      {isSaved ? '★' : '☆'} <span>{isSaved ? 'GUARDADO' : 'GUARDAR'}</span>
                    </button>
                    <button
                      type="button"
                      className="codex-compare-action"
                      aria-pressed={isComparing}
                      onClick={() => onToggleCompare(g.id)}
                    >
                      {isComparing ? '✓' : '＋'} <span>{isComparing ? 'AGREGADO' : 'COMPARAR'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredCharacters.length === 0 && (
            <div className="codex-empty">
              <span>⌕</span>
              <strong>No encontramos personajes</strong>
              <p>Probá con otro nombre o cambiá los filtros.</p>
              <button
                className="button button-quiet"
                onClick={() => { setSearchQuery(''); setRoleFilter('all'); }}
              >
                LIMPIAR FILTROS
              </button>
            </div>
          )}
        </div>
      )}

      {/* Arenas browser */}
      {activeTab === 'arenas' && (
        <div className="codex-browser">
          <div className="codex-subhead">
            <div>
              <p className="eyebrow">ESTÁS EXPLORANDO</p>
              <h3>ARENAS DE BATALLA</h3>
            </div>
            <span className="codex-category-count">
              {filteredArenas.length} REGISTROS
            </span>
          </div>

          <div className="codex-toolbar">
            <label className="codex-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Buscar arena, mitología o fenómeno…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <label className="codex-filter-label">
              TRADICIÓN{' '}
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Todas las tradiciones</option>
                {arenaMythologies.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="codex-grid">
            {filteredArenas.map((a: any, index: number) => {
              const p = getCodexArenaProfile(a.id) || {};
              const isSaved = arenaFavorites.has(a.id);
              const isRead = arenaReadProgress.has(a.id);
              const myth = (ARENA_MYTHOLOGIES as any)[a.id] || 'Tradición por clasificar';

              return (
                <article
                  key={a.id}
                  className="codex-card codex-arena-card"
                  style={{ '--god': a.accent || '#e7c777' } as any}
                >
                  <div className="codex-card-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="codex-top">
                    <span className="god-symbol codex-arena-symbol">{p.symbol || '⌂'}</span>
                    <div>
                      <h3>{a.name}</h3>
                      <small>{myth}</small>
                    </div>
                  </div>
                  <div className="codex-role-tag">{p.subtitle || 'Arena mitológica'}</div>
                  <p className="codex-description">{p.overview || 'Explorá la identidad y las particularidades de este escenario.'}</p>
                  <div className="codex-arena-tags">
                    {(p.features || []).slice(0, 3).map((f: string, idx: number) => (
                      <span key={idx}>{f}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="codex-detail-trigger"
                    onClick={() => onOpenArenaDetail(a.id)}
                  >
                    EXPLORAR FICHA <span aria-hidden="true">↗</span>
                  </button>
                  <div className="codex-card-tools">
                    <button
                      type="button"
                      className="codex-favorite-action"
                      aria-pressed={isSaved}
                      onClick={() => onToggleArenaFavorite(a.id)}
                    >
                      {isSaved ? '★' : '☆'} <span>{isSaved ? 'GUARDADA' : 'GUARDAR'}</span>
                    </button>
                    <span className="codex-arena-read-state">
                      {isRead ? '✓ YA EXPLORADA' : '○ SIN EXPLORAR'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Extra Tools: Characters */}
      {activeTab === 'characters' && (
        <div className="codex-extra-tools">
          <div className="codex-tools-intro">
            <p className="eyebrow">HERRAMIENTAS COMPLEMENTARIAS</p>
            <h3>Tu archivo personal</h3>
            <p>Reuní tus figuras preferidas o compará sus perfiles de combate.</p>
          </div>
          <div className="codex-tools-actions">
            <button type="button" className="button button-quiet" onClick={handleRandomCharacter}>
              ✦ DESCUBRIR PERSONAJE
            </button>
            <button
              type="button"
              className={`button button-quiet ${favoritesPanelOpen ? 'is-active' : ''}`}
              onClick={() => setFavoritesPanelOpen(!favoritesPanelOpen)}
            >
              {favoritesPanelOpen ? '★ OCULTAR FAVORITOS' : '☆ MIS FAVORITOS'} <span>{favorites.size}</span>
            </button>
            <button
              type="button"
              className={`button button-quiet ${comparePanelOpen ? 'is-active' : ''}`}
              onClick={() => setComparePanelOpen(!comparePanelOpen)}
            >
              ⇄ COMPARAR PERSONAJES <span>{compareIds.length}/3</span>
            </button>
            <button type="button" className="button button-quiet" onClick={onResetReadProgress}>
              REINICIAR PROGRESO
            </button>
          </div>
        </div>
      )}

      {/* Extra Tools: Arenas */}
      {activeTab === 'arenas' && (
        <div className="codex-extra-tools">
          <div className="codex-tools-intro">
            <p className="eyebrow">EXPLORACIÓN DE ESCENARIOS</p>
            <h3>Tu archivo de arenas</h3>
            <p>Guardá escenarios favoritos y consultá cuáles ya exploraste.</p>
          </div>
          <div className="codex-tools-actions">
            <button type="button" className="button button-quiet" onClick={handleRandomArena}>
              ✦ DESCUBRIR ARENA
            </button>
            <button
              type="button"
              className={`button button-quiet ${arenaFavoritesOpen ? 'is-active' : ''}`}
              onClick={() => setArenaFavoritesOpen(!arenaFavoritesOpen)}
            >
              {arenaFavoritesOpen ? '★ OCULTAR FAVORITAS' : '☆ MIS ARENAS FAVORITAS'} <span>{arenaFavorites.size}</span>
            </button>
            <button type="button" className="button button-quiet" onClick={onResetArenaReadProgress}>
              REINICIAR EXPLORACIÓN
            </button>
          </div>
        </div>
      )}

      {/* Favorites Panel */}
      {favoritesPanelOpen && activeTab === 'characters' && (
        <section className="codex-library-panel" aria-label="Mis personajes favoritos">
          <div className="codex-library-heading">
            <div>
              <p className="eyebrow">COLECCIÓN PERSONAL</p>
              <h3>MIS FAVORITOS <span>{favorites.size}</span></h3>
              <p>Las fichas que guardaste quedan reunidas acá.</p>
            </div>
            <button type="button" className="button button-quiet" onClick={() => setFavoritesPanelOpen(false)}>
              CERRAR
            </button>
          </div>
          <div className="codex-grid codex-favorites-grid">
            {[...favorites].map(id => {
              const g = GODS[id];
              if (!g) return null;
              return (
                <article key={id} className="codex-card" style={{ '--god': g.color } as any}>
                  <div className="codex-top">
                    <span className="god-symbol">{g.symbol}</span>
                    <div>
                      <h3>{g.name}</h3>
                      <small>{kindLabel(g)} · {g.role}</small>
                    </div>
                  </div>
                  <p className="codex-description">{g.description}</p>
                  <button
                    type="button"
                    className="codex-detail-trigger"
                    onClick={() => onOpenCharacterDetail(g.id)}
                  >
                    EXPLORAR FICHA ↗
                  </button>
                  <div className="codex-card-tools">
                    <button
                      type="button"
                      className="codex-favorite-action"
                      onClick={() => onToggleFavorite(g.id)}
                    >
                      ★ <span>QUITAR</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {favorites.size === 0 && (
            <div className="codex-compare-empty">
              <span>☆</span>
              <strong>Todavía no guardaste personajes</strong>
              <p>Explorá una ficha y tocá «Guardar en favoritos».</p>
            </div>
          )}
        </section>
      )}

      {/* Compare Panel */}
      {comparePanelOpen && activeTab === 'characters' && (
        <section className="codex-library-panel codex-compare-panel" aria-label="Comparador de personajes">
          <div className="codex-library-heading">
            <div>
              <p className="eyebrow">HERRAMIENTA DE ANÁLISIS</p>
              <h3>COMPARADOR DE PERSONAJES <span>{compareIds.length}/3</span></h3>
              <p>Elegí hasta tres fichas. Compará sus atributos de combate.</p>
            </div>
            <div className="codex-compare-heading-actions">
              <button type="button" className="button button-quiet" onClick={onClearCompare}>
                LIMPIAR SELECCIÓN
              </button>
              <button type="button" className="button button-quiet" onClick={() => setComparePanelOpen(false)}>
                CERRAR
              </button>
            </div>
          </div>

          <div className="codex-compare-content">
            {compareIds.length === 0 ? (
              <div className="codex-compare-empty">
                <span>⇄</span>
                <strong>Todavía no hay personajes para comparar</strong>
                <p>Tocá <b>＋ COMPARAR</b> en cada personaje. Podés elegir hasta tres.</p>
              </div>
            ) : (
              <div className="codex-compare-cards" style={{ '--compare-count': compareIds.length } as any}>
                {compareIds.map(id => {
                  const g = GODS[id];
                  if (!g) return null;
                  const cov = Math.round(g.stats.size / 12.4);
                  return (
                    <article key={id} className="codex-compare-card" style={{ '--god': g.color } as any}>
                      <div className="codex-compare-card-top">
                        <span className="codex-compare-symbol">{g.symbol}</span>
                        <div className="codex-compare-identity">
                          <p>{kindLabel(g)}</p>
                          <h4>{g.name}</h4>
                          <span>{g.title}</span>
                        </div>
                        <button
                          type="button"
                          className="codex-compare-remove"
                          onClick={() => onRemoveCompare(id)}
                          aria-label={`Quitar ${g.name}`}
                        >
                          ×
                        </button>
                      </div>
                      <span className="codex-role-tag">{g.role}</span>
                      <div className="codex-compare-stats">
                        <div className="codex-compare-stat">
                          <div><span>VELOCIDAD</span><strong>{g.stats.speed}<small>/10</small></strong></div>
                          <i><u style={{ width: `${Math.min(100, g.stats.speed * 10)}%` }}></u></i>
                        </div>
                        <div className="codex-compare-stat">
                          <div><span>COBERTURA</span><strong>{cov}<small>/10</small></strong></div>
                          <i><u style={{ width: `${Math.min(100, cov * 10)}%` }}></u></i>
                        </div>
                        <div className="codex-compare-stat">
                          <div><span>POTENCIA</span><strong>{g.stats.power}<small>/10</small></strong></div>
                          <i><u style={{ width: `${Math.min(100, g.stats.power * 10)}%` }}></u></i>
                        </div>
                      </div>
                      <div className="codex-compare-skill">
                        <span>HABILIDAD ESPECIAL</span>
                        <strong>{g.skill.name}</strong>
                        <p>{g.skill.description}</p>
                      </div>
                      <button
                        type="button"
                        className="codex-detail-trigger"
                        onClick={() => onOpenCharacterDetail(g.id)}
                      >
                        ABRIR FICHA DEL CÓDICE <span>↗</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Arena Favorites Panel */}
      {arenaFavoritesOpen && activeTab === 'arenas' && (
        <section className="codex-library-panel" aria-label="Mis arenas favoritas">
          <div className="codex-library-heading">
            <div>
              <p className="eyebrow">COLECCIÓN PERSONAL</p>
              <h3>MIS ARENAS FAVORITAS <span>{arenaFavorites.size}</span></h3>
              <p>Escenarios guardados reunidos en un solo lugar.</p>
            </div>
            <button type="button" className="button button-quiet" onClick={() => setArenaFavoritesOpen(false)}>
              CERRAR
            </button>
          </div>
          <div className="codex-grid codex-favorites-grid">
            {[...arenaFavorites].map(id => {
              const a = ARENAS.find(item => item.id === id);
              if (!a) return null;
              const p = getCodexArenaProfile(id) || {};
              const myth = (ARENA_MYTHOLOGIES as any)[id] || '';
              return (
                <article key={id} className="codex-card codex-arena-card" style={{ '--god': a.accent || '#e7c777' } as any}>
                  <div className="codex-top">
                    <span className="god-symbol codex-arena-symbol">{p.symbol || '⌂'}</span>
                    <div>
                      <h3>{a.name}</h3>
                      <small>{myth}</small>
                    </div>
                  </div>
                  <p className="codex-description">{p.overview}</p>
                  <button
                    type="button"
                    className="codex-detail-trigger"
                    onClick={() => onOpenArenaDetail(id)}
                  >
                    EXPLORAR FICHA ↗
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
};
