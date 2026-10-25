import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cartItemKey, sanitizeCart, cartEstimate} from '../src/utils/cart.js';
import {adaptStore} from '../src/utils/backendAdapter.js';
import {formatMoney} from '../src/utils/format.js';
import {readFileSync} from 'node:fs';

test('different SKU variants stay separate even when feature values look identical', () => {
 const p={id:'p-1',proUID:'red-small'};
 assert.notEqual(cartItemKey(p,{color:'red'}),cartItemKey({...p,proUID:'red-medium'},{color:'red'}));
 assert.equal(cartItemKey(p,{color:'red',size:'small'}),cartItemKey(p,{size:'small',color:'red'}));
});
test('invalid saved cart quantities are ignored', () => {
 assert.deepEqual(sanitizeCart([{cartItemId:'valid',id:'p-1',quantity:2},{cartItemId:'wrong',id:'p-2',quantity:-8},{cartItemId:'wrong2',id:'p-3',quantity:1.8}]).map(x=>x.id),['p-1']);
});
test('an unknown price is not zero or free shipping', () => {
 assert.equal(cartEstimate([{id:'p',price:null,quantity:2}]),null);
 assert.equal(cartEstimate([{id:'p',price:1200,quantity:2}]),2400);
 assert.equal(cartEstimate([]),0);
 assert.equal(cartEstimate([{id:'p',price:'n/a',quantity:1}]),null);
});
test('store configuration optional flags only accept true boolean', () => {
 const config=adaptStore({uid:'store-one',name:'A',features:{wishlist:'false',reviews:true},pages:{blog:'true'}});
 assert.equal(config.features.wishlist,false);
 assert.equal(config.features.reviews,true);
 assert.equal(config.pages.blog,false);
});
test('production Host forwarding requires allowlist or verified ingress policy', () => {
 const proxy=readFileSync(new URL('../src/app/api/shop/[...path]/route.js',import.meta.url),'utf8');
 assert.match(proxy,/SHOP_TRUSTED_HOST_INGRESS/);
 assert.match(proxy,/NODE_ENV==='production'/);
 assert.match(proxy,/allowed\.includes\(storeHost\)/);
});

test('currency is server-controlled and unknown amounts never display a free price', () => {
 assert.match(formatMoney(12500, 'IRR'), /ریال/);
 assert.match(formatMoney(12500, 'TOMAN'), /تومان/);
 assert.equal(formatMoney(null, 'TOMAN'), '—');
 assert.match(formatMoney(12500, null), /واحد پول اعلام‌نشده/);
 assert.equal(cartEstimate([{id:'p',price:'',quantity:1}]), null);
});

test('store-driven remote image URLs do not enable server-side wildcard optimizer fetches',()=>{
 const config=readFileSync(new URL('../next.config.mjs',import.meta.url),'utf8');
 assert.match(config,/unoptimized:\s*true/);
 assert.doesNotMatch(config,/hostname:\s*'\*\*'/);
});
