export const state = {
  screen:'menu', mode:'cpu', mythicMode:'classic', mythicSurgeTime:0, mythicSurgeCooldown:0, mythicRagnarokElapsed:0, mythicRagnarokStage:0, mythicRagnarokPulse:0, mythicRagnarokCooldown:4.5, mythicThroneElapsed:0, mythicThroneStage:0, mythicThronePulse:0, mythicThroneCooldown:5, rosterMode:'gods', difficulty:'normal', winScore:7, skillsEnabled:true, itemsEnabled:true, arenaId:'raijin', settings:{quality:'balanced',reducedMotion:false,volume:0.7,sound:true,touchControls:true},
  selected:{p1:'raijin',p2:'fujin'}, scores:{p1:0,p2:0}, running:false, paused:false, finished:false,
  keys:{}, touch:{up1:false,down1:false,up2:false,down2:false}, touchDrag:{p1:null,p2:null}, lastFrame:0, raf:0,
  ball:null,paddles:{p1:null,p2:null}, particles:[], items:[], temporaryWalls:[], powerupSpawnTimer:1.1, countdown:0, serveTimer:0, rally:0,
  soundEnabled:true, audioContext:null, lastWinner:null, worldEffects:{eclipse:0,quake:0,prism:0,crosswind:0,gravity:0,curve:0,storm:0}, ballPower:{type:'',time:0,baseSpeed:0}
};
export function createPaddle(side,god){return {side,godId:god.id,x:side==='p1'?28:959,y:250,w:SETTINGS_PADDLE_WIDTH(),h:god.stats.size,baseH:god.stats.size,speed:god.stats.speed,color:god.color,motion:0,slow:0,invert:0,shield:0,grow:0,shrink:0,freeze:0,palette:0,bonusPoint:0,counter:0,cooldown:0,abilityTime:0,abilityEffect:'',haste:0,aura:0};}
function SETTINGS_PADDLE_WIDTH(){return 13;}
export function createBall(){return {x:500,y:300,r:9,vx:0,vy:0,speed:7.2,color:'#f6f4ed',glow:13,fire:0,specialEffect:'',effectTime:0,trail:[],lastHit:'p1'};}
