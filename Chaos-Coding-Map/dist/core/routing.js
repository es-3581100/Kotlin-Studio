function nodeMathScore(n) {
  return ['complex dynamics','dimension + geometry','algorithms + discrete math'].includes(n?.primaryCluster) ? 1 : 0;
}
function nodeCreativeScore(n) {
  return ['rendering + creative tools','openrndr','bridge concepts'].includes(n?.primaryCluster) ? 1 : 0;
}
function edgeBase(edge) {
  if (edge.kind === 'source-backed annotation' || edge.kind === 'source-backed') return 0.45;
  if (edge.kind === 'captured cross-link') return 0.7;
  if (edge.kind === 'curated neighbor') return 1.55;
  if (edge.kind === 'curated implementation bridge') return 1.35;
  if (edge.kind === 'generated') return 1.65;
  return 1.0;
}
function deterministicNoise(id) {
  let h=2166136261;
  for (const ch of id) { h ^= ch.charCodeAt(0); h=Math.imul(h,16777619); }
  return ((h>>>0)%1000)/1000;
}
export function routeCost(graph, edge, toNode, mode='shortest') {
  const conf=Math.max(0.05, edge.confidence ?? 0.5);
  const base=edgeBase(edge);
  switch(mode) {
    case 'strongest': return base + (1-conf)*2.7 + (edge.evidenceCount ? 0 : .2);
    case 'mathematical': return base + (nodeMathScore(toNode)?0:1.8) + (edge.kind==='curated implementation bridge'?1.2:0) + (1-conf)*.8;
    case 'creative': return base + (nodeCreativeScore(toNode)?0:1.2) + (edge.kind==='curated implementation bridge'?-.18:0) + (1-conf)*.4;
    case 'implementation': return base + (['openrndr','bridge concepts','rendering + creative tools'].includes(toNode?.primaryCluster)?0:1.5) + (edge.kind==='curated implementation bridge'?-.22:0);
    case 'chaos': {
      const tagged=(toNode?.tags||[]).some(t=>/chaos|iteration|dynamical/.test(t)) || toNode?.primaryCluster==='complex dynamics';
      return base + (tagged?0:1.6) + deterministicNoise(edge.id)*.35;
    }
    case 'unexpected': {
      const cross = graph.byId.get(edge.source)?.primaryCluster !== graph.byId.get(edge.target)?.primaryCluster;
      return .65 + (cross?0:.9) + conf*.35 + deterministicNoise(edge.id)*.5;
    }
    default: return 1;
  }
}

export function findRoute(graph, start, goal, mode='shortest') {
  if (!start || !goal || !graph.byId.has(start) || !graph.byId.has(goal)) return null;
  const dist=new Map(graph.nodes.map(n=>[n.id, Infinity]));
  const prev=new Map();
  const unvisited=new Set(graph.nodes.map(n=>n.id));
  dist.set(start,0);
  while(unvisited.size) {
    let current=null, best=Infinity;
    for (const id of unvisited) { const d=dist.get(id); if (d<best){best=d;current=id;} }
    if (current===null || best===Infinity) break;
    unvisited.delete(current);
    if (current===goal) break;
    for (const {edge,to} of graph.adjacency.get(current)||[]) {
      if (!unvisited.has(to)) continue;
      const nd=best+routeCost(graph,edge,graph.byId.get(to),mode);
      if (nd<dist.get(to)) { dist.set(to,nd); prev.set(to,{from:current,edge}); }
    }
  }
  if (start!==goal && !prev.has(goal)) return null;
  const nodes=[goal], edges=[];
  let cur=goal;
  while(cur!==start) {
    const p=prev.get(cur); if (!p) return null;
    edges.unshift(p.edge.id); cur=p.from; nodes.unshift(cur);
  }
  return {start,goal,mode,cost:dist.get(goal),nodes,edges};
}
