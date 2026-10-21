import {state,spawnBall} from './state.js';
import {SETTINGS} from './config.js';
import {burst} from './effects.js';

export const POWERUPS = [
 {id:'colossus',name:'Coloso',symbol:'⬆',color:'#e8bd72',description:'Aumenta permanentemente tu paleta durante este partido; se acumula hasta un límite.'},
 {id:'miniature',name:'Miniatura',symbol:'↧',color:'#d6a4ff',description:'Reduce permanentemente tu paleta durante este partido; otro Coloso puede contrarrestarlo.'},
 {id:'aegis',name:'Égida',symbol:'⬡',color:'#70e4e9',description:'Bloquea una pelota que iba a salir.'},
 {id:'haste',name:'Impulso',symbol:'➤',color:'#a5f3a5',description:'Aumenta tu velocidad de movimiento.'},
 {id:'snare',name:'Grillete',symbol:'⌁',color:'#d49aff',description:'Reduce la velocidad de la paleta rival.'},
 {id:'invert',name:'Confusión',symbol:'↕',color:'#ff9fbe',description:'Invierte los controles durante poco más de un segundo. En controles táctiles invierte el movimiento, no la posición absoluta.'},
 {id:'fireball',name:'Bola ígnea',symbol:'✹',color:'#ff875e',description:'La pelota deja una estela ardiente.'},
 {id:'ghostball',name:'Bola espectral',symbol:'◌',color:'#c6c8ff',description:'La pelota se vuelve translúcida y difícil de seguir.'},
 {id:'heavyball',name:'Bola pesada',symbol:'●',color:'#b4a6a0',description:'La pelota pierde velocidad temporalmente.'},
 {id:'lightningball',name:'Bola relámpago',symbol:'ϟ',color:'#fff08a',description:'Esta pelota acelera durante unos segundos.'},
 {id:'magnetball',name:'Núcleo gravitatorio',symbol:'⦿',color:'#8df0d2',description:'Esta pelota genera un campo gravitatorio que curva hacia ella a las otras pelotas cercanas durante unos segundos.'},
 {id:'unstableball',name:'Caos inestable',symbol:'※',color:'#ffcf70',description:'Esta pelota cambia bruscamente de dirección a intervalos impredecibles durante unos segundos.'},
 {id:'mirrorball',name:'Bola espejo',symbol:'◈',color:'#f5d6ff',description:'Cada cierto tiempo refleja su trayectoria en horizontal, vertical o ambos ejes. La corona se carga antes de cada giro para darte una pista.'},
 {id:'chainlightning',name:'Rayo encadenado',symbol:'ϟϟ',color:'#9ff7ff',description:'Esta pelota descarga pulsos eléctricos que empujan a las demás pelotas cercanas sin transferirles el poder.'},
 {id:'phaseball',name:'Salto dimensional',symbol:'⌘',color:'#e2b6ff',description:'Esta pelota salta con un destello previsible a una zona segura del campo; no puede aparecer pegada a una paleta ni junto a la línea de gol.'},
 {id:'rouletteball',name:'Bola de entropía',symbol:'※',color:'#ff8fe8',description:'Durante unos segundos cambia de poder repetidamente: puede acelerar, serpentear, volverse espectral, cambiar de tamaño o incluso generar una copia. Cada mutación pertenece a esa pelota.'},
 {id:'fractalball',name:'Bola fractal',symbol:'✣',color:'#95ffbd',description:'Esta pelota genera copias reales de sí misma a intervalos impredecibles. Las copias también juegan y pueden puntuar, con un límite de seguridad.'},
 {id:'chaosarena',name:'Colapso de realidad',symbol:'⟁',color:'#ffb36b',description:'Durante unos segundos la arena rota entre combinaciones de prisma, tormenta, gravedad, terremoto, eclipse y viento; la apariencia y la física mutan sin pausa.'},
 {id:'ballgrow',name:'Masa creciente',symbol:'⊕',color:'#ffb36b',description:'Esta pelota aumenta de tamaño de forma persistente; los efectos contrarios pueden reducirla.'},
 {id:'ballshrink',name:'Masa menguante',symbol:'⊖',color:'#9dd6ff',description:'Esta pelota disminuye de tamaño de forma persistente.'},
 {id:'splitball',name:'Desdoblamiento',symbol:'⑂',color:'#a5f3a5',description:'Divide esta pelota en dos pelotas reales que pueden marcar y recoger poderes.'},
 {id:'divideball',name:'División caótica',symbol:'⁙',color:'#ff9fe5',description:'Divide esta pelota en tres trayectorias; el caos tiene un límite de pelotas.'},
 {id:'flatball',name:'Órbita lateral',symbol:'↔',color:'#8adfff',description:'Esta pelota conserva una trayectoria casi horizontal hasta que otro poder la cambie.'},
 {id:'verticalball',name:'Órbita vertical',symbol:'↕',color:'#c4a7ff',description:'Esta pelota adopta una trayectoria casi vertical, pero todavía puede cruzar la cancha.'},
 {id:'orbitball',name:'Órbita imposible',symbol:'⟳',color:'#8df0d2',description:'La trayectoria de esta pelota se curva continuamente hasta que otro poder de trayectoria la reemplace.'},
 {id:'chromaball',name:'Bola cromática',symbol:'✺',color:'#ff9fe5',description:'Cambia el color de esta pelota hasta que otro poder la reemplace.'},
 {id:'chromaticarena',name:'Arena prismática',symbol:'◈',color:'#ff9be8',description:'La arena cambia de color continuamente durante unos segundos.'},
 {id:'chaos',name:'Rebote caótico',symbol:'✳',color:'#ffcf70',description:'Los rebotes alteran más el ángulo de la pelota.'},
 {id:'crosswind',name:'Viento cruzado',symbol:'≋',color:'#8adfff',description:'Una corriente desvía la pelota hacia arriba o abajo.'},
 {id:'eclipse',name:'Eclipse',symbol:'◐',color:'#9b8bce',description:'Oscurece la arena y genera una deriva sutil en la pelota.'},
 {id:'quake',name:'Terremoto',symbol:'⌁',color:'#e5a16c',description:'La arena se agrieta y sacudidas breves alteran la trayectoria de la pelota.'},
 {id:'prism',name:'Prisma',symbol:'◇',color:'#ff9be8',description:'La arena se refracta y los golpes reciben una desviación prismática leve.'},
 {id:'aura',name:'Aura de contraataque',symbol:'✦',color:'#f4e6a4',description:'Tu próximo golpe gana potencia y recibe un aura.'},
 {id:'shrink',name:'Maldición diminuta',symbol:'↧',color:'#d6a4ff',description:'Reduce de forma acumulativa la paleta rival durante este partido. Coloso puede contrarrestarla; hay un límite mínimo.'},
 {id:'freeze',name:'Prisión glacial',symbol:'❄',color:'#8ee9ff',description:'Inmoviliza brevemente la paleta rival.'},
 {id:'swap',name:'Intercambio astral',symbol:'⇅',color:'#f6a8d7',description:'Intercambia la altura de ambas paletas.'},
 {id:'reversal',name:'Voluntad inversa',symbol:'↶',color:'#ffb86b',description:'Invierte el rumbo actual de la pelota.'},
 {id:'gravity',name:'Pozo gravitatorio',symbol:'◉',color:'#c4a7ff',description:'La gravedad curva la trayectoria de la pelota.'},
 {id:'curveball',name:'Trayectoria serpentina',symbol:'〰',color:'#8df0d2',description:'La pelota serpentea durante unos segundos.'},
 {id:'ricochet',name:'Rebote titánico',symbol:'⤴',color:'#ffd479',description:'Los rebotes contra la pared y las paletas son más extremos.'},
 {id:'topspin',name:'Topspin divino',symbol:'↗',color:'#ffad72',description:'El próximo rebote en una paleta añade un giro hacia delante moderado y legible.'},
 {id:'backspin',name:'Retroceso lunar',symbol:'↙',color:'#a9c7ff',description:'El próximo rebote en una paleta aplica retroceso, suavizando el ángulo de salida.'},
 {id:'sweetspot',name:'Punto dulce',symbol:'⊙',color:'#fff0a1',description:'El próximo contacto con una paleta reduce el ángulo extremo y favorece un rebote más estable.'},
 {id:'softbounce',name:'Toque amortiguado',symbol:'◡',color:'#9ff0d1',description:'El próximo rebote en una paleta conserva la dirección del impacto y reduce ligeramente la velocidad.'},
 {id:'secondchance',name:'Segunda oportunidad',symbol:'⛨',color:'#9fe7a5',description:'Una salvada devuelve la pelota con un contraataque acelerado.'},
 {id:'doublepoint',name:'Juicio doble',symbol:'Ⅱ',color:'#ff8f91',description:'Si ganas el próximo punto, suma dos puntos.'},
 {id:'chromaaura',name:'Aura cromática',symbol:'✺',color:'#ff9fe5',description:'Tu paleta gana movilidad mientras su aura está activa.'},
 {id:'paddlechrome',name:'Paleta prismática',symbol:'▥',color:'#ff9fe5',description:'Cambia el color de tu paleta durante este partido; otro cambio cromático lo reemplaza.'},
 {id:'divinemotor',name:'Motor divino',symbol:'⟫',color:'#a5f3a5',description:'Aumenta temporalmente la velocidad de tu paleta durante 6 segundos.'},
 {id:'chaoscoil',name:'Bobina caótica',symbol:'ϟ',color:'#fff08a',description:'Tus golpes desvían el ángulo de la pelota de forma impredecible durante 7 segundos.'},
 {id:'seismicpulse',name:'Pulso sísmico',symbol:'◎',color:'#e5a16c',description:'Durante 5 segundos, cada pulso empuja las otras pelotas cercanas sin transferirles este poder.'},
 {id:'mutantpaddle',name:'Paleta mutante',symbol:'↕',color:'#ff9fe5',description:'Tu paleta oscila de tamaño durante 6 segundos, con límites seguros.'},
 {id:'spectralphase',name:'Fase espectral',symbol:'◇',color:'#c6c8ff',description:'Tu paleta cambia periódicamente de altura durante 6 segundos, con aviso visual antes de cada cambio.'},
 {id:'segmentedpaddle',name:'Paleta fracturada',symbol:'▤',color:'#9ff7ff',description:'Durante 8 segundos tu paleta se divide en tres segmentos reales: los huecos permiten que la pelota pase, pero cada segmento devuelve golpes más angulados.'},
 {id:'runeextensions',name:'Extensiones rúnicas',symbol:'⫸',color:'#ffd479',description:'Durante 7 segundos dos extensiones de energía amplían el alcance horizontal de tu paleta y también pueden golpear la pelota.'},
 {id:'runebarricade',name:'Barricada rúnica',symbol:'ᛉ',color:'#8ee9ff',description:'Invoca durante un instante una formación de muros rúnicos en el centro de la arena.'},
 {id:'divinestorm',name:'Tempestad divina',symbol:'ϟ',color:'#8adfff',description:'Transforma la arena en una tormenta eléctrica y desvía la pelota con ráfagas de viento.'}
];
const byId = Object.fromEntries(POWERUPS.map(p=>[p.id,p]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const BALL_POWER_SCALE={heavyball:.72,lightningball:1.22};
const BALL_BASE_R=9;
const BALL_SIZE_STEP=.18;
const BALL_SIZE_MIN=.45;
const BALL_SIZE_MAX=2.05;
const PADDLE_SIZE_STEP=.12;
const PADDLE_SIZE_MIN=.55;
const PADDLE_SIZE_MAX=1.8;
const BALL_PALETTE=['#ff9fe5','#8ee9ff','#ffd479','#a5f3a5','#c4a7ff','#ff875e'];
const ROULETTE_TYPES=['fireball','ghostball','heavyball','lightningball','chaos','magnetball','unstableball','mirrorball','chainlightning','phaseball','ricochet','fractalball'];
const EMPTY_BALL_POWER=()=>({type:'',time:0,baseSpeed:0,scale:1});
const speedOf=ball=>Math.hypot(ball.vx,ball.vy)||ball.speed||SETTINGS.ballSpeed;
function setBallPower(type,duration,ball){
 if(!ball)return;
 const current=speedOf(ball),active=ball.powerEffect;
 const previous=active?.type?(active.scale||BALL_POWER_SCALE[active.type]||1):1;
 const normalSpeed=current/previous;
 const scale=BALL_POWER_SCALE[type]||1;
 const target=clamp(normalSpeed*scale,3.2,SETTINGS.maxBallSpeed);
 if(current>0){ball.vx=ball.vx/current*target;ball.vy=ball.vy/current*target;}
 ball.speed=target;ball.powerEffect={type,time:duration,baseSpeed:normalSpeed,scale};
}
function clearBallPower(ball){
 const active=ball?.powerEffect;
 if(active?.type){
  const current=speedOf(ball),scale=active.scale||BALL_POWER_SCALE[active.type]||1;
  const target=clamp(current/scale,3.2,SETTINGS.maxBallSpeed);
  if(current>0){ball.vx=ball.vx/current*target;ball.vy=ball.vy/current*target;}
  ball.speed=target;
 }
 if(ball)ball.powerEffect=null;
}
function setBallSize(ball,scale){if(!ball)return;ball.matchEffects=ball.matchEffects||{sizeScale:1,trajectory:'',color:''};ball.matchEffects.sizeScale=clamp(scale,BALL_SIZE_MIN,BALL_SIZE_MAX);ball.r=(ball.baseR||BALL_BASE_R)*ball.matchEffects.sizeScale;}
function safePhaseDestination(ball){
 const left=state.paddles?.p1,right=state.paddles?.p2,r=ball.r||BALL_BASE_R,W=SETTINGS.width,H=SETTINGS.height;
 // La pelota reaparece en la franja central: siempre deja tiempo para reaccionar a ambos lados.
 const minX=Math.max(W*.32,(left?.x??28)+(left?.w??13)+r+72);
 const maxX=Math.min(W*.68,(right?.x??959)-r-72);
 const minY=Math.max(r+26,H*.14),maxY=Math.min(H-r-26,H*.86);
 if(minX>=maxX||minY>=maxY)return null;
 const live=state.balls||[],walls=state.temporaryWalls||[];
 const safe=(x,y)=>{
  if(Math.hypot(x-ball.x,y-ball.y)<72)return false;
  if(live.some(other=>other!==ball&&Math.hypot(x-other.x,y-other.y)<r+(other.r||BALL_BASE_R)+30))return false;
  if(walls.some(wall=>x+r+10>wall.x&&x-r-10<wall.x+wall.w&&y+r+10>wall.y&&y-r-10<wall.y+wall.h))return false;
  return true;
 };
 for(let attempt=0;attempt<28;attempt++){
  const x=minX+Math.random()*(maxX-minX),y=minY+Math.random()*(maxY-minY);
  if(safe(x,y))return {x,y};
 }
 const fallback=[];
 for(const x of [W*.35,W*.5,W*.65])for(const y of [H*.2,H*.4,H*.6,H*.8])fallback.push({x:clamp(x,minX,maxX),y:clamp(y,minY,maxY)});
 for(const point of fallback)if(safe(point.x,point.y))return point;
 // No fuerza el salto a través de otra pelota o de un muro: se pospondrá el intento.
 return null;
}
export function resetPowerups(){state.temporaryWalls=[];state.worldEffects={eclipse:0,quake:0,quakePulse:0,prism:0,crosswind:0,gravity:0,curve:0,storm:0,rainbowArena:0};state.chaosArena={time:0,pulse:0,cycle:0};state.ballPower=EMPTY_BALL_POWER();for(const b of state.balls||[]){if(b){b.powerEffect=null;b.matchEffects={sizeScale:1,trajectory:'',color:''};b.baseR=BALL_BASE_R;b.r=BALL_BASE_R;b.color='#f6f4ed';}}for(const side of ['p1','p2']){const p=state.paddles[side];if(p){for(const key of ['haste','aura','freeze','palette','bonusPoint','shield','grow','shrink','powerGrow','powerShrink','slow','invert','aimBonus','divineMotor','chaosCoil','seismicPulse','seismicPulseCooldown','mutantPaddle','mutantPaddleTime','spectralPhase','spectralPhaseCooldown','spectralPhaseWarning','spectralPhaseOffset','segmentedPaddle','runeExtensions'])p[key]=0;p.matchSizeScale=1;p.powerColor='';p.shieldMode='';if(p.baseH)p.h=p.baseH;}}}
function summonRuneBarricades(){
 const cx=SETTINGS.width/2,cy=SETTINGS.height/2;
 const layouts=[
  [[-38,-94,12,76],[-38,18,12,76],[26,-38,12,76]],
  [[-82,-58,68,12],[14,-58,68,12],[-34,0,68,12],[-82,58,68,12],[14,58,68,12]],
  [[-72,-62,12,62],[-72,0,72,12],[0,0,12,62],[0,-62,72,12]],
  [[-78,-42,12,84],[-42,-12,84,12],[30,-42,12,84],[-42,30,84,12]]
 ];
 const layout=layouts[Math.floor(Math.random()*layouts.length)],palette=['#8ee9ff','#d6a4ff','#ffd479','#ff9fe5'],runes=['ᚠ','ᚱ','ᛉ','ᛟ'];
 state.temporaryWalls=layout.map((r,i)=>({x:cx+r[0],y:cy+r[1],w:r[2],h:r[3],color:palette[i%palette.length],life:1.05,maxLife:1.05,rune:runes[i%runes.length]}));
}
export function applyPowerup(id,side,ball=state.ball){const def=byId[id];if(!def)return;const owner=state.paddles[side],opponent=state.paddles[side==='p1'?'p2':'p1'];if(!owner||!opponent||!ball)return;
 switch(id){
  case 'colossus': owner.matchSizeScale=clamp((owner.matchSizeScale||1)+PADDLE_SIZE_STEP,PADDLE_SIZE_MIN,PADDLE_SIZE_MAX);break;
  case 'miniature': owner.matchSizeScale=clamp((owner.matchSizeScale||1)-PADDLE_SIZE_STEP,PADDLE_SIZE_MIN,PADDLE_SIZE_MAX);break;
  case 'aegis': owner.shield=2.8;owner.shieldMode='aegis';break;
  case 'haste': owner.haste=5;break;
  case 'divinemotor': owner.divineMotor=6;break;
  case 'chaoscoil': owner.chaosCoil=7;break;
  case 'seismicpulse': owner.seismicPulse=5;owner.seismicPulseCooldown=.15;break;
  case 'mutantpaddle': owner.mutantPaddle=6;owner.mutantPaddleTime=0;break;
  case 'spectralphase': owner.spectralPhase=6;owner.spectralPhaseCooldown=.9;owner.spectralPhaseWarning=.32;owner.spectralPhaseOffset=0;break;
  case 'segmentedpaddle': owner.segmentedPaddle=8;break;
  case 'runeextensions': owner.runeExtensions=7;break;
  case 'snare': opponent.slow=3.8;break;
  case 'invert': opponent.invert=Math.max(opponent.invert||0,1.15);break;
  case 'rouletteball': setBallPower('lightningball',6.4,ball);ball.powerEffect.roulette=true;ball.powerEffect.roulettePulse=.48;ball.powerEffect.rouletteRolls=0;break;
  case 'fractalball': ball.powerEffect={type:'fractalball',time:6.2,baseSpeed:speedOf(ball),scale:1,pulse:.75};break;
  case 'mirrorball': setBallPower('mirrorball',6.2,ball);ball.powerEffect.mirrorPulse=.92;ball.powerEffect.mirrorFlash=0;break;
  case 'chaosarena': state.chaosArena={time:7.4,pulse:.1,cycle:0};break;
  case 'phaseball': setBallPower(id,6.0,ball);ball.powerEffect.phaseCooldown=1.4;ball.powerEffect.phaseFlash=0;break;
  case 'fireball': case 'ghostball': case 'heavyball': case 'lightningball': case 'chaos': case 'magnetball': case 'unstableball': case 'chainlightning': setBallPower(id,id==='magnetball'?6.5:id==='unstableball'?5.5:id==='chainlightning'?5.8:5,ball);break;
  case 'ballgrow': setBallSize(ball,(ball.matchEffects?.sizeScale||1)+BALL_SIZE_STEP);break;
  case 'ballshrink': setBallSize(ball,(ball.matchEffects?.sizeScale||1)-BALL_SIZE_STEP);break;
  case 'splitball': spawnBall(ball,{angle:-.24});break;
  case 'divideball': spawnBall(ball,{angle:-.72});spawnBall(ball,{angle:.72});break;
  case 'flatball': ball.matchEffects={...(ball.matchEffects||{}),trajectory:'flat',orbitDirection:0};break;
  case 'verticalball': ball.matchEffects={...(ball.matchEffects||{}),trajectory:'vertical',orbitDirection:0};break;
  case 'orbitball': ball.matchEffects={...(ball.matchEffects||{}),trajectory:'orbit',orbitDirection:Math.random()<.5?-1:1};break;
  case 'chromaball': {const palette=BALL_PALETTE.filter(color=>color!==ball.matchEffects?.color);const color=palette[Math.floor(Math.random()*palette.length)]||'#ff9fe5';ball.matchEffects={...(ball.matchEffects||{}),color};ball.color=color;break;}
  case 'chromaticarena': state.worldEffects.rainbowArena=8;break;
  case 'crosswind': state.worldEffects.crosswind=4.5;break;
  case 'eclipse': state.worldEffects.eclipse=5;break;
  case 'quake': state.worldEffects.quake=3.5;state.worldEffects.quakePulse=.4;break;
  case 'prism': state.worldEffects.prism=6;break;
  case 'aura': owner.aura=7;break;
  case 'shrink': opponent.matchSizeScale=clamp((opponent.matchSizeScale||1)-PADDLE_SIZE_STEP,PADDLE_SIZE_MIN,PADDLE_SIZE_MAX);break;
  case 'freeze': opponent.freeze=1.15;break;
  case 'swap': {const safe=12,y=owner.y;owner.y=clamp(opponent.y,safe,SETTINGS.height-owner.h-safe);opponent.y=clamp(y,safe,SETTINGS.height-opponent.h-safe);break;}
  case 'reversal': ball.vx*=-1;ball.vy*=-1;break;
  case 'gravity': state.worldEffects.gravity=4.5;break;
  case 'curveball': state.worldEffects.curve=4.5;break;
  case 'ricochet': setBallPower(id,5,ball);break;
  case 'topspin': case 'backspin': case 'sweetspot': case 'softbounce': setBallPower(id,8,ball);break;
  case 'secondchance': owner.shield=Math.max(owner.shield||0,4.5);owner.shieldMode='secondchance';break;
  case 'doublepoint': owner.bonusPoint=1;break;
  case 'chromaaura': owner.palette=6;break;
  case 'paddlechrome': owner.powerColor=BALL_PALETTE[Math.floor(Math.random()*BALL_PALETTE.length)];break;
  case 'runebarricade': summonRuneBarricades();break;
  case 'divinestorm': state.worldEffects.storm=5;state.worldEffects.crosswind=Math.max(state.worldEffects.crosswind||0,5);setBallPower('lightningball',5,ball);break;
 }
 burst(ball.x,ball.y,def.color,5,2);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:def.name,color:def.color}}));
}
export function updatePowerups(dt){
 if(!state.worldEffects)resetPowerups();
 for(const key of Object.keys(state.worldEffects))if(key!=='quakePulse')state.worldEffects[key]=Math.max(0,(state.worldEffects[key]||0)-dt);
 if((state.worldEffects.quake||0)<=0)state.worldEffects.quakePulse=0;
 const arenaChaos=state.chaosArena||(state.chaosArena={time:0,pulse:0,cycle:0});
 if(arenaChaos.time>0){
  arenaChaos.time=Math.max(0,arenaChaos.time-dt);arenaChaos.pulse=(arenaChaos.pulse||0)-dt;
  if(arenaChaos.time>0&&arenaChaos.pulse<=0){
   const effects=['eclipse','quake','prism','crosswind','gravity','curve','storm','rainbowArena'];
   const selected=[],count=Math.random()<.68?3:2;
   while(selected.length<count){const pick=effects[Math.floor(Math.random()*effects.length)];if(!selected.includes(pick))selected.push(pick);}
   for(const key of selected)state.worldEffects[key]=Math.max(state.worldEffects[key]||0,.85+Math.random()*.85);
   if(selected.includes('quake'))state.worldEffects.quakePulse=.08;
   arenaChaos.cycle=(arenaChaos.cycle||0)+1;arenaChaos.pulse=.58+Math.random()*.34;
   const colors=['#ff8fe8','#8df0d2','#ffcf70','#9b8bff','#8adfff','#ff785d'];burst(SETTINGS.width/2,SETTINGS.height/2,colors[arenaChaos.cycle%colors.length],10,2.4);
  }
 }
 for(const ball of state.balls||[]){
  if(!ball?.powerEffect?.type)continue;
  let power=ball.powerEffect;
  power.time=Math.max(0,(power.time||0)-dt);
  if(power.roulette&&power.time>0){
   power.roulettePulse=(power.roulettePulse??.5)-dt;
   if(power.roulettePulse<=0){
    const choices=ROULETTE_TYPES.filter(type=>type!==power.type);
    const nextType=choices[Math.floor(Math.random()*choices.length)]||'lightningball';
    const remaining=power.time,rolls=(power.rouletteRolls||0)+1;
    setBallPower(nextType,remaining,ball);power=ball.powerEffect;power.roulette=true;power.rouletteRolls=rolls;power.roulettePulse=.52+Math.random()*.48;if(nextType==='mirrorball')power.mirrorPulse=.92;if(nextType==='phaseball')power.phaseCooldown=1.4;
    const trait=Math.random();
    if(trait<.23){setBallSize(ball,(ball.matchEffects?.sizeScale||1)+(Math.random()<.5?-1:1)*BALL_SIZE_STEP);}
    else if(trait<.46){const palette=BALL_PALETTE.filter(color=>color!==ball.matchEffects?.color);const color=palette[Math.floor(Math.random()*palette.length)]||'#ff9fe5';ball.matchEffects={...(ball.matchEffects||{}),color};ball.color=color;}
    else if(trait<.69){const trajectories=['','flat','vertical','orbit'];ball.matchEffects={...(ball.matchEffects||{}),trajectory:trajectories[Math.floor(Math.random()*trajectories.length)],orbitDirection:Math.random()<.5?-1:1};}
    else if(trait<.83&&ball.generation<2&&(state.balls||[]).length<(state.ballLimit||24)){const child=spawnBall(ball,{angle:(Math.random()-.5)*1.4});if(child){if(child.powerEffect?.roulette)child.powerEffect.roulettePulse=.7+Math.random()*.65;if(child.powerEffect?.type==='fractalball')child.powerEffect.pulse=.8+Math.random()*.7;}}
    burst(ball.x,ball.y,['#ff8fe8','#8df0d2','#ffd479','#c4a7ff'][rolls%4],5,1.8);
   }
  }
  if(power.type==='fractalball'&&power.time>0){
   power.pulse=(power.pulse??.9)-dt;
   if(power.pulse<=0){
    if((ball.generation||0)<2&&(state.balls||[]).length<(state.ballLimit||24)&&Math.random()<.82){
     const child=spawnBall(ball,{angle:(Math.random()-.5)*1.55});
     if(child){if(child.powerEffect?.roulette)child.powerEffect.roulettePulse=.55+Math.random()*.8;if(child.powerEffect?.type==='fractalball')child.powerEffect.pulse=.75+Math.random()*.9;burst(child.x,child.y,'#95ffbd',4,1.5);}
    }
    power.pulse=1.0+Math.random()*.72;
   }
  }
  if(power.type==='unstableball'&&power.time>0){power.pulse=(power.pulse??.4)-dt;if(power.pulse<=0){const speed=speedOf(ball),angle=Math.atan2(ball.vy,ball.vx)+(Math.random()-.5)*1.15;ball.vx=Math.cos(angle)*speed;ball.vy=Math.sin(angle)*speed;ball.speed=speed;power.pulse=.38+Math.random()*.55;burst(ball.x,ball.y,'#ffcf70',3,1.4);}}
  if(power.type==='chainlightning'&&power.time>0){
   power.chainCooldown=(power.chainCooldown??.2)-dt;
   if(power.chainCooldown<=0){
    let target=null,nearest=175;
    for(const other of state.balls||[]){if(other===ball)continue;const distance=Math.hypot(other.x-ball.x,other.y-ball.y);if(distance<nearest){nearest=distance;target=other;}}
    if(target){const dx=target.x-ball.x,dy=target.y-ball.y,dist=Math.max(1,Math.hypot(dx,dy)),impulse=2.2*(1-nearest/175);target.vx+=dx/dist*impulse;target.vy+=dy/dist*impulse;const speed=speedOf(target),limit=SETTINGS.maxBallSpeed||14;if(speed>limit){target.vx=target.vx/speed*limit;target.vy=target.vy/speed*limit;}target.speed=speedOf(target);burst((ball.x+target.x)/2,(ball.y+target.y)/2,'#9ff7ff',5,1.7);power.chainCooldown=.58;}
    else power.chainCooldown=.18;
   }
  }
  if(power.type==='mirrorball'&&power.time>0){
   power.mirrorPulse=(power.mirrorPulse??.8)-dt;power.mirrorFlash=Math.max(0,(power.mirrorFlash||0)-dt);
   if(power.mirrorPulse<=0){
    const speed=speedOf(ball),roll=Math.random();let angle=Math.atan2(ball.vy,ball.vx);
    if(roll<.36)ball.vx*=-1;else if(roll<.72)ball.vy*=-1;else if(roll<.88){ball.vx*=-1;ball.vy*=-1;}else angle+=(Math.random()<.5?-1:1)*(.55+Math.random()*.65);
    if(roll>=.88){ball.vx=Math.cos(angle)*speed;ball.vy=Math.sin(angle)*speed;}
    const after=Math.hypot(ball.vx,ball.vy)||speed;ball.vx=ball.vx/after*speed;ball.vy=ball.vy/after*speed;ball.speed=speed;
    power.mirrorPulse=.66+Math.random()*.63;power.mirrorFlash=.22;burst(ball.x,ball.y,'#f5d6ff',6,1.8);
   }
  }
  if(power.type==='phaseball'&&power.time>0){
   power.phaseCooldown=(power.phaseCooldown??1.4)-dt;
   power.phaseFlash=Math.max(0,(power.phaseFlash||0)-dt);
   if(power.phaseCooldown<=0){
    const target=safePhaseDestination(ball);
    if(target){const oldX=ball.x,oldY=ball.y;ball.x=target.x;ball.y=target.y;
     // Sincroniza el barrido y deja un pequeño destello de salida y llegada.
     ball.frameStartX=ball.x;ball.frameStartY=ball.y;power.phaseFlash=.24;
     burst(oldX,oldY,'#e2b6ff',5,1.5);burst(ball.x,ball.y,'#e2b6ff',8,2.0);
     power.phaseCooldown=1.3+Math.random()*.55;
    }else power.phaseCooldown=.28;
   }
  }
  if(power.time===0)clearBallPower(ball);
 }
 for(const side of ['p1','p2']){
  const p=state.paddles[side];if(!p)continue;
  for(const key of ['haste','aura','freeze','palette','powerGrow','powerShrink','divineMotor','chaosCoil','seismicPulse','spectralPhase','segmentedPaddle','runeExtensions'])p[key]=Math.max(0,(p[key]||0)-dt);
  if(p.mutantPaddle>0){p.mutantPaddle=Math.max(0,p.mutantPaddle-dt);p.mutantPaddleTime=(p.mutantPaddleTime||0)+dt;}else p.mutantPaddleTime=0;
  if(p.spectralPhase>0){p.spectralPhaseCooldown=(p.spectralPhaseCooldown||.9)-dt;p.spectralPhaseWarning=Math.max(0,(p.spectralPhaseWarning||0)-dt);if(p.spectralPhaseCooldown<=0){p.spectralPhaseOffset=p.spectralPhaseOffset===1?0:1;p.spectralPhaseCooldown=.9;p.spectralPhaseWarning=.32;burst(p.x+p.w/2,p.y+p.h/2,'#c6c8ff',5,1.7);}}
  else {p.spectralPhaseWarning=0;p.spectralPhaseOffset=0;}
 }
}
export function drawPowerupEffects(ctx){
 const e=state.worldEffects||{},W=SETTINGS.width,H=SETTINGS.height,cx=W/2,cy=H/2;
 const chaos=state.chaosArena||{time:0,cycle:0};
 if(chaos.time>0){
  const reduced=Boolean(state.settings?.reducedMotion),low=state.settings?.quality==='low',t=reduced?0:performance.now()/1000,hue=(chaos.cycle*61+(reduced?0:t*115))%360;
  ctx.save();ctx.beginPath();ctx.rect(24,24,W-48,H-48);ctx.clip();
  const wash=ctx.createLinearGradient(24,24,W-24,H-24);wash.addColorStop(0,`hsla(${hue},100%,58%,.15)`);wash.addColorStop(.5,`hsla(${(hue+155)%360},100%,58%,.11)`);wash.addColorStop(1,`hsla(${(hue+285)%360},100%,58%,.16)`);ctx.fillStyle=wash;ctx.fillRect(24,24,W-48,H-48);
  ctx.globalCompositeOperation='screen';const bands=low?4:8;ctx.lineWidth=low?1:1.6;
  for(let i=0;i<bands;i++){const baseY=45+i*(H-90)/(bands-1),shift=reduced?0:Math.sin(t*5+i*1.7)*30;ctx.globalAlpha=.20+(i%3)*.045;ctx.strokeStyle=`hsl(${(hue+i*47)%360},100%,73%)`;ctx.beginPath();ctx.moveTo(25,baseY);ctx.lineTo(cx*.35,baseY+shift+18);ctx.lineTo(cx+(reduced?0:Math.sin(t*3+i)*35),baseY-shift*.55);ctx.lineTo(W-25,baseY+Math.cos(i+t*2)*shift);ctx.stroke();}
  const rings=low?3:6;for(let i=0;i<rings;i++){const pulse=reduced?0:Math.sin(t*6+i)*12;ctx.globalAlpha=.22;ctx.strokeStyle=`hsl(${(hue+i*63)%360},100%,75%)`;ctx.lineWidth=i%2?1:2;ctx.beginPath();ctx.ellipse(cx,cy,65+i*43+pulse,28+i*31+pulse*.4,reduced?0:t*.25+i*.3,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=.58;ctx.lineWidth=2;ctx.strokeStyle=`hsl(${(hue+80)%360},100%,78%)`;ctx.strokeRect(26,26,W-52,H-52);ctx.globalCompositeOperation='source-over';ctx.restore();
 }
 if(e.rainbowArena>0){
  const reduced=Boolean(state.settings?.reducedMotion),low=state.settings?.quality==='low',t=reduced?0:performance.now()/1000,hue=reduced?205:(t*78)%360;ctx.save();ctx.beginPath();ctx.rect(24,24,W-48,H-48);ctx.clip();
  const wash=ctx.createLinearGradient(24+Math.sin(t*.8)*W*.12,24,W-24, H-24);wash.addColorStop(0,`hsla(${hue},95%,58%,.20)`);wash.addColorStop(.28,`hsla(${(hue+75)%360},95%,55%,.13)`);wash.addColorStop(.55,`hsla(${(hue+165)%360},95%,60%,.18)`);wash.addColorStop(.78,`hsla(${(hue+245)%360},95%,58%,.14)`);wash.addColorStop(1,`hsla(${(hue+310)%360},95%,60%,.2)`);ctx.fillStyle=wash;ctx.fillRect(24,24,W-48,H-48);
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=.23;ctx.lineWidth=1.5;const bands=low?5:11;for(let i=0;i<bands;i++){const y=30+i*(H-60)/(bands-1),wave=reduced?0:Math.sin(t*2.4+i*.8)*24;ctx.strokeStyle=`hsl(${(hue+i*33)%360},100%,72%)`;ctx.beginPath();for(let x=24;x<=W-24;x+=low?32:16){const yy=y+Math.sin(x/(low?58:38)+t*2.8+i*.75)* (low?7:13)+wave;if(x===24)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);}ctx.stroke();}
  const rings=low?3:7;ctx.globalAlpha=.28;for(let i=0;i<rings;i++){const pulse=reduced?0:Math.sin(t*2.2-i*.65)*9,radius=54+i*42+(reduced?0:(t*22)%(42));ctx.strokeStyle=`hsl(${(hue+i*51)%360},100%,75%)`;ctx.lineWidth=i%2?1:2;ctx.beginPath();ctx.ellipse(cx,cy,radius+pulse,radius*.55+pulse*.5,reduced?0:t*.16+i*.12,0,Math.PI*2);ctx.stroke();}
  if(!low){ctx.globalAlpha=.2;for(let i=0;i<12;i++){const a=t*.32+i*Math.PI/6,r=80+(i%4)*52,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.55;ctx.strokeStyle=`hsl(${(hue+i*29)%360},100%,75%)`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a+1.1)*26,y+Math.sin(a+1.1)*26);ctx.lineTo(x+Math.cos(a+2.2)*13,y+Math.sin(a+2.2)*13);ctx.closePath();ctx.stroke();}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.75;ctx.strokeStyle=`hsl(${(hue+80)%360},100%,78%)`;ctx.lineWidth=3;ctx.strokeRect(24,24,W-48,H-48);ctx.globalAlpha=.32;ctx.strokeStyle=`hsl(${(hue+190)%360},100%,72%)`;ctx.lineWidth=7;ctx.strokeRect(28,28,W-56,H-56);ctx.restore();
 }
 if(e.eclipse>0){ctx.save();ctx.fillStyle='rgba(9,7,24,.48)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#a99bdf';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,78+Math.sin(performance.now()/220)*5,0,Math.PI*2);ctx.stroke();ctx.restore();}
 if(e.prism>0){ctx.save();const t=state.settings?.reducedMotion?0:performance.now()/700;ctx.globalAlpha=.12;ctx.fillStyle=`hsl(${(t*80)%360},85%,62%)`;ctx.fillRect(0,0,cx,H);ctx.fillStyle=`hsl(${(t*80+165)%360},85%,62%)`;ctx.fillRect(cx,0,W-cx,H);ctx.globalAlpha=.32;ctx.lineWidth=2;const facets=state.settings?.quality==='low'?5:9;for(let i=0;i<facets;i++){const x=(i/facets)*W+(state.settings?.reducedMotion?0:Math.sin(t+i)*16);ctx.strokeStyle=`hsl(${(t*80+i*43)%360},100%,78%)`;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+70,H*.35);ctx.lineTo(x-35,H*.68);ctx.lineTo(x+20,H);ctx.stroke();}ctx.globalAlpha=.22;ctx.strokeStyle='#ffffff';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(cx,cy,110+i*44,38+i*27,t*.2+i*.2,0,Math.PI*2);ctx.stroke();}ctx.restore();}
 if(e.quake>0&&!state.settings?.reducedMotion&&state.settings?.quality!=='low'){ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle='#e5a16c';ctx.lineWidth=2;for(let i=0;i<5;i++){const y=65+i*112,offset=Math.sin(performance.now()/80+i)*8;ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(cx+offset,y-8);ctx.lineTo(W-24,y+offset);ctx.stroke();}ctx.restore();}
 if(e.crosswind>0){ctx.save();ctx.globalAlpha=.24;ctx.strokeStyle='#8adfff';ctx.lineWidth=2;const drift=Math.sin(performance.now()/250)*18;for(let i=0;i<6;i++){const y=55+i*95;ctx.beginPath();ctx.moveTo(65+drift,y);ctx.bezierCurveTo(cx-130,y-20-drift,cx+130,y+20+drift,W-65-drift,y);ctx.stroke();ctx.beginPath();ctx.moveTo(W-75-drift,y-5);ctx.lineTo(W-65-drift,y);ctx.lineTo(W-75-drift,y+5);ctx.stroke();}ctx.restore();}
 if(e.gravity>0){ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#c4a7ff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,45+i*24,24+i*15,performance.now()/900+i*.4,0,Math.PI*2);ctx.stroke();}ctx.restore();}
 if(e.curve>0){ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle='#8df0d2';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();for(let x=35;x<=W-35;x+=12){const y=cy+i*28-42+Math.sin(x/48+performance.now()/250+i)*12;if(x===35)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.restore();}
 if(e.storm>0){ctx.save();const t=state.settings?.reducedMotion?0:performance.now()/100;ctx.fillStyle='rgba(25,48,83,.17)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#8adfff';ctx.lineWidth=2;ctx.globalAlpha=.6;const pulse=Math.floor(t)%5,bolts=state.settings?.quality==='low'?2:5;for(let i=0;i<bolts;i++){const x=100+((i*197+pulse*71)%(W-200)),y=25+((i*137+pulse*47)%(H-80));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+18);ctx.lineTo(x+4,y+25);ctx.lineTo(x-10,y+43);ctx.lineTo(x+2,y+54);ctx.stroke();if(!state.settings?.reducedMotion&&i===pulse%bolts){ctx.globalAlpha=.24;ctx.fillStyle='#d8f6ff';ctx.fillRect(x-75,y-25,150,90);ctx.globalAlpha=.6;}}ctx.globalAlpha=.18;ctx.strokeStyle='#d8f6ff';for(let i=0;i<7;i++){const y=40+i*82;ctx.beginPath();ctx.moveTo(25,y);ctx.lineTo(W-25,y+Math.sin(t/1.4+i)*12);ctx.stroke();}ctx.restore();}
}

