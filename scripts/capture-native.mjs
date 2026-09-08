import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { resolve, join, relative } from "node:path";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
const { values } = parseArgs({
  options: {
    vault: { type: "string" },
    path: { type: "string" },
    binary: { type: "string", default: "obsidian" },
    out: { type: "string", default: "tests/fixtures/native-results.json" },
    scenarios: { type: "string", default: "tests/fixtures/scenarios.json" },
  },
});
if (!values.vault || !values.path)
  throw Error(
    "Provide --vault <registered disposable vault> --path <its absolute path>",
  );
const root = realpathSync(values.path);
const invoke = (args) => {
  const p = spawnSync(values.binary, [`vault=${values.vault}`, ...args], {
    encoding: "utf8",
    timeout: 15000,
  });
  if (p.error || p.status !== 0)
    throw Error(`Native command failed: ${args[0]}: ${p.error ?? p.stderr}`);
  return { stdout: p.stdout, stderr: p.stderr, exitCode: p.status };
};
if (realpathSync(invoke(["vault", "info=path"]).stdout.trim()) !== root)
  throw Error("Wrong native vault");
function inventory(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.name !== ".obsidian")
    .flatMap((e) => {
      if (e.isSymbolicLink()) throw Error("No symlinks in native fixtures");
      const p = join(dir, e.name);
      return e.isDirectory()
        ? inventory(p, base)
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
const expected = inventory(resolve("tests/fixtures/vault"));
if (JSON.stringify(inventory(root)) !== JSON.stringify(expected))
  throw Error(
    "Native vault must contain only an exact copy of tests/fixtures/vault (plus .obsidian)",
  );
const scenarios = JSON.parse(readFileSync(values.scenarios, "utf8"));
const cases = [];
const captureDay = new Intl.DateTimeFormat("en-CA").format(new Date());
for (const scenario of scenarios) {
  if (scenario.activeFile) invoke(["open", `path=${scenario.activeFile}`]);
  const attempts = [];
  let result;
  for (let i = 0; i < 4; i++) {
    result = invoke(scenario.args);
    attempts.push(result);
    if (result.stdout.trim()) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  if (!result.stdout.trim() || result.stdout.startsWith("Error:"))
    throw Error(`Missing successful output for ${scenario.name}`);
  if (scenario.args.includes("format=json")) JSON.parse(result.stdout);
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type) => dateParts.find((p) => p.type === type).value;
  cases.push({
    ...scenario,
    ...result,
    attempts,
    ...(scenario.liveClock
      ? {
          clockDate: `${datePart("year")}-${datePart("month")}-${datePart("day")}`,
        }
      : {}),
  });
}
if (JSON.stringify(inventory(root)) !== JSON.stringify(expected))
  throw Error("Native capture mutated fixture contents");
if (new Intl.DateTimeFormat("en-CA").format(new Date()) !== captureDay)
  throw Error("Date changed during native capture; retry on one calendar day");
const provenance = {
  timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
  provider: "Official Obsidian CLI",
  version: invoke(["version"]).stdout.trim(),
  capturedAt: new Date().toISOString(),
  platform: process.platform,
  disposableVault: true,
  normalization: "None",
  fixtures: expected,
};
writeFileSync(
  values.out,
  JSON.stringify({ provenance, cases }, null, 2) + "\n",
);
writeFileSync("tests/fixtures/native-help.txt", invoke(["help"]).stdout);
console.log(`Captured ${cases.length} cases from a verified disposable vault`);
