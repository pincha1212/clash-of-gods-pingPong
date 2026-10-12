import {state} from './state.js';
import {SETTINGS} from './config.js';
import {burst} from './effects.js';
import {playTone} from './audio.js';
import {POWERUPS,applyPowerup,updatePowerups,getBallSpeedMultiplier,getPaddleSpeedMultiplier,getBallPowerType} from './powerups.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ballMagnitude=b=>Math.hypot(b.vx,b.vy)||1;
function capBallSpeed(b){const speed=ballMagnitude(b);if(speed>SETTINGS.maxBallSpeed){b.vx=b.vx/speed*SETTINGS.maxBallSpeed;b.vy=b.vy/speed*SETTINGS.maxBallSpeed;}}
function getColor(side){return getComputedStyle(document.documentElement).getPropertyValue(side==='p1'?'--p1':'--p2').trim()||'#fff';}

// Segmento contra rectángulo expandido por el radio de la pelota. Evita atravesar barreras estrechas.
function segmentRectHit(x0,y0,x1,y1,rect,r){
 const minX=rect.x-r,maxX=rect.x+rect.w+r,minY=rect.y-r,maxY=rect.y+rect.h+r;
 const dx=x1-x0,dy=y1-y0;let enter=0,exit=1,axis='x';
 for(const [origin,delta,min,max,currentAxis] of [[x0,dx,minX,maxX,'x'],[y0,dy,minY,maxY,'y']]){
  if(Math.abs(delta)<1e-9){if(origin<min||origin>max)return null;continue;}
  let a=(min-origin)/delta,b=(max-origin)/delta;if(a>b)[a,b]=[b,a];
  if(a>enter){enter=a;axis=currentAxis;}exit=Math.min(exit,b);if(enter>exit)return null;
 }
 if(enter<0||enter>1)return null;
 return {t:enter,axis};
}
function collideWithTemporaryWalls(b,prevX,prevY){
 const dx=b.x-prevX,dy=b.y-prevY;let first=null;
 for(const wall of state.temporaryWalls){const hit=segmentRectHit(prevX,prevY,b.x,b.y,wall,b.r);if(hit&&(!first||hit.t<first.t))first={...hit,wall};}
 if(!first)return false;
 b.x=prevX+dx*first.t;b.y=prevY+dy*first.t;
 if(first.axis==='x'){b.vx*=-1;b.x+=Math.sign(b.vx)*.75;}else{b.vy*=-1;b.y+=Math.sign(b.vy)*.75;}
 playTone(310,.025,'triangle',.018);return true;
}
function collideWithPaddle(b,prevX,prevY,p,side){
 const dx=b.x-prevX,dy=b.y-prevY,toward=side==='p1'?b.vx<0:b.vx>0;if(!toward)return false;
 const plane=side==='p1'?p.x+p.w+b.r:p.x-b.r;
 let hitY=b.y,hitX=plane,hit=false;
 if(Math.abs(dx)>1e-9){const t=(plane-prevX)/dx;if(t>=0&&t<=1&&((side==='p1'&&dx<0)||(side==='p2'&&dx>0))){hitY=prevY+dy*t;hit=Math.abs(hitY-(p.y+p.h/2))<=p.h/2+b.r;}}
 if(!hit){const overlapsX=b.x+b.r>=p.x&&b.x-b.r<=p.x+p.w;const overlapsY=b.y+b.r>=p.y&&b.y-b.r<=p.y+p.h;if(overlapsX&&overlapsY){hit=true;hitY=b.y;hitX=side==='p1'?p.x+p.w+b.r:p.x-b.r;}}
 if(!hit)return false;
 b.x=hitX;b.y=hitY;
 const norm=clamp((hitY-(p.y+p.h/2))/(p.h/2),-1,1),dir=side==='p1'?1:-1;
 // Conserva la escala de los modificadores de pelota y aumenta la intensidad
 // de forma gradual según la duración del intercambio, sin saltos bruscos.
 const baseSpeed=SETTINGS.ballSpeed*getBallSpeedMultiplier();
 const rallyFloor=baseSpeed*(1+Math.min(state.rally,16)*.018);
 let speed=Math.min(SETTINGS.maxBallSpeed,Math.max(rallyFloor,ballMagnitude(b)*1.012));
 if(p.counter>0){speed=Math.min(SETTINGS.maxBallSpeed,speed*1.24);p.counter=0;burst(b.x,b.y,p.color,6,2.2);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'CONTRAATAQUE',color:p.color}}));}
 // El movimiento vertical de la paleta influye sutilmente en el ángulo:
 // permite apuntar con intención sin hacer que el control sea impredecible.
 const paddleMotion=clamp((p.motion||0)/Math.max(1,p.speed),-1,1);
 let angle=norm*1.08+paddleMotion*.20;
 if(getBallPowerType()==='chaos')angle+=(Math.random()-.5)*.7;
 if(getBallPowerType()==='ricochet')angle+=(Math.random()-.5)*1.0;
 angle=clamp(angle,-1.18,1.18);
 const perfect=Math.abs(norm)>=.22&&Math.abs(norm)<=.38;
 if(perfect){speed=Math.min(SETTINGS.maxBallSpeed,speed*1.07);burst(b.x,b.y,p.color,5,1.9);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'GOLPE PRECISO',color:p.color}}));}
 b.vx=dir*speed*Math.cos(angle);b.vy=speed*Math.sin(angle);b.speed=speed;b.lastHit=side;b.fire=0;b.color='#f6f4ed';state.rally++;
 if(p.aura>0){speed=Math.min(SETTINGS.maxBallSpeed,speed*1.22);const magnitude=ballMagnitude(b);b.vx=b.vx/magnitude*speed;b.vy=b.vy/magnitude*speed;p.aura=0;p.counter=0;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'AURA DE CONTRAATAQUE',color:p.color}}));}
 burst(b.x,b.y,p.color,perfect?4:2,perfect?1.8:1.1);playTone(perfect?side==='p1'?560:680:side==='p1'?410:520,perfect?.075:.055,'triangle',perfect?.045:.035);return true;
}

