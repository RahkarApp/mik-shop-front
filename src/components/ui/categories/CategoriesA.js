'use client';

/**
 * CategoriesA — دسته‌بندی دایره‌ای (استایل کلاسیک)
 */

import {useRouter} from 'next/navigation';
import {demoHref} from '@/utils/demoRoute';
import CategoryTree from '@/components/shared/CategoryTree';

export default function CategoriesA({ categories }) {
  const router = useRouter();
  if (!categories?.length) {
    return <p className="text-center text-gray-500 py-8">دسته‌بندی‌ای موجود نیست.</p>;
  }

  return <div className="w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-4 md:p-6">
    <CategoryTree categories={categories} onSelect={id => router.push(demoHref(`/category/${encodeURIComponent(id)}`))}/>
  </div>;
}
