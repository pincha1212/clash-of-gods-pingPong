# Clash of Gods — Divine Arena V0.1.4

Prototipo arcade de ping-pong divino con doce dioses, habilidades activas, modo contra CPU y modo local para dos jugadores. Proyecto estático en la raíz, con HTML, CSS y JavaScript nativos; no requiere compilación ni frameworks.

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

## Cambios V0.1.4

- Modo de combate apaisado para teléfonos y tablets: oculta cabecera y pie durante la partida, compacta marcador y habilidades, y reserva la zona central para el canvas.
- El canvas ahora tiene fondo cósmico, constelaciones discretas, marco energético, cancha con profundidad, núcleo rúnico central, red iluminada, paletas facetadas y estelas más intensas para la pelota.
- Zeus se incorpora con **Rayo del Olimpo**: acelera la pelota y ralentiza brevemente al rival.
- Anubis se incorpora con **Juicio de la Duat**: rescata una pelota que está por salir por su lado; si no está en peligro inmediato, concede un escudo temporal.
- El ciclo de contrapartidas queda cerrado en doce dioses: Raijin → Fujin → Kagutsuchi → Susanoo → Amaterasu → Inari → Hades → Atenea → Odín → Quetzalcóatl → Zeus → Anubis → Raijin.
- Cada dios contrarresta al siguiente y es contrarrestado por el anterior; no existe un dios superior a todos. Frente a la contrapartida directa, la habilidad recibe un modificador de efecto y 15% menos de recarga. Si está contrarrestado, el efecto se reduce y la recarga aumenta 15%. Los demás enfrentamientos no reciben modificadores.
- El bloqueo de orientación se intenta en dispositivos compatibles, pero el navegador puede rechazarlo. El diseño adaptable sigue siendo la alternativa principal.

## Verificación

- **VERIFICADO:** sintaxis de todos los módulos JavaScript; referencias locales de módulos, CSS y JS; doce dioses definidos; ciclo cerrado de doce contrapartidas; balance de llaves CSS; integridad de los ZIP completo y delta.
- **NO VERIFICADO:** partida en navegador real, ajuste visual final en dispositivos físicos, controles táctiles reales y bloqueo efectivo de orientación. El entorno de prueba bloqueó la navegación HTTP local del navegador automatizado.
