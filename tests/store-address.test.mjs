import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { isIP } from 'node:net';

const source = readFileSync(new URL('../src/services/tenantResolver.js', import.meta.url), 'utf8')
  .replace(/^import .+;\r?\n/gm, '')
  .replace(/\bexport /g, '');

async function missing(host, { demo = false, preview = false } = {}) {
  const check = runInNewContext(source + ';isStoreAddressMissing;', {
    URL, isIP, isDemo: demo,
    headers: async () => new Headers({ host, ...(preview ? { 'x-store-demo-preview': '1' } : {}) }),
  });
  return check();
}

test('raw server addresses do not identify a storefront', async () => {
  for (const host of ['', 'localhost:3300', 'LOCALHOST.:3300', '127.0.0.1:3300', '192.168.1.10:3300', '[::1]:3300', 'server:3300']) {
    assert.equal(await missing(host), true, host);
  }
});

test('store domains remain available for backend verification', async () => {
  for (const host of ['shop.p.mikcore.ir', 'example.ir:3300', 'fashion.localhost:3300']) {
    assert.equal(await missing(host), false, host);
  }
});

test('explicit demo and preview still work on raw addresses', async () => {
  assert.equal(await missing('localhost:3300', { demo: true }), false);
  assert.equal(await missing('localhost:3300', { preview: true }), false);
});
