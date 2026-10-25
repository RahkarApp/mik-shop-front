/** Same-origin API proxy so mik-shop sees the actual storefront domain in Host. */
import {NextResponse} from 'next/server';
export const runtime='nodejs';
const PREFIXES=['store','product','auth','cart','orders','profile','addresses','wishlist','checkout','banners','blog','coupons','payments','shop-methods'];
const METHODS=['GET','POST','PUT','PATCH','DELETE'];
async function forward(request,{params}){
  const origin=process.env.SHOP_BACKEND_ORIGIN;
  if(!origin)return NextResponse.json({status:false,message:'آدرس بک‌اند تنظیم نشده است'},{status:503});
  const {path}=await params;
  if(!path?.length||!PREFIXES.includes(path[0])||path.some(x=>!x||x==='.'||x==='..'||x.includes('/')))return NextResponse.json({status:false,message:'مسیر نامعتبر است'},{status:404});
  const requestedHost=request.headers.get('host')||'';
  let storeHost='';
  try{const parsed=new URL(`http://${requestedHost}`);storeHost=parsed.hostname.toLowerCase();}catch{}
  if(!storeHost||!/^([a-z0-9-]+\.)*[a-z0-9-]+$/.test(storeHost))return NextResponse.json({status:false,message:'دامنه نامعتبر است'},{status:400});
  // For strict deployments, set allowlist at the ingress AND here; custom domains must be verified by backend.
  const allowed=(process.env.SHOP_ALLOWED_HOSTS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  const trustedIngress=process.env.SHOP_TRUSTED_HOST_INGRESS==='true';
  if(process.env.NODE_ENV==='production' && !allowed.length && !trustedIngress) return NextResponse.json({status:false,message:'سیاست اعتبارسنجی دامنه فروشگاه تنظیم نشده است'},{status:503});
  if(allowed.length&&!allowed.includes(storeHost))return NextResponse.json({status:false,message:'دامنه مجاز نیست'},{status:403});
  // When using SHOP_TRUSTED_HOST_INGRESS, ingress MUST reject all unverified custom domains and untrusted Host overrides.
  const target=new URL(`/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`,origin);
  const headers={Host:storeHost,Accept:'application/json'};
  const auth=request.headers.get('authorization');if(auth)headers.Authorization=auth;
  const contentType=request.headers.get('content-type');if(contentType?.startsWith('application/json'))headers['Content-Type']=contentType;
  const idem=request.headers.get('idempotency-key');if(idem)headers['Idempotency-Key']=idem;
  const version=request.headers.get('x-app-version');if(version)headers['X-App-Version']=version;
  try {
    // Node HTTP request preserves verified Host; WHATWG fetch might overwrite it.
    const library=await import(target.protocol==='https:'?'node:https':'node:http');
    const body=request.method==='GET'?undefined:await request.text();
    const upstream=await new Promise((resolve,reject)=>{
      // TLS identifies the fixed upstream; HTTP Host still identifies the store.
      const upstreamRequest=library.request(target,{servername:target.hostname,method:request.method,headers:{...headers,...(body?{'Content-Length':Buffer.byteLength(body)}:{})},timeout:15000},response=>{
        const parts=[];let total=0;
        response.on('data',chunk=>{total+=chunk.length;if(total>1024*1024)upstreamRequest.destroy(new Error('Oversize'));else parts.push(chunk)});
        response.on('end',()=>resolve({status:response.statusCode,body:Buffer.concat(parts).toString('utf8')}));
      });
      upstreamRequest.on('error',reject);upstreamRequest.end(body);
    });
    return new NextResponse(upstream.body,{status:upstream.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  } catch {return NextResponse.json({status:false,code:'BACKEND_UNAVAILABLE',message:'ارتباط با سرور فروشگاه برقرار نشد'},{status:502});}
}
export async function GET(req,context){return forward(req,context)}
export async function POST(req,context){return forward(req,context)}
export async function PUT(req,context){return forward(req,context)}
export async function PATCH(req,context){return forward(req,context)}
export async function DELETE(req,context){return forward(req,context)}
