'use client';
import {isDemoRuntime} from '@/utils/demoRoute';


import React, { useState, useRef, useEffect } from "react";
import {useShopActions} from '@/hooks/useShopActions';
import {useCheckoutAccess} from '@/hooks/useCheckoutAccess';
import {useCheckoutMethods} from '@/hooks/useCheckoutMethods';
import {checkoutPaymentOptions} from '@/utils/checkoutMethods';
import {customerErrorMessage} from '@/utils/customerError';
import CheckoutMethodChoices from './CheckoutMethodChoices';
import { useSiteConfig } from "@/hooks/useSiteConfig";
import {formatMoney,normalizeDigits} from '@/utils/format';
import {purchaseStorageScope} from '@/utils/cart';
import { useCart } from "@/components/shared/CartContext";
import Link from "@/components/PreviewLink";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    CreditCard,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Wallet,
} from "lucide-react";

// تابع کمکی برای تبدیل اعداد به فارسی
const toPersianDigits = (num) => {
    if (num === undefined || num === null) return "";
    const persian = {
        0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "۴", 5: "۵", 6: "۶", 7: "۷", 8: "۸", 9: "۹",
    };
    return num.toString().replace(/[0-9]/g, (d) => persian[d]);
};

// مراحل خرید
const STEPS = [
    { id: 1, title: "اطلاعات ارسال", icon: MapPin },
    { id: 2, title: "پرداخت", icon: CreditCard },
    { id: 3, title: "تایید نهایی", icon: CheckCircle },
];

