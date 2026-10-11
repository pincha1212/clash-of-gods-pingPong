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
  updateTouchButtons();
  window.addEventListener('settings-changed',updateTouchButtons);
}

function updateTouchButtons(){
  document.querySelectorAll('[data-touch="up2"],[data-touch="down2"],[data-touch="skill2"]').forEach(btn=>{
    btn.hidden=state.mode!=='local';
  });
}
function clearInput(){
  state.keys={};
  state.touch={up1:false,down1:false,up2:false,down2:false};
}
