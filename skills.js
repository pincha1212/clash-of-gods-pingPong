// skills.js - Lógica completa de habilidades de los dioses

const Skills = {
    // ============================
    // RAIJIN
    // ============================
    raijin: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            // Efecto inmediato: disparo eléctrico
            let dir = playerNum === 1 ? 1 : -1;
            ball.vx = dir * ball.maxSpeed;
            ball.vy = (Math.random() - 0.5) * 8;
            EffectsManager.createExplosion(ball.x, ball.y, '#ffff00', 20);
            kickCamera(10, 0.02);
            showMessage('¡TORMENTA!', god.color, 90);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            let totalDur = 90;
            let elapsed = totalDur - p.timers.skillDur;
            // Solo afectamos a la primera bola (la principal)
            let b = allBalls[0];
            if (!b) return;

            if (elapsed < 14) {
                // Fase de carga
                b.vx *= 0.15;
                b.vy *= 0.15;
                b.color = '#ffff00';
                if (frameCount % 2 === 0) {
                    EffectsManager.createExplosion(b.x, b.y, '#ffff00', 4);
                }
            } else {
                // Fase de disparo en zigzag
                let progress = Math.min(1, (elapsed - 14) / (totalDur - 14));
                let currentRampSpeed = b.baseSpeed + (b.maxSpeed - b.baseSpeed) * progress;
                b.currentSpeed = currentRampSpeed;
                b.color = '#ffff00';
                let step = Math.floor((elapsed - 14) / 4);
                b.vx = dir * currentRampSpeed * 0.65;
                b.vy = ((step % 2 === 0) ? 1 : -1) * currentRampSpeed * 0.95;

                if ((elapsed - 14) % 4 === 0) {
                    EffectsManager.createExplosion(b.x, b.y, '#ffff00', 8);
                    EffectsManager.addSpeedLines(b.x, b.y, '#ffff00', 5);
                }
            }
        }
    },

    // ============================
    // FUJIN - VENTISCA ESPIRAL
    // ============================
    fujin: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            // Efecto de ventisca al activar
            EffectsManager.createExplosion(ball.x, ball.y, '#aaddff', 60);
            kickCamera(12, 0.03);
            ball.color = '#aaddff';
            // Partículas de hielo alrededor
            for (let i = 0; i < 30; i++) {
                let angle = Math.random() * Math.PI * 2;
                let radius = 40 + Math.random() * 60;
                let x = ball.x + Math.cos(angle) * radius;
                let y = ball.y + Math.sin(angle) * radius;
                EffectsManager.createExplosion(x, y, '#88ddff', 2);
            }
            showMessage('¡VENTISCA!', '#aaddff', 90);
            // Frenado inicial
            ball.vx *= 0.1;
            ball.vy *= 0.1;
            ball.color = '#00ffff';
            ball.glowSize = 30;
            showMessage('¡TORNADO!', '#00ffff', 60);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            let totalDur = 300;               // 5 segundos
            let elapsed = totalDur - p.timers.skillDur;

            allBalls.forEach(b => {
                // Estilo hielo
                b.color = '#aaddff';
                b.glowSize = 35;

                // Partículas de estela (cada frame)
                if (frameCount % 1 === 0) {
                    for (let i = 0; i < 3; i++) {
                        let angle = Math.random() * Math.PI * 2;
                        let dist = 5 + Math.random() * 15;
                        let px = b.x + Math.cos(angle) * dist;
                        let py = b.y + Math.sin(angle) * dist;
                        EffectsManager.createExplosion(px, py, '#88ddff', 1 + Math.random());
                    }
                }

                if (elapsed < 40) {
                    // Fase de succión
                    let targetX = p.x + p.width / 2;
                    let targetY = p.y + p.height / 2;
                    let dx = targetX - b.x;
                    let dy = targetY - b.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist > 5) {
                        let pull = 0.08;
                        b.vx += dx * pull * 0.1;
                        b.vy += dy * pull * 0.1;
                        if (dist < 30) {
                            b.vx *= 0.9;
                            b.vy *= 0.9;
                        }
                    }
                    EffectsManager.createExplosion(b.x, b.y, '#aaddff', 1.5);
                    EffectsManager.addSpeedLines(b.x, b.y, '#88ddff', 3);
                } else {
                    // Fase espiral: 3 vueltas (6π)
                    let spiralElapsed = elapsed - 40;
                    let maxSpiral = totalDur - 40; // 260 frames
                    let progress = Math.min(1, spiralElapsed / maxSpiral);

                    let radius = 30 + 100 * progress;
                    const totalAngle = 6 * Math.PI;
                    let angularSpeed = totalAngle / maxSpiral;
                    let angle = spiralElapsed * angularSpeed;

                    let centerX = p.x + p.width / 2 + dir * (60 + 120 * progress);
                    let centerY = rival.y + rival.height / 2 + (rival.y - (p.y + p.height / 2)) * progress * 0.3;

                    let targetX = centerX + radius * Math.cos(angle);
                    let targetY = centerY + radius * Math.sin(angle);

                    b.vx = (targetX - b.x) * 0.12;
                    b.vy = (targetY - b.y) * 0.12;

                    // Anillos de viento (tornado)
                    for (let j = 0; j < 12; j++) {
                        let heightOffset = j * -10;
                        let ringRadius = 15 + j * 10;
                        let vAngle = frameCount * 0.05 + j * 0.5;
                        let tx = b.x + Math.cos(vAngle) * ringRadius;
                        let ty = b.y + heightOffset + Math.sin(vAngle) * ringRadius * 0.15;
                        EffectsManager.addSpeedLines(tx, ty, '#aaddff', 1.5);
                        if (Math.random() > 0.9) {
                            EffectsManager.createExplosion(tx, ty, '#88ddff', 0.5);
                        }
                    }

                    // Lanzamiento final al completar la 3ª vuelta
                    if (angle >= 6 * Math.PI) {
                        let launchSpeed = b.maxSpeed * 1.4;
                        let angleToRival = Math.atan2(rival.y + rival.height / 2 - b.y, rival.x - b.x);
                        b.vx = launchSpeed * Math.cos(angleToRival);
                        b.vy = launchSpeed * Math.sin(angleToRival);
                        // Explosión de hielo
                        EffectsManager.createExplosion(b.x, b.y, '#aaddff', 40);
                        for (let i = 0; i < 20; i++) {
                            let angleOff = Math.random() * Math.PI * 2;
                            let distOff = 20 + Math.random() * 40;
                            let px = b.x + Math.cos(angleOff) * distOff;
                            let py = b.y + Math.sin(angleOff) * distOff;
                            EffectsManager.createExplosion(px, py, '#88ddff', 2);
                        }
                        // Congelar rival
                        rival.timers.hielo = Math.max(rival.timers.hielo, 60);
                        showMessage('¡VENTISCA ARRASADORA!', '#b0e0ff', 90);
                    }
                }
            });
        }
    },

    // ============================
    // KAGUTSUCHI
    // ============================
    kagutsuchi: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            // Efecto de fuego al activar
            EffectsManager.createExplosion(ball.x, ball.y, '#ff5500', 40);
            kickCamera(10, 0.02);
            showMessage('¡LLAMARADA!', god.color, 90);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            allBalls.forEach(b => {
                b.color = '#ff5500';
                if (frameCount % 3 === 0) {
                    EffectsManager.createExplosion(b.x, b.y, '#ff5500', 2);
                }
            });
        }
    },

    // ============================
    // SUSANOO
    // ============================
    susanoo: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            EffectsManager.createExplosion(ball.x, ball.y, '#3366ff', 30);
            kickCamera(8, 0.015);
            showMessage('¡MAREMOTO!', god.color, 90);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            // La ralentización se aplica en el bucle principal (susaSlow)
            // Aquí solo efectos visuales
            allBalls.forEach(b => {
                if (frameCount % 5 === 0) {
                    EffectsManager.createExplosion(b.x, b.y, '#3366ff', 1);
                }
            });
        }
    },

    // ============================
    // AMATERASU
    // ============================
    amaterasu: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            let opp = playerNum === 1 ? paddle2 : paddle1;
            opp.timers.invert = god.skill.dur;
            if (window.MutationManager && window.MutationManager.active) {
                window.MutationManager.blindTimer = god.skill.dur;
            }
            EffectsManager.createExplosion(ball.x, ball.y, '#ffd700', 30);
            kickCamera(8, 0.015);
            showMessage('¡RESPLANDOR!', god.color, 90);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            // Sin efecto continuo
        }
    },

    // ============================
    // INARI
    // ============================
    inari: {
        activate: function(playerNum, p, god, ball, extraBalls) {
            if (window.MutationManager && window.MutationManager.active) {
                window.MutationManager.spawnHolograms(ball);
            } else {
                extraBalls.push({
                    x: ball.x, y: ball.y, radius: ball.radius,
                    vx: -ball.vx, vy: -ball.vy,
                    baseSpeed: ball.baseSpeed, currentSpeed: ball.currentSpeed,
                    maxSpeed: ball.maxSpeed, color: god.color, glowSize: 20,
                    lastHitBy: p, trail: [], isVolatile: false, visible: true, volatileTimer: 0
                });
                showMessage('¡SEÑUELO LUNAR!', god.color, 90);
            }
            EffectsManager.createExplosion(ball.x, ball.y, '#ff69b4', 20);
            kickCamera(6, 0.01);
        },
        update: function(p, rival, dir, allBalls, frameCount) {
            // No hay efecto continuo específico
        }
    }
};