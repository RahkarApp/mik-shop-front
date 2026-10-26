import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { EventEmitter } from 'node:events';
import { validateStoreHost } from '../src/utils/storeHost.js';

const allowedHosts = '*.shop.p.mikcore.ir,custom.example,localhost';
const policy = { allowedHosts, production: true };
const source = file => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

test('wildcards match exactly one valid shop label and exact hosts remain supported', () => {
  for (const host of ['melika.shop.p.mikcore.ir', 'shop-12.shop.p.mikcore.ir', 'a.shop.p.mikcore.ir', 'custom.example', 'localhost']) {
    assert.equal(validateStoreHost(host, policy), host);
  }
  assert.equal(validateStoreHost('MeLiKa.SHOP.P.MIKCORE.IR:3300', policy), 'melika.shop.p.mikcore.ir');
  assert.throws(() => validateStoreHost('shop.p.mikcore.ir', policy), { status: 403 });
  assert.equal(validateStoreHost('shop.p.mikcore.ir', { ...policy, allowedHosts: allowedHosts + ',shop.p.mikcore.ir' }), 'shop.p.mikcore.ir');
});

test('suffix tricks, nested domains and unrelated hosts cannot match the wildcard', () => {
  for (const host of ['a.b.shop.p.mikcore.ir', 'evilshop.p.mikcore.ir', 'shop.p.mikcore.ir.evil.example',
    'a.shop.p.mikcore.ir.evil.example', 'evil.example', '127.0.0.1', '169.254.169.254']) {
    assert.throws(() => validateStoreHost(host, policy), { status: 403 }, host);
  }
});

test('Host is strictly an ASCII hostname and optional valid port, never a URL', () => {
  for (const host of ['', 'a.shop.p.mikcore.ir@evil.example', 'evil.example@a.shop.p.mikcore.ir',
    'https://a.shop.p.mikcore.ir', 'a.shop.p.mikcore.ir/', 'a.shop.p.mikcore.ir?x=1',
    'a.shop.p.mikcore.ir#x', 'a.shop.p.mikcore.ir\\evil', 'a.shop.p.mikcore.ir,evil.example',
    'a.shop.p.mikcore.ir\r\nHost: evil.example', 'a.shop.p.mikcore.ir\n', 'a.shop.p.mikcore.ir:80\n',
    'a.shop.p.mikcore.ir\r', 'a.shop.p.mikcore.ir.', 'a.shop.p.mikcore.ir ',
    'a..shop.p.mikcore.ir', '-a.shop.p.mikcore.ir', 'a-.shop.p.mikcore.ir', '_a.shop.p.mikcore.ir',
    'فروشگاه.shop.p.mikcore.ir', '%61.shop.p.mikcore.ir', 'a.shop.p.mikcore.ir:0',
    'a.shop.p.mikcore.ir:65536', 'a.shop.p.mikcore.ir:abc', 'a.shop.p.mikcore.ir:80:80',
    'a'.repeat(64) + '.shop.p.mikcore.ir', Array(5).fill('a'.repeat(63)).join('.')]) {
    assert.throws(() => validateStoreHost(host, policy), { status: 400 }, host);
  }
});

test('invalid wildcard policies fail closed; trusted ingress does not bypass a configured allowlist', () => {
  for (const entry of ['*', '**.shop.p.mikcore.ir', '*.ir', '*.127.0.0.1', 'shop.*.mikcore.ir',
    'https://shop.p.mikcore.ir', '*.shop..mikcore.ir', 'shop.p.mikcore.ir:3300']) {
    assert.throws(() => validateStoreHost('a.shop.p.mikcore.ir', { ...policy, allowedHosts: entry }), { code: 'INVALID_HOST_POLICY', status: 503 }, entry);
  }
  assert.throws(() => validateStoreHost('a.shop.p.mikcore.ir', { production: true }), { status: 503 });
  assert.throws(() => validateStoreHost('evil.example', { ...policy, trustedIngress: true }), { status: 403 });
  assert.equal(validateStoreHost('custom.example', { production: true, trustedIngress: true }), 'custom.example');
});

