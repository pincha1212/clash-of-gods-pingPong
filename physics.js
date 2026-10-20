import {state,ensureBallCollection,resetBallCollection,removeBall} from './state.js';
import {SETTINGS} from './config.js';
import {burst} from './effects.js';
import {playTone} from './audio.js';
import {POWERUPS,choosePowerup,applyPowerup,updatePowerups,getBallSpeedMultiplier,getPaddleSpeedMultiplier,getBallPowerType,enforceBallTrajectory} from './powerups.js';
import {registerMutationGoal,reduceMutationCharge,updateMutationEffects,applyMutationArenaForce,applyMutationPaddleHit,getMutationMovementMultiplier,getMutationShieldScale,consumeMutationShield,resetMutationRally} from './mutation.js';
import {updateArenaEvents,getArenaForces,resetArenaEventState,clearArenaEventState} from './arena-events.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ballMagnitude=b=>Math.hypot(b.vx,b.vy)||1;
function deflectTitanic(b,wallDirection){const speed=ballMagnitude(b),angle=Math.atan2(b.vy,b.vx)+(b.vx>=0?1:-1)*wallDirection*.16;b.vx=Math.cos(angle)*speed;b.vy=Math.sin(angle)*speed;}
function capBallSpeed(b){const speed=ballMagnitude(b);if(speed>SETTINGS.maxBallSpeed){b.vx=b.vx/speed*SETTINGS.maxBallSpeed;b.vy=b.vy/speed*SETTINGS.maxBallSpeed;}}
function getColor(side){return getComputedStyle(document.documentElement).getPropertyValue(side==='p1'?'--p1':'--p2').trim()||'#fff';}
let ballCollisionSoundCooldown=0;

