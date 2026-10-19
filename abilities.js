import {state} from './state.js';
import {GODS, SETTINGS} from './config.js';
import {burst} from './effects.js';
import {playTone} from './audio.js';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const MIN_BALL_SPEED=4.5;
const MAX_BALL_SPEED=()=>Number.isFinite(SETTINGS.maxBallSpeed)?SETTINGS.maxBallSpeed:14;

function measuredBallSpeed(ball){
  const measured=Math.hypot(Number(ball?.vx)||0,Number(ball?.vy)||0);
  if(Number.isFinite(measured)&&measured>0.001)return measured;
  const fallback=Number(ball?.speed);
  return Number.isFinite(fallback)&&fallback>0?fallback:(SETTINGS.ballSpeed||7.2);
}

// Actualiza vx, vy y speed a la vez: la velocidad almacenada nunca se queda
// desincronizada de la magnitud del vector después de una habilidad.
function setBallSpeed(ball,targetSpeed){
  const vx=Number(ball.vx)||0,vy=Number(ball.vy)||0;
  const actual=Math.hypot(vx,vy);
  const angle=actual>0.001?Math.atan2(vy,vx):(ball.lastHit==='p2'?Math.PI:0);
  const speed=clamp(Number(targetSpeed)||MIN_BALL_SPEED,MIN_BALL_SPEED,MAX_BALL_SPEED());
  ball.vx=Math.cos(angle)*speed;
  ball.vy=Math.sin(angle)*speed;
  ball.speed=speed;
  return speed;
}

function scaleBallSpeed(ball,multiplier,minSpeed=MIN_BALL_SPEED){
  const current=measuredBallSpeed(ball);
  const next=clamp(current*multiplier,minSpeed,MAX_BALL_SPEED());
  return setBallSpeed(ball,next);
}

// Las habilidades de trayectoria apuntan hacia el centro de la cancha, pero
// conservan la rapidez del balón. No suman velocidad vertical accidentalmente.
function curveBallTowardCenter(ball,strength=2.5){
  const speed=clamp(measuredBallSpeed(ball),MIN_BALL_SPEED,MAX_BALL_SPEED());
  const midpoint=SETTINGS.height/2;
  const verticalSign=Math.abs(ball.y-midpoint)<8
    ? Math.sign(Number(ball.vy)|| (ball.lastHit==='p1'?1:-1))
    : (ball.y<midpoint?1:-1);
  const verticalMagnitude=Math.min(speed*.68,Math.max(2.8,Math.abs(Number(ball.vy)||0)*.55+strength));
  const horizontalMagnitude=Math.sqrt(Math.max(1,speed*speed-verticalMagnitude*verticalMagnitude));
  const horizontalSign=Math.sign(Number(ball.vx)||0)||(ball.lastHit==='p2'?-1:1);
  ball.vx=horizontalSign*horizontalMagnitude;
  ball.vy=verticalSign*verticalMagnitude;
  ball.speed=Math.hypot(ball.vx,ball.vy);
}

function markBall(ball,god,duration=.8){
  ball.specialEffect=god.id;
  ball.effectTime=duration;
}

function setShield(p,duration){
  p.shield=Math.max(Number(p.shield)||0,duration);
  // No se pisa un escudo especial más fuerte obtenido de un potenciador.
  if(p.shieldMode!=='secondchance'&&p.shieldMode!=='mutation')p.shieldMode='ability';
}

function armCounter(p,power=1.5,aimBonus=0){
  p.counter=Math.max(Number(p.counter)||0,power);
  if(aimBonus)p.aimBonus=Math.max(Number(p.aimBonus)||0,aimBonus);
}

function growPaddle(p,duration,scale=1.55){
  const oldHeight=p.h;
  p.grow=Math.max(Number(p.grow)||0,duration);
  p.skillGrowScale=scale;
  p.h=p.baseH*scale;
  p.y=clamp(p.y-(p.h-oldHeight)/2,0,SETTINGS.height-p.h);
}

function shrinkPaddle(p,duration,scale=.7){
  const oldHeight=p.h;
  p.shrink=Math.max(Number(p.shrink)||0,duration);
  p.skillShrinkScale=scale;
  p.h=p.baseH*scale;
  p.y=clamp(p.y+(oldHeight-p.h)/2,0,SETTINGS.height-p.h);
}

