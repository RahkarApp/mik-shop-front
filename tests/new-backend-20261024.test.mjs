import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {EventEmitter} from 'node:events';
import {validateStoreHost} from '../src/utils/storeHost.js';
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

test('HTTPS uses the fixed backend TLS name while preserving the storefront Host', async () => {
 const calls=[];
 const transport={request(target,options,respond){
  calls.push({target,options});
  const request=new EventEmitter();
  request.end=()=>{
   const response=new EventEmitter();response.statusCode=200;
   respond(response);
   response.emit('data',Buffer.from('{"status":true,"data":{}}'));
   response.emit('end');
  };
  return request;
 }};
 const context={URL,Buffer,transport,Response,process:{env:{
  SHOP_BACKEND_ORIGIN:'https://backend.example',SHOP_ALLOWED_HOSTS:'store.example',NODE_ENV:'production'
 }}};
 const service=src('services/api.js').split('async function serverRequest')[1];
 const serverRequest=runInNewContext(
  ('async function serverRequest'+service).replace(/await import\([^;]+\)/,'transport')+';serverRequest;',context
 );
 await serverRequest('https://backend.example/store/config',{
  method:'GET',headers:{Host:'store.example'}
 });
 const proxy=src('app/api/shop/[...path]/route.js')
  .replace(/import \{NextResponse\} from 'next\/server';/,'')
  .replace(/import \{validateStoreHost\} from '@\/utils\/storeHost';/,'')
  .replace(/\bexport /g,'')
  .replace(/const library=[^;]+;/,'const library=transport;');
 const get=runInNewContext(proxy+';GET;',{
  ...context,validateStoreHost,NextResponse:class extends Response {}
 });
 await get({method:'GET',headers:new Headers({host:'store.example'}),nextUrl:{search:''}},
  {params:Promise.resolve({path:['store','config']})});
 assert.equal(calls.length,2);
 for(const {target,options} of calls){
  assert.equal(target.hostname,'backend.example');
  assert.equal(options.servername,'backend.example');
  assert.equal(options.headers.Host,'store.example');
 }
});
