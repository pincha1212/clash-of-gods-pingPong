# Clash of Gods V0.2.79 — Códice enciclopédico de arenas

## Dificultad de la CPU

- **Iniciación:** conserva una CPU más permisiva, con movimiento moderado y sin anticipación de la trayectoria.
- **Equilibrada:** mejora la velocidad de desplazamiento y anticipa brevemente la llegada de la pelota.
- **Divina:** aumenta claramente la velocidad de reacción y predice el punto de intercepción, teniendo en cuenta los rebotes contra los límites verticales de la arena.
- La CPU usa sus habilidades defensivas con mejor criterio, priorizando situaciones de peligro próximo o una oportunidad clara de bloqueo.
- Los efectos que ralentizan, congelan o invierten la paleta siguen aplicándose; la IA no los ignora.

## Compatibilidad y validación

- Actualizada la versión del proyecto, interfaz y caché PWA a `0.2.75`.
- Revisión estática de sintaxis de `physics.js` y `abilities.js`.
- Validación de JSON para `package.json` y `package-lock.json`.
- No se ejecutaron pruebas automatizadas ni una partida en navegador. Se recomienda validar manualmente las tres dificultades, en especial Divina, con rebotes, habilidades y eventos de arena activos.


## V0.2.76 — CPU multiball

- La CPU evalúa todas las pelotas activas que se aproximan a su lado y prioriza la que llegará primero.
- Predice la posición de impacto considerando rebotes verticales y conserva brevemente el objetivo cuando dos amenazas llegan casi al mismo tiempo, reduciendo cambios erráticos.
- En dificultad alta, aumenta la velocidad de desplazamiento.
- Validación estática: sintaxis de módulos y consistencia de versiones; no sustituye una partida manual.


## V0.2.77 — Power-ups ambientales con efecto real

- **Terremoto:** corregido para sacudir cada pelota activa, no solo la principal; los impulsos sísmicos son más notorios y se repiten durante la activación. Las grietas y ondas de choque también se ven en calidad baja y con movimiento reducido (sin animación en este último caso).
- **Prisma:** ahora refracta continuamente la trayectoria durante su duración, además de modificar el ángulo de los rebotes; ya no depende exclusivamente de que ocurra un golpe a tiempo.
- **Eclipse, viento, gravedad, trayectoria serpentina y tempestad:** ajustada la intensidad de las fuerzas para que se perciban mejor durante la partida sin saltarse el límite general de aceleración.
- Los efectos de terremoto se reinician correctamente al limpiar los power-ups y también funcionan en partidas con varias pelotas.
- Actualizada la versión visible, metadatos y caché de la PWA a `0.2.77`.
- Revisión estática de sintaxis y paquetes ZIP. No se ejecutaron pruebas automatizadas ni una partida en navegador; queda pendiente la validación manual de los efectos en juego.


## V0.2.78 — Control de reglas y aparición de Power-ups

- Catálogo de 58 Power-ups verificado: cada identificador registrado tiene una rama de aplicación. La aparición usa una bolsa barajada sin repetición hasta recorrer el catálogo completo; el ciclo persiste entre partidas para evitar que cada nueva partida vuelva a ocultar los mismos poderes.
- El selector de elenco queda en la pantalla inicial de personajes. Se eliminó el selector duplicado de configuración y su antigua ruta de retorno a Personajes.
- Se agregaron preferencias independientes en Ajustes para eventos ambientales, Power-ups/objetos y habilidades de personaje. Los controles se sincronizan con las reglas de preparación y se aplican durante una partida.
- Desactivar eventos detiene avisos, efectos físicos y visuales de eventos de arena y de crónicas; las reglas centrales de Mutación se conservan, pero sus pulsos de arena se pueden desactivar. Las vacunas de Mutación siguen apareciendo porque son un recurso esencial del modo.
- Desactivar Power-ups retira los objetos sin recoger y detiene nuevas apariciones en partidas compatibles. El jefe Jörmungandr conserva su restricción específica de no usar Power-ups.
- Actualizados versión visible, metadatos del paquete, README y caché de la PWA a `0.2.78`.
- Revisión estática de registro de Power-ups, flujos y cambios de estado; no se ejecutaron pruebas automatizadas ni partida en navegador.


## V0.2.79 — Códice de arenas de batalla

- Se añadió la categoría **Arenas de batalla** al Códice, junto a dioses, héroes, titanes y monstruos.
- Se incorporaron fichas editoriales individuales para las 17 arenas: identidad, tradición cultural, contexto, elementos distintivos, presentación visual, relación con el combate y posibles líneas de descubrimiento.
- Se agregaron búsqueda y filtro por tradición mitológica, fichas detalladas, paleta visual del escenario, favoritos y progreso de exploración persistente en el navegador.
- Los favoritos y el progreso de arenas usan claves de almacenamiento independientes de los personajes para evitar mezclar registros.
- Las fichas distinguen la inspiración mitológica de las mecánicas implementadas; no afirman que eventos o efectos estén activos si dependen de los ajustes de la partida.
- Se actualizó el shell de la PWA para incluir el nuevo módulo `codex-arenas.js` y se incrementó la versión de caché a `0.2.79`.
- Revisión estática de sintaxis de los módulos modificados. No se ejecutaron pruebas automatizadas ni una partida en navegador; queda pendiente la comprobación manual de navegación, favoritos y persistencia.
