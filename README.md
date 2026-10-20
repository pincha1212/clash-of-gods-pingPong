
# Clash of Gods — Divine Arena V0.2.64

Juego arcade de ping-pong mitológico en HTML, CSS y JavaScript nativos. La aplicación no necesita compilación ni frameworks. Todos los archivos se mantienen en la carpeta raíz para que sea sencillo encontrar y editar el proyecto. Algunos archivos son históricos y no forman parte del arranque activo.

## Arquitectura del proyecto (V0.2.64)

- `index.html`: estructura de pantallas y carga las dos entradas de la aplicación.
- `game.js`: orquestación del juego y coordinación de los modos.
- `config.js` y `state.js`: catálogo/configuración y estado compartido.
- `physics.js`, `input.js`, `abilities.js`, `powerups.js`, `mutation.js`, `arena-events.js` y `survival.js`: sistemas de juego.
- `characters.js`, `codex-profiles.js` y `codex-relations.js`: elenco, fichas y relaciones del códice.
- `effects.js`, `audio.js` y `hud.js`: presentación durante el combate.
- `navigation.js` y `settings.js`: pantallas y configuración de usuario.
- `pwa.js`, `sw.js`, `manifest.webmanifest` y `pwa.css`: instalación, actualización, conectividad y caché offline.
- `styles.css`, `menu.css`, `characters.css`, `arena.css`, `responsive.css` y `survival.css`: estilos cargados por la interfaz.
- Archivos históricos en la raíz: `script.js`, `style.css`, `mobile.js`, `eclipse.js`, `skills.js`, `ui.js`, `mutation-legacy.js` y `assets.js`. Se conservan para consulta, pero no deben considerarse módulos activos solo por estar en la carpeta raíz. Antes de reutilizarlos, revisar sus dependencias.

### Regla para futuras modificaciones

Antes de borrar o mover un módulo, comprobar sus importaciones, las referencias desde `index.html`, la lista `APP_SHELL` de `sw.js` y las instrucciones del README. Mantener la lista de precarga limitada a recursos realmente necesarios para el arranque offline. No ejecutar pruebas automatizadas por defecto: antes de cada entrega, documentar las inspecciones estáticas realizadas y dejar explícito qué requiere verificación manual.

---

## V0.2.47 — PWA instalable y juego sin conexión

Clash of Gods ahora incorpora una capa de aplicación web progresiva (PWA) sin dependencias de servidor ni servicios externos:

- `manifest.webmanifest` define el nombre, identidad, iconos, inicio independiente y alcance de la aplicación.
- `sw.js` precarga el shell completo del juego y sus módulos locales en una caché versionada. La primera instalación requiere abrir el juego una vez con conexión; después, la navegación y los recursos esenciales se sirven desde la caché.
- `pwa.js` registra el service worker solo en HTTPS o `localhost`, informa el estado de conexión, solicita instalación cuando el navegador lo permite y ofrece instrucciones manuales cuando no expone el diálogo de instalación. Las actualizaciones se anuncian y se aplican con una recarga controlada.
- `pwa.css` adapta los controles a escritorio y móvil. Los iconos PNG incluyen tamaños de 192 y 512 px, además de una variante maskable.
- Se eliminó la importación remota de Google Fonts: el diseño utiliza fuentes locales del sistema para que el juego no dependa de una petición externa al iniciar sin internet.
- El shell se mantiene como una instantánea versionada y coherente: al instalar una nueva versión, la caché anterior se retira después de que la nueva instalación se completa. El guardado local del juego no se elimina.

### Uso y despliegue

1. Publicá **la carpeta completa** en un host HTTPS estático (o ejecutá un servidor local en `localhost`). No abras `index.html` mediante `file://`: los service workers no funcionan desde archivos locales.
2. Abrí el juego con internet una vez y esperá a que el service worker se active.
3. Usá **INSTALAR APP** si el navegador ofrece instalación; en iOS, seguí las instrucciones de Compartir → Agregar a pantalla de inicio.
4. Una vez cargado el shell, probá activar el modo avión y volver a abrir la aplicación. El juego no necesita una API remota para sus modos actuales.
5. Para publicar una actualización, desplegá todos los archivos de la nueva versión juntos. El navegador detectará el nuevo `sw.js`, preparará la caché y mostrará **ACTUALIZAR** cuando esté lista.

La instalación nativa y los requisitos concretos de interfaz dependen del navegador y sistema operativo. El service worker necesita HTTPS, salvo en `localhost`.

### Verificación V0.2.47

- `npm run check:syntax`: sintaxis de los 18 módulos alcanzables desde las entradas activas (`game.js` y `pwa.js`) y del service worker.
- `npm run test:pwa`: manifest, iconos, controles de instalación/conexión, actualización, fallback offline y respuestas HTTP 200 para todas las rutas del shell.
- `npm run test:abilities`: **APROBADO** tras reconstruir correctamente V0.2.46 aplicando también su parche de `physics.js`: 248/248 activaciones semánticas, 124/124 ventanas útiles de IA y regresiones de Seth, teclado, contraataques, CPU y escudos.
- `npm run test:pwa`: **APROBADO** en pruebas estáticas y simulación del ciclo del service worker.
- El smoke test de navegador real se intentó, pero Chromium en el entorno de ejecución bloqueó la navegación con `ERR_BLOCKED_BY_ADMINISTRATOR`; por eso no se declara validada una instalación real ni una sesión visual completa en modo avión. La prueba de red HTTP y las simulaciones offline se informan por separado.

## Contexto histórico — base V0.2.46

Juego arcade de ping-pong mitológico en HTML, CSS y JavaScript nativos. Incluye 124 personajes, 17 arenas culturales compartidas, CPU y multijugador local. No requiere compilación ni frameworks; los módulos activos están en la raíz y los archivos históricos se conservan en la carpeta raíz.

