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
- **Móvil/Tablet**: Arrastre táctil en tu lado de la cancha o botones virtuales en pantalla.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run lint
```
