import { it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Public CLI Seam; substitute only the external wall clock in the child process.
// Native today() is documented as local midnight; these are explicit owner-date
// expectations, not claims that the reference application's clock was changed.
it.each([
  ["2026-09-08T05:59:59Z", "2026-09-07"],
  ["2026-09-08T06:00:00Z", "2026-09-08"],
  ["2026-03-08T06:59:59Z", "2026-03-07"],
  ["2026-03-08T07:00:00Z", "2026-03-08"],
  ["2026-03-08T08:59:59Z", "2026-03-08"],
  ["2026-03-08T09:00:00Z", "2026-03-08"],
  ["2026-11-01T05:59:59Z", "2026-10-31"],
  ["2026-11-01T06:00:00Z", "2026-11-01"],
  ["2026-11-01T07:59:59Z", "2026-11-01"],
  ["2026-11-01T08:00:00Z", "2026-11-01"],
])("uses Denver's calendar day at %s", (instant, day) => {
  const root = mkdtempSync(join(tmpdir(), "nitride-clock-"));
  try {
    const clock = join(root, ".clock.cjs");
    writeFileSync(
      clock,
      `const RealDate = Date; globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [${JSON.stringify(instant)}])); } static now() { return new RealDate(${JSON.stringify(instant)}).getTime(); } };`,
    );
    writeFileSync(
      join(root, "Clock.base"),
      JSON.stringify({
        views: [
          { type: "table", name: "Today", filters: "review_on == today()" },
        ],
      }),
    );
    writeFileSync(join(root, "Expected.md"), `---\nreview_on: ${day}\n---\n`);
    const result = spawnSync(
      process.execPath,
      [
        "--require",
        clock,
        resolve("skills/nitride/scripts/nitride.mjs"),
        "--vault-path",
        root,
        "--timezone",
        "America/Denver",
        "base:query",
        "path=Clock.base",
        "format=paths",
      ],
      { encoding: "utf8", env: { ...process.env, TZ: "Pacific/Honolulu" } },
    );
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe("Expected.md\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
