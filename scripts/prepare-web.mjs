import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'www');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.name === 'index.html' || entry.name === 'assets') {
    await cp(resolve(root, entry.name), resolve(output, entry.name), { recursive: true });
  }
}

console.log('PDRkampüs web dosyaları www/ klasörüne hazırlandı.');
