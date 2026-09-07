import { readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
export function openVault(path: string): { root: string; paths: string[] } {
  const root = realpathSync(path);
  if (!statSync(root).isDirectory())
    throw Error("Vault path must be a directory");
  function scan(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => !e.name.startsWith("."))
      .flatMap((e) => {
        const p = join(dir, e.name);
        if (e.isSymbolicLink())
          throw Error(`Unsupported symlink: ${relative(root, p)}`);
        if (e.isDirectory()) return scan(p);
        if (!e.isFile())
          throw Error(`Unsupported filesystem entry: ${relative(root, p)}`);
        return [relative(root, p).split(sep).join("/")];
      })
      .sort();
  }
  return { root, paths: scan(root) };
}
