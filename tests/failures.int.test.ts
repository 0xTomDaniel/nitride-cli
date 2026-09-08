import { it, expect } from "vitest";
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  symlinkSync,
  rmSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
const executable = resolve("skills/nitride/scripts/nitride.mjs");
function invoke(root: string, args: string[]) {
  return spawnSync(
    process.execPath,
    [executable, "--vault-path", root, ...args],
    { encoding: "utf8", timeout: 10000 },
  );
}
function scenario(work: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), "nitride-test-"));
  try {
    work(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const base = (filter: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    views: [{ type: "table", name: "Test", filters: filter, ...extra }],
  });
function fails(root: string, args: string[], message: string | RegExp) {
  const p = invoke(root, args);
  expect(p.status).not.toBe(0);
  expect(p.stdout).toBe("");
  expect(p.stderr).toMatch(message);
}
it("rejects unsupported functions in an empty selection", () =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base('file.hasLink("Anything")'));
    fails(root, ["base:query", "path=Test.base"], /Unsupported/);
  }));
it("rejects ambiguous linked notes instead of selecting an arbitrary period", () =>
  scenario((root) => {
    mkdirSync(join(root, "Other"));
    writeFileSync(
      join(root, "Period.md"),
      "---\nweek_start: 2026-09-07\n---\n",
    );
    writeFileSync(
      join(root, "Other/Period.md"),
      "---\nweek_start: 2026-08-01\n---\n",
    );
    writeFileSync(
      join(root, "Test.base"),
      base('file("[[Period]]").properties.week_start != null'),
    );
    fails(root, ["base:query", "path=Test.base"], /Ambiguous linked-file/);
  }));
it("rejects traversal and nested list values in linked-period expressions", () =>
  scenario((root) => {
    // A Base file is not itself a native query candidate. Exercise resolution
    // from a real Markdown row rather than depending on the old candidate bug.
    writeFileSync(join(root, "Note.md"), "# Synthetic note\n");
    writeFileSync(
      join(root, "Test.base"),
      base('file("../../Outside").properties.week_start != null'),
    );
    fails(root, ["base:query", "path=Test.base"], /leaves vault/);
    writeFileSync(join(root, "A.md"), '---\nweek: [["nested"]]\n---\n');
    writeFileSync(
      join(root, "Test.base"),
      base("list(week).filter(value != null).length > 0"),
    );
    fails(root, ["base:query", "path=Test.base"], /Unsupported list/);
  }));
it.each([
  'true || file.hasLink("Anything")',
  { or: ["true", 'file.hasLink("Anything")'] },
  { and: ["false", 'file.hasLink("Anything")'] },
  { not: ["true", 'file.hasLink("Anything")'] },
])("validates syntax even in skipped filter branches: %j", (filters) =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base("true", { filters }));
    fails(root, ["base:query", "path=Test.base"], /Unsupported/);
  }),
);
it("rejects unsupported selected view features instead of dropping them", () =>
  scenario((root) => {
    writeFileSync(
      join(root, "Test.base"),
      base("true", { groupBy: { property: "status" } }),
    );
    fails(root, ["base:query", "path=Test.base"], /groupBy/);
  }));
it("rejects unsupported file properties even with no matching notes", () =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base("false && file.ctime == null"));
    fails(root, ["base:query", "path=Test.base"], /Unsupported file property/);
  }));
it("rejects duplicate metadata rather than returning a partial scan", () =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base('file.ext == "md"'));
    writeFileSync(join(root, "A.md"), "---\nstatus: Todo\n---\n");
    writeFileSync(join(root, "Z.md"), "---\nstatus: Todo\nstatus: Done\n---\n");
    const before = readFileSync(join(root, "Z.md"));
    fails(root, ["base:query", "path=Test.base"], /YAML/);
    expect(readFileSync(join(root, "Z.md"))).toEqual(before);
  }));
it("rejects unclosed frontmatter", () =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base("true"));
    writeFileSync(join(root, "A.md"), "---\nx: 2");
    fails(root, ["base:query", "path=Test.base"], /Unclosed/);
  }));
it("rejects malformed UTF-8 rather than replacing query data", () =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base("true"));
    writeFileSync(join(root, "A.md"), Buffer.from([0xff]));
    fails(root, ["base:query", "path=Test.base"], /UTF-8/);
  }));
