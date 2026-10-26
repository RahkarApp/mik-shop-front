import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {buildCategoryTree, findCategoryPath, searchCategoryTree} from '../src/utils/categories.js';
import {normalizeCheckoutMethods, checkoutPaymentOptions} from '../src/utils/checkoutMethods.js';
import {customerErrorMessage} from '../src/utils/customerError.js';
import * as format from '../src/utils/format.js';
import * as cartUtils from '../src/utils/cart.js';
import {paymentHref} from '../src/utils/orderPayment.js';

const require = createRequire(import.meta.url);
const {transformSync} = require('next/dist/build/swc');
const source = file => readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
function component(file, overrides={}) {
  const {code} = transformSync(source(file), {filename:file, jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}});
  const module = {exports:{}};
  runInNewContext(code,{module,exports:module.exports,require:name=>Object.hasOwn(overrides,name)?overrides[name]:require(name),console});
  return module.exports.default;
}
const categoryRows = [
  {categoryId:'small',name:'کیف زنانه',parentId:'bags',sortOrder:2},
  {categoryId:'bags',name:'کیف',parentId:'clothes',sortOrder:1},
  {categoryId:'clothes',name:'پوشاک',parentId:null,sortOrder:1},
  {categoryId:'orphan',name:'سایر',parentId:'missing',sortOrder:2},
];
const methodsPayload = {
  shippingMethods:[{shippingMethodId:'pickup',name:'تحویل در فروشگاه',amount:0,currency:'TOMAN',active:true,requiresAddress:false},
    {shippingMethodId:'post',name:'پست سفارشی',amount:23000,currency:'TOMAN',active:true,requiresAddress:true},
    {shippingMethodId:'old',name:'ارسال قدیمی',active:false}],
  paymentMethods:[{id:'online',name:'درگاه پرداخت فروشگاه',enabled:true}],
};

