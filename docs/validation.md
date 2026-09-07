# Validation — September 7, 2026

## Results

- `npm run check`: passed on macOS, Node 26.0.0. Includes formatting,
  strict TypeScript checking, build, **62 public CLI tests**, and installed-skill
  package checks.
- **45 native conformance cases** captured from official Obsidian 1.13.7
  (installer 1.12.4) in a verified disposable synthetic vault. Fixture hashes
  match before/after capture; output normalization is none. The native app's
  timezone is recorded alongside the reference date for `today()` cases.
- `tests/package.mjs`: all 45 cases plus help/version/unsupported-operation
  checks passed in a copied skill without `node_modules`, on macOS Node 26.0.0
  and Debian 12 Node 22.23.2. Vault hashes were unchanged after read-only queries.
- Debian used a disposable container with networking disabled, read-only root
  filesystem and evidence mount, and writable temporary scratch space. The Node
  Linux archive was checked against the publisher's SHA-256 before transfer.
- `skills@1.5.24 add <local checkout> --skill nitride --agent codex --copy --yes`:
  installed into a disposable project. Installed bundle bytes matched the build.
  Querying both synthetic reminder views yielded four distinct paths, correctly
  accounting for overlap.
- `npm pack` produced an installable tarball; offline npm execution of that
  tarball returned `nitride 0.1.0`. No registry publication was performed.
- Skill frontmatter/resource validation passed. Three skill eval prompts are
  recorded in `evals/nitride.json`; instruction review was inline. These are not
  independent model-eval results or proof of automatic skill invocation.

## Failures that led to fixes

Public-command RED/GREEN checks caught unsupported initial commands, bundling
of CommonJS dependencies into ESM, natural filename ordering, numeric coercion,
file-property labels, list/tag rendering, Markdown escaping, native zero-limit
semantics, and prefixed note columns. Hardening tests caught invalid UTF-8 being
replaced, conflicting selectors being accepted, nested lists being flattened,
and a JavaScript prototype-key collision in column labels.

Failure regressions also cover malformed/duplicate frontmatter, unsupported
functions or view configuration, symlinks, traversal, mutation attempts,
ambiguous Base names, invalid dates/timezones, hidden configuration, and explicit
as-of dates. No personal note content or private transcripts are fixtures.

## Practical limits

This validates the stated read-only subset. It does not establish full Base
language parity, every UI/plugin setting, linked-file resolution equivalence,
Windows support, transactional snapshots during concurrent edits, independent
model skill behavior, or a live Voice deployment.

The active Exo Voice container lacks Node on PATH. An initial temporary test
transfer hit that container's small temporary filesystem limit; all files from
that attempt were removed. Final testing used a separate disposable container
with a host-mounted temporary runtime. No active service settings were changed.

GitHub CI is configured for Node 22 on Linux and macOS; its actual run status
is reported separately from these local and Debian results.
