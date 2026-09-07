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
- Run `npm run check` before handing off changes. It checks format/types, builds,
  tests the public command Interface, and verifies an isolated installed skill.
- Commit regenerated skill executable/source map and dependency notices with source
  changes. `skills/nitride/scripts/nitride.mjs` is generated; edit TypeScript source.
- Run native capture only through the documented disposable-vault procedure.
  Review reference-output changes independently; never adjust recordings to pass.
