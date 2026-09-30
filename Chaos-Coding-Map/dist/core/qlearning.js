function qKey(s, edge, to){ return `${s}>${to}>${edge.id}`; }
function rng(seed=0x9e3779b9){ let x=seed>>>0; return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}; }
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function baseReward(edge){
  const c=edge.confidence??.5;
  if(edge.kind==='source-backed annotation') return 3+4*c;
  if(edge.kind==='source-backed') return 2.5+3*c;
  if(edge.kind==='captured cross-link') return 2+4*c;
  if(edge.kind==='curated neighbor') return .45+c;
  if(edge.kind==='curated implementation bridge') return .55+c;
  if(edge.kind==='generated') return .35+.5*c;
  return 1+c;
}
export function trainQ(graph,{start,goal,episodes=1200,alpha=.22,gamma=.91,epsilon=.18,previous={}}){
  const Q={...previous}; const rand=rng(hash(`${start}|${goal}|${episodes}|${alpha}|${gamma}|${epsilon}`));
  const ids=graph.nodes.map(n=>n.id);
  for(let ep=0;ep<episodes;ep++){
    let s=rand()<.55?start:ids[Math.floor(rand()*ids.length)];
    for(let step=0;step<Math.max(80,ids.length*4);step++){
      const actions=graph.adjacency.get(s)||[]; if(!actions.length) break;
      let action;
      if(rand()<epsilon) action=actions[Math.floor(rand()*actions.length)];
      else action=[...actions].sort((a,b)=>(Q[qKey(s,b.edge,b.to)]||0)-(Q[qKey(s,a.edge,a.to)]||0))[0];
      const r=baseReward(action.edge)+(action.to===goal?35:0)-.08;
      const next=action.to===goal?0:Math.max(0,...(graph.adjacency.get(action.to)||[]).map(z=>Q[qKey(action.to,z.edge,z.to)]||0));
      const k=qKey(s,action.edge,action.to);
      Q[k]=(Q[k]||0)+alpha*(r+gamma*next-(Q[k]||0));
      s=action.to; if(s===goal) break;
    }
  }
  return Q;
}
export function traceQ(graph,start,goal,Q){
  if(!start||!goal) return null;
  const nodes=[start],edges=[],seen=new Set([start]); let s=start;
  for(let i=0;i<graph.nodes.length*3 && s!==goal;i++){
    const actions=[...(graph.adjacency.get(s)||[])].sort((a,b)=>(Q[qKey(s,b.edge,b.to)]||0)-(Q[qKey(s,a.edge,a.to)]||0));
    if(!actions.length) break;
    const a=actions.find(x=>!seen.has(x.to)||x.to===goal)||actions[0];
    s=a.to; nodes.push(s); edges.push(a.edge.id);
    if(seen.has(s)&&s!==goal) break; seen.add(s);
  }
  return {start,goal,mode:'q',nodes,edges,reached:s===goal};
}
export function qRows(graph,goal,Q){
  const rows=[];
  for(const n of graph.nodes) for(const a of graph.adjacency.get(n.id)||[]) {
    const k=qKey(n.id,a.edge,a.to); rows.push({state:n.id,to:a.to,edge:a.edge,reward:baseReward(a.edge)+(a.to===goal?35:0),q:Q[k]||0});
  }
  return rows.sort((a,b)=>b.q-a.q);
}
