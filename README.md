# Clash of Gods — Divine Arena V0.1.5

Prototipo arcade de ping-pong divino con catorce dioses, habilidades activas, modo contra CPU y modo local para dos jugadores. Proyecto estático en la raíz, con HTML, CSS y JavaScript nativos; no requiere compilación ni frameworks.

## Ejecutar

Como el juego utiliza módulos JavaScript, no conviene abrir `index.html` directamente como `file://`. Ejecutar un servidor estático dentro de la carpeta del proyecto:

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000` en ese mismo dispositivo. Si el servidor corre en una computadora y se quiere jugar desde el teléfono o la tablet, usar la dirección IP local de la computadora en lugar de `localhost`, con ambos dispositivos en la misma red y el puerto permitido por el firewall.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar durante el combate.
- En pantallas táctiles se puede arrastrar la mitad propia de la cancha para mover la paleta; los botones táctiles permiten moverla y activar habilidades. En modo CPU se ocultan los controles del segundo jugador.

## Cambios V0.1.5

- Optimización visual para mejorar la fluidez: se quitaron gradientes radiales, sombras grandes y trazados decorativos costosos del renderizado de cada fotograma.
- La pelota se mantiene blanca. Las habilidades ya no recolorean su cuerpo; sus efectos se dibujan alrededor de la pelota o de la paleta durante un intervalo corto.
- La estela de la pelota se redujo a cinco posiciones como máximo. Las partículas se limitaron a 60 activas, cada activación genera un máximo de diez y se dibujan sin sombras.
- El aura del personaje se ilumina con el color de su divinidad cuando activa una habilidad. Zeus produce rayos breves; Raijin una señal de tormenta/viento; Kagutsuchi un aro ígneo; Poseidón ondas; Loki un espejismo.
- Se agregan Poseidón, que modifica la trayectoria vertical y ralentiza ligeramente al rival, y Loki, que invierte temporalmente sus controles.
- El ciclo de contrapartidas se amplía a catorce dioses: Raijin → Fujin → Kagutsuchi → Susanoo → Amaterasu → Inari → Hades → Atenea → Odín → Quetzalcóatl → Zeus → Anubis → Poseidón → Loki → Raijin.

## Verificación

- **VERIFICADO:** sintaxis de los módulos JavaScript; referencias locales de módulos, CSS y JS; catorce dioses definidos; ciclo de contrapartidas cerrado; límites de partículas y estela; integridad de los ZIP.
- **NO VERIFICADO:** FPS medidos, partida en navegador real, ajuste visual en dispositivos físicos y controles táctiles reales. Sin una prueba en el dispositivo no se puede prometer una cifra de FPS ni una mejora idéntica en todos los equipos.
