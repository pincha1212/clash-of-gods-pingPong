import {state} from './state.js';
import {activateAbility} from './abilities.js';

export function setupInput(){
  window.addEventListener('keydown',e=>{
    if(['ArrowUp','ArrowDown','Space','Enter'].includes(e.code))e.preventDefault();
    state.keys[e.code]=true;
    if(e.repeat)return;
    if(e.code==='Space')activateAbility('p1');
    if(e.code==='Enter'&&state.mode==='local')activateAbility('p2');
    if(e.code==='Escape'&&state.screen==='game')window.dispatchEvent(new CustomEvent('toggle-pause'));
  });
  window.addEventListener('keyup',e=>{state.keys[e.code]=false;});
  window.addEventListener('blur',clearInput);
  document.querySelectorAll('[data-touch]').forEach(btn=>{
    const key=btn.dataset.touch;
    const start=e=>{
      e.preventDefault();
      if(key==='skill1'){activateAbility('p1');return;}
      if(key==='skill2'){if(state.mode==='local')activateAbility('p2');return;}
      state.touch[key]=true;
    };
    const end=e=>{
      e.preventDefault();
      if(key!=='skill1'&&key!=='skill2')state.touch[key]=false;
    };
    btn.addEventListener('pointerdown',start);
    ['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,end));
    btn.addEventListener('contextmenu',e=>e.preventDefault());
  });
  setupCanvasTouch();
  updateTouchButtons();
  window.addEventListener('settings-changed',updateTouchButtons);
}

function setupCanvasTouch(){
  const canvas=document.getElementById('game-canvas');
  if(!canvas)return;
  const activePointers=new Map();
  const sideFor=e=>{const rect=canvas.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width;return x<0.5?'p1':'p2';};
  const setDrag=(side,e)=>{const rect=canvas.getBoundingClientRect();const y=(e.clientY-rect.top)/rect.height*canvas.height;state.touchDrag[side]=Math.max(0,Math.min(canvas.height,y));};
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(state.screen!=='game'||!state.running||state.paused||state.finished)return;const side=sideFor(e);if(side==='p2'&&state.mode!=='local')return;e.preventDefault();activePointers.set(e.pointerId,side);try{canvas.setPointerCapture(e.pointerId);}catch(_){}setDrag(side,e);});
  canvas.addEventListener('pointermove',e=>{const side=activePointers.get(e.pointerId);if(!side)return;e.preventDefault();setDrag(side,e);});
  const end=e=>{const side=activePointers.get(e.pointerId);if(side)state.touchDrag[side]=null;activePointers.delete(e.pointerId);};
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,end));
}

function updateTouchButtons(){
  document.querySelectorAll('[data-touch="up2"],[data-touch="down2"],[data-touch="skill2"]').forEach(btn=>{btn.hidden=state.mode!=='local';});
  const p2=document.querySelector('.touch-player-two');if(p2)p2.hidden=state.mode!=='local';
}
function clearInput(){
  state.keys={};
  state.touch={up1:false,down1:false,up2:false,down2:false};
  state.touchDrag={p1:null,p2:null};
}
