// skills.js - Habilidades jugables de los seis dioses
// Primera versión de prueba: reutiliza los temporizadores y efectos existentes.
const Skills = {
    _setDuration(p, frames) {
        if (p && p.timers) p.timers.skillDur = frames;
    },

    _message(text, god, target, duration = 60) {
        const x = target ? target.x + target.width / 2 : canvas.width / 2;
        const y = target ? target.y + target.height / 2 : canvas.height / 2;
        showMessage(text, god.color, duration, x, y);
    },

    _burst(target, color, amount = 16) {
        if (!target) return;
        EffectsManager.createExplosion(
            target.x + target.width / 2,
            target.y + target.height / 2,
            color,
            amount
        );
    },

    // RAIJIN — Tormenta: ralentiza al rival durante 1,5 segundos.
    raijin: {
        activate(playerNum, p, god) {
            const rival = playerNum === 1 ? paddle2 : paddle1;
            rival.timers.slow = Math.max(rival.timers.slow || 0, 90);
            Skills._setDuration(p, 90);
            Skills._burst(rival, god.color, 22);
            EffectsManager.addSpeedLines(
                rival.x + rival.width / 2,
                rival.y + rival.height / 2,
                god.color,
                14
            );
            Skills._message('¡DESCARGA!', god, rival);
        }
    },

    // FUJIN — Ráfaga: desplazamiento instantáneo hacia la altura de la pelota.
    fujin: {
        activate(playerNum, p, god, ball) {
            const center = p.y + p.height / 2;
            const difference = ball.y - center;
            const maxDash = Math.max(45, p.height * 0.7);
            const dash = Math.max(-maxDash, Math.min(maxDash, difference));
            p.y = Math.max(0, Math.min(canvas.height - p.height, p.y + dash));
            Skills._setDuration(p, 18);
            Skills._burst(p, god.color, 20);
            EffectsManager.addSpeedLines(
                p.x < canvas.width / 2 ? p.x + 8 : p.x + p.width - 8,
                p.y + p.height / 2,
                god.color,
                22
            );
            Skills._message('¡RÁFAGA!', god, p);
        }
    },

    // KAGUTSUCHI — Llamarada: acelera y enciende visualmente la pelota.
    kagutsuchi: {
        activate(playerNum, p, god, ball) {
            const currentSpeed = Math.hypot(ball.vx, ball.vy);
            if (currentSpeed > 0.01) {
                const speedLimit = ball.maxSpeed || 22;
                const nextSpeed = Math.min(speedLimit, currentSpeed * 1.35);
                const scale = nextSpeed / currentSpeed;
                ball.vx *= scale;
                ball.vy *= scale;
                ball.currentSpeed = nextSpeed;
            }
            ball.color = god.color;
            ball.glowSize = Math.max(ball.glowSize || 0, 28);
            Skills._setDuration(p, 90);
            EffectsManager.addSpeedLines(ball.x, ball.y, god.color, 26);
            EffectsManager.createExplosion(ball.x, ball.y, god.color, 18);
            Skills._message('¡LLAMARADA!', god, p);
        }
    },

    // SUSANOO — Maremoto: bloquea una pelota que iba a conceder un punto.
    susanoo: {
        activate(playerNum, p, god) {
            p.shield = true;
            Skills._setDuration(p, 30);
            Skills._burst(p, god.color, 24);
            Skills._message('¡ESCUDO ACTIVO!', god, p);
        }
    },

    // AMATERASU — Resplandor: amplía la paleta durante 2 segundos.
    amaterasu: {
        activate(playerNum, p, god) {
            p.timers.titan = Math.max(p.timers.titan || 0, 120);
            Skills._setDuration(p, 120);
            Skills._burst(p, god.color, 24);
            Skills._message('¡RESPLANDOR!', god, p);
        }
    },

    // INARI — Espejismo: invierte los controles del rival durante 1,5 segundos.
    inari: {
        activate(playerNum, p, god) {
            const rival = playerNum === 1 ? paddle2 : paddle1;
            rival.timers.invert = Math.max(rival.timers.invert || 0, 90);
            Skills._setDuration(p, 90);
            Skills._burst(rival, god.color, 20);
            Skills._message('¡ESPEJISMO!', god, rival);
        }
    }
};