test('flat backend category parents become a sorted tree even when children arrive first',()=>{
  const before=JSON.stringify(categoryRows),tree=buildCategoryTree(categoryRows);
  assert.deepEqual(tree.map(item=>item.id),['clothes','orphan']);
  assert.deepEqual(findCategoryPath(tree,'small').map(item=>item.id),['clothes','bags','small']);
  assert.equal(tree[1].parentId,'missing');assert.equal(JSON.stringify(categoryRows),before);
});
test('nested Demo categories, parent aliases, duplicate rows and corrupt cycles remain safe',()=>{
  const tree=buildCategoryTree([{id:'root',name:'والد',subcategories:[{id:'child',name:'فرزند'}]},{uid:'other',name:'زیرمجموعه',parent:'root'},{id:'child',name:'فرزند',parentId:'root'}]);
  assert.equal(tree.length,1);assert.equal(tree[0].subcategories.length,2);
  const cycles=buildCategoryTree([{id:'a',name:'A',parentId:'b'},{id:'b',name:'B',parentId:'a'},{id:'self',name:'Self',parentId:'self'}]);
  assert.equal(cycles.length,3);assert.equal(findCategoryPath(cycles,'self').length,1);
  assert.throws(()=>buildCategoryTree([{name:'بدون شناسه'}]),{code:'INVALID_BACKEND_RESPONSE'});
});
test('category search finds Persian/Arabic spelling and keeps the full parent path',()=>{
  const tree=buildCategoryTree(categoryRows),before=JSON.stringify(tree);
  const results=searchCategoryTree(tree,'كيف زنانه');
  assert.deepEqual(findCategoryPath(results,'small').map(item=>item.id),['clothes','bags','small']);
  assert.equal(searchCategoryTree(tree,'پوشاک')[0].subcategories.length,1);
  assert.equal(searchCategoryTree(tree,'بی‌نتیجه').length,0);assert.equal(JSON.stringify(tree),before);
});
test('category service joins all cursor pages before connecting parents',async()=>{
  const calls=[],pages=[{items:categoryRows.slice(0,2),nextCursor:'next'},{items:categoryRows.slice(2),nextCursor:null}];
  const script=source('services/productService.js').replace(/^import .+;\r?\n/gm,'').replace(/\bexport /g,'');
  const get=runInNewContext(script+';getCategories;',{URLSearchParams,buildCategoryTree,api:async path=>{calls.push(path);return pages.shift();}});
  const tree=await get('shop');assert.equal(findCategoryPath(tree,'small').length,3);assert.match(calls[1],/after=next/);
});
test('shop methods preserve backend labels and zero amounts, and do not enable missing flags',()=>{
  const methods=normalizeCheckoutMethods(methodsPayload);
  assert.deepEqual(methods.shippingMethods.map(item=>item.id),['pickup','post']);
  assert.equal(methods.shippingMethods[0].amount,0);assert.equal(methods.paymentMethods[0].name,'درگاه پرداخت فروشگاه');
  assert.throws(()=>normalizeCheckoutMethods({shippingMethods:[]}),{code:'INVALID_BACKEND_RESPONSE'});
  assert.throws(()=>normalizeCheckoutMethods({...methodsPayload,paymentMethods:[null]}),{code:'INVALID_BACKEND_RESPONSE'});
  assert.throws(()=>normalizeCheckoutMethods({...methodsPayload,paymentMethods:[...methodsPayload.paymentMethods,...methodsPayload.paymentMethods]}),{code:'INVALID_BACKEND_RESPONSE'});
  assert.equal(normalizeCheckoutMethods({...methodsPayload,shippingMethods:[{id:'unknown',name:'نامعلوم'}]}).shippingMethods.length,0);
});
test('payment must be enabled by the backend and the latest Quote; COD is never invented',()=>{
  const list=[...methodsPayload.paymentMethods,{id:'cod',name:'روش دیگر',enabled:true}];
  const available=checkoutPaymentOptions(list,{paymentMethods:[{id:'online',enabled:true}],orderSubmissionAvailable:true});
  assert.equal(available[0].enabled,true);assert.equal(available[1].enabled,false);
  assert.equal(checkoutPaymentOptions(list,{paymentMethods:[],orderSubmissionAvailable:true})[0].enabled,false);
  assert.equal(checkoutPaymentOptions(list,{paymentMethods:[{id:'online',enabled:true}],orderSubmissionAvailable:false})[0].enabled,false);
  assert.equal(checkoutPaymentOptions([{id:'online',name:'پرداخت',enabled:'true'}],null)[0].enabled,false);
});
test('customer failures distinguish stock, shipping, payment and uncertain order without leaking raw messages',()=>{
  const stock=customerErrorMessage({code:'INSUFFICIENT_STOCK'}),shipping=customerErrorMessage({code:'SHIPPING_METHOD_UNAVAILABLE'}),payment=customerErrorMessage({code:'PAYMENT_NOT_CONFIGURED'});
  assert.notEqual(stock,shipping);assert.notEqual(shipping,payment);assert.match(stock,/تعداد/);assert.match(payment,/پشتیبانی/);
  assert.doesNotMatch(customerErrorMessage({message:'RPC private details'},'methods'),/RPC|private/);
  assert.match(customerErrorMessage({status:502},'order'),/وضعیت سفارش/);
});

