# Nitride CLI

An independent, Obsidian-compatible headless CLI for local Markdown vaults.

Nitride will let agents execute saved Obsidian Base queries on macOS and
headless Linux without running the Obsidian desktop application. Vault notes
and `.base` files remain the source of truth.

## Status

Repository initialized; CLI implementation and installable skill are pending.
There is no published npm package or working Nitride command yet.

The first implementation slice is Base discovery and read-only queries:
`bases`, `base:query`, and an explicitly designed headless equivalent of
`base:views`. `base:create` is deferred. Compatibility means a documented,
versioned subset, not a claim of complete Obsidian parity.

## Direction

- TypeScript source, bundled JavaScript, Node.js runtime.
- CLI-only executable surface plus a portable Agent Skills folder.
- Planned skill installation through `npx skills`; runtime dependencies must
  be bundled so using the installed CLI needs no build or package download.
- Independent implementation from official documentation and black-box
  observations of the official CLI. Do not inspect proprietary packaged code.
- Synthetic, disposable vaults for native compatibility tests.

See the [product contract](docs/spec.md), [compatibility plan](docs/compatibility.md),
and [implementation sequence](docs/plan.md).

Nitride is an independent project and is not affiliated with Obsidian.
Licensed under MIT.
