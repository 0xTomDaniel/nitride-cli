# Nitride CLI

An independent, Obsidian-compatible headless CLI for local Markdown vaults.

Nitride executes a read-only subset of saved Base queries on macOS and Linux
without the Obsidian desktop app. Vault notes and `.base` definitions remain
the source of truth.

## Run

Requires **Node.js 22+**. The checked-in executable bundles its dependencies:

```sh
node skills/nitride/scripts/nitride.mjs --help
node skills/nitride/scripts/nitride.mjs --vault-path /path/to/vault bases
node skills/nitride/scripts/nitride.mjs --vault-path /path/to/vault base:views path="Queries/Tasks.base"
node skills/nitride/scripts/nitride.mjs --vault-path /path/to/vault --timezone America/Denver base:query path="Queries/Tasks.base" view="Due Today" format=json
```

Choose your own timezone; the default is UTC. `--date YYYY-MM-DD` sets an explicit
as-of date for reproducible queries. JSON cells preserve native rendered values
(strings/nulls). CSV, TSV, Markdown, and path-only output are also supported.

`base:views` accepts explicit file selection instead of requiring UI state.
Unknown functions, unsupported configuration, invalid metadata, and incomplete
reads fail with exit 1 and stderr; they never become successful empty results.
See the [supported contract](skills/nitride/references/compatibility.md).

## Install the skill

From a checkout containing the implementation:

```sh
npx skills@latest add . --skill nitride
```

After this implementation is merged into the repository's default branch:

```sh
npx skills@latest add EmberAGI/nitride-cli --skill nitride
```

The skill can also be installed by copying `skills/nitride` into your agent's
skill directory. It includes the same bundled executable. Installing the skill
does not provision Node in a separate remote agent environment.

The npm package structure uses `@emberagi/nitride-cli` and the `nitride` binary.
`npm pack` creates an installable tarball; the package is currently private in
its manifest to prevent accidental registry publication. No npm release is
claimed or required to run the bundled skill.

## Develop and verify

```sh
npm ci --ignore-scripts
npm run check
```

The gate checks formatting and types, builds the executable, runs public CLI
tests, and exercises a copied skill outside the checkout with no `node_modules`.
Runtime dependencies are bundled from development dependencies. Commit updated
bundle/source map and third-party notices with source changes; CI checks drift.

- [Compatibility evidence and native capture](docs/compatibility.md)
- [Official command inventory](docs/command-inventory.md)
- [Product contract](docs/spec.md)
- [Implementation status and follow-ups](docs/plan.md)
- [Validation report](docs/validation.md)

This is a tested Base subset, not complete Obsidian parity. Mutations, formulas,
arbitrary linked-file operations, desktop automation, plugins, and sync are not implemented.
Linked-period queries using `list(...).filter(file(value).properties...).length`
are supported within the documented subset, including Exo's weekly/sprint views.
Nitride is independent and is not affiliated with Obsidian. Licensed under MIT.
