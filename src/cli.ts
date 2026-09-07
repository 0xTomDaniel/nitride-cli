import { parseArgs } from "node:util";
import { openVault } from "./vault.js";
import { query, views } from "./bases.js";
import { isoDate } from "./expression.js";
declare const NITRIDE_VERSION: string;
const help = `Nitride — headless Obsidian Base queries

nitride --vault-path <directory> <command> [key=value ...]

bases          List visible .base files
base:views     List views; select with path=, file= or --active-file
base:query     Query a view; path= or file=, view=, format=json|csv|tsv|md|paths

--active-file <vault-relative .base path>  Explicit desktop-context replacement
--timezone <IANA zone>                    Clock timezone (default UTC)
--date <YYYY-MM-DD>                       Explicit date for today() in queries
--help                                   Show this help
--version                                Show Nitride version

Read-only subset; unsupported features fail on stderr with exit 1.
`;
function main(): string {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "vault-path": { type: "string" },
      "active-file": { type: "string" },
      timezone: { type: "string", default: "UTC" },
      date: { type: "string" },
      help: { type: "boolean" },
      version: { type: "boolean" },
    },
  });
  if (values.help || positionals[0] === "help") return help.trimEnd();
  if (values.version || positionals[0] === "version")
    return `nitride ${NITRIDE_VERSION}`;
  const command = positionals[0];
  if (!command) throw Error("Provide a command; use --help");
  if (!["bases", "base:views", "base:query"].includes(command))
    throw Error(`Unsupported command: ${command}`);
  if (!values["vault-path"]) throw Error("Provide --vault-path <directory>");
  const params: Record<string, string> = {};
  for (const arg of positionals.slice(1)) {
    const eq = arg.indexOf("=");
    const key = arg.slice(0, eq),
      value = arg.slice(eq + 1);
    if (
      eq < 1 ||
      !["path", "file", "view", "format"].includes(key) ||
      Object.hasOwn(params, key) ||
      !value
    )
      throw Error("Unknown, duplicate or empty parameter");
    params[key] = value;
  }
  if (params.file && params.path) throw Error("Use either file= or path=");
  if (command === "bases" && Object.keys(params).length)
    throw Error("bases accepts no parameters");
  if (command === "base:views" && (params.view || params.format))
    throw Error("base:views accepts only file= or path=");
  if (
    params.format &&
    !["json", "csv", "tsv", "md", "paths"].includes(params.format)
  )
    throw Error("Unsupported output format");
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: values.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  const today = values.date
    ? isoDate(values.date)
    : `${part("year")}-${part("month")}-${part("day")}`;
  const vault = openVault(values["vault-path"]);
  if (command === "bases")
    return vault.paths.filter((p) => p.endsWith(".base")).join("\n");
  if (command === "base:views")
    return views(vault, params, values["active-file"]);
  return query(vault, params, values["active-file"], today);
}
try {
  const output = main();
  if (output) process.stdout.write(output + "\n");
} catch (error) {
  process.stderr.write(
    `Error: ${error instanceof Error ? error.message : "Command failed"}\n`,
  );
  process.exitCode = 1;
}
