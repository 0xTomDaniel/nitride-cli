// Run the shipped skill, outside the checkout and without node_modules.
import { strict as assert } from "node:assert";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
const source = resolve(process.argv[2] ?? ".");
const temp = mkdtempSync(join(tmpdir(), "nitride-package-"));
function fingerprint(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      const p = join(dir, e.name);
      return e.isDirectory()
        ? fingerprint(p, base)
        : [
            {
              path: relative(base, p),
              sha256: createHash("sha256")
                .update(readFileSync(p))
                .digest("hex"),
            },
          ];
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}
try {
  const installed = join(temp, "installed-skill"),
    vault = join(temp, "vault");
  cpSync(join(source, "skills/nitride"), installed, { recursive: true });
  cpSync(join(source, "tests/fixtures/vault"), vault, { recursive: true });
  const recording = JSON.parse(
    readFileSync(join(source, "tests/fixtures/native-results.json"), "utf8"),
  );
  const scenarios = JSON.parse(
    readFileSync(join(source, "tests/fixtures/scenarios.json"), "utf8"),
  );
  assert.deepEqual(
    recording.cases.map((c) => ({ name: c.name, args: c.args })),
    scenarios.map((c) => ({ name: c.name, args: c.args })),
    "Every required scenario must have a recording",
  );
  const before = fingerprint(vault);
  assert.deepEqual(before, recording.provenance.fixtures);
  const run = (args) =>
    spawnSync(
      process.execPath,
      [join(installed, "scripts/nitride.mjs"), ...args],
      { encoding: "utf8", cwd: temp, timeout: 10000 },
    );
  for (const c of recording.cases) {
    const result = run([
      "--vault-path",
      vault,
      ...(c.clockDate ? ["--date", c.clockDate] : []),
      ...(c.activeFile ? ["--active-file", c.activeFile] : []),
      ...c.args,
    ]);
    assert.equal(result.status, 0, `${c.name}: ${result.stderr}`);
    assert.equal(result.stderr, "", c.name);
    if (c.args.includes("format=json"))
      assert.deepEqual(JSON.parse(result.stdout), JSON.parse(c.stdout), c.name);
    else assert.equal(result.stdout, c.stdout, c.name);
  }
  assert.deepEqual(
    fingerprint(vault),
    before,
    "read-only commands must not mutate vault",
  );
  for (const flag of ["--help", "--version"])
    assert.equal(run([flag]).status, 0);
  writeFileSync(
    join(vault, "Failure.base"),
    JSON.stringify({
      views: [
        {
          type: "table",
          name: "Unsupported",
          filters: 'file.hasLink("anything")',
        },
      ],
    }),
  );
  const failure = run([
    "--vault-path",
    vault,
    "base:query",
    "path=Failure.base",
  ]);
  assert.equal(failure.status, 1);
  assert.equal(failure.stdout, "");
  assert.match(failure.stderr, /Unsupported/);
  const mutation = run(["--vault-path", vault, "base:create"]);
  assert.equal(mutation.status, 1);
  assert.equal(mutation.stdout, "");
  console.log(
    `${recording.cases.length} native cases + help/version/failure checks passed from an isolated installed skill; ${process.platform} ${process.version}`,
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
