import {state} from './state.js';
export function setupSettings(){
 const mode=document.getElementById('mode-select'),diff=document.getElementById('difficulty-select');
 mode.addEventListener('change',()=>{state.mode=mode.value;window.dispatchEvent(new Event('settings-changed'));});const rosterConfig=document.getElementById('roster-mode-config');if(rosterConfig){rosterConfig.value=state.rosterMode;rosterConfig.addEventListener('change',()=>{state.rosterMode=rosterConfig.value;document.getElementById('roster-mode-select').value=state.rosterMode;window.dispatchEvent(new CustomEvent('roster-mode-changed',{detail:{mode:state.rosterMode,returnToSelect:true}}));});}diff.addEventListener('change',()=>state.difficulty=diff.value);
 document.getElementById('skills-enabled').addEventListener('change',e=>state.skillsEnabled=e.target.checked);document.getElementById('items-enabled').addEventListener('change',e=>state.itemsEnabled=e.target.checked);
 let score=7;const update=()=>document.getElementById('score-value').textContent=score;document.getElementById('score-minus').addEventListener('click',()=>{score=Math.max(3,score-1);state.winScore=score;update();});document.getElementById('score-plus').addEventListener('click',()=>{score=Math.min(15,score+1);state.winScore=score;update();});
 const quality=document.getElementById('video-quality'),motion=document.getElementById('reduced-motion'),volume=document.getElementById('sound-volume'),mute=document.getElementById('settings-sound-enabled'),touch=document.getElementById('touch-controls-enabled');
 quality.value=state.settings.quality;motion.checked=state.settings.reducedMotion;volume.value=String(state.settings.volume);mute.checked=state.settings.sound;touch.checked=state.settings.touchControls;
 quality.addEventListener('change',()=>{state.settings.quality=quality.value;document.body.dataset.quality=quality.value;window.dispatchEvent(new Event('settings-changed'));});
 motion.addEventListener('change',()=>{state.settings.reducedMotion=motion.checked;document.body.classList.toggle('reduced-effects',motion.checked);});
 volume.addEventListener('input',()=>{state.settings.volume=Number(volume.value);document.getElementById('volume-value').textContent=`${Math.round(state.settings.volume*100)}%`;});
 mute.addEventListener('change',()=>{state.settings.sound=mute.checked;state.soundEnabled=mute.checked;document.getElementById('sound-toggle').textContent=`SONIDO: ${state.soundEnabled?'ON':'OFF'}`;});
 touch.addEventListener('change',()=>{state.settings.touchControls=touch.checked;document.body.classList.toggle('touch-controls-disabled',!touch.checked);window.dispatchEvent(new Event('settings-changed'));});
 const settingsButton=document.getElementById('settings-button');
 const settingsModal=document.getElementById('settings-modal');
 const settingsClose=document.getElementById('settings-close');
 let lastSettingsFocus=null;
 const open=()=>{
  lastSettingsFocus=document.activeElement;
  settingsModal.classList.remove('hidden');
  settingsModal.setAttribute('aria-hidden','false');
  settingsClose.focus();
 };
 const close=()=>{
  if(settingsModal.classList.contains('hidden'))return;
  settingsModal.classList.add('hidden');
  settingsModal.setAttribute('aria-hidden','true');
  if(lastSettingsFocus?.isConnected)lastSettingsFocus.focus();
  else settingsButton.focus();
  lastSettingsFocus=null;
 };
 settingsButton.addEventListener('click',open);
 settingsClose.addEventListener('click',close);
 settingsModal.addEventListener('click',e=>{if(e.target===settingsModal)close();});
 settingsModal.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
  if(e.key!=='Tab')return;
  const focusables=[...settingsModal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null);
  if(!focusables.length)return;
  const first=focusables[0],last=focusables[focusables.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 document.getElementById('fullscreen-button').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch(_){document.getElementById('fullscreen-note').textContent='El navegador no permite pantalla completa en este momento.';}});
}
