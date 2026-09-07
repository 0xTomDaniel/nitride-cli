# Compatibility and evidence

## Source policy

Nitride is independently implemented from official documentation and observable
CLI behavior. Do not inspect Obsidian source or packaged JavaScript. Native
characterization must use a disposable synthetic vault, never a personal vault.

## Verified reference

The checked-in [recording](../tests/fixtures/native-results.json) contains
80 successful cases from Obsidian **1.13.7 (installer 1.12.4)** on macOS.
The recorder verified that the disposable vault exactly matched committed
fixtures before and after capture. Outputs are unmodified, with command arguments,
exit status, stderr, retry attempts, fixture hashes, and capture provenance.

This replaces the provisional Python spike's recordings. No Python runtime or
prototype code is required by Nitride. These cases establish the documented
subset, not the complete Base language or every installation's configuration.

The PR review regressions add explicit natural sorting (filename and text,
ascending/descending, including limits), boolean/string equality and inequality,
empty/nested YAML groups, and guarded unary/date operations. Empty groups are
omitted when combining filters; a wholly empty filter imposes no restriction.
Boolean evaluation short-circuits in expressions and YAML groups, while syntax
validation still examines every selected branch before scanning.

These fixtures explicitly scope note scans to Markdown. General non-Markdown
candidate selection and mixed relational/equality coercion beyond the recordings
still need characterization; the review fixes do not establish those contracts.

## Commands

| Command | Nitride behavior |
| --- | --- |
| `bases` | Discover visible Base files under an explicit filesystem vault |
| `base:query` | Execute a selected view; json/csv/tsv/md/paths |
| `base:views` | List views with explicit file or active-file context |
| `help`, `version` | Report Nitride usage/version without a vault |
| `base:create` and all other commands | Explicit unsupported-command failure |

See the [full subset contract](../skills/nitride/references/compatibility.md)
and the [102-command planning inventory](command-inventory.md).

## Intentional differences and limits

- Use `--vault-path`, not native desktop vault registration. `base:views` accepts
  `path=`/`file=` as a headless extension; `--active-file` supplies explicit context.
- Ambiguous names and conflicting selectors fail rather than guessing link resolution.
- Errors go to stderr with exit 1 and no partial successful stdout. Native errors
  sometimes use stdout/exit zero. Blank native transport responses are not treated
  as evidence of empty data; bounded capture retries are retained in the recording.
- The default clock timezone is explicit UTC, configurable through `--timezone`.
  Recorded `today()` cases carry the native capture date for offline replay.
- Dot entries are excluded, visible symlinks rejected, and UTF-8/YAML parsed
  strictly. Malformed Markdown anywhere in the visible vault fails a query even
  if that note would fall outside the selected view. There is no transactional
  snapshot guarantee while another process edits the vault.
- Unsupported selected-view features fail; unsupported unselected view expressions
  are not evaluated. Flat list rendering and the documented linked-period list
  filters are supported; nested object/list values are not. Locale/linked-target semantics beyond the recorded
  subset are not a parity claim.

## Reproduce native evidence

1. Copy `tests/fixtures/vault` to a new disposable directory, then open that
   directory as a vault in Obsidian. Do not put it inside a personal vault.
2. Keep the reference app running with its CLI enabled. Use its explicit vault
   name and the exact absolute directory path:

   ```sh
   npm run capture:native -- --vault NitrideFixture --path /absolute/disposable/NitrideFixture
   ```

3. The recorder refuses a wrong native vault or any fixture-content mismatch.
   It records only the scenarios in `tests/fixtures/scenarios.json`, opens a
   synthetic Base for active-view cases, and captures help/version. A capture
   is a candidate reference change, not automatic acceptance of changed behavior.
4. Review differences and run `npm run check`. Never edit captured outputs to
   make tests pass. For future `today()` captures, the reference system timezone
   and date are part of the observation.

Native tests require desktop Obsidian; ordinary conformance replay and package
tests do not. Test fixture hashes detect stale recordings. Native UI configuration
inside `.obsidian` is excluded from fixture hashes and must remain disposable.

## Official references

- [CLI documentation](https://obsidian.md/help/cli)
- [Base syntax](https://obsidian.md/help/bases/syntax)
- [Changelog](https://obsidian.md/changelog/)
- [Obsidian Headless](https://obsidian.md/help/headless)

Current web documentation can describe a newer version than the recorded app.
