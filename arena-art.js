/* Arte ambiental de las arenas. Cada escenario tiene una composición propia:
   arquitectura, siluetas y símbolos ligados a su identidad. Se dibuja una vez
   en la caché, detrás del partido; no crea colisiones ni tapa la pelota. */
const PATHS = {
  arena_japanese: ['#e6a7c4', '#9e4d68'], arena_greek: ['#ffe7a1', '#8799bf'],
  arena_norse: ['#a9dcea', '#577f98'], arena_egyptian: ['#f7d17a', '#9d6837'],
  arena_indian: ['#f4a8d8', '#a4549b'], arena_mexica: ['#7ee4b7', '#388b77'],
  arena_primordial: ['#f3b978', '#a85962'], arena_chinese: ['#ffd477', '#b3444a'],
  arena_mesopotamian: ['#e8c17a', '#927044'], arena_celtic: ['#a9e59b', '#4f8b63'],
  arena_arthurian: ['#d8e7ff', '#758ab6'], arena_persian: ['#f5b37f', '#9f5366'],
  arena_roman: ['#f3d3a0', '#b58a5a'], arena_anglo_saxon: ['#d9cc9b', '#767b51'],
  arena_germanic: ['#cad8a0', '#5e805e'], arena_medieval_europe: ['#d1c9ff', '#7472aa'],
  arena_levantine: ['#a4eced', '#4d969f']
};
const TAU = Math.PI * 2;
function stroke(ctx, color, alpha, width = 2) { ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width; }
function line(ctx, points) { ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke(); }
function polygon(ctx, points, fill, alpha = .18, outline = null) {
  ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
  ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.globalAlpha = Math.min(.8, alpha + .25); ctx.strokeStyle = outline; ctx.lineWidth = 1.5; ctx.stroke(); }
}
function arch(ctx, x, y, w, h, c) {
  ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x,y+h*.34); ctx.quadraticCurveTo(x+w*.5,y-h*.18,x+w,y+h*.34); ctx.lineTo(x+w,y+h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-7,y+h); ctx.lineTo(x+w+7,y+h); ctx.stroke();
}
function mountain(ctx, x, base, w, h, c) {
  polygon(ctx, [[x-w/2,base],[x,base-h],[x+w/2,base]], c, .11, c);
  line(ctx, [[x-w*.18,base-h*.62],[x,base-h],[x+w*.16,base-h*.62]]);
}
function star(ctx,x,y,r,c){ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.35:r;const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.stroke();}
function pillar(ctx,x,top,bottom,w,c){ctx.strokeRect(x-w/2,top,w,bottom-top);ctx.strokeRect(x-w*.72,top-7,w*1.44,7);ctx.strokeRect(x-w*.84,bottom,w*1.68,5);for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(x-w*.28,top+k*(bottom-top)/4);ctx.lineTo(x+w*.28,top+k*(bottom-top)/4);ctx.stroke();}}
function drawShrine(c,bg,accent,quality){
  // Torii monumental y tejados curvos, con pétalos dispersos por los extremos.
  const torii=(x,s=1)=>{c.save();c.translate(x,0);c.scale(s,s);line(c,[[-45,130],[45,130]]);line(c,[[-57,117],[57,117]]);line(c,[[-49,108],[-32,116],[32,116],[49,108]]);line(c,[[-35,130],[-35,219]]);line(c,[[35,130],[35,219]]);c.restore();};
  stroke(c,accent,.66,3);torii(95,.85);torii(905,.85);torii(500,.62);
  stroke(c,bg,.62,12);line(c,[[55,223],[55,165],[80,137],[105,165],[105,223]]);line(c,[[895,223],[895,165],[920,137],[945,165],[945,223]]);
  stroke(c,accent,.36,1.3);for(let side=0;side<2;side++){const x0=side?750:42;for(let i=0;i<7;i++){const x=x0+i*24,y=side?68+(i%3)*8:72+(i%3)*8;c.beginPath();c.moveTo(x,y+8);c.quadraticCurveTo(x+8,y-3,x+14,y+8);c.quadraticCurveTo(x+8,y+16,x,y+8);c.stroke();}}
  if(quality!=='low'){stroke(c,accent,.24,1);for(let i=0;i<10;i++){const x=65+(i*97)%870,y=275+(i*61)%250;c.beginPath();c.ellipse(x,y,3,8,(i%3)*.6,0,TAU);c.stroke();}}
}
function drawOlympus(c,a,bg,accent){
  mountain(c,210,185,280,140,bg);mountain(c,790,185,300,160,bg);mountain(c,500,143,430,168,bg);
  stroke(c,accent,.62,2);polygon(c,[[370,155],[500,62],[630,155]],bg,.1,accent);line(c,[[390,155],[610,155]]);
  for(const x of [390,435,480,520,565,610])pillar(c,x,155,204,10,accent);
  c.beginPath();c.ellipse(500,72,45,23,0,0,TAU);c.stroke();for(let i=0;i<16;i++){const p=i*TAU/16;c.beginPath();c.moveTo(500+Math.cos(p)*52,72+Math.sin(p)*27);c.lineTo(500+Math.cos(p)*65,72+Math.sin(p)*34);c.stroke();}
  stroke(c,bg,.5,9);for(const x of [70,930])arch(c,x-22,105,44,135,bg);
  stroke(c,accent,.34,1.1);for(const x of [85,915]){c.beginPath();c.arc(x,450,30,Math.PI,TAU);c.stroke();c.beginPath();c.arc(x,450,20,Math.PI,TAU);c.stroke();}
}
function drawYggdrasil(c,bg,accent,quality){
  // Tronco central translúcido, con raíces profundas y ramas altas como bóveda.
  stroke(c,bg,.66,25);line(c,[[500,238],[500,175],[492,120],[500,58]]);line(c,[[500,174],[445,127],[408,103]]);line(c,[[500,151],[555,104],[595,80]]);line(c,[[500,219],[438,244],[400,282]]);line(c,[[500,219],[565,251],[608,282]]);
  stroke(c,accent,.33,3);line(c,[[500,224],[500,154],[500,58]]);line(c,[[498,148],[454,115],[422,92]]);line(c,[[502,166],[544,127],[578,106]]);line(c,[[500,216],[454,248],[423,277]]);line(c,[[500,216],[547,248],[580,278]]);
  stroke(c,accent,.28,1.2);for(let i=0;i<9;i++){const x=85+i*103,y=73+(i%3)*10;c.beginPath();c.arc(x,y,7+(i%2)*3,0,TAU);c.stroke();}
  if(quality!=='low'){stroke(c,accent,.18,1);for(let side=0;side<2;side++)for(let i=0;i<5;i++){const x=side?830+i*24:50+i*24,y=360+i*35;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+(side?15:-15),y-20,x+(side?5:-5),y-38);c.stroke();}}
}
function drawEgypt(c,bg,accent){
  for(const [x,s] of [[145,1],[855,1],[330,.62],[670,.62]]){polygon(c,[[x-90*s,220],[x,92*s+45],[x+90*s,220]],bg,.24,accent);line(c,[[x,92*s+45],[x+8*s,213]]);line(c,[[x-90*s,220],[x+90*s,220]]);}
  c.beginPath();c.arc(500,100,35,0,TAU);c.stroke();for(let i=0;i<18;i++){const a=i*TAU/18;c.beginPath();c.moveTo(500+Math.cos(a)*42,100+Math.sin(a)*42);c.lineTo(500+Math.cos(a)*59,100+Math.sin(a)*59);c.stroke();}
  // Alas y discos alados.
  c.beginPath();c.moveTo(500,100);c.quadraticCurveTo(420,45,355,88);c.quadraticCurveTo(420,111,500,100);c.quadraticCurveTo(580,45,645,88);c.quadraticCurveTo(580,111,500,100);c.stroke();
  for(const x of [62,938]){stroke(c,bg,.56,12);pillar(c,x,245,505,24,bg);stroke(c,accent,.35,1.4);for(let y=260;y<490;y+=35){c.strokeRect(x-12,y,24,21);line(c,[[x-8,y+5],[x,y+16],[x+8,y+5]]);}}
}
function drawMandala(c,bg,accent){
  // Mandala vertical de techo y dos ruedas laterales: deja el centro despejado.
  for(const x of [115,885]){stroke(c,accent,.45,1.5);for(let r=20;r<=65;r+=15){c.beginPath();c.arc(x,300,r,0,TAU);c.stroke();}for(let i=0;i<16;i++){const a=i*TAU/16;c.beginPath();c.ellipse(x+Math.cos(a)*49,300+Math.sin(a)*49,6,17,a,0,TAU);c.stroke();}}
  stroke(c,bg,.48,11);arch(c,365,84,270,105,bg);stroke(c,accent,.5,1.8);arch(c,382,82,236,90,accent);
  for(let x=410;x<=590;x+=45){c.beginPath();c.moveTo(x,173);c.lineTo(x,219);c.stroke();c.beginPath();c.arc(x,228,5,0,TAU);c.stroke();}
  stroke(c,accent,.22,1);for(let i=0;i<12;i++){const x=45+i*83;c.beginPath();c.moveTo(x,505);c.lineTo(x+21,526);c.lineTo(x,547);c.lineTo(x-21,526);c.closePath();c.stroke();}
}
function drawMexica(c,bg,accent){
  const temple=(x,s)=>{polygon(c,[[x-72*s,220],[x-72*s,198],[x-52*s,198],[x-52*s,174],[x-31*s,174],[x-31*s,150],[x+31*s,150],[x+31*s,174],[x+52*s,174],[x+52*s,198],[x+72*s,198]],bg,.22,accent);line(c,[[x-72*s,220],[x+72*s,220]]);line(c,[[x-20*s,220],[x-20*s,175],[x+20*s,175],[x+20*s,220]]);};
  stroke(c,accent,.6,2);temple(155,.8);temple(845,.8);temple(500,.5);
  stroke(c,accent,.38,1.5);for(const side of [-1,1]){c.beginPath();for(let i=0;i<=40;i++){const u=i/40,x=500+side*(40+u*420),y=205+Math.sin(u*TAU*2)*19+u*230;c.lineTo(x,y);}c.stroke();for(let i=0;i<8;i++){const x=side===-1?72+i*27:928-i*27,y=450+(i%3)*25;c.beginPath();c.ellipse(x,y,5,18,side*.4,0,TAU);c.stroke();}}
  c.beginPath();c.arc(500,100,26,0,TAU);c.stroke();for(let i=0;i<12;i++){const a=i*TAU/12;c.beginPath();c.moveTo(500+Math.cos(a)*33,100+Math.sin(a)*33);c.lineTo(500+Math.cos(a)*45,100+Math.sin(a)*45);c.stroke();}
}
function drawPrimordial(c,bg,accent){
  stroke(c,bg,.9,15);line(c,[[90,24],[135,90],[116,147],[166,214]]);line(c,[[910,24],[858,82],[885,142],[830,208]]);line(c,[[24,408],[83,441],[55,498],[102,576]]);line(c,[[976,390],[915,432],[945,502],[901,576]]);
  stroke(c,accent,.38,2);for(let i=0;i<7;i++){const x=95+i*135,y=75+(i%3)*175;polygon(c,[[x,y-24],[x+17,y-5],[x+8,y+18],[x-14,y+12],[x-22,y-7]],bg,.22,accent);}
  c.beginPath();c.moveTo(500,30);c.lineTo(486,105);c.lineTo(513,166);c.lineTo(492,235);c.lineTo(507,303);c.lineTo(485,390);c.lineTo(509,470);c.lineTo(495,570);c.stroke();
  stroke(c,bg,.28,18);c.beginPath();c.ellipse(500,300,80,190,-.15,0,TAU);c.stroke();
}
function drawChinese(c,bg,accent){
  mountain(c,130,240,270,185,bg);mountain(c,865,245,300,195,bg);mountain(c,300,205,250,130,bg);mountain(c,700,205,250,145,bg);
  const pagoda=(x,s)=>{c.save();c.translate(x,0);c.scale(s,s);stroke(c,accent,.58,2);for(let level=0;level<3;level++){const y=118+level*32,w=48+level*22;c.beginPath();c.moveTo(-w-13,y);c.lineTo(-w,y-9);c.lineTo(-w+8,y);c.lineTo(w-8,y);c.lineTo(w,y-9);c.lineTo(w+13,y);c.stroke();c.strokeRect(-w+5,y,2*w-10,31);}c.restore();};pagoda(110,.78);pagoda(890,.78);
  stroke(c,accent,.32,2);c.beginPath();c.moveTo(60,350);c.bezierCurveTo(150,270,215,400,300,330);c.bezierCurveTo(390,255,420,365,500,310);c.bezierCurveTo(610,250,660,390,730,325);c.bezierCurveTo(815,255,860,355,940,285);c.stroke();
  for(const x of [70,930]){c.beginPath();c.arc(x,465,28,0,TAU);c.stroke();c.beginPath();c.moveTo(x-20,465);c.lineTo(x+20,465);c.moveTo(x,445);c.lineTo(x,485);c.stroke();}
}
function drawMesopotamian(c,bg,accent){
  const ziggurat=(x,s)=>{for(let k=0;k<4;k++){const w=(36+k*15)*s,y=130+k*22;c.strokeRect(x-w,y,w*2,22);line(c,[[x-w,y+22],[x+w,y+22]]);}line(c,[[x-85*s,218],[x+85*s,218]]);};
  stroke(c,accent,.58,1.8);ziggurat(155,.95);ziggurat(845,.95);ziggurat(500,.46);
  stroke(c,accent,.24,1.5);for(let row=0;row<4;row++){const y=365+row*42;c.beginPath();for(let x=28;x<=972;x+=14){const yy=y+Math.sin(x*.023+row*1.4)*7;if(x===28)c.moveTo(x,yy);else c.lineTo(x,yy);}c.stroke();}
  for(const x of [65,935]){c.beginPath();c.moveTo(x,55);c.lineTo(x+25,76);c.lineTo(x,97);c.lineTo(x-25,76);c.closePath();c.stroke();}
}
function drawCeltic(c,bg,accent){
  for(const x of [80,160,840,920]){stroke(c,bg,.72,13);line(c,[[x,280],[x-6,120],[x+4,90],[x+16,120],[x+12,280]]);stroke(c,accent,.54,2);c.strokeRect(x-9,115,25,22);c.beginPath();c.arc(x+3,126,8,0,TAU);c.stroke();}
  stroke(c,accent,.34,1.4);for(const side of [-1,1]){c.beginPath();c.moveTo(side<0?26:974,575);c.bezierCurveTo(side<0?160:840,500,side<0?35:965,410,side<0?155:845,335);c.stroke();for(let i=0;i<10;i++){const x=side<0?40+i*12:960-i*12,y=500-i*18;c.beginPath();c.ellipse(x,y,4,12,side*.6,0,TAU);c.stroke();}}
  for(const x of [110,890]){c.beginPath();for(let i=0;i<3;i++){const a=i*TAU/3;c.arc(x+Math.cos(a)*9,455+Math.sin(a)*9,14,a,a+Math.PI*1.55);}c.stroke();}
}
function drawArthurian(c,bg,accent){
  stroke(c,bg,.8,13);for(const x of [83,917]){arch(c,x-42,95,84,390,bg);arch(c,x-25,130,50,345,bg);}
  stroke(c,accent,.38,1.4);for(const x of [80,920]){c.beginPath();c.arc(x,210,20,0,TAU);c.stroke();for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(x+Math.cos(a)*20,210+Math.sin(a)*20);c.lineTo(x+Math.cos(a)*32,210+Math.sin(a)*32);c.stroke();}}
  // Grial e espada en el remate superior, no en la línea central de la pelota.
  c.beginPath();c.moveTo(500,82);c.lineTo(478,90);c.lineTo(482,104);c.quadraticCurveTo(500,119,518,104);c.lineTo(522,90);c.closePath();c.stroke();c.beginPath();c.moveTo(500,82);c.lineTo(500,58);c.moveTo(486,68);c.lineTo(514,68);c.stroke();
}
function drawPersian(c,bg,accent){
  stroke(c,bg,.78,12);arch(c,80,95,105,185,bg);arch(c,815,95,105,185,bg);stroke(c,accent,.48,1.5);arch(c,95,110,75,160,accent);arch(c,830,110,75,160,accent);
  for(const x of [65,935])for(let i=0;i<4;i++){const y=320+i*50;c.beginPath();c.moveTo(x,y);c.lineTo(x+(x<500?18:-18),y+17);c.lineTo(x,y+34);c.lineTo(x+(x<500?-18:18),y+17);c.closePath();c.stroke();}
  // Alas geométricas de Simurg recorren la parte alta.
  c.beginPath();c.moveTo(500,155);c.bezierCurveTo(430,90,370,110,330,150);c.bezierCurveTo(385,140,420,170,468,182);c.moveTo(500,155);c.bezierCurveTo(570,90,630,110,670,150);c.bezierCurveTo(615,140,580,170,532,182);c.stroke();
  for(let i=0;i<7;i++){const x=220+i*93;c.beginPath();c.moveTo(x,50);c.lineTo(x+18,65);c.lineTo(x,80);c.lineTo(x-18,65);c.closePath();c.stroke();}
}
function drawRoman(c,bg,accent){
  stroke(c,bg,.82,13);for(let x=74;x<=926;x+=142){pillar(c,x,104,236,22,bg);arch(c,x-53,64,106,43,bg);}
  stroke(c,accent,.34,1.5);for(const side of [-1,1]){c.beginPath();c.arc(side<0?65:935,455,33,Math.PI*.15,Math.PI*.85);c.stroke();for(let i=0;i<7;i++){const a=Math.PI*.2+i*Math.PI*.1,x=(side<0?65:935)+Math.cos(a)*35,y=455+Math.sin(a)*35;c.beginPath();c.ellipse(x,y,4,10,a,0,TAU);c.stroke();}}
  c.beginPath();c.arc(500,83,20,Math.PI,TAU);c.lineTo(520,83);c.lineTo(480,83);c.stroke();
}
function drawAnglo(c,bg,accent){
  stroke(c,bg,.78,14);line(c,[[25,110],[190,38],[355,110],[500,38],[645,110],[810,38],[975,110]]);line(c,[[25,110],[25,162],[975,162],[975,110]]);for(let x=45;x<980;x+=145){c.strokeRect(x,165,16,85);c.strokeRect(x-4,155,24,8);}
  stroke(c,accent,.42,1.5);for(const x of [100,300,500,700,900]){c.beginPath();c.moveTo(x,280);c.lineTo(x+16,296);c.lineTo(x,312);c.lineTo(x-16,296);c.closePath();c.stroke();c.beginPath();c.moveTo(x,287);c.lineTo(x,305);c.moveTo(x-8,296);c.lineTo(x+8,296);c.stroke();}
  for(let y=385;y<570;y+=54){stroke(c,accent,.18,1);line(c,[[30,y],[970,y]]);}
}
function drawGermanic(c,bg,accent){
  for(const x of [42,105,168,832,895,958]){const base=230+(x%3)*20,w=x%2?30:42;polygon(c,[[x-w,base],[x,base-112],[x+w,base]],bg,.36,accent);polygon(c,[[x-w*.8,base-40],[x,base-135],[x+w*.8,base-40]],bg,.26,accent);}
  c.globalAlpha=.24;c.fillStyle=bg;c.beginPath();c.arc(500,105,32,0,TAU);c.fill();c.globalAlpha=.55;c.strokeStyle=accent;c.lineWidth=2;c.beginPath();c.arc(500,105,31,0,TAU);c.stroke();
  stroke(c,accent,.26,1.2);for(const x of [420,580]){c.beginPath();c.arc(x,452,8,0,TAU);c.stroke();c.beginPath();c.arc(x+15,452,8,0,TAU);c.stroke();}for(let i=0;i<12;i++){const x=60+i*80,y=490+(i%3)*25;star(c,x,y,4,accent);}
}
function drawMedieval(c,bg,accent){
  stroke(c,bg,.82,14);for(const x of [65,935]){line(c,[[x-42,575],[x-42,210],[x-24,180],[x-5,210],[x-5,575]]);line(c,[[x+5,575],[x+5,250],[x+23,220],[x+42,250],[x+42,575]]);}
  stroke(c,accent,.42,1.5);c.beginPath();c.arc(500,130,68,Math.PI,TAU);c.lineTo(568,130);c.lineTo(432,130);c.stroke();for(let i=0;i<12;i++){const a=i*TAU/12;c.beginPath();c.moveTo(500+Math.cos(a)*30,130+Math.sin(a)*30);c.lineTo(500+Math.cos(a)*66,130+Math.sin(a)*66);c.stroke();}c.beginPath();c.arc(500,130,25,0,TAU);c.stroke();
  for(const x of [95,905]){polygon(c,[[x,372],[x+18,400],[x+5,432],[x-14,423],[x-20,393]],bg,.35,accent);polygon(c,[[x,452],[x+20,477],[x+7,509],[x-12,500],[x-18,473]],bg,.3,accent);}
}
function drawLevantine(c,bg,accent){
  stroke(c,bg,.66,16);for(let row=0;row<5;row++){const y=400+row*35;c.beginPath();for(let x=25;x<=975;x+=12){const yy=y+Math.sin(x/58+row*.7)*9;if(x===25)c.moveTo(x,yy);else c.lineTo(x,yy);}c.stroke();}
  stroke(c,accent,.34,1.4);c.beginPath();c.arc(500,98,31,Math.PI*.18,Math.PI*1.82);c.stroke();c.beginPath();c.arc(512,90,29,Math.PI*.3,Math.PI*1.8);c.stroke();
  const pts=[[120,90],[220,145],[310,70],[690,77],[790,142],[885,70],[130,300],[875,300]];pts.forEach(([x,y])=>star(c,x,y,5,accent));stroke(c,accent,.18,1);for(let i=0;i<pts.length-1;i++){const [x,y]=pts[i], [xx,yy]=pts[(i+1)%pts.length];line(c,[[x,y],[xx,yy]]);}
  for(const x of [65,935]){c.beginPath();c.moveTo(x-22,240);c.lineTo(x,220);c.lineTo(x+22,240);c.lineTo(x,260);c.closePath();c.stroke();}
}
const DRAWERS = {
  arena_japanese: drawShrine, arena_greek: drawOlympus, arena_norse: drawYggdrasil,
  arena_egyptian: drawEgypt, arena_indian: drawMandala, arena_mexica: drawMexica,
  arena_primordial: drawPrimordial, arena_chinese: drawChinese, arena_mesopotamian: drawMesopotamian,
  arena_celtic: drawCeltic, arena_arthurian: drawArthurian, arena_persian: drawPersian,
  arena_roman: drawRoman, arena_anglo_saxon: drawAnglo, arena_germanic: drawGermanic,
  arena_medieval_europe: drawMedieval, arena_levantine: drawLevantine
};

