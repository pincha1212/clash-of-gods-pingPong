# Clash of Gods — Divine Arena V0.1.6

Juego arcade de ping-pong divino en HTML/CSS/JavaScript nativos, con 20 dioses, habilidades, CPU y multijugador local. No requiere compilación ni frameworks; todos los archivos del proyecto están en la raíz.

## Ejecutar

Desde la carpeta del proyecto, ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`. Para jugar desde un teléfono o tablet conectado a la misma red que la computadora que sirve el juego, abrir la IP local de esa computadora en el móvil y permitir el puerto en el firewall.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar.
- En pantallas táctiles, arrastrar el lado propio de la cancha o usar los botones en pantalla.

## Cambios V0.1.6

- Se agregan Thor, Medusa, Gaia, Thoth, Kali y Apolo; el elenco pasa de 14 a 20 dioses.
- Se elimina la contrapartida circular. Cada dios pertenece a Piedra, Papel o Tijera: Piedra vence a Tijera; Tijera vence a Papel; Papel vence a Piedra. Las ventajas modifican el efecto de las habilidades y el impulso de la pelota en los golpes; los emparejamientos de la misma clase son neutrales.
- La selección y el códice muestran clase, ventajas y debilidades.
- El canvas estático de la arena se prerenderiza una vez y se reutiliza como imagen de fondo. Se reducen la estela a tres posiciones, las partículas a 28 simultáneas y los efectos por activación. Se eliminan sombras/filtros visuales de la arena durante la partida.
- La pelota permanece blanca; las habilidades se distinguen mediante auras y efectos breves. Se agregan habilidades funcionales para los seis dioses nuevos.
- Se ajusta la grilla de selección y el códice para mostrar más personajes en pantallas pequeñas.

## Verificación

- **VERIFICADO:** sintaxis JavaScript, imports/referencias locales, 20 dioses definidos, cada dios asignado exactamente a una clase, reglas Piedra-Papel-Tijera y ZIP íntegro.
- **NO VERIFICADO:** FPS medidos, balance tras partidas reales, controles físicos en dispositivos reales y ajuste visual en navegadores/dispositivos concretos. El prerenderizado y la reducción de partículas disminuyen trabajo gráfico por fotograma, pero la mejora real debe medirse en el dispositivo.
