import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {productSelection, findCartItem, cartReducer, cartItemKey, purchaseStorageScope} from '../src/utils/cart.js';
import {normalizeDigits} from '../src/utils/format.js';

const sku = (id, stock, properties=[]) => ({proUID:id, stock, price:120, properties});
const color = value => ({name:'رنگ', value});
const simple = {id:'p', stock:3, price:120, features:[], variants:[sku('real-sku',3)]};
const shirt = {id:'shirt', stock:null, features:[{name:'رنگ', options:[{value:'قرمز'}, {value:'آبی'}]}],
  variants:[sku('red',2,[color('قرمز')]), sku('blue',1,[color('آبی')])], requiresVariantSelection:true};

test('Persian and Arabic digits are accepted by numeric forms without altering other text',()=>{
  assert.equal(normalizeDigits('۰۱۲۳۴۵۶۷۸۹ / ٠١٢٣٤٥٦٧٨٩'),'0123456789 / 0123456789');
  assert.equal(normalizeDigits(null),'');
});

test('Real payment intents retain their existing host key while Demo tenants stay separate',()=>{
  assert.equal(purchaseStorageScope('store.example','store-id',false),'real:store.example');
  assert.notEqual(purchaseStorageScope('localhost','alpha',true),purchaseStorageScope('localhost','beta',true));
  assert.notEqual(purchaseStorageScope('store.example','alpha',true),purchaseStorageScope('store.example','alpha',false));
});

function inventoryValidator(product) {
  const source = readFileSync(new URL('../src/services/inventorySync.js',import.meta.url),'utf8')
    .replace(/^import [^\n]+\n/gm,'').replace(/\bexport /g,'');
  return runInNewContext(source+';validateStockBeforeAdd;', {productSelection, getProductInventory:async()=>product});
}

function productService(api) {
  const source=readFileSync(new URL('../src/services/productService.js',import.meta.url),'utf8')
    .replace(/^import [^\n]+\n/gm,'').replace(/\bexport /g,'');
  return runInNewContext(source+';({getProductById,getProducts});', {api, URLSearchParams});
}

test('simple and single-property SKU add directly and retain the real identifier',async()=>{
  for(const p of [simple,{...simple,features:[{name:'رنگ',options:[{value:'قرمز'}]}],variants:[sku('single-red',3,[color('قرمز')])]}]) {
    const result=await inventoryValidator({...p,requiresVariantSelection:true})('p',1,'store');
    assert.equal(result.valid,true);
    assert.equal(result.proUID,p.variants[0].proUID);
    assert.equal(productSelection(p).requiresSelection,false);
  }
});

test('multiple options require a choice and quantities are checked per exact SKU',async()=>{
  const validate=inventoryValidator(shirt);
  assert.equal((await validate('shirt',1,'store')).requiresSelection,true);
  assert.equal((await validate('shirt',1,'store',{})).valid,false);
  const red=await validate('shirt',2,'store',{'رنگ':'قرمز'});
  assert.equal(red.valid,true);assert.equal(red.proUID,'red');
  assert.equal((await validate('shirt',3,'store',{'رنگ':'قرمز'})).valid,false);
  assert.equal((await validate('shirt',2,'store',{'رنگ':'آبی'})).valid,false);
  assert.equal((await validate('shirt',1,'store',{'رنگ':'سبز'})).valid,false);
  assert.equal((await validate('shirt',1,'store',{'رنگ':'قرمز'},'blue')).valid,false);
});

test('unknown stock, missing SKU, invalid prices and quantities stay blocked',async()=>{
  for(const p of [
    {...simple,variants:[],proUID:null},
    {...simple,requiresVariantSelection:true,variants:[sku(null,3)]},
    {...simple,variants:[sku('s',null)]},
    {...simple,variants:[{...sku('s',3),price:null}]},
    {...simple,variants:[{...sku('s',3),price:'bad'}]},
    {...simple,variants:[sku('s',0)]},
  ]) assert.equal((await inventoryValidator(p)('p',1,'store')).valid,false);
  for(const quantity of [0,-1,1.5,1001]) assert.equal((await inventoryValidator(simple)('p',quantity,'store')).valid,false);
});

test('cart controls find the added SKU, never combine colors, and remove at zero',()=>{
  let cart=cartReducer([],{type:'ADD_ITEM',payload:{product:{...simple,proUID:'real-sku'}}});
  assert.equal(findCartItem(cart,simple).quantity,1);
  cart=cartReducer(cart,{type:'ADD_ITEM',payload:{product:{...simple,proUID:'real-sku'}}});
  assert.equal(findCartItem(cart,simple).quantity,2);
  cart=cartReducer(cart,{type:'UPDATE_QUANTITY',payload:{cartItemId:cart[0].cartItemId,quantity:0}});
  assert.equal(cart.length,0);
  for(const value of ['قرمز','آبی']) {
    const variant=productSelection(shirt,{'رنگ':value}).variant;
    cart=cartReducer(cart,{type:'ADD_ITEM',payload:{product:{...shirt,proUID:variant.proUID,stock:variant.stock},selectedFeatures:{'رنگ':value}}});
  }
  assert.equal(cart.length,2);
  assert.equal(findCartItem(cart,shirt),null);
  assert.equal(findCartItem(cart,shirt,{'رنگ':'آبی'}).proUID,'blue');
  assert.notEqual(cart[0].cartItemId,cart[1].cartItemId);
});

test('repeated additions cannot exceed the checked stock or the cart limit',()=>{
  const product={...simple,proUID:'one',stock:1};
  const action={type:'ADD_ITEM',payload:{product}};
  let cart=cartReducer([],action);
  cart=cartReducer(cart,action);
  assert.equal(cart[0].quantity,1);
  const invalid=cartReducer(cart,{type:'UPDATE_QUANTITY',payload:{cartItemId:cartItemKey(product),quantity:1001}});
  assert.equal(invalid[0].quantity,1);
});

test('variant pagination preserves available options from earlier pages',async()=>{
  const pages=[{...shirt,variants:[sku('red-small',1,[color('قرمز'),{name:'سایز',value:'S'}])],variantsNextCursor:'next'},
    {...shirt,variants:[sku('red-large',0,[color('قرمز'),{name:'سایز',value:'L'}])],variantsNextCursor:null}];
  const service=productService(async()=>pages.shift());
  const result=await service.getProductById('shirt','store');
  assert.equal(result.variants.length,2);
  assert.equal(result.features.find(f=>f.name==='رنگ').options[0].available,true);
  assert.equal(result.features.find(f=>f.name==='سایز').options.find(o=>o.value==='L').available,false);
});

test('product missing and product service failure are distinct states',async()=>{
  assert.equal(await productService(async()=>{throw Object.assign(new Error('missing'),{status:404});}).getProductById('p'),null);
  await assert.rejects(productService(async()=>{throw Object.assign(new Error('offline'),{status:503});}).getProductById('p'),/offline/);
});

test('catalog uses the cursor and does not repeat the last page; demo filters reach the transport',async()=>{
  const calls=[];
  const service=productService(async path=>{calls.push(path);return calls.length===1?{items:[{id:'one'}],nextCursor:'c1'}:{items:[{id:'two'}],nextCursor:null};});
  assert.equal((await service.getProducts({page:2,sort:'cheapest',maxPrice:100})).items[0].id,'two');
  assert.match(calls[1],/after=c1/);assert.match(calls[0],/sort=cheapest/);assert.match(calls[0],/maxPrice=100/);
  assert.equal((await productService(async()=>({items:[{id:'last'}],nextCursor:null})).getProducts({page:2})).items.length,0);
});
