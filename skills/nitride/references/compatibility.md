# Supported CLI contract

Commands: `bases`, `base:views`, `base:query`, `help`, `version`.

- `--vault-path` is required for vault commands. Paths use `/` relative to that
  root; `file=` resolves a unique Base basename. Ambiguity fails. Select either
  `file=` or `path=`, not both.
- `base:views` accepts explicit `path=`/`file=` or `--active-file`. This is an
  intentional headless extension of native Obsidian's active-UI-file behavior.
- `base:query` accepts `view=` (otherwise first view), plus
  `format=json|csv|tsv|md|paths` (default JSON).
- `--timezone` defaults to UTC. `--date YYYY-MM-DD` overrides `today()`.
- Output JSON preserves native rendered-cell strings/nulls, not raw YAML types.
  All formats are buffered; failures produce no successful partial stdout.
- Dot files/directories are excluded. Visible symlinks and invalid UTF-8 fail.
  Markdown frontmatter must be valid YAML with unique keys and no aliases or
  custom tags. Strict whole-vault metadata parsing can reject a malformed note
  outside the selected view. Concurrent edits do not form a transactional snapshot.

Base support: global and selected-view filters; table/cards/list view definitions;
column `order`, `sort` with ASC/DESC, and nonnegative integer `limit` (`0` means unlimited).
Top-level formulas, display-property configuration, grouping, summaries, and
unrecognized selected-view features fail. UI layout options are not emulated.

Filter support: named scalar note properties (`status`, `note.status`,
`note["odd key"]`); `file.path`, `file.name`, `file.basename`, `file.ext`, `file.folder`;
strings/numbers/booleans/null; comparisons; `&&`, `||`, `!`, parentheses,
unary signs; nested YAML `and`/`or`/`not`; `today()`, `date("YYYY-MM-DD")`;
string `startsWith`, `endsWith`, `contains`.

Columns support unprefixed or `note.`-prefixed note property names and the listed file properties.
Flat lists render as comma-separated cells; tags render with `#` prefixes.
Linked-period filters support `list(property).filter(predicate).length`, with
`value` bound to each scalar list item and `file(value).properties.<name>` (or
a literal bracket key) reading scalar metadata from the linked note. Scalar
inputs, including null, become one-item lists; list inputs retain their items.
Wikilinks may have aliases/headings, explicit relative paths, or unique path
suffixes. Missing targets yield null metadata. Ambiguous shorthand links fail;
use a qualified vault-relative link rather than depending on desktop tie-breaking.
Links cannot leave the visible vault. All visible Markdown is parsed before
filter evaluation, so malformed linked metadata fails rather than disappearing.

Nested objects/lists, formula evaluation, arbitrary file object operations,
other list methods, and other Base functions are unsupported. A scalar
operation on a list fails rather than guessing its meaning.

Native Obsidian is the reference for the recorded subset, not a runtime dependency.
Nitride is independent and does not claim complete Obsidian/Base compatibility.

Default filename ordering uses English natural collation, as captured from the
reference app; other locale configurations have not been characterized. Simple
wikilink cells are supported, but alias/target-resolution equivalence is not
a verified compatibility claim.
