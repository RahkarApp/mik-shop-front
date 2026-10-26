import test from 'node:test';
import assert from 'node:assert/strict';
import {backendRoute} from '../src/utils/backendRoutes.js';
import {adaptStore,adaptProduct,adaptOrder,adaptResponse} from '../src/utils/backendAdapter.js';
import {paymentHref,orderNeedsPolling} from '../src/utils/orderPayment.js';

test('existing mik-shop routes are mapped exactly; unsafe order create is not used',()=>{
 assert.equal(backendRoute('/products?query=شال&limit=10'),'/product?limit=10&search=%D8%B4%D8%A7%D9%84');
 assert.equal(backendRoute('/products/abc'),'/product/abc');
 assert.equal(backendRoute('/categories'),'/product/category');
 assert.equal(backendRoute('/me','PATCH'),'/profile');
 assert.equal(backendRoute('/auth/otp/request','POST'),'/auth/otp/request');
 assert.equal(backendRoute('/auth/otp/verify','POST'),'/auth/otp/verify');
 assert.equal(backendRoute('/orders','GET'),'/orders');
 assert.equal(backendRoute('/orders','POST'),'/checkout/orders');
 assert.equal(backendRoute('/checkout/quote','POST'),'/checkout/quote');
 assert.equal(backendRoute('/config'),'/store/config');
 assert.equal(backendRoute('/checkout/start','POST'),'/checkout/start');
 assert.equal(backendRoute('/checkout/abc/items','PUT'),'/checkout/abc/items');
 assert.equal(backendRoute('/checkout/abc/cancel','POST'),'/checkout/abc/cancel');
 assert.equal(backendRoute('/categories?limit=20&after=xyz'),'/product/category?limit=20&after=xyz');
 assert.throws(()=>backendRoute('/admin/stores','DELETE'));
});
test('two real stores remain distinct, with one fixed template and dynamic branding',()=>{
 const a=adaptStore({uid:'a',name:'فروشگاه الف',tel:['02112345678'],primaryColor:'#123456',logo:'https://static.test/a.png'});
 const b=adaptStore({uid:'b',name:'فروشگاه ب',tel:['02187654321'],primaryColor:'#654321',logo:'https://static.test/b.png'});
 assert.notEqual(a.storeId,b.storeId);
 assert.notEqual(a.branding.logo,b.branding.logo);
 assert.notEqual(a.theme.primaryColor,b.theme.primaryColor);
 assert.deepEqual(a.layout,b.layout);
 assert.equal(a.layout.template,'storefront-v1');
 assert.equal(a.features.wishlist,false);
 assert.throws(()=>adaptStore({uid:'abc'}));
});
test('no missing price or inventory is forged into zero',()=>{
 const p=adaptProduct({uid:'prod-1',name:'بدون قیمت',img:[]});
 assert.equal(p.price,null);assert.equal(p.stock,null);assert.equal(p.image,'');
 const q=adaptProduct({uid:'prod-2',name:'با قیمت صفر',minPrice:0,inventory:0});
 assert.equal(q.price,0);assert.equal(q.stock,0);
});
test('variant without SKU remains explicitly unknown and blocked',()=>{
 const p=adaptProduct({uid:'prod-3',name:'دو رنگ',pro:[{price:10,inventory:2,value:[{name:'رنگ',value:'سبز'}]}]});
 assert.equal(p.variants.length,1);assert.equal(p.variants[0].proUID,null);
 const inventory=adaptResponse('/products/prod-3/inventory','GET',{status:true,data:{uid:'prod-3',name:'دو رنگ',pro:[{price:10,inventory:2,value:[]}]}});
 assert.equal(inventory.variantMissingId,true);
});
test('known list and invoice envelopes are adapted without inventing totals',()=>{
 const list=adaptResponse('/products','GET',{status:true,data:[{uid:'x',name:'X',minPrice:15,inventory:3}]});
 assert.equal(list.items[0].id,'x');assert.equal(list.items[0].price,15);
 const order=adaptOrder({uid:'i1',customerUID:'c1',items:{p1:[{proUID:17,qty:2,price:5}]},status:[{status:1}]});
 assert.equal(order.id,'i1');assert.equal(order.items[0].quantity,2);
 assert.equal(order.summary.total,null);
 assert.equal(adaptOrder({orderId:'new-order',totals:{total:450000}}).summary.total,450000);
 assert.throws(()=>adaptResponse('/categories','GET',{status:false,message:'failed'}),/failed/);
});

