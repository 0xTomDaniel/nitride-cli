import { build } from "esbuild";
import { readFileSync, chmodSync, writeFileSync, copyFileSync } from "node:fs";
const { version } = JSON.parse(readFileSync("package.json", "utf8"));
await build({
  define: { NITRIDE_VERSION: JSON.stringify(version) },
  minify: true,
  entryPoints: ["src/cli.ts"],
  outfile: "skills/nitride/scripts/nitride.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  sourcemap: true,
  legalComments: "eof",
  banner: {
    js: '#!/usr/bin/env node\nimport { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
});
chmodSync("skills/nitride/scripts/nitride.mjs", 0o755);

copyFileSync("LICENSE", "skills/nitride/LICENSE");
writeFileSync(
  "skills/nitride/THIRD_PARTY_NOTICES.txt",
  ["yaml", "zod"]
    .map(
      (name) =>
        `${name}\n${readFileSync(`node_modules/${name}/LICENSE`, "utf8")}`,
    )
    .join("\n\n"),
);
