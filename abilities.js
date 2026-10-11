import {state} from './state.js';
import {GODS,SETTINGS} from './config.js';
import {burst} from './effects.js';
import {playTone} from './audio.js';
export function activateAbility(side){if(!state.running||state.paused||state.finished||!state.skillsEnabled)return;const p=state.paddles[side],r=state.paddles[side==='p1'?'p2':'p1'],god=GODS[state.selected[side]];if(!p||p.cooldown>0||p.abilityTime>0)return;const b=state.ball; p.cooldown=god.skill.cooldown;p.abilityTime=.45;burst(p.x+p.w/2,p.y+p.h/2,god.color,20,3);playTone(330+Math.random()*180,.12,'triangle',.05);
 switch(god.id){case'raijin':r.slow=1.7;burst(r.x+r.w/2,r.y+r.h/2,god.color,24,4);break;case'fujin':{const target=b.y-p.h/2;p.y=clamp(target,0,SETTINGS.height-p.h);p.y=clamp(p.y,0,SETTINGS.height-p.h);burst(p.x+p.w/2,p.y+p.h/2,god.color,28,4);break;}case'kagutsuchi':{const current=Math.hypot(b.vx,b.vy)||b.speed;const next=Math.min(SETTINGS.maxBallSpeed,current*1.32);const factor=next/current;b.vx*=factor;b.vy*=factor;b.speed=next;b.fire=2.3;b.color=god.color;b.glow=24;burst(b.x,b.y,god.color,24,4);break;}case'susanoo':p.shield=1;burst(p.x+p.w/2,p.y+p.h/2,god.color,26,3.5);break;case'amaterasu':p.grow=2;p.h=p.baseH*1.65;p.y=clamp(p.y-(p.h-p.baseH)/2,0,SETTINGS.height-p.h);burst(p.x+p.w/2,p.y+p.h/2,god.color,26,3);break;case'inari':r.invert=1.5;burst(r.x+r.w/2,r.y+r.h/2,god.color,25,3);break;}
 window.dispatchEvent(new CustomEvent('god-message',{detail:{text:god.skill.name,color:god.color}}));
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
