#!/usr/bin/env python3
from __future__ import annotations
import json, math, shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
seed=json.loads((ROOT/'public/original/graph-data.seed.json').read_text())
orc=json.loads((ROOT/'public/original/openrndr-concepts.extracted.json').read_text())

cluster_meta=dict(seed['cluster_meta'])
cluster_meta.update({
  'openrndr': {'color':'#56e6d4','description':'OPENRNDR semantic domains and source paths imported from the supplied knowledge tree.'},
  'bridge concepts': {'color':'#f8d36a','description':'Explicit connective concepts used to bridge math, rendering and implementation. Provenance is labeled per edge.'},
})

nodes=[]
for n in seed['nodes']:
    nodes.append({
      'id':n['id'],'title':n['title'],'slug':n['slug'],'type':'concept','primaryCluster':n['cluster'],
      'memberships':[n['cluster']], 'tags':[n['cluster']], 'source':n.get('source'),
      'capsules':[v['local'] for v in n.get('variants',[])], 'sourceKey':n.get('key'),
      'seedDegree':n.get('degree',0),'x':n.get('x',0),'y':n.get('y',0), 'semanticLevel':2,
      'provenance':{'kind':'seed-graph','origin':'graph-data.json','status':'source-derived'}
    })

# OPENRNDR root + semantic domains are source-derived from the supplied tree.
nodes.append({
 'id':'or-root','title':'OPENRNDR','slug':'openrndr','type':'framework','primaryCluster':'openrndr',
 'memberships':['openrndr','creative coding'],'tags':['creative coding','kotlin','rendering','framework'],
 'source':'https://openrndr.org/','capsules':['original/openrndr-semantic-knowledge-tree.html'],
 'description':'Creative coding framework represented here through the supplied semantic knowledge tree.',
 'x':1480,'y':345,'semanticLevel':0,
 'provenance':{'kind':'openrndr-tree','origin':'openrndr-semantic-knowledge-tree.html','status':'source-derived'}
})

cx,cy=1480,345
ring=330
for i,c in enumerate(orc):
    ang=(i/len(orc))*math.tau-math.pi/2
    nodes.append({
      'id':'or-'+c['id'],'title':c['title'],'slug':'openrndr-'+c['id'],'type':'implementation-domain',
      'primaryCluster':'openrndr','memberships':['openrndr'], 'tags':['openrndr']+c.get('keywords',[]),
      'description':c.get('description',''),'resources':c.get('resources',[]),
      'source':'https://github.com/openrndr', 'capsules':['original/openrndr-semantic-knowledge-tree.html'],
      'x':round(cx+math.cos(ang)*ring,2),'y':round(cy+math.sin(ang)*ring,2),'semanticLevel':1,
      'provenance':{'kind':'openrndr-tree','origin':'openrndr-semantic-knowledge-tree.html','status':'source-derived'}
    })

bridge_nodes=[
 ('hub-complex-dynamics','Complex dynamics','domain','Complex-dynamics cluster hub generated from the seed graph cluster label.',720,200,0,['dynamical systems','complex dynamics']),
 ('hub-chaos','Chaos','domain','A bridge concept for chaos-oriented navigation. Connections are explicitly labeled by provenance.',760,720,0,['chaos','dynamical systems']),
 ('hub-orbit-iteration','Orbit iteration','method','Iterative orbit evolution used by escape-time and related fractal computations.',850,555,1,['iteration','orbit','algorithm']),
 ('hub-fractal-rendering','Fractal rendering','implementation','Mapping iterative or orbit diagnostics into visible output.',1030,565,1,['rendering','visualization','fractal']),
 ('hub-iterative-map','Iterative map','method','A reusable navigation bridge for repeatedly applying a state transition/map.',900,785,1,['iteration','dynamical systems']),
 ('hub-visualization','Visualization','implementation','Rendering or plotting computational state so structure can be inspected.',1110,760,1,['rendering','visualization']),
]
for id_,title,type_,desc,x,y,level,tags in bridge_nodes:
    nodes.append({'id':id_,'title':title,'slug':id_.replace('hub-',''),'type':type_,'primaryCluster':'bridge concepts',
      'memberships':['bridge concepts'],'tags':tags,'description':desc,'x':x,'y':y,'semanticLevel':level,
      'provenance':{'kind':'bridge-node','origin':'builder-curated','status':'curated'}})

byid={n['id']:n for n in nodes}

# Source inventory is concept-centric and preserves local capsules.
sources=[]
for n in nodes:
    if n.get('source') or n.get('capsules') or n.get('resources'):
        sources.append({'nodeId':n['id'],'remote':n.get('source'),'capsules':n.get('capsules',[]),'resources':n.get('resources',[])})