export function drawArenaArt(ctx, arenaId, arenaStyle, width = 1000, height = 600, quality = 'balanced') {
  const id = DRAWERS[arenaId] ? arenaId : Object.keys(DRAWERS).find(key => arenaStyle && key.includes(arenaStyle)) || 'arena_japanese';
  const palette = PATHS[id] || ['#d5d5ff','#7180a0'];
  const [accent, shadow] = palette;
  ctx.save();
  ctx.beginPath(); ctx.rect(24, 24, width - 48, height - 48); ctx.clip();
  // Viñeta ligera en las bandas exteriores; el corredor central queda legible.
  const wash = ctx.createLinearGradient(0, 24, 0, height - 24);
  wash.addColorStop(0, `${shadow}19`); wash.addColorStop(.48, `${shadow}00`); wash.addColorStop(1, `${shadow}25`);
  ctx.fillStyle = wash; ctx.fillRect(24, 24, width - 48, height - 48);
  const drawer = DRAWERS[id];
  if (id === 'arena_japanese') drawer(ctx, shadow, accent, quality);
  else if (id === 'arena_greek') drawer(ctx, shadow, accent);
  else if (id === 'arena_norse') drawer(ctx, shadow, accent, quality);
  else if (id === 'arena_egyptian') drawer(ctx, shadow, accent);
  else if (id === 'arena_indian') drawer(ctx, shadow, accent);
  else if (id === 'arena_mexica') drawer(ctx, shadow, accent);
  else if (id === 'arena_primordial') drawer(ctx, shadow, accent);
  else if (id === 'arena_chinese') drawer(ctx, shadow, accent);
  else if (id === 'arena_mesopotamian') drawer(ctx, shadow, accent);
  else if (id === 'arena_celtic') drawer(ctx, shadow, accent);
  else if (id === 'arena_arthurian') drawer(ctx, shadow, accent);
  else if (id === 'arena_persian') drawer(ctx, shadow, accent);
  else if (id === 'arena_roman') drawer(ctx, shadow, accent);
  else if (id === 'arena_anglo_saxon') drawer(ctx, shadow, accent);
  else if (id === 'arena_germanic') drawer(ctx, shadow, accent);
  else if (id === 'arena_medieval_europe') drawer(ctx, shadow, accent);
  else if (id === 'arena_levantine') drawer(ctx, shadow, accent);
  ctx.restore();
}

