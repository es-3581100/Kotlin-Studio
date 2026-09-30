export function indexGraph(graph) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const edgeById = new Map(graph.edges.map((e) => [e.id, e]));
  const adjacency = new Map(graph.nodes.map((n) => [n.id, []]));
  for (const edge of graph.edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
    adjacency.get(edge.source).push({ edge, to: edge.target });
    adjacency.get(edge.target).push({ edge, to: edge.source });
  }
  return { ...graph, byId, edgeById, adjacency };
}

export function edgeOther(edge, nodeId) {
  return edge.source === nodeId ? edge.target : edge.source;
}

export function neighborhood(graph, nodeId, depth = 1) {
  const found = new Set([nodeId]);
  let frontier = new Set([nodeId]);
  for (let d = 0; d < depth; d++) {
    const next = new Set();
    for (const id of frontier) {
      for (const { to } of graph.adjacency.get(id) || []) {
        if (!found.has(to)) { found.add(to); next.add(to); }
      }
    }
    frontier = next;
  }
  return found;
}

export function edgeBetween(graph, a, b) {
  return (graph.adjacency.get(a) || []).filter((x) => x.to === b).map((x) => x.edge);
}
