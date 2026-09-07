import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const executable = resolve("skills/nitride/scripts/nitride.mjs");
const vault = resolve("tests/fixtures/vault");
export function run(args: string[], root = vault) {
  return spawnSync(
    process.execPath,
    [executable, "--vault-path", root, ...args],
    { encoding: "utf8", timeout: 10000 },
  );
}
const recording = JSON.parse(
  readFileSync("tests/fixtures/native-results.json", "utf8"),
) as {
  cases: {
    name: string;
    args: string[];
    stdout: string;
    activeFile?: string;
    clockDate?: string;
  }[];
};
describe("public CLI: native Base conformance", () => {
  for (const c of recording.cases.filter((c) => c.args[0] === "base:query"))
    it(c.name + " " + c.args.join(" "), () => {
      const result = run([
        ...(c.clockDate ? ["--date", c.clockDate] : []),
        ...c.args,
      ]);
      expect(result.stderr).toBe("");
      expect(result.status).toBe(0);
      if (c.args.includes("format=json"))
        expect(JSON.parse(result.stdout)).toEqual(JSON.parse(c.stdout));
      else expect(result.stdout).toBe(c.stdout);
    });
  it("lists views using explicit headless active-file context", () => {
    const c = recording.cases.find((c) => c.args[0] === "base:views")!;
    const result = run(["--active-file", c.activeFile!, ...c.args]);
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toBe(c.stdout);
  });
  it("discovers the same Base files in the synthetic vault", () => {
    const c = recording.cases.find((c) => c.args[0] === "bases")!;
    const result = run([
      ...(c.clockDate ? ["--date", c.clockDate] : []),
      ...c.args,
    ]);
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toBe(c.stdout);
  });
});
