/** Same-origin API proxy so mik-shop sees the actual storefront domain in Host. */
import {NextResponse} from 'next/server';
import {validateStoreHost} from '@/utils/storeHost';
export const runtime='nodejs';
const PREFIXES=['store','product','auth','cart','orders','profile','addresses','wishlist','checkout','banners','blog','coupons','payments','shop-methods'];
const METHODS=['GET','POST','PUT','PATCH','DELETE'];
async function forward(request,{params}){
  const origin=process.env.SHOP_BACKEND_ORIGIN;
  if(!origin)return NextResponse.json({status:false,message:'آدرس بک‌اند تنظیم نشده است'},{status:503});
  const {path}=await params;
  if(!path?.length||!PREFIXES.includes(path[0])||path.some(x=>!x||x==='.'||x==='..'||x.includes('/')))return NextResponse.json({status:false,message:'مسیر نامعتبر است'},{status:404});
  let storeHost;
  try {
    storeHost=validateStoreHost(request.headers.get('host')||'',{
      allowedHosts:process.env.SHOP_ALLOWED_HOSTS||'',
      trustedIngress:process.env.SHOP_TRUSTED_HOST_INGRESS==='true',
      production:process.env.NODE_ENV==='production',
    });
  } catch(error) {
    return NextResponse.json({status:false,code:error.code,message:error.message},{status:error.status});
  }
  // When using SHOP_TRUSTED_HOST_INGRESS, ingress MUST reject all unverified custom domains and untrusted Host overrides.
  let target;
  try {
    const backend=new URL(origin);
    if(!['http:','https:'].includes(backend.protocol)||backend.username||backend.password||backend.pathname!=='/'||backend.search||backend.hash)throw new Error('Invalid backend origin');
    target=new URL(`/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`,backend);
  } catch {
    return NextResponse.json({status:false,code:'INVALID_BACKEND_ORIGIN',message:'آدرس بک‌اند نامعتبر است'},{status:503});
  }
  const headers={Host:storeHost,Accept:'application/json'};
  const auth=request.headers.get('authorization');if(auth)headers.Authorization=auth;
  const contentType=request.headers.get('content-type');if(contentType?.startsWith('application/json'))headers['Content-Type']=contentType;
  const idem=request.headers.get('idempotency-key');if(idem)headers['Idempotency-Key']=idem;
  const version=request.headers.get('x-app-version');if(version)headers['X-App-Version']=version;
  try {
    // Node HTTP request preserves verified Host; WHATWG fetch might overwrite it.
    const library=target.protocol==='https:' ? await import('node:https') : await import('node:http');
    const body=request.method==='GET'?undefined:await request.text();
    const upstream=await new Promise((resolve,reject)=>{
      // TLS identifies the fixed upstream; HTTP Host still identifies the store.
      const upstreamRequest=library.request(target,{servername:target.hostname,method:request.method,headers:{...headers,...(body?{'Content-Length':Buffer.byteLength(body)}:{})},timeout:15000},response=>{
        const parts=[];let total=0;
        response.on('data',chunk=>{total+=chunk.length;if(total>1024*1024)upstreamRequest.destroy(new Error('Oversize'));else parts.push(chunk)});
        response.on('aborted',()=>reject(new Error('Backend response interrupted')));
        response.on('error',reject);
        response.on('end',()=>resolve({status:response.statusCode,body:Buffer.concat(parts).toString('utf8')}));
      });
      upstreamRequest.on('timeout',()=>upstreamRequest.destroy(new Error('Backend request timed out')));
      upstreamRequest.on('error',reject);upstreamRequest.end(body);
    });
    if(upstream.status===204)return new NextResponse(null,{status:204,headers:{'Cache-Control':'no-store'}});
    let payload;
    try { payload=JSON.parse(upstream.body); } catch { /* Never label an HTML page as JSON. */ }
    if(!payload||typeof payload!=='object'||Array.isArray(payload)||typeof payload.status!=='boolean'||(payload.status===true&&!Object.hasOwn(payload,'data'))){
      return NextResponse.json({status:false,code:'INVALID_BACKEND_RESPONSE',message:'پاسخ بک‌اند فروشگاه معتبر نیست؛ مقصد SHOP_BACKEND_ORIGIN باید API شاپ باشد'},{status:502,headers:{'Cache-Control':'no-store'}});
    }
    return new NextResponse(JSON.stringify(payload),{status:upstream.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  } catch {return NextResponse.json({status:false,code:'BACKEND_UNAVAILABLE',message:'ارتباط با سرور فروشگاه برقرار نشد'},{status:502});}
}
export async function GET(req,context){return forward(req,context)}
export async function POST(req,context){return forward(req,context)}
export async function PUT(req,context){return forward(req,context)}
export async function PATCH(req,context){return forward(req,context)}
export async function DELETE(req,context){return forward(req,context)}
