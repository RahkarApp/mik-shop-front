import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {EventEmitter} from 'node:events';
import {adaptResponse} from '../src/utils/backendAdapter.js';
import {backendRoute} from '../src/utils/backendRoutes.js';
import {authErrorMessage,isOtpRateLimited} from '../src/utils/auth.js';
import {validateStoreHost} from '../src/utils/storeHost.js';

const source=file=>readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
const script=file=>source(file).replace(/^import .+;\r?\n/gm,'').replace(/\bexport /g,'');

function realApi(responses) {
  const calls=[],storage=new Map();
  const context={process:{env:{NEXT_PUBLIC_DATA_MODE:'real'}},window:{location:{hostname:'store.example',pathname:'/login'}},
    sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    isDemoRuntime:()=>false,backendRoute,adaptResponse,AbortController,setTimeout,clearTimeout,
    fetch:async(url,options)=>{calls.push({url,options});const response=responses.shift();if(!response)throw new Error('Unexpected extra request');return response;},
  };
  const api=runInNewContext(script('services/api.js')+';api;',context);
  const shop=runInNewContext(script('services/shopService.js')+';({requestOtp,verifyOtp});',{api,authErrorMessage,isOtpRateLimited});
  return {api,shop,calls};
}
const reply=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers});

test('real OTP request unwraps data, retains challenge and wait, and does not request a second code',async()=>{
  const {shop,calls}=realApi([reply({status:true,data:{challengeId:'opaque-challenge',resendAfterSeconds:45}})]);
  const result=await shop.requestOtp('09000000000','store-id');
  assert.equal(result.challengeId,'opaque-challenge');assert.equal(result.resendAfterSeconds,45);
  assert.equal(calls.length,1);assert.equal(calls[0].url,'/api/shop/auth/otp/request');
  assert.deepEqual(JSON.parse(calls[0].options.body),{phone:'09000000000'});
});

test('real login carries the received challenge to verification and authenticates the next profile request',async()=>{
  const {shop,api,calls}=realApi([
    reply({status:true,data:{challengeId:'opaque-challenge',resendAfterSeconds:40}}),
    reply({status:true,data:{accessToken:'shop_test_session',requiresName:false}}),
    reply({status:true,data:{customerId:'customer',name:'Customer',addresses:[]}}),
  ]);
  const challenge=await shop.requestOtp('09000000000','store-id');
  await shop.verifyOtp(challenge.challengeId,'00000','store-id');
  const profile=await api('/me',{tenantId:'store-id'});
  assert.equal(profile.id,'customer');assert.equal(JSON.parse(calls[1].options.body).challengeId,'opaque-challenge');
  assert.equal(calls[2].url,'/api/shop/profile');assert.equal(calls[2].options.headers.Authorization,'Bearer shop_test_session');
  assert.equal(calls.length,3);
});

test('cooldown remains a failed request with a Persian message, original code, and server wait',async()=>{
  const {shop,calls}=realApi([reply({status:false,code:'OTP_COOLDOWN',message:'Wait before requesting another code',retryable:true},429,{'Retry-After':'37'})]);
  await assert.rejects(shop.requestOtp('09000000000','store-id'),error=>{
    assert.equal(error.status,429);assert.equal(error.code,'OTP_COOLDOWN');assert.equal(error.retryAfterSeconds,37);
    assert.equal(isOtpRateLimited(error),true);assert.match(error.message,/صبر/);assert.doesNotMatch(error.message,/Wait|challenge|چالش/);
    return true;
  });
  assert.equal(calls.length,1);
});

test('legacy cooldown message also blocks another send without requiring an invented error code',async()=>{
  const {shop}=realApi([reply({status:false,message:'Wait before requesting another code',data:{resendAfterSeconds:28}},400)]);
  await assert.rejects(shop.requestOtp('09000000000'),error=>{
    assert.equal(error.code,undefined);assert.equal(error.retryAfterSeconds,28);assert.equal(isOtpRateLimited(error),true);
    assert.doesNotMatch(error.message,/Wait/);return true;
  });
});

test('missing real challenge stays blocked with a customer message and no fake identifier',async()=>{
  const {shop,calls}=realApi([reply({status:true,data:{resendAfterSeconds:40}})]);
  await assert.rejects(shop.requestOtp('09000000000'),error=>{
    assert.equal(error.code,'INVALID_OTP_RESPONSE');assert.equal(error.retryAfterSeconds,40);
    assert.match(error.message,/درخواست کد تأیید کامل نشد/);assert.doesNotMatch(error.message,/شناسه|چالش|سرور/);return true;
  });
  assert.equal(calls.length,1);
});

test('invalid, expired and unknown OTP failures never display raw backend English',async()=>{
  for(const [code,status] of [['OTP_INVALID',400],['CHALLENGE_EXPIRED',410],['UNEXPECTED',503],['INVALID_BACKEND_RESPONSE',502]]) {
    const {shop}=realApi([reply({status:false,code,message:'Internal authentication detail'},status)]);
    await assert.rejects(shop.verifyOtp('opaque-challenge','00000'),error=>{
      assert.equal(error.code,code);assert.equal(error.status,status);assert.match(error.message,/[\u0600-\u06ff]/);
      assert.doesNotMatch(error.message,/Internal|authentication|detail/);return true;
    });
  }
});