// Colisión elástica entre pelotas: cada bola conserva su propio estado y efectos.
function resolveBallCollisions(dt){
 const balls=state.balls||[],frameScale=dt*60;
 ballCollisionSoundCooldown=Math.max(0,ballCollisionSoundCooldown-dt);
 for(let i=0;i<balls.length;i++){
  const a=balls[i];if(!a)continue;
  for(let j=i+1;j<balls.length;j++){
   const b=balls[j];if(!b)continue;
   const ax0=Number.isFinite(a.frameStartX)?a.frameStartX:a.x,ay0=Number.isFinite(a.frameStartY)?a.frameStartY:a.y;
   const bx0=Number.isFinite(b.frameStartX)?b.frameStartX:b.x,by0=Number.isFinite(b.frameStartY)?b.frameStartY:b.y;
   const amx=a.x-ax0,amy=a.y-ay0,bmx=b.x-bx0,bmy=b.y-by0;
   const rx0=bx0-ax0,ry0=by0-ay0,rvx=bmx-amx,rvy=bmy-amy,minDist=(a.r||9)+(b.r||9);
   const endDx=b.x-a.x,endDy=b.y-a.y,endDist=Math.hypot(endDx,endDy);let t=null;
   if(endDist<minDist)t=1;
   else{
    const qa=rvx*rvx+rvy*rvy,qb=2*(rx0*rvx+ry0*rvy),qc=rx0*rx0+ry0*ry0-minDist*minDist,disc=qb*qb-4*qa*qc;
    if(qc<=0)t=0;else if(qa>1e-8&&disc>=0){const hit=(-qb-Math.sqrt(disc))/(2*qa);if(hit>=0&&hit<=1)t=hit;}
   }
   if(t===null)continue;
   // Si se cruzaron entre fotogramas, retrocede al instante de contacto y avanza
   // el resto del fotograma con las nuevas velocidades.
   if(t<1){a.x=ax0+amx*t;a.y=ay0+amy*t;b.x=bx0+bmx*t;b.y=by0+bmy*t;}
   let dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);
   if(dist<1e-5){const angle=((i+1)*1.7+(j+1)*2.3);dx=Math.cos(angle);dy=Math.sin(angle);dist=1;}
   const nx=dx/dist,ny=dy/dist,mA=Math.max(1,(a.r||9)**2),mB=Math.max(1,(b.r||9)**2),mass=mA+mB;
   const overlap=Math.max(0,minDist-dist)+.15;
   a.x-=nx*overlap*(mB/mass);a.y-=ny*overlap*(mB/mass);b.x+=nx*overlap*(mA/mass);b.y+=ny*overlap*(mA/mass);
   const relX=b.vx-a.vx,relY=b.vy-a.vy,along=relX*nx+relY*ny,impact=along<-.2;
   if(impact){const impulse=-(1+.96)*along/(1/mA+1/mB);a.vx-=impulse*nx/mA;a.vy-=impulse*ny/mA;b.vx+=impulse*nx/mB;b.vy+=impulse*ny/mB;}
   if(t<1){const remain=frameScale*(1-t);a.x+=a.vx*remain;a.y+=a.vy*remain;b.x+=b.vx*remain;b.y+=b.vy*remain;}
   capBallSpeed(a);capBallSpeed(b);a.speed=ballMagnitude(a);b.speed=ballMagnitude(b);
   const bossArena=state.mythicMode==='boss-jormungandr',top=bossArena?24+Math.max(0,state.jormungandr?.inset||0):0,bottom=bossArena?SETTINGS.height-24-Math.max(0,state.jormungandr?.inset||0):SETTINGS.height;
   for(const ball of [a,b]){if(ball.y-ball.r<top){ball.y=top+ball.r;if(ball.vy<0)ball.vy=Math.abs(ball.vy);}if(ball.y+ball.r>bottom){ball.y=bottom-ball.r;if(ball.vy>0)ball.vy=-Math.abs(ball.vy);}}
   if(impact){const colorA=a.matchEffects?.color||a.color||'#8ee9ff',colorB=b.matchEffects?.color||b.color||'#ff9fe5';
    burst((a.x+b.x)/2,(a.y+b.y)/2,colorA,4,1.7);burst((a.x+b.x)/2,(a.y+b.y)/2,colorB,3,1.35);
    if(ballCollisionSoundCooldown<=0){playTone(285,.035,'triangle',.018);ballCollisionSoundCooldown=.09;}
   }
  }
 }
 return;
}

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
 const extension=Math.max(0,p.runeExtensions||0)>0?14:0;
 const plane=side==='p1'?p.x+p.w+extension+b.r:p.x-extension-b.r;
 let hitY=b.y,hitX=plane,hit=false,planeCrossed=false,impactPaddleY=p.y,segmentIndex=1;
 const isSolidAt=(y,top,height)=>{
  if(!(p.segmentedPaddle>0))return y>=top-b.r&&y<=top+height+b.r;
  const gap=5,segH=Math.max(1,(height-gap*2)/3);
  for(let i=0;i<3;i++){const sy=top+i*(segH+gap);if(y>=sy-b.r&&y<=sy+segH+b.r){segmentIndex=i;return true;}}
  return false;
 };
 if(Math.abs(dx)>1e-9){const t=(plane-prevX)/dx;if(t>=0&&t<=1&&((side==='p1'&&dx<0)||(side==='p2'&&dx>0))){planeCrossed=true;hitY=prevY+dy*t;const previousPaddleY=Number.isFinite(p.previousY)?p.previousY:p.y;impactPaddleY=previousPaddleY+(p.y-previousPaddleY)*t;hit=isSolidAt(hitY,impactPaddleY,p.h);}}
 if(!hit&&!planeCrossed){const overlapsX=b.x+b.r>=p.x-extension&&b.x-b.r<=p.x+p.w+extension;const overlapsY=b.y+b.r>=p.y&&b.y-b.r<=p.y+p.h;if(overlapsX&&overlapsY&&isSolidAt(b.y,p.y,p.h)){hit=true;hitY=b.y;hitX=side==='p1'?p.x+p.w+extension+b.r:p.x-extension-b.r;impactPaddleY=p.y;}}
 if(!hit)return false;
 b.x=hitX;b.y=hitY;
 const localHeight=p.segmentedPaddle>0?Math.max(1,(p.h-10)/3):p.h;
 const localCenter=p.segmentedPaddle>0?p.y+segmentIndex*(localHeight+5)+localHeight/2:p.y+p.h/2;
 const norm=clamp((hitY-localCenter)/(localHeight/2),-1,1),dir=side==='p1'?1:-1;
 // Conserva la escala de los modificadores de pelota y aumenta la intensidad
 // de forma gradual según la duración del intercambio, sin saltos bruscos.
 const baseSpeed=SETTINGS.ballSpeed*getBallSpeedMultiplier(b);
 const rallyFloor=baseSpeed*(1+Math.min(state.rally,16)*.018);
 let speed=Math.min(SETTINGS.maxBallSpeed,Math.max(rallyFloor,ballMagnitude(b)*1.012));
 if(p.counter>0){const charge=clamp(Number(p.counter)||1.5,1,2);const counterMultiplier=1.24+Math.max(0,charge-1.5)*.08-Math.max(0,1.5-charge)*.06;speed=Math.min(SETTINGS.maxBallSpeed,speed*counterMultiplier);p.counter=0;b.specialEffect=p.godId||'';b.effectTime=.55;burst(b.x,b.y,p.color,6,2.2);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'CONTRAATAQUE',color:p.color}}));}
 // El movimiento vertical de la paleta influye sutilmente en el ángulo:
 // permite apuntar con intención sin hacer que el control sea impredecible.
 const paddleMotion=clamp((p.motion||0)/Math.max(1,p.speed),-1,1);
 let angle=norm*1.08+paddleMotion*.20+(p.aimBonus>0?Math.sign(norm||1)*p.aimBonus:0);p.aimBonus=0;
 if(getBallPowerType(b)==='chaos')angle+=(Math.random()-.5)*.7;if(p.chaosCoil>0)angle+=(Math.random()-.5)*.88;if(p.segmentedPaddle>0)angle+=(segmentIndex-1)*.16;
 // Sinergias v0.2.66: combinaciones breves, legibles y con velocidad acotada.
 if(p.segmentedPaddle>0&&p.runeExtensions>0){angle+=(segmentIndex-1)*.055;speed=Math.min(SETTINGS.maxBallSpeed,speed*1.025);burst(b.x,b.y,p.color,3,1.35);}
 if(p.mutantPaddle>0&&p.chaosCoil>0)angle+=(Math.random()-.5)*.22;
 if(p.divineMotor>0&&p.segmentedPaddle>0)speed=Math.min(SETTINGS.maxBallSpeed,speed*1.018);
 if(getBallPowerType(b)==='ricochet')angle+=(Math.random()-.5)*1.0;
 if(state.worldEffects?.prism>0)angle+=Math.sin((performance.now?.()||0)/180)*.12;
 if(p.palette>0)angle+=Math.sin((performance.now?.()||0)/240)*.09;
 if(getBallPowerType(b)==='fireball')speed=Math.min(SETTINGS.maxBallSpeed,speed*1.045);
 angle=clamp(angle,-1.18,1.18);
 const perfect=Math.abs(norm)>=.22&&Math.abs(norm)<=.38;
 if(perfect){speed=Math.min(SETTINGS.maxBallSpeed,speed*1.07);burst(b.x,b.y,p.color,5,1.9);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'GOLPE PRECISO',color:p.color}}));}
 b.vx=dir*speed*Math.cos(angle);b.vy=speed*Math.sin(angle);b.speed=speed;b.lastHit=side;b.fire=0;b.color=b.matchEffects?.color||'#f6f4ed';state.rally++;
 if(p.aura>0){speed=Math.min(SETTINGS.maxBallSpeed,speed*1.22);const magnitude=ballMagnitude(b);b.vx=b.vx/magnitude*speed;b.vy=b.vy/magnitude*speed;p.aura=0;p.counter=0;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'AURA DE CONTRAATAQUE',color:p.color}}));}
 if(state.mutationMode==='mutation')applyMutationPaddleHit(side,b);
 burst(b.x,b.y,p.color,perfect?4:2,perfect?1.8:1.1);playTone(perfect?side==='p1'?560:680:side==='p1'?410:520,perfect?.075:.055,'triangle',perfect?.045:.035);return true;
}

