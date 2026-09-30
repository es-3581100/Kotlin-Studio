# Provenance model

## Imported seed
All 102 original edges are preserved with their original `kind`, weight→confidence, and evidence count. The seed did not carry semantic relation labels, so imported edges retain `relation = kind` rather than inventing one.

## Source-backed annotation
Small typed additions supported directly by `fractal.lib.html`, such as the Mandelbrot/Julia shared iteration family and orbit-diagnostics→pixels rendering statement.

## Source-backed OPENRNDR structure
`OPENRNDR → semantic domain` edges come from the supplied OPENRNDR knowledge tree.

## Curated implementation bridge
Explicitly labeled useful links between math/rendering concepts and implementation surfaces. These are not mathematical claims.

## Generated
Structural edges derived from canonical metadata, currently complex-dynamics cluster membership. They are visually dotted/de-emphasized and must not be cited as independent evidence.

## Learned
Q-values are runtime navigation utility. They do not modify canonical edges and are not truth/confidence scores.