function dashToBall(p,ball){
  p.y=clamp(ball.y-p.h/2,0,SETTINGS.height-p.h);
}

const OFFENSIVE_DIRECT=new Set([
  'raijin','kagutsuchi','inari','hades','zeus','quetzalcoatl','poseidon','loki','thor',
  'medusa','kali','ra','shiva','artemis','hel','ares','seth','vritra'
]);
const DEFENSIVE_DIRECT=new Set([
  'fujin','susanoo','amaterasu','athena','anubis','gaia','thoth','apollo','isis',
  'hermes','freyja','odin','tsukuyomi','horus','indra','persephone'
]);
const OFFENSIVE_POWERS=new Set(['speed','speedshrink','slowcurve','curve','speedcurve','nezha','invert','slowr','curveslowr','speedcounter']);
const DEDICATED_ABILITY_IDS=new Set(['raijin','fujin','kagutsuchi','susanoo','amaterasu','inari','hades','athena','zeus','anubis','thor','medusa','gaia','thoth','kali','apollo','isis','ares','artemis','hermes','freyja','hel','ra','shiva','tsukuyomi','horus','seth','indra','persephone','poseidon','loki','odin','quetzalcoatl']);
const GENERIC_ABILITY_POWERS=new Set(['speed','slow','slowr','curve','slowcurve','speedcurve','nezha','dash','dashcurve','shielddash','grow','growshield','growcounter','shield','shieldslow','countershield','counter','slowcounter','speedcounter','dashcounter','speedshrink','invert','curveslowr']);

/**
 * Devuelve si la CPU debería gastar su habilidad en el estado de pelota actual.
 * Ya no depende de una tirada aleatoria por fotograma: cada personaje espera una
 * ventana útil, lo que hace observables también las habilidades de control.
 */
export function getAbilityAIProfile(god){
  if(!god)return 'none';
  if(OFFENSIVE_DIRECT.has(god.id))return 'attack';
  if(DEFENSIVE_DIRECT.has(god.id))return 'defense';
  const power=god.heroPower||god.abilityPower||'';
  return OFFENSIVE_POWERS.has(power)?'attack':'defense';
}

export function shouldCPUUseAbility(){
  const p=state.paddles?.p2;
  const god=GODS[state.selected?.p2];
  const ball=state.ball;
  if(!state.running||state.paused||state.finished||!state.skillsEnabled||state.mode!=='cpu')return false;
  if(!p||!god||!ball||p.cooldown>0||p.abilityTime>0||(state.serveTimer||0)>0)return false;
  const profile=getAbilityAIProfile(god);
  if(profile==='attack'&&ball.vx<-.35&&ball.x>360)return true;
  if(profile==='defense'&&ball.vx>.35&&ball.x>650&&ball.x<SETTINGS.width+ball.r)return true;
  return false;
}

