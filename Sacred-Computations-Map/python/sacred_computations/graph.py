from __future__ import annotations
from collections import deque
from .catalog import concepts, relations

def shortest_path(start, goal):
    ids={n['id'] for n in concepts()}
    if start not in ids or goal not in ids: raise KeyError('unknown concept')
    adj={i:[] for i in ids}
    for e in relations():
        adj[e['source']].append(e['target'])
        if not e.get('directed'): adj[e['target']].append(e['source'])
    q=deque([start]); prev={start:None}
    while q:
        u=q.popleft()
        if u==goal: break
        for v in adj[u]:
            if v not in prev: prev[v]=u; q.append(v)
    if goal not in prev: return []
    out=[]; cur=goal
    while cur is not None: out.append(cur); cur=prev[cur]
    return list(reversed(out))
