/** An intentionally bounded Base expression interpreter. Never executes input as JS. */
export type Scalar = string | number | boolean | null;
export type Row = {
  note: Record<string, unknown>;
  file: Record<string, string>;
};
type Expr =
  | { kind: "literal"; value: Scalar }
  | { kind: "property"; scope: "note" | "file"; key: string }
  | { kind: "unary"; op: string; value: Expr }
  | { kind: "binary"; op: string; left: Expr; right: Expr }
  | { kind: "call"; name: string; args: Expr[]; target?: Expr }
  | { kind: "value" }
  | { kind: "linked-property"; link: Expr; key: string }
  | { kind: "length"; target: Expr };
export type ResolveFile = (link: string, from: Row) => Row | null;
type Value = Scalar | Scalar[];
const fields = new Set(["path", "name", "basename", "ext", "folder"]);
const methods = new Set(["startsWith", "endsWith", "contains", "filter"]);
const precedence: Record<string, number> = {
  "||": 1,
  "&&": 2,
  "==": 3,
  "!=": 3,
  "<": 3,
  "<=": 3,
  ">": 3,
  ">=": 3,
};
export function scalar(value: unknown): Scalar {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw Error("Unsupported list/object or non-finite property value");
}
export function property(
  row: Row,
  scope: "note" | "file",
  key: string,
): Scalar {
  const object = row[scope];
  return scalar(Object.hasOwn(object, key) ? object[key] : null);
}
export function compare(a: Scalar, b: Scalar): number | null {
  if (a === null || b === null) return null;
  if (typeof a === "number" || typeof b === "number") {
    const x = Number(a),
      y = Number(b);
    if (Number.isFinite(x) && Number.isFinite(y))
      return x === y ? 0 : x < y ? -1 : 1;
  }
  const x = String(a),
    y = String(b);
  return x === y ? 0 : x < y ? -1 : 1;
}
function equal(a: Scalar, b: Scalar): boolean {
  if (a === null || b === null) return a === b;
  // Boolean equality uses numeric coercion, not rendered-cell strings.
  if (typeof a === "boolean" || typeof b === "boolean")
    return Number(a) === Number(b);
  return compare(a, b) === 0;
}
export function isoDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw Error("Date must be YYYY-MM-DD");
  const date = new Date(value + "T00:00:00Z");
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw Error("Invalid calendar date");
  return value;
}
function tokenize(source: string): string[] {
  const result: string[] = [];
  let offset = 0;
  const token =
    /\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|&&|\|\||!=|==|<=|>=|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|[().,\[\]!<>+\-])/y;
  while (offset < source.trimEnd().length) {
    token.lastIndex = offset;
    const m = token.exec(source);
    if (!m) throw Error(`Unsupported expression syntax at offset ${offset}`);
    result.push(m[1]!);
    offset = token.lastIndex;
  }
  return result;
}
function stringValue(token: string): string {
  if (token.startsWith('"')) return JSON.parse(token) as string;
  // Single-quoted Base strings accept the same explicit escape repertoire.
  const body = token.slice(1, -1);
  let out = "";
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== "\\") {
      out += body[i];
      continue;
    }
    const c = body[++i];
    const escapes: Record<string, string> = {
      n: "\n",
      r: "\r",
      t: "\t",
      "'": "'",
      '"': '"',
      "\\": "\\",
    };
    if (c === undefined || !Object.hasOwn(escapes, c))
      throw Error("Unsupported string escape");
    out += escapes[c];
  }
  return out;
}
function parse(source: string): Expr {
  const tokens = tokenize(source);
  let offset = 0;
  let filterDepth = 0;
  const peek = () => tokens[offset];
  const take = () => {
    const t = tokens[offset++];
    if (t === undefined) throw Error("Incomplete expression");
    return t;
  };
  const expect = (token: string) => {
    if (take() !== token) throw Error(`Expected ${token}`);
  };
  function argumentsList(): Expr[] {
    expect("(");
    const args: Expr[] = [];
    if (peek() !== ")") {
      do {
        args.push(expression(0));
        if (peek() !== ",") break;
        take();
      } while (true);
    }
    expect(")");
    return args;
  }
  function atom(): Expr {
    const token = take();
    let node: Expr;
    if (token === "!" || token === "-" || token === "+")
      node = { kind: "unary", op: token, value: expression(4) };
    else if (token === "(") {
      node = expression(0);
      expect(")");
    } else if (token.startsWith('"') || token.startsWith("'"))
      node = { kind: "literal", value: stringValue(token) };
    else if (/^\d/.test(token))
      node = { kind: "literal", value: Number(token) };
    else if (["true", "false", "null"].includes(token))
      node = {
        kind: "literal",
        value: token === "null" ? null : token === "true",
      };
    else if (/^[A-Za-z_][A-Za-z_0-9]*$/.test(token)) {
      if (peek() === "(") {
        if (!["today", "date", "list", "file"].includes(token))
          throw Error(`Unsupported Base function: ${token}`);
        const args = argumentsList();
        if (args.length !== (token === "today" ? 0 : 1))
          throw Error(`Invalid argument count: ${token}`);
        if (token === "date" && args[0]?.kind === "literal") {
          if (typeof args[0].value !== "string")
            throw Error("date requires text");
          isoDate(args[0].value);
        }
        if (token === "file") {
          expect(".");
          expect("properties");
          let key: string;
          if (peek() === "[") {
            take();
            const k = take();
            if (!k.startsWith('"') && !k.startsWith("'"))
              throw Error("Property index must be literal text");
            key = stringValue(k);
            expect("]");
          } else {
            expect(".");
            key = take();
            if (!/^[A-Za-z_][A-Za-z_0-9]*$/.test(key))
              throw Error("Invalid linked property");
          }
          node = { kind: "linked-property", link: args[0]!, key };
        } else node = { kind: "call", name: token, args };
      } else if (token === "file" || token === "note") {
        let key: string;
        if (peek() === ".") {
          take();
          key = take();
          if (!/^[A-Za-z_][A-Za-z_0-9]*$/.test(key))
            throw Error("Invalid property");
        } else if (peek() === "[") {
          take();
          const k = take();
          if (!k.startsWith('"') && !k.startsWith("'"))
            throw Error("Property index must be literal text");
          key = stringValue(k);
          expect("]");
        } else throw Error("Use a named note/file property");
        if (token === "file" && !fields.has(key))
          throw Error(`Unsupported file property: ${key}`);
        node = { kind: "property", scope: token, key };
      } else if (token === "value" && filterDepth) node = { kind: "value" };
      else node = { kind: "property", scope: "note", key: token };
    } else throw Error(`Unsupported expression token: ${token}`);
    while (peek() === ".") {
      take();
      const name = take();
      if (name === "length") {
        if (node.kind !== "call" || !["list", "filter"].includes(node.name))
          throw Error("Only list length is supported");
        node = { kind: "length", target: node };
        continue;
      }
      if (!methods.has(name)) throw Error(`Unsupported method: ${name}`);
      if (name === "filter") filterDepth++;
      const args = argumentsList();
      if (name === "filter") filterDepth--;
      if (args.length !== 1) throw Error(`Invalid argument count: ${name}`);
      node = { kind: "call", name, target: node, args };
    }
    return node;
  }
  function expression(min: number): Expr {
    let left = atom();
    while (
      peek() !== undefined &&
      Object.hasOwn(precedence, peek()!) &&
      precedence[peek()!]! >= min
    ) {
      const op = take();
      const right = expression(precedence[op]! + 1);
      left = { kind: "binary", op, left, right };
    }
    return left;
  }
  const tree = expression(0);
  if (offset !== tokens.length)
    throw Error(`Unsupported expression continuation: ${peek()}`);
  return tree;
}
function evaluate(
  node: Expr,
  row: Row,
  today: string,
  resolve: ResolveFile,
  value: Scalar = null,
): Value {
  const read = (expr: Expr) => evaluate(expr, row, today, resolve, value);
  const readScalar = (expr: Expr) => scalar(read(expr));
  switch (node.kind) {
    case "value":
      return value;
    case "linked-property": {
      const link = readScalar(node.link);
      if (link === null) return null;
      if (typeof link !== "string") throw Error("file requires a text link");
      const target = resolve(link, row);
      return target ? property(target, "note", node.key) : null;
    }
    case "length": {
      const items = read(node.target);
      if (!Array.isArray(items)) throw Error("length requires a list");
      return items.length;
    }
    case "literal":
      return node.value;
    case "property":
      return property(row, node.scope, node.key);
    case "unary": {
      const v = readScalar(node.value);
      if (node.op === "!") return !v;
      if (typeof v !== "number") throw Error("Unary sign requires a number");
      return node.op === "-" ? -v : v;
    }
    case "binary": {
      const a = readScalar(node.left);
      if (node.op === "&&")
        return Boolean(a) && Boolean(readScalar(node.right));
      if (node.op === "||")
        return Boolean(a) || Boolean(readScalar(node.right));
      const b = readScalar(node.right);
      const c = compare(a, b);
      switch (node.op) {
        case "==":
          return equal(a, b);
        case "!=":
          return !equal(a, b);
        case "<":
          return c !== null && c < 0;
        case "<=":
          return c !== null && c <= 0;
        case ">":
          return c !== null && c > 0;
        case ">=":
          return c !== null && c >= 0;
      }
      throw Error("Unsupported operator");
    }
    case "call": {
      if (node.name === "today") return today;
      if (node.name === "list") {
        const arg = node.args[0]!;
        const raw =
          arg.kind === "property"
            ? Object.hasOwn(row[arg.scope], arg.key)
              ? row[arg.scope][arg.key]
              : null
            : read(arg);
        return Array.isArray(raw) ? raw.map(scalar) : [scalar(raw)];
      }
      if (node.name === "filter") {
        const items = read(node.target!);
        if (!Array.isArray(items)) throw Error("filter requires a list");
        return items.filter((item) =>
          Boolean(scalar(evaluate(node.args[0]!, row, today, resolve, item))),
        );
      }
      const arg = readScalar(node.args[0]!);
      if (node.name === "date") {
        if (typeof arg !== "string")
          throw Error("date requires YYYY-MM-DD text");
        return isoDate(arg);
      }
      const target = readScalar(node.target!);
      if (target === null) return false;
      if (typeof target !== "string" || typeof arg !== "string")
        throw Error("String function requires strings");
      if (node.name === "startsWith") return target.startsWith(arg);
      if (node.name === "endsWith") return target.endsWith(arg);
      return target.includes(arg);
    }
  }
}
export function expression(
  source: string,
  today: string,
  resolve: ResolveFile,
): (row: Row) => boolean {
  const tree = parse(source);
  return (row) => Boolean(scalar(evaluate(tree, row, today, resolve)));
}
