'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams, usePathname, useParams} from 'next/navigation';
import {useCategories} from '@/hooks/useCategories';
import {demoHref, isDemoPath} from '@/utils/demoRoute';
import {formatPrice} from '@/utils/format';
import CategoryTree from './CategoryTree';

export default function FilterSidebar() {
  const categories = useCategories();
  const searchParams = useSearchParams(), pathname = usePathname(), routeParams = useParams(), router = useRouter();
  const supportsFilters = process.env.NEXT_PUBLIC_DATA_MODE === 'demo' || isDemoPath(pathname);
  const [maxPrice, setMaxPrice] = useState(10000000);
  useEffect(() => {setMaxPrice(Number(searchParams.get('maxPrice') ?? 10000000));}, [searchParams]);
  function apply(name, value, destination=pathname) {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== '' && value !== null) params.set(name,String(value));else params.delete(name);
    params.delete('page');router.push(demoHref(`${destination}?${params}`));
  }
  return <aside className="hidden md:block w-full bg-white p-5 border-l border-gray-100 sticky top-1 space-y-6">
    <h2 className="text-xl font-bold text-gray-800">فیلترها</h2>
    <section><h3 className="font-semibold mb-3">دسته‌بندی‌ها</h3>
      <CategoryTree {...categories} onRetry={categories.retry} selectedId={searchParams.get('category') || routeParams.category} onSelect={id => apply('category',id,'/search-result')} showAll/>
    </section>
    {supportsFilters && <>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={searchParams.get('availableOnly') === 'true'} onChange={event => apply('availableOnly',event.target.checked ? 'true' : '')} className="h-4 w-4 accent-primary"/>فقط کالاهای موجود</label>
      <div><label className="block text-sm font-semibold mb-3">حداکثر قیمت<input type="range" aria-label="حداکثر قیمت" min="0" max="10000000" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} className="block w-full mt-4 accent-primary"/></label>
        <p className="text-sm text-gray-600">{formatPrice(maxPrice)} تومان</p><button type="button" onClick={() => apply('maxPrice',maxPrice < 10000000 ? maxPrice : '')} className="mt-3 px-4 py-2 border rounded-lg text-sm">اعمال قیمت</button>
      </div>
    </>}
  </aside>;
}
