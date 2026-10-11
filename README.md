# Clash of Gods — Divine Arena V0.1.1

Prototipo de ping-pong arcade con seis dioses, habilidades, modo contra CPU y modo local para dos jugadores. Archivos estáticos en la raíz; HTML, CSS y JavaScript nativos, sin proceso de compilación ni dependencias obligatorias.

## Ejecutar

Como el juego utiliza módulos JavaScript, no conviene abrir `index.html` directamente como `file://`. Ejecutar un servidor estático en la carpeta del proyecto. Por ejemplo, con Python instalado:

```bash
python -m http.server 8000
```

Abrir después `http://localhost:8000` en el navegador. También puede publicarse en un hosting estático que sirva los archivos tal cual.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar durante el combate.
- En pantallas pequeñas aparecen controles táctiles; las habilidades se activan tocando los botones de poder.

## Correcciones V0.1.1

- Las pantallas ocultas permanecen ocultas; el menú ya no pisa la navegación por prioridad CSS.
- El logotipo superior permite volver al menú y detiene la partida en curso.
- Los botones táctiles de habilidades activan los poderes; los controles del jugador 2 se ocultan en modo contra CPU.
- Los potenciadores recogidos por la pelota se asignan al jugador que golpeó la pelota por última vez, no siempre al jugador 1.
- Los nuevos duelos limpian entradas que hayan quedado presionadas y restablecen el texto del botón de pausa.

## Estado de verificación

- **VERIFICADO:** sintaxis de todos los módulos cargados desde `game.js`; referencias CSS/JS directas e identificadores HTML sin duplicados; pruebas automatizadas de navegación, selección, configuración, renderizado Canvas, pausa/reanudación y activación de habilidades por teclado y control táctil mediante un arnés de navegador.
- **PARCIALMENTE VERIFICADO:** carga nativa de los módulos ES desde una URL HTTP, ejecución de una partida completa hasta la pantalla de resultados y pruebas en Android/GitHub Pages/dispositivos físicos. El entorno usado para la prueba bloqueó las navegaciones HTTP locales, por lo que las interacciones se probaron mediante un arnés que incorpora los mismos módulos al HTML. Una fuente de Google Fonts tampoco pudo resolverse; se utilizan fuentes alternativas del sistema.

## Mantenimiento

`game.js` coordina la interfaz y el bucle principal. Física, controles, habilidades, estado, audio, efectos, HUD y navegación permanecen separados en sus propios archivos. Los scripts de la implementación antigua que no carga `index.html` se conservaron para evitar eliminaciones no solicitadas; no forman parte del flujo activo de esta versión.
