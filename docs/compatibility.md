# Compatibility and evidence

## Source policy

Implement independently using official public documentation and observable
behavior of the official CLI. Do not inspect Obsidian source or packaged JS.
Use disposable synthetic vaults; do not use personal vaults for native tests.
This is a project implementation constraint, not a legal opinion.

## Initial command matrix

These are planned dispositions, not implemented features.

| Command | Observed inputs | Native behavior / dependency | Nitride disposition |
| --- | --- | --- | --- |
| `bases` | Vault selection | Lists Base paths from the desktop vault | First slice; explicit filesystem vault |
| `base:query` | `file`, `path`, `view`, `format` | Evaluates a Base view; json/csv/tsv/md/paths | First slice; only documented, tested syntax |
| `base:views` | Current active Base | Observed to use UI active file rather than supplied `path` | First slice design needed: explicit headless context |
| `base:create` | `file`, `path`, `view`, `name`, `content`, `open`, `newtab` | Creates a note; includes UI options | Deferred mutation design and tests |

Complete the broader inventory using versioned official help and docs. Classify
commands as feasible headless, later, unsupported by design, desktop-coupled,
plugin/developer-only, or needs design. Record parameters, output, source,
desktop dependence, filesystem effects, and disposition for each command.

## Preliminary evidence, not release certification

The earlier Python spike recorded 18 native cases against Obsidian 1.13.7
(installer 1.12.4): 16 query cases, scoped discovery, and active-file view listing.
Its local headless comparisons reportedly passed. It does not establish complete
Base compatibility; Debian validation was not confirmed in the reviewed record.

Those captures used a synthetic folder in a personal vault, rather than a
fully disposable vault. Re-characterize in isolation before promoting them to
Nitride release evidence. The prototype and recordings have not been imported
as production code or certified fixtures in this repository.

Observations to reproduce independently:

- Numeric result cells can render as strings; missing and empty cells can both
  render as null while filters still distinguish them.
- Ordering, limits, column naming, CSV/TSV escaping, and Markdown spacing matter.
- Global and view filters compose; nested `not` semantics need explicit tests.
- Native calls intermittently returned blank stdout despite known matches.
  Capture retries must be bounded and recorded; do not invent empty results.
- Some native errors appeared on stdout with exit zero. Nitride should expose
  reliable failures; specify any intentional exit/output difference explicitly.

## Required coverage before a first release

- Filesystem scope, duplicate names, ambiguous paths, hidden files, symlinks,
  traversal, unreadable files, malformed YAML, and duplicate properties.
- Missing/null/empty values, scalar/list/link behavior, comparison/coercion,
  global/view filters, unsupported functions and unsupported Base features.
- Dates, explicit timezone/clock behavior, invalid dates and day boundaries.
- Stable ordering, limits, all advertised formats and escaping.
- Errors without partial successful output, including syntax unsupported even
  when no notes match. Read-only commands leave the vault unchanged.
- Standalone packaged execution on macOS and Debian with no desktop, build,
  network fetch, or undeclared runtime dependency.

Unsupported expressions must fail explicitly, not evaluate to false. Document
any strict whole-vault parsing behavior that differs from native evaluation.
Freshness/provenance reporting must not silently change native-compatible
output formats: settle a separate opt-in diagnostic surface if needed.

## Official references

- [CLI documentation](https://obsidian.md/help/cli)
- [Base syntax](https://obsidian.md/help/bases/syntax)
- [Obsidian changelog](https://obsidian.md/changelog/)
- [Obsidian Headless](https://obsidian.md/help/headless)

Check these sources against the installed reference version when capturing;
current web documentation can describe a different version.
