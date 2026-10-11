# Clash of Gods — Divine Arena V0.1.3

Prototipo de ping-pong arcade con diez dioses, habilidades, modo contra CPU y modo local para dos jugadores. Archivos estáticos en la raíz; HTML, CSS y JavaScript nativos, sin proceso de compilación ni dependencias obligatorias.

## Ejecutar

Como el juego utiliza módulos JavaScript, no conviene abrir `index.html` directamente como `file://`. Ejecutar un servidor estático en la carpeta del proyecto. Por ejemplo, con Python instalado:

```bash
python -m http.server 8000
```

Abrir después `http://localhost:8000` en el navegador. También puede publicarse en un hosting estático que sirva los archivos tal cual.

## Controles

- Jugador 1: `W` / `S`; habilidad: `Espacio`.
- Jugador 2 local: `↑` / `↓`; habilidad: `Enter`.
- `Esc`: pausar o reanudar durante el combate.
- En pantallas táctiles se puede arrastrar la mitad propia de la cancha para mover la paleta; los botones táctiles permiten moverla y activar habilidades. En modo local se habilitan los controles del segundo jugador.
- Las líneas de cancha, el perímetro y la red central tienen mayor contraste.
- Se agregan Hades (Sombra del inframundo: reduce temporalmente la paleta rival) y Atenea (Contraataque: potencia el siguiente golpe).


## Cambios V0.1.3

- Ajuste específico para jugar en horizontal en teléfonos y tablets: durante el combate se ocultan cabecera y pie, se compactan el marcador y los controles, y la cancha aprovecha el espacio disponible.
- Aviso para girar el dispositivo cuando el combate se abre en vertical; se puede cerrar y continuar. El navegador puede ignorar el intento de fijar la orientación, por lo que el diseño adaptable sigue siendo el mecanismo principal.
- Se agregan Odín y Quetzalcóatl, con habilidades activas propias.
- Sistema circular de contrapartidas: Raijin → Fujin → Kagutsuchi → Susanoo → Amaterasu → Inari → Hades → Atenea → Odín → Quetzalcóatl → Raijin. Cada dios contrarresta al siguiente y es contrarrestado por el anterior.
- Frente a su contrapartida directa, una habilidad tiene efecto reforzado y 15% menos de recarga; si el dios está contrarrestado, el efecto se reduce y la recarga aumenta 15%. Los duelos sin relación directa no reciben modificadores.

## Verificación V0.1.3

- **VERIFICADO:** sintaxis de los módulos JavaScript; referencias de módulos y estilos; diez dioses definidos; ciclo de contrapartidas cerrado, sin dioses fuera del ciclo; integridad de los ZIP completo y delta.
- **NO VERIFICADO:** juego en navegador real, uso táctil en un teléfono/tablet físico y bloqueo real de orientación. El entorno de prueba bloqueó la navegación HTTP local del navegador automatizado.
