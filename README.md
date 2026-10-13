# Clash of Gods — Divine Arena V0.2.26

Juego arcade de ping-pong mitológico en HTML, CSS y JavaScript nativos. Incluye 90 personajes, 35 arenas, CPU y multijugador local. No requiere compilación ni frameworks; todos los archivos del proyecto están en la raíz.

## Elenco

- 30 dioses.
- 30 héroes.
- 15 titanes.
- 15 monstruos.

## Modos de elenco

- Solo dioses.
- Solo héroes.
- Héroes vs. dioses.
- Solo titanes.
- Solo monstruos.
- Titanes vs. monstruos.

En Titanes vs. monstruos, el jugador 1 selecciona un titán y el jugador 2 un monstruo. El modo funciona con CPU o multijugador local.

## Códice y arenas

El códice empieza por una pantalla de cuatro categorías: dioses, héroes, titanes y monstruos. Cada sección contiene las fichas de su categoría.

Hay 35 arenas en total: se conservan las 30 originales y se agregan cinco arenas temáticas de Titanomaquia, Hidra, Kraken, Minotauro y Fenrir. Las arenas se pueden elegir con cualquier categoría de personajes.

## Power-ups de arena

Hay 25 potenciadores que aparecen aleatoriamente durante la partida. Pueden coexistir hasta cinco objetos normales y, mientras haya espacio, aparece uno nuevo aproximadamente cada 2–3 segundos. La pelota recoge el objeto y el último jugador que la golpeó recibe el efecto correspondiente:

1. **Coloso:** aumenta temporalmente el tamaño de la paleta.
2. **Égida:** bloquea una pelota que iba a salir por tu lado.
3. **Impulso:** aumenta temporalmente la velocidad de movimiento.
4. **Grillete:** ralentiza la paleta rival.
5. **Confusión:** invierte temporalmente los controles rivales.
6. **Bola ígnea:** agrega una estela ardiente.
7. **Bola espectral:** vuelve translúcida la pelota.
8. **Bola pesada:** reduce su velocidad.
9. **Bola relámpago:** aumenta su velocidad.
10. **Rebote caótico:** modifica el ángulo en los golpes.
11. **Viento cruzado:** desvía la pelota durante unos segundos.
12. **Eclipse:** oscurece temporalmente la arena.
13. **Terremoto:** agrega marcas visuales de vibración a la cancha.
14. **Prisma:** aplica una variación temporal de color a cada mitad de la arena.
15. **Aura de contraataque:** rodea tu paleta y potencia el siguiente golpe.
16. **Maldición diminuta:** reduce la paleta rival.
17. **Prisión glacial:** inmoviliza brevemente al rival.
18. **Intercambio astral:** intercambia la altura de las paletas.
19. **Voluntad inversa:** invierte el rumbo de la pelota.
20. **Pozo gravitatorio:** curva la trayectoria hacia abajo.
21. **Trayectoria serpentina:** la pelota se mueve en una curva oscilante.
22. **Rebote titánico:** aumenta la variación de los ángulos de rebote.
23. **Segunda oportunidad:** activa un escudo temporal.
24. **Juicio doble:** el próximo punto que ganes vale dos.
25. **Aura cromática:** envuelve la paleta en un contorno cambiante.

Los objetos aparecen cuando está activada la opción **Objetos de arena**.

## Barricadas rúnicas (V0.2.2)

- Aparecen en el centro de la arena con cuatro patrones geométricos posibles.
- Duran aproximadamente un segundo y desaparecen con un pulso visual.
- La pelota rebota en los segmentos; las paletas no quedan bloqueadas.
- Cada evento intenta generar dos power-ups cerca de la estructura, sujetos al límite de objetos disponibles.
- Los tonos cian, violeta, dorado y rosa mantienen la estética oscura y luminosa del juego.
- Los eventos se repiten con intervalos variables de aproximadamente 7,5–11 segundos.

## Ejecutar