export function drawBallPower(ctx,b){const effect=b?.powerEffect?.time>0?b.powerEffect.type:'',persistent=b?.matchEffects||{},multi=(state.balls?.length||0)>1,roulette=Boolean(b?.powerEffect?.roulette&&b.powerEffect.time>0);if(!effect&&!persistent.trajectory&&!persistent.color&&(persistent.sizeScale||1)===1&&!multi)return;ctx.save();ctx.globalAlpha=effect==='ghostball'?.45:1;ctx.strokeStyle=byId[effect]?.color||persistent.color||(persistent.trajectory==='flat'?'#8adfff':persistent.trajectory==='vertical'?'#c4a7ff':persistent.trajectory==='orbit'?'#8df0d2':'#fff');ctx.fillStyle=byId[effect]?.color||persistent.color||'#fff';ctx.lineWidth=2;
 if(roulette){const t=state.settings?.reducedMotion?0:performance.now()/100;const spokes=state.settings?.quality==='low'?5:8;ctx.globalAlpha=.62;for(let i=0;i<spokes;i++){const a=t+i*Math.PI*2/spokes;ctx.strokeStyle=`hsl(${(t*28+i*47)%360},100%,76%)`;ctx.beginPath();ctx.moveTo(b.x+Math.cos(a)*(b.r+4),b.y+Math.sin(a)*(b.r+4));ctx.lineTo(b.x+Math.cos(a+.23)*(b.r+11),b.y+Math.sin(a+.23)*(b.r+11));ctx.stroke();}ctx.globalAlpha=.34;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r+13+(state.settings?.reducedMotion?0:Math.sin(t*1.9)*2),0,Math.PI*2);ctx.stroke();}
 if(multi){const t=state.settings?.reducedMotion?0:performance.now()/180+(b.generation||0)*.7;ctx.globalAlpha=.48;ctx.strokeStyle=persistent.color||['#8ee9ff','#ff9fe5','#ffd479','#a5f3a5','#c4a7ff'][(Number(String(b.id||'').replace(/\D/g,''))||0)%5];ctx.beginPath();ctx.ellipse(b.x,b.y,b.r+5+Math.sin(t)*1.5,b.r+2+Math.cos(t)*1.5,t*.2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.24;ctx.beginPath();ctx.arc(b.x,b.y,b.r+9, t, t+Math.PI*1.2);ctx.stroke();}
 if(effect==='fireball'){
  const trail=(b.trail||[]);for(let i=0;i<trail.length;i++){const point=trail[i],alpha=(i+1)/(trail.length+1);ctx.globalAlpha=alpha*.62;ctx.fillStyle=i%2?'#ff875e':'#ffd479';ctx.beginPath();ctx.arc(point.x,point.y,Math.max(1,b.r*(.25+alpha*.45)),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=.9;ctx.strokeStyle='#ff875e';ctx.beginPath();ctx.moveTo(b.x-b.r-13,b.y-5);ctx.lineTo(b.x-b.r-3,b.y);ctx.lineTo(b.x-b.r-10,b.y+6);ctx.stroke();ctx.strokeStyle='#ffd479';ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,Math.PI*.1,Math.PI*1.8);ctx.stroke();
 }else if(effect==='ghostball'){const trail=(b.trail||[]);for(let i=0;i<trail.length;i++){const point=trail[i],alpha=(i+1)/(trail.length+1);ctx.globalAlpha=alpha*.32;ctx.beginPath();ctx.arc(point.x,point.y,b.r*(.35+alpha*.3),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(b.x,b.y,b.r+6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(b.x-3,b.y-2,b.r*.5,0,Math.PI*2);ctx.stroke();}
 else if(effect==='heavyball'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();ctx.fillRect(b.x-2,b.y-2,4,4);}
 else if(effect==='lightningball'){ctx.beginPath();ctx.moveTo(b.x-5,b.y-b.r-7);ctx.lineTo(b.x+1,b.y-2);ctx.lineTo(b.x-4,b.y+1);ctx.lineTo(b.x+5,b.y+b.r+7);ctx.stroke();}
 else if(effect==='magnetball'){const t=state.settings?.reducedMotion?0:performance.now()/240;ctx.globalAlpha=.55;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(b.x,b.y,b.r+7+i*6,b.r+3+i*4,t+i*.7,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();}
 else if(effect==='unstableball'){const t=state.settings?.reducedMotion?0:performance.now()/90;ctx.globalAlpha=.8;for(let i=0;i<4;i++){const a=t+i*Math.PI/2;ctx.beginPath();ctx.moveTo(b.x+Math.cos(a)*(b.r+2),b.y+Math.sin(a)*(b.r+2));ctx.lineTo(b.x+Math.cos(a+.55)*(b.r+10),b.y+Math.sin(a+.55)*(b.r+10));ctx.stroke();}}
 else if(effect==='chainlightning'){
  const t=state.settings?.reducedMotion?0:performance.now()/95;
  ctx.globalAlpha=.85;
  for(let i=0;i<4;i++){const a=t+i*Math.PI/2,reach=b.r+9+(i%2)*5;ctx.beginPath();ctx.moveTo(b.x+Math.cos(a)*(b.r+2),b.y+Math.sin(a)*(b.r+2));ctx.lineTo(b.x+Math.cos(a+.35)*(reach*.62),b.y+Math.sin(a+.35)*(reach*.62));ctx.lineTo(b.x+Math.cos(a-.12)*(reach*.8),b.y+Math.sin(a-.12)*(reach*.8));ctx.lineTo(b.x+Math.cos(a+.2)*reach,b.y+Math.sin(a+.2)*reach);ctx.stroke();}
  ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+12+(state.settings?.reducedMotion?0:Math.sin(t)*3),0,Math.PI*2);ctx.stroke();
  let nearest=null,nearestDistance=175;for(const other of state.balls||[]){if(other===b)continue;const distance=Math.hypot(other.x-b.x,other.y-b.y);if(distance<nearestDistance){nearest=other;nearestDistance=distance;}}
  if(nearest){ctx.globalAlpha=.3+(state.settings?.reducedMotion?0:Math.abs(Math.sin(t))*.45);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,b.y);const midX=(b.x+nearest.x)/2,midY=(b.y+nearest.y)/2;ctx.lineTo(midX+(state.settings?.reducedMotion?0:Math.sin(t*1.7)*8),midY+(state.settings?.reducedMotion?0:Math.cos(t*1.4)*8));ctx.lineTo(nearest.x,nearest.y);ctx.stroke();}
 }else if(effect==='mirrorball'){const t=state.settings?.reducedMotion?0:performance.now()/150,charging=(b.powerEffect?.mirrorPulse??1)<.3;ctx.globalAlpha=charging?1:.72;ctx.beginPath();ctx.moveTo(b.x-b.r-4,b.y-b.r-4);ctx.lineTo(b.x+b.r+4,b.y+b.r+4);ctx.moveTo(b.x+b.r+4,b.y-b.r-4);ctx.lineTo(b.x-b.r-4,b.y+b.r+4);ctx.stroke();ctx.globalAlpha=.45;ctx.beginPath();ctx.ellipse(b.x,b.y,b.r+8,b.r+3,state.settings?.reducedMotion?0:t*.7,0,Math.PI*2);ctx.stroke();if(charging){ctx.globalAlpha=.8;ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+17,0,Math.PI*2);ctx.stroke();}
 }else if(effect==='phaseball'){
  const t=state.settings?.reducedMotion?0:performance.now()/180,charging=(b.powerEffect?.phaseCooldown??1)<.36;
  ctx.globalAlpha=charging?.95:.42;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(b.x-Math.cos(t+i)*5,b.y-Math.sin(t+i)*5,b.r+4+i*3,b.r+2+i*2,t+i*.4,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=charging?1:.9;ctx.beginPath();ctx.moveTo(b.x-4,b.y-b.r-8);ctx.lineTo(b.x+4,b.y-2);ctx.lineTo(b.x-3,b.y+2);ctx.lineTo(b.x+4,b.y+b.r+8);ctx.stroke();
  if(charging){ctx.globalAlpha=.65;ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+16,0,Math.PI*2);ctx.stroke();}
 }else if(effect==='fractalball'){const t=state.settings?.reducedMotion?0:performance.now()/130;ctx.globalAlpha=.7;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(b.x,b.y,b.r+5+i*4,b.r+3+i*3,t+i*.6,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.95;ctx.beginPath();ctx.moveTo(b.x,b.y-b.r-10);ctx.lineTo(b.x+5,b.y-2);ctx.lineTo(b.x-5,b.y+2);ctx.lineTo(b.x,b.y+b.r+10);ctx.stroke();
 }else if(effect==='chaos'||effect==='ricochet'){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3+i*3,i*2.1,i*2.1+1.4);ctx.stroke();}}else if(['topspin','backspin','sweetspot','softbounce'].includes(effect)){ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,0,Math.PI*2);ctx.stroke();const sign=effect==='backspin'?-1:1;ctx.beginPath();ctx.moveTo(b.x-sign*(b.r+9),b.y-4);ctx.lineTo(b.x-sign*(b.r+3),b.y);ctx.lineTo(b.x-sign*(b.r+9),b.y+4);ctx.stroke();if(effect==='sweetspot'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+10,0,Math.PI*2);ctx.stroke();}}
 if(persistent.sizeScale&&persistent.sizeScale!==1){ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();}
 if(persistent.trajectory){ctx.globalAlpha=.9;ctx.beginPath();if(persistent.trajectory==='flat'){ctx.moveTo(b.x-b.r-7,b.y);ctx.lineTo(b.x+b.r+7,b.y);ctx.moveTo(b.x+b.r+3,b.y-4);ctx.lineTo(b.x+b.r+7,b.y);ctx.lineTo(b.x+b.r+3,b.y+4);}else if(persistent.trajectory==='vertical'){ctx.moveTo(b.x,b.y-b.r-7);ctx.lineTo(b.x,b.y+b.r+7);ctx.moveTo(b.x-4,b.y+b.r+3);ctx.lineTo(b.x,b.y+b.r+7);ctx.lineTo(b.x+4,b.y+b.r+3);}else{for(let i=0;i<3;i++){const a=performance.now()/260+i*Math.PI*2/3;ctx.moveTo(b.x+Math.cos(a)*(b.r+3),b.y+Math.sin(a)*(b.r+3));ctx.lineTo(b.x+Math.cos(a+1.4)*(b.r+10),b.y+Math.sin(a+1.4)*(b.r+10));}}ctx.stroke();}
 ctx.restore();}
