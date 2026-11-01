# Clash of Gods: Divine Arena (React)

Duelos arcade de mitología en formato Pong competitivo construidos con React, TypeScript, HTML5 Canvas y Vite.

## Características

- **124 Personajes**: Dioses, héroes, titanes y monstruos de múltiples panteones (griego, nórdico, egipcio, japonés, hindú, celta, azteca, mesopotámico, yoruba, entre otros), cada uno con atributos propios (velocidad, cobertura, potencia), habilidades únicas activables y tiempos de recarga.
- **17 Arenas Mitológicas**: Escenarios detallados con arte procedural, paletas de colores exclusivas, identidades culturales y eventos ambientales interactivos.
- **Modos de Juego**:
  - **Clásico**: Combate libre configurable (1P vs CPU o 2P local), filtros de elenco (solo dioses, héroes vs dioses, titanes vs monstruos, etc.), selección de arena, puntos para ganar y dificultad de la IA.
  - **Crónicas Mitológicas**: Escenarios históricos legendarios (La guerra del Olimpo, El presagio del Ragnarök, La disputa por el trono, La liberación de las aguas, Desafío de Jefe Jörmungandr, Desafío de Jefe Tifón) con eventos dinámicos por fases.
  - **Mutación**: Reglas alteradas con la Cancha Mutante, progresión de corrupción del 0 al 100%, avatares de corrupción, vacunas curativas y selección de colores Gamma personalizados.
  - **Supervivencia**: Desafío arcade de 15 rivales consecutivos y un jefe final reforzado con 3 vidas y sistema de guardado/reanudación en el navegador.
- **Códice Mitológico y Enciclopedia**:
  - Catálogo interactivo de personajes y arenas.
  - Fichas completas con relatos tradicionales, nombres alternativos, ámbitos, símbolos, genealogía y mitos cruzados.
  - Comparador de personajes de hasta 3 figuras en simultáneo.
  - Sistema de favoritos y seguimiento de lectura.
- **Motor Gráfico y Sonido**:
  - Simulación de física de pelota con efectos de efecto/curva, rebotes elásticos y multibola.
  - Efectos visuales de impacto, partículas, estelas mutantes y distorsiones.
  - Sintetizador de audio procedural basado en la API Web Audio.
  - Controles táctiles integrados para dispositivos móviles y atajos de teclado para escritorio.

## Controles
- **Jugador 1**: `W` / `S` para mover la paleta · `Espacio` para activar habilidad.
- **Jugador 2**: `↑` / `↓` para mover la paleta · `Enter` para activar habilidad.
- **Pausa**: `Esc` o botón `PAUSA`.
- **Móvil / Tablet (Gestos Naturales v0.2.94)**:
  - Arrastre táctil vertical directo en la pantalla para mover la paleta con precisión 1:1.
  - Doble toque rápido para disparar la habilidad divina al instante.
  - Gesto de barrido horizontal (*swipe/flick*) rápido para invocar el poder.
  - Toque con dos dedos simultáneos como atajo táctil adicional.
  - Toque directo sobre el indicador de habilidad lateral en el flanco de la arena.

## Historial de Versiones y Auditoría de Funciones

### Versión 0.2.96 (Sincronización Centralizada de Versión y Auditoría de UI)
- **Centralización de la Fuente de Verdad (`src/version.ts`)**:
  - Creación del módulo central de versión `APP_VERSION = '0.2.96'`, `APP_VERSION_LABEL = 'V0.2.96'` y `APP_CODENAME = 'Divine Arena Cloud Edition'`.
  - Se erradican las versiones quemadas en texto plano en componentes individuales para prevenir desincronizaciones en futuras auditorías.
- **Sincronización Exhaustiva de la Interfaz**:
  - `src/App.tsx`: Actualizado el pie de página del sistema (`.site-footer`) para enlazar directamente con `APP_VERSION_LABEL`, resolviendo la etiqueta obsoleta que mostraba `V0.2.93`.
  - `src/components/TopBar.tsx`: Indicador de arena y versión vinculado a `APP_VERSION_LABEL` (`DIVINE ARENA • V0.2.96`).
  - `src/components/SettingsModal.tsx`: Visualización de versión tanto en el encabezado (`.eyebrow`) como en el pie de auditoría del panel de ajustes.
  - `package.json`: Versión actualizada a `0.2.96`.
- **Verificación de Encabezado y Botones**:
  - Botón de ajustes (`gear-button`) estilizado con icono SVG vectorial integrado, libre de colisiones tipográficas.
  - Botones de sonido y pantalla completa adaptados a modos desktop y móvil con selectores de vista activa.

