import {state} from './state.js';
import {SETTINGS} from './config.js';
import {burst} from './effects.js';

export const POWERUPS = [
 {id:'colossus',name:'Coloso',symbol:'⬆',color:'#e8bd72',description:'Aumenta el tamaño de tu paleta.'},
 {id:'aegis',name:'Égida',symbol:'⬡',color:'#70e4e9',description:'Bloquea una pelota que iba a salir.'},
 {id:'haste',name:'Impulso',symbol:'➤',color:'#a5f3a5',description:'Aumenta tu velocidad de movimiento.'},
 {id:'snare',name:'Grillete',symbol:'⌁',color:'#d49aff',description:'Reduce la velocidad de la paleta rival.'},
 {id:'invert',name:'Confusión',symbol:'↕',color:'#ff9fbe',description:'Invierte los controles del rival.'},
 {id:'fireball',name:'Bola ígnea',symbol:'✹',color:'#ff875e',description:'La pelota deja una estela ardiente.'},
 {id:'ghostball',name:'Bola espectral',symbol:'◌',color:'#c6c8ff',description:'La pelota se vuelve translúcida y difícil de seguir.'},
 {id:'heavyball',name:'Bola pesada',symbol:'●',color:'#b4a6a0',description:'La pelota pierde velocidad temporalmente.'},
 {id:'lightningball',name:'Bola relámpago',symbol:'ϟ',color:'#fff08a',description:'La pelota acelera durante unos segundos.'},
 {id:'chaos',name:'Rebote caótico',symbol:'✳',color:'#ffcf70',description:'Los rebotes alteran más el ángulo de la pelota.'},
 {id:'crosswind',name:'Viento cruzado',symbol:'≋',color:'#8adfff',description:'Una corriente desvía la pelota hacia arriba o abajo.'},
 {id:'eclipse',name:'Eclipse',symbol:'◐',color:'#9b8bce',description:'Oscurece la arena temporalmente.'},
 {id:'quake',name:'Terremoto',symbol:'⌁',color:'#e5a16c',description:'La arena tiembla suavemente.'},
 {id:'prism',name:'Prisma',symbol:'◇',color:'#ff9be8',description:'Cambia temporalmente la paleta de colores de la arena.'},
 {id:'aura',name:'Aura de contraataque',symbol:'✦',color:'#f4e6a4',description:'Tu próximo golpe gana potencia y recibe un aura.'},
 {id:'shrink',name:'Maldición diminuta',symbol:'↧',color:'#d6a4ff',description:'Reduce temporalmente el tamaño de la paleta rival.'},
 {id:'freeze',name:'Prisión glacial',symbol:'❄',color:'#8ee9ff',description:'Inmoviliza brevemente la paleta rival.'},
 {id:'swap',name:'Intercambio astral',symbol:'⇅',color:'#f6a8d7',description:'Intercambia la altura de ambas paletas.'},
 {id:'reversal',name:'Voluntad inversa',symbol:'↶',color:'#ffb86b',description:'Invierte el rumbo actual de la pelota.'},
 {id:'gravity',name:'Pozo gravitatorio',symbol:'◉',color:'#c4a7ff',description:'La gravedad curva la trayectoria de la pelota.'},
 {id:'curveball',name:'Trayectoria serpentina',symbol:'〰',color:'#8df0d2',description:'La pelota serpentea durante unos segundos.'},
 {id:'ricochet',name:'Rebote titánico',symbol:'⤴',color:'#ffd479',description:'Los rebotes contra la pared y las paletas son más extremos.'},
 {id:'secondchance',name:'Segunda oportunidad',symbol:'⛨',color:'#9fe7a5',description:'Activa un escudo adicional para el próximo punto.'},
 {id:'doublepoint',name:'Juicio doble',symbol:'Ⅱ',color:'#ff8f91',description:'Si ganas el próximo punto, suma dos puntos.'},
 {id:'chromaaura',name:'Aura cromática',symbol:'✺',color:'#ff9fe5',description:'Tu paleta queda envuelta en un aura de color temporal.'},
 {id:'runebarricade',name:'Barricada rúnica',symbol:'ᛉ',color:'#8ee9ff',description:'Invoca durante un instante una formación de muros rúnicos en el centro de la arena.'},
 {id:'divinestorm',name:'Tempestad divina',symbol:'ϟ',color:'#8adfff',description:'Transforma la arena en una tormenta eléctrica y desvía la pelota con ráfagas de viento.'}
];
const byId = Object.fromEntries(POWERUPS.map(p=>[p.id,p]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const BALL_POWER_SCALE={heavyball:.72,lightningball:1.22};
const speedOf=ball=>Math.hypot(ball.vx,ball.vy)||ball.speed||SETTINGS.ballSpeed;
function setBallPower(type,duration,ball){
 const current=speedOf(ball);
 const previous=state.ballPower?.time>0?(state.ballPower.scale||BALL_POWER_SCALE[state.ballPower.type]||1):1;
 const normalSpeed=current/previous;
 const scale=BALL_POWER_SCALE[type]||1;
 const target=clamp(normalSpeed*scale,3.2,SETTINGS.maxBallSpeed);
 if(current>0){ball.vx=ball.vx/current*target;ball.vy=ball.vy/current*target;}
 ball.speed=target;
 state.ballPower={type,time:duration,baseSpeed:normalSpeed,scale};
}
function clearBallPower(ball){
 const active=state.ballPower;
 if(active?.time>0){
  const current=speedOf(ball),scale=active.scale||BALL_POWER_SCALE[active.type]||1;
  const target=clamp(current/scale,3.2,SETTINGS.maxBallSpeed);
  if(current>0){ball.vx=ball.vx/current*target;ball.vy=ball.vy/current*target;}
  ball.speed=target;
 }
 state.ballPower={type:'',time:0,baseSpeed:0,scale:1};
}
export function resetPowerups(){state.temporaryWalls=[];state.worldEffects={eclipse:0,quake:0,prism:0,crosswind:0,gravity:0,curve:0,storm:0};state.ballPower={type:'',time:0,baseSpeed:0,scale:1};for(const side of ['p1','p2']){const p=state.paddles[side];if(p){for(const key of ['haste','aura','freeze','palette','bonusPoint','shield','grow','shrink','slow','invert'])p[key]=0;if(p.baseH)p.h=p.baseH;}}}
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
export function applyPowerup(id,side){const def=byId[id];if(!def)return;const owner=state.paddles[side],opponent=state.paddles[side==='p1'?'p2':'p1'],ball=state.ball;if(!owner||!opponent||!ball)return;
 switch(id){
  case 'colossus': owner.grow=5;break;
  case 'aegis': owner.shield=2.8;break;
  case 'haste': owner.haste=5;break;
  case 'snare': opponent.slow=3.8;break;
  case 'invert': opponent.invert=3.2;break;
  case 'fireball': case 'ghostball': case 'heavyball': case 'lightningball': case 'chaos': setBallPower(id,5,ball);break;
  case 'crosswind': state.worldEffects.crosswind=4.5;break;
  case 'eclipse': state.worldEffects.eclipse=5;break;
  case 'quake': state.worldEffects.quake=3.5;break;
  case 'prism': state.worldEffects.prism=6;break;
  case 'aura': owner.aura=7;break;
  case 'shrink': opponent.shrink=5;break;
  case 'freeze': opponent.freeze=1.15;break;
  case 'swap': {const y=owner.y;owner.y=clamp(opponent.y,0,SETTINGS.height-owner.h);opponent.y=clamp(y,0,SETTINGS.height-opponent.h);break;}
  case 'reversal': ball.vx*=-1;ball.vy*=-1;break;
  case 'gravity': state.worldEffects.gravity=4.5;break;
  case 'curveball': state.worldEffects.curve=4.5;break;
  case 'ricochet': setBallPower(id,5,ball);break;
  case 'secondchance': owner.shield=Math.max(owner.shield||0,4.5);break;
  case 'doublepoint': owner.bonusPoint=1;break;
  case 'chromaaura': owner.palette=6;break;
  case 'runebarricade': summonRuneBarricades();break;
  case 'divinestorm': state.worldEffects.storm=5;state.worldEffects.crosswind=Math.max(state.worldEffects.crosswind||0,4.5);setBallPower('lightningball',3.5,ball);break;
 }
 burst(ball.x,ball.y,def.color,5,2);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:def.name,color:def.color}}));
}
export function updatePowerups(dt){
 if(!state.worldEffects)resetPowerups();
 for(const key of Object.keys(state.worldEffects))state.worldEffects[key]=Math.max(0,(state.worldEffects[key]||0)-dt);
 if(state.ballPower?.time>0){
  state.ballPower.time=Math.max(0,state.ballPower.time-dt);
  if(state.ballPower.time===0)clearBallPower(state.ball);
 }
 for(const side of ['p1','p2']){
  const p=state.paddles[side];if(!p)continue;
  for(const key of ['haste','aura','freeze','palette'])p[key]=Math.max(0,(p[key]||0)-dt);
 }
}
export function drawPowerupEffects(ctx){
 const e=state.worldEffects||{},W=SETTINGS.width,H=SETTINGS.height,cx=W/2,cy=H/2;
 if(e.eclipse>0){ctx.save();ctx.fillStyle='rgba(9,7,24,.48)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#a99bdf';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,78+Math.sin(performance.now()/220)*5,0,Math.PI*2);ctx.stroke();ctx.restore();}
 if(e.prism>0){ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#ef82d7';ctx.fillRect(0,0,cx,H);ctx.fillStyle='#65dce8';ctx.fillRect(cx,0,W-cx,H);ctx.globalAlpha=.35;ctx.strokeStyle='#ffe3ff';ctx.lineWidth=2;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(cx-90+i*45,0);ctx.lineTo(cx-90+i*45,H);ctx.stroke();}ctx.restore();}
 if(e.quake>0&&!state.settings?.reducedMotion&&state.settings?.quality!=='low'){ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle='#e5a16c';ctx.lineWidth=2;for(let i=0;i<5;i++){const y=65+i*112,offset=Math.sin(performance.now()/80+i)*8;ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(cx+offset,y-8);ctx.lineTo(W-24,y+offset);ctx.stroke();}ctx.restore();}
 if(e.crosswind>0){ctx.save();ctx.globalAlpha=.24;ctx.strokeStyle='#8adfff';ctx.lineWidth=2;const drift=Math.sin(performance.now()/250)*18;for(let i=0;i<6;i++){const y=55+i*95;ctx.beginPath();ctx.moveTo(65+drift,y);ctx.bezierCurveTo(cx-130,y-20-drift,cx+130,y+20+drift,W-65-drift,y);ctx.stroke();ctx.beginPath();ctx.moveTo(W-75-drift,y-5);ctx.lineTo(W-65-drift,y);ctx.lineTo(W-75-drift,y+5);ctx.stroke();}ctx.restore();}
 if(e.gravity>0){ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#c4a7ff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,45+i*24,24+i*15,performance.now()/900+i*.4,0,Math.PI*2);ctx.stroke();}ctx.restore();}
 if(e.curve>0){ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle='#8df0d2';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();for(let x=35;x<=W-35;x+=12){const y=cy+i*28-42+Math.sin(x/48+performance.now()/250+i)*12;if(x===35)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.restore();}
 if(e.storm>0){ctx.save();ctx.fillStyle='rgba(25,48,83,.17)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#8adfff';ctx.lineWidth=2;ctx.globalAlpha=.6;const pulse=(performance.now()/100|0)%5;for(let i=0;i<3;i++){const x=100+((i*317+pulse*71)%(W-200)),y=25+((i*137+pulse*47)%(H-80));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+18);ctx.lineTo(x+4,y+25);ctx.lineTo(x-10,y+43);ctx.stroke();}ctx.globalAlpha=.18;ctx.strokeStyle='#d8f6ff';for(let i=0;i<7;i++){const y=40+i*82;ctx.beginPath();ctx.moveTo(25,y);ctx.lineTo(W-25,y+Math.sin(performance.now()/140+i)*12);ctx.stroke();}ctx.restore();}
}

export function drawBallPower(ctx,b){const effect=state.ballPower?.time>0?state.ballPower.type:'';if(!effect)return;ctx.save();ctx.globalAlpha=effect==='ghostball'?.45:1;ctx.strokeStyle=byId[effect]?.color||'#fff';ctx.fillStyle=byId[effect]?.color||'#fff';ctx.lineWidth=2;if(effect==='fireball'){ctx.beginPath();ctx.moveTo(b.x-b.r-11,b.y-5);ctx.lineTo(b.x-b.r-3,b.y);ctx.lineTo(b.x-b.r-10,b.y+6);ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,Math.PI*.1,Math.PI*1.8);ctx.stroke();}else if(effect==='ghostball'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(b.x-3,b.y-2,b.r*.5,0,Math.PI*2);ctx.stroke();}else if(effect==='heavyball'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();ctx.fillRect(b.x-2,b.y-2,4,4);}else if(effect==='lightningball'){ctx.beginPath();ctx.moveTo(b.x-5,b.y-b.r-7);ctx.lineTo(b.x+1,b.y-2);ctx.lineTo(b.x-4,b.y+1);ctx.lineTo(b.x+5,b.y+b.r+7);ctx.stroke();}else if(effect==='chaos'||effect==='ricochet'){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3+i*3,i*2.1,i*2.1+1.4);ctx.stroke();}}ctx.restore();}
export function getPowerupDefinition(id){return byId[id]||POWERUPS[0];}
export function getBallSpeedMultiplier(){return state.ballPower?.time>0?(state.ballPower.scale||BALL_POWER_SCALE[state.ballPower.type]||1):1;}
export function getPaddleSpeedMultiplier(p){return p?.haste>0?1.45:1;}
export function getBallPowerType(){return state.ballPower?.time>0?state.ballPower.type:'';}
export function getPowerupColor(id){return byId[id]?.color||'#fff';}
