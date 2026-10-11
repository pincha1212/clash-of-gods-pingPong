import {state} from './state.js';
export function showScreen(name){document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.classList.add('hidden');});const target=document.getElementById(`screen-${name}`);if(target){target.classList.remove('hidden');target.classList.add('active');state.screen=name;window.scrollTo({top:0,behavior:'smooth'});}}
