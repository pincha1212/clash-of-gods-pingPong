# Clash of Gods — Divine Arena V0.2.21

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
