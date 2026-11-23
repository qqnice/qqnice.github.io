let ctx;export let enabled=true;
export function toggleAudio(){enabled=!enabled;return enabled}
export function chime(end=false){
 if(!enabled)return;try{
 ctx??=new AudioContext();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
 const now=ctx.currentTime;
 for(const [i,f] of (end?[392,494,587]:[523,659]).entries()){
 let o=ctx.createOscillator(),g=ctx.createGain(),t=now+i*.065;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.11)
 }
 }catch{/* Audio is optional on browsers with restricted output. */}
}