test('order detail envelope exposes the real payment fields and lines',()=>{
 const result=adaptResponse('/orders/order-1','GET',{status:true,data:{order:{orderId:'order-1',processingStatus:'AWAITING_PAYMENT',paymentState:'PENDING',paymentRequired:true,paymentUrl:'https://pay.example/start',paymentExpiresAt:'2030-01-01T00:00:00.000Z',lines:[{productId:'p1',quantity:'2'}],totals:{total:250000}}}});
 assert.equal(result.id,'order-1');assert.equal(result.paymentState,'PENDING');assert.equal(result.items[0].productId,'p1');assert.equal(result.summary.total,250000);
});

test('only an active HTTPS backend payment link is usable and pending orders are polled',()=>{
 const now=Date.parse('2026-10-26T10:00:00.000Z');
 const pending={processingStatus:'AWAITING_PAYMENT',paymentState:'PENDING',paymentRequired:true,paymentUrl:'https://pay.example/start',paymentExpiresAt:'2026-10-26T10:15:00.000Z'};
 assert.equal(paymentHref(pending,now),'https://pay.example/start');
 assert.equal(paymentHref({...pending,paymentUrl:'http://pay.example/start'},now),'');
 assert.equal(paymentHref({...pending,paymentExpiresAt:'2026-10-26T09:59:59.000Z'},now),'');
 assert.equal(orderNeedsPolling({processingStatus:'PROCESSING'},now),true);
 assert.equal(orderNeedsPolling({...pending,paymentUrl:null},now),true);
 assert.equal(orderNeedsPolling(pending,now),false);
 assert.equal(orderNeedsPolling({...pending,paymentState:'PAID',paymentUrl:null},now),true);
 assert.equal(orderNeedsPolling({...pending,processingStatus:'CONFIRMED',paymentState:'PAID'},now),false);
});

test('single variant keeps SKU selection requirement; missing id is not invented',()=>{
 const single=adaptProduct({uid:'product-one',name:'One',pro:[{uid:'pro-one',price:120,inventory:2,value:[{name:'اندازه',value:'M'}]}]});
 assert.equal(single.requiresVariantSelection,true);
 assert.equal(single.variants[0].proUID,'pro-one');
 assert.equal(adaptProduct({name:'Missing UID'}).id,null);
});

test('published shopId and branding fields map to the single existing storefront template',()=>{
 const shop=adaptStore({shopId:'real-uuid',name:'دکان',branding:{logoUrl:'https://cdn.example/logo.png',primaryColor:'#123456'}});
 assert.equal(shop.storeId,'real-uuid');assert.equal(shop.branding.logo,'https://cdn.example/logo.png');
 assert.equal(shop.theme.primaryColor,'#123456');assert.equal(shop.layout.template,'storefront-v1');
});
test('maxPrice is not a fabricated crossed-out original price and unknown stock stays null',()=>{
 const item=adaptProduct({uid:'a',name:'کالا',minPrice:120,maxPrice:180,inventory:null,inventoryAvailable:false});
 assert.equal(item.originalPrice,null);assert.equal(item.stock,null);
});

test('malformed catalog responses are errors rather than a fabricated empty catalog',()=>{
 for(const path of ['/products','/categories']){
  assert.throws(()=>adaptResponse(path,'GET',{status:true,data:{}}),{code:'INVALID_BACKEND_RESPONSE'});
  assert.equal(adaptResponse(path,'GET',{status:true,data:{items:[],nextCursor:null}}).items.length,0);
 }
});