edges=[]
def add_edge(source,target,relation,kind,confidence,evidence=0,directional=False,origin=None,why=None,sources_=None,experimental=False,meta=False):
    idx=len(edges)
    edges.append({'id':f'e{idx:03d}','source':source,'target':target,'relation':relation,'kind':kind,
      'confidence':round(float(confidence),3),'evidenceCount':int(evidence),'directional':bool(directional),
      'origin':origin or kind,'why':why or relation,'sources':sources_ or [],'experimental':experimental,'meta':meta})

# Preserve every seed edge exactly as an imported relation class. No invented relation semantics.
for e in seed['edges']:
    add_edge(e['a'],e['b'],e['kind'],e['kind'],e['weight'],e['evidence'],False,'graph-data.json',
      f"Imported {e['kind']} from the supplied seed graph; the seed does not provide a more specific semantic relation label.")

# Direct annotations supported by fractal.lib.html. These do not replace seed edges; they add explicit typed evidence.
libsrc=['original/fractal.lib.html']
for a,b,rel,why in [
 ('n20','n12','shared complex-iteration family','Mandelbrot and Julia use the same quadratic iteration family with parameter/initial-state roles changed.'),
 ('n20','n24','power-family generalization','Multibrot extends the iteration to z^d + c.'),
 ('n26','n25','iterative method produces fractal basin','Newton fractals iterate Newton\'s method and color by attracting root/convergence.'),
 ('n20','hub-orbit-iteration','computed by orbit iteration','The compact library gives the Mandelbrot iteration kernel z[n+1] = z[n]^2 + c.'),
 ('n12','hub-orbit-iteration','computed by orbit iteration','The compact library states Julia sets fix c and iterate the same family.'),
 ('n24','hub-orbit-iteration','computed by orbit iteration','The compact library gives the Multibrot iteration z[n+1] = z[n]^d + c.'),
 ('hub-orbit-iteration','hub-fractal-rendering','diagnostics mapped to pixels','The compact library states rendering maps iteration/orbit diagnostics to pixels.'),
 ('n17','hub-chaos','diagnoses chaotic regime','The compact library describes Lyapunov exponent as tracking exponential separation/contraction and distinguishing stable/chaotic regimes.'),
 ('n05','hub-fractal-rendering','software path','The compact library groups fractal-generating software with rendering/creative tooling.'),
 ('n19','hub-fractal-rendering','visualization implementation','The compact library preserves a Python Mandelbrot visualization tutorial as an implementation reference.'),
]: add_edge(a,b,rel,'source-backed annotation',0.97,1,False,'fractal.lib.html',why,libsrc)

# Generated cluster membership: structural metadata, hidden/de-emphasized by default, not a mathematical assertion.
for n in list(nodes):
    if n['id'].startswith('n') and n['primaryCluster']=='complex dynamics':
        add_edge(n['id'],'hub-complex-dynamics','cluster membership','generated',1.0,1,False,'seed cluster label',
                 'Generated from the node primaryCluster value in graph-data.json.',[],False,True)

# OPENRNDR semantic tree structure is source-derived.
for c in orc:
    add_edge('or-root','or-'+c['id'],'semantic domain','source-backed',1.0,1,True,'openrndr semantic tree',
             'The supplied OPENRNDR semantic knowledge tree lists this as a top-level concept domain.',
             ['original/openrndr-semantic-knowledge-tree.html'])

# Curated implementation bridges: useful pathways, deliberately not mathematical facts.
curated=[
 ('n02','or-root','creative-coding framework option','Creative coding can be implemented with OPENRNDR; this is an implementation bridge, not a mathematical relation.'),
 ('hub-fractal-rendering','or-drawing','rendered through','OPENRNDR drawing is a plausible 2D rendering surface for fractal output.'),
 ('hub-fractal-rendering','or-shaders','accelerated through','GPU shaders are a plausible acceleration surface for iterative pixel/ray workloads.'),
 ('hub-fractal-rendering','hub-visualization','is a visualization process','Fractal rendering is one visualization pathway.'),
 ('hub-visualization','or-drawing','implemented through','OPENRNDR drawing is a plausible visualization surface.'),
 ('hub-visualization','or-animation','animated through','Animation/time can vary parameters and reveal temporal structure.'),
 ('or-shaders','or-animation','parameterized over time','Shader parameters can be animated; this is an implementation workflow bridge.'),
 ('or-animation','or-color','palette/time coupling','Color palettes can be animated or driven by time/iteration values.'),
 ('n21','or-camera3d','3D rendering surface','Mandelbulb rendering commonly needs 3D camera/mesh or raymarching infrastructure.'),
 ('n21','or-shaders','GPU rendering surface','Mandelbulb raymarching/distance-estimation is a plausible shader workload.'),
 ('n18','or-camera3d','3D rendering surface','Mandelbox is a 3D fractal form and maps naturally to camera/3D infrastructure.'),
 ('n22','or-geometry','geometry implementation surface','Menger sponge is recursive geometry and maps naturally to shape/geometry tooling.'),
 ('hub-chaos','hub-iterative-map','explored through iterative maps','Iterative maps are a common computational surface for chaos exploration.'),
 ('hub-iterative-map','hub-visualization','visualized through','Iterative map trajectories/fields can be visualized.'),
 ('hub-orbit-iteration','or-shaders','parallelizable implementation surface','Per-pixel orbit iteration is a plausible shader implementation surface.'),
 ('n28','hub-fractal-rendering','rendering diagnostic','Orbit traps are named in the compact library as rendering diagnostics.'),
 ('n30','hub-fractal-rendering','rendering diagnostic','Pickover stalks are named in the compact library alongside plotting/rendering diagnostics.'),
 ('n01','hub-fractal-rendering','rendering technique','Buddhabrot is named in the compact library among rendering/diagnostic paths.'),
]
for a,b,rel,why in curated:
    add_edge(a,b,rel,'curated implementation bridge',0.72,0,False,'builder-curated',why,[],False)

