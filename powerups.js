import {state,spawnBall} from './state.js';
import {SETTINGS} from './config.js';
import {burst} from './effects.js';

export const POWERUPS = [
 {id:'colossus',name:'Coloso',symbol:'⬆',color:'#e8bd72',description:'Aumenta permanentemente tu paleta durante este partido; se acumula hasta un límite.'},
 {id:'miniature',name:'Miniatura',symbol:'↧',color:'#d6a4ff',description:'Reduce permanentemente tu paleta durante este partido; otro Coloso puede contrarrestarlo.'},
 {id:'aegis',name:'Égida',symbol:'⬡',color:'#70e4e9',description:'Bloquea una pelota que iba a salir.'},
 {id:'haste',name:'Impulso',symbol:'➤',color:'#a5f3a5',description:'Aumenta tu velocidad de movimiento.'},
 {id:'snare',name:'Grillete',symbol:'⌁',color:'#d49aff',description:'Reduce la velocidad de la paleta rival.'},
 {id:'invert',name:'Confusión',symbol:'↕',color:'#ff9fbe',description:'Invierte los controles del rival.'},
 {id:'fireball',name:'Bola ígnea',symbol:'✹',color:'#ff875e',description:'La pelota deja una estela ardiente.'},
 {id:'ghostball',name:'Bola espectral',symbol:'◌',color:'#c6c8ff',description:'La pelota se vuelve translúcida y difícil de seguir.'},
 {id:'heavyball',name:'Bola pesada',symbol:'●',color:'#b4a6a0',description:'La pelota pierde velocidad temporalmente.'},
 {id:'lightningball',name:'Bola relámpago',symbol:'ϟ',color:'#fff08a',description:'Esta pelota acelera durante unos segundos.'},
 {id:'ballgrow',name:'Masa creciente',symbol:'⊕',color:'#ffb36b',description:'Esta pelota aumenta de tamaño de forma persistente; los efectos contrarios pueden reducirla.'},
 {id:'ballshrink',name:'Masa menguante',symbol:'⊖',color:'#9dd6ff',description:'Esta pelota disminuye de tamaño de forma persistente.'},
 {id:'splitball',name:'Desdoblamiento',symbol:'⑂',color:'#a5f3a5',description:'Divide esta pelota en dos pelotas reales que pueden marcar y recoger poderes.'},
 {id:'divideball',name:'División caótica',symbol:'⁙',color:'#ff9fe5',description:'Divide esta pelota en tres trayectorias; el caos tiene un límite de pelotas.'},
 {id:'flatball',name:'Órbita lateral',symbol:'↔',color:'#8adfff',description:'Esta pelota conserva una trayectoria casi horizontal hasta que otro poder la cambie.'},
 {id:'verticalball',name:'Órbita vertical',symbol:'↕',color:'#c4a7ff',description:'Esta pelota adopta una trayectoria casi vertical, pero todavía puede cruzar la cancha.'},
 {id:'chromaball',name:'Bola cromática',symbol:'✺',color:'#ff9fe5',description:'Cambia el color de esta pelota hasta que otro poder la reemplace.'},
 {id:'chromaticarena',name:'Arena prismática',symbol:'◈',color:'#ff9be8',description:'La arena cambia de color continuamente durante unos segundos.'},
 {id:'chaos',name:'Rebote caótico',symbol:'✳',color:'#ffcf70',description:'Los rebotes alteran más el ángulo de la pelota.'},
 {id:'crosswind',name:'Viento cruzado',symbol:'≋',color:'#8adfff',description:'Una corriente desvía la pelota hacia arriba o abajo.'},
 {id:'eclipse',name:'Eclipse',symbol:'◐',color:'#9b8bce',description:'Oscurece la arena y genera una deriva sutil en la pelota.'},
 {id:'quake',name:'Terremoto',symbol:'⌁',color:'#e5a16c',description:'La arena se agrieta y sacudidas breves alteran la trayectoria de la pelota.'},
 {id:'prism',name:'Prisma',symbol:'◇',color:'#ff9be8',description:'La arena se refracta y los golpes reciben una desviación prismática leve.'},
 {id:'aura',name:'Aura de contraataque',symbol:'✦',color:'#f4e6a4',description:'Tu próximo golpe gana potencia y recibe un aura.'},
 {id:'shrink',name:'Maldición diminuta',symbol:'↧',color:'#d6a4ff',description:'Reduce temporalmente el tamaño de la paleta rival.'},
 {id:'freeze',name:'Prisión glacial',symbol:'❄',color:'#8ee9ff',description:'Inmoviliza brevemente la paleta rival.'},
 {id:'swap',name:'Intercambio astral',symbol:'⇅',color:'#f6a8d7',description:'Intercambia la altura de ambas paletas.'},
 {id:'reversal',name:'Voluntad inversa',symbol:'↶',color:'#ffb86b',description:'Invierte el rumbo actual de la pelota.'},
 {id:'gravity',name:'Pozo gravitatorio',symbol:'◉',color:'#c4a7ff',description:'La gravedad curva la trayectoria de la pelota.'},
 {id:'curveball',name:'Trayectoria serpentina',symbol:'〰',color:'#8df0d2',description:'La pelota serpentea durante unos segundos.'},
 {id:'ricochet',name:'Rebote titánico',symbol:'⤴',color:'#ffd479',description:'Los rebotes contra la pared y las paletas son más extremos.'},
 {id:'secondchance',name:'Segunda oportunidad',symbol:'⛨',color:'#9fe7a5',description:'Una salvada devuelve la pelota con un contraataque acelerado.'},
 {id:'doublepoint',name:'Juicio doble',symbol:'Ⅱ',color:'#ff8f91',description:'Si ganas el próximo punto, suma dos puntos.'},
 {id:'chromaaura',name:'Aura cromática',symbol:'✺',color:'#ff9fe5',description:'Tu paleta gana movilidad mientras su aura está activa.'},
 {id:'paddlechrome',name:'Paleta prismática',symbol:'▥',color:'#ff9fe5',description:'Cambia el color de tu paleta durante este partido; otro cambio cromático lo reemplaza.'},
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
export function resetPowerups(){state.temporaryWalls=[];state.worldEffects={eclipse:0,quake:0,quakePulse:0,prism:0,crosswind:0,gravity:0,curve:0,storm:0,rainbowArena:0};state.ballPower=EMPTY_BALL_POWER();for(const b of state.balls||[]){if(b){b.powerEffect=null;b.matchEffects={sizeScale:1,trajectory:'',color:''};b.baseR=BALL_BASE_R;b.r=BALL_BASE_R;b.color='#f6f4ed';}}for(const side of ['p1','p2']){const p=state.paddles[side];if(p){for(const key of ['haste','aura','freeze','palette','bonusPoint','shield','grow','shrink','powerGrow','powerShrink','slow','invert','aimBonus'])p[key]=0;p.matchSizeScale=1;p.powerColor='';p.shieldMode='';if(p.baseH)p.h=p.baseH;}}}
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
  case 'snare': opponent.slow=3.8;break;
  case 'invert': opponent.invert=3.2;break;
  case 'fireball': case 'ghostball': case 'heavyball': case 'lightningball': case 'chaos': setBallPower(id,5,ball);break;
  case 'ballgrow': setBallSize(ball,(ball.matchEffects?.sizeScale||1)+BALL_SIZE_STEP);break;
  case 'ballshrink': setBallSize(ball,(ball.matchEffects?.sizeScale||1)-BALL_SIZE_STEP);break;
  case 'splitball': spawnBall(ball,{angle:-.24});break;
  case 'divideball': spawnBall(ball,{angle:-.38});spawnBall(ball,{angle:.38});break;
  case 'flatball': ball.matchEffects={...(ball.matchEffects||{}),trajectory:'flat'};break;
  case 'verticalball': ball.matchEffects={...(ball.matchEffects||{}),trajectory:'vertical'};break;
  case 'chromaball': {const palette=BALL_PALETTE.filter(color=>color!==ball.matchEffects?.color);const color=palette[Math.floor(Math.random()*palette.length)]||'#ff9fe5';ball.matchEffects={...(ball.matchEffects||{}),color};ball.color=color;break;}
  case 'chromaticarena': state.worldEffects.rainbowArena=8;break;
  case 'crosswind': state.worldEffects.crosswind=4.5;break;
  case 'eclipse': state.worldEffects.eclipse=5;break;
  case 'quake': state.worldEffects.quake=3.5;state.worldEffects.quakePulse=.4;break;
  case 'prism': state.worldEffects.prism=6;break;
  case 'aura': owner.aura=7;break;
  case 'shrink': opponent.powerShrink=5;break;
  case 'freeze': opponent.freeze=1.15;break;
  case 'swap': {const y=owner.y;owner.y=clamp(opponent.y,0,SETTINGS.height-owner.h);opponent.y=clamp(y,0,SETTINGS.height-opponent.h);break;}
  case 'reversal': ball.vx*=-1;ball.vy*=-1;break;
  case 'gravity': state.worldEffects.gravity=4.5;break;
  case 'curveball': state.worldEffects.curve=4.5;break;
  case 'ricochet': setBallPower(id,5,ball);break;
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
 for(const ball of state.balls||[]){if(!ball?.powerEffect?.type)continue;ball.powerEffect.time=Math.max(0,(ball.powerEffect.time||0)-dt);if(ball.powerEffect.time===0)clearBallPower(ball);}
 for(const side of ['p1','p2']){
  const p=state.paddles[side];if(!p)continue;
  for(const key of ['haste','aura','freeze','palette','powerGrow','powerShrink'])p[key]=Math.max(0,(p[key]||0)-dt);
 }
}
export function drawPowerupEffects(ctx){
 const e=state.worldEffects||{},W=SETTINGS.width,H=SETTINGS.height,cx=W/2,cy=H/2;
 if(e.rainbowArena>0){ctx.save();const hue=(performance.now()/18)%360;ctx.fillStyle=`hsla(${hue},85%,58%,.13)`;ctx.fillRect(24,24,W-48,H-48);ctx.strokeStyle=`hsl(${(hue+80)%360},95%,72%)`;ctx.globalAlpha=.48;ctx.lineWidth=3;ctx.strokeRect(24,24,W-48,H-48);ctx.restore();}
 if(e.eclipse>0){ctx.save();ctx.fillStyle='rgba(9,7,24,.48)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#a99bdf';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,78+Math.sin(performance.now()/220)*5,0,Math.PI*2);ctx.stroke();ctx.restore();}
 if(e.prism>0){ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#ef82d7';ctx.fillRect(0,0,cx,H);ctx.fillStyle='#65dce8';ctx.fillRect(cx,0,W-cx,H);ctx.globalAlpha=.35;ctx.strokeStyle='#ffe3ff';ctx.lineWidth=2;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(cx-90+i*45,0);ctx.lineTo(cx-90+i*45,H);ctx.stroke();}ctx.restore();}
 if(e.quake>0&&!state.settings?.reducedMotion&&state.settings?.quality!=='low'){ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle='#e5a16c';ctx.lineWidth=2;for(let i=0;i<5;i++){const y=65+i*112,offset=Math.sin(performance.now()/80+i)*8;ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(cx+offset,y-8);ctx.lineTo(W-24,y+offset);ctx.stroke();}ctx.restore();}
 if(e.crosswind>0){ctx.save();ctx.globalAlpha=.24;ctx.strokeStyle='#8adfff';ctx.lineWidth=2;const drift=Math.sin(performance.now()/250)*18;for(let i=0;i<6;i++){const y=55+i*95;ctx.beginPath();ctx.moveTo(65+drift,y);ctx.bezierCurveTo(cx-130,y-20-drift,cx+130,y+20+drift,W-65-drift,y);ctx.stroke();ctx.beginPath();ctx.moveTo(W-75-drift,y-5);ctx.lineTo(W-65-drift,y);ctx.lineTo(W-75-drift,y+5);ctx.stroke();}ctx.restore();}
 if(e.gravity>0){ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#c4a7ff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,45+i*24,24+i*15,performance.now()/900+i*.4,0,Math.PI*2);ctx.stroke();}ctx.restore();}
 if(e.curve>0){ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle='#8df0d2';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();for(let x=35;x<=W-35;x+=12){const y=cy+i*28-42+Math.sin(x/48+performance.now()/250+i)*12;if(x===35)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.restore();}
 if(e.storm>0){ctx.save();ctx.fillStyle='rgba(25,48,83,.17)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#8adfff';ctx.lineWidth=2;ctx.globalAlpha=.6;const pulse=(performance.now()/100|0)%5;for(let i=0;i<3;i++){const x=100+((i*317+pulse*71)%(W-200)),y=25+((i*137+pulse*47)%(H-80));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+18);ctx.lineTo(x+4,y+25);ctx.lineTo(x-10,y+43);ctx.stroke();}ctx.globalAlpha=.18;ctx.strokeStyle='#d8f6ff';for(let i=0;i<7;i++){const y=40+i*82;ctx.beginPath();ctx.moveTo(25,y);ctx.lineTo(W-25,y+Math.sin(performance.now()/140+i)*12);ctx.stroke();}ctx.restore();}
}

export function drawBallPower(ctx,b){const effect=b?.powerEffect?.time>0?b.powerEffect.type:'',persistent=b?.matchEffects||{};if(!effect&&!persistent.trajectory&&!persistent.color&&(persistent.sizeScale||1)===1)return;ctx.save();ctx.globalAlpha=effect==='ghostball'?.45:1;ctx.strokeStyle=byId[effect]?.color||persistent.color||(persistent.trajectory==='flat'?'#8adfff':persistent.trajectory==='vertical'?'#c4a7ff':'#fff');ctx.fillStyle=byId[effect]?.color||persistent.color||'#fff';ctx.lineWidth=2;
 if(effect==='fireball'){
  const trail=(b.trail||[]);for(let i=0;i<trail.length;i++){const point=trail[i],alpha=(i+1)/(trail.length+1);ctx.globalAlpha=alpha*.62;ctx.fillStyle=i%2?'#ff875e':'#ffd479';ctx.beginPath();ctx.arc(point.x,point.y,Math.max(1,b.r*(.25+alpha*.45)),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=.9;ctx.strokeStyle='#ff875e';ctx.beginPath();ctx.moveTo(b.x-b.r-13,b.y-5);ctx.lineTo(b.x-b.r-3,b.y);ctx.lineTo(b.x-b.r-10,b.y+6);ctx.stroke();ctx.strokeStyle='#ffd479';ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,Math.PI*.1,Math.PI*1.8);ctx.stroke();
 }else if(effect==='ghostball'){const trail=(b.trail||[]);for(let i=0;i<trail.length;i++){const point=trail[i],alpha=(i+1)/(trail.length+1);ctx.globalAlpha=alpha*.32;ctx.beginPath();ctx.arc(point.x,point.y,b.r*(.35+alpha*.3),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(b.x,b.y,b.r+6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(b.x-3,b.y-2,b.r*.5,0,Math.PI*2);ctx.stroke();}
 else if(effect==='heavyball'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();ctx.fillRect(b.x-2,b.y-2,4,4);}
 else if(effect==='lightningball'){ctx.beginPath();ctx.moveTo(b.x-5,b.y-b.r-7);ctx.lineTo(b.x+1,b.y-2);ctx.lineTo(b.x-4,b.y+1);ctx.lineTo(b.x+5,b.y+b.r+7);ctx.stroke();}
 else if(effect==='chaos'||effect==='ricochet'){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3+i*3,i*2.1,i*2.1+1.4);ctx.stroke();}}
 if(persistent.sizeScale&&persistent.sizeScale!==1){ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();}
 if(persistent.trajectory){ctx.globalAlpha=.9;ctx.beginPath();if(persistent.trajectory==='flat'){ctx.moveTo(b.x-b.r-7,b.y);ctx.lineTo(b.x+b.r+7,b.y);ctx.moveTo(b.x+b.r+3,b.y-4);ctx.lineTo(b.x+b.r+7,b.y);ctx.lineTo(b.x+b.r+3,b.y+4);}else{ctx.moveTo(b.x,b.y-b.r-7);ctx.lineTo(b.x,b.y+b.r+7);ctx.moveTo(b.x-4,b.y+b.r+3);ctx.lineTo(b.x,b.y+b.r+7);ctx.lineTo(b.x+4,b.y+b.r+3);}ctx.stroke();}
 ctx.restore();}
export function getPowerupDefinition(id){return byId[id]||POWERUPS[0];}
export function getBallSpeedMultiplier(ball=state.ball){return ball?.powerEffect?.time>0?(ball.powerEffect.scale||BALL_POWER_SCALE[ball.powerEffect.type]||1):1;}
export function getPaddleSpeedMultiplier(p){return p?.haste>0?1.45:p?.palette>0?1.12:1;}
export function getBallPowerType(ball=state.ball){return ball?.powerEffect?.time>0?ball.powerEffect.type:'';}
export function enforceBallTrajectory(ball){const rule=ball?.matchEffects?.trajectory;if(!rule)return;const speed=speedOf(ball),dirX=Math.sign(ball.vx)||1,dirY=Math.sign(ball.vy)||1;if(rule==='flat'){ball.vx=dirX*speed*.995;ball.vy=dirY*speed*.1;}else if(rule==='vertical'){ball.vx=dirX*speed*.28;ball.vy=dirY*speed*.96;}ball.speed=speed;}
export function getPowerupColor(id){return byId[id]?.color||'#fff';}