export function serve(direction=Math.random()>.5?1:-1){
 const b=state.ball;state.temporaryWalls=[];b.x=SETTINGS.width/2;b.y=SETTINGS.height/2;b.speed=SETTINGS.ballSpeed;b.vx=direction*b.speed;b.vy=(Math.random()-.5)*b.speed*.65;b.color='#f6f4ed';b.glow=0;b.fire=0;b.specialEffect='';b.effectTime=0;b.trail=[];b.lastHit=direction>0?'p1':'p2';state.ballPower={type:'',time:0,baseSpeed:0,scale:1};state.serveTimer=.65;state.rally=0;
}

export function updatePhysics(dt){
 if(!state.running||state.paused||state.finished)return;
 dt=clamp(Number.isFinite(dt)?dt:0,0,.033);updatePowerups(dt);const b=state.ball;
 for(const side of ['p1','p2']){const p=state.paddles[side];p.cooldown=Math.max(0,p.cooldown-dt);p.abilityTime=Math.max(0,p.abilityTime-dt);if(p.abilityTime<=0)p.abilityEffect='';p.slow=Math.max(0,p.slow-dt);p.invert=Math.max(0,p.invert-dt);p.shield=Math.max(0,p.shield-dt);p.grow=Math.max(0,p.grow-dt);p.shrink=Math.max(0,p.shrink-dt);if(p.grow>0)p.h=p.baseH*1.65;else if(p.shrink>0)p.h=p.baseH*.62;else p.h=p.baseH;}
 if(state.serveTimer>0){state.serveTimer=Math.max(0,state.serveTimer-dt);return;}
 capBallSpeed(b);const prevX=b.x,prevY=b.y;b.trail.push({x:b.x,y:b.y});if(b.trail.length>3)b.trail.shift();
 if(b.effectTime>0)b.effectTime=Math.max(0,b.effectTime-dt);else b.specialEffect='';
 b.x+=b.vx*dt*60;b.y+=b.vy*dt*60;
 if(b.y-b.r<0){b.y=b.r;b.vy=Math.abs(b.vy);playTone(250,.025,'sine',.015);}if(b.y+b.r>SETTINGS.height){b.y=SETTINGS.height-b.r;b.vy=-Math.abs(b.vy);playTone(250,.025,'sine',.015);}
 if(state.worldEffects?.crosswind>0)b.vy+=Math.sin((performance.now?.()||0)/310)*dt*2.8;
 if(state.worldEffects?.gravity>0)b.vy+=dt*2.1;
 if(state.worldEffects?.curve>0)b.vy+=Math.sin((performance.now?.()||0)/105)*dt*3.4;
 if(state.worldEffects?.storm>0)b.vy+=Math.sin((performance.now?.()||0)/170)*dt*2.1;
 // El modificador de velocidad se aplica al recoger el objeto y se conserva en los golpes.
 // No forzar la pelota a una velocidad fija cada fotograma: eso anulaba la aceleración del rally.
 capBallSpeed(b);

 // Generación de objetos; las barricadas solo se activan al recoger su power-up.
 if(state.itemsEnabled){
  state.powerupSpawnTimer=(state.powerupSpawnTimer??1)-dt;
  if(state.powerupSpawnTimer<=0&&state.items.length<5){
   const available=POWERUPS.filter(x=>x.id!=='aegis'||state.paddles.p1.shield<=0||state.paddles.p2.shield<=0);
   const pick=available[Math.floor(Math.random()*available.length)];
   const zones=[{x:300,y:95},{x:500,y:130},{x:700,y:95},{x:330,y:500},{x:670,y:500},{x:500,y:470},{x:410,y:300},{x:590,y:300}];
   const free=zones.filter(z=>!state.items.some(it=>Math.hypot(it.x-z.x,it.y-z.y)<35));const spot=free.length?free[Math.floor(Math.random()*free.length)]:{x:300+Math.random()*400,y:85+Math.random()*430};
   state.items.push({x:spot.x,y:spot.y,r:13,life:12,type:pick.id});state.powerupSpawnTimer=2.1+Math.random()*1.0;
  }
 }
 for(let i=state.temporaryWalls.length-1;i>=0;i--){const wall=state.temporaryWalls[i];wall.life=(wall.life??1)-dt;if(wall.life<=0)state.temporaryWalls.splice(i,1);}
 const wallHit=collideWithTemporaryWalls(b,prevX,prevY);
 if(!wallHit){for(const side of ['p1','p2']){if(collideWithPaddle(b,prevX,prevY,state.paddles[side],side))break;}}

 if(b.x< -b.r||b.x>SETTINGS.width+b.r){
  const conceding=b.x<0?'p1':'p2',p=state.paddles[conceding];
  if(p.shield>0){p.shield=0;b.x=conceding==='p1'?p.x+p.w+b.r:p.x-b.r;b.vx=Math.abs(b.vx)*(conceding==='p1'?1:-1);burst(b.x,b.y,p.color,6,2.3);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'BLOQUEO DIVINO',color:p.color}}));playTone(180,.18,'sawtooth',.04);return;}
  const winner=conceding==='p1'?'p2':'p1',scorer=state.paddles[winner],doublePoint=scorer?.bonusPoint>0;state.scores[winner]+=doublePoint?2:1;
  // Juicio doble corresponde al próximo punto, no al próximo punto que eventualmente gane el usuario.
  for(const side of ['p1','p2'])if(state.paddles[side])state.paddles[side].bonusPoint=0;
  if(doublePoint)window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'JUICIO DOBLE · +2',color:scorer.color}}));
  burst(SETTINGS.width/2,SETTINGS.height/2,winner==='p1'?getColor('p1'):getColor('p2'),45,5);playTone(180,.25,'sawtooth',.04);window.dispatchEvent(new CustomEvent('point-scored',{detail:{winner}}));
  if(state.scores[winner]>=state.winScore){state.running=false;state.finished=true;state.lastWinner=winner;window.dispatchEvent(new CustomEvent('match-finished',{detail:{winner}}));}
  else serve(winner==='p1'?1:-1);
  return; // Evita recoger objetos o procesar eventos sobre la pelota reiniciada en el centro.
 }
 b.fire=0;b.color='#f6f4ed';b.glow=0;
 for(let i=state.items.length-1;i>=0;i--){const item=state.items[i];item.life-=dt;if(item.life<=0){state.items.splice(i,1);continue;}if(Math.hypot(b.x-item.x,b.y-item.y)<b.r+item.r){const ownerSide=b.lastHit==='p2'?'p2':'p1';applyPowerup(item.type,ownerSide);state.items.splice(i,1);}}
}