test('proxy preserves only the Retry-After needed for OTP cooldown',async()=>{
  let requests=0;
  const transport={request(target,options,respond){
    requests++;const request=new EventEmitter();
    request.end=()=>{const response=new EventEmitter();response.statusCode=429;response.headers={'retry-after':'39','set-cookie':'private'};
      respond(response);response.emit('data',Buffer.from(JSON.stringify({status:false,code:'OTP_COOLDOWN',message:'Wait before requesting another code'})));response.emit('end');};
    return request;
  }};
  const code=script('app/api/shop/[...path]/route.js').replace(/const library=[^;]+;/,'const library=transport;');
  const post=runInNewContext(code+';POST;',{transport,URL,Buffer,validateStoreHost,process:{env:{NODE_ENV:'production',SHOP_BACKEND_ORIGIN:'https://backend.example',SHOP_ALLOWED_HOSTS:'store.example'}},
    NextResponse:class extends Response {static json(data,options){return new Response(JSON.stringify(data),options);}},
  });
  const response=await post({method:'POST',headers:new Headers({host:'store.example','content-type':'application/json'}),nextUrl:{search:''},text:async()=>JSON.stringify({phone:'09000000000'})},
    {params:Promise.resolve({path:['auth','otp','request']})});
  assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'39');assert.equal(response.headers.get('set-cookie'),null);assert.equal(requests,1);
});

/** Minimal effect harness exercises the actual guard without a browser or duplicated guard logic. */
function checkoutGuard(getProfile) {
  const values=[],effects=[],redirects=[];let cursor=0;
  const actions={getProfile},router={replace:url=>redirects.push(url)};
  const context={useSiteConfig:()=>({tenantId:'shop',loading:false}),useShopActions:()=>actions,useRouter:()=>router,usePathname:()=>'/checkout',authErrorMessage,
    demoHref:(href,path)=>path.startsWith('/demo')?'/demo'+href:href,
    useState:initial=>{const slot=cursor++;if(!(slot in values))values[slot]=initial;return [values[slot],next=>{values[slot]=typeof next==='function'?next(values[slot]):next;}];},
    useRef:initial=>{const slot=cursor++;if(!(slot in values))values[slot]={current:initial};return values[slot];},
    useCallback:(callback,deps)=>{const slot=cursor++;const previous=values[slot];if(!previous||deps.some((value,index)=>value!==previous.deps[index]))values[slot]={callback,deps};return values[slot].callback;},
    useEffect:(callback,deps)=>{const slot=cursor++;const previous=values[slot];if(!previous||deps.some((value,index)=>value!==previous.deps[index])){previous?.cleanup?.();values[slot]={deps};effects.push(()=>{values[slot].cleanup=callback();});}},
  };
  let pathname='/checkout';context.usePathname=()=>pathname;
  const hook=runInNewContext(script('hooks/useCheckoutAccess.js')+';useCheckoutAccess;',context);
  return {redirects,setPath:value=>{pathname=value;},render:()=>{cursor=0;const result=hook();while(effects.length)effects.shift()();return result;},
    unmount:()=>{for(const value of values)value?.cleanup?.();}};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('unauthenticated checkout redirects automatically and keeps its return URL',async()=>{
  const guard=checkoutGuard(async()=>{throw Object.assign(new Error('Authentication required'),{status:401});});
  assert.equal(guard.render().status,'checking');await settle();
  assert.equal(guard.render().status,'redirecting');assert.equal(guard.redirects[0],'/login?next=%2Fcheckout');
  guard.unmount();
});

test('authenticated checkout is allowed; expired session redirects inside the same Demo branch',async()=>{
  const profile={id:'customer',name:'Customer',addresses:[]};const guard=checkoutGuard(async()=>profile);
  guard.render();await settle();const access=guard.render();assert.equal(access.status,'allowed');assert.equal(access.profile,profile);assert.equal(guard.redirects.length,0);
  guard.setPath('/demo/checkout');guard.render();await settle();guard.render().redirectToLogin();
  assert.equal(guard.redirects.at(-1),'/demo/login?next=%2Fcheckout');guard.unmount();
});

test('profile outage does not impersonate logout and a late response cannot redirect after leaving checkout',async()=>{
  const guard=checkoutGuard(async()=>{throw Object.assign(new Error('Backend unavailable'),{status:503});});
  guard.render();await settle();assert.equal(guard.render().status,'error');assert.equal(guard.redirects.length,0);assert.match(guard.render().error,/[\u0600-\u06ff]/);guard.unmount();
  let reject;const late=checkoutGuard(()=>new Promise((resolve,fail)=>{reject=fail;}));late.render();late.unmount();
  reject(Object.assign(new Error('Authentication required'),{status:401}));await settle();assert.equal(late.redirects.length,0);
});
