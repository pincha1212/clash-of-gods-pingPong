import {state} from './state.js';
// Efectos breves y acotados: prioriza la fluidez en móviles de gama baja.
export function burst(x,y,color,count=8,power=2){
 const amount=Math.min(10,Math.max(0,count));
 for(let i=0;i<amount;i++){
  const a=Math.random()*Math.PI*2,s=(.45+Math.random()*.65)*Math.min(power,2.6);
  state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:12+Math.random()*10,max:22,size:1+Math.random()*1.5,color});
 }
 if(state.particles.length>60)state.particles.splice(0,state.particles.length-60);
}
export function updateEffects(dt){
 for(let i=state.particles.length-1;i>=0;i--){const p=state.particles[i];p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vx*=.97;p.vy*=.97;p.life-=dt*60;if(p.life<=0)state.particles.splice(i,1);}
}
export function drawEffects(ctx){
 ctx.globalAlpha=1;
 for(const p of state.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}
 ctx.globalAlpha=1;
}