Desde la carpeta del proyecto, ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`. Para jugar desde un teléfono o tablet conectado a la misma red que la computadora que sirve el juego, abrir la IP local de esa computadora en el móvil y permitir el puerto en el firewall.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar.
- En pantallas táctiles, arrastrar tu lado de la cancha o usar los botones en pantalla.

## Verificación V0.2.2

- **VERIFICADO:** sintaxis JavaScript de los módulos del proyecto.
- **VERIFICADO:** el catálogo registra 25 power-ups.
- **VERIFICADO:** el sistema contempla hasta cinco objetos normales y barricadas centrales temporales.
- **VERIFICADO:** integridad del ZIP y referencias locales básicas.
- **NO VERIFICADO:** partida interactiva completa en navegador real, balance de efectos, FPS medidos y controles en dispositivos físicos.


## Versión acumulada V0.2.21

Incluye los cambios acumulados desde la base completa V0.2.2 hasta V0.2.21.

### Base estructural de pelotas múltiples

- `state.balls` es la colección de pelotas; `state.ball` conserva compatibilidad como referencia a la pelota principal.
- Todas las pelotas registradas recorren la misma implementación de física: movimiento, rebotes, colisiones con paletas y barricadas, interacción con objetos, salida del campo y puntuación.
- El renderizado reutiliza el mismo dibujo para cada pelota.
- Cada pelota tiene identificador y linaje (`parentId`, `generation`, `lineage.rootId` y `lineage.mutation`) para permitir futuras mecánicas de división celular sin crear otro motor.
- `spawnBall()` crea una descendiente heredando características básicas de la pelota madre; `removeBall()` y `resetBallCollection()` administran el ciclo de vida.
- `state.ballLimit` define un límite operativo configurable (64 por defecto) para proteger el rendimiento. La arquitectura usa una colección, no variables separadas por cada pelota.
- Los temporizadores compartidos, los objetos y los eventos globales avanzan una sola vez por fotograma, no una vez por pelota.

### Estado de verificación V0.2.21

- **VERIFICADO:** sintaxis de los módulos JavaScript revisados.
- **VERIFICADO:** colección, metadatos de linaje y operaciones de alta/baja mediante comprobaciones automatizadas aisladas.
- **VERIFICADO:** el flujo de física recorre la colección mediante una sola función de física.
- **NO VERIFICADO:** partida interactiva completa en navegador real, puntuación bajo división simultánea y rendimiento en móvil. La mutación todavía no está conectada a esta base.


## Motor de mutación genética (V0.2.22)

- Se añade la variante de combate **Mutación genética · Experimental**, separada de la elección de arena y de las crónicas mitológicas.
- `mutation.js` es ahora un módulo ES del motor activo; no depende de `window.MutationManager` ni vuelve a conectar el motor legado `script.js`. La implementación anterior se conserva como `mutation-legacy.js` solo para consulta y no se carga.
- Cada golpe válido de una pelota contra una paleta agrega 15 puntos de carga mutágena, hasta un máximo de 100. La colección de pelotas de V0.2.21 usa el mismo gancho de colisión.
- La acumulación solo actualiza la carga y encola la petición `charge-ready`. `resolveMutationEffects()` procesa esa petición después del cálculo del choque, como punto separado de extensión para futuros efectos.
- Al llegar al 100%, la carga queda marcada como lista y muestra un aviso. La carga se reinicia al comenzar una nueva jugada después de un punto.
- Se incluye un indicador de carga para verificar la acumulación. **Todavía no se implementan umbrales intermedios, modificadores de estado, empujes, división celular ni efectos de esporas/hologramas.**

### Verificación V0.2.22

- **VERIFICADO:** sintaxis JavaScript y referencias de integración revisadas.
- **VERIFICADO:** pruebas aisladas del núcleo de carga, límite, resolución única al completar el 100% y reinicio por jugada.
- **NO VERIFICADO:** partida interactiva completa en navegador real y rendimiento en dispositivos físicos.


## v0.2.23 — Umbrales y modificadores de mutación
- Los umbrales 25%, 50% y 75% se detectan al cruzarse y se resuelven fuera de la función de acumulación.
- 25%: la paleta rival recibe una reducción de velocidad del 15% durante la jugada.
- 50%: queda marcada la fase de división celular, sin crear pelotas todavía.
- 75%: se invierten los controles del rival; en CPU se invierte su respuesta de seguimiento.
- Los modificadores se restablecen al comenzar la siguiente jugada. El modo mutación permanece activo.
- No se han añadido división celular, cambios de tamaño, empujes ni efectos visuales en esta versión.


## v0.2.24 — División celular simétrica

- Los umbrales de mutación afectan a ambos lados por igual: ralentización del 15% desde 25% e inversión de controles desde 75%.
- Desde 50% se habilita la división celular: cada golpe de cualquier pelota tiene una probabilidad del 35% de crear una descendiente.
- Las pelotas descendientes usan la colección y el mismo motor de física; heredan linaje/genética y cuentan para el límite operativo configurable `state.ballLimit` (64 por defecto).
- No se agregaron esporas, hologramas ni efectos visuales de mutación; quedan para la siguiente etapa.
- Pruebas de navegador y dispositivos físicos pendientes.


## v0.2.25 — Base de corrupción individual por goles

Esta sección describe el comportamiento vigente de Mutación y reemplaza las reglas de carga/modificadores descritas en las secciones históricas v0.2.22–v0.2.24.

- La carga es individual por jugador (`p1` y `p2`) y persiste entre puntos durante una partida. Solo se reinicia al comenzar una partida nueva o al desactivar/cambiar el modo Mutación.
- La carga aumenta únicamente cuando se confirma un gol contra ese jugador: base +15; bonificación de +5 si queda perdiendo por 2; +10 si queda perdiendo por 3 o más. Ganancia máxima por gol: +25; carga máxima: 100. La diferencia se calcula con el marcador ya actualizado.
- Los umbrales individuales 25%, 50%, 75% y 100% quedan registrados como desbloqueados al cruzarse. Esta versión solo establece la base de progresión y sus eventos; todavía no implementa los poderes, eventos de arena ni Avatar.
- El saque siguiente ya no borra la carga. Un bloqueo de gol por escudo tampoco suma corrupción porque no se confirma un gol.
- Se retiraron de la ruta activa de Mutación los antiguos efectos de ralentización, inversión de controles y división celular, para no mezclar la base nueva con los poderes anteriores. La arquitectura general de pelotas múltiples permanece disponible para otros usos.
- El indicador muestra por separado la carga de ambos jugadores.

### Verificación v0.2.25

- **VERIFICADO:** sintaxis de `mutation.js`, `physics.js`, `game.js` y `state.js`; pruebas aisladas de carga por lado, bonificación por desventaja, umbrales, tope y persistencia entre saques.
- **NO VERIFICADO:** ejecución completa en navegador, partida real, CPU y móvil. Requiere prueba manual.


## v0.2.26 — Atmósfera de corrupción de Mutación

- Se agrega una capa visual verde exclusiva del modo Mutación: niebla periférica, fisuras luminosas y esporas flotantes.
- La atmósfera se dibuja por debajo de jugadores, pelota, potenciadores y efectos de combate para no dificultar su lectura.
- El efecto respeta la calidad gráfica y la opción de reducir movimiento; no agrega dependencias ni modifica la física, las colisiones o el marcador.
- Los modos normales no dibujan esta capa.
- La base de corrupción individual de v0.2.25 se conserva: solo gana carga quien recibe el gol y la carga persiste entre puntos. Los poderes de los umbrales todavía no están implementados; por eso Mutación ya tiene una identidad visual, pero aún no todos sus efectos jugables.

### Verificación v0.2.26

- **VERIFICADO:** sintaxis estática de `game.js`; referencias visibles de versión en encabezado y pie; revisión estática de que la capa se ejecuta únicamente con `state.mutationMode === 'mutation'`.
- **NO VERIFICADO:** apariencia en navegador, fluidez en móvil y prueba de una partida real. Requiere validación manual.
