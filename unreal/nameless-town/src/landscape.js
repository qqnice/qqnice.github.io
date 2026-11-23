import {brush,random,orb} from './art.js';
export const W=512,H=288;
export function drawTown(c){
  const {r,p,e}=brush(c), rng=random(18473);
  const ri=(a,b)=>Math.floor(rng()*(b-a+1))+a, pick=a=>a[ri(0,a.length-1)];
  const shadow=(x,y,w,h)=>e(x,y,w,h,'#253c3b');
  function brick(x,y,w,h,pal,bw=8,bh=4){
    r(x,y,w,h,pal[0]);for(let j=0;j<h;j+=bh){for(let i=-(j/bh%2)*(bw>>1);i<w;i+=bw){let a=Math.max(0,i),b=Math.min(w,i+bw-1);if(b>a)r(x+a,y+j,b-a,Math.min(bh-1,h-j),pick(pal.slice(1)))}}
  }
  function grass(x,y){let tone=pick(['#324a46','#3a5046','#4c5e4c','#3f594e','#2e4842']);r(x,y,ri(1,5),1,tone);if(rng()>.5)r(x+1,y-2,1,2,tone)}
  function pine(x,y,h){
    let w=Math.round(h*.34);r(x-2,y-h/3,4,Math.floor(h/3),'#352f31');r(x,y-8,2,8,'#59473c');
    for(let t=3;t>=0;t--){
      let top=y-h+t*h*.15,bot=top+h*(.33+.035*t),rad=w*(.46+t*.17);
      let pts=[[x,top],[x+rad*.56,top+(bot-top)*.58],[x+rad*.49,top+(bot-top)*.58],[x+rad,bot-2],[x+rad*.66,bot-2],[x+rad*.69,bot],[x+2,bot-1],[x-3,bot+2],[x-rad,bot],[x-rad*.78,bot-3],[x-rad*1.1,bot-2],[x-rad*.48,top+(bot-top)*.53],[x-rad*.57,top+(bot-top)*.53]];
      p(pts,'#1b3639');p([[x,top],[x+1,bot-7],[x-rad*.45,bot-4],[x-rad*.42,bot-7],[x-rad*.93,bot-3],[x-rad*.47,top+(bot-top)*.55],[x-rad*.55,top+(bot-top)*.55]],pick(['#345448','#39574b','#36564c']));
      for(let a=0;a<rad*.8;a++){let yy=ri(Math.floor(top+3),Math.floor(bot-4)),range=(yy-top)/(bot-top)*rad;r(x-ri(0,Math.max(0,range|0)),yy,ri(1,3),1,pick(['#476354','#40604d','#4c6656']))}
    }
  }
  r(0,0,W,H,'#344d45');for(let i=0;i<8200;i++)grass(ri(0,W),ri(0,H));
  const plaza=[[172,83],[328,83],[351,100],[426,104],[435,165],[391,206],[328,221],[290,226],[288,288],[211,288],[209,225],[151,211],[81,188],[77,117],[138,104]];
  const base=document.createElement('canvas');base.width=W;base.height=H;const bc=base.getContext('2d');const b=brush(bc);
  b.p(plaza,'#646566');bc.globalCompositeOperation='source-atop';
  for(let y=0;y<H;y+=4){let x=ri(-8,0);while(x<W){let w=ri(5,12);let col=pick(['#777976','#8a8780','#777b79','#827f79','#7c7c78','#8c8880','#727876']);b.r(x,y,w-1,3,col);if(rng()<.45)b.r(x+1,y,Math.max(2,w-4),1,'#92918a');x+=w}}
  c.drawImage(base,0,0);
  function shrub(x,y,s=1){e(x,y,5*s,3*s,'#283e39');e(x-2*s,y-s,3*s,2*s,'#46634f');r(x-3*s,y-2*s,3*s,s,'#658061')}
  for(let j=0;j<90;j++){let x=ri(0,511),y=ri(82,232);if(x<69||x>443){shrub(x,y);if(j%3===0)r(x,y-3,2,2,'#ab91ac')}}
  function riverY(x){return Math.floor((242+Math.sin(x/78)*5+Math.cos(x/33)*3)/2)*2}
  for(let x=0;x<W;x+=2){let y=riverY(x);r(x,y-4,2,4,'#728264');r(x,y,2,4,'#494f4b');r(x,y+4,2,4,'#353e42');r(x,y+8,2,3,'#719497');r(x,y+11,2,H-y,'#395f69')}
  for(let i=0;i<2200;i++){let x=ri(0,W),y=ri(238,H);if(y>riverY(x)+9)r(x,y,ri(2,13),1,pick(['#446e75','#547b7e','#609090','#355862','#325761','#496d75']))}
  // Timber bridge with stone abutments.
  r(221,231,63,57,'#31373b');for(let j=231;j<H;j+=5){r(223,j,59,4,pick(['#8b7863','#9b866f','#88745f']));r(224,j,57,1,'#b39e81');r(ri(226,252),j+2,ri(6,18),1,'#766658')}
  for(let x of [219,282]){r(x,231,4,57,'#544a43');r(x,231,2,57,'#b5a184');for(let y of [228,249,272]){r(x-1,y,6,11,'#5a4d45');r(x-2,y,8,3,'#c2ad8c')}}
  function fence(x,y,n){for(let i=0;i<n;i++){r(x+i*11,y-6,11,2,'#6e6555');r(x+i*11,y-3,11,1,'#ad9671');r(x+i*11,y-8,3,10,'#544d43');r(x+i*11,y-8,3,2,'#b6a080')}}
  fence(143,229,6);fence(301,231,7);
  const stone=['#545661','#777681','#83808a','#8e8892','#6b6d78'];
  function wall(x,y,w,h){
    brick(x,y,w,h,stone,11,5);r(x,y,w,3,'#aaa3a4');r(x,y+h-3,w,3,'#545961');
    for(let i=0;i<w;i+=13){r(x+i,y-6,8,7,'#777782');r(x+i,y-7,8,2,'#a6a0a0')}
  }
  for(let i=0;i<50;i++)pine(i*11+ri(-5,5),ri(22,44),ri(23,45));
  wall(0,30,512,30);
  // Moss follows mortar joints, with climbing ivy at the wall's edges.
  for(let i=0;i<210;i++){const x=ri(0,W),y=ri(32,58);if(x<183||x>321)r(x,y,ri(1,4),1,pick(['#727d72','#767881','#8b8990']))}
  for(const x of [9,124,177,326,353,475,498]){let a=x;for(let y=31;y<ri(46,58);y+=2){a+=ri(-2,2);r(a,y,2,3,'#49584f');r(a-2,y,3,2,'#698069');r(a+2,y+2,3,1,'#879077')}}
  function arch(x,y,w,h,color){p([[x,y+h],[x,y+7],[x+3,y+3],[x+w/2,y],[x+w-3,y+3],[x+w,y+7],[x+w,y+h]],color)}
  function window(x,y,w=8,h=13){arch(x-2,y-2,w+4,h+4,'#403c46');arch(x,y,w,h,'#d99754');r(x+2,y+4,w-4,h-4,'#f1ca77');r(x+(w>>1),y+1,1,h,'#766049');r(x,y+h-5,w,1,'#8b6541');r(x-2,y+h,w+4,2,'#afa294')}
  function roof(x,y,w,h,theme=0){
    const pal=theme?['#302d46','#45425c','#555370','#68637c','#827991']:['#3e304d','#514060','#665077','#785e84','#8e7295'];
    // Hipped shingle roof, each row clipped to its slope.
    const hip=Math.round(w*.18);
    for(let j=0;j<h;j++){let left=Math.floor(hip*(1-j/h)),right=w-left; r(x+left,y+j,right-left,1,pal[2]);}
    for(let j=0;j<h;j+=4){let left=Math.ceil(hip*(1-j/h)),right=w-left;for(let i=left;i<right;i+=6){let ww=Math.min(6,right-i);r(x+i,y+j,ww,1,pal[1]);if(ww>2){r(x+i,y+j+1,ww-1,1,pick(pal.slice(2)));r(x+i+(j%8===0?0:2),y+j+2,1,2,pal[1])}}}
    p([[x+w-hip,y],[x+w,y+h],[x+w-hip*1.65,y+h]],pal[1]);
    for(let j=4;j<h;j+=4){let a=x+w-hip-(j/h)*hip*.65,b=x+w-hip+(j/h)*hip;r(a,y+j,Math.floor(b-a),1,pal[2])}
    r(x+hip,y-1,w-2*hip,2,pal[4]);r(x-1,y+h,w+2,2,pal[0]);r(x,y+h+2,w,1,'#a18a92');
  }
  function tower(x,y,w,h){
    brick(x,y,w,h,stone,8,4);r(x+w-5,y,5,h,'#666572');r(x,y,2,h,'#98939b');
    window(x+(w>>1)-3,y+8,6,10);r(x-2,y+h-3,w+4,4,'#969198');
    roof(x-4,y-21,w+8,21,1);r(x+(w>>1),y-31,1,11,'#b3a39c');p([[x+(w>>1)+1,y-31],[x+(w>>1)+11,y-29],[x+(w>>1)+1,y-26]],'#a475a8')
  }
  // Northern gatehouse with inset portcullis and violet banners.
  wall(208,32,91,45);arch(231,40,44,37,'#b6aea7');arch(235,43,36,34,'#65646e');arch(238,46,30,31,'#292d37');
  for(let x=240;x<268;x+=5)r(x,52,1,17,'#646170');r(239,54,29,2,'#76717b');r(239,61,29,2,'#56545e');
  for(let x of [216,281]){r(x,43,9,23,'#624875');p([[x,62],[x+9,62],[x+4,69]],'#624875');r(x+4,48,1,10,'#bea3cb');r(x+2,51,5,2,'#bea3cb')}
  tower(192,36,23,45);tower(292,36,23,45);
  function chimney(x,y){brick(x,y,9,16,['#514d57','#8d7e7b','#a19286','#776b6a'],5,4);r(x-2,y-2,13,3,'#b4a397');r(x,y-3,9,2,'#55505a')}
  function dormer(x,y){r(x-7,y,15,14,'#a0968d');p([[x-10,y+2],[x,y-9],[x+11,y+2]],'#49374e');p([[x-7,y],[x,y-7],[x+8,y]],'#7f687f');window(x-3,y+2,6,8)}
  function home(x,y,w,h,theme=0){
    shadow(x+w/2+3,y+h,w*.57|0,7);brick(x,y,w,h,['#847d7c','#b9aaa0','#b3a69d','#a89c95','#b2a69c'],10,5);
    for(let i=3;i<w;i+=Math.floor(w/3)){r(x+i,y,3,h,'#64534e');r(x+i,y,1,h,'#8a7061')}
    r(x,y+5,w,3,'#675751');r(x,y+h-6,w,5,'#6d6667');r(x-2,y+h-2,w+4,3,'#9d9590');
    p([[x+5,y+8],[x+9,y+8],[x+23,y+22],[x+20,y+22]],'#79665c');
    r(x+w-8,y,8,h-4,'#888085');arch(x+(w>>1)-8,y+h-23,16,22,'#5b4b4c');arch(x+(w>>1)-5,y+h-20,10,19,'#776354');r(x+(w>>1)+2,y+h-10,2,2,'#e9bf75');
    for(let a of [x+10,x+w-19])window(a,y+h-24,9,14);
    roof(x-5,y-28,w+10,28,theme);dormer(x+w*.30|0,y-15);chimney(x+w-19,y-35);
  }
  home(19,72,90,39);home(109,56,52,32,1);home(376,74,96,49,1);dormer(434,58);
  // The archive's front gable frames a stained-glass star.
  p([[396,72],[419,43],[443,72]],'#42384e');
  p([[399,71],[419,47],[440,71]],'#a69ba5');
  p([[403,69],[419,51],[436,69]],'#655c72');
  p([[414,59],[419,54],[424,59],[424,66],[419,71],[414,66]],'#373a50');
  p([[416,59],[419,56],[422,59],[422,65],[419,68],[416,65]],'#ac91c4');
  r(419,57,1,10,'#e1b4dd');r(416,62,7,1,'#d8b1dd');
  r(394,72,51,3,'#62535d');r(395,72,49,1,'#c8b4aa');
  for(let x of [391,447]){
    r(x,80,8,20,'#624469');r(x+1,80,1,18,'#98739c');
    p([[x,98],[x+8,98],[x+4,104]],'#65476e');
    p([[x+4,84],[x+6,89],[x+4,93],[x+2,89]],'#cfb4c6');
  }
  for(let [x,y] of [[28,96],[86,96],[119,75]]){r(x,y,11,3,'#655146');for(let i=0;i<5;i++){r(x+i*2,y-2,3,2,'#64795d');r(x+i*2,y-3,1,1,i%2?'#ca9ab3':'#d3ba89')}}
  // Merchant's striped canopy, display counter and crates.
  home(6,148,68,32);
  for(let i=0;i<8;i++){let x=20+i*9,col=i%2?'#c6ad8a':'#855a60';p([[x+3,147],[x+12,147],[x+9,159],[x,159]],col);r(x,159,9,4,i%2?'#a68b72':'#704953');r(x+1,163,7,2,col)}
  r(22,165,3,23,'#6b5446');r(87,165,3,23,'#6b5446');r(22,176,66,11,'#796451');r(21,175,68,3,'#b79b76');for(let i=0;i<11;i++){e(28+i*5,173,3,2,pick(['#d5a15b','#986855','#879169']));r(27+i*5,171,1,1,'#d0bd83')}
  function crate(x,y){r(x,y,12,11,'#584b42');r(x+1,y+1,10,9,'#8f775b');for(let j=0;j<3;j++)r(x+2+j*3,y+2,1,7,'#79634e');r(x,y+2,12,2,'#b39770');r(x,y+8,12,2,'#ad916b')}
  crate(10,181);crate(86,184);crate(92,176);
  for(let [x,y,h] of [[2,85,57],[174,82,39],[337,80,51],[352,103,45],[491,102,61],[502,129,55],[7,124,48],[121,113,26],[460,161,44],[486,173,53],[473,206,49],[503,217,63],[17,220,43],[34,234,39],[415,220,37],[434,235,47],[107,232,28]])pine(x,y,h);
  // A stepped octagonal fountain with a carved crystal pedestal.
  const cx=259,cy=153;
  const oct=(x,y,rx,ry,k)=>p([[x-rx*.52,y-ry],[x+rx*.52,y-ry],[x+rx,y-ry*.46],[x+rx,y+ry*.46],[x+rx*.52,y+ry],[x-rx*.52,y+ry],[x-rx,y+ry*.46],[x-rx,y-ry*.46]],k);
  oct(cx+2,cy+5,41,22,'#555b61');oct(cx,cy+2,40,22,'#aba49e');oct(cx,cy,38,21,'#767782');oct(cx,cy-2,35,18,'#a9a4aa');oct(cx,cy-5,31,16,'#5d596d');oct(cx,cy-7,31,16,'#c1b6bc');oct(cx,cy-7,27,13,'#4e7886');oct(cx,cy-6,24,10,'#6593a0');
  for(let i=0;i<35;i++){let x=ri(-19,19),y=ri(-7,6);r(cx+x,cy-6+y,ri(1,5),1,pick(['#a7b6ba','#8fadc1','#9c9cc2']))}
  oct(cx,cy-9,10,5,'#776e83');oct(cx,cy-12,9,4,'#c4b7be');r(cx-5,cy-24,10,12,'#8b8394');r(cx-4,cy-23,3,10,'#c2b6c2');oct(cx,cy-24,10,4,'#ac95b4');oct(cx,cy-26,9,3,'#dac4ca');
  for(let [x,y] of [[147,130],[347,137],[202,212],[307,212],[222,88],[284,88],[101,180],[379,166]])lamp(x,y);
  function lamp(x,y){e(x,y,4,2,'#595959');r(x-1,y-15,3,15,'#403c40');r(x-3,y-1,7,2,'#464348');r(x-3,y-21,7,8,'#514746');r(x-2,y-20,5,6,'#eac07b');r(x-1,y-19,3,4,'#ffe3a3');p([[x-5,y-21],[x,y-26],[x+5,y-21]],'#4c4650');r(x-3,y-23,6,1,'#a69a85')}
  function planter(x,y){r(x,y,18,6,'#80766e');r(x-1,y-1,20,2,'#b2a593');for(let i=1;i<18;i+=3){shrub(x+i,y-2);r(x+i,y-5,2,2,pick(['#b49abd','#c4b397','#9d89ab']))}}
  planter(195,91);planter(299,91);planter(362,119);planter(134,105);
  function bench(x,y){r(x+2,y,2,6,'#594d43');r(x+19,y,2,6,'#594d43');r(x,y-5,24,3,'#967e68');r(x,y-2,24,1,'#b79c78');r(x,y+1,24,2,'#a18a70')}
  bench(168,160);bench(329,173);bench(131,132);
  // Flowering verges and reeds break up the paving and riverbank silhouettes.
  for(const [a,b,len] of [[62,216,42],[131,224,28],[323,217,34],[377,211,22],[155,96,19],[348,111,12]]){
    for(let i=0;i<len;i++){let x=a+ri(0,len),y=b+ri(-3,4);r(x,y-2,1,3,'#667d5b');r(x+1,y-1,2,1,'#7e896c');if(i%3===0)r(x,y-3,2,2,pick(['#b18ba7','#dec298','#d1a7bf']))}
  }
  for(let x of [54,72,119,156,351,371,400,449]){
    const y=riverY(x)+3;for(let j=0;j<6;j++){let a=x+ri(-4,4),h=ri(3,8);r(a,y-h,1,h,'#788261');r(a-1,y-h,1,3,'#b09771')}
  }
  for(let [x,y] of [[172,196],[364,193],[111,201],[392,135],[162,95]]){e(x,y,4,2,'#5b6960');r(x-2,y-2,5,2,'#97998a')}
  for(let [x,y,h] of [[-3,283,63],[22,289,60],[45,301,54],[480,294,66],[507,283,77]])pine(x,y,h);
  orb(c,cx,cy-38);
}
