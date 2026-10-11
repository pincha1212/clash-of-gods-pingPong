# Clash of Gods — Divine Arena (reconstrucción v0.1)

Prototipo nuevo basado en el proyecto original de Clash of Gods / Epic Pong. Todos los archivos se mantienen en la raíz, como se solicitó.

## Ejecutar

Abrir `index.html` en un navegador moderno. El juego usa JavaScript ES Modules; si el navegador bloquea módulos al abrir el archivo directamente, ejecutar un servidor estático local (por ejemplo, la extensión Live Server de VS Code). No requiere Node, compilación, dependencias ni backend.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar durante el combate.
- En pantallas táctiles se muestran controles en la arena.

## Contenido de esta reconstrucción

- Menú principal, selección de seis dioses, configuración, códice, combate, pausa y resultado.
- Seis habilidades distintas con recargas.
- CPU con tres dificultades, modo local de dos jugadores, puntuación configurable y objetos opcionales.
- Guardado no requerido: el prototipo evita depender de almacenamiento local para poder probarlo fácilmente.
- Interfaz adaptable, Canvas 2D, partículas y sonido sintetizado opcional.

## Estado de verificación

- Sintaxis JavaScript: debe comprobarse con `node --check` usando modo módulo o revisión equivalente.
- Integración en navegador: pendiente de prueba manual en un navegador real.
- Controles táctiles y equilibrio de habilidades: pendientes de prueba en dispositivos reales.

## Principios

- Archivos planos en la raíz.
- Sin librerías externas obligatorias; la fuente web es decorativa y tiene alternativas del sistema.
- La física, las habilidades, los efectos, el estado y la interfaz están separados.
- La reconstrucción no modifica ni reemplaza el ZIP original.