const Badge=component('components/shared/CartBadge.js',{'@/utils/format':format});
const Choices=component('components/shared/CheckoutMethodChoices.js');
test('cart badges render Persian quantities and disappear only for an empty cart',()=>{
  assert.equal(renderToStaticMarkup(React.createElement(Badge,{count:0})), '');
  const markup=renderToStaticMarkup(React.createElement(Badge,{count:3}));assert.match(markup,/>۳</);assert.match(markup,/aria-label="۳ کالا در سبد خرید"/);
  assert.match(renderToStaticMarkup(React.createElement(Badge,{count:150})),/۹۹\+/);
});
test('the mobile cart icon keeps its badge on checkout, login and Demo routes',()=>{
  for(const pathname of ['/checkout','/login','/demo/cart']) {
    const Menu=component('components/shared/BottomMenu.js',{'@/components/PreviewLink':props=>React.createElement('a',props,props.children),
      'next/navigation':{usePathname:()=>pathname},'./CartContext':{useCart:()=>({cartItemCount:4})},'./CartBadge':Badge});
    assert.match(renderToStaticMarkup(React.createElement(Menu,{})),/aria-label="۴ کالا در سبد خرید"/);
  }
});
test('checkout choices render real checkboxes, one checked value and the disabled backend reason',()=>{
  const markup=renderToStaticMarkup(React.createElement(Choices,{title:'پرداخت',name:'payment',selectedId:'online',onChange:()=>{},
    options:[{id:'online',name:'درگاه فروشگاه',enabled:true},{id:'blocked',name:'غیرفعال',enabled:false,detail:'فعلاً در دسترس نیست'}]}));
  assert.equal((markup.match(/type="checkbox"/g)||[]).length,2);assert.equal((markup.match(/checked=""/g)||[]).length,1);
  assert.match(markup,/disabled=""/);assert.match(markup,/درگاه فروشگاه/);assert.match(markup,/فعلاً در دسترس نیست/);
});
test('category tree renders search, accessible parent expansion and no fake arrows on leaves',()=>{
  const Tree=component('components/shared/CategoryTree.js',{'@/utils/categories':{findCategoryPath,searchCategoryTree}});
  const markup=renderToStaticMarkup(React.createElement(Tree,{categories:buildCategoryTree(categoryRows),onSelect:()=>{}}));
  assert.match(markup,/type="search"/);assert.equal((markup.match(/aria-expanded=/g)||[]).length,1);assert.match(markup,/پوشاک/);
});

