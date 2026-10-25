'use client';

/**
 * CategoryPageClient — صفحه دسته‌بندی Config-Driven
 * محصولات از Service، کارت از ProductCardRenderer
 */

import ProductCardRenderer from '@/components/ui/product-cards/ProductCardRenderer';
import FilterSortBar from '@/components/shared/FilterSortBar';
import FilterSidebar from '@/components/shared/FilterSidebar';
import { useProducts } from '@/hooks/useProducts';
import {useSearchParams} from 'next/navigation';
import { useComponentVariant } from '@/hooks/useComponentVariant';
import { PRODUCT_CARD_C } from '@/constants/config';

export default function CategoryPageClient({ categoryId, categoryName }) {
  const params=useSearchParams();
  const { products, loading, error } = useProducts({ category: categoryId, limit: 50,sort:params.get('sort')||'newest',maxPrice:params.get('maxPrice')||'',availableOnly:params.get('availableOnly')||'' });
  const cardVariant = useComponentVariant('productCard');

  const gridClass =
    cardVariant === PRODUCT_CARD_C
      ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';

  return (
    <main className="flex flex-col w-full min-h-screen">
      <div className="flex w-full">
        <div className="hidden md:block w-[30%] sticky top-16 h-fit">
          <FilterSidebar />
        </div>
        <div className="w-full md:w-[70%] md:px-2">
          <h1 className="w-full text-right my-6 font-bold text-gray-800">
            محصولات دسته‌بندی: {categoryName}
          </h1>
          <FilterSortBar />

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 m-4 text-red-600 bg-red-50 rounded-lg text-sm">{error}</div>
          )}

          {!loading && !error && (
            <div className={`w-full ${gridClass} p-4`}>
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCardRenderer key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12">محصولی یافت نشد.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
