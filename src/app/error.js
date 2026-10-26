'use client';

import Link from '@/components/PreviewLink';

export default function ErrorPage({reset}) {
  return <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-xl font-bold">دریافت اطلاعات صفحه انجام نشد</h1>
    <p role="alert" className="text-gray-600">اتصال به فروشگاه را بررسی کنید و دوباره تلاش کنید.</p>
    <button type="button" onClick={reset} className="bg-primary text-white rounded-xl px-5 py-3">تلاش دوباره</button>
    <Link href="/" className="text-primary underline">بازگشت به فروشگاه</Link>
  </main>;
}