export default function CheckoutClient() {
    const { cart, dispatch, ready } = useCart();
    const { config, tenantId } = useSiteConfig();
    const {quoteCheckout,placeOrder,startCheckout,getCheckout,updateCheckoutItems,createAddress}=useShopActions();
    const access=useCheckoutAccess();
    const {shippingMethods,paymentMethods,loading:methodsLoading,error:methodsError,retry:retryMethods}=useCheckoutMethods({enabled:access.status==='allowed',onUnauthorized:access.redirectToLogin});
    const [quote, setQuote] = useState(null);
    const [paymentCheck,setPaymentCheck]=useState(null);
    const [checkout, setCheckout] = useState(null);
    const [shippingMethodId,setShippingMethodId]=useState('');
    const [paymentMethodId,setPaymentMethodId]=useState('');
    const [addressId,setAddressId]=useState('');
    const [savedAddresses,setSavedAddresses]=useState([]);
    const startIntent=useRef(null);
    const quoteIntent=useRef(null);
    useEffect(()=>{
      if(!access.profile)return;
      setSavedAddresses(access.profile.addresses||[]);
      setFormData(previous=>({...previous,name:access.profile.name||'',phone:access.profile.phone||''}));
    },[access.profile]);

    const [orderId, setOrderId] = useState(null);
    const [submitError,setSubmitError]=useState('');
    const idempotencyRef = useRef(null);
    const [uncertain, setUncertain] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        province: "",
        city: "",
        address: "",
        postalCode: "",
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const operationLock = useRef(false);
    const mounted = useRef(true);
    useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
    // Address or cart changes invalidate the visible price. Only a fresh server quote can be submitted.
    const cartFingerprint=JSON.stringify(cart.map(item=>[item.cartItemId,item.proUID,item.quantity]));
    const selectedShipping=shippingMethods.find(method=>method.id===shippingMethodId);
    const paymentOptions=checkoutPaymentOptions(paymentMethods,paymentCheck);
    const effectiveAddressId=selectedShipping?.requiresAddress===false?'':addressId;
    const quoteInputKey=JSON.stringify([cartFingerprint,shippingMethodId,effectiveAddressId,formData.province,formData.city,formData.address,formData.postalCode,paymentMethodId]);
    useEffect(() => {setQuote(current=>current?.inputKey===quoteInputKey?current:null);}, [quoteInputKey]);
    useEffect(()=>{setPaymentCheck(null);setQuote(null);},[shippingMethods,paymentMethods]);
    useEffect(()=>{if(paymentMethodId&&!paymentOptions.some(method=>method.id===paymentMethodId&&method.enabled))setPaymentMethodId('');},[paymentMethodId,paymentCheck,paymentMethods]);

    // اگر سبد خرید خالی است (و سفارش تکمیل نشده)
    if (access.status==='checking'||access.status==='redirecting') return <p role="status" className="py-20 text-center">{access.status==='redirecting'?'برای ادامه خرید، به صفحه ورود منتقل می‌شوید...':'در حال بررسی ورود به حساب...'}</p>;
    if (access.status==='error') return <div className="py-20 text-center space-y-4"><p role="alert">{access.error}</p><button type="button" onClick={access.retry} className="bg-primary text-white px-5 py-3 rounded-xl">تلاش دوباره</button></div>;
    if (!ready) return <p role="status" className="py-20 text-center">در حال دریافت سبد خرید...</p>;
    if (cart.length === 0 && !orderComplete) {
        if (typeof window !== 'undefined') {
            // ریدایرکت یا پیام
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
                    <div className="text-gray-300">
                        <Wallet size={64} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700">سبد خرید شما خالی است</h2>
                    <Link href="/" className="text-primary hover:underline">بازگشت به فروشگاه</Link>
                </div>
            )
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name==='postalCode'?normalizeDigits(value):value }));
    };

    const itemsForCheckout=()=>cart.map(x=>({productId:String(x.id),variantId:String(x.proUID||''),quantity:String(x.quantity)}));
    async function ensureActiveCheckout() {
      const items=itemsForCheckout();
      if(items.some(x=>!x.variantId))throw Object.assign(new Error(),{code:'CART_ITEM_UNAVAILABLE'});
      const fingerprint=JSON.stringify(items);
      const storageKey=`shop-checkout:${purchaseStorageScope(window.location.hostname,tenantId,isDemoRuntime())}`;
      let existing=null;
      try{existing=JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{}
      if(!existing){existing={fingerprint,key:crypto.randomUUID(),checkoutId:null};sessionStorage.setItem(storageKey,JSON.stringify(existing));}
      startIntent.current=existing;
      let state;
      if(existing.checkoutId){state=(await getCheckout(existing.checkoutId)).checkout;if(!state)throw Object.assign(new Error(),{code:'CHECKOUT_NOT_FOUND'});}
      else {
        // If start timed out, reuse the same key and body, never create an unrelated reservation.
        if(existing.fingerprint!==fingerprint)throw Object.assign(new Error(),{code:'IDEMPOTENCY_CONFLICT'});
        const created=await startCheckout(items,existing.key);
        state=created.checkout;
        if(!state?.checkoutId)throw Object.assign(new Error(),{code:'INVALID_BACKEND_RESPONSE'});
        existing.checkoutId=state.checkoutId;
        sessionStorage.setItem(storageKey,JSON.stringify(existing));
      }
      for(let attempt=0;attempt<15&&state.status==='RESERVING';attempt++){
        await new Promise(r=>setTimeout(r,1500));state=(await getCheckout(state.checkoutId)).checkout;
      }
      if(state.status==='SUBMITTED'||state.status==='ORDERING'){
        if(state.orderId){setOrderId(state.orderId);setOrderComplete(true)}
        throw Object.assign(new Error(),{code:'ORDER_ALREADY_SUBMITTED'});
      }
      if(state.status==='EXPIRED'||state.status==='CANCELLED'){
        existing={fingerprint,key:crypto.randomUUID(),checkoutId:null};
        sessionStorage.setItem(storageKey,JSON.stringify(existing));
        const created=await startCheckout(items,existing.key);
        state=created.checkout;existing.checkoutId=state?.checkoutId;
        sessionStorage.setItem(storageKey,JSON.stringify(existing));
        for(let i=0;i<15&&state.status==='RESERVING';i++){
          await new Promise(r=>setTimeout(r,1500));state=(await getCheckout(state.checkoutId)).checkout;
        }
      }
      if(state.status!=='ACTIVE')throw Object.assign(new Error(),{code:state.errorCode||'CHECKOUT_BUSY'});
      if(existing.fingerprint!==fingerprint){
        // Replace the active reservation atomically: do not start a second checkout.
        const pending=existing.pendingUpdate?.fingerprint===fingerprint
          ? existing.pendingUpdate : {fingerprint,key:crypto.randomUUID(),expectedRevision:state.revision};
        existing.pendingUpdate=pending;
        sessionStorage.setItem(storageKey,JSON.stringify(existing));
        const result=await updateCheckoutItems(state.checkoutId,items,pending.expectedRevision,pending.key);
        state=result.checkout;
        for(let i=0;i<15&&state.status==='RESERVING';i++){
          await new Promise(r=>setTimeout(r,1500));state=(await getCheckout(state.checkoutId)).checkout;
        }
        if(state.status!=='ACTIVE'||state.errorCode)throw Object.assign(new Error(),{code:state.errorCode||'CHECKOUT_BUSY'});
        existing.fingerprint=fingerprint;delete existing.pendingUpdate;
        sessionStorage.setItem(storageKey,JSON.stringify(existing));
      }
      setCheckout(state);return state;
    }
    async function getValidAddress() {
      const shipping=shippingMethods.find(x=>x.id===shippingMethodId);
      if(!shipping)throw Object.assign(new Error(),{code:'SHIPPING_METHOD_REQUIRED'});
      if(shipping.requiresAddress===false)return null;
      if(addressId)return addressId;
      if(!formData.address.trim())throw Object.assign(new Error(),{code:'ADDRESS_REQUIRED'});
      if(formData.postalCode&&!/^\d{10}$/.test(formData.postalCode))throw Object.assign(new Error(),{code:'POSTAL_CODE_INVALID'});
      const text=[formData.province,formData.city,formData.address,formData.postalCode?`کد پستی: ${formData.postalCode}`:''].filter(Boolean).join('، ');
      const created=await createAddress({title:'آدرس تحویل',fullAddress:text,postalCode:formData.postalCode});
      const id=created.addressId||created.id;
      if(!id)throw Object.assign(new Error(),{code:'INVALID_BACKEND_RESPONSE'});
      setAddressId(id);
      setSavedAddresses(old=>[...old,created]);
      return id;
    }
    async function fetchQuote() {
      const addr=await getValidAddress();
      const active=await ensureActiveCheckout();
      const fingerprint=JSON.stringify({checkoutId:active.checkoutId,revision:active.revision,shippingMethodId,addressId:addr});
      if(quoteIntent.current?.fingerprint!==fingerprint)quoteIntent.current={fingerprint,key:crypto.randomUUID()};
      const result=await quoteCheckout(active.checkoutId,shippingMethodId,addr,quoteIntent.current.key);
      if(!result?.quoteId||!result.totals||!Number.isSafeInteger(result.totals.total)||result.totals.total<0||typeof result.orderSubmissionAvailable!=='boolean'||!Array.isArray(result.paymentMethods)||!Number.isFinite(Date.parse(result.expiresAt)))throw Object.assign(new Error(),{code:'INVALID_BACKEND_RESPONSE'});
      if(Date.parse(result.expiresAt)<=Date.now())throw Object.assign(new Error(),{code:'QUOTE_EXPIRED'});
      setPaymentCheck(result);
      const inputKey=JSON.stringify([cartFingerprint,shippingMethodId,addr||'',formData.province,formData.city,formData.address,formData.postalCode,paymentMethodId]);
      setQuote({...result,...result.totals,shipping:result.totals.shippingAmount,discount:result.totals.discountAmount,tax:result.totals.taxAmount,inputKey});
      return result;
    }
    const nextStep=async()=>{
      if(operationLock.current||methodsLoading||methodsError)return;
      operationLock.current=true;
      setIsProcessing(true);setSubmitError('');
      try {
        if(currentStep===2&&!paymentMethodId)throw Object.assign(new Error(),{code:paymentOptions.some(method=>method.enabled)?'PAYMENT_METHOD_REQUIRED':'PAYMENT_NOT_CONFIGURED'});
        const freshQuote=await fetchQuote();
        if(currentStep===2&&!checkoutPaymentOptions(paymentMethods,freshQuote).some(method=>method.id===paymentMethodId&&method.enabled))throw Object.assign(new Error(),{code:'PAYMENT_NOT_CONFIGURED'});
        setCurrentStep(prev=>Math.min(prev+1,STEPS.length));
      } catch(error) {if(error.status===401)access.redirectToLogin();else setSubmitError(customerErrorMessage(error,'quote'));}
      finally {operationLock.current=false;setIsProcessing(false);}
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handlePlaceOrder=async()=>{
      if(operationLock.current||isProcessing||uncertain||orderId||!quote||!checkout)return;
      if(!paymentOptions.some(method=>method.id===paymentMethodId&&method.enabled)){setSubmitError(customerErrorMessage({code:'PAYMENT_METHOD_REQUIRED'}));return;}
      if(!Number.isFinite(Date.parse(quote.expiresAt))||Date.parse(quote.expiresAt)<=Date.now()){setQuote(null);setSubmitError('اعتبار استعلام پایان یافته است؛ به مرحله اطلاعات ارسال برگردید و دوباره استعلام بگیرید');return;}
      operationLock.current=true;
      setIsProcessing(true);setSubmitError('');let posting=false;
      try{
        const payload={checkoutId:checkout.checkoutId,quoteId:quote.quoteId,paymentMethod:paymentMethodId};
        const fingerprint=JSON.stringify(payload);
        const purchaseScope=purchaseStorageScope(window.location.hostname,tenantId,isDemoRuntime());
        const intentKey=`shop-order-intent:${purchaseScope}`;
        let saved=null;try{saved=JSON.parse(sessionStorage.getItem(intentKey)||'null')}catch{}
        if(saved?.fingerprint!==fingerprint)saved={fingerprint,key:crypto.randomUUID(),orderId:null};
        idempotencyRef.current=saved;
        sessionStorage.setItem(intentKey,JSON.stringify(saved));
        posting=true;
        const response=await placeOrder(payload,idempotencyRef.current.key);
        const order=response?.order||response;
        const id=order?.orderId;
        if(!id)throw new Error('شناسه سفارش از سرور دریافت نشد');
        idempotencyRef.current.orderId=id;
        sessionStorage.setItem(intentKey,JSON.stringify(idempotencyRef.current));
        if(!mounted.current)return;
        setOrderId(id);dispatch({type:'CLEAR_CART'});setOrderComplete(true);
        sessionStorage.removeItem(`shop-checkout:${purchaseScope}`);
        if(order.paymentUrl&&(!order.paymentExpiresAt||Date.parse(order.paymentExpiresAt)>Date.now())){
          const link=new URL(order.paymentUrl);
          if(link.protocol==='https:')window.location.assign(link.href);
        }
      }catch(e){if(posting&&(!e.status||e.status>=500))setUncertain(true);if(e.status===401)access.redirectToLogin();else setSubmitError(customerErrorMessage(e,'order'));}
      finally{setIsProcessing(false);operationLock.current=false}
    };

    if (orderComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle size={48} />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">سفارش شما ثبت شد؛ وضعیت پرداخت را از پیگیری سفارش بررسی کنید</h1>
                <p className="text-gray-600 mb-8">شماره سفارش: {toPersianDigits(orderId)}</p>
                <div className="flex gap-4">
                    <Link
                        href={`/orders/${encodeURIComponent(orderId)}`}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                    >
                        پیگیری سفارش
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
                    >
                        بازگشت به خانه
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">

            {submitError && <div role="alert" className="col-span-12 text-red-600 p-3 bg-red-50 rounded-xl">{submitError}{uncertain && <p>پاسخ سرور نامشخص است؛ تا بررسی سفارش‌ها یا تماس با فروشگاه، ثبت مجدد غیرفعال است.</p>}</div>}
            {methodsError && <div role="alert" className="col-span-12 text-rose-700 bg-rose-50 p-4 rounded-xl"><p>{methodsError}</p><button type="button" onClick={retryMethods} className="underline mt-3">دریافت دوباره روش‌های خرید</button></div>}
            {methodsLoading&&<p role="status" className="col-span-12 text-gray-500">در حال دریافت روش‌های ارسال و نشانی‌ها...</p>}
            {/* Steps Progress (Mobile & Desktop) */}
            <div className="col-span-12 mb-4">
                <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />
                    <div
                        className="absolute top-1/2 right-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step) => {
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div
                                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isActive ? "bg-primary border-primary text-white" : "bg-white border-gray-300 text-gray-400"}
                        ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}
                      `}
                                >
                                    <step.icon size={18} />
                                </div>
                                <span className={`text-xs md:text-sm font-medium ${isActive ? "text-gray-800" : "text-gray-400"}`}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Main Form Content */}
            <div className="col-span-12 lg:col-span-8">
                <fieldset disabled={isProcessing || methodsLoading} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-6"
                            >
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <MapPin className="text-primary" />
                                    اطلاعات گیرنده و آدرس
                                </h2>
                                {!methodsLoading && <CheckoutMethodChoices title="روش ارسال" name="shipping-method" selectedId={shippingMethodId}
                                  options={shippingMethods.map(method=>({...method,enabled:true,detail:method.amount==null?'هزینه ارسال هنگام بررسی سبد مشخص می‌شود.':formatMoney(method.amount,method.currency)}))}
                                  onChange={id=>{setShippingMethodId(id);setAddressId('');setQuote(null);setSubmitError('');}}
                                  emptyMessage="روش ارسالی برای این فروشگاه در دسترس نیست. برای ادامه خرید با پشتیبانی فروشگاه تماس بگیرید."/>}
                                {!methodsLoading&&<button type="button" onClick={retryMethods} className="text-primary text-sm underline self-start">به‌روزرسانی روش‌های خرید</button>}
                                {selectedShipping?.requiresAddress===false&&<p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">برای این روش ارسال، وارد کردن نشانی لازم نیست.</p>}
                                {!!savedAddresses.length&&selectedShipping?.requiresAddress!==false&&<label className="block text-sm">نشانی ذخیره‌شده
                                  <select className="block w-full border rounded-xl p-3 mt-2" value={addressId} onChange={e=>setAddressId(e.target.value)}>
                                    <option value="">نشانی جدید از فرم پایین</option>
                                    {savedAddresses.map(a=><option value={a.addressId||a.id} key={a.addressId||a.id}>{a.title||a.fullAddress}</option>)}
                                  </select>
                                </label>}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700">نام حساب کاربری</label>
                                        <input
                                            name="name"
                                            readOnly
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                            placeholder="نام در حساب کاربری ثبت نشده است"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700">شماره موبایل حساب</label>
                                        <input
                                            name="phone"
                                            readOnly
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left dir-ltr"
                                            placeholder="0912..."
                                        />
                                    </div>
                                    <div className={`flex flex-col gap-2 ${selectedShipping?.requiresAddress===false?'hidden':''}`}>
                                        <label className="text-sm font-medium text-gray-700">استان</label>
                                        <input
                                            name="province"
                                            value={formData.province}
                                            onChange={handleInputChange}
                                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className={`flex flex-col gap-2 ${selectedShipping?.requiresAddress===false?'hidden':''}`}>
                                        <label className="text-sm font-medium text-gray-700">شهر</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className={`col-span-1 md:col-span-2 flex flex-col gap-2 ${selectedShipping?.requiresAddress===false?'hidden':''}`}>
                                        <label className="text-sm font-medium text-gray-700">آدرس پستی دقیق <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[100px]"
                                            placeholder="خیابان، کوچه، پلاک، واحد..."
                                        />
                                    </div>
                                    <div className={`flex flex-col gap-2 ${selectedShipping?.requiresAddress===false?'hidden':''}`}>
                                        <label className="text-sm font-medium text-gray-700">کد پستی</label>
                                        <input
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left dir-ltr"
                                        />
                                    </div>
                                </div>
                                <Link href="/profile" className="text-primary text-sm underline">ویرایش اطلاعات حساب و نشانی‌ها</Link>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-6"
                            >
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <CreditCard className="text-primary" />
                                    انتخاب روش پرداخت
                                </h2>

                                <CheckoutMethodChoices title="روش‌های پرداخت فروشگاه" name="payment-method" options={paymentOptions} selectedId={paymentMethodId}
                                  onChange={id=>{setPaymentMethodId(id);setQuote(null);setSubmitError('');}}
                                  emptyMessage="روش پرداختی برای این فروشگاه در دسترس نیست. لطفاً با پشتیبانی فروشگاه تماس بگیرید."/>
                                <button type="button" onClick={retryMethods} className="text-primary text-sm underline self-start">به‌روزرسانی روش‌های خرید</button>
                                <p className="bg-gray-50 text-gray-600 p-4 rounded-xl text-sm leading-relaxed">روش پرداخت و مبلغ سفارش پیش از ثبت نهایی دوباره بررسی می‌شوند.</p>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-6"
                            >
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <CheckCircle className="text-primary" />
                                    بازبینی و ثبت نهایی
                                </h2>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-700 text-sm">اطلاعات ارسال</h3>
                                        <button onClick={() => setCurrentStep(1)} className="text-xs text-blue-500 hover:underline">ویرایش</button>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>{formData.name} - {toPersianDigits(formData.phone)}</p>
                                        <p>روش ارسال: {selectedShipping?.name}</p>
                                        <p>{selectedShipping?.requiresAddress===false?'دریافت سفارش طبق روش ارسال انتخاب‌شده':addressId?(savedAddresses.find(address=>String(address.addressId||address.id)===String(addressId))?.fullAddress||'نشانی انتخاب‌شده'): [formData.province,formData.city,formData.address,formData.postalCode].filter(Boolean).join('، ')}</p>
                                        <p>روش پرداخت: {paymentOptions.find(method=>method.id===paymentMethodId)?.name}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {cart.map(item => (
                                        <div key={item.cartItemId} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-lg">
                                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                                <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">{toPersianDigits(item.quantity)} عدد</p>
                                                {!!Object.keys(item.selectedFeatures||{}).length&&<p className="text-xs text-gray-500">{Object.entries(item.selectedFeatures).map(([name,value])=>`${name}: ${value}`).join('، ')}</p>}
                                            </div>
                                            <div className="text-sm font-bold">
                                                {item.price == null ? "—" : formatMoney(item.price * item.quantity, config?.currency)} (تقریبی)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1 || isProcessing}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition font-medium ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <ChevronRight size={18} /> مرحله قبل
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                disabled={isProcessing || methodsLoading || !!methodsError || shippingMethods.length===0}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/30 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'در حال بررسی سبد...' : 'مرحله بعد'} <ChevronLeft size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || uncertain || !!orderId || !quote || !paymentOptions.some(method=>method.id===paymentMethodId&&method.enabled)}
                                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/30 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? "در حال پردازش..." : "پرداخت و ثبت نهایی"}
                            </button>
                        )}
                    </div>
                </fieldset>
            </div>

            {/* Sticky Summary */}
            <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3">فاکتور نهایی</h3>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>قیمت کالاها ({toPersianDigits(cart.length)})</span>
                        <span>{quote ? formatMoney(quote.subtotal, quote.currency) : "در انتظار استعلام"}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>هزینه ارسال</span>
                        <span>{quote ? formatMoney(quote.shipping, quote.currency) : "در انتظار استعلام"}</span>
                    </div>
                    {quote && <>
                        <div className="flex justify-between text-sm text-gray-600"><span>تخفیف</span><span>{formatMoney(quote.discount, quote.currency)}</span></div>
                        <div className="flex justify-between text-sm text-gray-600"><span>مالیات</span><span>{formatMoney(quote.tax, quote.currency)}</span></div>
                    </>}
                    <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
                        <span>مبلغ قابل پرداخت</span>
                        <span>{quote ? formatMoney(quote.total, quote.currency) : "در انتظار استعلام"}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
