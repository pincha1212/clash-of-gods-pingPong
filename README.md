# Clash of Gods — Divine Arena V0.2.0

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

Hay 35 arenas en total: se conservan las 30 originales y se agregan cinco arenas nuevas, temáticas de Titanomaquia, Hidra, Kraken, Minotauro y Fenrir. Las arenas se pueden elegir con cualquier categoría de personajes; no se crea una arena por personaje.

## Power-ups de arena (V0.2.0)

Hay 15 potenciadores que aparecen aleatoriamente durante la partida. La pelota recoge el objeto y el último jugador que la golpeó recibe el efecto correspondiente:

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

Los objetos solo aparecen si está activada la opción **Objetos de arena**. Su efecto es temporal cuando corresponde; los objetos sin efecto sobre la paleta o la arena modifican la pelota durante unos segundos.

## Ejecutar

Desde la carpeta del proyecto, ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`. Para jugar desde un teléfono o tablet conectado a la misma red que la computadora que sirve el juego, abrir la IP local de esa computadora en el móvil y permitir el puerto en el firewall.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar.
- En pantallas táctiles, arrastrar tu lado de la cancha o usar los botones en pantalla.

## Verificación V0.2.0

- **VERIFICADO:** sintaxis de JavaScript, referencias locales, 15 power-ups registrados y con efecto asignado, 90 IDs de personajes únicos, distribución exacta 30 dioses / 30 héroes / 15 titanes / 15 monstruos y 35 arenas.
- **VERIFICADO:** filtros de selección y códice incluyen las cuatro categorías; los poderes de titanes y monstruos usan los efectos de combate existentes.
- **NO VERIFICADO:** partida interactiva completa en navegador real, balance de todas las habilidades, FPS medidos y controles en dispositivos físicos. No se declara una cifra de FPS sin medición.
