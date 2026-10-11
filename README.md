# Clash of Gods — Delta V0.2.2

## Base requerida
Aplicar sobre **Clash of Gods V0.2.1**.

## Archivos incluidos
- `game.js`: renderizado de las barricadas rúnicas con doble contorno, glifos y pulso breve.
- `physics.js`: cuatro patrones de barricadas aleatorios, colisión círculo-rectángulo, duración aproximada de 1 segundo y dos power-ups cercanos que permanecen disponibles hasta 6,5 segundos.

## Comportamiento
- Las barricadas aparecen en el centro de la arena a intervalos aleatorios de aproximadamente 7,5–11 segundos.
- La pelota rebota contra ellas; no bloquean las paletas.
- Cada evento muestra dos power-ups cerca de la estructura, si queda espacio en el límite de objetos.
- La estética mantiene los tonos oscuros y acentos cian, violeta, dorado y rosa, con geometría ligera y sin efectos de blur costosos.

## Aplicación
Extraer el ZIP y reemplazar `game.js` y `physics.js` en la carpeta raíz del proyecto V0.2.1. El resto de archivos queda intacto.

## Estado de verificación
- VERIFICADO: sintaxis JavaScript de los archivos modificados.
- NO VERIFICADO: partida completa en navegador real ni dispositivos físicos.
