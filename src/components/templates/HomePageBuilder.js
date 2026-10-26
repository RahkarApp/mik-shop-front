'use client';

/**
 * HomePageBuilder — صفحه اصلی Config-Driven با UI واقعی
 *
 * ترتیب بخش‌ها از layout.homeSections خوانده می‌شود.
 */

import { useSiteConfig } from '@/hooks/useSiteConfig';
import SectionRenderer from '@/components/sections/SectionRenderer';

export default function HomePageBuilder() {
  const { config, loading, error } = useSiteConfig();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  // ترتیب بخش‌ها متعلق به قالب ثابت نسخه ۱ است؛ فروشگاه فقط محتوا را تغییر می‌دهد.
  // اسلایدر خانه فعلاً به درخواست محصول نمایش داده نمی‌شود.
  const homeSections = ['categories', 'products', ...(config?.features?.blog === true ? ['blog'] : [])];

  return (
    <main className="flex flex-col w-full items-center justify-start gap-12 pb-12">
      <SectionRenderer sections={homeSections} />
    </main>
  );
}
