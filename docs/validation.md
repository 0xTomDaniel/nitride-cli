# Validation — September 7, 2026

## PR review fixes

All four confirmed review findings were reproduced through the public CLI before
their fixes: explicit string sorting, boolean/string equality, empty filter
groups, and guarded scalar evaluation. The suite now contains **71 native cases**
(26 additions), including both sort directions and limits, equality/inequality,
nested groups, expression/YAML guards, and date guards. All 45 prior native
invocations and outputs remained unchanged during recapture.

`npm run check` passed on macOS Node 26.0.0: format, strict types, build,
**92 public CLI tests**, and all **71 isolated installed-skill cases** plus
help/version/failure checks. Four new failure tests verify unsupported syntax is
still rejected in skipped branches. The generated skill bundle was rebuilt.
Linux/macOS Node 22 CI results are reported on the PR; the earlier Debian run
below predates these fixes and is not a rerun of the expanded suite.

## Initial implementation results

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

## Linked-period increment

The public CLI now evaluates the list/filter/linked-property chain required by
Exo's This Week and Current Sprint views, plus file.basename. Eight additional
native cases cover those views, live and fixed dates, first/last/after-period
boundaries, scalar/list/missing/null inputs, aliases, headings, relative/suffix
links, unresolved targets and bracket property access. Source fixtures contain
only synthetic notes. Native capture revealed that list(null) contains one null
item; the failing replay preceded its correction.

All 102 public CLI tests and 79 isolated package cases passed locally, including
explicit ambiguity and traversal/nested-value failure checks. Link ambiguity
fails deliberately instead of claiming native tie-breaking parity. The vault
metadata index is rebuilt for every query and is not persisted. The expression
interpreter still never executes Base input as JavaScript.

The skill eval catalog now describes supported period queries separately from
unsupported formulas; these prompt updates are not fresh model-eval evidence.

## Self-reference review repair

A native-recorded regression distinguishes empty/plain references from actual
self-wikilinks. Six synthetic tasks carry their own period dates: empty text,
plain heading text and null must not acquire membership from those dates;
`[[]]`, `[[|Alias]]` and `[[#Heading]]` may resolve to the current note. The
public CLI replay failed before the resolver preserved the original wikilink
form. This expands conformance to 80 native cases and 103 public CLI tests.