## V0.2.46 — auditoría funcional de las 124 habilidades

- Auditadas las 124 habilidades con aserciones por tipo de efecto y comprobación de coherencia entre la descripción y el comportamiento; el resultado reproducible está en `AUDITORIA_HABILIDADES_V0.2.46.md`.
- Corregidas las habilidades de trayectoria para conservar la magnitud del vector de velocidad; antes, varias curvas cambiaban la velocidad real sin actualizar `ball.speed`.
- Arreglada la IA para usar habilidades en ventanas tácticas en lugar de depender de una probabilidad muy baja calculada en cada fotograma.
- Aplicados los efectos de ralentización e inversión también a la paleta controlada por la CPU.
- Los contraataques ahora consumen su carga y escalan moderadamente con el valor asignado; se muestra una marca mientras el contraataque está preparado.
- Corregidas asignaciones que no cumplían la descripción: Rostam y Cú Chulainn aceleran la pelota y cargan el próximo golpe; Kraken curva la pelota y ralentiza al rival; Momotarō describe explícitamente su escudo y aumento de cobertura.
- Reforzada la habilidad de Seth: cambia de forma evidente la trayectoria, ralentiza al rival durante 1,8 s y muestra un vórtice de arena en la pelota y en la paleta. Su perfil dedicado ya no se ejecuta dos veces junto con el perfil genérico de curva.
- Evita gastar habilidades durante el saque y amplía ventanas de escudo que podían expirar antes de que llegara la pelota.
- Informe completo: `AUDITORIA_HABILIDADES_V0.2.46.md`. Las pruebas automatizadas no reemplazan las pruebas de partida en navegador.

## Arenas compartidas — V0.2.46

El modo Clásico usa 17 escenarios culturales compartidos, uno por tradición o familia mitológica representada. `arena-events.js` mantiene un perfil de modificador por escenario, en vez de repetir perfiles por personaje. Las seis crónicas conservan sus sistemas originales de eventos, estados y efectos visuales; Jörmungandr mantiene su cierre geométrico dedicado y Mutación su sistema propio. No se combinan los gestores. La configuración editable y las reglas de compatibilidad están documentadas en `ARENA_MODIFIERS.md`.

## Elenco

- 33 dioses.
- 40 héroes.
- 25 titanes.
- 26 monstruos.

## Modos de juego

La preparación comienza con tres modos independientes:

- **Clásico:** selección libre de personajes, elenco, arena y reglas.
- **Crónicas mitológicas:** historias con contendientes y eventos definidos. No se combina con Mutación.
- **Mutación:** modo independiente con Cancha Mutante, corrupción y vacunas. No utiliza reglas de Crónicas.

El flujo de preparación separa la elección del modo, los personajes, los ajustes del combate y la revisión final. Volver a un paso conserva las elecciones compatibles; las crónicas fijan sus contendientes.

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

El modo Clásico dispone de 17 arenas culturales compartidas: japonesa, griega, nórdica, egipcia, india, mexica, primordial, china, mesopotámica, celta/irlandesa, artúrica, persa, romana, anglosajona, germánica, medieval europea y del Antiguo Cercano Oriente. Cualquier elenco puede jugar en cualquiera de ellas; las habilidades siguen siendo propias de cada personaje. Los escenarios de Crónicas, jefes y Mutación permanecen independientes.

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


## v0.2.27 — Superficie de arena corrompida

La identidad visual de Mutación ahora afecta al material del piso: manchas orgánicas verde oscuro, grietas angulosas y vetas discretas quedan integradas debajo de las marcas de cancha. La capa solo se genera con Mutación activa y respeta el nivel de calidad gráfica. La niebla y las partículas de v0.2.26 se mantienen como complemento, no como sustituto de la superficie corrompida.

Esta actualización es visual: no cambia colisiones, física, marcador ni acumulación de corrupción. Los poderes de los umbrales siguen pendientes.

## v0.2.28 — Mutación jugable y Cancha Mutante

Esta versión convierte Mutación en una variante de supervivencia. Este apartado describe el comportamiento actual y sustituye cualquier descripción anterior que indique que los poderes de Mutación están pendientes.

### Reglas de partido

- El marcador tradicional no determina la victoria en Mutación: la puntuación no aumenta, el marcador queda oculto y el ajuste «Puntos para ganar» desaparece de la configuración mientras esta variante está seleccionada.
- Cada gol recibido aumenta exclusivamente la corrupción del jugador que lo concede. La racha de goles recibidos suma +3, +6, +9 y +12 puntos porcentuales; desde el 50% se añade +1, y desde el 75% se añade +2, con un máximo de +14 por gol.
- La racha de un jugador se corta cuando ese jugador consigue marcarle un gol al rival. La corrupción y los poderes desbloqueados persisten entre puntos, pero se reinician cuando comienza un partido nuevo.
- Al alcanzar el 100% de corrupción, el jugador pierde y el rival gana por supervivencia. El Avatar se desbloquea en el 90% para que pueda activarse antes del límite final. Si un incremento saltara desde menos del 90% directamente al 100% y el jugador aún no hubiera usado el Avatar, la carga queda en 99% para garantizar esa última oportunidad; el siguiente gol recibido puede llevarlo al límite fatal.

### Poderes automáticos compartidos

- **25% — Pulso caótico:** los golpes a la pelota la aceleran y alteran ligeramente su ángulo; el jugador sufre una breve penalización de movimiento.
- **50% — Escudo del abismo:** cuando se aproxima una pelota peligrosa, se activa automáticamente una protección temporal. Si la pelota llega a atravesar el extremo de la cancha durante la protección, el gol se evita; usar el escudo reduce brevemente el control del jugador. Si no consigue bloquear el gol, también deja una penalización corta.
- **75% — Impulso de ruptura:** aumenta temporalmente el movimiento y potencia el golpe, seguido de una breve reducción de control.
- **90% — Avatar de corrupción:** se activa una sola vez por jugador y partido, transforma visualmente la paleta y modifica temporalmente los golpes y el pulso de la arena. Los poderes y desbloqueos obtenidos se conservan aunque una vacuna reduzca el porcentaje.