export function serve(direction=Math.random()>.5?1:-1,servingBall=null){
 const b=servingBall||(Array.isArray(state.balls)&&state.balls.length?state.balls[0]:state.ball);
 const persistentEffects={sizeScale:b?.matchEffects?.sizeScale||1,trajectory:b?.matchEffects?.trajectory||'',color:b?.matchEffects?.color||'',orbitDirection:b?.matchEffects?.orbitDirection||0};
 const baseRadius=b?.baseR||9;
 resetBallCollection(b);state.temporaryWalls=[];b.x=SETTINGS.width/2;b.y=SETTINGS.height/2;b.speed=SETTINGS.ballSpeed;b.vx=direction*b.speed;b.vy=(Math.random()-.5)*b.speed*.65;b.glow=0;b.fire=0;b.specialEffect='';b.effectTime=0;b.trail=[];b.lastHit=direction>0?'p1':'p2';b.baseR=baseRadius;b.matchEffects=persistentEffects;b.r=baseRadius*persistentEffects.sizeScale;b.powerEffect=null;b.color=persistentEffects.color||'#f6f4ed';state.ballPower={type:'',time:0,baseSpeed:0,scale:1};state.serveTimer=.65;state.rally=0;if(state.mutationMode==='mutation')resetMutationRally();resetArenaEventState();
}

export function updatePhysics(dt){
 if(!state.running||state.paused||state.finished)return;
 dt=clamp(Number.isFinite(dt)?dt:0,0,.033);const balls=ensureBallCollection().slice();for(const b of balls){b.frameStartX=b.x;b.frameStartY=b.y;}if(state.serveTimer>0){state.ball=balls[0];updatePhysicsSingle(dt,true);return;}
 updatePowerups(dt);const primary=balls[0];if(state.mutationMode==='mutation')updateMutationEffects(dt,primary);updateArenaEvents(dt);
 for(let i=0;i<balls.length;i++){const b=balls[i];if(!state.balls.includes(b))continue;state.ball=b;updatePhysicsSingle(dt,b===primary);if(state.finished||state.serveTimer>0)break;}
 if(!state.finished&&state.serveTimer<=0&&state.balls.length>1)resolveBallCollisions(dt);
 state.ball=state.balls[0]||null;
}

