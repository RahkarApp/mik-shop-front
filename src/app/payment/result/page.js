'use client';
import Link from 'next/link';
import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import {useOrders} from '@/hooks/useOrders';
function PaymentResultBody(){
 const search=useSearchParams(),orderId=search.get('orderId');
 const {data,loading,error}=useOrders(orderId||undefined);
 return <main className="max-w-xl mx-auto text-center p-8 bg-white rounded-xl">
  <h1 className="font-bold text-xl">بازگشت از درگاه پرداخت</h1>
  <p className="py-4">پارامتر success یا paid مرورگر قابل اعتماد نیست؛ وضعیت فقط از API خود سفارش خوانده می‌شود.</p>
  {!orderId?<p>شناسه سفارش در لینک بازگشت موجود نیست.</p>:loading?<p>در حال استعلام از فروشگاه...</p>:error?<p role="alert">{error}؛ اگر نشست پایان یافته، دوباره وارد شوید و همین سفارش را بررسی کنید.</p>:<p>سفارش {orderId} — پردازش: {data?.processingStatus||'نامشخص'}، پرداخت: {data?.paymentStatus||'نامشخص'}، ارسال: {data?.deliveryStatus||'نامشخص'}</p>}
  {orderId&&<Link className="underline text-primary block mt-4" href={`/orders/${encodeURIComponent(orderId)}`}>پیگیری همین سفارش</Link>}
  <Link className="underline block mt-4" href="/orders">سفارش‌های من</Link>
 </main>;
}
export default function PaymentResult(){return <Suspense fallback={<p>در حال دریافت سفارش...</p>}><PaymentResultBody/></Suspense>}
