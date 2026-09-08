# Exo Phase 2 compatibility audit

The accepted Seam is the public CLI: run the same synthetic Base predicates
through native Obsidian and the shipped Nitride bundle, then classify differences
against Exo's actual calendar-day retrieval requirements. No personal vault was
used for native characterization. No proprietary application code was inspected.

## Evidence and dispositions

The [audit recording](../tests/fixtures/audit-native-results.json) contains nine
unmodified native observations from Obsidian 1.13.7 / installer 1.12.4, with
fixture hashes, exact arguments, timezone, version and capture time. It includes
known differences; it is not a claim that all nine match Nitride. The ordinary
conformance recording now has 84 matching cases, including four audit cases.

| Case | Native observation | Disposition |
|---|---|---|
| Quoted/unquoted valid ISO days; exact day, past and future | Matching selected paths and rendered days | Matching conformance regression |
| Empty, null, missing date | Empty string can satisfy an unguarded `<= date(...)`; null/missing do not | Recorded match; Exo rejects empty dates and permits absent/null |
| Impossible date `2026-02-30` | Rendered as March 2 rather than rejected | Intentionally unclaimed; Exo rejects invalid calendar values |
| Timestamp and offset timestamp compared to a day | Native normalizes rendered time and can match date equality; Nitride raw strings differ | Exo requires calendar days, rejects timestamps before scans; no implicit truncation or timezone conversion |
| Numeric/date and list/date comparisons | Numeric value 42 participates in the native due result; list/date yields no row | Not native parity; Exo rejects non-date scalars/lists; Nitride explicitly rejects scalar operations on lists |
| Non-padded day | Remains noncanonical text | Rejected by Exo's strict date contract |
| Visible Markdown, dotfile and hidden directory | Only visible Markdown selected | Matching conformance regression |
| Visible PNG, canvas, text, CSV and unknown extension | Native `files` lists them; `base:query` excludes them | Fixed Nitride's Base candidate set to Markdown; discovery/linked index remain separate |
| Owner midnight and DST, host TZ differs | Native public docs define today at local midnight | Ten Nitride process-clock tests; explicit expected Denver dates, not native clock simulation |

The membership defect was first reproduced with the recorded public query: the
old bundle emitted six candidates and native emitted one. The change adds the
Markdown candidate restriction before predicate evaluation. New audit filenames
are prefixed so they do not introduce ambiguous shorthand links into earlier
period fixtures. Recapturing the earlier 80 cases changed only Base discovery,
which now includes the new synthetic Base; their query outputs were unchanged.

## Required Exo guard

The bounded contract is calendar-day attention: `due`, `review_on`, `week_start`
and `week_end` must be valid `YYYY-MM-DD` values or absent/null. Exo's existing
metadata validator enforces it on writes and provides a read-only
`--attention-dates-only` scan preflight. That mode validates YAML and dates without
rejecting unknown/missing statuses, preserving the locked status policy.

The authorized read-only private inventory found no date forms outside that
contract. No personal date migration is needed. Date-time reminders, native
rollover of malformed dates, general property coercion and attachment query
features are not required to close this audit. A future requirement must add
native evidence and corresponding implementation rather than infer compatibility.

## Reproduce

Use the exact disposable-vault procedure in [compatibility.md](compatibility.md).
For the additional observations, run:

```sh
npm run capture:native -- --vault NitrideFixture --path /absolute/disposable/NitrideFixture \
  --scenarios tests/fixtures/audit-scenarios.json --out tests/fixtures/audit-native-results.json
npm run check
```

Do not edit recordings to obtain passing tests. The audit recording intentionally
retains divergent native outputs; the main conformance suite tests only the stated
matching subset. Clock tests replace the external wall clock only in the child
process; production clock/configuration and the desktop application are untouched.
Official date semantics are described in [Obsidian's public function reference](https://obsidian.md/help/bases/functions).

This closes the bounded compatibility questions once Exo installs the corrected
bundle and date preflight and verifies its deployed queries. It does not establish
full Base parity or phone-originated Voice acceptance.
