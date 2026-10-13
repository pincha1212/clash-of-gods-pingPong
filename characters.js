import {GODS} from './config.js';
import {getCodexProfile} from './codex-profiles.js';
import {getCodexConnections,getCodexMyths} from './codex-relations.js';
const KIND_LABEL={hero:'HÉROE',titan:'TITÁN',monster:'MONSTRUO'};
export const kindLabel=g=>KIND_LABEL[g.kind]||(g.kind==='god'?'DIOS':'DIOS');
export function countCodexKind(kind){return Object.values(GODS).filter(g=>kind==='god'?(!g.kind||g.kind==='god'):g.kind===kind).length;}
export function getCodexRoles(kind){const match=kind==='god'?g=>!g.kind||g.kind==='god':g=>g.kind===kind;return [...new Set(Object.values(GODS).filter(match).map(g=>g.role).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));}
export function renderGodCard(id,selected=false){const g=GODS[id];const kind=kindLabel(g);return `<button class="god-card ${selected?'selected':''}" data-god="${g.id}" style="--god:${g.color}" aria-pressed="${selected}"><span class="god-symbol">${g.symbol}</span><strong>${g.name.toUpperCase()}</strong><small>${kind} · ${g.role}</small><small class="god-skill-label">${g.skill.name}</small></button>`;}
export function renderCodex(kind='god',query='',role='all',sort='name'){
 const match=kind==='god'?g=>!g.kind||g.kind==='god':g=>g.kind===kind;
 const q=String(query||'').trim().toLocaleLowerCase('es');
 let entries=Object.values(GODS).filter(g=>match(g)&&(!q||[g.name,g.title,g.role,g.description,g.skill?.name,g.skill?.description,...Object.values(getCodexProfile(g.id)||{}).flat()].join(' ').toLocaleLowerCase('es').includes(q))&&(role==='all'||g.role===role));
 entries.sort((a,b)=>sort==='power'?(b.stats.power-a.stats.power)||a.name.localeCompare(b.name,'es'):sort==='speed'?(b.stats.speed-a.stats.speed)||a.name.localeCompare(b.name,'es'):a.name.localeCompare(b.name,'es'));
 return entries.map((g,index)=>`<article class="codex-card" style="--god:${g.color}" data-codex-entry="${g.id}"><div class="codex-card-index">${String(index+1).padStart(2,'0')}</div><div class="codex-top"><span class="god-symbol">${g.symbol}</span><div><h3>${g.name}</h3><small>${kindLabel(g)} <span aria-hidden="true">/</span> ${g.title}</small></div></div><div class="codex-role-tag">${g.role}</div><p class="codex-description">${g.description}</p><div class="ability"><b>${g.skill.name.toUpperCase()} <span>· ${g.skill.cooldown} S</span></b><p>${g.skill.description}</p></div><div class="codex-stats" aria-label="Estadísticas de combate"><div><span>VELOCIDAD</span><b>${g.stats.speed}<small>/10</small></b><i><u style="width:${Math.max(0,Math.min(100,g.stats.speed*10))}%"></u></i></div><div><span>COBERTURA</span><b>${Math.round(g.stats.size/12.4)}<small>/10</small></b><i><u style="width:${Math.max(0,Math.min(100,g.stats.size/12.4*10))}%"></u></i></div><div><span>POTENCIA</span><b>${g.stats.power}<small>/10</small></b><i><u style="width:${Math.max(0,Math.min(100,g.stats.power*10))}%"></u></i></div></div><button type="button" class="codex-detail-trigger" data-codex-open="${g.id}" aria-label="Abrir ficha completa de ${g.name}">EXPLORAR FICHA <span aria-hidden="true">↗</span></button></article>`).join('');
}

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function detailList(label,items){return items?.length?`<section class="codex-detail-block"><h4>${escapeHTML(label)}</h4><div class="codex-chip-list">${items.map(item=>`<span>${escapeHTML(item)}</span>`).join('')}</div></section>`:'';}
function renderConnectionSection(id,g){
 const links=getCodexConnections(id).filter(link=>GODS[link.relatedId]);
 const groups=[
  ['parent','GENEALOGÍA Y FAMILIA'],['sibling','HERMANOS Y HERMANAS'],['consort','PAREJAS Y UNIONES'],['rival','RIVALES Y ADVERSARIOS'],['ally','ALIADOS Y VÍNCULOS'],['family','OTROS VÍNCULOS']
 ];
 const used=new Set();
 const blocks=groups.map(([type,label])=>{
  const matches=links.filter(link=>link.type===type&&!used.has(`${link.relatedId}|${link.label}`));
  matches.forEach(link=>used.add(`${link.relatedId}|${link.label}`));
  if(!matches.length)return '';
  return `<section class="codex-detail-block"><h4>${label}</h4><div class="codex-link-list">${matches.map(link=>{const related=GODS[link.relatedId];return `<article class="codex-link-card"><div><span class="codex-link-type">${escapeHTML(link.label)}</span><strong>${escapeHTML(related.name)}</strong><p>${escapeHTML(link.note)}</p></div><button type="button" data-codex-related="${escapeHTML(related.id)}" aria-label="Abrir ficha de ${escapeHTML(related.name)}">VER FICHA ↗</button></article>`;}).join('')}</div></section>`;
 }).join('');
 return `<div class="codex-detail-section codex-connections"><p class="eyebrow">RED DE RELACIONES</p><p class="codex-detail-origin">Conexiones documentadas en tradiciones concretas. Algunos parentescos cambian según la fuente; cada vínculo incluye una nota para no presentar una versión como la única.</p>${blocks||'<p class="codex-detail-origin">Todavía no hay vínculos familiares o narrativos cargados para esta figura.</p>'}</div>`;
}
function renderMythsSection(id){
 const myths=getCodexMyths(id);
 if(!myths.length)return '';
 return `<div class="codex-detail-section codex-related-myths"><p class="eyebrow">MITOS Y RELATOS RELACIONADOS</p><div class="codex-myth-grid">${myths.map(myth=>`<article class="codex-myth-card"><span>${escapeHTML(myth.tradition)}</span><h4>${escapeHTML(myth.title)}</h4><p>${escapeHTML(myth.summary)}</p><div class="codex-myth-characters"><small>PERSONAJES VINCULADOS</small><div class="codex-chip-list">${myth.characters.filter(characterId=>GODS[characterId]&&characterId!==id).map(characterId=>`<button type="button" data-codex-related="${escapeHTML(characterId)}">${escapeHTML(GODS[characterId].name)} ↗</button>`).join('')||'<span>Esta ficha es el registro principal de este relato.</span>'}</div></div></article>`).join('')}</div></div>`;
}
export function renderCodexDetail(id){
 const g=GODS[id]; if(!g)return ''; const p=getCodexProfile(id); const coverage=Math.max(0,Math.min(10,Math.round(g.stats.size/12.4)));
 const lore=p?`<div class="codex-detail-section"><p class="eyebrow">TRADICIÓN Y MITO</p>${p.origin?`<p class="codex-detail-origin">${escapeHTML(p.origin)} · ${escapeHTML(p.nature||'')}</p>`:''}${detailList('NOMBRES Y EPÍTETOS',p.aliases)}${detailList('ÁMBITOS ASOCIADOS',p.domains)}${p.story?`<section class="codex-detail-block"><h4>RELATO</h4><p>${escapeHTML(p.story)}</p></section>`:''}${detailList('SÍMBOLOS',p.symbols)}${p.curiosity?`<section class="codex-detail-block codex-detail-curiosity"><h4>PARA TENER EN CUENTA</h4><p>${escapeHTML(p.curiosity)}</p></section>`:''}</div>`:`<div class="codex-detail-section codex-detail-pending"><p class="eyebrow">TRADICIÓN Y MITO</p><h4>Ficha mitológica por ampliar</h4><p>Esta ficha ya conserva la identidad y los datos jugables del personaje. La estructura admite sumar nombres alternativos, procedencia, relatos, ámbitos y símbolos sin tocar sus habilidades ni el combate.</p></div>`;
 return `<div class="codex-detail-hero" style="--god:${g.color}"><div class="codex-detail-symbol">${escapeHTML(g.symbol)}</div><div><p class="eyebrow">FICHA DEL CÓDICE / ${escapeHTML(kindLabel(g))}</p><h2 id="codex-detail-title">${escapeHTML(g.name)}</h2><p>${escapeHTML(g.title)}</p><div class="codex-role-tag">${escapeHTML(g.role)}</div></div></div><p class="codex-detail-intro">${escapeHTML(g.description)}</p>${lore}${renderConnectionSection(id,g)}${renderMythsSection(id)}<div class="codex-detail-section"><p class="eyebrow">PERFIL DE COMBATE · CLASH OF GODS</p><section class="codex-detail-block codex-detail-skill"><h4>${escapeHTML(g.skill.name)} <span>· ${escapeHTML(g.skill.cooldown)} s de recarga</span></h4><p>${escapeHTML(g.skill.description)}</p></section><div class="codex-detail-stats"><div><span>VELOCIDAD</span><b>${g.stats.speed}<small>/10</small></b></div><div><span>COBERTURA</span><b>${coverage}<small>/10</small></b></div><div><span>POTENCIA</span><b>${g.stats.power}<small>/10</small></b></div></div><p class="codex-detail-footnote">Las habilidades y estadísticas de esta sección describen el personaje dentro del juego; no son una afirmación sobre el mito tradicional.</p></div>`;
}
