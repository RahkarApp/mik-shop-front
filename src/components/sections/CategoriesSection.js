'use client';

/**
 * CategoriesSection — دسته‌بندی‌ها (variant از Config)
 */

import CategoriesRenderer from '@/components/ui/categories/CategoriesRenderer';
import { useCategories } from '@/hooks/useCategories';

export default function CategoriesSection() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="w-full grid grid-cols-3 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <section className="w-full flex flex-col items-center gap-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">دسته‌بندی‌های محبوب</h2>
      <CategoriesRenderer categories={categories} />
    </section>
  );
}
