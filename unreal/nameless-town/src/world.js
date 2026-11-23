import {drawTown,W,H} from './landscape.js';
import {brush,sprite,orb} from './art.js';
export const people=[
 {id:'guard',name:'鎮門守衛',kind:'guard',x:231,y:103,lines:['旅人，歡迎來到無名之鎮。你胸前那枚徽章……你就是新來的迴路審計員？','看見廣場上的水晶球了嗎？這裡的居民只要投下一個願望，就能換來一點便利。','先去認識大家吧。商人在西邊的棚子旁，記憶庫就在東北方。']},
 {id:'merchant',name:'雜貨商人',kind:'merchant',x:105,y:177,lines:['來得正好！我的攤位賣燈油、蘋果，也收一些不值錢的小故事。','客人們都說水晶球記性好。依我看，它連你昨天想買什麼都記得。']},
 {id:'resident',name:'許願的鎮民',kind:'resident',x:311,y:154,lines:['我許願讓母親好起來。水晶球只問了她的名字，還有……幾個小問題。','它說這些話只有我們兩個知道。我希望是真的。']},
 {id:'orb',name:'全知水晶球',x:259,y:153,lines:['水面映著紫色微光。你靠近時，數十個微弱的聲音同時安靜下來。']},
 {id:'vault',name:'向量記憶庫',x:421,y:128,lines:['石門上刻著「向量記憶庫」。門後傳來低沉的迴音，像是有人把千百句願望一遍遍念給自己聽。']}
];
const walk=[[172,82],[328,82],[350,102],[442,104],[442,165],[391,208],[328,226],[280,227],[280,288],[225,288],[225,226],[151,212],[76,190],[76,117],[137,104]];
const solids=[[216,136,85,37],[376,80,96,45],[18,146,76,42],[167,153,26,12],[327,166,28,12],[130,125,26,12],[194,84,20,10],[298,84,21,10],[361,114,21,10]];
const lamps=[[147,130],[347,137],[202,212],[307,212],[222,88],[284,88],[101,180],[379,166]];
function inPolygon(x,y){
 let inside=false;
 for(let i=0,j=walk.length-1;i<walk.length;j=i++){
   let [a,b]=walk[i],[d,e]=walk[j];
   if((b>y)!==(e>y)&&x<(d-a)*(y-b)/(e-b)+a)inside=!inside;
 }
 return inside;
}
export function passable(x,y){
 return y<=282&&[-3,3].every(dx=>inPolygon(x+dx,y))&&
 !solids.some(([a,b,w,h])=>x+3>a&&x-3<a+w&&y+1>b&&y-1<b+h)&&
 !people.some(n=>n.kind&&Math.hypot(x-n.x,y-n.y)<7)&&
 !lamps.some(([a,b])=>Math.abs(x-a)<4&&Math.abs(y-b)<4);
}
export class World{
 constructor(canvas){
   this.c=canvas.getContext('2d');this.player={x:248,y:204,face:'down'};this.phase=0;this.step=0;
   this.bg=document.createElement('canvas');this.bg.width=W;this.bg.height=H;drawTown(this.bg.getContext('2d'));
 }
 move(dx,dy,dt){
   const n=Math.hypot(dx,dy),q=this.player;
   this.step=0;if(!n)return;
   q.face=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
   const v=53*dt/n;
   if(passable(q.x+dx*v,q.y))q.x+=dx*v;
   if(passable(q.x,q.y+dy*v))q.y+=dy*v;
   this.phase+=dt*11;this.step=Math.sin(this.phase);
 }
 nearby(){
   const q=this.player;
   return people.map(n=>[Math.hypot(n.x-q.x,n.y-q.y),n]).filter(([d,n])=>d<(n.id==='orb'?48:25)).sort((a,b)=>a[0]-b[0])[0]?.[1];
 }
 render(time,met){
   const c=this.c,{r,p,e}=brush(c);c.drawImage(this.bg,0,0);
   const glow=(x,y,radius,color)=>{let g=c.createRadialGradient(x,y,1,x,y,radius);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-radius,y-radius,radius*2,radius*2)};
   glow(259,114,26,'rgba(187,120,244,.39)');orb(c,259,115);
   for(let [x,y] of lamps)glow(x,y-17,13,'rgba(255,194,100,.19)');
   for(let i=0;i<12;i++){let phase=(time*.26+i*.161)%1,x=259+Math.round(Math.sin(i*2.2+phase)*17),y=124-Math.floor(phase*32);r(x,y,1,phase>.6?2:1,phase>.3?'#dfbff9':'#ac8fcc')}
   for(let i=0;i<17;i++){let x=(i*73+Math.round(time*3))%512,y=260+(i*17)%27;if(x<210||x>290)r(x,y,4,1,'#89a3a0')}
   const q=this.player;
   [...people.filter(n=>n.kind),{...q,kind:'player'}].sort((a,b)=>a.y-b.y).forEach(n=>sprite(c,n.x,n.y,n.kind,n.face,n.kind==='player'?this.step:0));
   const off=Math.round(Math.sin(time*3)*1.3);
   if(!met){let x=231,y=62+off;p([[x-5,y-5],[x+5,y-5],[x+5,y+4],[x+1,y+4],[x-1,y+7],[x-2,y+4],[x-5,y+4]],'#30293a');r(x-4,y-4,8,8,'#e2ba71');r(x-1,y-3,2,4,'#624d37');r(x-1,y+2,2,1,'#624d37')}
   let x=Math.round(q.x),y=Math.round(q.y)+3;
   r(x-3,y,7,1,'#cba7f7');r(x-2,y+1,5,1,'#9873c5');
   // Late-evening atmosphere preserves the contrast of paths and faces.
   const shade=c.createRadialGradient(253,139,51,250,143,306);shade.addColorStop(0,'rgba(36,29,56,0)');shade.addColorStop(1,'rgba(20,19,43,.32)');c.fillStyle=shade;c.fillRect(0,0,W,H);
 }
}