function updatePhysicsSingle(dt,isPrimary){
 if(!state.running||state.paused||state.finished)return;
 dt=clamp(Number.isFinite(dt)?dt:0,0,.033);const b=state.ball;
 if(isPrimary){for(let i=state.items.length-1;i>=0;i--){state.items[i].life-=dt;if(state.items[i].life<=0)state.items.splice(i,1);}}
 if(isPrimary)for(const side of ['p1','p2']){const p=state.paddles[side];p.cooldown=Math.max(0,p.cooldown-dt);p.abilityTime=Math.max(0,p.abilityTime-dt);if(p.abilityTime<=0)p.abilityEffect='';p.slow=Math.max(0,p.slow-dt);p.invert=Math.max(0,p.invert-dt);p.shield=Math.max(0,p.shield-dt);p.grow=Math.max(0,p.grow-dt);p.shrink=Math.max(0,p.shrink-dt);p.powerGrow=Math.max(0,p.powerGrow||0);p.powerShrink=Math.max(0,p.powerShrink||0);const growScale=p.grow>0?(p.skillGrowScale||1.65):1,shrinkScale=p.shrink>0?(p.skillShrinkScale||.62):1,powerGrowScale=p.powerGrow>0?1.65:1,powerShrinkScale=p.powerShrink>0?.62:1;const activeGrow=Math.max(growScale,powerGrowScale);const activeShrink=Math.min(shrinkScale,powerShrinkScale);const mutationScale=state.mutationMode==='mutation'?getMutationShieldScale(side):1;const mutantScale=p.mutantPaddle>0?1+.28*Math.sin((p.mutantPaddleTime||0)*9):1;const spectralScale=p.spectralPhase>0?(p.spectralPhaseOffset===1?.72:1.22):1;p.h=clamp(p.baseH*(p.matchSizeScale||1)*(activeGrow>1?activeGrow:activeShrink<1?activeShrink:1)*mutationScale*mutantScale*spectralScale,32,220);p.y=clamp(p.y,0,SETTINGS.height-p.h);if(p.shield<=0)p.shieldMode='';}
 if(state.serveTimer>0){state.serveTimer=Math.max(0,state.serveTimer-dt);return;}
 if(isPrimary){
 if(state.mythicMode==='olympus'){state.mythicSurgeCooldown=Math.max(0,(state.mythicSurgeCooldown||0)-dt);state.mythicSurgeTime=Math.max(0,(state.mythicSurgeTime||0)-dt);if(state.mythicSurgeCooldown<=0&&state.mythicSurgeTime<=0){state.mythicSurgeTime=1.35;state.mythicSurgeCooldown=8.25;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'RÁFAGA DEL OLIMPO',color:'#ffe17a'}}));}}
 if(state.mythicMode==='ragnarok'){state.mythicRagnarokElapsed=(state.mythicRagnarokElapsed||0)+dt;const stage=Math.min(3,Math.floor(state.mythicRagnarokElapsed/15));if(stage>(state.mythicRagnarokStage||0)){state.mythicRagnarokStage=stage;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:['EL VIENTO DEL NORTE DESPIERTA','LAS RAÍCES DE MIDGARD SE QUIEBRAN','EL CIELO DEL RAGNARÖK SE ABRE','EL FIN DE LOS DIOSES SE ACERCA'][stage],color:'#a9d6df'}}));}state.mythicRagnarokPulse=Math.max(0,(state.mythicRagnarokPulse||0)-dt);state.mythicRagnarokCooldown=Math.max(0,(state.mythicRagnarokCooldown||0)-dt);if(state.mythicRagnarokCooldown<=0&&state.mythicRagnarokPulse<=0){state.mythicRagnarokPulse=1.05;state.mythicRagnarokCooldown=Math.max(5.5,8.5-stage*.7);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'RÁFAGA DEL RAGNARÖK',color:'#a9d6df'}}));}}
 if(state.mythicMode==='throne'){state.mythicThroneElapsed=(state.mythicThroneElapsed||0)+dt;const stage=Math.min(3,Math.floor(state.mythicThroneElapsed/12));if(stage>(state.mythicThroneStage||0)){state.mythicThroneStage=stage;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:['EL CONSEJO DIVINO SE REÚNE','EL DESIERTO RECLAMA SU PRECIO','EL SOL ENTRA EN ECLIPSE','EL TRONO EXIGE UN HEREDERO'][stage],color:stage>=2?'#cf8064':'#e8c66f'}}));}state.mythicThronePulse=Math.max(0,(state.mythicThronePulse||0)-dt);state.mythicThroneCooldown=Math.max(0,(state.mythicThroneCooldown||0)-dt);if(state.mythicThroneCooldown<=0&&state.mythicThronePulse<=0){state.mythicThronePulse=.85;state.mythicThroneCooldown=9;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'ECLIPSE DEL JUICIO',color:'#cf8064'}}));}}
 if(state.mythicMode==='waters'){state.mythicWatersElapsed=(state.mythicWatersElapsed||0)+dt;const stage=Math.min(3,Math.floor(state.mythicWatersElapsed/14));if(stage>(state.mythicWatersStage||0)){state.mythicWatersStage=stage;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:['LA TIERRA SE RESQUEBRAJA','VRITRA RETIENE LAS AGUAS','EL VAJRA ROMPE LA OSCURIDAD','LAS AGUAS VUELVEN AL MUNDO'][stage],color:stage<2?'#c9a66a':'#83d8e8'}}));}state.mythicWatersPulse=Math.max(0,(state.mythicWatersPulse||0)-dt);state.mythicWatersCooldown=Math.max(0,(state.mythicWatersCooldown||0)-dt);if(state.mythicWatersCooldown<=0&&state.mythicWatersPulse<=0){state.mythicWatersPulse=.9;state.mythicWatersCooldown=Math.max(6.5,9-stage*.5);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:stage<2?'RÁFAGA SECA':'OLEADA DE INDRA',color:stage<2?'#c9a66a':'#83d8e8'}}));}}
 if(state.mythicMode==='boss-typhon'){const boss=state.typhon||(state.typhon={elapsed:0,stage:0,warning:0,active:0,cooldown:3.8,direction:1,gust:0});boss.elapsed+=dt;const stage=Math.min(3,Math.floor(boss.elapsed/16));if(stage>boss.stage){boss.stage=stage;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:['LOS CIELOS SE OSCURECEN','TIFÓN DESPIERTA LOS VIENTOS','LA TORMENTA GANA FUERZA','EL CAOS PRIMORDIAL SE DESATA'][stage],color:'#d9d9f0'}}));}boss.cooldown=Math.max(0,boss.cooldown-dt);const wasWarning=boss.warning>0;boss.warning=Math.max(0,boss.warning-dt);if(wasWarning&&boss.warning<=0){boss.active=2.35;boss.gust=0;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'¡EL VENDAVAL DE TIFÓN!',color:'#f1e4f2'}}));playTone(205,.11,'triangle',.03);}if(!wasWarning&&boss.warning<=0&&boss.active<=0&&boss.cooldown<=0){boss.warning=1.25;boss.direction*=-1;boss.gust=0;boss.cooldown=Math.max(6.2,8.6-stage*.65);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:boss.direction<0?'TIFÓN PREPARA UN VIENTO ASCENDENTE':'TIFÓN PREPARA UN VIENTO DESCENDENTE',color:'#e8c2c9'}}));}if(boss.active>0){boss.active=Math.max(0,boss.active-dt);boss.gust+=dt;}}
 if(state.mythicMode==='boss-jormungandr'){const boss=state.jormungandr||(state.jormungandr={elapsed:0,stage:0,warning:0,active:0,recovery:0,cooldown:4.5,inset:0,targetInset:42});boss.elapsed+=dt;const stage=Math.min(3,Math.floor(boss.elapsed/18));if(stage>boss.stage){boss.stage=stage;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:['MIDGARD TIEMBLA','JÖRMUNGANDR DESPIERTA','LA SERPIENTE CIERRA SU CÍRCULO','EL MUNDO QUEDA ATRAPADO'][stage],color:'#a9e4bd'}}));}boss.cooldown=Math.max(0,boss.cooldown-dt);const wasWarning=boss.warning>0;boss.warning=Math.max(0,boss.warning-dt);if(wasWarning&&boss.warning<=0){boss.active=2.65;boss.recovery=0;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'¡EL CERCO DE MIDGARD SE CIERRA!',color:'#d5ffdf'}}));playTone(170,.12,'triangle',.035);}if(boss.active>0){boss.active=Math.max(0,boss.active-dt);boss.inset=boss.targetInset;if(boss.active<=0){boss.recovery=1.0;}}else if(boss.recovery>0){boss.recovery=Math.max(0,boss.recovery-dt);boss.inset=boss.targetInset*(boss.recovery/1.0);}else{boss.inset=0;if(boss.cooldown<=0&&boss.warning<=0){boss.warning=1.15;boss.targetInset=42+stage*9;boss.cooldown=8.5-stage*.65;window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'JÖRMUNGANDR SE PREPARA PARA CERRAR EL CERCO',color:'#b8edcc'}}));}}}

 }
 // Las condiciones de cada modo avanzan una sola vez; la fuerza resultante se aplica a todas las pelotas.
 const modeNow=performance.now?.()||0;
 if(state.mythicMode==='olympus'&&state.mythicSurgeTime>0)b.vy+=Math.sin(modeNow/210)*dt*2.0;
 if(state.mythicMode==='ragnarok'&&state.mythicRagnarokPulse>0)b.vy+=Math.sin(modeNow/240)*dt*(1.15+Math.min(3,state.mythicRagnarokStage||0)*.28);
 if(state.mythicMode==='throne'&&state.mythicThronePulse>0)b.vy+=Math.sin(modeNow/285)*dt*.95;
 if(state.mythicMode==='waters'&&state.mythicWatersPulse>0)b.vy+=Math.sin(modeNow/260)*dt*(.8+Math.min(3,state.mythicWatersStage||0)*.18);
 if(state.mythicMode==='boss-typhon'&&(state.typhon?.active||0)>0){const boss=state.typhon,stage=boss.stage||0;b.vy+=(boss.direction||1)*(1.25+stage*.42)*dt+Math.sin(modeNow/115)*(.45+stage*.12)*dt;}
 capBallSpeed(b);const prevX=b.x,prevY=b.y;b.trail.push({x:b.x,y:b.y});if(b.trail.length>12)b.trail.shift();
 if(b.effectTime>0)b.effectTime=Math.max(0,b.effectTime-dt);else b.specialEffect='';
 b.x+=b.vx*dt*60;b.y+=b.vy*dt*60;
 const bossArena=state.mythicMode==='boss-jormungandr',arenaTop=bossArena?24:0,arenaBottom=bossArena?SETTINGS.height-24:SETTINGS.height,bossInset=bossArena?Math.max(0,state.jormungandr?.inset||0):0,topLimit=arenaTop+bossInset,bottomLimit=arenaBottom-bossInset;if(b.y-b.r<topLimit){b.y=topLimit+b.r;b.vy=Math.abs(b.vy);if(getBallPowerType(b)==='ricochet')deflectTitanic(b,1);playTone(250,.025,'sine',.015);}if(b.y+b.r>bottomLimit){b.y=bottomLimit-b.r;b.vy=-Math.abs(b.vy);if(getBallPowerType(b)==='ricochet')deflectTitanic(b,-1);playTone(250,.025,'sine',.015);}
 // Las fuerzas ambientales se suman en una sola autoridad y se limitan para que
 // acumular varios Power-ups no vuelva la pelota casi vertical de forma incontrolable.
 const now=performance.now?.()||0;let fieldForce=0;
 if(state.worldEffects?.eclipse>0)fieldForce+=Math.sin(now/360)*1.05;
 if(state.worldEffects?.crosswind>0)fieldForce+=Math.sin(now/310)*2.8;
 if(state.worldEffects?.gravity>0)fieldForce+=2.1;
 if(state.worldEffects?.curve>0)fieldForce+=Math.sin(now/105)*3.4;
 if(state.worldEffects?.storm>0)fieldForce+=Math.sin(now/170)*2.1;
 const arenaForce=getArenaForces();
 fieldForce+=arenaForce.y;
 b.vy+=clamp(fieldForce,-4.8,4.8)*dt;
 b.vx+=clamp(arenaForce.x,-1.25,1.25)*dt;
 // Cada Núcleo gravitatorio afecta a las otras pelotas cercanas, sin copiarles su poder.
 for(const source of state.balls||[]){if(source===b||source?.powerEffect?.type!=='magnetball'||(source.powerEffect.time||0)<=0)continue;const dx=source.x-b.x,dy=source.y-b.y,dist=Math.hypot(dx,dy);if(dist<18||dist>235)continue;const falloff=1-dist/235,force=17*falloff*falloff;b.vx+=dx/dist*force*dt;b.vy+=dy/dist*force*dt;}
 if(state.mutationMode==='mutation')applyMutationArenaForce(b,dt);
 if(isPrimary&&state.worldEffects?.quake>0){state.worldEffects.quakePulse=Math.max(0,(state.worldEffects.quakePulse||0)-dt);if(state.worldEffects.quakePulse<=0){b.vy+=((Math.random()-.5)*1.7);state.worldEffects.quakePulse=.55;}}
 enforceBallTrajectory(b);
 // El modificador de velocidad se aplica al recoger el objeto y se conserva en los golpes.
 // No forzar la pelota a una velocidad fija cada fotograma: eso anulaba la aceleración del rally.
 capBallSpeed(b);

 // Mutación reemplaza los potenciadores comunes por vacunas. Los modos normales conservan el catálogo actual.
 if(isPrimary&&state.itemsEnabled&&(state.mythicMode!=='boss-jormungandr'||state.mutationMode==='mutation')){
  state.powerupSpawnTimer=(state.powerupSpawnTimer??1)-dt;
  if(state.mutationMode==='mutation'){
   if(state.powerupSpawnTimer<=0&&!state.items.some(item=>item.type==='mutation-vaccine')){
    const zones=[{x:300,y:95},{x:500,y:130},{x:700,y:95},{x:330,y:500},{x:670,y:500},{x:500,y:470},{x:410,y:300},{x:590,y:300}];
    const free=zones.filter(z=>!state.items.some(it=>Math.hypot(it.x-z.x,it.y-z.y)<45));
    const spot=free.length?free[Math.floor(Math.random()*free.length)]:{x:300+Math.random()*400,y:85+Math.random()*430};
    state.items.push({x:spot.x,y:spot.y,r:14,life:11,type:'mutation-vaccine'});
    // La curación sigue siendo completa, pero la cancha dificulta conseguir vacunas al pudrirse.
    const rot=Math.max(0,Math.min(100,state.mutation?.rot||0));
    state.powerupSpawnTimer=9+Math.random()*3+rot*.07;
   }
  }else if(state.powerupSpawnTimer<=0&&state.items.length<5){
   const available=POWERUPS.filter(x=>x.id!=='aegis'||state.paddles.p1.shield<=0||state.paddles.p2.shield<=0);
   const pick=choosePowerup(available);
   const zones=[{x:300,y:95},{x:500,y:130},{x:700,y:95},{x:330,y:500},{x:670,y:500},{x:500,y:470},{x:410,y:300},{x:590,y:300}];
   const free=zones.filter(z=>!state.items.some(it=>Math.hypot(it.x-z.x,it.y-z.y)<35));const spot=free.length?free[Math.floor(Math.random()*free.length)]:{x:300+Math.random()*400,y:85+Math.random()*430};
   state.items.push({x:spot.x,y:spot.y,r:13,life:12,type:pick.id});state.powerupSpawnTimer=2.1+Math.random()*1.0;
  }
 }
 if(isPrimary)for(let i=state.temporaryWalls.length-1;i>=0;i--){const wall=state.temporaryWalls[i];wall.life=(wall.life??1)-dt;if(wall.life<=0)state.temporaryWalls.splice(i,1);}
 const wallHit=collideWithTemporaryWalls(b,prevX,prevY);
 if(!wallHit){for(const side of ['p1','p2']){if(collideWithPaddle(b,prevX,prevY,state.paddles[side],side)){break;}}}

 if(b.x< -b.r||b.x>SETTINGS.width+b.r){
  const conceding=b.x<0?'p1':'p2',p=state.paddles[conceding];
  if(p.shield>0){const shieldMode=p.shieldMode||'aegis';p.shield=0;p.shieldMode='';b.x=conceding==='p1'?p.x+p.w+b.r:p.x-b.r;b.vx=Math.abs(b.vx)*(conceding==='p1'?1:-1);if(shieldMode==='secondchance'){const speed=Math.min(SETTINGS.maxBallSpeed,ballMagnitude(b)*1.12),angle=Math.atan2(b.vy,b.vx)+(Math.random()-.5)*.22;b.vx=Math.cos(angle)*speed;b.vy=Math.sin(angle)*speed;b.speed=speed;}if(shieldMode==='mutation')consumeMutationShield(conceding);burst(b.x,b.y,p.color,6,2.3);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:shieldMode==='secondchance'?'SEGUNDA OPORTUNIDAD · CONTRAATAQUE':shieldMode==='mutation'?'ESCUDO DEL ABISMO · GOL EVITADO':'BLOQUEO DIVINO',color:shieldMode==='mutation'?'#9eff70':p.color}}));playTone(180,.18,'sawtooth',.04);return;}
  const winner=conceding==='p1'?'p2':'p1',scorer=state.paddles[winner];
  if(state.mutationMode==='mutation'){
   const result=registerMutationGoal(conceding,{ballId:b.id});
   for(const side of ['p1','p2'])if(state.paddles[side])state.paddles[side].bonusPoint=0;
   burst(SETTINGS.width/2,SETTINGS.height/2,winner==='p1'?getColor('p1'):getColor('p2'),32,4.3);
   playTone(180,.25,'sawtooth',.04);
   window.dispatchEvent(new CustomEvent('mutation-goal-confirmed',{detail:{winner,loser:conceding,gain:result.gain||0,charge:result.charge||0,streak:result.streak||0,defeated:Boolean(result.defeated),ballId:b.id}}));
   if(result.defeated){clearArenaEventState();state.running=false;state.finished=true;state.lastWinner=winner;window.dispatchEvent(new CustomEvent('match-finished',{detail:{winner,loser:conceding,reason:'corruption',charge:result.charge}}));}
   else{removeBall(b);if(state.balls.length===0)serve(winner==='p1'?1:-1,b);}
   return;
  }
  const doublePoint=scorer?.bonusPoint>0;state.scores[winner]+=doublePoint?2:1;
  for(const side of ['p1','p2'])if(state.paddles[side])state.paddles[side].bonusPoint=0;
  if(doublePoint)window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'JUICIO DOBLE · +2',color:scorer.color}}));
  burst(SETTINGS.width/2,SETTINGS.height/2,winner==='p1'?getColor('p1'):getColor('p2'),45,5);playTone(180,.25,'sawtooth',.04);window.dispatchEvent(new CustomEvent('point-scored',{detail:{winner,ballId:b.id,remainingBalls:Math.max(0,state.balls.length-1)}}));
  if(state.scores[winner]>=state.winScore){clearArenaEventState();state.running=false;state.finished=true;state.lastWinner=winner;window.dispatchEvent(new CustomEvent('match-finished',{detail:{winner}}));}
  else{removeBall(b);if(state.balls.length===0)serve(winner==='p1'?1:-1,b);}
  return; // La jugada continúa mientras quede al menos una pelota real en cancha.
 }
 b.fire=0;b.color=b.matchEffects?.color||b.color||'#f6f4ed';b.glow=0;
 if(state.mythicMode==='boss-jormungandr'&&state.mutationMode!=='mutation')state.items.length=0;
 for(let i=state.items.length-1;i>=0;i--){const item=state.items[i];if(item.life<=0){state.items.splice(i,1);continue;}if(Math.hypot(b.x-item.x,b.y-item.y)<b.r+item.r){const ownerSide=b.lastHit==='p2'?'p2':'p1';if(state.mutationMode==='mutation'){if(item.type==='mutation-vaccine'){const result=reduceMutationCharge(ownerSide);burst(item.x,item.y,'#a7ff7c',12,2.7);window.dispatchEvent(new CustomEvent('god-message',{detail:{text:result.reduction?`VACUNA · -${result.reduction}% CORRUPCIÓN`:'VACUNA · CORRUPCIÓN ESTABILIZADA',color:'#a7ff7c'}}));}}else applyPowerup(item.type,ownerSide,b);state.items.splice(i,1);}}
}