export function updatePaddles(dt){
 if(!state.running||state.paused||state.finished)return;const {p1,p2}=state.paddles;
 const move=(p,up,down,side)=>{
  const oldY=p.y;if(p.freeze>0){p.motion=0;return;}
  if(state.touchDrag[side]!==null){const target=state.touchDrag[side]-(p.h/2);p.y=clamp((p.invert>0?SETTINGS.height-state.touchDrag[side]-(p.h/2):target),0,SETTINGS.height-p.h);p.motion=dt>0?(p.y-oldY)/(dt*60):0;return;}
  let dir=(up?-1:0)+(down?1:0);if(p.invert>0)dir*=-1;
  p.y=clamp(p.y+dir*p.speed*(p.slow>0?.48:1)*getPaddleSpeedMultiplier(p)*dt*60,0,SETTINGS.height-p.h);
  p.motion=dt>0?(p.y-oldY)/(dt*60):0;
 };
 move(p1,state.keys.KeyW||state.touch.up1,state.keys.KeyS||state.touch.down1,'p1');
 if(state.mode==='local')move(p2,state.keys.ArrowUp||state.touch.up2,state.keys.ArrowDown||state.touch.down2,'p2');
 else{
  const oldY=p2.y;
  if(p2.freeze>0){p2.motion=0;return;}
  const target=state.ball.y-p2.h/2,diff=target-p2.y,max=({easy:3.6,normal:5.5,hard:7.5})[state.difficulty]||5.5,speed=Math.min(max,Math.abs(diff))*getPaddleSpeedMultiplier(p2);
  p2.y=clamp(p2.y+Math.sign(diff)*speed*dt*60,0,SETTINGS.height-p2.h);p2.motion=dt>0?(p2.y-oldY)/(dt*60):0;
 }
}
