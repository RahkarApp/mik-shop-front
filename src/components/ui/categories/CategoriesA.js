'use client';

/**
 * CategoriesA — دسته‌بندی دایره‌ای (استایل کلاسیک)
 */

import Link from '@/components/PreviewLink';
import Image from 'next/image';

export default function CategoriesA({ categories }) {
  if (!categories?.length) {
    return <p className="text-center text-gray-500 py-8">دسته‌بندی‌ای موجود نیست.</p>;
  }

  return (
    <div
      className="hover-scrollbar w-full overflow-x-auto overflow-y-hidden px-2 pb-2"
      aria-label="فهرست دسته‌بندی‌ها"
    >
      {/*
       * دسته‌بندی‌ها عمداً wrap نمی‌شوند تا تعداد زیاد آن‌ها ارتفاع صفحه را
       * افزایش ندهد. کاربر می‌تواند این ردیف را افقی اسکرول کند.
       */}
      <div className="flex min-w-max gap-4 px-1">
        {categories.map((category) => (
          <Link
            href={`/category/${category.id}`}
            key={category.id}
            className="group w-24 shrink-0 sm:w-28"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-md group-hover:shadow-xl border-2 border-white bg-gray-50 transition-all group-hover:-translate-y-1">
                {category.image ? (
                  <Image src={category.image} alt={category.name} width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center group-hover:text-primary">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
