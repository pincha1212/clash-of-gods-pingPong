import { SETTINGS } from './config.js';

// Arte ambiental estático: decorativo, sin colisiones ni cambios en la física.
// Se dibuja una vez en la caché de la arena y respeta el modo de calidad.
const clampAlpha = (quality) => quality === 'low' ? 0.48 : quality === 'high' ? 0.9 : 0.68;

function line(ctx, points, close = false) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  if (close) ctx.closePath();
  ctx.stroke();
}
function diamond(ctx, x, y, r) {
  line(ctx, [[x, y-r], [x+r, y], [x, y+r], [x-r, y]], true);
}
function lotus(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a - .22) * r * .65, y + Math.sin(a - .22) * r * .65, x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.quadraticCurveTo(x + Math.cos(a + .22) * r * .65, y + Math.sin(a + .22) * r * .65, x, y);
  }
  ctx.stroke();
}
function sun(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * .68, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    line(ctx, [[x + Math.cos(a) * (r + 4), y + Math.sin(a) * (r + 4)], [x + Math.cos(a) * (r + 12), y + Math.sin(a) * (r + 12)]]);
  }
}
function column(ctx, x, top, height, width = 18) {
  ctx.strokeRect(x - width / 2, top, width, height);
  ctx.strokeRect(x - width / 2 - 5, top - 6, width + 10, 6);
  ctx.strokeRect(x - width / 2 - 4, top + height, width + 8, 5);
  for (let i = 1; i < 4; i++) line(ctx, [[x - width / 2 + 2, top + height * i / 4], [x + width / 2 - 2, top + height * i / 4]]);
}
function tree(ctx, x, y, scale = 1) {
  line(ctx, [[x, y+58*scale], [x-4*scale, y+24*scale], [x, y-10*scale], [x+2*scale, y-42*scale]]);
  line(ctx, [[x, y+4*scale], [x-22*scale, y-16*scale], [x-39*scale, y-23*scale]]);
  line(ctx, [[x+1*scale, y-12*scale], [x+22*scale, y-31*scale], [x+37*scale, y-48*scale]]);
  line(ctx, [[x, y+38*scale], [x-20*scale, y+52*scale], [x-32*scale, y+60*scale]]);
  line(ctx, [[x, y+38*scale], [x+18*scale, y+52*scale], [x+31*scale, y+60*scale]]);
}
function pyramid(ctx, x, base, w, h) {
  line(ctx, [[x-w/2, base], [x, base-h], [x+w/2, base]], false);
  line(ctx, [[x, base-h], [x, base], [x+w/2, base]], false);
  for (let i = 1; i < 4; i++) {
    const y = base - h * i / 4, half = w * (1 - i / 4) / 2;
    line(ctx, [[x-half, y], [x+half, y]]);
  }
}
function pagoda(ctx, x, y, scale = 1) {
  for (let tier = 0; tier < 3; tier++) {
    const yy = y + tier * 25 * scale, w = (58 - tier * 14) * scale;
    line(ctx, [[x-w*.62, yy+10*scale], [x, yy], [x+w*.62, yy+10*scale], [x+w*.48, yy+10*scale], [x+w*.42, yy+15*scale], [x-w*.42, yy+15*scale], [x-w*.48, yy+10*scale]], true);
  }
  line(ctx, [[x, y-13*scale], [x, y+76*scale]]);
}
function feather(ctx, x, y, scale = 1, flip = 1) {
  ctx.beginPath(); ctx.moveTo(x, y+45*scale); ctx.quadraticCurveTo(x+flip*30*scale, y+8*scale, x+flip*4*scale, y-36*scale); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const yy = y + 26*scale - i*13*scale;
    line(ctx, [[x+flip*2*scale, yy], [x+flip*(12+i*2)*scale, yy-8*scale]]);
  }
}
function wave(ctx, y, phase = 0) {
  ctx.beginPath();
  for (let x = 30; x <= 970; x += 12) {
    const yy = y + Math.sin(x / 35 + phase) * 5 + Math.sin(x / 17 + phase) * 1.5;
    if (x === 30) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}
function runicRing(ctx, x, y, r, count = 16) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
  for (let i = 0; i < count; i++) {
    const a = i * Math.PI * 2 / count, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    line(ctx, [[px-Math.cos(a)*4, py-Math.sin(a)*4], [px+Math.cos(a)*4, py+Math.sin(a)*4]]);
  }
}

