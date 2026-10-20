import {state} from './state.js';

/** Cambia de pantalla sin dejar la interfaz en un estado sin destino válido. */
export function showScreen(name){
 const target=document.getElementById(`screen-${name}`);
 if(!target)return false;
 document.querySelectorAll('.screen').forEach(screen=>{
  const active=screen===target;
  screen.classList.toggle('active',active);
  screen.classList.toggle('hidden',!active);
  screen.setAttribute('aria-hidden',String(!active));
 });
 state.screen=name;
 document.body.classList.toggle('game-playing',name==='game');
 window.scrollTo({top:0,behavior:'smooth'});
 return true;
}
