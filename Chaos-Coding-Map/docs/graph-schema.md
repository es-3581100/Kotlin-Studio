# Graph schema

`data/graph.json` contains:
- `nodes[]`: stable `id`, title, type, `primaryCluster`, multi-memberships/tags, source/capsules/resources, layout seed, semantic zoom level, provenance.
- `edges[]`: stable `id`, `source`, `target`, relation label, provenance `kind`, confidence, evidence count, directionality, origin, human-readable `why`, supporting source paths, experimental/meta flags.
- `clusters`, `lenses`, `aliases`.

Separate exports exist for nodes, edges, sources, clusters, lenses, aliases and OPENRNDR links.

Coordinates are layout seeds, not canonical identity. Consumers may ignore them and run their own layout.
