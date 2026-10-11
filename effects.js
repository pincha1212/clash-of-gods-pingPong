import {state} from './state.js';
// Efectos acotados para mantener estable el coste de renderizado en móviles.
const MAX_PARTICLES=28;
export function burst(x,y,color,count=5,power=1.8){
 if(state.settings?.reducedMotion||state.settings?.quality==='low')return;
 const cap=state.settings?.quality==='high'?38:MAX_PARTICLES;
 const amount=Math.min(6,Math.max(0,count),cap-state.particles.length);
 for(let i=0;i<amount;i++){
  const a=Math.random()*Math.PI*2,s=(.45+Math.random()*.55)*Math.min(power,2.2);
  state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:10+Math.random()*7,max:17,size:1+Math.random(),color});
 }
}
export function updateEffects(dt){
 if(state.settings?.reducedMotion||state.settings?.quality==='low'){state.particles.length=0;return;}
 for(let i=state.particles.length-1;i>=0;i--){const p=state.particles[i];p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vx*=.97;p.vy*=.97;p.life-=dt*60;if(p.life<=0)state.particles.splice(i,1);}
}
export function drawEffects(ctx){
 for(const p of state.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}
 ctx.globalAlpha=1;
}
