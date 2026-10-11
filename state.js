export const state = {
  screen:'menu', mode:'cpu', difficulty:'normal', winScore:7, skillsEnabled:true, itemsEnabled:true,
  selected:{p1:'raijin',p2:'fujin'}, scores:{p1:0,p2:0}, running:false, paused:false, finished:false,
  keys:{}, touch:{up1:false,down1:false,up2:false,down2:false}, touchDrag:{p1:null,p2:null}, lastFrame:0, raf:0,
  ball:null,paddles:{p1:null,p2:null}, particles:[], items:[], countdown:0, serveTimer:0, rally:0,
  soundEnabled:true, audioContext:null, lastWinner:null
};
export function createPaddle(side,god){return {side,x:side==='p1'?28:959,y:250,w:SETTINGS_PADDLE_WIDTH(),h:god.stats.size,baseH:god.stats.size,speed:god.stats.speed,color:god.color,slow:0,invert:0,shield:0,grow:0,shrink:0,counter:0,cooldown:0,abilityTime:0};}
function SETTINGS_PADDLE_WIDTH(){return 13;}
export function createBall(){return {x:500,y:300,r:9,vx:0,vy:0,speed:7.2,color:'#f6f4ed',glow:13,fire:0,trail:[],lastHit:'p1'};}
