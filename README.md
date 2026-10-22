# Clash of Gods V0.2.87 — Colores Gamma y mutaciones persistentes

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


## V0.2.87 — Colores Gamma y mutaciones persistentes

- Las pelotas del modo Mutación cambian progresivamente de forma: polígonos, cristales y fragmentos angulares según la corrupción ambiental; los demás modos conservan su apariencia habitual.
- El tamaño físico aumenta gradualmente con la corrupción, con un tope del 16% y un radio máximo controlado. La escala se calcula desde el radio base para evitar acumulaciones entre fotogramas o saques.
- La estela mutante cambia de color, grosor y geometría: trazos elípticos en corrupción media y fragmentos triangulares con un trazo de energía en corrupción alta.
- La defensa Escudo del Abismo gana una membrana visual dedicada, mantiene su activación una vez por rally y limita la ampliación de la paleta al 22% durante 0,78 segundos. Los multiplicadores de movilidad siguen acotados para evitar ventajas excesivas.
- Revisión estática de sintaxis, versiones, JSON e integridad de paquetes. No se ejecutaron pruebas automatizadas ni una partida en navegador; la física visual y las colisiones quedan pendientes de validación manual.

## V0.2.84 — Renovación inicial del modo Mutación

- Se conservaron los pilares exclusivos del modo: corrupción por goles, vacunas, evolución ambiental y eventos propios de la Cancha Mutante. Los eventos de Mutación se controlan de forma independiente de los eventos genéricos de otros modos.
- Se dividieron los controles de preparación en mutaciones de pelota, defensa/movilidad, Avatar de corrupción, eventos de cancha y pudrición ambiental automática. Las vacunas siguen controlándose con el interruptor de objetos/vacunas.
- Se añadieron dos poderes mutantes: **Eco mutante** (40% de corrupción), que elige una distorsión aleatoria de ángulo, velocidad o rebote; y **Desgarro de fase** (85%), que provoca una alteración de trayectoria impredecible. Ambos tienen recargas propias.
- Se actualizaron los desbloqueos y el indicador de poderes para reflejar los nuevos umbrales.
- Revisión estática de sintaxis de los módulos modificados y validación de JSON/ZIP. No se ejecutaron pruebas automatizadas ni se inició una partida en navegador; queda pendiente la comprobación manual.


## V0.2.82 — Contadores y paneles sincronizados con cada pestaña

- El contador principal cambia según la pestaña activa: **124 registros** en Personajes y **17 registros** en Arenas de batalla.
- El selector de dioses, héroes, titanes y monstruos se oculta por completo al entrar en Arenas de batalla.
- Las herramientas complementarias de personajes y la exploración de escenarios solo aparecen en su sección correspondiente.
- Los paneles abiertos de favoritos y comparación quedan limitados a su pestaña, y vuelven a mostrarse únicamente dentro de ella.
- Se corrigieron reglas CSS que impedían que algunos elementos con la clase `hidden` desaparecieran por tener `display:grid`, `display:flex` o `display:block`.
- Se actualizó la versión de caché de la PWA para que cargue la interfaz corregida.
- Revisión estática de sintaxis JavaScript y validación de JSON/ZIP; no se ejecutaron pruebas automatizadas ni se abrió una partida en navegador.


## V0.2.80 — Navegación principal del Códice

- Se reorganizó la entrada al Códice con dos pestañas principales: **Personajes** y **Arenas de batalla**.
- La pestaña Personajes conserva las cuatro categorías existentes (dioses, héroes, titanes y monstruos) y sus herramientas originales.
- La pestaña Arenas de batalla abre directamente el catálogo de las 17 arenas, manteniendo búsqueda, filtro por tradición, fichas, favoritos y progreso independiente.
- Se eliminó la tarjeta de arenas del selector de categorías de personajes para evitar duplicar la navegación.


## V0.2.79 — Códice de arenas de batalla

- Se añadió la categoría **Arenas de batalla** al Códice, junto a dioses, héroes, titanes y monstruos.
- Se incorporaron fichas editoriales individuales para las 17 arenas: identidad, tradición cultural, contexto, elementos distintivos, presentación visual, relación con el combate y posibles líneas de descubrimiento.
- Se agregaron búsqueda y filtro por tradición mitológica, fichas detalladas, paleta visual del escenario, favoritos y progreso de exploración persistente en el navegador.
- Los favoritos y el progreso de arenas usan claves de almacenamiento independientes de los personajes para evitar mezclar registros.
- Las fichas distinguen la inspiración mitológica de las mecánicas implementadas; no afirman que eventos o efectos estén activos si dependen de los ajustes de la partida.
- Se actualizó el shell de la PWA para incluir el nuevo módulo `codex-arenas.js` y se incrementó la versión de caché a `0.2.79`.
- Revisión estática de sintaxis de los módulos modificados. No se ejecutaron pruebas automatizadas ni una partida en navegador; queda pendiente la comprobación manual de navegación, favoritos y persistencia.


## V0.2.84 — Mutaciones de cancha avanzadas

La Cancha Mutante incorpora tres eventos propios que se habilitan conforme avanza la corrupción: **Tirón gravitatorio** (curva la pelota hacia el eje central), **Fractura de fase** (invierte el componente vertical a mitad del evento) y **Cancha fracturada** (aplica impulsos verticales irregulares). Los eventos se mantienen separados del director de eventos genérico de los otros modos y respetan el interruptor propio de eventos de Mutación. La representación visual y los avisos previos identifican cada evento.

Revisión de esta entrega: comprobación estática de sintaxis, JSON y archivos ZIP. No se ejecutó una partida en navegador ni pruebas automatizadas.


- Colores Gamma por jugador en la configuración de Mutación; el color de la CPU se sortea al iniciar.
- Cancha dividida en los colores elegidos, con paletas y efectos ambientales tintados por lado.
- Cada pelota conserva su propio color de contacto, forma y escala mutante hasta que su siguiente efecto independiente la cambia.
- Estela de grietas con el color de la última paleta tocada.
- Siluetas mutantes de paleta dentro de su área de colisión, con cambios independientes y límites de forma.
