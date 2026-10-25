import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const icons = require('lucide-react');
const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));

test('Lucide version is pinned and matches the lockfile and installed package', () => {
  const manifest = require('../package.json');
  const lock = require('../package-lock.json');
  const version = manifest.dependencies['lucide-react'];
  assert.match(version, /^\d+\.\d+\.\d+$/, 'Lucide must use an exact version');
  assert.equal(lock.packages[''].dependencies['lucide-react'], version);
  assert.equal(lock.packages['node_modules/lucide-react'].version, version);
  assert.equal(require('lucide-react/package.json').version, version);
});

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.[cm]?jsx?$/.test(path) ? [path] : [];
  });
}

test('every Lucide icon imported by pages and components exists and renders SVG', () => {
  const usedIcons = new Set();
  let importCount = 0;

  for (const file of sourceFiles(sourceRoot)) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g)) {
      importCount++;
      for (const binding of match[1].split(',')) {
        const name = binding.trim().split(/\s+as\s+/)[0];
        if (!name) continue;
        assert.ok(Object.hasOwn(icons, name), `${relative(sourceRoot, file)}: missing Lucide export ${name}`);
        usedIcons.add(name);
      }
    }
  }

  assert.ok(importCount > 0, 'The audit must discover Lucide imports');
  for (const name of usedIcons) {
    const markup = renderToStaticMarkup(createElement(icons[name], { size: 20, className: 'icon-check' }));
    assert.match(markup, /^<svg\b/, `${name} must render an SVG`);
    assert.match(markup, /width="20"/, `${name} must preserve the size prop`);
    assert.match(markup, /class="[^"]*icon-check/, `${name} must preserve the className prop`);
  }
  console.log(`Lucide audit: ${usedIcons.size} unique icons across ${importCount} source imports`);
});
