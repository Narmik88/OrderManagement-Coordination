import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

// Read the built index.html
const html = readFileSync('dist/index.html', 'utf-8');

// Create a standalone directory
const standaloneDir = 'standalone';
if (!existsSync(standaloneDir)) {
  mkdirSync(standaloneDir);
}

// Copy all assets from dist to standalone
const assetsDir = join(standaloneDir, 'assets');
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir);
}

// Copy assets
copyFileSync('dist/index.html', join(standaloneDir, 'index.html'));
const assets = readFileSync('dist/index.html', 'utf-8')
  .match(/\/assets\/[^"']+/g) || [];

for (const asset of assets) {
  const fileName = asset.split('/').pop();
  const sourcePath = join('dist', 'assets', fileName);
  const targetPath = join(standaloneDir, 'assets', fileName);
  copyFileSync(sourcePath, targetPath);
}

console.log('Standalone version created in /standalone directory');