it("rejects symlinks instead of reading outside the selected vault", () =>
  scenario((root) => {
    symlinkSync(executable, join(root, "Linked.md"));
    fails(root, ["bases"], /symlink/);
  }));
it("rejects traversal and mutations and leaves files unchanged", () =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base("true"));
    const before = readdirSync(root);
    fails(root, ["base:query", "path=../outside.base"], /within the vault/);
    fails(root, ["base:create", "path=Test.base"], /Unsupported command/);
    expect(readdirSync(root)).toEqual(before);
  }));
it("requires path for ambiguous Base names", () =>
  scenario((root) => {
    mkdirSync(join(root, "One"));
    mkdirSync(join(root, "Two"));
    for (const f of ["One", "Two"])
      writeFileSync(join(root, f, "Same.base"), base("true"));
    fails(root, ["base:query", "file=Same"], /ambiguous/);
    expect(invoke(root, ["base:query", "path=One/Same.base"]).status).toBe(0);
  }));
it("does not evaluate unsupported unselected views", () =>
  scenario((root) => {
    writeFileSync(
      join(root, "Test.base"),
      JSON.stringify({
        views: [
          {
            type: "table",
            name: "Not supported",
            filters: 'file.hasLink("x")',
          },
          { type: "table", name: "Supported", filters: "false" },
        ],
      }),
    );
    const p = invoke(root, ["base:query", "path=Test.base", "view=Supported"]);
    expect(p.status).toBe(0);
    expect(JSON.parse(p.stdout)).toEqual([]);
  }));
it("rejects invalid dates and timezones", () =>
  scenario((root) => {
    writeFileSync(
      join(root, "Test.base"),
      base('date("2026-02-30") < today()'),
    );
    fails(root, ["base:query", "path=Test.base"], /Invalid calendar date/);
    fails(root, ["--date", "2026-02-30", "bases"], /Invalid calendar date/);
    fails(root, ["--timezone", "Not/AZone", "bases"], /time zone/i);
  }));
it("uses an explicit clock for today and date filters", () =>
  scenario((root) => {
    writeFileSync(
      join(root, "Test.base"),
      base('file.ext == "md" && review_on <= today()'),
    );
    writeFileSync(join(root, "A.md"), "---\nreview_on: 2026-09-07\n---\n");
    expect(
      JSON.parse(
        invoke(root, ["--date", "2026-09-06", "base:query", "path=Test.base"])
          .stdout,
      ),
    ).toEqual([]);
    expect(
      JSON.parse(
        invoke(root, ["--date", "2026-09-07", "base:query", "path=Test.base"])
          .stdout,
      ),
    ).toEqual([{ path: "A.md", "file name": "A" }]);
  }));
it("rejects duplicate parameters and conflicting file selectors", () =>
  scenario((root) => {
    writeFileSync(join(root, "Test.base"), base("false"));
    fails(
      root,
      ["base:query", "path=Test.base", "path=Test.base"],
      /duplicate/,
    );
    fails(root, ["base:query", "path=Test.base", "file=Other"], /either/);
  }));
it("keeps private configuration outside discovery", () =>
  scenario((root) => {
    mkdirSync(join(root, ".obsidian"));
    writeFileSync(join(root, ".obsidian", "Private.base"), base("true"));
    expect(invoke(root, ["bases"]).stdout).toBe("");
  }));
it("provides help and version without a vault", () => {
  for (const flag of ["--help", "--version"]) {
    const p = spawnSync(process.execPath, [executable, flag], {
      encoding: "utf8",
    });
    expect(p.status).toBe(0);
    expect(p.stdout).toMatch(/nitride/i);
    expect(p.stderr).toBe("");
  }
});

it("rejects nested list cells instead of flattening unverified structures", () =>
  scenario((root) => {
    writeFileSync(
      join(root, "Test.base"),
      base('file.ext == "md"', { order: ["related"] }),
    );
    writeFileSync(join(root, "A.md"), "---\nrelated: [[one, two]]\n---\n");
    fails(root, ["base:query", "path=Test.base"], /Unsupported/);
  }));
it("keeps ordinary property names separate from JavaScript prototype keys", () =>
  scenario((root) => {
    writeFileSync(
      join(root, "Test.base"),
      base('file.ext == "md"', { order: ["toString"] }),
    );
    writeFileSync(join(root, "A.md"), "---\ntoString: saved text\n---\n");
    const result = invoke(root, ["base:query", "path=Test.base"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([
      { path: "A.md", toString: "saved text" },
    ]);
  }));
