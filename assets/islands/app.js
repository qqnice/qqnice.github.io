import { ISLANDS } from './islands.js';
import { VIDEO_CATALOG, renderVideoPanel } from './youtube.js';
const $=id=>document.getElementById(id);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const baseURL=new URL('./',location.href);
const lessonURL=path=>new URL(path,baseURL).href;
let catalog=[],scene=null,currentIsland=null,currentTopic=null,currentLesson=null,libraryFilter='all',lastView=null;
let visited=[];try{visited=JSON.parse(localStorage.getItem('qq-sea-visited')||'[]');if(!Array.isArray(visited))visited=[];}catch{}
const colorStyle=i=>`--island-color:${i.color}`;
function announce(s){$('announcement').textContent=s;}
function route(island='',topic='',lesson=null){let next=island+(topic?'/'+topic:'');if(lesson)next+='?'+new URLSearchParams({lesson:lesson.path});if(location.hash.slice(1)===next)applyRoute();else location.hash=next;}
function islandLessons(id,topic=null){return catalog.filter(l=>l.island===id&&(!topic||l.topic===topic)).sort((a,b)=>(a.order??99)-(b.order??99));}
function renderNavigation(){
 $('island-navigation').innerHTML=ISLANDS.map(i=>`<button class="nav-island" data-island="${i.id}" style="${colorStyle(i)}" type="button"><span class="nav-dot"></span>${i.nav}</button>`).join('');
 $('island-navigation').addEventListener('click',e=>{const b=e.target.closest('[data-island]');if(b)route(b.dataset.island);});
 $('fallback-islands').innerHTML=ISLANDS.map(i=>`<button data-island="${i.id}" type="button">${i.name} · ${i.title} ↗</button>`).join('');
 $('fallback-islands').addEventListener('click',e=>{const b=e.target.closest('[data-island]');if(b)route(b.dataset.island);});
}
function renderFeatured(island){
 const lessons=islandLessons(island.id).filter(l=>Number.isInteger(l.featuredOrder)).sort((a,b)=>a.featuredOrder-b.featuredOrder).slice(0,6);
 if(!lessons.length)return '';
 return `<div class="panel-section-title"><span>專區首頁精選</span><span>${lessons.length} 個入口</span></div><div class="featured-lessons">${lessons.map(l=>`<button class="lesson-link featured-lesson" type="button" data-lesson="${l.id}"><strong>${escapeHTML(l.featuredTitle||l.title)}</strong>${l.featuredDescription||l.description?`<p>${escapeHTML(l.featuredDescription||l.description)}</p>`:''}<span class="lesson-action">開啟教材 ↗</span></button>`).join('')}</div>`;
}
function renderPanel(island,topic){const panel=$('island-panel');panel.hidden=!island;if(!island)return;panel.style.setProperty('--island-color',island.color);if(island.type==='youtube'){renderVideoPanel(panel,island,topic,{onFilter:id=>route(island.id,id)});return;}
 const intro=`<div class="panel-topline"><span>ISLAND 0${ISLANDS.indexOf(island)+1}</span><button class="panel-close" type="button" data-sea aria-label="返回海域">×</button></div>`;
 if(topic){const lessons=islandLessons(island.id,topic.id);panel.innerHTML=intro+`<button class="topic-back" type="button" data-island-home>← ${island.title}全覽</button><p class="panel-subtitle">${island.name} ／ ${topic.subtitle}</p><h3>${topic.name}</h3><p class="panel-description">${topic.description}</p>${topic.order?`<p class="topic-order">${topic.order}</p>`:''}<div class="panel-section-title"><span>選擇一段學習旅程</span><span>${lessons.length} 份教材</span></div>${lessons.map(l=>`<button class="lesson-link" type="button" data-lesson="${l.id}"><strong>${escapeHTML(l.title)}</strong>${l.description?`<p>${escapeHTML(l.description)}</p>`:''}<span class="lesson-action">${l.kind==='download'?'檢視下載資源':l.kind?'閱讀 '+l.format:'開啟教材'} ↗</span></button>`).join('')}<a class="panel-index-link" href="${island.id}/" target="_blank" rel="noopener">原專區完整目錄 <span>↗</span></a>`;
 }else{panel.innerHTML=intro+`<p class="panel-subtitle">${island.english}</p><h2>${island.title}</h2><p class="panel-subtitle">${island.tagline}</p><p class="panel-description">${island.description}</p>${renderFeatured(island)}<div class="panel-section-title"><span>依主題探索</span><span>${islandLessons(island.id).length} 份教材</span></div>${island.topics.map((t,j)=>`<button class="topic-button" type="button" data-topic="${t.id}"><span class="topic-no">0${j+1}</span><span><strong>${t.name}</strong><small>${t.subtitle} · ${islandLessons(island.id,t.id).length} 份教材</small></span><span class="topic-arrow">↗</span></button>`).join('')}<button class="panel-index-link" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;cursor:pointer" data-island-library type="button">搜尋這座島的全部教材 <span>↗</span></button><a class="panel-index-link" href="${island.id}/" target="_blank" rel="noopener">原專區完整目錄 <span>↗</span></a>`;}
 panel.scrollTop=0;
}
$('island-panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-sea'))route();else if(b.hasAttribute('data-island-home'))route(currentIsland.id);else if(b.dataset.topic)route(currentIsland.id,b.dataset.topic);else if(b.dataset.lesson)openLesson(catalog.find(l=>l.id===b.dataset.lesson));else if(b.hasAttribute('data-island-library'))openLibrary(currentIsland.id);});
function openLesson(l){if(l)route(l.island,l.topic,l);}
function renderReader(lesson){const reader=$('reader'),frame=$('lesson-frame');reader.hidden=!lesson;document.querySelector('.site-header').inert=!!lesson;document.querySelector('.skip-link').inert=!!lesson;$('experience').inert=!!lesson;scene?.setPaused(!!lesson);if(!lesson){if(frame.getAttribute('src')){frame.removeAttribute('src');$('back-to-sea').focus({preventScroll:true});}return;}
 const island=ISLANDS.find(i=>i.id===lesson.island),topic=island.topics.find(t=>t.id===lesson.topic);
 $('reader-title').textContent=lesson.title;$('reader-island').textContent=`${island.name} ／ ${topic.name}`;$('reader-external').href=lesson.kind?new URL('assets/islands/document.html?'+new URLSearchParams({file:lesson.path}),baseURL).href:lessonURL(lesson.path);frame.title=lesson.title;$('reader-loading').hidden=false;
 $('reader-siblings').innerHTML=`<h3>${topic.name} · 同主題教材</h3>`+islandLessons(island.id,topic.id).map(l=>`<button type="button" data-lesson="${l.id}" ${l.id===lesson.id?'aria-current="page"':''}>${escapeHTML(l.title)}</button>`).join('');
 frame.src=lesson.kind?new URL('assets/islands/document.html?'+new URLSearchParams({file:lesson.path}),baseURL).href:lessonURL(lesson.path);$('reader-back').focus({preventScroll:true});announce(`正在閱讀：${lesson.title}`);
}
$('reader-siblings').addEventListener('click',e=>{const b=e.target.closest('[data-lesson]');if(b)openLesson(catalog.find(l=>l.id===b.dataset.lesson));});
$('lesson-frame').addEventListener('load',()=>{
 $('reader-loading').hidden=true;
 try{const doc=$('lesson-frame').contentDocument;if(!doc)return;doc.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||a.hasAttribute('download')||a.target==='_blank')return;const u=new URL(a.href);if(u.origin!==location.origin)return;const relative=decodeURI(u.pathname).replace(decodeURI(baseURL.pathname),'');const found=catalog.find(l=>decodeURI(l.path)===relative||decodeURI(l.path)+'index.html'===relative);
  if(found&&u.hash===''){e.preventDefault();openLesson(found);return;}
  const zone=ISLANDS.find(i=>relative===i.id+'/'||relative===i.id+'/index.html');if(zone){e.preventDefault();route(zone.id);}else if(relative===''||relative==='index.html'){e.preventDefault();route();}
 },true);}catch{}
});
function applyRoute(){const [raw,query='']=location.hash.slice(1).split('?'),parts=raw.split('/');const island=ISLANDS.find(i=>i.id===parts[0])||null;const topic=island?.topics.find(t=>t.id===parts[1])||null;const lessonPath=new URLSearchParams(query).get('lesson');const lesson=catalog.find(l=>l.path===lessonPath&&l.island===island?.id&&l.kind!=='youtube')||null;const viewId=island?.id||null;
 document.body.classList.toggle('on-island',!!island);document.body.classList.toggle('video-island',island?.type==='youtube');$('back-to-sea').hidden=!island;$('introduction').setAttribute('aria-hidden',String(!!island));$('introduction').inert=!!island;document.querySelector('.map-name').textContent=island?island.name+' ／ '+island.title:'海域全覽 ／ 五島，自由探索';$('start-exploring').tabIndex=island?-1:0;
 document.querySelectorAll('.nav-island').forEach(b=>{if(b.dataset.island===viewId)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const panelChanged=currentIsland?.id!==viewId||currentTopic?.id!==topic?.id||$('island-panel').hidden;
 currentIsland=island;currentTopic=topic;
 if(panelChanged)renderPanel(island,topic);
 if(island&&!visited.includes(island.id)){visited.push(island.id);try{localStorage.setItem('qq-sea-visited',JSON.stringify(visited));}catch{}}
 scene?.setVisited(visited);
 const viewKey=viewId+'/'+(topic?.id||'');if(lastView!==viewKey){scene?.setView(viewId,topic?.id||null);lastView=viewKey;}
 if(currentLesson?.path!==lesson?.path||(!lesson&&!$('reader').hidden))renderReader(lesson);
 currentLesson=lesson;
 document.title=lesson?`${lesson.title}｜QQ 知識海域`:island?`${island.name}・${topic?.name||island.title}｜QQ 知識海域`:'QQ 知識海域｜讓好奇心領航';
 if(!lesson)announce(island?`已抵達${island.title}${topic?'，'+topic.name:''}`:'已返回五島海域全覽');
}
function openLibrary(filter='all'){libraryFilter=filter;$('library-search').value='';renderLibrary();$('library-dialog').showModal();$('library-search').focus();}
function renderLibrary(){const q=$('library-search').value.trim().toLocaleLowerCase();const tokens=q.split(/\s+/).filter(Boolean);const results=catalog.filter(l=>(libraryFilter==='all'||l.island===libraryFilter)&&tokens.every(t=>(l.title+' '+l.description+' '+l.path+' '+ISLANDS.find(i=>i.id===l.island).name).toLocaleLowerCase().includes(t)));
 $('library-filters').innerHTML=[{id:'all',name:'全部海域'},...ISLANDS].map(i=>`<button type="button" class="filter-button" data-filter="${i.id}" aria-pressed="${libraryFilter===i.id}">${i.name}</button>`).join('');
 $('library-count').textContent=`${results.length} 份教材${q?' · 搜尋「'+$('library-search').value.trim()+'」':''}`;
 $('library-results').innerHTML=results.length?results.map(l=>{const i=ISLANDS.find(i=>i.id===l.island);return `${l.kind==='youtube'?`<a class="search-result" href="${escapeHTML(l.path)}" target="_blank" rel="noopener noreferrer" style="${colorStyle(i)}">`:`<button class="search-result" type="button" data-lesson="${l.id}" style="${colorStyle(i)}">`}<span>${i.name}</span><div><strong>${escapeHTML(l.title)}</strong><small>${escapeHTML(l.description||i.topics.find(t=>t.id===l.topic)?.subtitle)}</small></div><span>↗</span>${l.kind==='youtube'?'</a>':'</button>'}`;}).join(''):'<p class="empty-search">這片海域還沒有找到符合的教材。<br>試試較短的關鍵字，或切換到全部海域。</p>';
}
$('library-search').addEventListener('input',renderLibrary);$('library-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){libraryFilter=b.dataset.filter;renderLibrary();}});$('library-results').addEventListener('click',e=>{const b=e.target.closest('[data-lesson]');if(b){$('library-dialog').close();openLesson(catalog.find(l=>l.id===b.dataset.lesson));}});
$('library-dialog').addEventListener('click',e=>{if(e.target===$('library-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
document.querySelector('[data-close-library]').addEventListener('click',()=>$('library-dialog').close());
$('open-library').addEventListener('click',()=>openLibrary());$('start-exploring').addEventListener('click',()=>route('linux'));$('back-to-sea').addEventListener('click',()=>route());$('reader-back').addEventListener('click',()=>route(currentIsland?.id,currentTopic?.id));
$('zoom-in').addEventListener('click',()=>scene?.zoom(1.18));$('zoom-out').addEventListener('click',()=>scene?.zoom(1/1.18));$('reset-view').addEventListener('click',()=>scene?.setView(currentIsland?.id||null,currentTopic?.id||null));
$('motion-toggle').addEventListener('click',()=>{if(!scene)return;scene.setMotion(!scene.motion);updateMotion();});
function updateMotion(){const v=scene?.motion??false;$('motion-toggle').setAttribute('aria-pressed',String(v));$('motion-label').textContent='海域動態 '+(v?'開':'關');}
window.addEventListener('hashchange',applyRoute);window.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)&&!$('library-dialog').open){e.preventDefault();openLibrary();}if(e.key==='Escape'&&!$('library-dialog').open){if(currentLesson)route(currentIsland.id,currentTopic?.id);else if(currentTopic)route(currentIsland.id);else if(currentIsland)route();}});
renderNavigation();
try{
 const sources=[new URL('./catalog.json',import.meta.url)];
 for(const source of sources){
  try{
   const options={cache:'no-cache'};
   const response=await fetch(source,options);
   if(!response.ok)throw new Error(`教材索引載入失敗：${response.status}`);
   const lessons=await response.json();
   if(!Array.isArray(lessons)||!lessons.length||!lessons.every(l=>l.id&&l.path&&l.island&&l.topic))throw new Error('教材索引格式不正確');
   catalog=lessons;
   break;
  }catch(error){console.warn('教材索引來源無法使用',source,error);}
 }
 if(!catalog.length)throw new Error('所有教材索引來源皆無法使用');
}catch(error){$('library-count').textContent='教材索引暫時無法載入，請從原專區目錄閱讀。';console.error(error);}
catalog=[...catalog.filter(l=>l.island!=='youtube'),...VIDEO_CATALOG];
applyRoute();
try{const {createSea}=await import('./scene.js');scene=createSea({container:$('world'),labelLayer:$('world-labels'),onIsland:id=>route(id),onTopic:(id,topic)=>route(id,topic)});lastView=null;applyRoute();scene.setPaused(!!currentLesson);updateMotion();requestAnimationFrame(()=>requestAnimationFrame(()=>{$('scene-loader').classList.add('leaving');setTimeout(()=>$('scene-loader').hidden=true,650);}));}
catch(error){console.error('3D 場景無法啟動',error);$('scene-loader').hidden=true;$('fallback').hidden=false;$('exploration-hint').textContent='選擇專區，閱讀完整教材';$('zoom-in').disabled=true;$('zoom-out').disabled=true;$('reset-view').disabled=true;$('motion-toggle').disabled=true;updateMotion();}