Los poderes son compartidos por ambos jugadores. Se aplican sobre la física existente de `physics.js`; no se añade un segundo motor de pelota.

### Vacunas

- En Mutación, los power-ups comunes no aparecen. En su lugar puede haber una vacuna especial, como máximo una en la cancha, con aparición ocasional.
- Recoger una vacuna reduce la corrupción en 12 puntos porcentuales del jugador al que se atribuye el último golpe a la pelota. No borra poderes ya desbloqueados ni reinicia la racha de goles recibidos.
- La aparición de vacunas respeta la opción de objetos de la configuración. Los modos normales conservan los power-ups originales.

### Cancha Mutante

- El piso se modifica por fases según la mayor corrupción entre los dos jugadores: fase 1 desde 0%, fase 2 desde 25%, fase 3 desde 50% y fase 4 desde 75%.
- Las fases aumentan la densidad de manchas orgánicas, grietas y focos de savia verde oscura. La superficie se reconstruye cuando cambia la carga, sin recalcular texturas en cada fotograma.
- A partir de la fase 3 hay un solo evento peligroso global a la vez: aviso previo, un pulso que altera ligeramente la trayectoria vertical de la pelota y un periodo de recuperación. No aparecen obstáculos sobre jugadores ni sobre la pelota.
- La capa de suelo, los eventos y los poderes de Mutación solo funcionan con esta variante activa. Los modos normales mantienen sus reglas de marcador, catálogo de objetos y física habitual.

### Verificación v0.2.28

- **VERIFICADO:** sintaxis de todos los módulos JavaScript con `node --check`.
- **VERIFICADO:** pruebas aisladas del módulo de Mutación para progresión por rachas, carga individual, vacuna y persistencia de desbloqueos, Avatar de uso único, escudo, Pulso, fuerza del evento de arena y modo Mutación desactivado.
- **VERIFICADO:** empaquetado e integridad de los ZIP completo y delta.
- **NO VERIFICADO:** partida completa en navegador. La ejecución de Chromium en este entorno quedó bloqueada por la política de navegación (`ERR_BLOCKED_BY_ADMINISTRATOR`); no se afirma haber probado el juego real.
- **NO VERIFICADO:** equilibrio de los poderes, lectura de la arena y rendimiento en dispositivos físicos; requieren prueba manual de juego.



## v0.2.29 — Pudrición persistente y progresión temprana

La v0.2.29 separa la corrupción individual de la pudrición acumulada de la Cancha Mutante. La carga personal sigue aumentando por goles recibidos y puede bajar con vacunas; la pudrición del escenario, en cambio, solo aumenta durante el partido y no retrocede al curarse un jugador.

- **Pudrición persistente:** comienza en 0% y aumenta lentamente con el tiempo de juego (0,12 puntos porcentuales por segundo activo). Los goles aceleran la evolución de la superficie. El contador se reinicia al comenzar una partida nueva.
- **Fases de cancha:** la superficie usa la pudrición acumulada, no la carga actual del jugador. Umbrales visuales: 25%, 50% y 75%. Recoger una vacuna no borra las manchas ni las grietas ya extendidas.
- **Eventos más tempranos:** los pulsos de la cancha pueden empezar en fase 2 (25% de pudrición), con menor fuerza y menor frecuencia. En fases superiores aumentan gradualmente la intensidad y frecuencia, siempre con aviso previo.
- **Legibilidad y física:** el pulso modifica solo la velocidad vertical de la pelota existente, con intensidad escalada por fase y sin introducir una física paralela. Las líneas de cancha y las entidades se siguen dibujando por encima de la superficie.
- **Modos normales:** la progresión de pudrición y los eventos siguen desactivados fuera de Mutación.
- **Interfaz:** el nombre de la arena informa el porcentaje de pudrición y la fase, separado de los porcentajes individuales de corrupción.

### Verificación v0.2.29

- **VERIFICADO:** sintaxis JavaScript de todos los módulos.
- **VERIFICADO:** pruebas aisladas de incremento temporal, aceleración al recibir goles, persistencia de pudrición al recoger una vacuna, avance de fases y desactivación fuera de Mutación.
- **VERIFICADO:** integridad de los ZIP completo y delta.
- **NO VERIFICADO:** partida completa en navegador y rendimiento en dispositivos físicos; requieren prueba manual.


## v0.2.30 — Pudrición visible, paletas infectadas y pelota irreversible

La v0.2.30 amplía la progresión de Mutación sin reemplazar los sistemas existentes:

- **Cancha:** más manchas, grietas conectadas y focos de savia desde las fases intermedias. La pudrición global avanza a 0,12 puntos porcentuales por segundo activo y nunca baja al recoger vacunas.
- **Paletas:** muestran venas y aura verdes según la corrupción individual. La apariencia sigue la carga mediante una transición gradual, por lo que la vacuna visualmente va sanando la paleta sin borrar de golpe el efecto.
- **Pelota:** acumula aura y venas según la pudrición global. Desde niveles altos aparecen rayos verdes alrededor; el efecto no se cura al recoger vacunas ni se reinicia entre puntos. Se reinicia al comenzar una partida nueva, junto con la pudrición de esa partida.
- **Pulsos:** se acortan moderadamente los intervalos de eventos de fases intermedias y se alarga su ventana activa. El impulso físico aplica aceleración vertical gradual y acotada, mantiene el sentido horizontal y no fuerza una dirección nueva instantáneamente. Los poderes activados al golpear la paleta ya no agregan desviaciones aleatorias a la trayectoria.
- **Rendimiento:** los rayos más detallados se omiten en calidad baja; los trazos de corrupción se dibujan en el canvas existente y no agregan dependencias ni entidades físicas.
- **Modos normales:** los cambios visuales y de física de esta entrega están condicionados a Mutación.

