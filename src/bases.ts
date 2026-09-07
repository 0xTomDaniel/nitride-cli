import { readFileSync } from "node:fs";
import { basename, extname, dirname, join } from "node:path";
import { parseDocument } from "yaml";
import { z } from "zod";
import {
  expression,
  compare,
  property,
  scalar,
  type Row,
} from "./expression.js";
function readText(path: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(path));
  } catch (error) {
    if (error instanceof TypeError) throw Error("Invalid UTF-8 in vault file");
    throw error;
  }
}

const mapping = z.record(z.string(), z.unknown());
const sortSchema = z.strictObject({
  property: z.string(),
  direction: z.enum(["ASC", "DESC"]),
});
const viewSchema = z.strictObject({
  type: z.enum(["table", "cards", "list"]),
  name: z.string(),
  filters: z.unknown().optional(),
  order: z.array(z.string()).optional(),
  sort: z.array(sortSchema).optional(),
  limit: z.number().int().nonnegative().optional(),
});
const baseSchema = z.strictObject({
  filters: z.unknown().optional(),
  views: z.array(mapping),
});
function yaml(source: string): unknown {
  const d = parseDocument(source, { uniqueKeys: true, prettyErrors: false });
  if (d.errors.length || d.warnings.length)
    throw Error(
      `Invalid or unsupported YAML: ${d.errors[0]?.message ?? d.warnings[0]?.message}`,
    );
  return d.toJS({ maxAliasCount: 0 }) as unknown;
}
function metadata(text: string): Record<string, unknown> {
  text = text.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") return {};
  const end = lines.findIndex((line, i) => i > 0 && line === "---");
  if (end < 0) throw Error("Unclosed frontmatter");
  return mapping.parse(yaml(lines.slice(1, end).join("\n")) ?? {});
}
function predicate(spec: unknown, today: string): (row: Row) => boolean {
  if (spec === undefined) return () => true;
  if (typeof spec === "string") return expression(spec, today);
  const obj = mapping.parse(spec),
    keys = Object.keys(obj);
  if (keys.length !== 1 || !["and", "or", "not"].includes(keys[0]!))
    throw Error("Filter must be text or one and/or/not list");
  const op = keys[0]!;
  const children = z
    .array(z.unknown())
    .parse(obj[op])
    .map((c) => predicate(c, today));
  return (row) => {
    const results = children.map((f) => f(row));
    return op === "and"
      ? results.every(Boolean)
      : op === "or"
        ? results.some(Boolean)
        : !results.some(Boolean);
  };
}
function column(key: string, raw = false): (row: Row) => unknown {
  const explicitNote = key.startsWith("note.");
  if (explicitNote) key = key.slice(5);
  if (!explicitNote && key.startsWith("file.")) {
    const field = key.slice(5);
    if (!["path", "name", "ext", "folder"].includes(field))
      throw Error(`Unsupported column: ${key}`);
    return (row) => property(row, "file", field);
  }
  if (!explicitNote && (key.startsWith("formula.") || key.includes(".")))
    throw Error(`Unsupported column: ${key}`);
  return (row) =>
    raw
      ? Object.hasOwn(row.note, key)
        ? row.note[key]
        : null
      : property(row, "note", key);
}
function display(value: unknown, key: string): string | null {
  key = key.replace(/^note\./, "");
  if (Array.isArray(value))
    return value.length
      ? value.map((v) => display(scalar(v), key) ?? "").join(", ")
      : null;
  const v = scalar(value);
  if (v === null || v === "") return null;
  if (key === "tags") {
    if (typeof v !== "string") throw Error("Tags must be text");
    return "#" + v.replace(/^#/, "");
  }
  return String(v);
}
function loadBase(
  vault: { root: string; paths: string[] },
  params: Record<string, string>,
  active: string | undefined,
): unknown {
  let selected = params.path ?? active;
  if (params.file && !params.path) {
    const name = params.file.replace(/\.base$/, "");
    const matches = vault.paths.filter(
      (p) => p.endsWith(".base") && basename(p, ".base") === name,
    );
    if (matches.length !== 1)
      throw Error("Base file name is missing or ambiguous; use path=");
    selected = matches[0];
  }
  if (!selected) throw Error("Provide path=, file= or --active-file");
  if (!vault.paths.includes(selected) || !selected.endsWith(".base"))
    throw Error("Base path must name a visible .base file within the vault");
  return yaml(readText(join(vault.root, selected)));
}
export function views(
  vault: { root: string; paths: string[] },
  params: Record<string, string>,
  active: string | undefined,
): string {
  const base = z
    .object({
      views: z.array(z.object({ name: z.string(), type: z.string() })),
    })
    .parse(loadBase(vault, params, active));
  return base.views.map((v) => `${v.name}\t${v.type}`).join("\n");
}
export function query(
  vault: { root: string; paths: string[] },
  params: Record<string, string>,
  active: string | undefined,
  today: string,
): string {
  const base = baseSchema.parse(loadBase(vault, params, active));
  const raw = params.view
    ? base.views.find((v) => v.name === params.view)
    : base.views[0];
  if (!raw) throw Error("View not found");
  const view = viewSchema.parse(raw);
  const globalFilter = predicate(base.filters, today),
    viewFilter = predicate(view.filters, today);
  const keys = view.order ?? ["file.name"];
  const getters = keys.map((key) => column(key, true));
  const sorts = (view.sort ?? []).map((s) => ({
    ...s,
    get: column(s.property),
  }));
  const fileLabels = new Map([
    ["file.ext", "file extension"],
    ["file.folder", "folder"],
  ]);
  const labels = keys.map((k) =>
    k.startsWith("note.")
      ? k.slice(5)
      : (fileLabels.get(k) ?? k.replaceAll(".", " ")),
  );
  if (new Set(labels).size !== labels.length || labels.includes("path"))
    throw Error("Duplicate/reserved output column label");
  const rows: Row[] = [];
  for (const path of vault.paths) {
    const ext = extname(path),
      folder = dirname(path);
    const row: Row = {
      note: ext === ".md" ? metadata(readText(join(vault.root, path))) : {},
      file: {
        path,
        name: basename(path, ext),
        ext: ext.slice(1),
        folder: folder === "." ? "" : folder,
      },
    };
    if (globalFilter(row) && viewFilter(row)) rows.push(row);
  }
  const collator = new Intl.Collator("en", {
    numeric: true,
    sensitivity: "base",
  });
  rows.sort(
    (a, b) =>
      collator.compare(a.file.name!, b.file.name!) ||
      collator.compare(a.file.path!, b.file.path!),
  );
  for (const sort of [...sorts].reverse())
    rows.sort((a, b) => {
      const x = scalar(sort.get(a)),
        y = scalar(sort.get(b));
      if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
      return compare(x, y)! * (sort.direction === "DESC" ? -1 : 1);
    });
  const result = !view.limit ? rows : rows.slice(0, view.limit);
  const cells = result.map((row) =>
    getters.map((get, i) => display(get(row), keys[i]!)),
  );
  const format = params.format ?? "json";
  if (format === "paths") return result.map((row) => row.file.path).join("\n");
  if (format === "json")
    return JSON.stringify(
      result.map((row, i) => ({
        path: row.file.path,
        ...Object.fromEntries(labels.map((label, j) => [label, cells[i]![j]])),
      })),
      null,
      2,
    );
  const table = [labels, ...cells.map((row) => row.map((v) => v ?? ""))];
  if (format === "csv" || format === "tsv") {
    const delimiter = format === "csv" ? "," : "\t";
    return table
      .map((row) =>
        row
          .map((v) =>
            v.includes(delimiter) || /["\r\n]/.test(v)
              ? '"' + v.replaceAll('"', '""') + '"'
              : v,
          )
          .join(delimiter),
      )
      .join("\n");
  }
  if (format === "md") {
    for (const row of table)
      for (let i = 0; i < row.length; i++)
        row[i] = row[i]!.replaceAll("|", "\\|");
    const widths = labels.map((_, i) =>
      Math.max(...table.map((row) => row[i]!.length)),
    );
    const lines = table.map(
      (row) =>
        "| " +
        row
          .map((v, i) => {
            const gap = widths[i]! - v.length;
            return (
              " ".repeat(Math.floor(gap / 2)) +
              v +
              " ".repeat(Math.ceil(gap / 2))
            );
          })
          .join(" | ") +
        " |",
    );
    lines.splice(
      1,
      0,
      "| " + widths.map((n) => "-".repeat(n)).join(" | ") + " |",
    );
    return lines.join("\n");
  }
  throw Error(`Unsupported output format: ${format}`);
}
