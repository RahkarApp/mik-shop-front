'use client';
import {useParams} from 'next/navigation';
import {useOrders} from '@/hooks/useOrders';
import PrintButton from '@/components/shared/PrintButton';
import {useShopActions} from '@/hooks/useShopActions';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {useState} from 'react';
import {formatMoney} from '@/utils/format';
export default function OrderDetails(){const {id}=useParams();const {config,isFeatureEnabled}=useSiteConfig();const {requestReturn,cancelOrder}=useShopActions();const [message,setMessage]=useState('');const [reason,setReason]=useState('');const {data:o,loading,error}=useOrders(id);
if(loading)return <p className="p-8">در حال دریافت سفارش...</p>;
if(error)return <p role="alert" className="p-8 text-red-600">{error}</p>;
if(!o)return <p className="p-8">سفارش یافت نشد</p>;
return <main className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border" dir="rtl"><div className="flex justify-between"><h1 className="text-2xl font-bold">سفارش #{o.id}</h1><PrintButton/></div><p className="my-3">وضعیت: {o.status}</p><p>تاریخ: {o.date||o.createdAt||'—'}</p>
<p>وضعیت پردازش: {o.processingStatus||'نامشخص'}</p>
<p>وضعیت پرداخت: {o.paymentStatus||'نامشخص'}</p>
<p>وضعیت ارسال: {o.deliveryStatus||'نامشخص'}</p>
{(o.processingStatus==='ACTION_REQUIRED'||o.paymentState==='UNKNOWN')&&<p className="text-amber-700">نیازمند پیگیری؛ سفارش یا پرداخت جدید ایجاد نکنید.</p>}
{o.paymentUrl&&o.processingStatus==='AWAITING_PAYMENT'&&o.paymentRequired!==false&&o.paymentExpiresAt&&Date.parse(o.paymentExpiresAt)>Date.now()&&/^https:\/\//.test(o.paymentUrl)&&<a href={o.paymentUrl} className="underline block">پرداخت با لینک معتبر سرور</a>}<div className="divide-y my-5">{(o.products||o.items||[]).map((item,i)=><div key={i} className="py-3 flex justify-between"><span>{item.name||item.productName||item.productId}</span><span>{item.quantity||1} × {formatMoney(item.price ?? item.unitPrice, o.currency || config?.currency)}</span></div>)}</div><p className="font-bold">جمع نهایی: {formatMoney(o.summary?.total ?? o.total, o.currency || config?.currency)}</p>{o.trackingCode&&<p className="mt-3">کد رهگیری: {o.trackingCode}</p>}
{(isFeatureEnabled('returns') || isFeatureEnabled('orderCancellation')) && <div className="mt-6 border-t pt-5 space-y-3"><h2 className="font-bold">خدمات پس از خرید</h2><textarea className="border rounded-lg p-2 w-full" placeholder="دلیل درخواست مرجوعی" value={reason} onChange={e=>setReason(e.target.value)}/><div className="flex gap-4">{isFeatureEnabled('returns') && <button disabled={!reason.trim()} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50" onClick={async()=>{try{await requestReturn(id,reason);setMessage('درخواست مرجوعی ثبت شد')}catch(e){setMessage(e.message)}}}>درخواست مرجوعی</button>}
{isFeatureEnabled('orderCancellation') && <button className="border rounded-lg px-4 py-2" onClick={async()=>{try{await cancelOrder(id);setMessage('درخواست لغو به سرور ارسال شد')}catch(e){setMessage(e.message)}}}>لغو سفارش</button>}</div>{message&&<p role="status">{message}</p>}</div>}</main>}
