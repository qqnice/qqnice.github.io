// All drawing uses integer coordinates on the native pixel grid.
export function random(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
}
export function brush(c) {
  const r = (x,y,w,h,k) => {c.fillStyle=k;c.fillRect(Math.round(x),Math.round(y),w,h)};
  // Scan-convert polygons into pixel rows to avoid blurred diagonals.
  const p = (pts,k) => {
    const ys=pts.map(a=>a[1]);
    for(let y=Math.floor(Math.min(...ys));y<Math.ceil(Math.max(...ys));y++){
      const hits=[];
      for(let i=0;i<pts.length;i++){
        const [x1,y1]=pts[i],[x2,y2]=pts[(i+1)%pts.length];
        if((y1<=y+.5 && y2>y+.5)||(y2<=y+.5 && y1>y+.5)) hits.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1));
      }
      hits.sort((a,b)=>a-b);
      for(let i=0;i<hits.length;i+=2) r(Math.round(hits[i]),y,Math.round(hits[i+1])-Math.round(hits[i]),1,k);
    }
  };
  const e=(x,y,rx,ry,k)=>{for(let j=-ry;j<=ry;j++){const d=Math.round(rx*Math.sqrt(Math.max(0,1-j*j/(ry*ry))));r(x-d,y+j,2*d+1,1,k)}};
  return {r,p,e};
}
export function orb(c,x,y,size=1) {
  c.save();c.translate(x,y);c.scale(size,size);
  const {r,p}=brush(c);
  p([[0,-10],[5,-8],[9,-4],[9,3],[5,8],[0,10],[-6,8],[-10,3],[-10,-3],[-7,-7]],'#382454');
  p([[-1,-9],[5,-7],[8,-3],[7,3],[3,7],[-3,8],[-8,3],[-8,-3],[-5,-7]],'#9462ce');
  p([[-1,-8],[5,-6],[2,-2],[-4,-1],[-6,-4]],'#e6b5ff');
  p([[5,-6],[8,-3],[6,2],[1,4],[2,-2]],'#b982f2');
  p([[-8,-2],[-4,-1],[1,4],[-2,7],[-7,3]],'#6941ad');
  p([[-4,-1],[2,-2],[1,4]],'#fae2ff');r(-5,-5,3,2,'#fff1ff');r(5,3,2,2,'#dca2fa');c.restore();
}
const robes={player:['#29213f','#453267','#79509a','#b792c8'],guard:['#292938','#4a5061','#858a92','#ccd0bd'],merchant:['#45302b','#86583b','#bd894f','#efc77b'],resident:['#203c43','#315a58','#669989','#9cbd92']};
export function sprite(c,x,y,kind='player',face='down',step=0){
  c.save();c.translate(Math.round(x),Math.round(y));const {r,p,e}=brush(c), [ink,shade,mid,hi]=robes[kind], walk=Math.sign(step);
  e(0,0,8,2,'#212930');c.translate(0,Math.abs(step)>.65?-1:0);
  r(-5,-4,4,4+walk,'#221e2c');r(2,-4,4,4-walk,'#221e2c');
  p([[-6,-14],[5,-14],[7,-9],[8,-3],[4,-2],[1,-3],[-2,-2],[-8,-3],[-7,-9]],ink);
  p([[-5,-14],[2,-14],[1,-9],[-3,-4],[-7,-4]],mid);
  p([[2,-13],[5,-12],[6,-6],[3,-4],[-1,-5]],shade);
  r(-6,-12,2,5,hi);r(-7,-8,2,3,'#c59172');r(5,-8,2,3,'#c59172');
  r(-5,-7,9,2,'#493a41');r(0,-7,2,2,'#d6ab64');
  p([[-6,-15],[-8,-19],[-6,-23],[-2,-26],[3,-25],[7,-21],[7,-16],[4,-13],[-3,-13]],ink);
  p([[-6,-16],[-6,-21],[-2,-24],[2,-24],[5,-21],[2,-19],[-3,-16]],mid);
  r(-3,-23,4,1,hi);r(-5,-21,3,2,hi);
  if(face!=='up'){
    const d=face==='left'?-2:face==='right'?2:0;
    r(-4+d,-19,8,4,'#493947');r(-3+d,-18,6,3,'#d2a889');r(-2+d,-17,1,1,'#372d37');r(1+d,-17,1,1,'#372d37');r(-2+d,-15,4,1,'#b78b77');
    p([[-5,-14],[4,-14],[1,-10],[-2,-12]],hi);
  }else{r(-4,-17,8,2,shade);r(-3,-12,7,6,'#674c3e');r(-3,-12,7,2,'#b49165')}
  if(kind==='guard'){r(7,-22,2,22,'#6b4f3e');p([[8,-28],[11,-22],[8,-20],[6,-22]],'#d0c2a2');r(-7,-20,14,2,'#c0a87f');r(1,-27,4,3,'#aa7567')}
  if(kind==='merchant'){r(-9,-20,17,2,hi);r(-4,-25,7,4,mid)}
  c.restore();
}
export function portrait(c){
  const {r,p}=brush(c);
  r(0,0,40,40,'#322c43');for(let j=0;j<40;j+=4) for(let i=j%8;i<40;i+=8)r(i,j,2,2,'#3b344e');
  c.save();c.translate(20,42);c.scale(1.65,1.65);sprite(c,0,0);c.restore();
  p([[3,37],[6,32],[10,29],[8,36]],'#7d60a0');
}
