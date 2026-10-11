# Clash of Gods — Divine Arena V0.1.7

Juego arcade de ping-pong divino en HTML/CSS/JavaScript nativos. Incluye 30 dioses con habilidades propias, 30 arenas seleccionables, CPU y multijugador local. No requiere compilación ni frameworks; todos los archivos están en la raíz.

## Ejecutar

Desde la carpeta del proyecto, ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`. Para jugar desde un teléfono o tablet conectado a la misma red que la computadora que sirve el juego, abrir la IP local de esa computadora en el móvil y permitir el puerto en el firewall.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar.
- En pantallas táctiles, arrastrar tu lado de la cancha o usar los botones en pantalla.

## Cambios V0.1.7

- El combate no aplica ventajas automáticas por clase: depende de los reflejos, la elección de dios y el uso de habilidades.
- Se agregan Isis, Ares, Artemisa, Hermes, Freyja, Hel, Ra, Shiva, Tsukuyomi y Perséfone: el elenco pasa de 20 a 30 dioses. Cada uno dispone de habilidad funcional y entrada en el códice.
- Se incorpora un botón de ajustes con opciones de video (calidad gráfica, reducción de efectos y pantalla completa), sonido (activar/desactivar y volumen) y controles (mostrar/ocultar controles táctiles y referencia de teclas).
- Se puede elegir una arena antes de comenzar. Hay 30 arenas, una asociada a cada dios, con nombre y paleta temática; el fondo se prerenderiza y reutiliza.
- El canvas adapta el fondo a la arena elegida. La calidad baja reduce detalles estáticos y elimina estela de pelota; la opción de reducir efectos oculta partículas y adornos ambientales.

## Verificación

- **VERIFICADO:** sintaxis JavaScript, imports/referencias locales, 30 dioses, 30 arenas con IDs únicos, referencias locales y ZIP íntegros.
- **PARCIALMENTE VERIFICADO:** las opciones de ajustes y las 10 habilidades nuevas están conectadas a los sistemas del juego por inspección estática.
- **NO VERIFICADO:** FPS medidos, comportamiento visual en navegadores reales, pantalla completa y controles físicos en un dispositivo. No se declara una cifra de FPS sin medición.
