import {isDemoRuntime} from '@/utils/demoRoute';
/** Only HTTP transport. No sockets, implicit mocks, or automatic mutation replay. */
import {backendRoute} from '@/utils/backendRoutes';
import {adaptResponse} from '@/utils/backendAdapter';
import {validateStoreHost} from '@/utils/storeHost';
export const isDemo=process.env.NEXT_PUBLIC_DATA_MODE==='demo';
let sessionToken='';
const APP_VERSION=process.env.NEXT_PUBLIC_APP_VERSION||'0.1.0';
export function setAccessToken(token) {
  sessionToken=token||'';
  if(typeof window!=='undefined') {
    const key=`shopsaz-session:${isDemoRuntime()?"demo":"real"}:${window.location.hostname}`;
    if(sessionToken)sessionStorage.setItem(key,sessionToken);else sessionStorage.removeItem(key);
  }
}
export function getAccessToken() {
  if(typeof window==='undefined')return '';
  if(sessionToken)return sessionToken;
  return sessionStorage.getItem(`shopsaz-session:${isDemoRuntime()?"demo":"real"}:${window.location.hostname}`)||'';
}
export function clearAccessToken(){setAccessToken('');}
const inFlight=new Map();
function retryAfterSeconds(value) {
  if(value==null||value==='')return null;
  const number=Number(value);
  const seconds=Number.isFinite(number)?Math.ceil(number):Math.ceil((Date.parse(value)-Date.now())/1000);
  return Number.isSafeInteger(seconds)&&seconds>=0?seconds:null;
}
export async function api(path,{method='GET',body,tenantId,host,token,signal,idempotencyKey}={}){
  const browser=typeof window!=='undefined';
  if(isDemoRuntime() || (!browser && host==='__demo_preview__'))return demo(path,{method,body,tenantId,idempotencyKey});
  const remote=backendRoute(path,method);
  const backendMethod=(path==='/me' && method==='PATCH') ? 'PUT' : method;
  const origin=process.env.SHOP_BACKEND_ORIGIN || '';
  if(!browser&&!origin)throw new Error('SHOP_BACKEND_ORIGIN برای درخواست سمت سرور تنظیم نشده است');
  const url=browser?`/api/shop${remote}`:`${origin.replace(/\/$/,'')}${remote}`;
  const headers={Accept:'application/json'};
  if(body!==undefined)headers['Content-Type']='application/json';
  const auth=token||getAccessToken();if(auth)headers.Authorization=`Bearer ${auth.replace(/^Bearer\s+/i,'')}`;
  headers['X-App-Version']=APP_VERSION;
  if(idempotencyKey)headers['Idempotency-Key']=idempotencyKey;
  if(!browser)headers.Host=validateStoreHost(host||'',{
    allowedHosts:process.env.SHOP_ALLOWED_HOSTS||'',
    trustedIngress:process.env.SHOP_TRUSTED_HOST_INGRESS==='true',
    production:process.env.NODE_ENV==='production',
  });
  let requestBody=body;
  const key=method==='GET'&&!signal?`${url}|${auth}|${host||''}`:null;
  if(key&&inFlight.has(key))return inFlight.get(key);
  const run=(async()=>{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
    try{
      const res=browser ? await fetch(url,{method:backendMethod,headers,body:requestBody===undefined?undefined:JSON.stringify(requestBody),signal:signal||controller.signal,cache:'no-store'}) : await serverRequest(url,{method:backendMethod,headers,body:requestBody===undefined?undefined:JSON.stringify(requestBody),signal:signal||controller.signal});
      let raw=null;
      if(res.status!==204){
        try { raw=await res.json(); } catch { /* Report the transport contract below. */ }
        if(!raw||typeof raw!=='object'||Array.isArray(raw)||typeof raw.status!=='boolean'||(raw.status===true&&!Object.hasOwn(raw,'data'))){
          const error=new Error('پاسخ بک‌اند فروشگاه معتبر نیست؛ مقصد SHOP_BACKEND_ORIGIN باید API شاپ باشد');
          error.status=502;error.code='INVALID_BACKEND_RESPONSE';throw error;
        }
      }
      if(!res.ok||raw?.status===false){
        if(browser&&res.status===401)clearAccessToken();
        const err=new Error(raw?.message||`خطای API (${res.status})`);
        err.status=res.status;err.code=raw?.code;err.retryable=raw?.retryable===true;
        err.retryAfterSeconds=retryAfterSeconds(raw?.retryAfterSeconds??raw?.resendAfterSeconds??raw?.data?.retryAfterSeconds??raw?.data?.resendAfterSeconds??res.headers?.get?.('retry-after'));
        throw err;
      }
      if(path==='/auth/otp/verify'){
        const payload=raw?.data;
        if(!payload?.accessToken)throw new Error('توکن ورود از بک‌اند دریافت نشد');
        setAccessToken(payload.accessToken);return payload;
      }
      return adaptResponse(path,method,raw);
    }catch(error){if(error.name==='AbortError')throw new Error('مهلت اتصال پایان یافت');throw error;}finally{clearTimeout(timer);}
  })();
  if(key)inFlight.set(key,run);
  try{return await run;}finally{if(key)inFlight.delete(key);}
}
async function demo(path, { method, body, tenantId, idempotencyKey }) {
  const m = await import('./mockApi');
  const pathname = path.split('?')[0];
  const q = new URLSearchParams(path.split('?')[1] || '');
  if (method === 'GET' && pathname === '/config') { const c = await m.fetchSiteConfig(tenantId);return {...c,storeId:c.tenantId,currency:'TOMAN'}; }
  if (method === 'GET' && pathname === '/products') return m.fetchProducts({ query: q.get('query') || '', category: q.get('category') || '', limit: Number(q.get('limit') || 50), sort:q.get('sort'),minPrice:q.get('minPrice')||'',maxPrice:q.get('maxPrice')||'',availableOnly:q.get('availableOnly')||'',page:Number(q.get('page')||1) });
  if (method === 'GET' && pathname.startsWith('/products/') && pathname.endsWith('/inventory')) {
    const p=await m.fetchProductInventory(decodeURIComponent(pathname.split('/')[2]));return p&&{...p,variants:[{proUID:`demo-${p.productId}`,price:p.price,stock:p.stock,properties:[]}],requiresVariantSelection:true};
  }
  if (method === 'GET' && /^\/products\/[^/]+$/.test(pathname)) {const item=await m.fetchProductById(decodeURIComponent(pathname.split('/')[2]));return item&&{...item,variants:[{proUID:`demo-${item.id}`,price:item.price,stock:item.stock,properties:[]}],variantsComplete:true,variantsNextCursor:null};}
  if (method === 'GET' && pathname === '/categories') return m.fetchCategories();
  if (method === 'GET' && pathname === '/banners') return m.fetchBanners();
  if (method === 'GET' && pathname === '/blog') return m.fetchBlogPosts();
  if (method === 'GET' && pathname === '/orders') return demoState(tenantId).orders;
  if (method === 'GET' && pathname.startsWith('/orders/')) return demoState(tenantId).orders.find((o) => String(o.id) === decodeURIComponent(pathname.split('/')[2])) || null;
  if (method === 'GET' && pathname === '/me') return demoState(tenantId).profile;
  if (method === 'GET' && pathname === '/shop-methods') return {shippingMethods:[{id:'demo-delivery',shippingMethodId:'demo-delivery',name:'پیک نمونه',amount:15000,requiresAddress:true},{id:'demo-pickup',shippingMethodId:'demo-pickup',name:'تحویل حضوری',amount:0,requiresAddress:false}],paymentMethods:[{id:'online',enabled:true}]};
  if (method === 'PATCH' && pathname === '/me') return Object.assign(demoState(tenantId).profile, body);
  if (method === 'GET' && pathname === '/addresses') return demoState(tenantId).addresses;
  if (method === 'POST' && pathname === '/addresses') { const a = { ...body, id: String(Date.now()) }; demoState(tenantId).addresses.push(a); return a; }
  if (method === 'DELETE' && pathname.startsWith('/addresses/')) { const state = demoState(tenantId);state.addresses = state.addresses.filter((a) => String(a.id) !== pathname.split('/')[2]);return null; }
  if (method === 'GET' && pathname === '/wishlist') return demoState(tenantId).wishlist;
  if (method === 'POST' && pathname === '/wishlist') { demoState(tenantId).wishlist.push(body); return body; }
  if (method === 'DELETE' && pathname.startsWith('/wishlist/')) { const s = demoState(tenantId);s.wishlist = s.wishlist.filter((x) => String(x.productId) !== pathname.split('/')[2]);return null; }
  if (pathname.match(/^\/products\/[^/]+\/reviews$/)) {
    const productId=decodeURIComponent(pathname.split('/')[2]);const st=demoState(tenantId);st.reviews ||= {};
    if (method==='GET') return st.reviews[productId]||[];
    if(method==='POST'){const r={...body,id:`rev-${Date.now()}`,createdAt:new Date().toISOString()};st.reviews[productId]=[...(st.reviews[productId]||[]),r];return r;}
  }
  if(method==='POST'&&pathname.match(/^\/orders\/[^/]+\/(returns|cancel)$/)){
    const orderId=pathname.split('/')[2];const order=demoState(tenantId).orders.find(x=>String(x.id)===orderId);
    if(!order)throw new Error('سفارش یافت نشد');
    if(pathname.endsWith('/cancel')){order.status='لغو شده';return {status:order.status};}
    order.returnRequest={reason:body.reason,status:'requested'};return {requestId:`r-${Date.now()}`,status:'requested'};
  }
  if(method==='POST'&&pathname==='/checkout/start'){
    if(!idempotencyKey)throw new Error('Idempotency-Key الزامی است');
    const state=demoState(tenantId), fingerprint=JSON.stringify(body);
    const existing=state.requests.get(`start:${idempotencyKey}`);
    if(existing){if(existing.fingerprint!==fingerprint)throw new Error('IDEMPOTENCY_CONFLICT');return {checkout:existing.checkout,replayed:true};}
    const checkoutId=crypto.randomUUID();
    const checkout={checkoutId,revision:1,status:'ACTIVE',items:body.items,expiresAt:new Date(Date.now()+600000).toISOString()};
    state.checkouts.set(checkoutId,checkout);state.requests.set(`start:${idempotencyKey}`,{fingerprint,checkout});
    return {checkout,replayed:false};
  }
  if(method==='GET'&&/^\/checkout\/[^/]+$/.test(pathname))return {checkout:demoState(tenantId).checkouts.get(pathname.split('/')[2])||null};
  if(method==='POST'&&pathname==='/checkout/quote'){
    const state=demoState(tenantId),checkout=state.checkouts.get(body.checkoutId);
    if(!checkout||checkout.status!=='ACTIVE')throw new Error('Checkout معتبر نیست');
    const selected=(await demo('/shop-methods',{method:'GET',tenantId})).shippingMethods.find(x=>x.id===body.shippingMethodId);
    if(!selected)throw new Error('روش ارسال انتخاب نشده است');
    if(selected.requiresAddress&&!body.addressId)throw new Error('نشانی ثبت‌شده موردنیاز است');
    const list=await m.fetchProducts({limit:1000});let subtotal=0;
    for(const item of checkout.items){const product=list.find(x=>String(x.id)===String(item.productId));if(!product||item.variantId!==`demo-${product.id}`||!(Number(item.quantity)>0))throw new Error('تنوع کالا معتبر نیست');subtotal+=product.price*Number(item.quantity);}
    const result={checkoutId:checkout.checkoutId,quoteId:crypto.randomUUID(),revision:checkout.revision+1,currency:'TOMAN',totals:{subtotal,lineDiscount:0,discountAmount:0,shippingAmount:selected.amount,taxAmount:0,total:subtotal+selected.amount},expiresAt:checkout.expiresAt,paymentMethods:[{id:'online',enabled:true}],orderSubmissionAvailable:true};
    state.quotes.set(result.quoteId,result);return result;
  }
  if(method==='POST'&&pathname==='/orders'){
    if(!idempotencyKey)throw new Error('Idempotency-Key الزامی است');
    const state=demoState(tenantId),fingerprint=JSON.stringify(body),existing=state.requests.get(`order:${idempotencyKey}`);
    if(existing){if(existing.fingerprint!==fingerprint)throw new Error('IDEMPOTENCY_CONFLICT');return {order:existing.order,replayed:true};}
    const quote=state.quotes.get(body.quoteId);
    if(!quote||quote.checkoutId!==body.checkoutId||body.paymentMethod!=='online'||Date.parse(quote.expiresAt)<Date.now())throw new Error('Quote منقضی یا نامعتبر است');
    const order={orderId:body.checkoutId,id:body.checkoutId,processingStatus:'AWAITING_PAYMENT',paymentStatus:'pending',deliveryStatus:'pending',status:'created',paymentUrl:null,paymentRequired:true,totals:quote.totals,currency:'TOMAN',createdAt:new Date().toISOString()};
    state.orders.unshift(order);state.requests.set(`order:${idempotencyKey}`,{fingerprint,order});return {order,replayed:false};
  }
  if (method === 'POST' && pathname === '/coupons/validate') throw new Error('کد تخفیف در داده نمونه تعریف نشده است');
  if (method === 'POST' && pathname === '/auth/otp/request') return { challengeId: 'demo-otp', expiresIn: 120 };
  if (method === 'POST' && pathname === '/auth/otp/verify') { if (!/^\d{5}$/.test(body.code)) throw new Error('کد آزمایشی باید پنج رقم باشد');return { accessToken:'demo-session',user:demoState(tenantId).profile }; }
  if (method === 'POST' && pathname === '/auth/logout') return {loggedOut:true};
  throw new Error(`این قابلیت در Demo شبیه‌سازی نشده است: ${method} ${pathname}`);
}
const demos = new Map();
function demoState(tenantId) {
  const key = tenantId || 'fashion-store';
  if (!demos.has(key)) demos.set(key, {orders:[],quotes:new Map(),requests:new Map(),checkouts:new Map(),profile:{name:'کاربر آزمایشی',phone:'09000000000',revision:1,addresses:[]},addresses:[],wishlist:[]});
  return demos.get(key);
}

