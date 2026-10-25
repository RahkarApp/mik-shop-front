'use client';
import {demoHref} from '@/utils/demoRoute';

/**
 * SearchResultClient — نتایج جستجو Config-Driven
 */

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCardRenderer from '@/components/ui/product-cards/ProductCardRenderer';
import CategoryFilterModal from '@/components/shared/CategoryFilterModal';
import FilterSortBar from '@/components/shared/FilterSortBar';
import FilterSidebar from '@/components/shared/FilterSidebar';
import { useProducts } from '@/hooks/useProducts';
import { useComponentVariant } from '@/hooks/useComponentVariant';
import { PRODUCT_CARD_C } from '@/constants/config';

export default function SearchResultClient() {
  const searchParams = useSearchParams();
  const router=useRouter();
  const q = searchParams.get('q')?.trim() || '';
  const chosenCategory=searchParams.get('category')||'';
  const setCategory=(value)=>{const p=new URLSearchParams(searchParams.toString());if(value)p.set('category',value);else p.delete('category');p.delete('page');router.push(demoHref(`/search-result?${p}`))};

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);


  const { products, loading, error } = useProducts({
    query: q,
    category: chosenCategory,
    sort:searchParams.get('sort')||'newest',
    minPrice:searchParams.get('minPrice')||'',
    maxPrice:searchParams.get('maxPrice')||'',
    availableOnly:searchParams.get('availableOnly')||'',
    page:Number(searchParams.get('page')||1),
    limit: 50,
  });

  const cardVariant = useComponentVariant('productCard');
  const gridClass =
    cardVariant === PRODUCT_CARD_C
      ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';

  return (
    <main className="flex flex-col w-full min-h-screen">
      <CategoryFilterModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        selectedCategory={chosenCategory}
        onSelect={(catId) => {
          setCategory(catId);
          setCategoryModalOpen(false);
        }}
      />

      <div className="flex w-full">
        <div className="hidden md:block w-[30%] sticky top-16 h-fit">
          <FilterSidebar />
        </div>
        <div className="w-full md:w-[70%] md:px-2">
          <h1 className="w-full text-right my-6 font-bold text-gray-800">
            نتایج جستجو: {q || '...'}
            {chosenCategory && <span className="text-sm font-normal text-gray-500 mr-2">(فیلتر دسته فعال)</span>}
          </h1>
          <FilterSortBar onOpenCategoryModal={() => setCategoryModalOpen(true)} />

          {loading && <p className="text-center text-gray-500 py-12">در حال جستجو...</p>}
          {error && <div className="p-4 m-4 text-red-600 bg-red-50 rounded-lg text-sm">{error}</div>}

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
          {!loading&&!error&&products.length>=50&&<button className="mx-4 my-3 px-4 py-2 border rounded-lg" onClick={()=>{const params=new URLSearchParams(searchParams.toString());params.set('page',String(Number(params.get('page')||1)+1));router.push(demoHref(`/search-result?${params}`))}}>صفحه بعد</button>}
        </div>
      </div>
    </main>
  );
}
