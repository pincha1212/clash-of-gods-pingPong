# Clash of Gods V0.2.75 — IA divina más rápida e inteligente

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