// Node fetch does not reliably honor an explicit Host header. Restrict target to the configured origin.
async function serverRequest(target,{method,headers,body,signal}) {
 const url=new URL(target); if(!['http:','https:'].includes(url.protocol))throw new Error('Backend protocol invalid');
 const lib=await import(/* webpackIgnore: true */ url.protocol==='https:'?'node:https':'node:http');
 return new Promise((resolve,reject)=>{
  // TLS identifies the fixed upstream; HTTP Host still identifies the store.
  const req=lib.request(url,{servername:url.hostname,method,headers:{...headers,'Content-Length':Buffer.byteLength(body||'')},signal,timeout:15000},res=>{
   const chunks=[];let size=0;
   res.on('data',chunk=>{size+=chunk.length;if(size>1024*1024){req.destroy(new Error('پاسخ بک‌اند بیش از حد بزرگ است'));return;}chunks.push(chunk);});
   res.on('aborted',()=>reject(new Error('پاسخ بک‌اند فروشگاه قطع شد')));
   res.on('error',reject);
   res.on('end',()=>{const raw=Buffer.concat(chunks).toString('utf8');resolve({ok:res.statusCode>=200&&res.statusCode<300,status:res.statusCode,headers:{get:name=>res.headers?.[name.toLowerCase()]??null},json:async()=>JSON.parse(raw)});});
  }); req.on('timeout',()=>req.destroy(new Error('مهلت اتصال به بک‌اند فروشگاه پایان یافت')));req.on('error',reject);req.end(body);
 });
}
