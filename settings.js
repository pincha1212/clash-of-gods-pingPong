import {state} from './state.js';
export function setupSettings(){
 const mode=document.getElementById('mode-select'),diff=document.getElementById('difficulty-select');
 mode.addEventListener('change',()=>{state.mode=mode.value;window.dispatchEvent(new Event('settings-changed'));});diff.addEventListener('change',()=>state.difficulty=diff.value);
 const skillsConfig=document.getElementById('skills-enabled'),itemsConfig=document.getElementById('items-enabled'),arenaEventsConfig=document.getElementById('arena-events-enabled');
 const arenaEventsToggle=document.getElementById('settings-arena-events-enabled'),powerupsToggle=document.getElementById('settings-powerups-enabled'),skillsToggle=document.getElementById('settings-character-skills-enabled'),powerupsNote=document.getElementById('settings-powerups-note');
 const syncRuleControls=()=>{
  if(skillsConfig)skillsConfig.checked=Boolean(state.skillsEnabled);
  const restricted=state.mythicMode==='boss-jormungandr'&&state.mutationMode!=='mutation';
  const itemsEnabledForMode=restricted?false:Boolean(state.itemsEnabled);
  if(itemsConfig)itemsConfig.checked=itemsEnabledForMode;
  if(skillsToggle)skillsToggle.checked=Boolean(state.skillsEnabled);
  if(powerupsToggle)powerupsToggle.checked=itemsEnabledForMode;
  if(arenaEventsConfig)arenaEventsConfig.checked=state.settings?.arenaEvents!==false;
  if(arenaEventsToggle)arenaEventsToggle.checked=state.settings?.arenaEvents!==false;
  if(powerupsToggle)powerupsToggle.disabled=restricted;
  if(powerupsNote)powerupsNote.textContent=restricted?'Este desafío de jefe mantiene los Power-ups desactivados por diseño.':state.mutationMode==='mutation'?'Las vacunas de Mutación siguen apareciendo como recurso esencial; este control afecta a los Power-ups normales.':'Activa o desactiva la aparición de objetos durante el combate.';
 };
 const setArenaEventsEnabled=enabled=>{
  state.settings.arenaEvents=Boolean(enabled);
  if(!state.settings.arenaEvents){
   state.arenaEvent={enabled:false,elapsed:0,cooldown:0,warning:0,active:0,direction:1,cycle:0};
   if(state.arenaDirector){state.arenaDirector.enabled=false;state.arenaDirector.warning=null;state.arenaDirector.active=[];state.arenaDirector.phase='calma';}
   state.mythicSurgeTime=0;state.mythicRagnarokPulse=0;state.mythicThronePulse=0;state.mythicWatersPulse=0;
   if(state.typhon){state.typhon.warning=0;state.typhon.active=0;state.typhon.gust=0;}
   if(state.jormungandr){state.jormungandr.warning=0;state.jormungandr.active=0;state.jormungandr.recovery=0;state.jormungandr.inset=0;}
   if(state.mutation?.arenaEvent){state.mutation.arenaEvent.warning=0;state.mutation.arenaEvent.active=0;state.mutation.arenaEvent.cooldown=4.2;}
  }
  if(arenaEventsConfig)arenaEventsConfig.checked=state.settings.arenaEvents;
  if(arenaEventsToggle)arenaEventsToggle.checked=state.settings.arenaEvents;
  window.dispatchEvent(new Event('gameplay-rules-changed'));
 };
 skillsConfig?.addEventListener('change',e=>{state.skillsEnabled=e.target.checked;if(skillsToggle)skillsToggle.checked=state.skillsEnabled;window.dispatchEvent(new Event('gameplay-rules-changed'));});
 itemsConfig?.addEventListener('change',e=>{state.itemsEnabled=e.target.checked;if(powerupsToggle)powerupsToggle.checked=state.itemsEnabled;if(!state.itemsEnabled&&state.mutationMode!=='mutation')state.items=[];else if(state.itemsEnabled)state.powerupSpawnTimer=Math.min(state.powerupSpawnTimer??1,.65);window.dispatchEvent(new Event('gameplay-rules-changed'));});
 arenaEventsConfig?.addEventListener('change',e=>setArenaEventsEnabled(e.target.checked));
 arenaEventsToggle?.addEventListener('change',e=>setArenaEventsEnabled(e.target.checked));
 powerupsToggle?.addEventListener('change',e=>{if(powerupsToggle.disabled)return;state.itemsEnabled=e.target.checked;if(itemsConfig)itemsConfig.checked=state.itemsEnabled;if(!state.itemsEnabled&&state.mutationMode!=='mutation')state.items=[];else if(state.itemsEnabled)state.powerupSpawnTimer=Math.min(state.powerupSpawnTimer??1,.65);window.dispatchEvent(new Event('gameplay-rules-changed'));});
 skillsToggle?.addEventListener('change',e=>{state.skillsEnabled=e.target.checked;if(skillsConfig)skillsConfig.checked=state.skillsEnabled;window.dispatchEvent(new Event('gameplay-rules-changed'));});
 syncRuleControls();
 let score=7;const update=()=>document.getElementById('score-value').textContent=score;document.getElementById('score-minus').addEventListener('click',()=>{score=Math.max(3,score-1);state.winScore=score;update();});document.getElementById('score-plus').addEventListener('click',()=>{score=Math.min(15,score+1);state.winScore=score;update();});
 const quality=document.getElementById('video-quality'),motion=document.getElementById('reduced-motion'),volume=document.getElementById('sound-volume'),mute=document.getElementById('settings-sound-enabled'),touch=document.getElementById('touch-controls-enabled');
 quality.value=state.settings.quality;motion.checked=state.settings.reducedMotion;volume.value=String(state.settings.volume);mute.checked=state.settings.sound;touch.checked=state.settings.touchControls;
 quality.addEventListener('change',()=>{state.settings.quality=quality.value;document.body.dataset.quality=quality.value;window.dispatchEvent(new Event('settings-changed'));});
 motion.addEventListener('change',()=>{state.settings.reducedMotion=motion.checked;document.body.classList.toggle('reduced-effects',motion.checked);});
 volume.addEventListener('input',()=>{state.settings.volume=Number(volume.value);document.getElementById('volume-value').textContent=`${Math.round(state.settings.volume*100)}%`;});
 mute.addEventListener('change',()=>{state.settings.sound=mute.checked;state.soundEnabled=mute.checked;document.getElementById('sound-toggle').textContent=`SONIDO: ${state.soundEnabled?'ON':'OFF'}`;});
 touch.addEventListener('change',()=>{state.settings.touchControls=touch.checked;document.body.classList.toggle('touch-controls-disabled',!touch.checked);window.dispatchEvent(new Event('settings-changed'));});
 window.addEventListener('gameplay-rules-changed',syncRuleControls);
 const settingsButton=document.getElementById('settings-button');
 const settingsModal=document.getElementById('settings-modal');
 const settingsClose=document.getElementById('settings-close');
 let lastSettingsFocus=null;
 const open=()=>{
  syncRuleControls();
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