# Aliases aid search without changing canonical ids.
aliases={
 'or-root':['openrndr','creative coding framework'],
 'or-shaders':['gpu shader','gpu','shader','shaders'],
 'or-animation':['animation/time','time'],
 'hub-complex-dynamics':['complex dynamics'],
 'hub-orbit-iteration':['orbit iteration','iteration kernel','escape iteration'],
 'hub-fractal-rendering':['fractal rendering','rendering'],
 'hub-chaos':['chaos theory','chaos'],
 'hub-iterative-map':['iterative map','iterated map'],
 'hub-visualization':['visualization','visualisation'],
}
for n in nodes:
    if n['title']=='Mandelbrot set': aliases.setdefault(n['id'],[]).append('mandelbrot')
    if n['title']=='Julia set': aliases.setdefault(n['id'],[]).append('julia')
    if n['title']=='Lyapunov exponent': aliases.setdefault(n['id'],[]).append('lyapunov')

lenses=[
 {'id':'all','title':'ALL','clusters':[],'tags':[],'description':'Canonical graph without lens filtering.'},
 {'id':'fractals','title':'FRACTALS','clusters':['complex dynamics','dimension + geometry'],'tags':['fractal'],'description':'Fractal families, geometry and diagnostics.'},
 {'id':'chaos','title':'CHAOS','clusters':['complex dynamics','bridge concepts'],'tags':['chaos','dynamical systems','iteration'],'description':'Chaos and iterative dynamics.'},
 {'id':'mathematics','title':'MATHEMATICS','clusters':['complex dynamics','dimension + geometry','algorithms + discrete math'],'tags':['math'],'description':'Mathematical and algorithmic relations.'},
 {'id':'computation','title':'COMPUTATION','clusters':['machine models','algorithms + discrete math'],'tags':['computation','algorithm'],'description':'Machine models and algorithms.'},
 {'id':'creative','title':'CREATIVE CODING','clusters':['rendering + creative tools','openrndr','bridge concepts'],'tags':['creative coding','rendering','visualization'],'description':'Implementation and creative-coding surfaces.'},
 {'id':'openrndr','title':'OPENRNDR','clusters':['openrndr','bridge concepts','rendering + creative tools'],'tags':['openrndr'],'description':'OPENRNDR semantic domains plus curated fractal bridges.'},
 {'id':'gpu','title':'GPU / SHADERS','clusters':['openrndr','bridge concepts'],'tags':['gpu','shader','rendering'],'description':'GPU, shader and rendering pathways.'},
 {'id':'dimension','title':'DIMENSION','clusters':['dimension + geometry'],'tags':['dimension','geometry'],'description':'Fractal geometry and dimension.'},
 {'id':'source','title':'SOURCE GRAPH','clusters':[],'tags':[],'description':'Emphasize imported source-backed and seed relations.'},
 {'id':'q','title':'Q-LEARNING','clusters':[],'tags':[],'description':'Experimental learned navigation utility.'},
]

# Mark degrees after all edges; semantic degree is useful to index view.
degree={n['id']:0 for n in nodes}
for e in edges:
    degree[e['source']]+=1; degree[e['target']]+=1
for n in nodes: n['degree']=degree[n['id']]

# Dedicated bridge export.
openrndr_links=[e for e in edges if e['source'].startswith('or-') or e['target'].startswith('or-')]

manifest={
 'schema':'fractal-chaos-coding-map.v0.1','generatedFrom':[
  'public/original/graph-data.seed.json','public/original/fractal.lib.html','public/original/openrndr-semantic-knowledge-tree.html'],
 'counts':{'nodes':len(nodes),'edges':len(edges),'seedNodes':seed['node_count'],'seedEdges':seed['edge_count']},
 'nodes':nodes,'edges':edges,'clusters':cluster_meta,'lenses':lenses,'aliases':aliases,
}

for name,obj in [('nodes.json',nodes),('edges.json',edges),('sources.json',sources),('clusters.json',cluster_meta),('lenses.json',lenses),('aliases.json',aliases),('openrndr-links.json',openrndr_links),('graph.json',manifest)]:
    (ROOT/'data'/name).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')

print(json.dumps(manifest['counts'],indent=2))