### Verificación v0.2.30

- **VERIFICADO:** sintaxis de todos los archivos JavaScript mediante `node --check`.
- **VERIFICADO:** integridad de los ZIP generados.
- **VERIFICADO:** inspección estática de los cambios y pruebas aisladas de la progresión de pudrición, curación individual, fases y límites del impulso.
- **NO VERIFICADO:** partida completa en navegador, balance real de los pulsos, lectura visual en pantalla pequeña y rendimiento en dispositivos físicos. Requiere prueba manual.


## v0.2.31 — Pulido final de Mutación

- Se corrige el ciclo de vida del estado de los eventos de cancha para que los temporizadores de aviso, actividad y recarga persistan correctamente entre fotogramas.
- Se incorporan dos variantes de evento de cancha: **Pulso de infección**, que curva verticalmente la trayectoria con fuerza limitada, y **Sobrecarga de savia**, que aumenta la velocidad gradualmente sin cambiar el ángulo de la pelota.
- Los eventos anuncian su tipo antes de activarse y usan señales visuales diferentes. La Sobrecarga puede aparecer con menor probabilidad desde la fase 2 y se vuelve más frecuente desde la fase 3, de modo que la cancha gana variedad sin sumar colisiones ni obstáculos nuevos.
- Las vacunas mantienen su reducción de 12 puntos de corrupción, pero su aparición se espacía progresivamente con la pudrición global: aproximadamente 9–12 segundos al principio y 16–19 segundos al llegar al 100%, si el objeto anterior ya no está en cancha. La intención es conservar su valor sin que la curación se vuelva un ciclo demasiado frecuente que alargue excesivamente el duelo.
- Los modos normales mantienen su frecuencia de power-ups y sus reglas. No se cambia el límite de velocidad de la pelota ni se introduce un motor de física nuevo.

### Verificación v0.2.31

- **VERIFICADO:** sintaxis estática de JavaScript e integridad de los ZIP.
- **VERIFICADO:** pruebas aisladas de los dos tipos de evento, límite de velocidad, preservación de dirección en sobrecarga y cálculo de intervalo de vacunas.
- **NO VERIFICADO:** partida completa en navegador y balance real en dispositivo físico. Requiere prueba manual.


## v0.2.32 — Cierre de contenido de Mutación

- Se añade un tercer evento de cancha: **Latido del núcleo**. La cancha lo anuncia con ondas concéntricas; al activarse, aplica dos impulsos verticales graduales en sentidos opuestos. No invierte directamente el movimiento horizontal ni supera el límite de velocidad configurado.
- La selección de eventos se amplía por etapa. El Latido puede aparecer desde la fase intermedia y gana presencia en las etapas avanzadas, junto con el Pulso de infección y la Sobrecarga de savia.
- Cada evento muestra una señal visual y un aviso textual propios para anticipar su comportamiento.
- El título de la arena deja de mostrar un contador de fases del tipo «FASE 4/4». Ahora presenta el estado narrativo de la cancha: **Contaminación**, **Infección**, **Descomposición** o **Corrupción total**. La última etapa se presenta como un estado completo, no como un progreso pendiente.
- No se agregan obstáculos físicos, dependencias ni cambios a las reglas de los modos normales.

### Verificación v0.2.32

- **VERIFICADO:** sintaxis de JavaScript e integridad de los ZIP.
- **VERIFICADO:** pruebas aisladas del tercer evento, alternancia de sus impulsos, conservación del sentido horizontal y límite de velocidad.
- **VERIFICADO:** etiquetas actuales de arena sin el formato «FASE N/4».
- **NO VERIFICADO:** partida completa en navegador y rendimiento/balance en dispositivos físicos; requiere prueba manual.


## v0.2.33 — Nueva preparación de partida

- Se agregó una pantalla inicial para elegir entre Clásico, Crónicas mitológicas y Mutación.
- Mutación y Crónicas se excluyen entre sí; el inicio del combate refuerza esta regla.
- Se ordenaron los ajustes por grupos y se agregó una pantalla final de revisión antes de entrar a la arena.
- Se eliminó la elección duplicada del elenco en configuración; el elenco se cambia desde selección de personajes.
- Se conserva la selección de personajes al volver entre pasos cuando corresponde.
- Se corrigió la descripción del catálogo: 94 personajes (33 dioses, 30 héroes, 15 titanes y 16 monstruos).

### Verificación v0.2.33

- **VERIFICADO:** sintaxis de los módulos JavaScript con `node --check`.
- **VERIFICADO:** el catálogo exporta 94 personajes y 38 arenas sin IDs duplicados; los conteos por categoría suman 94.
- **VERIFICADO:** IDs HTML únicos y referencias locales básicas.
- **VERIFICADO:** integridad de los ZIP completo y delta.
- **NO VERIFICADO:** navegación y partida completa en navegador real; no se realizó prueba interactiva de gameplay.


## v0.2.34 — 30 personajes nuevos

- Se incorporan 10 héroes, 10 titanes y 10 monstruos, con estadísticas, habilidades y perfiles del Códice.
- Los nuevos personajes usan efectos de habilidad ya soportados por el combate; no se añadieron dependencias ni se alteró la física.
- El catálogo pasa a 124 personajes: 33 dioses, 40 héroes, 25 titanes y 26 monstruos.
- Se actualizan los contadores de la portada y del Códice.

### Verificación v0.2.34

