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
 {id:'magnetball',name:'Núcleo gravitatorio',symbol:'⦿',color:'#8df0d2',description:'Esta pelota genera un campo gravitatorio que curva hacia ella a las otras pelotas cercanas durante unos segundos.'},
 {id:'unstableball',name:'Caos inestable',symbol:'※',color:'#ffcf70',description:'Esta pelota cambia bruscamente de dirección a intervalos impredecibles durante unos segundos.'},
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
  case 'fireball': case 'ghostball': case 'heavyball': case 'lightningball': case 'chaos': case 'magnetball': case 'unstableball': setBallPower(id,id==='magnetball'?6.5:id==='unstableball'?5.5:5,ball);break;
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
 for(const ball of state.balls||[]){if(!ball?.powerEffect?.type)continue;ball.powerEffect.time=Math.max(0,(ball.powerEffect.time||0)-dt);if(ball.powerEffect.type==='unstableball'&&ball.powerEffect.time>0){ball.powerEffect.pulse=(ball.powerEffect.pulse??.4)-dt;if(ball.powerEffect.pulse<=0){const speed=speedOf(ball),angle=Math.atan2(ball.vy,ball.vx)+(Math.random()-.5)*1.15;ball.vx=Math.cos(angle)*speed;ball.vy=Math.sin(angle)*speed;ball.speed=speed;ball.powerEffect.pulse=.38+Math.random()*.55;burst(ball.x,ball.y,'#ffcf70',3,1.4);}}if(ball.powerEffect.time===0)clearBallPower(ball);}
 for(const side of ['p1','p2']){
  const p=state.paddles[side];if(!p)continue;
  for(const key of ['haste','aura','freeze','palette','powerGrow','powerShrink'])p[key]=Math.max(0,(p[key]||0)-dt);
 }
}
export function drawPowerupEffects(ctx){
 const e=state.worldEffects||{},W=SETTINGS.width,H=SETTINGS.height,cx=W/2,cy=H/2;
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

export function drawBallPower(ctx,b){const effect=b?.powerEffect?.time>0?b.powerEffect.type:'',persistent=b?.matchEffects||{},multi=(state.balls?.length||0)>1;if(!effect&&!persistent.trajectory&&!persistent.color&&(persistent.sizeScale||1)===1&&!multi)return;ctx.save();ctx.globalAlpha=effect==='ghostball'?.45:1;ctx.strokeStyle=byId[effect]?.color||persistent.color||(persistent.trajectory==='flat'?'#8adfff':persistent.trajectory==='vertical'?'#c4a7ff':persistent.trajectory==='orbit'?'#8df0d2':'#fff');ctx.fillStyle=byId[effect]?.color||persistent.color||'#fff';ctx.lineWidth=2;
 if(multi){const t=state.settings?.reducedMotion?0:performance.now()/180+(b.generation||0)*.7;ctx.globalAlpha=.48;ctx.strokeStyle=persistent.color||['#8ee9ff','#ff9fe5','#ffd479','#a5f3a5','#c4a7ff'][(Number(String(b.id||'').replace(/\D/g,''))||0)%5];ctx.beginPath();ctx.ellipse(b.x,b.y,b.r+5+Math.sin(t)*1.5,b.r+2+Math.cos(t)*1.5,t*.2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.24;ctx.beginPath();ctx.arc(b.x,b.y,b.r+9, t, t+Math.PI*1.2);ctx.stroke();}
 if(effect==='fireball'){
  const trail=(b.trail||[]);for(let i=0;i<trail.length;i++){const point=trail[i],alpha=(i+1)/(trail.length+1);ctx.globalAlpha=alpha*.62;ctx.fillStyle=i%2?'#ff875e':'#ffd479';ctx.beginPath();ctx.arc(point.x,point.y,Math.max(1,b.r*(.25+alpha*.45)),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=.9;ctx.strokeStyle='#ff875e';ctx.beginPath();ctx.moveTo(b.x-b.r-13,b.y-5);ctx.lineTo(b.x-b.r-3,b.y);ctx.lineTo(b.x-b.r-10,b.y+6);ctx.stroke();ctx.strokeStyle='#ffd479';ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,Math.PI*.1,Math.PI*1.8);ctx.stroke();
 }else if(effect==='ghostball'){const trail=(b.trail||[]);for(let i=0;i<trail.length;i++){const point=trail[i],alpha=(i+1)/(trail.length+1);ctx.globalAlpha=alpha*.32;ctx.beginPath();ctx.arc(point.x,point.y,b.r*(.35+alpha*.3),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(b.x,b.y,b.r+6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(b.x-3,b.y-2,b.r*.5,0,Math.PI*2);ctx.stroke();}
 else if(effect==='heavyball'){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();ctx.fillRect(b.x-2,b.y-2,4,4);}
 else if(effect==='lightningball'){ctx.beginPath();ctx.moveTo(b.x-5,b.y-b.r-7);ctx.lineTo(b.x+1,b.y-2);ctx.lineTo(b.x-4,b.y+1);ctx.lineTo(b.x+5,b.y+b.r+7);ctx.stroke();}
 else if(effect==='magnetball'){const t=state.settings?.reducedMotion?0:performance.now()/240;ctx.globalAlpha=.55;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(b.x,b.y,b.r+7+i*6,b.r+3+i*4,t+i*.7,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();}
 else if(effect==='unstableball'){const t=state.settings?.reducedMotion?0:performance.now()/90;ctx.globalAlpha=.8;for(let i=0;i<4;i++){const a=t+i*Math.PI/2;ctx.beginPath();ctx.moveTo(b.x+Math.cos(a)*(b.r+2),b.y+Math.sin(a)*(b.r+2));ctx.lineTo(b.x+Math.cos(a+.55)*(b.r+10),b.y+Math.sin(a+.55)*(b.r+10));ctx.stroke();}}
 else if(effect==='chaos'||effect==='ricochet'){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(b.x,b.y,b.r+3+i*3,i*2.1,i*2.1+1.4);ctx.stroke();}}
 if(persistent.sizeScale&&persistent.sizeScale!==1){ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2);ctx.stroke();}
 if(persistent.trajectory){ctx.globalAlpha=.9;ctx.beginPath();if(persistent.trajectory==='flat'){ctx.moveTo(b.x-b.r-7,b.y);ctx.lineTo(b.x+b.r+7,b.y);ctx.moveTo(b.x+b.r+3,b.y-4);ctx.lineTo(b.x+b.r+7,b.y);ctx.lineTo(b.x+b.r+3,b.y+4);}else if(persistent.trajectory==='vertical'){ctx.moveTo(b.x,b.y-b.r-7);ctx.lineTo(b.x,b.y+b.r+7);ctx.moveTo(b.x-4,b.y+b.r+3);ctx.lineTo(b.x,b.y+b.r+7);ctx.lineTo(b.x+4,b.y+b.r+3);}else{for(let i=0;i<3;i++){const a=performance.now()/260+i*Math.PI*2/3;ctx.moveTo(b.x+Math.cos(a)*(b.r+3),b.y+Math.sin(a)*(b.r+3));ctx.lineTo(b.x+Math.cos(a+1.4)*(b.r+10),b.y+Math.sin(a+1.4)*(b.r+10));}}ctx.stroke();}
 ctx.restore();}
export function getPowerupDefinition(id){return byId[id]||POWERUPS[0];}
export function getBallSpeedMultiplier(ball=state.ball){return ball?.powerEffect?.time>0?(ball.powerEffect.scale||BALL_POWER_SCALE[ball.powerEffect.type]||1):1;}
export function getPaddleSpeedMultiplier(p){return p?.haste>0?1.45:p?.palette>0?1.12:1;}
export function getBallPowerType(ball=state.ball){return ball?.powerEffect?.time>0?ball.powerEffect.type:'';}
export function enforceBallTrajectory(ball){const rule=ball?.matchEffects?.trajectory;if(!rule)return;const speed=speedOf(ball),dirX=Math.sign(ball.vx)||1,dirY=Math.sign(ball.vy)||1;if(rule==='flat'){ball.vx=dirX*speed*.995;ball.vy=dirY*speed*.1;}else if(rule==='vertical'){ball.vx=dirX*speed*.28;ball.vy=dirY*speed*.96;}else if(rule==='orbit'){const angle=Math.atan2(ball.vy,ball.vx)+(ball.matchEffects?.orbitDirection||1)*.0065;ball.vx=Math.cos(angle)*speed;ball.vy=Math.sin(angle)*speed;}ball.speed=speed;}
export function getPowerupColor(id){return byId[id]?.color||'#fff';}
