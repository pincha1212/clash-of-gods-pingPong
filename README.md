# Clash of Gods — Divine Arena V0.2.5

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

Hay 27 potenciadores que aparecen aleatoriamente durante la partida. Pueden coexistir hasta cinco objetos normales y, mientras haya espacio, aparece uno nuevo aproximadamente cada 2–3 segundos. La pelota recoge el objeto y el último jugador que la golpeó recibe el efecto correspondiente:

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
26. **Barricada rúnica:** al recogerla, invoca una formación aleatoria de muros rúnicos en el centro durante aproximadamente un segundo.
27. **Tempestad divina:** transforma visualmente toda la arena, genera ráfagas que desvían la pelota y añade un efecto eléctrico temporal.

Los objetos aparecen cuando está activada la opción **Objetos de arena**.

## Barricadas y cambios de ambiente (V0.2.5)

- Las barricadas ya no aparecen automáticamente ni generan objetos extra. Solo aparecen cuando la pelota recoge el power-up **Barricada rúnica**.
- La formación se elige entre cuatro patrones geométricos, dura aproximadamente un segundo y la pelota rebota en sus segmentos; las paletas no quedan bloqueadas.
- **Tempestad divina** modifica el aspecto de toda la arena, añade trazos eléctricos y ráfagas que afectan la trayectoria de la pelota.
- Eclipse, Prisma, Terremoto, Viento cruzado, Pozo gravitatorio y Trayectoria serpentina también alteran temporalmente la apariencia o las condiciones de la cancha.
- Los efectos de ambiente se dibujan encima de la arena elegida y debajo de la pelota y las paletas, para conservar la legibilidad del combate.

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


## Mejoras de física V0.2.3

- Las colisiones con paletas comprueban el recorrido de la pelota durante el fotograma para reducir los casos de atravesamiento a alta velocidad.
- Las barricadas rúnicas usan una comprobación de segmento contra rectángulos ampliados por el radio de la pelota para detectar impactos en segmentos estrechos.
- Al marcar un punto, la actualización de física termina en ese mismo fotograma; no se procesan objetos sobre la pelota recién reiniciada.
- Se limita la velocidad de la pelota después de aplicar fuerzas y modificadores temporales.
- El reinicio de potenciadores limpia los temporizadores y tamaños alterados de las paletas.
- El intercambio de posición usa la altura configurada de la arena en vez de un valor fijo.

## Verificación V0.2.3

- **VERIFICADO:** comprobación de sintaxis de los módulos JavaScript activos.
- **VERIFICADO:** pruebas automatizadas aisladas de colisión barrida con paleta, rebote de barricada, reinicio de potenciadores y cierre del procesamiento después de anotar.
- **VERIFICADO:** integridad del delta y presencia de los archivos necesarios.
- **NO VERIFICADO:** partida completa en navegador real, balance competitivo y pruebas en móviles físicos.

## Aplicar la actualización V0.2.3

1. Conserva una copia de seguridad de la carpeta actual.
2. Extrae `clash-of-gods-delta-v0.2.3.zip` en una carpeta temporal.
3. Copia los archivos del delta sobre la carpeta raíz del proyecto V0.2.2 y acepta reemplazar los archivos incluidos.
4. Conserva `AUDITORIA-FUNCIONAL-V0.2.2.md` como informe de revisión de la versión base.
5. Ejecuta el juego con un servidor local y revisa manualmente los flujos enumerados en el informe.

El delta no reemplaza todos los archivos del proyecto; solo incluye los archivos modificados y el informe de auditoría.


## Mejoras de combate V0.2.4

- La dirección del golpe ahora responde de forma moderada al movimiento vertical de la paleta, dando más control para colocar la pelota.
- Los contactos dentro de una franja de precisión (entre el 22 % y el 38 % de la mitad de la paleta desde el centro) producen un golpe preciso con un pequeño impulso y una señal audiovisual.
- La pelota gana intensidad gradualmente a medida que crece el intercambio, con límite global para evitar velocidades extremas.
- Se conserva el modificador de pelota pesada o relámpago al devolver la pelota; la velocidad base de cada efecto ya no se reemplaza por la velocidad normal en el siguiente golpe.
- El ángulo de salida queda limitado para evitar trayectorias excesivamente verticales que alarguen intercambios sin avance horizontal.
- El movimiento de paleta se mide tanto con teclado como con arrastre táctil; la CPU también genera una medida de movimiento compatible.

## Verificación V0.2.4

- **VERIFICADO:** sintaxis de todos los módulos JavaScript cargados por `index.html`.
- **VERIFICADO:** pruebas automatizadas aisladas de las fórmulas de velocidad, límite de ángulo y cálculo de movimiento de paleta.
- **NO VERIFICADO:** partida completa en navegador real, balance de la franja de precisión, sensación de control en pantalla táctil ni rendimiento en dispositivos físicos.

## Aplicar la actualización V0.2.4

1. Conserva una copia de tu carpeta V0.2.3.
2. Extrae `clash-of-gods-delta-v0.2.4.zip` en una carpeta temporal.
3. Copia los archivos incluidos en la raíz de tu proyecto V0.2.3 y acepta reemplazar los archivos correspondientes.
4. Abre el juego y prueba golpes con la paleta en movimiento, golpes de precisión y los power-ups de pelota pesada y relámpago.

Este delta no sustituye el proyecto completo.


## Cambios de power-ups V0.2.5

- Se agregan Barricada rúnica y Tempestad divina, para un total de 27 power-ups.
- Se elimina la aparición autónoma y periódica de barricadas: la formación solo se activa al recoger su objeto.
- Se amplían los efectos visuales de ambiente para Viento cruzado, Pozo gravitatorio, Trayectoria serpentina y Tempestad divina, sin reemplazar la identidad de la arena elegida.
- Tempestad divina combina cambio ambiental, ráfagas físicas y un efecto temporal de pelota relámpago.

## Verificación V0.2.5

- **VERIFICADO:** sintaxis de los módulos JavaScript activos.
- **VERIFICADO:** catálogo con 27 IDs únicos; activación automatizada de cada power-up; barricadas creadas al activar su power-up y sin temporizador de aparición automática.
- **VERIFICADO:** integridad del delta.
- **NO VERIFICADO:** partida completa en navegador real, legibilidad de todos los efectos en cada arena y rendimiento en dispositivos físicos.

## Aplicar la actualización V0.2.5

1. Conserva una copia de seguridad de tu proyecto V0.2.4.
2. Extrae el delta en una carpeta temporal.
3. Copia los archivos incluidos sobre la raíz del proyecto V0.2.4 y acepta reemplazar esos archivos.
4. Activa Objetos de arena y comprueba que las barricadas solo aparezcan después de recoger el power-up correspondiente.
5. Prueba Tempestad divina, Eclipse, Prisma y Viento cruzado en varias arenas.