- **VERIFICADO:** sintaxis de módulos JavaScript y unicidad de IDs del catálogo.
- **VERIFICADO:** cada personaje nuevo tiene categoría, habilidad, estadísticas y tipo de poder compatible con el motor genérico existente.
- **NO VERIFICADO:** prueba interactiva de las 30 habilidades en navegador real; requiere prueba manual de juego.


## v0.2.35 — Primera arena con modificador jugable

- La arena de Raijin ahora presenta una identidad visual de tormenta y se denomina **Raijin · Tormenta divina**.
- Se añade una corriente ambiental suave y ráfagas verticales alternadas, con aviso previo de 1,4 segundos y activación temporal de 1,25 segundos.
- La fuerza de arena se suma al cálculo ambiental existente de `physics.js` y comparte su límite; no crea colisiones, otro motor de física ni un bucle separado.
- Los avisos y trazos de viento se dibujan en los márgenes, respetando movimiento reducido y calidad gráfica baja.
- El piloto solo se activa en Clásico con `arenaId === 'raijin'`; queda desactivado en Crónicas y Mutación. Los power-ups mantienen su lógica propia. El estado se reinicia en cada saque y se limpia al cambiar de arena, salir al menú o terminar la partida.

### Verificación v0.2.35

- **VERIFICADO:** sintaxis de los módulos, integración con el bucle actual y pruebas unitarias del ciclo de aviso/ráfaga, alternancia de dirección y desactivación por modo/arena.
- **VERIFICADO:** revisión estática del reinicio de estado al sacar y de su limpieza en salida y final de partida.
- **NO VERIFICADO:** balance de la ráfaga durante una partida real, controles físicos en móviles y rendimiento en dispositivos de gama baja; requiere prueba manual en navegador/dispositivo.


## v0.2.36 — Cobertura ambiental de arenas

- Se amplían los eventos ambientales de Clásico a todas las arenas seleccionables del catálogo.
- Las familias de arena aplican impulsos moderados en el eje horizontal o vertical, con aviso previo, duración limitada y dirección alternada.
- Raijin conserva su perfil de tormenta como piloto de referencia.
- Crónicas mantiene los eventos específicos de cada crónica y de sus jefes; Mutación conserva sus eventos exclusivos para evitar superponer fuerzas ambientales.
- Se respetan las opciones de calidad gráfica y movimiento reducido en el renderizado del aviso.

### Verificación v0.2.36

- Validación de sintaxis de módulos JavaScript y pruebas automatizadas del ciclo de eventos y fuerzas por familia.
- No se declara una partida real en navegador como verificada.


Arena modifier configuration and compatibility: see `ARENA_MODIFIERS.md`.


## v0.2.37 — Sistema unificado y perfiles de arena

- Centraliza los ciclos de aviso, activación, duración y enfriamiento de Clásico y de las crónicas compatibles en `arena-events.js`.
- Añade perfiles explícitos para Raijin, Zeus, Poseidón, Thor, Jörmungandr, Horus, Seth, Indra, Vritra y Tifón; el resto hereda valores editables por familia.
- Olympus y Ragnarök presentan sus escenarios asociados a Zeus y Thor, respectivamente, en lugar de depender accidentalmente de la selección anterior.
- Retira la aplicación duplicada de fuerzas para Olympus, Ragnarök, Throne, Waters y Tifón desde `physics.js`.
- Mutación permanece aislada; Jörmungandr conserva su mecánica geométrica especial para no mezclar el cierre de límites con fuerzas genéricas.
- Añade `ARENA_MODIFIERS.md` con los puntos de edición, campos de perfil y reglas de compatibilidad.

### Verificación v0.2.37

- Sintaxis comprobada en todos los módulos JavaScript.
- Pruebas automatizadas de catálogo (38 arenas, IDs únicos y estilos), perfiles Classic y cinco modos de crónica, límites de fuerza y exclusión de Mutación/Jörmungandr.
- No se pudo completar una partida interactiva en un navegador real en este entorno.


## Matriz de compatibilidad — V0.2.38

Se añade `ARENA_COMPATIBILITY_MATRIX.md`, inventario estático de las seis crónicas: arena visual efectiva, eventos, fuerzas, reglas especiales, potenciadores, habilidades y elementos que deben conservarse. Esta entrega es documental y no cambia la lógica de juego. La matriz separa lo confirmado en código de las pruebas manuales pendientes.


## V0.2.39 — auditoría de duplicación de eventos
- Se restauraron los eventos originales de Olimpo, Ragnarök, Trono, Aguas y Tifón, incluidos sus estados y efectos visuales existentes.
- El gestor genérico de `arena-events.js` queda limitado a Clásico; no añade eventos a las crónicas.
- Jörmungandr mantiene exclusivamente su cierre de arena dedicado.
- Validación estática y de sintaxis; prueba manual de navegador pendiente.


## V0.2.41 — modificadores individualizados por arena

- El catálogo del modo Clásico contiene un perfil explícito para cada una de las 38 arenas seleccionables; se eliminó la sustitución silenciosa por familias visuales.
- Cada perfil declara identidad del fenómeno, patrón físico, firma visual, fuerza, variación ambiental, aviso, duración y enfriamiento.
- Los patrones usan la única integración física existente en `physics.js`; no crean un segundo bucle de actualización ni nuevas colisiones/obstáculos.
- Las firmas visuales solo aparecen durante aviso o activación. No se dibuja un efecto permanente extra sobre el mapa.
- Las crónicas, los jefes y Mutación conservan sus sistemas dedicados; este catálogo solo se activa en Clásico.
- Verificación automática: sintaxis JS, cobertura de 38 IDs, patrones conocidos, fases de aviso/activación, límite de fuerza y desactivación en modos protegidos. Falta prueba manual de juego en navegador.


## V0.2.41 — arenas agrupadas por mitología