### Versión 0.2.95 (Arquitectura Cloud SQL PostgreSQL y Optimización de Carga Ligera)
- **Aprovisionamiento de Base de Datos Cloud SQL en us-east1**:
  - Instancia `ai-studio-946859f1` de PostgreSQL Developer Edition aprovisionada en la región `us-east1` con escalado a cero y conexión mediante Cloud SQL Auth Proxy.
  - Configuración de Firebase Authentication y Google OAuth (`set_up_oauth`) vinculada para autenticación de usuarios.
- **Definición de Esquema Relacional con Drizzle ORM**:
  - `characters`: 124 personajes mitológicos estructurados con estadísticas de combate, rol, habilidades, mitología, epítetos, relatos, curiosidades y vínculos mitológicos.
  - `arenas`: 17 arenas mitológicas con estilos visuales, mecánicas ambientales, peligro y lore ancestral.
  - `users`: Sincronización de perfiles vinculados con el UID de Firebase Auth.
  - `user_favorites`: Persistencia relacional de favoritos por usuario.
- **Backend Full-Stack y Aligeramiento de la Aplicación**:
  - Servidor Express en `server.ts` con Vite montado en middleware para desarrollo y servicio estático optimizado para producción.
  - Endpoints REST `/api/characters`, `/api/characters/:id`, `/api/arenas`, `/api/arenas/:id`, `/api/favorites`, y `/api/favorites/toggle`.
  - Carga diferida bajo demanda (*lazy loading*) y caché en memoria en `src/services/api.ts`, aligerando drásticamente el peso inicial de JavaScript en el cliente móvil y desktop.
  - Siembra automatizada e idempotente (`seedDatabaseIfEmpty`) para poblar la base de datos sin comandos manuales.

### Versión 0.2.94 (Auditoría de Interfaz, Gestos y Flancos de Habilidad)
- **Corrección de Encabezado (TopBar)**:
  - Se eliminó el texto desbordado `AJUSTES` que colisionaba con el botón cuadrado de 42×42 px mostrado en la captura de pantalla del usuario.
  - Se implementó un icono SVG de engranaje nítido e integrado que conserva accesibilidad, atributos `aria-label="Abrir ajustes"` y `title="Ajustes"`.
- **Adaptación Responsiva Móvil y Tablet**:
  - Corrección de la relación de aspecto y altura dinámica en dispositivos móviles (`100dvh`), evitando que la pantalla de juego se desplace o pierda componentes esenciales.
  - Manejo de aviso de rotación horizontal (`.landscape-hint`) y clases dinámicas en `document.body` (`game-playing`, `survival-mode`, selectores de mitos).
- **Sustitución de Botones Virtuales por Sistema de Gestos Naturales**:
  - Eliminación de los botones superpuestos tradicionales (`▲`, `▼`, `PODER`).
  - Implementación del subsistema de gestos táctiles directos en `ScreenGame.tsx` y `engine.ts`:
    - Seguimiento de arrastre vertical reactivo (`touchDragDelta`) para control 1:1 de la paleta sin latencia.
    - Detección de doble toque (<320 ms) para desatar la habilidad especial.
    - Detección de barrido horizontal veloz (*swipe*) para activar poder.
    - Detección multi-touch (dos dedos simultáneos) para lanzar habilidad.
- **Reubicación de Habilidades en los Flancos Laterales de la Cancha**:
  - Se retiraron los medidores de habilidad de la barra inferior (donde no eran visibles durante el combate).
  - Se reubicaron en los costados medios izquierdo (Jugador 1) y derecho (Jugador 2/CPU) de la arena (`.lateral-skill-p1`, `.lateral-skill-p2`).
  - Cada flanco cuenta con:
    - Indicador radial circular animado mediante SVG (`strokeDashoffset`).
    - Símbolo característico de la deidad seleccionada.
    - Nombre de la habilidad y estado en vivo (`LISTA` o cuenta regresiva fraccional `3.4s`).
    - Animaciones de pulso y resplandor al estar lista (`p1-ready-pulse`, `p2-ready-pulse`).
    - Función de toque/clic directo sobre el indicador para activar la habilidad sin requerir teclado.

### Versión 0.2.93
- Migración y refactorización completa a React 19 + TypeScript + Vite.
- Preservación de 124 personajes, 17 arenas procedurales, 4 modos de juego y síntesis de audio Web Audio.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run lint
```

