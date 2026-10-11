# Clash of Gods — Divine Arena V0.1.8

Juego arcade de ping-pong divino en HTML/CSS/JavaScript nativos. Incluye 30 dioses, 30 héroes, 30 arenas seleccionables, CPU y multijugador local. No requiere compilación ni frameworks; todos los archivos están en la raíz.

## Ejecutar

Desde la carpeta del proyecto, ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`. Para jugar desde un teléfono o tablet conectado a la misma red que la computadora que sirve el juego, abrir la IP local de esa computadora en el móvil y permitir el puerto en el firewall.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar.
- En pantallas táctiles, arrastrar tu lado de la cancha o usar los botones en pantalla.

## Cambios V0.1.8

- El combate no aplica ventajas automáticas por clase: depende de los reflejos, las estadísticas y el uso de habilidades.
- Se incorpora un botón de ajustes con opciones de video (calidad gráfica, reducción de efectos y pantalla completa), sonido (activar/desactivar y volumen) y controles (mostrar/ocultar controles táctiles y referencia de teclas).
- Se puede elegir una arena antes de comenzar. Hay 30 arenas, una asociada a cada dios, con nombre y paleta temática; el fondo se prerenderiza y reutiliza.
- El canvas adapta el fondo a la arena elegida. La calidad baja reduce detalles estáticos y elimina estela de pelota; la opción de reducir efectos oculta partículas y adornos ambientales.

## Verificación

- **VERIFICADO:** sintaxis de los módulos JavaScript, imports/referencias locales, 60 personajes con IDs únicos, 30 dioses, 30 héroes y 30 arenas. Se probó la activación de las 30 habilidades de héroes mediante una prueba automatizada.
- **PARCIALMENTE VERIFICADO:** la integración de modos, selección de personajes y códice fue comprobada por inspección estática; falta prueba interactiva en navegador real.
- **NO VERIFICADO:** FPS medidos, comportamiento visual en navegadores reales, pantalla completa y controles físicos en un dispositivo. No se declara una cifra de FPS sin medición.


## V0.1.8 — Héroes y dioses

- El elenco contiene 30 dioses y 30 héroes (60 personajes en total).
- Modos de elenco: solo dioses, solo héroes y héroes contra dioses.
- El códice primero permite elegir entre la sección de dioses y la de héroes.
- Se mantienen exactamente 30 arenas, una por cada dios; los héroes no añaden arenas.
- Los héroes disponen de habilidades funcionales compartiendo los sistemas físicos existentes.
- **VERIFICADO:** sintaxis, IDs únicos, distribución 30/30, 30 arenas, referencias locales y activación automatizada de habilidades de héroes.
- **NO VERIFICADO:** navegación interactiva en navegador real, partida completa en dispositivo físico y FPS medidos; no se declara una cifra sin medirla.
