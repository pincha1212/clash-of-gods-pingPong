// skills.js - Lógica completa de habilidades de los dioses

const Skills = {
    // ============================
    // RAIJIN
    // ============================
    raijin: {
        activate: function (playerNum, p, god, ball, extraBalls) {
            let dir = playerNum === 1 ? 1 : -1;
            ball.vx = dir * ball.maxSpeed;
            ball.vy = (Math.random() - 0.5) * 8;
            EffectsManager.createExplosion(ball.x, ball.y, '#ffff00', 20);
            kickCamera(10, 0.02);
            showMessage('¡TORMENTA!', god.color, 90);
        },
        update: function (p, rival, dir, allBalls, frameCount) {
            let totalDur = 90;
            let elapsed = totalDur - p.timers.skillDur;
            let b = allBalls[0];
            if (!b) return;

            if (elapsed < 14) {
                b.vx *= 0.15;
                b.vy *= 0.15;
                b.color = '#ffff00';
                if (frameCount % 2 === 0) {
                    EffectsManager.createExplosion(b.x, b.y, '#ffff00', 4);
                }
            } else {
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
        activate: function (playerNum, p, god, ball, extraBalls) {
            let dir = playerNum === 1 ? 1 : -1;
            // Efecto visual de ráfaga
            for (let i = 0; i < 40; i++) {
                let angle = Math.random() * Math.PI * 2;
                let radius = 20 + Math.random() * 70;
                let x = ball.x + Math.cos(angle) * radius;
                let y = ball.y + Math.sin(angle) * radius;
                EffectsManager.createExplosion(x, y, '#aaddff', 3);
            }
            kickCamera(10, 0.03);
            showMessage('¡VENTISCA!', '#aaddff', 90);

            // Aceleración brutal hacia el rival
            let speed = ball.maxSpeed * 1.8;
            let angleToRival = Math.atan2(
                (playerNum === 1 ? paddle2.y + paddle2.height / 2 : paddle1.y + paddle1.height / 2) - ball.y,
                (playerNum === 1 ? paddle2.x : paddle1.x) - ball.x
            );
            // Añadir un pequeño ángulo aleatorio para que no sea perfectamente recto
            angleToRival += (Math.random() - 0.5) * 0.4; // ±0.2 radianes
            ball.vx = speed * Math.cos(angleToRival);
            ball.vy = speed * Math.sin(angleToRival);
            ball.currentSpeed = speed;
            ball.color = '#aaddff';
            ball.glowSize = 40;
            // Marcar que la pelota tiene efecto de viento (para desviarse)
            ball.windEffect = true;
            ball.windTimer = 60; // duración del efecto (1 segundo)
        },
        update: function (p, rival, dir, allBalls, frameCount) {
            // Este update se ejecuta mientras la habilidad está activa (skillDur > 0)
            // pero en esta versión no necesitamos hacer nada continuo, 
            // ya que el efecto principal ocurrió en activate.
            // Solo mantenemos el color y brillo mientras dure el temporizador.
            allBalls.forEach(b => {
                if (b.windEffect && b.windTimer > 0) {
                    b.color = '#aaddff';
                    b.glowSize = 40;
                    b.windTimer--;
                    // Pequeña turbulencia: desvío aleatorio suave
                    if (frameCount % 3 === 0) {
                        b.vx += (Math.random() - 0.5) * 0.4;
                        b.vy += (Math.random() - 0.5) * 0.4;
                        // Limitar velocidad para que no se dispare
                        let sp = Math.hypot(b.vx, b.vy);
                        if (sp > b.maxSpeed * 2) {
                            b.vx = (b.vx / sp) * b.maxSpeed * 2;
                            b.vy = (b.vy / sp) * b.maxSpeed * 2;
                        }
                    }
                    // Efectos visuales
                    if (frameCount % 2 === 0) {
                        EffectsManager.createExplosion(b.x + (Math.random() - 0.5) * 30, b.y + (Math.random() - 0.5) * 30, '#aaddff', 1);
                        EffectsManager.addSpeedLines(b.x, b.y, '#88ddff', 2);
                    }
                } else if (b.windEffect) {
                    // Cuando el temporizador termina, quitar el efecto
                    b.windEffect = false;
                    b.color = '#fff';
                    b.glowSize = 15;
                }
            });
        }
    },
    // ============================
    // KAGUTSUCHI - TRIDENTE ÍGNEO
    // ============================
    kagutsuchi: {
        activate: function (playerNum, p, god, ball, extraBalls) {
            let dir = playerNum === 1 ? 1 : -1;
            let angleSpread = Math.PI / 6; // 30 grados
            let speed = ball.currentSpeed * 1.2;

            // Crear dos bolas extras en abanico
            let angle1 = dir * (Math.PI / 2 + angleSpread);
            extraBalls.push({
                x: ball.x, y: ball.y,
                radius: ball.radius * 0.9,
                vx: speed * Math.cos(angle1),
                vy: speed * Math.sin(angle1),
                baseSpeed: ball.baseSpeed,
                currentSpeed: ball.currentSpeed,
                maxSpeed: ball.maxSpeed,
                color: '#ff5500',
                glowSize: 25,
                lastHitBy: p,
                trail: [],
                isVolatile: false,
                visible: true,
                volatileTimer: 0,
                isFireBall: true
            });

            let angle2 = dir * (Math.PI / 2 - angleSpread);
            extraBalls.push({
                x: ball.x, y: ball.y,
                radius: ball.radius * 0.9,
                vx: speed * Math.cos(angle2),
                vy: speed * Math.sin(angle2),
                baseSpeed: ball.baseSpeed,
                currentSpeed: ball.currentSpeed,
                maxSpeed: ball.maxSpeed,
                color: '#ff5500',
                glowSize: 25,
                lastHitBy: p,
                trail: [],
                isVolatile: false,
                visible: true,
                volatileTimer: 0,
                isFireBall: true
            });

            // Bola principal
            ball.color = '#ff5500';
            ball.glowSize = 30;
            ball.isFireBall = true;
            ball.vx = dir * speed * 0.8;
            ball.vy = 0;

            EffectsManager.createExplosion(ball.x, ball.y, '#ff5500', 60);
            kickCamera(12, 0.025);
            showMessage('¡TRIDENTE ÍGNEO!', '#ff5500', 90);
        },
        update: function (p, rival, dir, allBalls, frameCount) {
            // Si la habilidad ha terminado, desactivar el fuego
            if (p.timers.skillDur === 0) {
                allBalls.forEach(b => {
                    if (b.isFireBall) {
                        b.isFireBall = false;
                        b.color = '#fff';
                        b.glowSize = 15;
                    }
                });
                return;
            }

            // Efectos visuales de fuego
            allBalls.forEach(b => {
                if (b.isFireBall) {
                    b.color = '#ff5500';
                    b.glowSize = 30;
                    if (frameCount % 2 === 0) {
                        EffectsManager.createExplosion(b.x, b.y, '#ff5500', 2);
                        EffectsManager.addSpeedLines(b.x, b.y, '#ff8800', 3);
                    }
                }
            });
        }
    },

    // ============================
    // SUSANOO
    // ============================
    susanoo: {
        activate: function (playerNum, p, god, ball, extraBalls) {
            EffectsManager.createExplosion(ball.x, ball.y, '#3366ff', 30);
            kickCamera(8, 0.015);
            showMessage('¡MAREMOTO!', god.color, 90);
        },
        update: function (p, rival, dir, allBalls, frameCount) {
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
        activate: function (playerNum, p, god, ball, extraBalls) {
            let opp = playerNum === 1 ? paddle2 : paddle1;
            opp.timers.invert = god.skill.dur;
            if (window.MutationManager && window.MutationManager.active) {
                window.MutationManager.blindTimer = god.skill.dur;
            }
            EffectsManager.createExplosion(ball.x, ball.y, '#ffd700', 30);
            kickCamera(8, 0.015);
            showMessage('¡RESPLANDOR!', god.color, 90);
        },
        update: function (p, rival, dir, allBalls, frameCount) {
            // Sin efecto continuo
        }
    },

    // ============================
    // INARI
    // ============================
    inari: {
        activate: function (playerNum, p, god, ball, extraBalls) {
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
        update: function (p, rival, dir, allBalls, frameCount) {
            // No hay efecto continuo
        }
    }
};