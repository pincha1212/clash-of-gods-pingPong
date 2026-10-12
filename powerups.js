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
 {id:'chromaaura',name:'Aura cromática',symbol:'✺',color:'#ff9fe5',description:'Tu paleta queda envuelta en un aura de color temporal.'}
];
const byId = Object.fromEntries(POWERUPS.map(p=>[p.id,p]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function resetPowerups(){state.worldEffects={eclipse:0,quake:0,prism:0,crosswind:0,gravity:0,curve:0};state.ballPower={type:'',time:0,baseSpeed:0};for(const side of ['p1','p2']){const p=state.paddles[side];if(p){for(const key of ['haste','aura','freeze','palette','bonusPoint','shield','grow','shrink','slow','invert'])p[key]=0;if(p.baseH)p.h=p.baseH;}}}
export function applyPowerup(id,side){const def=byId[id];if(!def)return;const owner=state.paddles[side],opponent=state.paddles[side==='p1'?'p2':'p1'],ball=state.ball;if(!owner||!opponent||!ball)return;
 switch(id){
  case 'colossus': owner.grow=5;break;
  case 'aegis': owner.shield=2.8;break;
  case 'haste': owner.haste=5;break;
  case 'snare': opponent.slow=3.8;break;
  case 'invert': opponent.invert=3.2;break;
  case 'fireball': case 'ghostball': case 'heavyball': case 'lightningball': case 'chaos': state.ballPower={type:id,time:5,baseSpeed:Math.hypot(ball.vx,ball.vy)||ball.speed};break;
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
  case 'ricochet': state.ballPower={type:id,time:5,baseSpeed:Math.hypot(ball.vx,ball.vy)||ball.speed};break;
  case 'secondchance': owner.shield=Math.max(owner.shield||0,4.5);break;
  case 'doublepoint': owner.bonusPoint=1;break;
  case 'chromaaura': owner.palette=6;break;
 }
 burst(ball.x,ball.y,def.color,5,2);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:def.name,color:def.color}}));
}
export function updatePowerups(dt){if(!state.worldEffects)resetPowerups();for(const key of Object.keys(state.worldEffects))state.worldEffects[key]=Math.max(0,state.worldEffects[key]-dt);if(state.ballPower?.time>0){state.ballPower.time=Math.max(0,state.ballPower.time-dt);if(state.ballPower.time===0)state.ballPower.type='';}for(const side of ['p1','p2']){const p=state.paddles[side];if(p)p.haste=Math.max(0,(p.haste||0)-dt);if(p)p.aura=Math.max(0,(p.aura||0)-dt);if(p)p.freeze=Math.max(0,(p.freeze||0)-dt);if(p)p.palette=Math.max(0,(p.palette||0)-dt);}}
export function drawPowerupEffects(ctx){const e=state.worldEffects||{};if(e.eclipse>0){ctx.save();ctx.fillStyle='rgba(9,7,24,.43)';ctx.fillRect(24,24,952,552);ctx.strokeStyle='#a99bdf';ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(500,300,78,0,Math.PI*2);ctx.stroke();ctx.restore();}if(e.prism>0){ctx.save();ctx.globalAlpha=.10;ctx.fillStyle='#ef82d7';ctx.fillRect(24,24,476,552);ctx.fillStyle='#65dce8';ctx.fillRect(500,24,476,552);ctx.restore();}if(e.quake>0&&!state.settings?.reducedMotion&&state.settings?.quality!=='low'){ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle='#e5a16c';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(40,100+i*130);ctx.lineTo(960,85+i*130);ctx.stroke();}ctx.restore();}}
export function drawBallPower(ctx,b){const effect=state.ballPower?.time>0?state.ballPower.type:'';if(!effect)return;ctx.save();ctx.globalAlpha=effect==='ghostball'?.45:1;ctx.strokeStyle=byId[effect]?.color||'#fff';ctx.fillStyle=byId[effect]?.color||'#fff';ctx.lineWidth=2;if(effect==='fireball'){ctx.beginPath();ctx.moveTo(b.x-b.r-11,b.y-5);ctx.lineTo(b.x-b.r-3,b.y);ctx.lineTo(b.x-b.r-10,b.y+6);ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,Math.PI*.1,Math.PI*1.8);ctx.stroke();}else if(effect==='ghostball'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(b.x-3,b.y-2,b.r*.5,0,Math.PI*2);ctx.stroke();}else if(effect==='heavyball'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();ctx.fillRect(b.x-2,b.y-2,4,4);}else if(effect==='lightningball'){ctx.beginPath();ctx.moveTo(b.x-5,b.y-b.r-7);ctx.lineTo(b.x+1,b.y-2);ctx.lineTo(b.x-4,b.y+1);ctx.lineTo(b.x+5,b.y+b.r+7);ctx.stroke();}else if(effect==='chaos'||effect==='ricochet'){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3+i*3,i*2.1,i*2.1+1.4);ctx.stroke();}}ctx.restore();}
export function getPowerupDefinition(id){return byId[id]||POWERUPS[0];}
export function getBallSpeedMultiplier(){const t=state.ballPower?.type;if(t==='heavyball')return .72;if(t==='lightningball')return 1.22;return 1;}
export function getPaddleSpeedMultiplier(p){return p?.haste>0?1.45:1;}
export function getBallPowerType(){return state.ballPower?.time>0?state.ballPower.type:'';}
export function getPowerupColor(id){return byId[id]?.color||'#fff';}