export function updatePaddles(dt){
 if(!state.running||state.paused||state.finished)return;const {p1,p2}=state.paddles;
 const move=(p,up,down,side)=>{
  const oldY=p.y;p.previousY=oldY;if(p.freeze>0){p.motion=0;return;}const bossMode=state.mythicMode==='boss-jormungandr',inset=bossMode?Math.max(0,state.jormungandr?.inset||0):0,topLimit=bossMode?24+inset:0,bottomLimit=bossMode?SETTINGS.height-24-inset-p.h:SETTINGS.height-p.h;
  if(state.touchDrag[side]!==null){const inverted=p.invert>0;if(inverted){const dragDelta=Number(state.touchDragDelta?.[side])||0;p.y=clamp(p.y-dragDelta,topLimit,bottomLimit);}else{const target=state.touchDrag[side]-(p.h/2);p.y=clamp(target,topLimit,bottomLimit);}if(state.touchDragDelta)state.touchDragDelta[side]=0;p.motion=dt>0?(p.y-oldY)/(dt*60):0;return;}
  let dir=(up?-1:0)+(down?1:0);if(p.invert>0)dir*=-1;
  const mutationMultiplier=state.mutationMode==='mutation'?getMutationMovementMultiplier(side):1;p.y=clamp(p.y+dir*p.speed*(p.slow>0?.48:1)*getPaddleSpeedMultiplier(p)*mutationMultiplier*dt*60,topLimit,bottomLimit);
  p.motion=dt>0?(p.y-oldY)/(dt*60):0;
 };
 move(p1,state.keys.KeyW||state.touch.up1,state.keys.KeyS||state.touch.down1,'p1');
 if(state.mode==='local')move(p2,state.keys.ArrowUp||state.touch.up2,state.keys.ArrowDown||state.touch.down2,'p2');
 else{
  const oldY=p2.y;p2.previousY=oldY;
  if(p2.freeze>0){p2.motion=0;return;}
  const target=state.ball.y-p2.h/2;let diff=target-p2.y;const inverted=p2.invert>0;if(inverted)diff*=-1;const max=({easy:3.6,normal:5.5,hard:7.5})[state.difficulty]||5.5,speed=Math.min(max,Math.abs(diff))*(inverted?.5:1)*(p2.slow>0?.48:1)*getPaddleSpeedMultiplier(p2)*(state.mutationMode==='mutation'?getMutationMovementMultiplier('p2'):1);
  const bossMode=state.mythicMode==='boss-jormungandr',inset=bossMode?Math.max(0,state.jormungandr?.inset||0):0,topLimit=bossMode?24+inset:0,bottomLimit=bossMode?SETTINGS.height-24-inset-p2.h:SETTINGS.height-p2.h;p2.y=clamp(p2.y+Math.sign(diff)*speed*dt*60,topLimit,bottomLimit);p2.motion=dt>0?(p2.y-oldY)/(dt*60):0;
 }
}
