import React, { useEffect } from 'react';
import { GODS, ARENAS, ARENA_MYTHOLOGIES } from '../game/config.js';
import { getCodexProfile } from '../game/codex-profiles.js';
import { getCodexConnections, getCodexMyths } from '../game/codex-relations.js';
import { getCodexArenaProfile } from '../game/codex-arenas.js';

interface CodexDetailModalProps {
  characterId: string | null;
  arenaId: string | null;
  favorites: Set<string>;
  arenaFavorites: Set<string>;
  compareIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleArenaFavorite: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onSelectRelatedCharacter: (id: string) => void;
  onClose: () => void;
}

export const CodexDetailModal: React.FC<CodexDetailModalProps> = ({
  characterId,
  arenaId,
  favorites,
  arenaFavorites,
  compareIds,
  onToggleFavorite,
  onToggleArenaFavorite,
  onToggleCompare,
  onSelectRelatedCharacter,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!characterId && !arenaId) return null;

  if (characterId) {
    const g = GODS[characterId];
    if (!g) return null;
    const p = getCodexProfile(characterId);
    const coverage = Math.max(0, Math.min(10, Math.round(g.stats.size / 12.4)));
    const isSaved = favorites.has(characterId);
    const isComparing = compareIds.includes(characterId);
    const links = getCodexConnections(characterId).filter(l => GODS[l.relatedId]);
    const myths = getCodexMyths(characterId);

    const kindLabel = { hero: 'HÉROE', titan: 'TITÁN', monster: 'MONSTRUO' }[g.kind] || 'DIOS';

    const groups: Array<[string, string]> = [
      ['parent', 'GENEALOGÍA Y FAMILIA'],
      ['sibling', 'HERMANOS Y HERMANAS'],
      ['consort', 'PAREJAS Y UNIONES'],
      ['rival', 'RIVALES Y ADVERSARIOS'],
      ['ally', 'ALIADOS Y VÍNCULOS'],
      ['family', 'OTROS VÍNCULOS']
    ];

    const used = new Set<string>();

    return (
      <div className="codex-detail-modal" role="dialog" aria-modal="true" onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
        <div className="codex-detail-panel">
          <div className="codex-detail-toolbar">
            <span className="eyebrow">ARCHIVO MITOLÓGICO / PERFIL DE PERSONAJE</span>
            <button type="button" className="codex-detail-close" aria-label="Cerrar ficha" onClick={onClose}>
              ×
            </button>
          </div>

          <div id="codex-detail-content">
            <div className="codex-detail-hero" style={{ '--god': g.color } as any}>
              <div className="codex-detail-symbol">{g.symbol}</div>
              <div>
                <p className="eyebrow">FICHA DEL CÓDICE / {kindLabel}</p>
                <h2 id="codex-detail-title">{g.name}</h2>
                <p>{g.title}</p>
                <div className="codex-role-tag">{g.role}</div>
              </div>
            </div>

            <p className="codex-detail-intro">{g.description}</p>

            <div className="codex-detail-quick-actions">
              <button
                type="button"
                className="codex-favorite-action"
                aria-pressed={isSaved}
                onClick={() => onToggleFavorite(characterId)}
              >
                {isSaved ? '★ ' : '☆ '}
                <span>{isSaved ? 'GUARDADO EN FAVORITOS' : 'GUARDAR EN FAVORITOS'}</span>
              </button>
              <button
                type="button"
                className="codex-compare-action"
                aria-pressed={isComparing}
                onClick={() => onToggleCompare(characterId)}
              >
                {isComparing ? '✓ ' : '＋ '}
                <span>{isComparing ? 'EN EL COMPARADOR' : 'AGREGAR AL COMPARADOR'}</span>
              </button>
            </div>

            {p ? (
              <div className="codex-detail-section">
                <p className="eyebrow">TRADICIÓN Y MITO</p>
                {p.origin && <p className="codex-detail-origin">{p.origin} · {p.nature || ''}</p>}

                {p.aliases && p.aliases.length > 0 && (
                  <section className="codex-detail-block">
                    <h4>NOMBRES Y EPÍTETOS</h4>
                    <div className="codex-chip-list">
                      {p.aliases.map((a: string, i: number) => <span key={i}>{a}</span>)}
                    </div>
                  </section>
                )}

                {p.domains && p.domains.length > 0 && (
                  <section className="codex-detail-block">
                    <h4>ÁMBITOS ASOCIADOS</h4>
                    <div className="codex-chip-list">
                      {p.domains.map((d: string, i: number) => <span key={i}>{d}</span>)}
                    </div>
                  </section>
                )}

                {p.story && (
                  <section className="codex-detail-block">
                    <h4>RELATO</h4>
                    <p>{p.story}</p>
                  </section>
                )}

                {p.symbols && p.symbols.length > 0 && (
                  <section className="codex-detail-block">
                    <h4>SÍMBOLOS</h4>
                    <div className="codex-chip-list">
                      {p.symbols.map((s: string, i: number) => <span key={i}>{s}</span>)}
                    </div>
                  </section>
                )}

                {p.curiosity && (
                  <section className="codex-detail-block codex-detail-curiosity">
                    <h4>PARA TENER EN CUENTA</h4>
                    <p>{p.curiosity}</p>
                  </section>
                )}
              </div>
            ) : (
              <div className="codex-detail-section codex-detail-pending">
                <p className="eyebrow">TRADICIÓN Y MITO</p>
                <h4>Ficha mitológica por ampliar</h4>
                <p>Esta ficha conserva la identidad y los datos jugables del personaje.</p>
              </div>
            )}

            {/* Relations */}
            <div className="codex-detail-section codex-connections">
              <p className="eyebrow">RED DE RELACIONES</p>
              <p className="codex-detail-origin">
                Conexiones documentadas en tradiciones mitológicas concretas. Tocá "VER FICHA ↗" para navegar.
              </p>
              {groups.map(([type, label]) => {
                const matches = links.filter(l => l.type === type && !used.has(`${l.relatedId}|${l.label}`));
                matches.forEach(l => used.add(`${l.relatedId}|${l.label}`));
                if (!matches.length) return null;

                return (
                  <section key={type} className="codex-detail-block">
                    <h4>{label}</h4>
                    <div className="codex-link-list">
                      {matches.map((link, idx) => {
                        const related = GODS[link.relatedId];
                        return (
                          <article key={idx} className="codex-link-card">
                            <div>
                              <span className="codex-link-type">{link.label}</span>
                              <strong>{related.name}</strong>
                              <p>{link.note}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onSelectRelatedCharacter(related.id)}
                            >
                              VER FICHA ↗
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Myths */}
            {myths && myths.length > 0 && (
              <div className="codex-detail-section codex-related-myths">
                <p className="eyebrow">MITOS Y RELATOS RELACIONADOS</p>
                <div className="codex-myth-grid">
                  {myths.map((myth: any, idx: number) => (
                    <article key={idx} className="codex-myth-card">
                      <span>{myth.tradition}</span>
                      <h4>{myth.title}</h4>
                      <p>{myth.summary}</p>
                      <div className="codex-myth-characters">
                        <small>PERSONAJES VINCULADOS</small>
                        <div className="codex-chip-list">
                          {myth.characters.filter((id: string) => GODS[id] && id !== characterId).map((id: string) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => onSelectRelatedCharacter(id)}
                            >
                              {GODS[id].name} ↗
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Game Profile */}
            <div className="codex-detail-section">
              <p className="eyebrow">PERFIL DE COMBATE · CLASH OF GODS</p>
              <section className="codex-detail-block codex-detail-skill">
                <h4>
                  {g.skill.name} <span>· {g.skill.cooldown} s de recarga</span>
                </h4>
                <p>{g.skill.description}</p>
              </section>
              <div className="codex-detail-stats">
                <div>
                  <span>VELOCIDAD</span>
                  <b>{g.stats.speed}<small>/10</small></b>
                </div>
                <div>
                  <span>COBERTURA</span>
                  <b>{coverage}<small>/10</small></b>
                </div>
                <div>
                  <span>POTENCIA</span>
                  <b>{g.stats.power}<small>/10</small></b>
                </div>
              </div>
              <p className="codex-detail-footnote">
                Las habilidades y estadísticas de esta sección describen al personaje dentro del juego.
              </p>
            </div>
          </div>

          <div className="codex-detail-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>
              CERRAR FICHA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Arena modal
  const a = ARENAS.find(item => item.id === arenaId);
  if (!a) return null;
  const p = getCodexArenaProfile(arenaId) || {};
  const isSaved = arenaFavorites.has(arenaId);
  const myth = (ARENA_MYTHOLOGIES as any)[arenaId] || 'Tradición por clasificar';

  return (
    <div className="codex-detail-modal" role="dialog" aria-modal="true" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="codex-detail-panel">
        <div className="codex-detail-toolbar">
          <span className="eyebrow">ARCHIVO MITOLÓGICO / ARENA DE BATALLA</span>
          <button type="button" className="codex-detail-close" aria-label="Cerrar ficha" onClick={onClose}>
            ×
          </button>
        </div>

        <div id="codex-detail-content">
          <div className="codex-detail-hero codex-arena-detail-hero" style={{ '--god': a.accent || '#e7c777' } as any}>
            <div className="codex-detail-symbol">{p.symbol || '⌂'}</div>
            <div>
              <p className="eyebrow">FICHA DEL CÓDICE / ARENA DE BATALLA</p>
              <h2 id="codex-detail-title">{a.name}</h2>
              <p>{myth} · {p.subtitle || 'Escenario mitológico'}</p>
              <div className="codex-role-tag">ESTILO VISUAL · {a.style}</div>
            </div>
          </div>

          <p className="codex-detail-intro">{p.overview || 'Una arena de Clash of Gods con identidad propia.'}</p>

          <div className="codex-detail-quick-actions">
            <button
              type="button"
              className="codex-favorite-action"
              aria-pressed={isSaved}
              onClick={() => onToggleArenaFavorite(arenaId)}
            >
              {isSaved ? '★ ' : '☆ '}
              <span>{isSaved ? 'GUARDADA EN FAVORITOS' : 'GUARDAR EN FAVORITOS'}</span>
            </button>
          </div>

          <div className="codex-detail-section">
            <p className="eyebrow">ORIGEN E IDENTIDAD</p>
            <section className="codex-detail-block">
              <h4>CONTEXTO MITOLÓGICO</h4>
              <p>{p.lore || p.overview || 'Contenido descriptivo.'}</p>
            </section>
            {p.features && (
              <section className="codex-detail-block">
                <h4>ELEMENTOS DISTINTIVOS</h4>
                <div className="codex-chip-list">
                  {p.features.map((f: string, i: number) => <span key={i}>{f}</span>)}
                </div>
              </section>
            )}
          </div>

          <div className="codex-detail-section">
            <p className="eyebrow">LA ARENA EN EL JUEGO</p>
            <section className="codex-detail-block">
              <h4>IDENTIDAD VISUAL Y COMBATE</h4>
              <p>{p.combat || 'Los fenómenos dependen de las reglas activas de la partida.'}</p>
              <div className="codex-arena-swatches">
                <span><i style={{ background: a.bg }}></i>FONDO</span>
                <span><i style={{ background: a.field }}></i>CAMPO</span>
                <span><i style={{ background: a.accent }}></i>ACENTO</span>
              </div>
            </section>
          </div>

          <div className="codex-detail-section">
            <p className="eyebrow">ARCHIVO DE DESCUBRIMIENTOS</p>
            <section className="codex-detail-block">
              <h4>QUÉ PODÉS DESCUBRIR</h4>
              <div className="codex-chip-list">
                {(p.discoveries || []).map((d: string, i: number) => <span key={i}>{d}</span>)}
              </div>
              <p>{p.note || 'La ficha distingue la inspiración mitológica de las mecánicas implementadas.'}</p>
            </section>
          </div>
        </div>

        <div className="codex-detail-actions">
          <button type="button" className="button button-quiet" onClick={onClose}>
            CERRAR FICHA
          </button>
        </div>
      </div>
    </div>
  );
};
