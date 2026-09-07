
        // --- GAME DATA & STATE ---
        const GODS = {
            raijin: { id: 'raijin', name: 'Raijin', icon: '⚡', color: '#00ffff', speed: 8, height: 100, desc: 'Equilibrado', skill: {name: 'Tormenta', cd: 600, dur: 120} },
            fujin: { id: 'fujin', name: 'Fujin', icon: '🌪️', color: '#55ff55', speed: 9.5, height: 80, desc: 'Veloz / Pequeño', skill: {name: 'Ráfaga', cd: 400, dur: 10} },
            kagutsuchi: { id: 'kagutsuchi', name: 'Kagutsuchi', icon: '🔥', color: '#ff3300', speed: 6.5, height: 110, desc: 'Golpes Fuertes', skill: {name: 'Llamarada', cd: 700, dur: 180} },
            susanoo: { id: 'susanoo', name: 'Susanoo', icon: '🌊', color: '#3366ff', speed: 5, height: 130, desc: 'Defensa Alta', skill: {name: 'Maremoto', cd: 600, dur: 150} }
        };

        const config = {
            p1: 'raijin',
            p2: 'fujin',
            winScore: 10,
            difficulty: 'normal',
            powerUps: true,
            mode: 'cpu'
        };

        let isPlaying = false;
        let isPaused = false; 
        let score1 = 0, score2 = 0;
        let rallyCount = 0;
        let shakeFrames = 0;
        let dominance = 50;
        let frameCount = 0;
        let animationId;
        
        let extraBalls = []; 
        let floatTexts = [];
        let records = JSON.parse(localStorage.getItem('clashGodsRec')) || { maxDiff: 0, maxRally: 0, wins: {raijin:0, fujin:0, kagutsuchi:0, susanoo:0} };

        // --- STREAMING_CHUNK:Initializing audio context and sound effects... ---
        // --- AUDIO ENGINE ---
        let audioCtx;
        function initAudio() {
            if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        }
        
        function playSound(type, intensity = 1) {
            if (!audioCtx || audioCtx.state !== 'running') return;
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            
            if (type === 'critical') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800 * intensity, t);
                osc.frequency.exponentialRampToValueAtTime(1600, t + 0.1);
            } else if (type === 'skill') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.linearRampToValueAtTime(800, t + 0.3);
            } else if (type === 'hit1' || type === 'hit2') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
            } else if (type === 'score' || type === 'powerup') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.4);
            }
            
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
            osc.start(t); osc.stop(t + 0.2);
        }

        // --- STREAMING_CHUNK:Defining UI navigation and menus... ---
        function navTo(screenId) {
            initAudio(); // Initialize audio on first interaction
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            document.getElementById(screenId).classList.remove('hidden');
        }

        function showRecords() {
            document.getElementById('rec-diff').innerText = records.maxDiff;
            document.getElementById('rec-rally').innerText = records.maxRally;
            document.getElementById('rec-win-raijin').innerText = records.wins.raijin || 0;
            document.getElementById('rec-win-fujin').innerText = records.wins.fujin || 0;
            document.getElementById('rec-win-kagu').innerText = records.wins.kagutsuchi || 0;
            document.getElementById('rec-win-susa').innerText = records.wins.susanoo || 0;
            navTo('screen-records');
        }

        // --- STREAMING_CHUNK:Defining Pause and Reset controls... ---
        function togglePause() {
            if (!isPlaying) return;
            isPaused = !isPaused;
            document.getElementById('screen-pause').classList.toggle('hidden', !isPaused);
            document.querySelector('#screen-game .btn').disabled = isPaused;
        }

        function restartGame() {
            isPaused = false;
            document.getElementById('screen-pause').classList.add('hidden');
            document.querySelector('#screen-game .btn').disabled = false;
            startGame();
        }

        function quitToMenu() {
            isPaused = false; isPlaying = false;
            document.getElementById('screen-pause').classList.add('hidden');
            document.querySelector('#screen-game .btn').disabled = false;
            navTo('screen-menu');
        }

        // --- STREAMING_CHUNK:Building Character Selection logic... ---
        function buildCharSelect() {
            const grid1 = document.getElementById('grid-p1');
            const grid2 = document.getElementById('grid-p2');
            grid1.innerHTML = ''; grid2.innerHTML = '';

            Object.values(GODS).forEach(god => {
                // P1 Card
                let c1 = document.createElement('div');
                c1.className = `char-card ${config.p1 === god.id ? 'selected-p1' : ''}`;
                c1.innerHTML = `<div class="char-icon">${god.icon}</div><div class="char-name">${god.name}</div><div class="char-stat">${god.desc}<br><span class="skill-desc">${god.skill.name}</span></div>`;
                c1.onclick = () => { config.p1 = god.id; buildCharSelect(); };
                grid1.appendChild(c1);

                // P2 Card
                let c2 = document.createElement('div');
                c2.className = `char-card ${config.p2 === god.id ? 'selected-p2' : ''}`;
                c2.innerHTML = `<div class="char-icon">${god.icon}</div><div class="char-name">${god.name}</div><div class="char-stat">${god.desc}<br><span class="skill-desc">${god.skill.name}</span></div>`;
                c2.onclick = () => { config.p2 = god.id; buildCharSelect(); };
                grid2.appendChild(c2);
            });
        }
        buildCharSelect();

        // --- STREAMING_CHUNK:Defining game entities and physics... ---
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        const container = document.getElementById('game-container');
        
        let paddle1 = { x: 20, y: 200, width: 12, height: 100, baseHeight: 100, speed: 8, baseSpeed: 8, color: '#fff', shield: false, timers: { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0 } };
        let paddle2 = { x: 768, y: 200, width: 12, height: 100, baseHeight: 100, speed: 6, baseSpeed: 6, color: '#fff', shield: false, timers: { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0 } };
        
        let ball = { x: 400, y: 250, radius: 10, vx: 0, vy: 0, baseSpeed: 7, currentSpeed: 7, maxSpeed: 22, color: '#fff', glowSize: 15, lastHitBy: null, trail: [] };
        let powerUps = [];
        
        function showMessage(text, color, duration = 60, x = canvas.width/2, y = canvas.height/4) {
            floatTexts.push({ text, color, x, y, life: duration, maxLife: duration });
        }

        // --- STREAMING_CHUNK:Defining Particle System... ---
        class ParticlePool {
            constructor(maxSize) {
                this.pool = [];
                for (let i = 0; i < maxSize; i++) {
                    this.pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, color: '', type: '', size: 0, radius: 0, maxRadius: 0, thickness: 0, life: 0, decay: 0 });
                }
            }
            spawn(x, y, color, type, multiplier = 1) {
                let p = this.pool.find(p => !p.active);
                if (!p) return;
                p.active = true; p.x = x; p.y = y; p.color = color; p.type = type; p.life = 1;
                if (type === 'burst') {
                    let angle = Math.random() * Math.PI * 2;
                    let speed = (Math.random() * 8 + 2) * multiplier;
                    p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed;
                    p.size = Math.random() * 5 + 2; p.decay = Math.random() * 0.03 + 0.02;
                } else if (type === 'trail') {
                    p.vx = (Math.random() - 0.5); p.vy = (Math.random() - 0.5);
                    p.size = Math.random() * 3 + 1; p.decay = 0.05;
                } else if (type === 'shockwave') {
                    p.radius = 5; p.maxRadius = 50 * multiplier; p.thickness = 3; p.decay = 0.05;
                }
            }
            updateAndDraw(ctx) {
                for (let i = 0; i < this.pool.length; i++) {
                    let p = this.pool[i];
                    if (!p.active) continue;
                    
                    if (p.type !== 'shockwave') { p.x += p.vx; p.y += p.vy; } 
                    else { p.radius += (p.maxRadius - p.radius) * 0.2; }
                    
                    p.life -= p.decay;
                    if (p.life <= 0) { p.active = false; continue; }

                    ctx.globalAlpha = p.life;
                    if (p.type === 'shockwave') {
                        ctx.strokeStyle = p.color; ctx.lineWidth = p.thickness * p.life;
                        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.stroke();
                    } else {
                        ctx.fillStyle = p.color; ctx.shadowBlur = p.type === 'burst' ? 15 : 5;
                        ctx.shadowColor = p.color;
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
                    }
                }
                ctx.globalAlpha = 1;
            }
            clear() { this.pool.forEach(p => p.active = false); }
        }
        const pManager = new ParticlePool(250);

        function createImpact(x, y, color, intensity = 1) {
            let limit = Math.min(Math.floor(20 * intensity), 30);
            for(let i = 0; i < limit; i++) pManager.spawn(x, y, color, 'burst', intensity);
            pManager.spawn(x, y, color, 'shockwave', intensity);
            shakeFrames = Math.floor(10 * intensity);
        }

        // --- STREAMING_CHUNK:Game Start, End, and Logic Flow... ---
        function applyConfig() {
            const c1 = GODS[config.p1]; const c2 = GODS[config.p2];
            config.winScore = parseInt(document.getElementById('cfg-score').value);
            config.difficulty = document.getElementById('cfg-diff').value;
            config.powerUps = document.getElementById('cfg-power').value === 'on';
            config.mode = document.getElementById('cfg-mode').value; 

            paddle1.color = c1.color; paddle1.baseHeight = c1.height; paddle1.baseSpeed = c1.speed;
            paddle2.color = c2.color; paddle2.baseHeight = c2.height; 
            
            // AI Difficulty Speed Modifier
            let diffMult = config.difficulty === 'easy' ? 0.7 : (config.difficulty === 'hard' ? 1.3 : 1);
            paddle2.baseSpeed = c2.speed * diffMult;

            // Apply Theme
            document.documentElement.style.setProperty('--c-p1', c1.color);
            document.documentElement.style.setProperty('--c-p2', c2.color);
            
            // Reset state
            score1 = 0; score2 = 0; dominance = 50; powerUps = []; pManager.clear();
            extraBalls = []; floatTexts = [];
            document.getElementById('score1').innerText = 0;
            document.getElementById('score2').innerText = 0;
            updateDominance();
        }

        function startGame() {
            applyConfig();
            navTo('screen-game');
            isPlaying = true;
            launchBall(Math.random() > 0.5 ? 1 : -1);
            if(animationId) cancelAnimationFrame(animationId);
            gameLoop();
        }

        function endGame() {
            isPlaying = false;
            let winner = score1 >= config.winScore ? GODS[config.p1] : (score2 >= config.winScore ? GODS[config.p2] : null);
            navTo('screen-result');
            if(winner) {
                document.getElementById('result-title').innerText = `${winner.icon} ${winner.name} GANA!`;
                document.getElementById('result-title').style.color = winner.color;
                document.getElementById('result-desc').innerText = `Dominio absoluto en la arena.`;
                
                // Guardar Récords
                let diff = Math.abs(score1 - score2);
                if (diff > records.maxDiff) records.maxDiff = diff;
                if (rallyCount > records.maxRally) records.maxRally = rallyCount;
                records.wins[winner.id] = (records.wins[winner.id] || 0) + 1;
                localStorage.setItem('clashGodsRec', JSON.stringify(records));
            } else {
                document.getElementById('result-title').innerText = "RENDICIÓN";
                document.getElementById('result-title').style.color = "#fff";
                document.getElementById('result-desc').innerText = "Has abandonado la batalla.";
            }
        }

        // --- STREAMING_CHUNK:Ball launching and scoring... ---
        function launchBall(direction) {
            ball.x = canvas.width / 2; ball.y = canvas.height / 2;
            ball.currentSpeed = ball.baseSpeed; ball.color = '#fff'; ball.glowSize = 15; ball.trail = [];
            let angle = (Math.random() * Math.PI/4) - Math.PI/8;
            ball.vx = direction * ball.currentSpeed * Math.cos(angle);
            ball.vy = ball.currentSpeed * Math.sin(angle);
            rallyCount = 0; ball.lastHitBy = null; extraBalls = []; // Reset multiball
            paddle1.timers = { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0 }; 
            paddle2.timers = { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0 };
            paddle1.shield = false; paddle2.shield = false;
            paddle2.speed = paddle2.baseSpeed;
        }

        function updateDominance() {
            let diff = score1 - score2;
            dominance = Math.max(10, Math.min(50 + (diff * (40/config.winScore)), 90));
            document.documentElement.style.setProperty('--dom-p1', `${dominance}%`);
            document.documentElement.style.setProperty('--dom-p2', `${100 - dominance}%`);
        }

        function scorePoint(player) {
            playSound('score');
            createImpact(canvas.width/2, canvas.height/2, player === 1 ? paddle1.color : paddle2.color, 2);
            
            // Comprobar Récord de Rally
            if (rallyCount > records.maxRally) { records.maxRally = rallyCount; showMessage("¡NUEVO RÉCORD RALLY!", "#ff0"); }

            let el = player === 1 ? document.getElementById('score1') : document.getElementById('score2');
            if(player === 1) score1++; else score2++;
            el.innerText = player === 1 ? score1 : score2;
            el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
            
            updateDominance();
            if(score1 >= config.winScore || score2 >= config.winScore) { endGame(); } 
            else { launchBall(player === 1 ? -1 : 1); }
        }

        // --- STREAMING_CHUNK:Inputs and Controls Setup... ---
        const keys = { w: false, s: false, up: false, down: false, space: false, enter: false };
        window.addEventListener('keydown', e => {
            if(e.key === 'w' || e.key === 'W') keys.w = true;
            if(e.key === 's' || e.key === 'S') keys.s = true;
            if(e.key === 'ArrowUp') keys.up = true;
            if(e.key === 'ArrowDown') keys.down = true;
            if(e.key === ' ') { keys.space = true; activateSkill(1); }
            if(e.key === 'Enter' || e.key === 'Shift') { keys.enter = true; activateSkill(2); }
            if(e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
        });
        window.addEventListener('keyup', e => {
            if(e.key === 'w' || e.key === 'W') keys.w = false;
            if(e.key === 's' || e.key === 'S') keys.s = false;
            if(e.key === 'ArrowUp') keys.up = false;
            if(e.key === 'ArrowDown') keys.down = false;
            if(e.key === ' ') keys.space = false;
            if(e.key === 'Enter' || e.key === 'Shift') keys.enter = false;
        });

        canvas.addEventListener('touchmove', e => {
            if (!isPlaying || isPaused) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleY = canvas.height / rect.height;
            const scaleX = canvas.width / rect.width;
            
            for(let i = 0; i < e.touches.length; i++) {
                let touch = e.touches[i];
                let touchX = (touch.clientX - rect.left) * scaleX;
                let touchY = (touch.clientY - rect.top) * scaleY;
                
                let targetY = touchY - (paddle1.height / 2);
                
                // Lado izquierdo: P1
                if(touchX < canvas.width / 2) {
                    let p1Max = paddle1.timers.hielo > 0 ? paddle1.baseSpeed * 0.4 : 999;
                    if(paddle1.timers.invert > 0) targetY = canvas.height - targetY; 
                    if (targetY > paddle1.y) paddle1.y += Math.min(targetY - paddle1.y, p1Max);
                    else if (targetY < paddle1.y) paddle1.y -= Math.min(paddle1.y - targetY, p1Max);
                    paddle1.y = Math.max(0, Math.min(paddle1.y, canvas.height - paddle1.height));
                } 
                // Lado derecho: P2
                else if (config.mode === '2p') {
                    let p2Max = paddle2.timers.hielo > 0 ? paddle2.baseSpeed * 0.4 : 999;
                    if(paddle2.timers.invert > 0) targetY = canvas.height - targetY;
                    if (targetY > paddle2.y) paddle2.y += Math.min(targetY - paddle2.y, p2Max);
                    else if (targetY < paddle2.y) paddle2.y -= Math.min(paddle2.y - targetY, p2Max);
                    paddle2.y = Math.max(0, Math.min(paddle2.y, canvas.height - paddle2.height));
                }
            }
        }, { passive: false });
        
        canvas.addEventListener('touchstart', e => {
            if(!isPlaying || isPaused) return;
            const rect = canvas.getBoundingClientRect();
            let touchX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
            if(touchX < 100) activateSkill(1);
            if(config.mode === '2p' && touchX > canvas.width - 100) activateSkill(2);
        }, {passive: false});

        // --- STREAMING_CHUNK:Activating Skills and AI Prediction... ---
        function activateSkill(playerNum) {
            if(isPaused) return;
            let p = playerNum === 1 ? paddle1 : paddle2;
            let god = GODS[playerNum === 1 ? config.p1 : config.p2];
            
            // Cooldown activo o habilidad en uso
            if(p.timers.skillCd > 0 || p.timers.skillDur > 0) return; 

            p.timers.skillCd = god.skill.cd;
            p.timers.skillDur = god.skill.dur;
            playSound('skill', 1.5);
            showMessage(`¡${god.skill.name}!`, god.color, 90, p.x < canvas.width/2 ? 150 : canvas.width-150, p.y);

            // Efectos Inmediatos
            if(god.id === 'fujin') {
                [ball, ...extraBalls].forEach(b => {
                    if((playerNum === 1 && b.vx < 0) || (playerNum === 2 && b.vx > 0)) b.vx *= -1; // Invierte
                    b.vx += (playerNum === 1 ? 4 : -4); // Empuje extra
                });
            }
        }

        function predictBallY(b, targetX) {
            let simX = b.x, simY = b.y, simVx = b.vx, simVy = b.vy;
            if((simVx > 0 && simX > targetX) || (simVx < 0 && simX < targetX)) return canvas.height/2; // Alejándose
            let steps = 0;
            while ((simVx > 0 && simX < targetX) || (simVx < 0 && simX > targetX)) {
                let timeToX = Math.abs((targetX - simX) / simVx);
                let timeToY = simVy > 0 ? (canvas.height - simY) / simVy : -simY / simVy;
                
                if (timeToY < timeToX) { // Rebota primero
                    simX += simVx * timeToY;
                    simY += simVy * timeToY;
                    simVy = -simVy;
                } else { // Llega al objetivo
                    simY += simVy * timeToX;
                    break;
                }
                if(steps++ > 20) break; // Límite seguridad
            }
            return simY;
        }

        // --- STREAMING_CHUNK:Main Update Logic for entities... ---
        function update() {
            if (!isPlaying || isPaused) return;
            frameCount++;

            // Textos flotantes
            for(let i=floatTexts.length-1; i>=0; i--) {
                floatTexts[i].life--;
                floatTexts[i].y -= 0.5;
                if(floatTexts[i].life <= 0) floatTexts.splice(i, 1);
            }

            // PowerUps y Cooldowns Mantenimiento
            [paddle1, paddle2].forEach(p => {
                if (p.timers.titan > 0) { p.height = p.baseHeight * 1.8; p.timers.titan--; } 
                else if (p.timers.hielo > 0) { p.height = p.baseHeight * 0.5; p.timers.hielo--; } 
                else { p.height = p.baseHeight; }
                
                if (p.timers.ghost > 0) p.timers.ghost--;
                if (p.timers.invert > 0) p.timers.invert--;
                if (p.timers.skillCd > 0) p.timers.skillCd--;
                if (p.timers.skillDur > 0) p.timers.skillDur--;

                p.y = Math.max(0, Math.min(p.y, canvas.height - p.height));
            });

            if(config.powerUps) {
                if (powerUps.length < 2 && frameCount % 350 === 0 && Math.random() > 0.3) {
                    const types = ['titan', 'hielo', 'ghost', 'multi', 'invert', 'shield'];
                    const weights = [0.25, 0.25, 0.1, 0.15, 0.15, 0.1]; // Probabilidades
                    let rand = Math.random(); let type = 'titan'; let acc = 0;
                    for(let i=0; i<types.length; i++) { acc += weights[i]; if(rand <= acc) { type = types[i]; break; } }
                    powerUps.push({ x: 250 + Math.random()*300, y: 100 + Math.random()*300, radius: 18, type: type, pulse: 0 });
                }
            }

            // P1 Move (Teclado)
            let p1Dir = 0;
            if (keys.w) p1Dir = -1; if (keys.s) p1Dir = 1;
            if(paddle1.timers.invert > 0) p1Dir *= -1;
            let p1Speed = paddle1.timers.hielo > 0 ? paddle1.baseSpeed * 0.4 : paddle1.baseSpeed;
            if (p1Dir === -1 && paddle1.y > 0) paddle1.y -= p1Speed;
            if (p1Dir === 1 && paddle1.y < canvas.height - paddle1.height) paddle1.y += p1Speed;

            // P2 Move
            if (config.mode === '2p') {
                let p2Dir = 0;
                if (keys.up) p2Dir = -1; if (keys.down) p2Dir = 1;
                if(paddle2.timers.invert > 0) p2Dir *= -1;
                let p2Speed = paddle2.timers.hielo > 0 ? paddle2.speed * 0.4 : paddle2.speed;
                if (p2Dir === -1 && paddle2.y > 0) paddle2.y -= p2Speed;
                if (p2Dir === 1 && paddle2.y < canvas.height - paddle2.height) paddle2.y += p2Speed;
            } else {
                // IA Predictiva
                let targetY = canvas.height / 2;
                if (ball.vx > 0) { 
                    let predictedY = (config.difficulty === 'hard' || config.difficulty === 'normal') ? predictBallY(ball, paddle2.x) : ball.y;
                    targetY = predictedY - paddle2.height / 2;
                }
                
                let errorMargin = config.difficulty === 'easy' ? 40 : (config.difficulty === 'hard' ? 5 : 20);
                errorMargin = Math.max(0, errorMargin - rallyCount); 
                
                let p2Speed = paddle2.timers.hielo > 0 ? paddle2.speed * 0.4 : paddle2.speed;
                
                if(paddle2.timers.invert > 0) {
                     if (paddle2.y < targetY) paddle2.y -= p2Speed;
                     else paddle2.y += p2Speed;
                } else {
                     if (paddle2.y < targetY - errorMargin) paddle2.y += p2Speed;
                     else if (paddle2.y > targetY + errorMargin) paddle2.y -= p2Speed;
                }
                paddle2.y = Math.max(0, Math.min(paddle2.y, canvas.height - paddle2.height));
            }

            // Habilidades Continuas
            if(paddle1.timers.skillDur > 0 && config.p1 === 'raijin') { ball.currentSpeed = ball.maxSpeed; ball.color = '#ff0'; }
            if(paddle2.timers.skillDur > 0 && config.p2 === 'raijin') { ball.currentSpeed = ball.maxSpeed; ball.color = '#ff0'; }
            
            if(paddle1.timers.skillDur > 0 && config.p1 === 'kagutsuchi') { ball.color = '#f50'; if(frameCount%3===0) pManager.spawn(ball.x, ball.y, '#f50', 'burst', 0.5); }
            if(paddle2.timers.skillDur > 0 && config.p2 === 'kagutsuchi') { ball.color = '#f50'; if(frameCount%3===0) pManager.spawn(ball.x, ball.y, '#f50', 'burst', 0.5); }
            
            let susaSlow = (paddle1.timers.skillDur > 0 && config.p1 === 'susanoo') || (paddle2.timers.skillDur > 0 && config.p2 === 'susanoo') ? 0.6 : 1;

            // --- STREAMING_CHUNK:Ball Update and Physics... ---
            // Iterar Pelotas (Multibola)
            let allBalls = [ball, ...extraBalls];
            for (let bIndex = allBalls.length - 1; bIndex >= 0; bIndex--) {
                let b = allBalls[bIndex];
                
                // Mover Pelota
                b.x += b.vx * susaSlow; b.y += b.vy * susaSlow;

                // Rastro
                b.trail.push({x: b.x, y: b.y});
                if(b.trail.length > 8) b.trail.shift();

                // Recoger PowerUp
                if (b.lastHitBy) {
                    for (let i = powerUps.length - 1; i >= 0; i--) {
                        let pu = powerUps[i];
                        let dist = Math.hypot(b.x - pu.x, b.y - pu.y);
                        if (dist < b.radius + pu.radius) {
                            playSound('powerup');
                            let p = b.lastHitBy; let opp = p === paddle1 ? paddle2 : paddle1;
                            if (pu.type === 'titan') { p.timers.titan = 420; createImpact(pu.x, pu.y, '#ff0', 1.5); showMessage('TITÁN', '#ff0'); } 
                            else if (pu.type === 'hielo') { opp.timers.hielo = 300; createImpact(pu.x, pu.y, '#08f', 1.5); showMessage('HIELO', '#08f'); }
                            else if (pu.type === 'ghost') { p.timers.ghost = 240; createImpact(pu.x, pu.y, '#aaa', 1.5); showMessage('FANTASMA', '#aaa'); }
                            else if (pu.type === 'invert') { opp.timers.invert = 240; createImpact(pu.x, pu.y, '#f0f', 1.5); showMessage('CAOS', '#f0f'); }
                            else if (pu.type === 'shield') { p.shield = true; createImpact(pu.x, pu.y, '#0ff', 1.5); showMessage('ESCUDO', '#0ff'); }
                            else if (pu.type === 'multi') { 
                                extraBalls.push({ x: b.x, y: b.y, radius: b.radius, vx: -b.vx, vy: -b.vy, baseSpeed: b.baseSpeed, currentSpeed: b.currentSpeed, maxSpeed: b.maxSpeed, color: b.color, glowSize: b.glowSize, lastHitBy: b.lastHitBy, trail: [] });
                                createImpact(pu.x, pu.y, '#fff', 2); showMessage('MULTIBOLA', '#fff');
                            }
                            powerUps.splice(i, 1);
                        }
                    }
                }

                // Paredes
                if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) {
                    b.vy = -b.vy;
                    b.y = b.y - b.radius < 0 ? b.radius : canvas.height - b.radius;
                    playSound('hit1', 0.5); pManager.spawn(b.x, b.y < 250 ? 0 : canvas.height, '#fff', 'burst', 0.3);
                }

                // Paletas
                let pCol = (b.x < canvas.width / 2) ? paddle1 : paddle2;
                
                if (pCol.timers.ghost === 0 && 
                    b.x - b.radius < pCol.x + pCol.width && b.x + b.radius > pCol.x &&
                    b.y + b.radius > pCol.y && b.y - b.radius < pCol.y + pCol.height) {
                    
                    if((b.vx < 0 && b.x > pCol.x + pCol.width/2) || (b.vx > 0 && b.x < pCol.x + pCol.width/2)) {
                        b.lastHitBy = pCol; if(bIndex===0) rallyCount++; 
                        
                        let isHeavy = GODS[pCol === paddle1 ? config.p1 : config.p2].id === 'kagutsuchi';
                        let intensity = Math.min(2, 1 + (rallyCount * 0.1)) * (isHeavy ? 1.5 : 1);
                        
                        // Golpe Crítico
                        let intersectY = b.y - (pCol.y + pCol.height / 2);
                        let normalizedIntersectY = intersectY / (pCol.height / 2); 
                        let isCrit = Math.abs(normalizedIntersectY) > 0.85;
                        
                        if(isCrit) {
                            intensity *= 1.5; playSound('critical', intensity);
                            showMessage("CRÍTICO", "#f00");
                        } else {
                            playSound(pCol === paddle1 ? 'hit1' : 'hit2', intensity);
                        }

                        createImpact(b.x, b.y, pCol.color, intensity);
                        b.color = pCol.color; b.glowSize = Math.min(30, 15 + (rallyCount * 1.5));
                        
                        let bounceAngle = normalizedIntersectY * (Math.PI / 3); 
                        if(isCrit) bounceAngle *= 1.2; 

                        let dir = b.x < canvas.width / 2 ? 1 : -1;
                        b.currentSpeed = Math.min(b.maxSpeed, b.baseSpeed + (rallyCount * (isHeavy? 0.8 : 0.5)) + (isCrit? 2 : 0));
                        paddle2.speed = Math.min(15, paddle2.baseSpeed + (rallyCount * 0.3));
                        
                        b.vx = dir * b.currentSpeed * Math.cos(bounceAngle);
                        b.vy = b.currentSpeed * Math.sin(bounceAngle);
                        
                        b.x = dir === 1 ? pCol.x + pCol.width + b.radius : pCol.x - b.radius;
                        
                        if(rallyCount > 0 && rallyCount % 5 === 0 && bIndex === 0) showMessage(`¡Rally x${rallyCount}!`, "#fff");
                    }
                }

                // Anotar
                if (b.x < -20) {
                    if(paddle1.shield) { paddle1.shield = false; b.vx *= -1; b.x = 20; showMessage("¡BLOQUEO!", "#0ff"); playSound('hit1', 2); }
                    else if (bIndex === 0) scorePoint(2); 
                    else extraBalls.splice(bIndex - 1, 1);
                } else if (b.x > canvas.width + 20) {
                    if(paddle2.shield) { paddle2.shield = false; b.vx *= -1; b.x = canvas.width-20; showMessage("¡BLOQUEO!", "#0ff"); playSound('hit2', 2); }
                    else if (bIndex === 0) scorePoint(1); 
                    else extraBalls.splice(bIndex - 1, 1);
                }
            }
        }

        // --- STREAMING_CHUNK:Drawing UI components on canvas... ---
        function drawPaddleStatus(p, isP1) {
            let x = p.x + p.width/2;
            let yOffset = -15;
            ctx.textAlign = 'center'; ctx.font = '10px Orbitron';
            
            // Iconos de PowerUp
            let icons = "";
            if(p.timers.titan > 0) icons += "⚡";
            if(p.timers.hielo > 0) icons += "❄️";
            if(p.timers.ghost > 0) icons += "👻";
            if(p.timers.invert > 0) icons += "🔄";
            if(p.shield) icons += "🛡️";
            if(icons !== "") { ctx.fillStyle = '#fff'; ctx.fillText(icons, x, p.y + yOffset); yOffset -= 12; }

            // Barra de Cooldown de Skill
            let god = GODS[isP1 ? config.p1 : config.p2];
            let pct = p.timers.skillCd / god.skill.cd;
            if(p.timers.skillCd > 0) {
                ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x - 15, p.y + yOffset, 30, 4);
                ctx.fillStyle = god.color; ctx.fillRect(x - 15, p.y + yOffset, 30 * (1-pct), 4);
            } else {
                ctx.fillStyle = god.color; ctx.fillText('SKILL', x, p.y + yOffset);
            }
            
            // Restaurar estado de texto para evitar problemas con otros renders
            ctx.textAlign = 'left';
            ctx.font = '10px sans-serif';
        }

        // --- STREAMING_CHUNK:Main Draw Loop for visual elements... ---
        function draw() {
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dynamic background gradient based on dominance
            let grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
            grd.addColorStop(0, `${paddle1.color}${Math.floor((dominance/100)*255).toString(16).padStart(2,'0')}`);
            grd.addColorStop(1, `${paddle2.color}${Math.floor(((100-dominance)/100)*255).toString(16).padStart(2,'0')}`);
            ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center Net
            let redX = (canvas.width * dominance) / 100;
            ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(redX - 1, 0, 2, canvas.height);

            // Screen Shake
            if (shakeFrames > 0) {
                let dx = (Math.random() - 0.5) * 8; let dy = (Math.random() - 0.5) * 8;
                container.style.transform = `translate(${dx}px, ${dy}px)`; shakeFrames--;
            } else if (shakeFrames === 0) { container.style.transform = `translate(0px, 0px)`; shakeFrames = -1; }

            ctx.shadowBlur = 20;
            
            // Paddles
            ctx.shadowColor = paddle1.color; ctx.fillStyle = paddle1.color;
            ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
            ctx.shadowColor = paddle2.color; ctx.fillStyle = paddle2.color;
            ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
            if(paddle2.timers.ghost > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height); }

            // UI Paletas
            drawPaddleStatus(paddle1, true);
            drawPaddleStatus(paddle2, false);

            // PowerUps
            powerUps.forEach(pu => {
                pu.pulse += 0.1; let scale = 1 + Math.sin(pu.pulse) * 0.15;
                let c = '#fff'; let icon = '?';
                if(pu.type === 'titan') { c = '#ffff00'; icon = '⚡'; }
                if(pu.type === 'hielo') { c = '#0088ff'; icon = '❄️'; }
                if(pu.type === 'ghost') { c = '#aaaaaa'; icon = '👻'; }
                if(pu.type === 'multi') { c = '#ffffff'; icon = '⚽'; }
                if(pu.type === 'invert') { c = '#ff00ff'; icon = '🔄'; }
                if(pu.type === 'shield') { c = '#00ffff'; icon = '🛡️'; }
                
                ctx.shadowBlur = 15; ctx.shadowColor = c; ctx.fillStyle = c;
                ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * scale, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000'; ctx.shadowBlur = 0; ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(icon, pu.x, pu.y + 1);
            });

            // --- STREAMING_CHUNK:Drawing multiple balls and trails... ---
            // Todas las Pelotas y Rastros (Trail)
            [ball, ...extraBalls].forEach(b => {
                // Rastro suave
                if (b.trail.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(b.trail[0].x, b.trail[0].y);
                    for(let i=1; i<b.trail.length; i++) ctx.lineTo(b.trail[i].x, b.trail[i].y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = b.color;
                    ctx.lineWidth = b.radius * 0.8;
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = 0.4;
                    ctx.shadowBlur = 10; ctx.shadowColor = b.color;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }

                ctx.shadowBlur = b.glowSize; ctx.shadowColor = b.color;
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fill();
            });

            // Partículas
            pManager.updateAndDraw(ctx);
            
            // Textos Flotantes
            ctx.shadowBlur = 0;
            floatTexts.forEach(ft => {
                ctx.globalAlpha = ft.life / ft.maxLife;
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 20px Orbitron'; ctx.textAlign = 'center';
                ctx.fillText(ft.text, ft.x, ft.y);
            });
            ctx.globalAlpha = 1.0; // Reset
        }

        // --- STREAMING_CHUNK:Animation request and final execution... ---
        function gameLoop() {
            if(isPlaying && !isPaused) {
                update(); draw();
            }
            animationId = requestAnimationFrame(gameLoop);
        }