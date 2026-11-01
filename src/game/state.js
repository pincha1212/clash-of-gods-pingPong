export const state = {
  screen:'menu', mode:'cpu', mutationMode:'off', mutationColors:{p1:'#45ff75',p2:'#42baff'}, mutationOptions:{powersEnabled:true,ballPowersEnabled:true,defensePowersEnabled:true,avatarEnabled:true,arenaEventsEnabled:true,passiveRotEnabled:true,vaccinesEnabled:true}, arenaEvent:{enabled:false,elapsed:0,cooldown:0,warning:0,active:0,direction:1,cycle:0}, mutation:{active:false,maxCharge:100,players:{p1:{charge:0,unlocked:{25:false,35:false,40:false,50:false,60:false,75:false,85:false,90:false},lastGain:0,lastSource:null,concededStreak:0,avatarUsed:false,powers:{}},p2:{charge:0,unlocked:{25:false,35:false,40:false,50:false,60:false,75:false,85:false,90:false},lastGain:0,lastSource:null,concededStreak:0,avatarUsed:false,powers:{}}},arenaEvent:{warning:0,active:0,cooldown:4.2,direction:1}}, mythicMode:'classic', mythicSurgeTime:0, mythicSurgeCooldown:0, mythicRagnarokElapsed:0, mythicRagnarokStage:0, mythicRagnarokPulse:0, mythicRagnarokCooldown:4.5, mythicThroneElapsed:0, mythicThroneStage:0, mythicThronePulse:0, mythicThroneCooldown:5, mythicWatersElapsed:0, mythicWatersStage:0, mythicWatersPulse:0, mythicWatersCooldown:4.5, jormungandr:{elapsed:0,stage:0,warning:0,active:0,recovery:0,cooldown:4.5,inset:0,targetInset:42}, typhon:{elapsed:0,stage:0,warning:0,active:0,cooldown:3.8,direction:1,gust:0}, itemsEnabledBeforeBoss:null, modeBeforeBoss:null, rosterMode:'gods', difficulty:'normal', winScore:7, skillsEnabled:true, itemsEnabled:true, arenaId:'arena_japanese', settings:{quality:'balanced',reducedMotion:false,volume:0.7,sound:true,touchControls:true,arenaEvents:true},
  selected:{p1:'raijin',p2:'fujin'}, scores:{p1:0,p2:0}, running:false, paused:false, finished:false,
  keys:{}, touch:{up1:false,down1:false,up2:false,down2:false}, touchDrag:{p1:null,p2:null}, touchDragDelta:{p1:0,p2:0}, lastFrame:0, raf:0,
  ball:null,balls:[],ballLimit:24,nextBallId:1,paddles:{p1:null,p2:null}, particles:[], items:[], temporaryWalls:[], powerupSpawnTimer:1.1, countdown:0, serveTimer:0, rally:0,
  soundEnabled:true, audioContext:null, lastWinner:null, worldEffects:{eclipse:0,quake:0,prism:0,crosswind:0,gravity:0,curve:0,storm:0,rainbowArena:0}, chaosArena:{time:0,pulse:0,cycle:0}, ballPower:{type:'',time:0,baseSpeed:0}
};
export function createPaddle(side,god){return {side,godId:god.id,x:side==='p1'?28:959,y:250,w:SETTINGS_PADDLE_WIDTH(),h:god.stats.size,baseH:god.stats.size,speed:god.stats.speed,color:god.color,powerColor:'',matchSizeScale:1,motion:0,slow:0,invert:0,shield:0,shieldMode:'',grow:0,shrink:0,skillGrowScale:1.65,skillShrinkScale:.62,powerGrow:0,powerShrink:0,freeze:0,palette:0,bonusPoint:0,counter:0,aimBonus:0,cooldown:0,abilityTime:0,abilityEffect:'',haste:0,aura:0,paddleJet:0,paddleJetPulse:0,paddleCoil:0,paddleCoilPulse:0,paddleShock:0,paddleShockCooldown:0,paddleChaos:0,paddleChaosPhase:0,paddlePhase:0,paddlePhaseCooldown:0,paddlePhaseWarning:0};}
function SETTINGS_PADDLE_WIDTH(){return 13;}
let fallbackBallId=1;
export function createBall(options={}){
 const parent=options.parent||null;
 const id=`ball-${Number.isFinite(state.nextBallId)&&state.nextBallId>0?state.nextBallId++:fallbackBallId++}`;
 const ball={id,parentId:parent?.id||options.parentId||null,generation:parent?(parent.generation||0)+1:Math.max(0,options.generation||0),lineage:{rootId:parent?.lineage?.rootId||parent?.id||options.rootId||id,mutation:Math.max(0,options.mutation||0)},x:Number.isFinite(options.x)?options.x:500,y:Number.isFinite(options.y)?options.y:300,baseR:parent?.baseR||options.baseR||options.r||9,r:parent?.r||options.r||9,vx:Number.isFinite(options.vx)?options.vx:0,vy:Number.isFinite(options.vy)?options.vy:0,speed:parent?.speed||options.speed||7.2,color:parent?.color||options.color||'#f6f4ed',glow:parent?.glow??13,powerEffect:parent?.powerEffect?{...parent.powerEffect}:null,matchEffects:parent?.matchEffects?{...parent.matchEffects}:{sizeScale:1,trajectory:'',color:'',polygonSides:0},fire:parent?.fire||0,specialEffect:parent?.specialEffect||'',effectTime:parent?.effectTime||0,trail:[],lastHit:options.lastHit||parent?.lastHit||'p1'};
 return ball;
}
export function ensureBallCollection(){
 if(!Array.isArray(state.balls))state.balls=[];
 if(state.ball&&!state.balls.includes(state.ball))state.balls.unshift(state.ball);
 if(!state.ball&&state.balls.length)state.ball=state.balls[0];
 if(!state.ball&&!state.balls.length){state.ball=createBall();state.balls.push(state.ball);}
 return state.balls;
}
export function spawnBall(parent=state.ball,options={}){
 const balls=ensureBallCollection(),limit=Math.max(1,Math.floor(state.ballLimit||64));
 if(balls.length>=limit||!parent)return null;
 const angle=Number.isFinite(options.angle)?options.angle:0;
 const speed=Math.hypot(parent.vx,parent.vy)||parent.speed||7.2;
 const direction=Math.atan2(parent.vy,parent.vx)+angle;
 const child=createBall({parent,x:parent.x,y:parent.y,vx:Math.cos(direction)*speed,vy:Math.sin(direction)*speed,speed,lastHit:parent.lastHit,mutation:options.mutation});
 child.x+=Math.cos(direction)*(parent.r+child.r+1);child.y+=Math.sin(direction)*(parent.r+child.r+1);
 balls.push(child);return child;
}
export function removeBall(ball){
 const balls=ensureBallCollection(),index=balls.indexOf(ball);
 if(index<0)return false;
 balls.splice(index,1);if(state.ball===ball)state.ball=balls[0]||null;return true;
}
export function resetBallCollection(primary=state.ball){state.ball=primary||createBall();state.balls=[state.ball];return state.ball;}

