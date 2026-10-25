/** UI-domain routes to the published SHOP-API.html public customer contract. */
export function backendRoute(path, method='GET') {
 const url=new URL(path,'https://internal.invalid'); const p=url.pathname, q=url.search;
 if(p==='/config')return '/store/config';
 if(p==='/categories')return '/product/category'+q;
 if(p==='/products'){
   const params=new URLSearchParams(url.search);
   if(params.has('query')){params.set('search',params.get('query'));params.delete('query');}
   if(params.has('category')){params.set('categoryId',params.get('category'));params.delete('category');}
   for(const name of ['sort','minPrice','maxPrice','availableOnly','page'])params.delete(name);
   if(!params.has('limit'))params.set('limit','20');
   return `/product?${params.toString()}`;
 }
 if(/^\/products\/[^/]+\/inventory$/.test(p))return '/product/'+p.split('/')[2];
 if(/^\/products\/[^/]+$/.test(p))return '/product/'+p.split('/')[2]+q;
 if(p==='/me')return '/profile';
 if(p==='/addresses'&&method==='GET')return '/addresses';
 if(p==='/auth/otp/request')return '/auth/otp/request';
 if(p==='/auth/otp/verify')return '/auth/otp/verify';
 if(p==='/auth/logout')return p;
 if(p==='/orders')return method==='POST'?'/checkout/orders':'/orders'+q;
 if(/^\/orders\/[^/]+$/.test(p))return p;
 if(p==='/shop-methods')return p;
 if(['/checkout/start','/checkout/quote'].includes(p))return p;
 if(/^\/checkout\/[^/]+(?:\/items|\/cancel)?$/.test(p))return p;
 if(['/banners','/blog','/wishlist','/coupons/validate'].includes(p)||p.startsWith('/wishlist/')||p.endsWith('/reviews')||p.endsWith('/returns'))return p+q;
 throw new Error(`مسیر API در قرارداد بک‌اند وجود ندارد: ${method} ${p}`);
}
