#!/usr/bin/env python3
"""Generate the local teaching catalog from actual source pages. No remote access."""
from html.parser import HTMLParser
from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
class Metadata(HTMLParser):
 def __init__(self):
  super().__init__();self.tag=None;self.parts=[];self.title='';self.heading='';self.description=''
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t in ('title','h1') and self.tag is None:self.tag=t;self.parts=[]
  if t=='meta' and a.get('name')=='description':self.description=a.get('content','')
 def handle_data(self,d):
  if self.tag:self.parts.append(d)
 def handle_endtag(self,t):
  if t==self.tag:
   value=' '.join(' '.join(self.parts).split())
   if t=='title':self.title=value
   elif not self.heading:self.heading=value
   self.tag=None

def topic_for(zone,path):
 s=path.lower()
 if zone=='linux':
  if 'graylog' in s:return 'logs'
  if 'week3' in s:return 'lab'
  if any(x in s for x in ['docker','多網站','week2']):return 'docker'
  return 'tools'
 if zone=='unreal':
  if any(x in s for x in ['elevator','unrealev']):return 'elevator'
  if '02-' in s:return 'blueprint'
  if '03-' in s:return 'debug'
  return 'start'
 if zone=='tpr':
  if '01-what' in s:return 'question'
  if 'ai-research-workflow/execution' in s:return 'outcomes'
  if 'ai-research-workflow' in s:return 'research'
  if any(x in s for x in ['travel','speech','other/','w聽障']):return 'outcomes'
  return 'library'
 if any(x in s for x in ['03-safety','ai-assessment']):return 'verify'
 if any(x in s for x in ['admission/','dialer/']):return 'events'
 if any(x in s for x in ['evaluation','subsidies','expense','schedule']):return 'daily'
 return 'command'

OVERRIDES={
'linux/容器Docker-Compose 初體驗.html':('WEEK1｜容器 Docker-Compose 初體驗','從第一個容器開始，建立 Docker 的基本操作能力。'),
'linux/Docker Compose 雙網站部署實戰.html':('WEEK2｜Docker Compose 雙網站部署','以 Nginx 與多個網站練習部署與服務整合。'),
'linux/week2-webstack/操作指令.html':('WEEK2｜實際操作指令與範例','雙網站部署紀錄，附 Compose、Nginx 設定與網站範例。'),
'linux/week3/index.html':('WEEK3｜Docker Lab 實作工作台','備份、還原與主機安全的互動式學習工作台。'),
'linux/files/week3/檢查.html':('WEEK3｜完成檢查表','逐項核對課堂實作，檢查備份、還原與安全設定。'),
'unreal/unrealev/index.html':('ElevatorKit 學生操作手冊','由四個實作關卡，逐步建立電梯的完整行為。'),
'unreal/elevator-state-lab/index.html':('電梯狀態實驗室','透過樓層呼叫、擋門與單步觀察理解狀態切換。'),
'unreal/elevator-fsm-lab/index.html':('電梯狀態機｜聲光與藍圖實驗室','結合聲光、關卡切換、白線追蹤與接線 Bug 診所。'),
 'tpr/ai-research-workflow/index.html':('AI 協助研究的工作流','從研究發想、文獻驗證到計畫撰寫，附研究教材與工具。'),
 'tpr/ai-research-workflow/execution.html':('研究執行與文章發表工作台','研究啟動、資料紀錄、成果報告、投稿與修訂。'),
 'admin/admission/index.html':('十個 AI 小幫手｜招生行政工作流','透過活動案例，學習從建檔、報名到成果回收的分工。'),
 'admin/teacher-evaluation/index.html':('AI 整理教師評鑑與日常資料','教學、研究、服務資料的整理與查核。'),
 'admin/schedule-war-room/index.html':('進階課表比對戰情表','跨單位課表比較、兼職合併與快取重用。'),
 'admin/expense-vouchers/index.html':('信用卡帳單與支出證明單','交易款與手續費拆分，套用原始 Word 範本。'),
 'admin/hesp-subsidies/index.html':('高教補助方案公告總覽','把分散的補助公告整理成清楚的戰情表。'),
 'admin/ai-assessment/index.html':('AI 時代評量探索與來源交互驗證','以文獻、數據與思考日誌探索評量革新。'),
 'admin/dialer/index.html':('考生聯絡半自動撥號劇場','以 3D 接線與語音互動展示電腦撥號、真人對話的流程。'),
}
items=[]
for zone in ['linux','unreal','tpr','admin']:
 for f in sorted((ROOT/zone).rglob('*.html')):
  rel=f.relative_to(ROOT).as_posix()
  if any(x in rel for x in ['_files/','_Gemini','week2-webstack/site/','week2-webstack/site-knet/']):continue
  if rel==zone+'/index.html' or rel=='tpr/materials/index.html':continue
  text=f.read_text(errors='replace');m=Metadata();m.feed(text)
  fm={}
  if text.startswith('---'):
   for l in text.split('---',2)[1].splitlines():
    if ':' in l:
     k,v=l.split(':',1);fm[k]=v.strip().strip('\"\'')
  title,desc=OVERRIDES.get(rel,(fm.get('title') or m.heading or m.title or f.stem,fm.get('description') or m.description))
  title=re.sub(r'^[^\w\u4e00-\u9fff]+','',title).strip()[:110]
  url=rel[:-10] if rel.endswith('index.html') else rel
  items.append({'id':str(len(items)+1),'island':zone,'topic':topic_for(zone,rel),'title':title,'description':desc[:220],'path':url})
