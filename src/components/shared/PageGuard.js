'use client';

/**
 * PageGuard — محافظ صفحات Config-Driven
 * اگر page در Config غیرفعال باشد، پیام مناسب نشان می‌دهد
 */

import Link from 'next/link';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function PageGuard({ pageKey, children }) {
  const { loading, isPageEnabled, config } = useSiteConfig();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!isPageEnabled(pageKey)) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">صفحه در دسترس نیست</h1>
        <p className="text-gray-500 text-sm mb-6">
          این صفحه در فروشگاه «{config?.branding?.siteName}» فعال نشده است.
        </p>
        <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium">
          بازگشت به صفحه اصلی
        </Link>
      </main>
    );
  }

  return children;
}