export function choosePowerup(available=POWERUPS){
 const weight=item=>['rouletteball','fractalball','chaosarena','mirrorball'].includes(item.id)?2.0:item.id==='phaseball'?0.62:item.id==='invert'?0.72:1;
 const total=available.reduce((sum,item)=>sum+weight(item),0);let roll=Math.random()*total;
 for(const item of available){roll-=weight(item);if(roll<=0)return item;}
 return available[available.length-1]||POWERUPS[0];
}
export function getPowerupDefinition(id){return byId[id]||POWERUPS[0];}
export function getBallSpeedMultiplier(ball=state.ball){return ball?.powerEffect?.time>0?(ball.powerEffect.scale||BALL_POWER_SCALE[ball.powerEffect.type]||1):1;}
export function getPaddleSpeedMultiplier(p){return p?.divineMotor>0?1.62:p?.haste>0?1.45:p?.palette>0?1.12:1;}
export function getBallPowerType(ball=state.ball){return ball?.powerEffect?.time>0?ball.powerEffect.type:'';}
export function enforceBallTrajectory(ball){const rule=ball?.matchEffects?.trajectory;if(!rule)return;const speed=speedOf(ball),dirX=Math.sign(ball.vx)||1,dirY=Math.sign(ball.vy)||1;if(rule==='flat'){ball.vx=dirX*speed*.995;ball.vy=dirY*speed*.1;}else if(rule==='vertical'){ball.vx=dirX*speed*.28;ball.vy=dirY*speed*.96;}else if(rule==='orbit'){const angle=Math.atan2(ball.vy,ball.vx)+(ball.matchEffects?.orbitDirection||1)*.0065;ball.vx=Math.cos(angle)*speed;ball.vy=Math.sin(angle)*speed;}ball.speed=speed;}
export function getPowerupColor(id){return byId[id]?.color||'#fff';}
