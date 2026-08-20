# XSHL Repository Guide

## Structure

- This is a static catalog of XSHL JSON Schema, JSON-LD contexts, examples, macros, and manifests; there is no package manifest, build script, test runner, or CI workflow.
- `schemas/1.1/` is the current schema set. Its public identifiers and `$ref` values use absolute `https://xshl.org/...` URLs, so retain versioned paths and update dependent references when moving or renaming a resource.
- Keep the content hierarchy from `README.md`: definitions have no object references; chunks reference definitions; containers reference chunks, definitions, and containers; sections may reference all of those. Only sections may be paginated, and cyclic nesting is forbidden.
- Follow the identity-key convention of the nearest schema when editing an existing family: the repository intentionally contains both `id` and `$id` schema identifiers.
- `contexts/`, `examples/`, `macros/`, and `manifest/` contain publishable companion artifacts. Treat `manifest/dev/` and `manifest/prod/` as separate environment configurations; compare both when a change should have environment parity.

## Catalog And Formatting

- `index.html` is the complete hand-maintained catalog, not generated output. Adding or removing a catalogued 1.1 resource requires updating its card, section count, and the total resource count; preserve the card's relative `href`, `data-type`, and searchable `data-search` metadata.
- Use LF line endings and four-space indentation for JSON, per `.prettierrc`.

## Verification

- Validate all tracked JSON syntax with `git ls-files -z '*.json' | xargs -0 -n 1 jq empty`; validate newly added untracked JSON explicitly with `jq empty path/to/file.json`.
