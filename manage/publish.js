const repository='https://github.com/qqnice/qqnice.github.io';
const $=id=>document.getElementById(id);
let published=null;
const short=sha=>sha.slice(0,7);
async function loadPublished(){
 try{
  const response=await fetch('../site-version.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Version unavailable');
  const data=await response.json();
  if(!/^[0-9a-f]{40}$/.test(data.commit))throw new Error('Invalid version');
  published=data;
  $('published-version').textContent=short(data.commit);
  const time=new Date(data.builtAt);
  $('published-time').textContent=Number.isNaN(time.getTime())?'':'此版本建置時間：'+new Intl.DateTimeFormat('zh-TW',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Taipei'}).format(time)+'（臺北）';
  $('resource-count').textContent=Number.isInteger(data.catalogCount)?'教材索引 '+data.catalogCount+' 份，另有 YouTube 精選入口。':'';
  if(/^\d+$/.test(String(data.runId||''))){$('published-run').href=repository+'/actions/runs/'+data.runId;$('published-run').hidden=false;}
 }catch{
  $('published-version').textContent='目前版本尚無發布紀錄';
  $('published-time').textContent='首次使用新的手動發布流程後，這裡就會顯示版本資訊。';
 }
}
const ready=loadPublished();
$('check-update').addEventListener('click',async()=>{
 const button=$('check-update');button.disabled=true;$('update-status').textContent='正在檢查 GitHub…';
 try{
  await ready;
  const response=await fetch('https://api.github.com/repos/qqnice/qqnice.github.io/commits/master',{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok)throw new Error('GitHub '+response.status);
  const data=await response.json();
  if(!/^[0-9a-f]{40}$/.test(data.sha))throw new Error('Invalid commit');
  $('update-status').textContent=published?.commit===data.sha?'網站已是 GitHub 最新版本。':published?'GitHub 有新版 '+short(data.sha)+'，尚未發布。':'GitHub 最新版為 '+short(data.sha)+'，可用手動發布建立版本紀錄。';
  $('latest-commit').href=repository+'/commit/'+data.sha;$('latest-commit').hidden=false;
 }catch{
  $('update-status').textContent='暫時無法檢查 GitHub，請稍後再試，或直接開啟發布頁面。';
 }finally{button.disabled=false;}
});