# Add teaching handouts and downloadable resources, while excluding app internals.
text_extensions={'.md','.sh','.yml','.yaml','.py','.csv'}
resource_extensions=text_extensions|{'.pdf','.docx','.pptx','.xlsx','.zip'}
documents=ROOT/'assets/islands/documents';documents.mkdir(exist_ok=True)
for zone in ['linux','unreal','tpr','admin']:
 for f in sorted((ROOT/zone).rglob('*')):
  if not f.is_file() or f.suffix.lower() not in resource_extensions:continue
  rel=f.relative_to(ROOT).as_posix()
  if any(x in rel for x in ['_files/','week2-webstack/site/','week2-webstack/site-knet/']):continue
  ext=f.suffix.lower();title=f.stem;desc='可下載的課程資源';kind='download'
  item={'id':str(len(items)+1),'island':zone,'topic':topic_for(zone,rel),'title':title,'description':desc,'path':rel}
  if ext in text_extensions:
   raw=f.read_text(errors='replace');kind='markdown' if ext=='.md' else 'code'
   if kind=='markdown':
    match=re.search(r'^#\s+(.+)',raw,re.M)
    if match:title=match[1].strip()
   target=hashlib.sha256(rel.encode()).hexdigest()[:16]+'.txt'
   (documents/target).write_text(raw)
   item['textPath']='assets/islands/documents/'+target
   desc='課程講義，可直接閱讀與下載原始文字。' if kind=='markdown' else '課堂實作用原始檔，可檢視內容並下載。'
  else:desc={'docx':'Word 文件','pptx':'PowerPoint 投影片','xlsx':'Excel 試算表','zip':'ZIP 技能包','pdf':'PDF 文件'}.get(ext[1:],'課程資源')+'，可下載使用。'
  if zone=='tpr' and any(x in f.name for x in ['17-','18-']):item['topic']='outcomes'
  resource_titles={'backup.sh':'備份腳本 backup.sh','restore.sh':'還原腳本 restore.sh','compose.yml':'Docker Compose 部署設定','10-tpr-abstracts.xlsx':'教學實踐研究成果摘要表','12-ai-assessment-review.docx':'AI 評量設計檢視報告','18-execution-publication-slides.pptx':'研究執行與文章發表｜教學投影片','支出證明單_skill.zip':'支出證明單｜可下載技能包'}
  if kind=='code':title=f.name
  title=resource_titles.get(f.name,title)
  item.update(title=title,description=desc,kind=kind,format=ext[1:].upper());items.append(item)
priority=['Docker概念與簡介.html','02QQdocker廚房.html','容器Docker-Compose 初體驗.html','Docker Compose 雙網站部署實戰.html','week2-webstack/操作指令.html','week3/index.html','files/week3/檢查.html','03多網站部署.html','unrealev/index.html','elevator-state-lab/index.html','elevator-fsm-lab/index.html']
for item in items:
 rel=item['path']+'index.html' if item['path'].endswith('/') else item['path']
 item['order']=next((i for i,p in enumerate(priority) if rel.endswith('/'+p)),99)
(ROOT/'assets/islands/catalog.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
print('Catalog:',len(items),'teaching pages and resources')
for z in ['linux','unreal','tpr','admin']:print(z,sum(i['island']==z for i in items))