function checkoutHarness({revokePayment=false} = {}) {
  const values=[],effects=[],storage=new Map(),quotes=[],orders=[];let cursor=0,revision=1;
  const methods=normalizeCheckoutMethods(methodsPayload),profile={name:'Customer',phone:'09000000000',addresses:[]};
  const hooks={...React,
    useState:initial=>{const slot=cursor++;if(!(slot in values))values[slot]=typeof initial==='function'?initial():initial;return [values[slot],next=>{values[slot]=typeof next==='function'?next(values[slot]):next;}];},
    useRef:initial=>{const slot=cursor++;if(!(slot in values))values[slot]={current:initial};return values[slot];},
    useEffect:(callback,deps)=>{const slot=cursor++,previous=values[slot];if(!previous||deps.some((value,index)=>value!==previous.deps[index])){previous?.cleanup?.();values[slot]={deps};effects.push(()=>{values[slot].cleanup=callback();});}},
  };
  const actions={startCheckout:async()=>({checkout:{checkoutId:'checkout-fixture',revision,status:'ACTIVE'}}),getCheckout:async()=>({checkout:{checkoutId:'checkout-fixture',revision,status:'ACTIVE'}}),
    quoteCheckout:async(...args)=>{quotes.push(args);revision++;const enabled=!(revokePayment&&quotes.length>1);return {checkoutId:'checkout-fixture',quoteId:'quote-'+revision,revision,currency:'TOMAN',totals:{subtotal:100,shippingAmount:0,discountAmount:0,taxAmount:0,total:100},expiresAt:new Date(Date.now()+600000).toISOString(),paymentMethods:[{id:'online',enabled,...(!enabled?{reason:'PAYMENT_NOT_CONFIGURED'}:{})}],orderSubmissionAvailable:enabled};},
    placeOrder:async payload=>{orders.push(payload);return {order:{orderId:'checkout-fixture'}};},createAddress:async()=>{throw new Error('Pickup must not create an address');}};
  // The compiled component receives these browser objects through its VM, not the real browser.
  const overrides={'react':hooks,'framer-motion':{motion:{div:'div'},AnimatePresence:props=>props.children},'@/utils/demoRoute':{isDemoRuntime:()=>true},
    '@/hooks/useShopActions':{useShopActions:()=>actions},'@/hooks/useCheckoutAccess':{useCheckoutAccess:()=>({status:'allowed',profile})},
    '@/hooks/useOrders':{useOrders:()=>({data:null,loading:false,error:'',retry:()=>{}})},'@/utils/orderPayment':{paymentHref},
    '@/hooks/useCheckoutMethods':{useCheckoutMethods:()=>({...methods,loading:false,error:''})},'@/utils/checkoutMethods':{checkoutPaymentOptions},
    '@/utils/customerError':{customerErrorMessage},'./CheckoutMethodChoices':Choices,'@/hooks/useSiteConfig':{useSiteConfig:()=>({config:{currency:'TOMAN'},tenantId:'store',loading:false})},
    '@/utils/format':format,'@/utils/cart':cartUtils,'@/components/shared/CartContext':{useCart:()=>({cart:[{id:'product',proUID:'sku',cartItemId:'item',quantity:1,price:100}],ready:true,dispatch:()=>{}})},
    '@/components/PreviewLink':props=>React.createElement('a',props,props.children)};
  const {code}=transformSync(source('components/shared/CheckoutClient.js'),{filename:'checkout.jsx',jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}});
  const module={exports:{}};
  runInNewContext(code,{module,exports:module.exports,require:name=>Object.hasOwn(overrides,name)?overrides[name]:require(name),crypto:webcrypto,
    window:{location:{hostname:'store.example',assign:()=>{}}},sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},setTimeout});
  return {quotes,orders,render:()=>{cursor=0;const tree=module.exports.default();while(effects.length)effects.shift()();return tree;}};
}
function elements(node) {return !node||typeof node!=='object'?[]:[node,...React.Children.toArray(node.props?.children).flatMap(elements)];}
function textContent(node) {return typeof node==='string'?node:!node||typeof node!=='object'?'':React.Children.toArray(node.props?.children).map(textContent).join(' ');}
test('actual checkout selection invalidates Quote and submits only the explicitly selected server payment',async()=>{
  const fixture=checkoutHarness();fixture.render();let tree=fixture.render();
  const shipping=elements(tree).find(node=>node.type===Choices&&node.props.name==='shipping-method');
  shipping.props.onChange('pickup');tree=fixture.render();
  const next=()=>elements(tree).find(node=>node.type==='button'&&textContent(node).includes('مرحله بعد'));
  await next().props.onClick();tree=fixture.render();assert.equal(fixture.quotes.length,1);assert.equal(fixture.orders.length,0);
  const payment=elements(tree).find(node=>node.type===Choices&&node.props.name==='payment-method');
  assert.equal(payment.props.options[0].name,'درگاه پرداخت فروشگاه');payment.props.onChange('online');tree=fixture.render();
  assert.match(textContent(tree),/در انتظار استعلام/);
  await next().props.onClick();tree=fixture.render();assert.equal(fixture.quotes.length,2);assert.equal(fixture.orders.length,0);
  const submit=elements(tree).find(node=>node.type==='button'&&textContent(node).includes('پرداخت و ثبت نهایی'));
  assert.equal(submit.props.disabled,false);await submit.props.onClick();assert.equal(fixture.orders.length,1);
  assert.equal(fixture.orders[0].paymentMethod,'online');assert.match(fixture.orders[0].quoteId,/quote-/);
});

test('a revoked payment stays disabled after Quote invalidation and cannot submit or repeatedly re-quote',async()=>{
  const fixture=checkoutHarness({revokePayment:true});fixture.render();let tree=fixture.render();
  elements(tree).find(node=>node.type===Choices&&node.props.name==='shipping-method').props.onChange('pickup');tree=fixture.render();
  const next=()=>elements(tree).find(node=>node.type==='button'&&textContent(node).includes('مرحله بعد'));
  await next().props.onClick();tree=fixture.render();
  elements(tree).find(node=>node.type===Choices&&node.props.name==='payment-method').props.onChange('online');tree=fixture.render();
  await next().props.onClick();fixture.render();tree=fixture.render();
  const payment=elements(tree).find(node=>node.type===Choices&&node.props.name==='payment-method');
  assert.equal(payment.props.options[0].enabled,false);assert.equal(payment.props.selectedId,'');assert.match(textContent(tree),/پرداخت آنلاین فروشگاه فعلاً فعال نیست/);
  assert.equal(fixture.orders.length,0);assert.equal(fixture.quotes.length,2);
  await next().props.onClick();assert.equal(fixture.quotes.length,2);
});
