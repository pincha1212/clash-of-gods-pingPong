# Clash of Gods — Divine Arena V0.2.31

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
