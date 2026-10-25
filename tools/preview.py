#!/usr/bin/env python3
"""Local-only preview. Expands this repository's two Jekyll includes for reading.
GitHub Pages continues to use its normal Jekyll build; this is not a publisher.
"""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote,quote,urlsplit
import re,html,argparse
ROOT=Path(__file__).resolve().parents[1]
def listing(folder):
 directory=(ROOT/folder).resolve()
 if not directory.is_relative_to(ROOT):return ''
 entries=[]
 for p in sorted(directory.iterdir()):
  if p.name.startswith('.') or p.name in ('img','images') or '_files' in p.name:continue
  url=quote(p.name)+('/' if p.is_dir() else '')
  if p.is_dir() and not (p/'index.html').exists():continue
  entries.append('<li><a href="'+url+'">'+html.escape(p.name)+'</a></li>')
 return '<div class="file-list-box"><h3>教材與檔案</h3><ul>'+''.join(entries)+'</ul></div>'
def render(text):
 text=re.sub(r'^---\s*\n.*?\n---\s*\n','',text,count=1,flags=re.S)
 text=re.sub(r'{%\s*include zone-style.html\s*%}',lambda m:(ROOT/'_includes/zone-style.html').read_text(),text)
 text=re.sub(r'{%\s*capture helper_cta\s*%}.*?{%\s*endcapture\s*%}','',text,flags=re.S)
 text=re.sub(r'{%\s*include zone-listing.html folder="([^"]+)"[^%]*%}',lambda m:listing(m[1]),text)
 text=re.sub(r'{%\s*assign lp =.*?(?=<div class="author-box">)',lambda m:listing('linux'),text,flags=re.S)
 return text
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_GET(self):
  path=Path(self.translate_path(urlsplit(self.path).path)).resolve()
  if not path.is_relative_to(ROOT) or any(p.startswith('.') for p in path.relative_to(ROOT).parts):self.send_error(404);return
  if path.is_dir() and (path/'index.html').exists():
   if not urlsplit(self.path).path.endswith('/'):
    self.send_response(301);self.send_header('Location',urlsplit(self.path).path+'/');self.end_headers();return
   path=path/'index.html'
  if path.suffix=='.html' and path.exists():
   data=render(path.read_text(errors='replace')).encode();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
  else:super().do_GET()
 def log_message(self,*args):pass
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
 server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
 print('QQ Knowledge Sea preview: http://127.0.0.1:'+str(args.port)+'/',flush=True)
 try:server.serve_forever()
 except KeyboardInterrupt:server.server_close()