- El selector de arenas del modo Clásico ahora organiza las 38 opciones en siete categorías mitológicas mediante grupos desplegables.
- Se añadieron metadatos explícitos de clasificación y vínculos entre las arenas de Hidra, Kraken, Minotauro y Fenrir y sus personajes.
- Se creó `ARENAS_POR_MITOLOGIA.md`, que inventaría las arenas existentes y lista los 87 personajes del plantel que aún no tienen arena seleccionable propia. Los escenarios fijos de Jörmungandr y Tifón se distinguen de las arenas seleccionables.
- No se modificaron perfiles físicos, habilidades, power-ups ni eventos de crónicas.
- Pruebas estáticas: 38 arenas clasificadas, siete categorías, 38 perfiles, cero IDs duplicados y cero arenas sin categoría. Prueba visual/jugable en navegador pendiente.


## V0.2.42 — una arena compartida por mitología

- Se reemplazaron las 38 opciones individuales por siete escenarios compartidos: seis mitologías y un campo primordial colectivo.
- Los personajes conservan sus habilidades y estadísticas; el escenario ya no se duplica por personaje.
- Los modificadores ambientales de Clásico se redujeron a siete perfiles explícitos, uno por escenario compartido.
- Los identificadores de arena anteriores se migran a la arena compartida correspondiente al abrir el selector.
- Olimpo utiliza la arena griega y Ragnarök la nórdica. Las Crónicas y los jefes conservan sus escenarios dedicados; Mutación sigue usando su cancha propia.
- Verificado: sintaxis de los módulos JavaScript, siete arenas, siete perfiles, IDs únicos y compatibilidad de migración. No se realizó una prueba interactiva en navegador; el gameplay real sigue pendiente de playtest.


## V0.2.43 — clasificación cultural completa

- Se amplía el catálogo a 17 arenas compartidas, incluyendo tradiciones chinas, mesopotámicas, celtas/irlandesas, artúricas, persas, grecorromanas, anglosajonas, germánicas, medievales europeas y del Antiguo Cercano Oriente.
- Se añade `CHARACTER_CULTURAL_CLASSIFICATION` con una asignación cultural y arena para cada uno de los 124 personajes.
- La pantalla de selección muestra la cultura de ambos personajes y su arena sugerida sin forzar la elección manual.
- Se añaden patrones visuales y perfiles ambientales explícitos para las nuevas arenas.
- Crónicas, jefes y Mutación conservan sus sistemas independientes.


## V0.2.44 — identidad visual y física de los 17 eventos

- Se rediseñaron los 17 perfiles de evento de Clásico con nombre, patrón de fuerza, color, tiempos y firma visual propios.
- Cada arena tiene un comportamiento ambiental diferente: corrientes kami, rayo olímpico, frente de Niflheim, eclipse solar, órbita del mandala, serpiente emplumada, fisura titánica, nubes de inmortales, crecida fluvial, bosque antiguo, resonancia del Grial, ascenso del Simurg, marcha de legiones, runas del salón, Cacería Salvaje, cruce de ley-lines y marea lunar.
- Se corrigió un `restore()` extra del canvas que dejaba el rótulo del evento fuera del estado de recorte/estilo previsto.
- Los avisos, la duración, el enfriamiento, el límite de fuerza y el ajuste de movimiento reducido se mantienen en el gestor actual; no se creó un bucle físico adicional.
- Crónicas, jefes y Mutación siguen excluidos del gestor compartido.
- Validación estática y de sintaxis; prueba manual en navegador pendiente.


## V0.2.48 — Modo Supervivencia

Se añade un modo de supervivencia independiente del combate clásico, Crónicas y Mutación. Elegís un protagonista del elenco completo, enfrentás 15 enemigos seleccionados aleatoriamente y luego un jefe final aleatorio. Tenés tres vidas para toda la campaña; perder un combate completo consume una vida, pero perder puntos dentro del combate no. Los rivales normales juegan a 7 puntos; el jefe final usa dificultad Divina y 9 puntos. Si perdés contra el jefe, podés volver a intentarlo mientras conserves vidas. Al agotar las tres, la campaña termina.

El modo no incorpora mecánicas roguelike: no hay rutas, reliquias, bendiciones ni mejoras permanentes. La habilidad del personaje y los objetos de arena siguen activos. El progreso y los récords básicos se guardan localmente cuando el navegador lo permite. La lógica se encuentra en `survival.js`; `survival.css` define el HUD y el diseño del modo. Ambos recursos se incluyen en la caché offline de la PWA.

### Verificación V0.2.48

- `npm run check:syntax`: aprobado.
- `npm run test:pwa`: aprobado; manifest, archivos de la PWA y 36 rutas del shell comprobados, con navegación offline simulada.
- `npm run test:abilities`: aprobado; 248/248 activaciones semánticas y 124/124 ventanas útiles de IA.
- `npm run test:survival`: aprobado; progresión, vidas, jefe final, reintento y derrota probados por separado.
- No se completó una prueba visual de navegador real en este entorno. Validar manualmente en Android antes de considerar la experiencia de usuario final verificada.


## V0.2.49 — Supervivencia pulida

- Perder un combate normal consume una vida y obliga a reintentar el mismo encuentro; solo una victoria permite avanzar.
- El jefe final se conserva entre reintentos.
- Los mensajes de resultados usan el rival del combate recién terminado, no el próximo rival seleccionado.
- El HUD muestra progreso de campaña, vidas, rival y objetivo de puntos con etiquetas accesibles.
- Récord local ampliado: campañas, victorias, derrotas, mejor progreso e historial reciente.
- La selección de personaje muestra el mejor progreso y las victorias finales guardadas.
- El modo mantiene las habilidades y los objetos activos, sin sistemas roguelike.

## V0.2.50 — Consistencia de reglas y guardado

