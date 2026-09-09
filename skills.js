// skills.js - Habilidades NEUTRAS (sin efectos en el juego)
const Skills = {
    // Función base para activación: solo mensaje y flash básico
    _neutralActivate: function(playerNum, p, god, ball, extraBalls) {
        // Mensaje visual
        showMessage(`¡${god.skill.name}!`, god.color, 90);
        // Sonido (se reproduce en activateSkill, pero lo dejamos por si acaso)
        playSound('skill', 1.5);
        // Flash suave
        triggerFlash(god.color, 0.1);
        // NO se modifica la velocidad, ni posición, ni se crean bolas extra
    },

    // Función base para update: no hace nada
    _neutralUpdate: function(p, rival, dir, allBalls, frameCount) {
        return; // vacío
    },

    // Todos los dioses usan la misma lógica neutra
    raijin: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            Skills._neutralActivate(playerNum, p, god, ball, extraBalls);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            Skills._neutralUpdate(p, rival, dir, allBalls, frameCount);
        }
    },
    fujin: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            Skills._neutralActivate(playerNum, p, god, ball, extraBalls);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            Skills._neutralUpdate(p, rival, dir, allBalls, frameCount);
        }
    },
    kagutsuchi: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            Skills._neutralActivate(playerNum, p, god, ball, extraBalls);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            Skills._neutralUpdate(p, rival, dir, allBalls, frameCount);
        }
    },
    susanoo: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            Skills._neutralActivate(playerNum, p, god, ball, extraBalls);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            Skills._neutralUpdate(p, rival, dir, allBalls, frameCount);
        }
    },
    amaterasu: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            Skills._neutralActivate(playerNum, p, god, ball, extraBalls);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            Skills._neutralUpdate(p, rival, dir, allBalls, frameCount);
        }
    },
    inari: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            Skills._neutralActivate(playerNum, p, god, ball, extraBalls);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            Skills._neutralUpdate(p, rival, dir, allBalls, frameCount);
        }
    }
};