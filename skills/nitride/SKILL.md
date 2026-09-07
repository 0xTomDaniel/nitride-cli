---
name: nitride
description: Query Obsidian Base views directly from a local Markdown vault without the Obsidian desktop app. Use for headless Base discovery, listing views, and fresh task or reminder retrieval defined by .base files, especially on Linux. Supports a read-only subset; not note editing, sync, or desktop/plugin automation.
---

# Nitride

Use the bundled CLI for a fresh query over the vault's existing `.base` definitions.
It requires Node.js 22 or newer. Resolve `scripts/nitride.mjs` relative to this
skill directory; it needs no npm install, compilation, or network access.

1. Establish the vault's absolute filesystem path from the user or available
   workspace context. Do not infer which personal vault to use when ambiguous.
2. Check `node --version`. If Node is unavailable, report that prerequisite;
   a successful skill installation does not prove the agent has a runtime.
3. Discover and inspect views as needed:

   ```sh
   node <skill-directory>/scripts/nitride.mjs --vault-path <vault> bases
   node <skill-directory>/scripts/nitride.mjs --vault-path <vault> base:views path="Queries/Tasks.base"
   ```

4. Query the required view with an explicit timezone for date-sensitive work:

   ```sh
   node <skill-directory>/scripts/nitride.mjs --vault-path <vault> --timezone America/Denver base:query path="Queries/Tasks.base" view="Due Today" format=json
   ```

   Use the user's timezone, not the example value. Default is UTC. `--date`
   sets an explicit scenario/as-of date; don't substitute an old date during
   fresh retrieval. Inspect [supported behavior](references/compatibility.md)
   when a query fails or its syntax is unfamiliar.

5. Check exit status before interpreting stdout. Exit 1 means the query failed:
   do not describe that as an empty queue or complete scan. Report unsupported
   syntax or metadata errors and keep required workflow coverage open. Do not
   silently weaken filters, substitute yesterday's results, or claim missing
   features are supported.
6. Report the queried view, chosen timezone/as-of date, and relevant results.
   De-duplicate overlapping views by vault-relative `path`; reminders can exist
   on tasks and other notes. Do not add view counts as if they were disjoint.

The CLI is read-only. Keep task/status rules in the user's Base definitions.
An unsupported view does not prevent querying a supported view from the same
Base. Do not run native characterization against a user's personal vault.