- Supervivencia fija de forma consistente el objetivo de 7 puntos para rivales normales y 9 para el jefe, sin heredar accidentalmente la puntuación del duelo clásico.
- La preparación y el resumen explican el objetivo de puntos antes de iniciar.
- El panel de campaña guardada se oculta al descartar el progreso; los botones de continuar y descartar se deshabilitan si no existe un guardado válido.
- Caché PWA actualizada a V0.2.50.

## V0.2.51 — Puntuación configurable y fija en Supervivencia

- El selector de puntos para ganar ahora está disponible al preparar Supervivencia (rango de 3 a 15 puntos).
- El objetivo elegido se aplica a los 15 rivales y al jefe final, sin aumentos por dificultad.
- La puntuación configurada queda guardada en la campaña activa y se restaura al reanudar la aplicación.
- El resumen previo, el marcador y el HUD usan el mismo objetivo efectivo.
- La caché de la PWA se actualizó a V0.2.51.


## V0.2.52 — Supervivencia sin lenguaje de campaña

- Se corrigen los textos visibles para presentar Supervivencia como un desafío arcade de resistencia, no como una campaña narrativa.
- Se actualizan la tarjeta del modo, la configuración, el HUD, los resultados, el guardado/reanudación y el resumen de récords para usar términos como partida, rival, desafío y supervivencia.
- Se conserva la lógica interna y la estructura de guardado existentes para evitar una migración innecesaria de datos. Crónicas sigue siendo el modo reservado para la campaña narrativa.
- Se incrementa la versión visible y la caché de la PWA para que la nueva interfaz pueda actualizarse.
- No se ejecutaron tests automatizados, según el flujo de trabajo acordado. Se hizo una revisión textual de los cambios; no se realizó una prueba manual en navegador/dispositivo.


## V0.2.53 — Navegación y salida de partida

- Se centraliza la salida al menú para detener el bucle de juego, limpiar entradas/controles táctiles y ocultar overlays temporales de forma consistente.
- El botón SALIR, el logotipo superior y los botones de navegación que vuelven al menú comparten la misma limpieza.
- La salida no elimina el guardado de Supervivencia; el panel de reanudación se actualiza al volver al menú.
- El cambio de pantalla valida el destino antes de ocultar la pantalla actual y sincroniza `aria-hidden` con la pantalla activa.
- Se corrige la versión desactualizada del pie de página y se actualiza la caché PWA a V0.2.53.
- Revisión manual del flujo y del diff; no se ejecutaron pruebas automatizadas ni se hizo una prueba manual en navegador/dispositivo.


## V0.2.54 — Organización de arquitectura (histórico)

- En esa versión se movieron temporalmente ocho archivos históricos a `legacy/`; en V0.2.55 se devolvieron a la raíz para simplificar el acceso al proyecto.
- Se retiraron `mobile.js`, `eclipse.js`, `skills.js` y `assets.js` de la precarga del service worker porque no son parte del grafo activo de módulos.
- Se agregó un mapa de arquitectura y una regla de mantenimiento para que el shell offline refleje los recursos usados por la app.
- Se actualizó la versión visible, el paquete y la clave de caché a V0.2.54.
- No se modificaron las mecánicas de juego. No se ejecutaron pruebas automáticas ni pruebas manuales de navegador.


## V0.2.55 — Archivos en la raíz

- Se devolvieron a la raíz los ocho archivos históricos que se habían agrupado en `legacy/`.
- Se eliminó la carpeta `legacy/`; no se borró el contenido de esos archivos.
- Se mantienen fuera del precache los archivos que no participan en el arranque activo, aunque estén en la raíz.
- Se actualizó la versión visible, el paquete y la clave de caché a V0.2.55.
- No se reorganizaron los módulos activos ni se modificaron las mecánicas del juego.

## V0.2.57 — Consolidación inicial de interfaces

- Al salir de Supervivencia, el selector de tipo de partida vuelve a habilitarse en Clásico, Crónicas y Mutación.
- Los controles de teclado del combate ya no interceptan las flechas, Espacio o Enter cuando el usuario está interactuando con controles de la interfaz; tampoco interfieren con el diálogo de Ajustes.
- Ajustes ahora devuelve el foco al control que lo abrió y contiene la navegación por teclado dentro del diálogo mientras está abierto.
- Las pantallas declaran su estado inicial `aria-hidden`, coherente con la pantalla visible y las pantallas ocultas.
- Se actualizó la versión del proyecto y el nombre de caché del service worker para que la PWA no reutilice la instantánea anterior.
- Revisión estática del código y de referencias de interfaz. No se ejecutaron pruebas automatizadas ni se probó una partida en navegador.

---

## V0.2.56 — Marcador exclusivo de Supervivencia
- Se reforzó la visibilidad condicional del HUD de Supervivencia para que no aparezca en Clásico, Crónicas ni Mutación.
- Se sincroniza la clase visual con el modo de preparación al iniciar una partida y actualizar el HUD.


## V0.2.59 — Colisiones múltiples y caos persistente

- Las pelotas activas ahora colisionan entre sí con separación por masa y respuesta elástica; la detección considera el cruce entre posiciones de fotogramas para reducir el efecto de atravesarse a alta velocidad.
- Cada pelota conserva sus propios potenciadores, tamaño, color y trayectoria. Las pelotas hijas nacen separadas del radio de ambas pelotas y pueden chocar, rebotar, recoger objetos y anotar.
- `Maldición diminuta` reduce permanentemente el tamaño de la paleta rival durante el partido, acumulándose con `Miniatura` y pudiendo contrarrestarse con `Coloso`, siempre dentro de límites. Se reinicia al empezar una nueva partida.
- Nuevo potenciador `Órbita imposible`: la trayectoria de esa pelota se curva de forma continua hasta que otro potenciador de trayectoria la sustituya.
- `Arena prismática` tiene una capa visual más intensa con gradientes, bandas ondulantes, anillos, facetas y bordes cromáticos; `Prisma` y `Tempestad divina` también ganan detalle visual. La calidad baja y la opción de movimiento reducido limitan la animación.
- En partidas con varias pelotas, cada una obtiene un halo y una órbita visual diferenciados. El límite de 24 pelotas sigue activo.
- Validación: revisión estática del flujo de colisiones, reinicio de efectos y llamadas de power-ups. No se ejecutaron pruebas automatizadas ni una partida real en navegador; la física y el rendimiento requieren prueba manual.