/* Sello central propio de cada arena. Se mantiene tenue para que la pelota y
   los efectos de combate siempre tengan prioridad visual. */
export function drawArenaCore(ctx, arenaId, quality = 'balanced') {
  const palette = PATHS[arenaId] || ['#d5d5ff','#7180a0'];
  const color = palette[0];
  ctx.save(); ctx.translate(500,300); ctx.strokeStyle=color; ctx.fillStyle=color;
  ctx.globalAlpha=quality==='low'?.12:.23; ctx.lineWidth=1.35;
  switch(arenaId){
    case 'arena_japanese':
      ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-20,-10);ctx.lineTo(20,-10);ctx.moveTo(-15,-5);ctx.lineTo(-15,18);ctx.moveTo(15,-5);ctx.lineTo(15,18);ctx.moveTo(-23,-15);ctx.lineTo(23,-15);ctx.stroke();break;
    case 'arena_greek':
      line(ctx,[[-8,-21],[4,-4],[-5,-4],[8,21],[5,5],[14,5]]);for(const s of [-1,1]){ctx.beginPath();ctx.arc(s*18,0,7,s<0?-Math.PI/2:Math.PI/2,Math.PI*1.5);ctx.stroke();}break;
    case 'arena_norse':
      line(ctx,[[0,-23],[0,23],[-16,-11],[0,-1],[16,-16],[-1,6],[-17,19],[0,11],[17,22]]);break;
    case 'arena_egyptian':
      ctx.beginPath();ctx.ellipse(0,-12,9,13,0,0,TAU);ctx.moveTo(0,1);ctx.lineTo(0,23);ctx.moveTo(-12,8);ctx.lineTo(12,8);ctx.moveTo(-17,17);ctx.quadraticCurveTo(0,28,17,17);ctx.stroke();break;
    case 'arena_indian':
      for(let i=0;i<8;i++){const a=i*TAU/8;ctx.beginPath();ctx.ellipse(Math.cos(a)*9,Math.sin(a)*9,5,14,a,0,TAU);ctx.stroke();}ctx.beginPath();ctx.arc(0,0,4,0,TAU);ctx.stroke();break;
    case 'arena_mexica':
      ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.arc(0,0,7,0,TAU);ctx.stroke();for(let i=0;i<12;i++){const a=i*TAU/12;ctx.beginPath();ctx.moveTo(Math.cos(a)*17,Math.sin(a)*17);ctx.lineTo(Math.cos(a)*24,Math.sin(a)*24);ctx.stroke();}break;
    case 'arena_primordial':
      line(ctx,[[-4,-24],[5,-11],[-7,0],[4,10],[-2,25]]);line(ctx,[[-22,-7],[-12,-2],[-18,10]]);line(ctx,[[19,-19],[13,-8],[22,1]]);break;
    case 'arena_chinese':
      ctx.beginPath();ctx.arc(-3,0,16,-Math.PI/2,Math.PI/2);ctx.arc(3,0,16,Math.PI/2,Math.PI*1.5);ctx.stroke();ctx.beginPath();ctx.arc(0,-8,3,0,TAU);ctx.arc(0,8,3,0,TAU);ctx.stroke();break;
    case 'arena_mesopotamian':
      for(let i=0;i<8;i++){const a=i*TAU/8;ctx.beginPath();ctx.moveTo(Math.cos(a)*7,Math.sin(a)*7);ctx.lineTo(Math.cos(a)*23,Math.sin(a)*23);ctx.stroke();}ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.stroke();break;
    case 'arena_celtic':
      for(let i=0;i<3;i++){const a=i*TAU/3;ctx.beginPath();ctx.arc(Math.cos(a)*6,Math.sin(a)*6,10,a,a+Math.PI*1.45);ctx.stroke();}break;
    case 'arena_arthurian':
      ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(-13,-8);ctx.lineTo(-9,7);ctx.quadraticCurveTo(0,16,9,7);ctx.lineTo(13,-8);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,20);ctx.moveTo(-9,-6);ctx.lineTo(9,-6);ctx.stroke();break;
    case 'arena_persian':
      ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-10,-17,-22,-13,-24,-22);ctx.bezierCurveTo(-11,-23,-8,-8,0,0);ctx.bezierCurveTo(10,-17,22,-13,24,-22);ctx.bezierCurveTo(11,-23,8,-8,0,0);ctx.stroke();for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*7,3);ctx.lineTo(i*7,21-Math.abs(i)*4);ctx.stroke();}break;
    case 'arena_roman':
      for(let s of [-1,1])for(let i=0;i<5;i++){const a=(.2+i*.18)*Math.PI*s;ctx.beginPath();ctx.ellipse(s*6+Math.cos(a)*10,Math.sin(a)*10,4,8,a,0,TAU);ctx.stroke();}break;
    case 'arena_anglo_saxon':
      ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(16,-11);ctx.lineTo(13,12);ctx.lineTo(0,23);ctx.lineTo(-13,12);ctx.lineTo(-16,-11);ctx.closePath();ctx.stroke();line(ctx,[[0,-13],[0,13],[-8,-3],[8,3]]);break;
    case 'arena_germanic':
      ctx.beginPath();ctx.arc(-6,0,17,Math.PI*.25,Math.PI*1.75);ctx.stroke();ctx.beginPath();ctx.moveTo(3,-14);ctx.lineTo(17,-20);ctx.lineTo(12,-6);ctx.stroke();break;
    case 'arena_medieval_europe':
      ctx.beginPath();ctx.arc(0,0,21,0,TAU);ctx.arc(0,0,9,0,TAU);ctx.stroke();for(let i=0;i<8;i++){const a=i*TAU/8;ctx.beginPath();ctx.moveTo(Math.cos(a)*9,Math.sin(a)*9);ctx.lineTo(Math.cos(a)*21,Math.sin(a)*21);ctx.stroke();}break;
    case 'arena_levantine':
      ctx.beginPath();ctx.arc(-4,0,14,Math.PI*.18,Math.PI*1.82);ctx.stroke();for(let i=0;i<8;i++){const a=i*TAU/8;ctx.beginPath();ctx.moveTo(Math.cos(a)*17,Math.sin(a)*17);ctx.lineTo(Math.cos(a)*24,Math.sin(a)*24);ctx.stroke();}break;
  }
  ctx.restore();
}
