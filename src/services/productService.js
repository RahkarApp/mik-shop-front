import {api} from './api';
const enc=value=>encodeURIComponent(String(value));
export async function getProducts(options={}, tenantId){
 const {page=1,limit=20,query='',category='',...rest}=options;
 const params=new URLSearchParams({limit:String(Math.min(50,Math.max(1,Number(limit)||20))),...(query?{query}:{}),...(category?{category}:{})});
 let cursor=null,results={items:[],nextCursor:null};
 // Cursor-backed API: derive a requested page by advancing cursors. No page index sent to backend.
 for(let index=1;index<=Math.min(Math.max(1,Number(page)||1),100);index++){
  const cursorQuery=new URLSearchParams(params);
  if(cursor)cursorQuery.set('after',cursor);
  results=await api(`/products?${cursorQuery}`,{tenantId});
  cursor=results?.nextCursor;
  if(!cursor)break;
 }
 return results;
}
export async function getProductById(id,tenantId,host){
 const base=await api(`/products/${enc(id)}`,{tenantId,host});
 if(!base)return null;
 const variants=[...(base.variants||[])],seen=new Set(variants.map(x=>x.proUID));
 let after=base.variantsNextCursor;
 for(let page=0;after&&page<100;page++){
  const next=await api(`/products/${enc(id)}?after=${enc(after)}`,{tenantId,host});
  if(!next||next.variantsNextCursor===after)throw new Error('صفحه‌بندی تنوع‌های کالا نامعتبر است');
  for(const variant of next.variants||[])if(!seen.has(variant.proUID)){variants.push(variant);seen.add(variant.proUID)}
  after=next.variantsNextCursor;
 }
 if(after)throw new Error('تعداد صفحه‌های تنوع از حد ایمن فراتر رفت');
 const map=new Map();
 for(const v of variants)for(const a of v.properties||[]){
  if(!a.name)continue;
  if(!map.has(a.name))map.set(a.name,new Map());
  map.get(a.name).set(String(a.value),{value:a.value,available:v.stock!=null&&Number(v.stock)>0,colorCode:a.code||null});
 }
 return {...base,variants,variantsComplete:true,variantsNextCursor:null,
   features:[...map].map(([name,opts])=>({name,options:[...opts.values()]}))};
}
export async function getProductInventory(id,tenantId){
 const p=await getProductById(id,tenantId);
 return p ? {productId:p.id,price:p.price,stock:p.stock,variants:p.variants,
  requiresVariantSelection:p.variants.length>0||p.features.length>0,variantMissingId:p.variants.some(v=>!v.proUID)}:null;
}
export const getBanners=tenantId=>api('/banners',{tenantId});
export async function getCategories(tenantId,host){
 let cursor=null,all=[];
 for(let page=0;page<100;page++){
  const query=new URLSearchParams({limit:'50'});
  if(cursor)query.set('after',cursor);
  const response=await api(`/categories?${query}`,{tenantId,host});
  all.push(...(Array.isArray(response)?response:response?.items||[]));
  cursor=response?.nextCursor;
  if(!cursor)return all;
 }
 throw new Error('تعداد صفحه‌های دسته‌بندی بیش از حد است');
}
export const getBlogPosts=(limit,tenantId)=>api(`/blog?limit=${Number(limit)||10}`,{tenantId});
