'use client';
import {useParams} from 'next/navigation';
import {useOrders} from '@/hooks/useOrders';
import PrintButton from '@/components/shared/PrintButton';
import {useShopActions} from '@/hooks/useShopActions';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {useState} from 'react';
import {formatMoney} from '@/utils/format';
import {paymentHref} from '@/utils/orderPayment';

export default function OrderDetails() {
  const {id}=useParams();
  const {config,isFeatureEnabled}=useSiteConfig();
  const {requestReturn,cancelOrder}=useShopActions();
  const [message,setMessage]=useState('');
  const [reason,setReason]=useState('');
  const {data:o,loading,error,retry}=useOrders(id);
  const gatewayHref=paymentHref(o);

  if(loading)return <p className="p-8">در حال دریافت سفارش...</p>;
  if(error&&!o)return <div className="p-8 text-center"><p role="alert" className="text-red-600">{error}</p><button type="button" onClick={retry} className="underline mt-3">تلاش دوباره</button></div>;
  if(!o)return <p className="p-8">سفارش یافت نشد</p>;

  return <main className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border" dir="rtl">
    <div className="flex justify-between"><h1 className="text-2xl font-bold">سفارش #{o.id}</h1><PrintButton/></div>
    <p className="my-3">وضعیت: {o.status}</p><p>تاریخ: {o.date||o.createdAt||'—'}</p>
    <p>وضعیت پردازش: {o.processingStatus||'نامشخص'}</p>
    <p>وضعیت پرداخت: {o.paymentStatus||o.paymentState||'نامشخص'}</p>
    <p>وضعیت ارسال: {o.deliveryStatus||'نامشخص'}</p>
    {error&&<div role="alert" className="text-red-700 mt-4"><p>{error} اطلاعات ثبت‌شده سفارش حفظ شده است.</p><button type="button" onClick={retry} className="underline mt-2">استعلام دوباره</button></div>}
    {(o.processingStatus==='PROCESSING'||(o.processingStatus==='AWAITING_PAYMENT'&&!o.paymentUrl))&&!error&&<p role="status" className="text-gray-600 mt-4">سفارش ثبت شده و لینک پرداخت در حال آماده‌سازی است.</p>}
    {o.paymentState==='PAID'&&o.processingStatus!=='CONFIRMED'&&<p className="text-amber-700 mt-4">وجه دریافت شده و ثبت نهایی در حال انجام است؛ دوباره پرداخت نکنید.</p>}
    {(o.processingStatus==='ACTION_REQUIRED'||o.paymentState==='UNKNOWN')&&<p className="text-amber-700 mt-4">نیازمند پیگیری؛ سفارش یا پرداخت جدید ایجاد نکنید.</p>}
    {o.paymentUrl&&!gatewayHref&&o.paymentState!=='PAID'&&<div role="alert" className="text-red-700 mt-4"><p>لینک پرداخت منقضی یا نامعتبر است؛ سفارش شما همچنان ثبت شده است.</p><button type="button" onClick={retry} className="underline mt-2">دریافت دوباره وضعیت پرداخت</button></div>}
    {gatewayHref&&<a href={gatewayHref} className="inline-block mt-4 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">پرداخت سفارش</a>}
    <div className="divide-y my-5">{(o.products||o.items||[]).map((item,i)=><div key={i} className="py-3 flex justify-between"><span>{item.name||item.productName||item.productId}</span><span>{item.quantity||1} × {formatMoney(item.price ?? item.unitPrice, o.currency || config?.currency)}</span></div>)}</div>
    <p className="font-bold">جمع نهایی: {formatMoney(o.summary?.total ?? o.total, o.currency || config?.currency)}</p>
    {o.trackingCode&&<p className="mt-3">کد رهگیری: {o.trackingCode}</p>}
    {(isFeatureEnabled('returns') || isFeatureEnabled('orderCancellation')) && <div className="mt-6 border-t pt-5 space-y-3"><h2 className="font-bold">خدمات پس از خرید</h2><textarea className="border rounded-lg p-2 w-full" placeholder="دلیل درخواست مرجوعی" value={reason} onChange={e=>setReason(e.target.value)}/><div className="flex gap-4">{isFeatureEnabled('returns') && <button disabled={!reason.trim()} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50" onClick={async()=>{try{await requestReturn(id,reason);setMessage('درخواست مرجوعی ثبت شد')}catch(e){setMessage(e.message)}}}>درخواست مرجوعی</button>}
      {isFeatureEnabled('orderCancellation') && <button className="border rounded-lg px-4 py-2" onClick={async()=>{try{await cancelOrder(id);setMessage('درخواست لغو به سرور ارسال شد')}catch(e){setMessage(e.message)}}}>لغو سفارش</button>}</div>{message&&<p role="status">{message}</p>}</div>}
  </main>;
}
