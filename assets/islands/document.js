import { marked } from './vendor/marked.esm.js';
import DOMPurify from './vendor/purify.es.mjs';
const root=new URL('../../',import.meta.url),file=new URLSearchParams(location.search).get('file');
const title=document.getElementById('document-title'),body=document.getElementById('document-body'),download=document.getElementById('document-download');
try{
 const response=await fetch(new URL('catalog.json',import.meta.url));if(!response.ok)throw new Error('無法載入教材索引');
 const catalog=await response.json(),entry=catalog.find(l=>l.path===file&&l.kind);if(!entry)throw new Error('找不到這份課程資源');
 document.title=entry.title+'｜QQ 知識海域';title.textContent=entry.title;document.getElementById('document-format').textContent=entry.format+' ／ 課程資源';
 const resource=new URL(entry.path,root);download.href=new URL(entry.textPath||entry.path,root).href;download.download=entry.path.split('/').pop();
 if(entry.kind==='download'){
  const card=document.createElement('section');card.className='download-card';const format=document.createElement('span');format.className='file-format';format.textContent=entry.format;
  const description=document.createElement('p');description.textContent=entry.description;const button=document.createElement('a');button.className='download-primary';button.href=resource.href;button.download=download.download;button.textContent='下載 '+entry.format+' 檔案 ↓';
  card.append(format,description,button);body.append(card);
 }else{
  const response=await fetch(new URL(entry.textPath,root));if(!response.ok)throw new Error('無法讀取教材檔案');const text=await response.text();
  if(entry.kind==='markdown'){body.innerHTML=DOMPurify.sanitize(marked.parse(text));if(body.firstElementChild?.tagName==='H1')body.firstElementChild.remove();}else{const pre=document.createElement('pre'),code=document.createElement('code');code.textContent=text;pre.append(code);body.append(pre);}
  body.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');if(href.startsWith('#'))return;const u=new URL(href,resource);if(!['http:','https:','mailto:'].includes(u.protocol)){a.removeAttribute('href');return;}a.href=u.href;if(u.origin!==location.origin){a.target='_blank';a.rel='noopener';}});
  body.querySelectorAll('img[src]').forEach(img=>{const u=new URL(img.getAttribute('src'),resource);if(['http:','https:'].includes(u.protocol))img.src=u.href;else img.remove();});
 }
}catch(error){title.textContent='這份教材暫時無法開啟';body.textContent=error.message+'。請返回所屬島嶼重新選擇。';download.hidden=true;}
