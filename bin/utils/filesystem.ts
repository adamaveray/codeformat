import { existsSync } from 'node:fs';
import path from 'node:path';

export function withExts(base: string, exts: string[]): string[] {
  return exts.map((ext) => `${base}.${ext}`);
}

export function findFirstFile(root: string, suffixes: string[]): string | undefined {
  for (const suffix of suffixes) {
    const filePath = path.join(root, suffix);
    if (existsSync(filePath)) {
      return path.isAbsolute(root) ? path.relative(root, filePath) : filePath;
    }
  }
  return undefined;
}