## V0.2.58 — Power-ups acumulativos y efectos por pelota

- Coloso y Miniatura modifican el tamaño de la paleta de forma acumulativa durante el partido, con límites definidos; el cambio se reinicia al iniciar otro partido.
- Se agregaron potenciadores de tamaño de pelota, multiplicación, trayectoria horizontal/vertical, color individual y cambio cromático temporal de la arena.
- Los efectos temporales de velocidad y estela ahora se guardan por pelota, no en un único estado global.
- Las pelotas creadas por multiplicación heredan los efectos actuales de la pelota de origen, pero los nuevos potenciadores individuales solo modifican la pelota que los recoge. Los modificadores persistentes continúan en la pelota que anota y se reinicia para una partida nueva.
- Se limita la cantidad simultánea a 24 pelotas para evitar que la multiplicación degrade el rendimiento. Todas las pelotas activas siguen usando las reglas de colisión y puntuación existentes.
- Se actualizó la versión de la interfaz y la caché de la PWA.
- Revisión estática de los archivos modificados; no se ejecutaron pruebas de juego en navegador.


## V0.2.60 — Rondas multi-bola y power-ups de caos
- Una pelota que sale de la cancha suma su punto y se elimina; las demás siguen en juego. La siguiente salida solo reinicia la jugada cuando ya no quedan pelotas activas.
- Se conserva el límite de puntuación: si un jugador alcanza el objetivo, el partido termina inmediatamente.
- Nuevos poderes individuales: Núcleo gravitatorio (atrae las otras pelotas cercanas) y Caos inestable (cambia de rumbo en pulsos impredecibles).
- El Núcleo gravitatorio no transfiere su poder a las pelotas afectadas; cada una mantiene su propio estado.


## V0.2.61 — Habilidades compartidas y power-ups dimensionales

- Las habilidades que modifican velocidad, trayectoria o marca visual de la pelota se aplican a todas las pelotas activas.
- Las pelotas que nacen por multiplicación heredan la firma visual y el tiempo restante del efecto especial de su progenitora, además de sus modificadores individuales.
- Se agregan Rayo encadenado, que impulsa pelotas cercanas con pulsos eléctricos, y Salto dimensional, que desplaza periódicamente una pelota a una posición segura de la cancha.
- Los nuevos efectos son individuales: el impulso del Rayo encadenado no transfiere el poder, y el Salto dimensional no altera la velocidad base ni los modificadores persistentes.
- No se ejecutaron pruebas automatizadas ni una partida en navegador; la revisión de sintaxis es estática y la validación de juego queda pendiente.


## V0.2.62 — Entropía, fractales y teletransporte seguro

- Se incorporan Bola de entropía, Bola fractal y Colapso de realidad, con efectos individuales o de arena y límites de multiplicación.
- Salto dimensional evita teletransportar la pelota junto a las paletas o la línea de gol, y anticipa el salto con un indicador visual.
- Las ráfagas de reposicionamiento y la inversión de controles quedan limitadas para evitar salvadas automáticas o desorientaciones excesivamente largas, sin quitarles utilidad.
- El Colapso de realidad combina efectos de arena en pulsos, con capas visuales que respetan la calidad gráfica y la opción de movimiento reducido.
- No se ejecutó una partida dentro del navegador; se recomienda validar manualmente el juego con múltiples pelotas y efectos simultáneos.


## V0.2.64 — Caos impredecible y teletransporte justo

- Corrige la inversión de controles en arrastre táctil: invierte el desplazamiento del dedo en vez de reflejar su coordenada absoluta, evitando el salto de la paleta a la otra punta de la cancha.
- Confusión dura 1,15 s; las habilidades de inversión quedan limitadas a 1,25 s y el icono muestra un aro de tiempo restante.
- Salto dimensional elige destinos en una franja central, lejos de ambas paletas, de otras pelotas y de barricadas; si no existe una posición segura, demora el salto en lugar de forzarlo.
- Las habilidades de dash reposicionan solo una parte del recorrido, tienen un límite de distancia y ya no convierten el salto mágico en movimiento físico al golpear la pelota.
- Se agrega Bola espejo, que refleja de forma impredecible uno o ambos ejes, con una señal visual antes del cambio y velocidad conservada.
- Colapso de realidad alterna más rápidamente y puede combinar tres efectos de arena simultáneos; la Bola de entropía también puede mutar a Bola espejo.
- No se ejecutó el juego dentro del navegador; queda pendiente la validación manual del control táctil, las inversiones y los saltos dimensionales.


## V0.2.64 — Caos de paletas

- **Motor divino:** aumenta temporalmente la movilidad de la paleta y añade una estela.
- **Bobina caótica:** los golpes alteran moderadamente el ángulo de la pelota.
- **Pulso sísmico:** al golpear, empuja otras pelotas cercanas con impulso limitado.
- **Paleta mutante:** el tamaño oscila de forma controlada durante el efecto.
- **Fase espectral:** teletransporta periódicamente la paleta a una altura segura de su propio lado, con aviso visual.
- Los efectos tienen temporizadores propios, indicadores visuales y limpieza al reiniciar los power-ups.

Validación realizada: revisión estática y `node --check` de los archivos JavaScript modificados. No se ejecutó una partida en navegador.
