# Nitride product contract

Status: agreed product direction; implementation details marked pending below.

## Problem statement

Agents on headless Linux can read Markdown files but cannot rely on Obsidian's
running desktop application to execute saved Base views. Reading yesterday's
results or the query definition is not a fresh scan. Ad hoc shell queries can
reconstruct filters differently each session and lose coverage.

## Solution

Provide an independent CLI that evaluates a documented subset of Obsidian's
saved Base queries directly over vault files. Start with read-only Base commands,
then expand only through observed compatibility contracts.

## User stories

1. As an agent, I can discover Base files in an explicit vault.
2. As an agent, I can execute a named view and receive current matching notes.
3. As a user, I can maintain filters in Obsidian and reuse them headlessly.
4. As an agent, I can distinguish an empty result from an incomplete scan.
5. As a user, I can query reminders on any note type, including tasks.
6. As an integrator, I can identify overlapping results by their vault-relative path.
7. As a maintainer, I can run the same public-command scenarios against both CLIs.
8. As an agent-skill consumer, I can run installed commands without a build step.
9. As a user, I can know which Obsidian version and command subset were verified.

## Implementation decisions

- Owner/repository: EmberAGI/nitride-cli; public, MIT.
- TypeScript/Node; distribute compiled, bundled JavaScript. Exact runtime floor,
  package name, release mechanism, and dependency choices remain pending.
- The public CLI Interface is the conformance Seam. The native command runner
  and Nitride runner are test Adapters; production execution requires no desktop.
- Query interpretation belongs in one Module behind that Interface. It provides
  Leverage to all callers and Locality for syntax/semantic fixes.
- Vault Markdown and Base definitions remain authoritative. No second task store.
- A reminder is an attention date on a note; it need not be a task. Overlapping
  views do not justify adding their counts. Workflow policy remains with callers.
- Do not normalize terminal statuses globally: different filters may intentionally
  distinguish plain and linked values. Standardizing user views is separate work.
- The immediate slice is discovery/read-only Base queries. Mutations are deferred.
- Agent Skills packaging is required product scope after the CLI contract settles.
  Support ordinary folder installation and `npx skills`; a native plugin wrapper
  is optional future distribution, not a separate implementation.

## Testing decisions

Use synthetic fixtures and public CLI processes. Record reference app/installer
version, platform, invocation, outputs, exit status, and normalization. Verify
observable output and vault effects, not internal implementation structure.
Run native tests in a disposable vault, and headless tests on macOS and Debian
without a running Obsidian app. Native characterization and headless regression
are distinct evidence; a captured subset does not prove the full Base language.

## Out of scope

Desktop UI emulation, plugin/developer execution, an MCP server, sync-service
replacement, full Obsidian compatibility, and modifying Exo planning policies
are outside the initial slice. Inventory their command surfaces before assigning
future implementation scope.

## Further notes

The May discussion resolved “1:1 map” as inventory and classification of every
command, not a promise to implement every desktop behavior. September selected
Bases first. The full inventory remains pending.

These decisions were recovered from the May 31 naming/intake discussion and
September 6–7 Bases-first discussion. Private transcripts remain outside this repo.
No new ADR is required at initialization; write one if subsequent work exposes
a consequential tradeoff needing a durable rationale.
