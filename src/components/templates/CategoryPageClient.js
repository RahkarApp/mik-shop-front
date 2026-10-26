'use client';

/**
 * CategoryPageClient — صفحه دسته‌بندی Config-Driven
 * محصولات از Service، کارت از ProductCardRenderer
 */

import ProductCardRenderer from '@/components/ui/product-cards/ProductCardRenderer';
import FilterSortBar from '@/components/shared/FilterSortBar';
import FilterSidebar from '@/components/shared/FilterSidebar';
import { useProducts } from '@/hooks/useProducts';
import {useCategories} from '@/hooks/useCategories';
import {findCategoryPath} from '@/utils/categories';
import {useSearchParams} from 'next/navigation';
import Link from '@/components/PreviewLink';
import { useComponentVariant } from '@/hooks/useComponentVariant';
import { PRODUCT_CARD_C } from '@/constants/config';

export default function CategoryPageClient({ categoryId, categoryName }) {
  const params=useSearchParams();
  const {categories} = useCategories();
  const categoryPath = findCategoryPath(categories,categoryId);
  const displayName = categoryPath.at(-1)?.name || (categoryName !== categoryId ? categoryName : 'دسته‌بندی');
  const page=Math.max(1,Number(params.get('page'))||1);
  const { products, loading, error, hasNextPage, retry } = useProducts({ category: categoryId, page, limit: 50,sort:params.get('sort')||'newest',minPrice:params.get('minPrice')||'',maxPrice:params.get('maxPrice')||'',availableOnly:params.get('availableOnly')||'' });
  const pageHref=number=>{const next=new URLSearchParams(params.toString());next.set('page',String(number));return `/category/${encodeURIComponent(categoryId)}?${next}`;};
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
            محصولات دسته‌بندی: {displayName}
          </h1>
          {categoryPath.length > 0 && <nav aria-label="مسیر دسته‌بندی" className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4"><Link href="/">فروشگاه</Link>{categoryPath.map((category,index) => <span key={category.id} className="flex gap-2"><span aria-hidden="true">/</span>{index === categoryPath.length-1 ? <span aria-current="page">{category.name}</span> : <Link className="text-primary" href={`/category/${encodeURIComponent(category.id)}`}>{category.name}</Link>}</span>)}</nav>}
          <FilterSortBar />

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <div role="alert" className="p-4 m-4 text-red-600 bg-red-50 rounded-lg text-sm"><p>{error}</p><button type="button" onClick={retry} className="underline mt-3">تلاش دوباره</button></div>
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
          {!loading&&!error&&<nav aria-label="صفحه‌های محصولات" className="flex gap-3 mx-4 my-3">
            {page>1&&<Link href={pageHref(page-1)} className="px-4 py-2 border rounded-lg">صفحه قبل</Link>}
            {hasNextPage&&<Link href={pageHref(page+1)} className="px-4 py-2 border rounded-lg">صفحه بعد</Link>}
          </nav>}
        </div>
      </div>
    </main>
  );
}
