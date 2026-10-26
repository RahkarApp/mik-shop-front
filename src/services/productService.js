import {api} from './api';
import {buildCategoryTree} from '@/utils/categories';
const enc=value=>encodeURIComponent(String(value));
export async function getProducts(options={}, tenantId){
 const {page=1,limit=20,query='',category='',sort='',minPrice='',maxPrice='',availableOnly=''}=options;
 const params=new URLSearchParams({limit:String(Math.min(50,Math.max(1,Number(limit)||20))),...(query?{query}:{}),...(category?{category}:{})});
 for(const [key,value] of Object.entries({sort,minPrice,maxPrice,availableOnly,page}))if(value!==''&&value!=null)params.set(key,String(value));
 const requestedPage=Math.min(Math.max(1,Number(page)||1),100);
 let cursor=null,results={items:[],nextCursor:null};
 // Cursor-backed API: derive a requested page by advancing cursors. No page index sent to backend.
 for(let index=1;index<=requestedPage;index++){
  const cursorQuery=new URLSearchParams(params);
  if(cursor)cursorQuery.set('after',cursor);
  results=await api(`/products?${cursorQuery}`,{tenantId});
  if(Array.isArray(results))return results;
  cursor=results?.nextCursor;
  if(!cursor){if(index<requestedPage)return {items:[],nextCursor:null};break;}
 }
 return results;
}
export async function getProductById(id,tenantId,host){
 let base;
 try {base=await api(`/products/${enc(id)}`,{tenantId,host});}
 catch(error){if(error.status===404)return null;throw error;}
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
  const previous=map.get(a.name).get(String(a.value));
  map.get(a.name).set(String(a.value),{value:String(a.value),available:Boolean(previous?.available||v.stock!=null&&Number(v.stock)>0),colorCode:a.code||null});
 }
 return {...base,variants,variantsComplete:true,variantsNextCursor:null,
   features:variants.length ? [...map].map(([name,opts])=>({name,options:[...opts.values()]})) : base.features || []};
}
export async function getProductInventory(id,tenantId){
 const p=await getProductById(id,tenantId);
 return p ? {...p,productId:p.id,
  requiresVariantSelection:p.requiresVariantSelection||p.variants.length>0||p.features.length>0,variantMissingId:p.variants.some(v=>!v.proUID)}:null;
}
export const getBanners=tenantId=>api('/banners',{tenantId});
export async function getCategories(tenantId,host){
 let cursor=null,all=[];
 const seen=new Set();
 for(let page=0;page<100;page++){
  const query=new URLSearchParams({limit:'50'});
  if(cursor)query.set('after',cursor);
  const response=await api(`/categories?${query}`,{tenantId,host});
  all.push(...(Array.isArray(response)?response:response?.items||[]));
  cursor=response?.nextCursor;
  if(!cursor)return buildCategoryTree(all);
  if(seen.has(cursor))throw Object.assign(new Error('صفحه‌بندی دسته‌بندی‌ها کامل نشد'),{code:'INVALID_BACKEND_RESPONSE'});
  seen.add(cursor);
 }
 throw new Error('تعداد صفحه‌های دسته‌بندی بیش از حد است');
}
export const getBlogPosts=(limit,tenantId)=>api(`/blog?limit=${Number(limit)||10}`,{tenantId});
