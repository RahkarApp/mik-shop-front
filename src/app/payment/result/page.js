'use client';
import Link from '@/components/PreviewLink';
import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import {useOrders} from '@/hooks/useOrders';
import {paymentHref} from '@/utils/orderPayment';

function PaymentResultBody() {
  const search=useSearchParams();
  const orderId=search.get('orderId');
  const {data,loading,error,retry}=useOrders(orderId||undefined,Boolean(orderId));
  const gatewayHref=paymentHref(data);
  const confirmed=data?.processingStatus==='CONFIRMED';
  const paymentReceived=data?.paymentState==='PAID';

  return <main className="max-w-xl mx-auto text-center p-8 bg-white rounded-xl">
    <h1 className="font-bold text-xl">بازگشت از درگاه پرداخت</h1>
    <p className="py-4">نتیجه فقط از فروشگاه استعلام می‌شود؛ بازگشت از درگاه به‌تنهایی به معنی پرداخت موفق نیست.</p>
    {!orderId&&<p role="alert">شناسه سفارش در لینک بازگشت موجود نیست.</p>}
    {orderId&&loading&&<p role="status">در حال استعلام نتیجه از فروشگاه...</p>}
    {orderId&&error&&!data&&<div role="alert"><p>{error} اگر نشست پایان یافته، دوباره وارد شوید و همین سفارش را بررسی کنید.</p><button type="button" onClick={retry} className="underline mt-3">استعلام دوباره</button></div>}
    {data&&<div className="space-y-3">
      {confirmed&&<p role="status" className="text-green-700 font-bold">پرداخت و ثبت سفارش توسط فروشگاه تأیید شد.</p>}
      {paymentReceived&&!confirmed&&<p role="status" className="text-amber-700">وجه دریافت شده و ثبت نهایی در حال انجام است؛ دوباره پرداخت نکنید.</p>}
      {!confirmed&&!paymentReceived&&data.processingStatus==='AWAITING_PAYMENT'&&<p role="status" className="text-amber-700">پرداخت هنوز تأیید نشده و سفارش در انتظار پرداخت است.</p>}
      {data.processingStatus==='PROCESSING'&&<p role="status">وضعیت سفارش هنوز در حال پردازش است.</p>}
      {(data.processingStatus==='ACTION_REQUIRED'||data.paymentState==='UNKNOWN')&&<p role="alert" className="text-amber-700">این سفارش نیازمند پیگیری فروشگاه است؛ سفارش یا پرداخت دیگری ایجاد نکنید.</p>}
      {error&&<div role="alert" className="text-red-700"><p>{error} آخرین وضعیت دریافت‌شده در بالا حفظ شده است.</p><button type="button" onClick={retry} className="underline mt-2">استعلام دوباره</button></div>}
      {gatewayHref&&<a href={gatewayHref} className="inline-block px-5 py-3 bg-green-600 text-white rounded-xl">تلاش دوباره برای پرداخت همین سفارش</a>}
    </div>}
    {orderId&&<Link className="underline text-primary block mt-4" href={`/orders/${encodeURIComponent(orderId)}`}>پیگیری همین سفارش</Link>}
    <Link className="underline block mt-4" href="/orders">سفارش‌های من</Link>
  </main>;
}

export default function PaymentResult() {
  return <Suspense fallback={<p>در حال دریافت سفارش...</p>}><PaymentResultBody/></Suspense>;
}
