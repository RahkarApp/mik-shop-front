'use client';

/**
 * ReturnPolicyPageClient — صفحه سیاست بازگشت کالا
 */

import PageGuard from '@/components/shared/PageGuard';
import { useSiteConfig } from '@/hooks/useSiteConfig';

function PolicyContent() {
  const { config } = useSiteConfig();
  const siteName = config?.branding?.siteName || 'فروشگاه';

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">سیاست بازگشت کالا — {siteName}</h1>

      <div className="prose prose-sm text-gray-700 space-y-4 leading-8">
        <p>{config?.policies?.returns || 'شرایط مرجوعی هنوز توسط فروشگاه ثبت نشده است.'}</p>
        {config?.branding?.phone&&<p>پشتیبانی: <span dir="ltr">{config.branding.phone}</span></p>}
      </div>
    </main>
  );
}

export default function ReturnPolicyPageClient() {
  return (
    <PageGuard pageKey="returnPolicy">
      <PolicyContent />
    </PageGuard>
  );
}
