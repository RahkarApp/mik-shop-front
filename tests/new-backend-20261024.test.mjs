import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
test('shop bearer token and app version and real OTP challenge are preserved',()=>{
 const s=src('services/api.js');
 assert.match(s,/Bearer \${auth/);
 assert.match(s,/X-App-Version/);
 assert.match(s,/payload\?\.accessToken/);
 assert.doesNotMatch(s,/challengeId:body\?\.phone/);
});
test('shop checkout is reservation-based and cannot post browser-supplied totals',()=>{
 const service=src('services/shopService.js');
 const view=src('components/shared/CheckoutClient.js');
 assert.match(service,/checkout\/start/);assert.match(service,/checkout\/quote/);
 assert.match(view,/variantId:String\(x\.proUID/);
 assert.match(view,/quoteId:quote\.quoteId/);
 assert.match(view,/Idempotency|idempotencyRef/);
 assert.doesNotMatch(view,/paymentMethod:\s*['"]cod['"]/);
});
test('the proxy does not trust X-Forwarded-Host and preserves verified Host through Node HTTP',()=>{
 const s=src('app/api/shop/[...path]/route.js');
 assert.match(s,/library\.request/);assert.match(s,/Host:storeHost/);
 assert.doesNotMatch(s,/get\('x-forwarded-host'\)/);
});
