# Implementation status

Completed in the Bases implementation branch:

1. Public MIT repository, product contract, source and evidence rules.
2. Disposable-vault native characterization: 80 cases; 102-command inventory.
3. TypeScript CLI: discovery, read-only queries, explicit view listing,
   dates/timezones, output formats, and explicit failure behavior.
4. Bundled executable and portable skill, with source maps and dependency notices.
5. Public CLI regressions, isolated package testing, native provenance checks,
   and macOS/Linux CI configuration.

See [validation](validation.md) for actual run results and their limits.

Remaining separate work:

- The initial implementation is merged; land the linked-period increment. npm registry publication is not performed.
- Integrate into Exo. Its current Voice container does not have Node on PATH;
  runtime materialization is required before routing agents to Nitride there.
- Resolve Exo-specific status-filter policy and required unsupported planning
  views in their owning scope. Linked-week/sprint filters now have a recorded implementation; Exo must update its pin and validate the actual views. This CLI does
  not by itself close all Exo Phase 2 retrieval requirements.
- Characterize additional functions/formulas/view options and command families
  before expanding the supported contract. Mutations remain deferred.
- Independent model-based skill evaluation and live Voice acceptance are not
  established by deterministic CLI tests.

The earlier coordination-parent/parity-spike Linear proposal was not executed
by this implementation. No issues or labels were created or routed. Octo
handoff still requires separate canonical repository metadata and bootstrap
verification; repository existence does not establish orchestration readiness.
