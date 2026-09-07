# Nitride agent instructions

Read `docs/spec.md` and `docs/compatibility.md` before changing CLI behavior.

- Implement in TypeScript targeting Node.js; ship bundled JavaScript.
- Use official public documentation and black-box official CLI observations.
  Never inspect or copy Obsidian proprietary source, packaged JavaScript,
  minified bundles, or private implementation details.
- Run native characterization only against disposable synthetic vaults.
  Do not commit personal vault content, session logs, credentials, or app profiles.
- Test through the public command Interface. Establish expected behavior with
  official CLI observations before claiming compatibility.
- Fail explicitly on unsupported syntax or incomplete retrieval. Never report
  a partial scan or transport failure as a successful empty result.
- Keep task/reminder policy in the caller's `.base` definitions; do not create
  a competing task store or hard-code one user's workflow.
- Document intentional differences, supported reference versions, and test limits.
- Keep this file canonical; `CLAUDE.md` is a symlink to it.
- No CLI test/build suite exists at initialization. Add meaningful public-command
  tests and type/build checks with the first executable slice; run those checks
  before handing off executable changes. For documentation, check links and diff.
