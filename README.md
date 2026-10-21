# Clash of Gods V0.2.77 — Efectos ambientales corregidos y CPU divina

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