export function drawArenaIdentity(ctx, arena, quality = 'balanced') {
  if (!ctx || !arena) return;
  const id = arena.id, low = quality === 'low';
  const alpha = clampAlpha(quality);
  ctx.save();
  ctx.beginPath(); ctx.rect(24, 24, SETTINGS.width - 48, SETTINGS.height - 48); ctx.clip();
  ctx.strokeStyle = arena.accent || '#fff'; ctx.fillStyle = arena.accent || '#fff'; ctx.lineWidth = low ? 1 : 1.35; ctx.globalAlpha = .15 * alpha;

  // Los grandes motivos se apoyan en los laterales para no tapar la trayectoria central.
  switch (id) {
    case 'arena_japanese':
      for (const x of [82, 918]) {
        line(ctx, [[x-30,112],[x+30,112],[x+23,99],[x-23,99]], true);
        ctx.strokeRect(x-20,112,7,66); ctx.strokeRect(x+13,112,7,66);
        ctx.strokeRect(x-26,178,52,6);
        ctx.beginPath(); ctx.arc(x, 218, 11, 0, Math.PI*2); ctx.stroke();
        line(ctx, [[x,229],[x,241],[x-8,249],[x+8,257]]);
      }
      for (const x of [170,830]) { ctx.beginPath(); ctx.arc(x,300,34,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(x,300,22,0,Math.PI*2); ctx.stroke(); }
      break;
    case 'arena_greek':
    case 'arena_roman':
      for (const x of [76,130,870,924]) column(ctx,x,70,120,id==='arena_roman'?22:18);
      if (id === 'arena_greek') {
        for (const x of [110,890]) { ctx.beginPath(); ctx.arc(x,255,30,Math.PI,Math.PI*2); ctx.stroke(); }
        for (const x of [160,840]) { ctx.beginPath(); ctx.ellipse(x,300,31,13,0,0,Math.PI*2); ctx.stroke(); }
      } else {
        for (const x of [110,890]) { ctx.beginPath(); ctx.ellipse(x,300,34,17,0,0,Math.PI*2); ctx.stroke(); }
        for (const x of [105,895]) { line(ctx, [[x-12,276],[x,264],[x+12,276]]); line(ctx, [[x-12,324],[x,336],[x+12,324]]); }
      }
      break;
    case 'arena_norse':
      tree(ctx, 100, 140, .95); tree(ctx, 900, 140, .95);
      for (const x of [110,890]) { runicRing(ctx,x,300,37,12); line(ctx, [[x-13,287],[x,313],[x+13,287]]); }
      line(ctx, [[55,430],[78,405],[94,431],[115,397],[135,430]]);
      line(ctx, [[865,430],[886,405],[902,431],[923,397],[945,430]]);
      break;
    case 'arena_egyptian':
      sun(ctx,500,94,22); pyramid(ctx,105,232,100,80); pyramid(ctx,895,232,100,80);
      for (const x of [65,935]) { ctx.strokeRect(x-13,94,26,145); diamond(ctx,x,82,12); line(ctx, [[x-20,239],[x+20,239]]); }
      for (const x of [185,815]) { line(ctx, [[x,90],[x+14,106],[x,122],[x-14,106]],true); line(ctx, [[x,122],[x,151]]); }
      break;
    case 'arena_indian':
      lotus(ctx,110,150,44); lotus(ctx,890,150,44); lotus(ctx,110,455,34); lotus(ctx,890,455,34);
      for (const x of [175,825]) { runicRing(ctx,x,300,42,12); lotus(ctx,x,300,24); }
      break;
    case 'arena_mexica':
      pyramid(ctx,105,240,104,105); pyramid(ctx,895,240,104,105);
      feather(ctx,80,335,.9,1); feather(ctx,920,335,.9,-1);
      for (const x of [150,850]) { sun(ctx,x,300,22); line(ctx, [[x-25,342],[x,352],[x+25,342]]); }
      break;
    case 'arena_primordial':
      for (let i=0;i<5;i++) {
        const x=70+i*23, y=90+(i%3)*92;
        line(ctx, [[x,y],[x-10,y+18],[x+5,y+31],[x-8,y+52],[x+13,y+65]]);
      }
      for (let i=0;i<5;i++) {
        const x=930-i*23, y=90+(i%3)*92;
        line(ctx, [[x,y],[x+10,y+18],[x-5,y+31],[x+8,y+52],[x-13,y+65]]);
      }
      for (const x of [155,845]) { diamond(ctx,x,300,42); diamond(ctx,x,300,25); }
      break;
    case 'arena_chinese':
      pagoda(ctx,110,112,.8); pagoda(ctx,890,112,.8);
      for (const x of [180,820]) {
        ctx.beginPath(); ctx.ellipse(x,300,48,16,0,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x,300,28,9,0,0,Math.PI*2); ctx.stroke();
      }
      wave(ctx,410,.5); wave(ctx,428,1.5);
      break;
    case 'arena_mesopotamian':
      for (const x of [100,900]) {
        for (let tier=0;tier<4;tier++) ctx.strokeRect(x-34-tier*8,225-tier*23,68+tier*16,22);
        diamond(ctx,x,104,16); diamond(ctx,x,104,8);
      }
      wave(ctx,430,0); wave(ctx,450,1.1); wave(ctx,470,2.2);
      break;
    case 'arena_celtic':
      for (const x of [75,125,875,925]) {
        line(ctx, [[x-12,250],[x-15,176],[x,151],[x+15,176],[x+12,250]],true);
        runicRing(ctx,x,300,18,8);
      }
      for (const x of [160,840]) { ctx.beginPath(); ctx.arc(x,300,42,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(x,300,28,0,Math.PI*2); ctx.stroke(); }
      break;
    case 'arena_arthurian':
      for (const x of [80,130,870,920]) {
        ctx.strokeRect(x-12,125,24,125); ctx.beginPath(); ctx.arc(x,125,12,Math.PI,Math.PI*2); ctx.stroke();
        diamond(ctx,x,102,9);
      }
      for (const x of [160,840]) {
        ctx.beginPath(); ctx.arc(x,300,34,Math.PI,Math.PI*2); ctx.stroke();
        line(ctx, [[x,266],[x,322],[x-12,310],[x,322],[x+12,310]]);
      }
      break;
    case 'arena_persian':
      for (const x of [95,905]) {
        for (let i=0;i<4;i++) { const yy=110+i*42; diamond(ctx,x,yy,15); diamond(ctx,x,yy,7); }
        line(ctx, [[x-25,300],[x-10,282],[x,300],[x+10,282],[x+25,300],[x+10,318],[x,300],[x-10,318]],true);
      }
      for (const x of [170,830]) { ctx.beginPath(); ctx.ellipse(x,300,37,19,0,0,Math.PI*2); ctx.stroke(); }
      break;
    case 'arena_anglo_saxon':
      for (const x of [75,125,875,925]) {
        line(ctx, [[x-19,245],[x-19,160],[x,136],[x+19,160],[x+19,245]],true);
        line(ctx, [[x-22,245],[x+22,245]]);
        diamond(ctx,x,175,9);
      }
      for (let y=390;y<=450;y+=20) { line(ctx, [[45,y],[95,y+8],[145,y],[195,y+8]]); line(ctx, [[805,y],[855,y+8],[905,y],[955,y+8]]); }
      break;
    case 'arena_germanic':
      for (const x of [80,130,180,820,870,920]) {
        line(ctx, [[x,255],[x+17,178],[x+34,255]]);
        line(ctx, [[x+17,178],[x-4,202]]); line(ctx, [[x+17,178],[x+38,202]]);
      }
      for (const x of [155,845]) { ctx.beginPath(); ctx.arc(x,300,31,0,Math.PI*2); ctx.stroke(); line(ctx, [[x-21,300],[x+21,300]]); }
      break;
    case 'arena_medieval_europe':
      for (const x of [75,130,870,925]) {
        line(ctx, [[x-20,250],[x-20,165],[x,142],[x+20,165],[x+20,250]],true);
        line(ctx, [[x-26,250],[x+26,250]]); diamond(ctx,x,180,8);
      }
      for (const x of [170,830]) { runicRing(ctx,x,300,35,10); line(ctx, [[x-18,300],[x+18,300],[x,279],[x,321]],false); }
      break;
    case 'arena_levantine':
      wave(ctx,125,.4); wave(ctx,145,1.2); wave(ctx,165,2.0);
      for (const x of [95,905]) {
        sun(ctx,x,300,22);
        line(ctx, [[x-24,370],[x,342],[x+24,370]]);
        line(ctx, [[x-24,370],[x+24,370]]);
      }
      for (const x of [180,820]) { diamond(ctx,x,95,16); diamond(ctx,x,95,7); }
      break;
    default:
      // Fallback visible for a future arena that has not received custom art yet.
      for (const x of [90,910]) { runicRing(ctx,x,300,28,12); diamond(ctx,x,300,12); }
  }

  // Un sello cultural en el suelo hace que cada campo tenga una firma reconocible.
  // Se mantiene muy tenue y no tapa la pelota ni modifica la geometría de juego.
  ctx.globalAlpha = .045 * alpha;
  ctx.lineWidth = 1.2;
  if (id === 'arena_egyptian') sun(ctx,500,300,58);
  else if (id === 'arena_indian') lotus(ctx,500,300,72);
  else if (id === 'arena_mexica') { sun(ctx,500,300,48); diamond(ctx,500,300,78); }
  else if (id === 'arena_norse') { runicRing(ctx,500,300,62,16); }
  else if (id === 'arena_japanese') { ctx.beginPath(); ctx.arc(500,300,56,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(500,300,42,0,Math.PI*2); ctx.stroke(); }
  else if (id === 'arena_chinese') { ctx.beginPath(); ctx.ellipse(500,300,75,35,0,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(500,300,55,22,0,0,Math.PI*2); ctx.stroke(); }
  else if (id === 'arena_levantine') { wave(ctx,285,0); wave(ctx,315,1.4); }
  else if (id === 'arena_primordial') { diamond(ctx,500,300,70); diamond(ctx,500,300,42); }
  else if (id === 'arena_arthurian') { diamond(ctx,500,300,58); line(ctx, [[500,255],[500,345],[480,325],[500,345],[520,325]]); }
  else if (id === 'arena_celtic') runicRing(ctx,500,300,62,20);
  else if (id === 'arena_mesopotamian') { ctx.strokeRect(450,250,100,100); ctx.strokeRect(465,265,70,70); }
  else if (id === 'arena_persian') { ctx.beginPath(); ctx.ellipse(500,300,72,38,0,0,Math.PI*2); ctx.stroke(); diamond(ctx,500,300,45); }
  else if (id === 'arena_greek' || id === 'arena_roman') { ctx.beginPath(); ctx.ellipse(500,300,66,30,0,0,Math.PI*2); ctx.stroke(); }
  else if (id === 'arena_anglo_saxon') { diamond(ctx,500,300,48); line(ctx, [[480,280],[520,320],[480,320],[520,280]]); }
  else if (id === 'arena_germanic') { ctx.beginPath(); ctx.arc(500,300,58,0,Math.PI*2); ctx.stroke(); line(ctx, [[470,300],[530,300]]); }
  else { ctx.beginPath(); ctx.arc(500,300,52,0,Math.PI*2); ctx.stroke(); }
  ctx.restore();
}
