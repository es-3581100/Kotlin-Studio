function norm(s='') {
  return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function subsequenceScore(q, s) {
  let qi=0, gaps=0, last=-1;
  for (let i=0;i<s.length && qi<q.length;i++) {
    if (s[i]===q[qi]) { if (last>=0) gaps += i-last-1; last=i; qi++; }
  }
  if (qi<q.length) return -Infinity;
  return 12 - gaps*0.05 - (s.length-q.length)*0.01;
}
export function searchNodes(graph, query, limit=12) {
  const q=norm(query); if (!q) return [];
  const qTokens=q.split(/\s+/);
  const rows=[];
  for (const n of graph.nodes) {
    const aliases=graph.aliases?.[n.id] || [];
    const relationWords=(graph.adjacency.get(n.id)||[]).map(x=>x.edge.relation);
    const resourceWords=(n.resources||[]).flatMap(r=>[r.name,r.repo,r.path,r.url]);
    const hay=norm([n.title,n.slug,n.type,n.primaryCluster,n.description,...(n.tags||[]),...aliases,...relationWords,...resourceWords,n.source,...(n.capsules||[])].filter(Boolean).join(' '));
    let score=0;
    if (hay.includes(q)) score += 100 - hay.indexOf(q)*0.01;
    for (const t of qTokens) if (hay.includes(t)) score += 12;
    const sub=subsequenceScore(q, norm(n.title));
    if (Number.isFinite(sub)) score += sub;
    if (score>0) rows.push({node:n,score});
  }
  rows.sort((a,b)=>b.score-a.score || a.node.title.localeCompare(b.node.title));
  return rows.slice(0,limit);
}
