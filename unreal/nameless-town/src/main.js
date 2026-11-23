import {World} from './world.js';
import {orb,portrait,sprite,brush} from './art.js';
import {createState,recordVisit} from './ethicsState.js';
import {chapters} from './chapters.js';
import {chime,toggleAudio} from './audio.js';
const $=id=>document.getElementById(id),canvas=$('world'),world=new World(canvas),state=createState();
const keys=new Set(),modal=$('modal'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let mode='explore',active=null,line=0,lastNearby,wasMet=false,previous=0;
const icon=name=>'<svg><use href="#i-'+name+'"/></svg>';
const logo=$('logo').getContext('2d'),{r,p}=brush(logo);
p([[4,23],[10,21],[15,24],[21,21],[26,23],[23,26],[7,26]],'#a58870');r(12,25,6,3,'#ab9187');r(7,28,16,2,'#d2b59d');r(5,30,20,1,'#8a6e79');orb(logo,15,13,1.12);
portrait($('portrait').getContext('2d'));
function setMode(m){mode=m;keys.clear();world.step=0}
function playerFocus(){canvas.focus({preventScroll:true})}
function setSpeaker(target){
 const art=$('speakerArt');art.replaceChildren();
 if(!target?.kind){art.textContent=target?'◈':'✦';return}
 const pic=document.createElement('canvas');pic.width=32;pic.height=32;sprite(pic.getContext('2d'),16,30,target.kind);art.append(pic);
}
function hint(force=false){
 if(mode!=='explore')return;
 const n=world.nearby(),met=state.visited.has('guard');
 if(!force&&n===lastNearby&&met===wasMet)return;
 lastNearby=n;wasMet=met;setSpeaker(n);
 $('speaker').textContent=n?n.name:'探索提示';
 $('speech').textContent=n?'按 E 鍵或點選互動，'+(n.kind?'與'+n.name+'交談。':'調查'+n.name+'。'):met?'自由探索廣場，拜訪商人、鎮民或調查水晶球與記憶庫。':'沿著石板路向北走，尋找頭上有驚嘆號的鎮門守衛。';
 $('action').disabled=!n;$('action').querySelector('span').textContent='互動';
}
function updateQuest(){
 if(!state.visited.has('guard'))return;
 $('qType').textContent='主線任務 · 已完成';$('qTitle').textContent='初抵無名之鎮';$('qText').textContent='守衛已為你指路。你可以繼續走訪廣場，將見聞記入日誌。';
 $('objective').innerHTML='<b>✓</b> 與鎮門守衛交談 <small>1/1</small>';
}
function interact(){
 if(modal.open)return;
 if(mode==='explore'){
   active=world.nearby();if(!active)return;
   setMode('dialogue');line=0;setSpeaker(active);$('action').disabled=false;
 }else if(mode==='dialogue'){
   if(++line>=active.lines.length){
     recordVisit(state,active);updateQuest();active=null;setMode('explore');hint(true);chime(true);playerFocus();return;
   }
 }else return;
 $('speaker').textContent=active.name+'  ·  '+(line+1)+' / '+active.lines.length;
 $('speech').textContent=active.lines[line];$('action').querySelector('span').textContent=line+1===active.lines.length?'結束':'繼續';chime();
}
$('action').onclick=interact;$('touchTalk').onclick=interact;
function renderMap(selected){
 const body=$('modalBody');body.replaceChildren();
 const list=document.createElement('div');list.className='stage-list';
 chapters.forEach((chapter,i)=>{const b=document.createElement('button');b.classList.toggle('selected',i===selected);b.setAttribute('aria-pressed',String(i===selected));b.innerHTML='<b>0'+(i+1)+'</b>'+chapter.title+'<small>'+(i===0?'探索中':'設計預覽')+'</small>';b.onclick=()=>{renderMap(i);$('modalBody').querySelector('.selected').focus()};list.append(b)});
 const n=chapters[selected],detail=document.createElement('section');detail.className='detail';detail.innerHTML='<h3>'+n.title+'</h3><p>'+n.description+'</p><small>'+n.control+'</small>';body.append(list,detail);
}
function overlay(tab,selected=0){
 keys.clear();world.step=0;
 if(tab==='world'){if(modal.open)modal.close();else playerFocus();return}
 document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 $('modalTitle').textContent=tab==='map'?'關卡地圖':'審計日誌';$('modalCode').textContent=tab==='map'?'CHAPTER MAP':'AUDIT LOG';
 if(tab==='map')renderMap(selected);
 else{
   const body=$('modalBody');body.replaceChildren();
   const summary=document.createElement('p');summary.className='empty';summary.textContent='廣場見聞 '+state.visited.size+' / 5　·　本次探索';body.append(summary);
   if(!state.records.length){const p=document.createElement('p');p.className='detail';p.textContent='完成與居民的對話，或調查地標後，見聞會記錄在這裡。';body.append(p)}
   for(const item of state.records){const row=document.createElement('article');row.className='record';const h=document.createElement('h3'),p=document.createElement('p');h.textContent=item.name;p.textContent=item.text;row.append(h,p);body.append(row)}
 }
 if(!modal.open)modal.showModal();$('close').focus();
}
modal.addEventListener('close',()=>{document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.tab==='world'));playerFocus()});
$('close').onclick=()=>modal.close();
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>overlay(b.dataset.tab));
chapters.forEach((n,i)=>{const b=document.createElement('button');b.className='node'+(i===0?' on':'');b.textContent='0'+(i+1);b.setAttribute('aria-label','關卡 '+(i+1)+' '+n.title);b.onclick=()=>overlay('map',i);$('nodes').append(b)});
$('sound').onclick=()=>{let on=toggleAudio();$('sound').innerHTML=icon(on?'sound':'muted');$('sound').setAttribute('aria-label',on?'關閉音效':'開啟音效');$('sound').setAttribute('aria-pressed',String(on));if(on)chime()};
function zoom(toggle){$('playPanel').classList.toggle('zoom',toggle);$('expand').setAttribute('aria-label',toggle?'還原遊戲畫面':'放大遊戲畫面');playerFocus()}
$('expand').onclick=()=>zoom(!$('playPanel').classList.contains('zoom'));
const moves=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
window.addEventListener('keydown',ev=>{
 if(ev.metaKey||ev.ctrlKey||ev.altKey)return;
 const k=ev.key.toLowerCase();
 if(modal.open)return;
 if(k==='escape'&&$('playPanel').classList.contains('zoom')){zoom(false);return}
 if(k==='tab'&&!ev.shiftKey&&(document.activeElement===canvas||document.activeElement===document.body)){ev.preventDefault();overlay('journal');return}
 if(k===' '&&ev.target.closest('button'))return;
 if(moves.has(k)){ev.preventDefault();if(mode==='explore')keys.add(k)}
 if(k==='e'||k===' '){ev.preventDefault();if(!ev.repeat)interact()}
});
window.addEventListener('keyup',ev=>keys.delete(ev.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
canvas.addEventListener('pointerdown',playerFocus);
document.querySelectorAll('[data-key]').forEach(b=>{
 const key=b.dataset.key;b.addEventListener('pointerdown',ev=>{ev.preventDefault();if(mode==='explore')keys.add(key);b.setPointerCapture(ev.pointerId)});
 for(const e of ['pointerup','lostpointercapture','pointercancel'])b.addEventListener(e,()=>keys.delete(key));
});
const axis=(positive,negative)=>Number(positive.some(k=>keys.has(k)))-Number(negative.some(k=>keys.has(k)));
function frame(ts){
 const dt=Math.min((ts-previous)/1000,.04);previous=ts;
 if(mode==='explore'&&!modal.open){world.move(axis(['d','arrowright'],['a','arrowleft']),axis(['s','arrowdown'],['w','arrowup']),dt);hint()}
 world.render(reduce?0:ts/1000,state.visited.has('guard'));requestAnimationFrame(frame);
}
hint(true);requestAnimationFrame(frame);
