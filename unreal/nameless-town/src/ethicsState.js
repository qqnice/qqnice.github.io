export function createState(){
  return {utility:0,privacy:0,security:0,consent:null,visited:new Set(),records:[]};
}
export function recordVisit(state,target){
  if(state.visited.has(target.id))return;
  state.visited.add(target.id);
  state.records.push({name:target.name,text:target.lines[0]});
}