function setup(overrides = {}, upstreamStatus = 200, upstreamBody = '{"status":true,"data":{}}') {
  const calls = [];
  const env = { SHOP_BACKEND_ORIGIN: 'https://backend.example', SHOP_ALLOWED_HOSTS: allowedHosts, NODE_ENV: 'production', ...overrides };
  const transport = { request(target, options, respond) {
    calls.push({ target, options });
    const request = new EventEmitter();
    request.end = () => {
      const response = new EventEmitter();
      response.statusCode = upstreamStatus;
      response.headers = { location: 'https://evil.example/private' };
      respond(response);
      response.emit('data', Buffer.from(upstreamBody));
      response.emit('end');
    };
    return request;
  } };
  const context = { URL, Buffer, Response, validateStoreHost, transport, process: { env } };
  const code = source('app/api/shop/[...path]/route.js')
    .replace(/^import .+;\r?\n/gm, '').replace(/\bexport /g, '')
    .replace(/const library=[^;]+;/, 'const library=transport;');
  const get = runInNewContext(code + ';GET;', { ...context,
    NextResponse: class extends Response {
      static json(body, options) { return new Response(JSON.stringify(body), options); }
    },
  });
  const request = (host, { path = ['store', 'config'], search = '', extraHeaders = {} } = {}) => get({
    method: 'GET', headers: new Headers({ host, ...extraHeaders }), nextUrl: { search },
  }, { params: Promise.resolve({ path }) });
  const apiCode = source('services/api.js').replace(/^import .+;\r?\n/gm, '')
    .replace(/\bexport /g, '').replace(/await import\(\/\* webpackIgnore: true \*\/[^;]+\)/, 'transport');
  const api = runInNewContext(apiCode + ';api;', { ...context,
    AbortController, setTimeout, clearTimeout, isDemoRuntime: () => false,
    backendRoute: () => '/store/config', adaptResponse: (path, method, raw) => raw,
  });
  return { request, api, calls };
}

test('proxy preserves each shop Host and TLS backend name with a fixed network destination', async () => {
  const { request, calls } = setup();
  for (const shop of ['alpha', 'beta']) {
    const response = await request(`${shop}.shop.p.mikcore.ir:3300`, {
      search: '?url=https://evil.example&tenant=other-store',
      extraHeaders: { 'x-forwarded-host': 'evil.example', 'x-store-host': 'evil.example', authorization: 'Bearer test-token' },
    });
    assert.equal(response.status, 200);
    const { target, options } = calls.at(-1);
    assert.equal(target.origin, 'https://backend.example');
    assert.equal(target.pathname, '/store/config');
    assert.equal(options.servername, 'backend.example');
    assert.equal(options.headers.Host, `${shop}.shop.p.mikcore.ir`);
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.equal(options.headers['x-forwarded-host'], undefined);
    assert.equal(options.headers['x-store-host'], undefined);
  }
  assert.equal(calls.length, 2);
});

test('proxy rejects unauthorized Host, spoofed forwarding headers and path escapes before network', async () => {
  const { request, calls } = setup();
  assert.equal((await request('evil.example', { extraHeaders: { 'x-forwarded-host': 'alpha.shop.p.mikcore.ir' } })).status, 403);
  assert.equal((await request('alpha.shop.p.mikcore.ir@evil.example')).status, 400);
  assert.equal((await request('alpha.shop.p.mikcore.ir', { path: ['store', '//evil.example'] })).status, 404);
  assert.equal((await request('alpha.shop.p.mikcore.ir', { path: ['store', '..'] })).status, 404);
  assert.equal(calls.length, 0);
});

test('proxy rejects invalid backend origins and never follows upstream redirects', async () => {
  for (const origin of ['file:///private', 'https://user:pass@backend.example', 'https://backend.example/path', 'https://backend.example?url=https://evil.example']) {
    const { request, calls } = setup({ SHOP_BACKEND_ORIGIN: origin });
    assert.equal((await request('alpha.shop.p.mikcore.ir')).status, 503);
    assert.equal(calls.length, 0);
  }
  const { request, calls } = setup({}, 302);
  const response = await request('alpha.shop.p.mikcore.ir');
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), null);
  assert.equal(calls.length, 1);
});

test('SSR applies the same Host policy before issuing any backend request', async () => {
  const { api, calls } = setup();
  await assert.rejects(api('/config', { host: 'evil.example' }), { status: 403 });
  await assert.rejects(api('/config', { host: 'alpha.shop.p.mikcore.ir@evil.example' }), { status: 400 });
  assert.equal(calls.length, 0);
  await api('/config', { host: 'AlPhA.shop.p.mikcore.ir:3300' });
  assert.equal(calls[0].target.origin, 'https://backend.example');
  assert.equal(calls[0].options.headers.Host, 'alpha.shop.p.mikcore.ir');
});


test('HTML and invalid envelopes become explicit transport errors in both proxy and SSR', async () => {
  for (const body of ['<!doctype html><html>frontend</html>', 'null', '{"status":true}']) {
    const { request, api, calls } = setup({}, 200, body);
    const response = await request('alpha.shop.p.mikcore.ir');
    assert.equal(response.status, 502);
    assert.equal((await response.json()).code, 'INVALID_BACKEND_RESPONSE');
    await assert.rejects(api('/config', { host: 'alpha.shop.p.mikcore.ir' }), { status: 502, code: 'INVALID_BACKEND_RESPONSE' });
    assert.equal(calls.length, 2, 'No hidden retry or alternative tenant');
  }
});