export function activateAbility(side){
  if(!['p1','p2'].includes(side)||!state.running||state.paused||state.finished||!state.skillsEnabled)return false;
  if((state.serveTimer||0)>0)return false; // evita gastar la recarga durante el saque.
  const p=state.paddles?.[side];
  const r=state.paddles?.[side==='p1'?'p2':'p1'];
  const god=GODS[state.selected?.[side]];
  const ball=state.ball;
  if(!p||!r||!god||!ball||p.cooldown>0||p.abilityTime>0)return false;
  // Una ficha nueva no debe gastar enfriamiento si nadie implementó su efecto.
  const archetypePower=god.heroPower||god.abilityPower||'counter';
  const hasGenericImplementation=['hero','titan','monster'].includes(god.kind)&&GENERIC_ABILITY_POWERS.has(archetypePower);
  if(!DEDICATED_ABILITY_IDS.has(god.id)&&!hasGenericImplementation)return false;

  const effectiveness=1;
  p.cooldown=god.skill.cooldown*(effectiveness>1?.85:effectiveness<1?1.15:1);
  p.abilityTime=1.05;
  p.abilityEffect=god.id;
  burst(p.x+p.w/2,p.y+p.h/2,god.color,5,1.8);
  playTone(330+Math.random()*180,.12,'triangle',.05);

  switch(god.id){
    case 'raijin': r.slow=Math.max(r.slow||0,1.7*effectiveness);break;
    case 'fujin': dashToBall(p,ball);break;
    case 'kagutsuchi': scaleBallSpeed(ball,1.32);markBall(ball,god,1.1);break;
    case 'susanoo': setShield(p,2.0);burst(p.x+p.w/2,p.y+p.h/2,god.color,5,1.8);break;
    case 'amaterasu': growPaddle(p,2*effectiveness,1.65);break;
    case 'inari': r.invert=Math.max(r.invert||0,1.5*effectiveness);burst(r.x+r.w/2,r.y+r.h/2,god.color,5,1.8);break;
    case 'hades': shrinkPaddle(r,2*effectiveness,.62);burst(r.x+r.w/2,r.y+r.h/2,god.color,5,1.8);break;
    case 'athena': armCounter(p,2*effectiveness);break;
    case 'zeus': r.slow=Math.max(r.slow||0,1.15*effectiveness);scaleBallSpeed(ball,1.2);markBall(ball,god,1.05);burst(r.x+r.w/2,r.y+r.h/2,god.color,5,2);break;
    case 'anubis': {
      const danger=side==='p1'?ball.x<245&&ball.vx<0:ball.x>755&&ball.vx>0;
      if(danger){
        ball.x=side==='p1'?Math.max(90,p.x+p.w+Math.max(28,ball.r+10)):Math.min(910,p.x-Math.max(28,ball.r+10));
        ball.y=clamp(ball.y,45,SETTINGS.height-45);
        const speed=clamp(Math.max(SETTINGS.ballSpeed,measuredBallSpeed(ball)),MIN_BALL_SPEED,MAX_BALL_SPEED());
        const angle=(Math.random()-.5)*.64;
        ball.vx=(side==='p1'?1:-1)*Math.cos(angle)*speed;
        ball.vy=Math.sin(angle)*speed;
        ball.speed=speed;
        markBall(ball,god,.8);
        burst(ball.x,ball.y,god.color,5,2);
        window.dispatchEvent(new CustomEvent('god-message',{detail:{text:'JUICIO DE LA DUAT · RESCATE',color:god.color}}));
      }else setShield(p,1.9*effectiveness);
      break;
    }
    case 'thor': scaleBallSpeed(ball,1.23);markBall(ball,god,.8);burst(ball.x,ball.y,god.color,6,2.2);break;
    case 'medusa': r.invert=Math.max(r.invert||0,1.15*effectiveness);r.slow=Math.max(r.slow||0,.65*effectiveness);markBall(ball,god,.75);burst(r.x+r.w/2,r.y+r.h/2,god.color,5,1.8);break;
    case 'gaia': growPaddle(p,2*effectiveness,1.65);break;
    case 'thoth': scaleBallSpeed(ball,.78);markBall(ball,god,.8);break;
    case 'kali': shrinkPaddle(r,1.7*effectiveness,.62);scaleBallSpeed(ball,1.12);markBall(ball,god,.8);break;
    case 'apollo': armCounter(p,1.5*effectiveness);break;
    case 'isis': setShield(p,2*effectiveness);break;
    case 'ares': scaleBallSpeed(ball,1.3);armCounter(p,1.2);markBall(ball,god,.8);break;
    case 'artemis': curveBallTowardCenter(ball,3.5);markBall(ball,god,.8);break;
    case 'hermes': dashToBall(p,ball);break;
    case 'freyja': growPaddle(p,1.8,1.5);scaleBallSpeed(ball,.84,4.8);break;
    case 'hel': r.slow=Math.max(r.slow||0,1.8);break;
    case 'ra': scaleBallSpeed(ball,1.25);markBall(ball,god,.85);break;
    case 'shiva': curveBallTowardCenter(ball,3.1);shrinkPaddle(r,1.5*effectiveness,.72);markBall(ball,god,.8);break;
    case 'tsukuyomi': scaleBallSpeed(ball,.72);markBall(ball,god,.8);break;
    case 'horus': armCounter(p,2*effectiveness,.22);break;
    case 'seth': r.slow=Math.max(r.slow||0,1.8*effectiveness);curveBallTowardCenter(ball,4.25);markBall(ball,god,1.3);burst(ball.x,ball.y,god.color,12,2.8);burst(r.x+r.w/2,r.y+r.h/2,god.color,7,2.1);break;
    case 'indra': armCounter(p,2*effectiveness);markBall(ball,god,.65);break;
    case 'persephone': growPaddle(p,1.8,1.45);setShield(p,1.8);break;
    case 'poseidon': curveBallTowardCenter(ball,3.2);r.slow=Math.max(r.slow||0,.65*effectiveness);markBall(ball,god,.9);burst(ball.x,ball.y,god.color,5,2);break;
    case 'loki': r.invert=Math.max(r.invert||0,1.7*effectiveness);markBall(ball,god,.8);burst(r.x+r.w/2,r.y+r.h/2,god.color,5,2);break;
    case 'odin': scaleBallSpeed(ball,.8,4.8);markBall(ball,god,.7);break;
    case 'quetzalcoatl': curveBallTowardCenter(ball,2.9);markBall(ball,god,.7);break;
  }

  if((god.kind==='hero'||god.kind==='titan'||god.kind==='monster')&&!DEDICATED_ABILITY_IDS.has(god.id)){
    const heroPower=god.heroPower||god.abilityPower||'counter';
    switch(heroPower){
      case 'speed': scaleBallSpeed(ball,1.25);markBall(ball,god,.75);break;
      case 'slowcounter': scaleBallSpeed(ball,.78);armCounter(p,1.4);markBall(ball,god,.75);break;
      case 'speedshrink': scaleBallSpeed(ball,1.18);shrinkPaddle(r,1.5,.7);markBall(ball,god,.75);break;
      case 'slowcurve': scaleBallSpeed(ball,.8);curveBallTowardCenter(ball,2.2);markBall(ball,god,.75);break;
      case 'grow': growPaddle(p,1.8,1.55);break;
      case 'growshield': growPaddle(p,1.8,1.55);setShield(p,1.7);break;
      case 'growcounter': growPaddle(p,1.8,1.55);armCounter(p,1.3);break;
      case 'curve': curveBallTowardCenter(ball,2.6);markBall(ball,god,.75);break;
      case 'dashcurve': dashToBall(p,ball);curveBallTowardCenter(ball,2.6);markBall(ball,god,.75);break;
      case 'speedcurve': case 'nezha': scaleBallSpeed(ball,1.12);curveBallTowardCenter(ball,2.6);markBall(ball,god,.75);break;
      case 'dash': dashToBall(p,ball);break;
      case 'shielddash': dashToBall(p,ball);setShield(p,1.7);break;
      case 'shield': setShield(p,1.8);break;
      case 'countershield': setShield(p,1.8);armCounter(p,1.2);break;
      case 'shieldslow': setShield(p,1.8);scaleBallSpeed(ball,.88);markBall(ball,god,.75);break;
      case 'slow': scaleBallSpeed(ball,.78);markBall(ball,god,.75);break;
      case 'slowr': scaleBallSpeed(ball,.78);r.slow=Math.max(r.slow||0,1.1);markBall(ball,god,.75);break;
      case 'counter': armCounter(p,1.5);break;
      case 'speedcounter': armCounter(p,1.5);scaleBallSpeed(ball,1.08);break;
      case 'dashcounter': dashToBall(p,ball);armCounter(p,1.5);break;
      case 'invert': r.invert=Math.max(r.invert||0,1.35);markBall(ball,god,.7);break;
      case 'curveslowr': curveBallTowardCenter(ball,2.8);r.slow=Math.max(r.slow||0,1.1);markBall(ball,god,.8);break;
      default: armCounter(p,1.2);break;
    }
    p.abilityEffect=god.id;
    burst(p.x+p.w/2,p.y+p.h/2,god.color,4,1.5);
  }

  window.dispatchEvent(new CustomEvent('god-message',{detail:{text:god.id==='seth'?'TORMENTA DEL DESIERTO · CURVA + LENTITUD':god.skill.name,color:god.color}}));
  return true;
}
