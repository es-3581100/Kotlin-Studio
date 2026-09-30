# Data schema

`data/concepts.json`: `{id,title,cluster,summary,formula,aliases,sources,bridge,tags,x,y}`.

`data/relations.json`: `{id,source,target,relation,kind,why,sources,directed}`.

`data/sources.json`: local capsule identity and provenance `{id,group,title,source,capturedAt,filename,sha256,bytes,localPath}`.

`data/bridges.json`: precomputed symbolic/code projections. These can be regenerated/validated with the Python package and SymPy.
