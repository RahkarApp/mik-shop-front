import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';

function makeDemoApi(mode='demo', pathname='/') {
  let source = readFileSync(new URL('../src/services/api.js', import.meta.url), 'utf8');
  source = source.replace(/^import [^\n]+\n/gm, '').replace(/\bexport (?=(?:const|function|async function))/g, '');
  source = source.replace("await import('./mockApi')", 'await Promise.resolve(mockApi)');
  const context = {
    module:{exports:{}}, process:{env:{NEXT_PUBLIC_DATA_MODE:mode}}, window:{location:{pathname}},
    backendRoute:path=>path, adaptResponse:(path,method,raw)=>raw,
    mockApi:{fetchProducts:async()=>[{id:'product-one',price:230000}],fetchSiteConfig:async()=>({tenantId:'fashion-store',branding:{siteName:'آزمایشی'}})},
    sessionStorage:{getItem:()=>null,removeItem:()=>{}}, crypto:webcrypto, URLSearchParams, AbortController, setTimeout, clearTimeout, fetch:()=>Promise.reject(new Error('REAL_API_ONLY')),
  };
  const util=readFileSync(new URL('../src/utils/demoRoute.js',import.meta.url),'utf8').replace(/\bexport (?=function)/g,'');
  runInNewContext(util+'\n'+source+'\nmodule.exports={api};',context);
  return context.module.exports.api;
}

test('/demo and nested preview remain Demo in real mode, while / remains Real',async()=>{
 const page=readFileSync(new URL('../src/app/demo/page.js',import.meta.url),'utf8');
 const config=readFileSync(new URL('../next.config.mjs',import.meta.url),'utf8');
 assert.match(page,/HomePageBuilder/);
 assert.doesNotMatch(page,/NEXT_PUBLIC_DATA_MODE\s*!==\s*'demo'/);
 assert.match(config,/afterFiles/);
 assert.equal((await makeDemoApi('real','/demo')('/config')).storeId,'fashion-store');
 assert.equal((await makeDemoApi('real','/demo/cart')('/config')).storeId,'fashion-store');
 await assert.rejects(makeDemoApi('real','/')('/config'),/REAL_API_ONLY/);
});

test('Demo checkout start/quote/order works and idempotency prevents duplicate orders',async()=>{
  const api=makeDemoApi();
  const payload={items:[{productId:'product-one',variantId:'demo-product-one',quantity:'2'}]};
  const opt={method:'POST',body:payload,tenantId:'tenant-alpha',idempotencyKey:'start-intent'};
  const started=await api('/checkout/start',opt);
  assert.equal(started.checkout.status,'ACTIVE');
  assert.equal((await api('/checkout/start',opt)).checkout.checkoutId,started.checkout.checkoutId);
  await assert.rejects(api('/checkout/start',{...opt,body:{items:[]}}),/IDEMPOTENCY_CONFLICT/);
  const q=await api('/checkout/quote',{method:'POST',tenantId:'tenant-alpha',idempotencyKey:'quote-intent',body:{checkoutId:started.checkout.checkoutId,shippingMethodId:'demo-delivery',addressId:'address-one'}});
  assert.equal(q.totals.total,475000);
  const orderOpt={method:'POST',tenantId:'tenant-alpha',idempotencyKey:'order-intent',body:{checkoutId:started.checkout.checkoutId,quoteId:q.quoteId,paymentMethod:'online'}};
  const created=await api('/orders',orderOpt);
  assert.ok(created.order.orderId);
  assert.equal(created.order.paymentStatus,'pending');
  assert.equal((await api('/orders',orderOpt)).order.orderId,created.order.orderId);
  assert.equal((await api('/orders',{method:'GET',tenantId:'tenant-alpha'})).length,1);
  assert.equal((await api('/orders',{method:'GET',tenantId:'tenant-beta'})).length,0);
});

test('real environment /demo/checkout can complete simulated reservation and order without network',async()=>{
 const api=makeDemoApi('real','/demo/checkout');
 const items=[{productId:'product-one',variantId:'demo-product-one',quantity:'1'}];
 const start=await api('/checkout/start',{method:'POST',tenantId:'fashion-store',body:{items},idempotencyKey:'preview-start'});
 const quote=await api('/checkout/quote',{method:'POST',tenantId:'fashion-store',body:{checkoutId:start.checkout.checkoutId,shippingMethodId:'demo-pickup'},idempotencyKey:'preview-quote'});
 const response=await api('/orders',{method:'POST',tenantId:'fashion-store',body:{checkoutId:start.checkout.checkoutId,quoteId:quote.quoteId,paymentMethod:'online'},idempotencyKey:'preview-order'});
 assert.equal(response.order.paymentStatus,'pending');
 assert.equal(response.order.paymentUrl,null);
});
