'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter, usePathname, useSearchParams, useParams} from 'next/navigation';
import {X} from 'lucide-react';
import {useCategories} from '@/hooks/useCategories';
import {demoHref, isDemoPath} from '@/utils/demoRoute';
import {formatPrice} from '@/utils/format';
import CategoryTree from './CategoryTree';

export default function FilterModal({isOpen, onClose}) {
  const router = useRouter(), pathname = usePathname(), params = useSearchParams(), routeParams = useParams();
  const categories = useCategories({enabled:isOpen});
  const supportsFilters = process.env.NEXT_PUBLIC_DATA_MODE === 'demo' || isDemoPath(pathname);
  const [availableOnly, setAvailableOnly] = useState(false), [maxPrice, setMaxPrice] = useState(10000000), [selected, setSelected] = useState(null);
  const panel = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';panel.current?.querySelector('input')?.focus();
    const resize = () => {if (window.innerWidth >= 768) onClose();};
    window.addEventListener('resize',resize);
    return () => {window.removeEventListener('resize',resize);document.body.style.overflow=overflow;previous?.focus?.();};
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    setSelected(params.get('category') || routeParams.category || null);
    setAvailableOnly(params.get('availableOnly') === 'true');setMaxPrice(Number(params.get('maxPrice') ?? 10000000));
  }, [isOpen, params, routeParams.category]);
  if (!isOpen) return null;
  function apply() {
    const query = new URLSearchParams(params.toString());
    if (selected) query.set('category',selected);else query.delete('category');
    if (supportsFilters) {
      if (availableOnly) query.set('availableOnly','true');else query.delete('availableOnly');
      if (maxPrice < 10000000) query.set('maxPrice',String(maxPrice));else query.delete('maxPrice');
    }
    query.delete('page');router.push(demoHref(`/search-result?${query}`));onClose();
  }
  function handleKey(event) {
    if(event.key==='Escape'){event.preventDefault();onClose();}
    if(event.key!=='Tab')return;
    const elements=[...panel.current.querySelectorAll('button:not(:disabled),input,a[href]')];
    const first=elements[0],last=elements.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
  return <div role="dialog" aria-modal="true" aria-label="فیلتر محصولات" className="fixed inset-0 bottom-[60px] z-50 flex justify-center items-end md:hidden" onKeyDown={handleKey}>
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true"/>
    <div ref={panel} className="relative w-full max-h-[85vh] bg-white rounded-t-3xl p-5 overflow-y-auto shadow-xl">
      <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">فیلتر محصولات</h2><button type="button" onClick={onClose} aria-label="بستن فیلترها" className="p-2 rounded-lg hover:bg-gray-100"><X size={22}/></button></div>
      <CategoryTree {...categories} onRetry={categories.retry} selectedId={selected} onSelect={setSelected} autoFocus showAll/>
      {supportsFilters && <div className="mt-6 space-y-5">
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={availableOnly} onChange={event => setAvailableOnly(event.target.checked)} className="h-4 w-4 accent-primary"/>فقط کالاهای موجود</label>
        <label className="block text-sm">حداکثر قیمت: {formatPrice(maxPrice)} تومان<input type="range" aria-label="حداکثر قیمت" min="0" max="10000000" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} className="block w-full mt-3 accent-primary"/></label>
      </div>}
      <button type="button" onClick={apply} className="bg-primary text-white rounded-xl p-3 w-full mt-5">اعمال فیلتر</button>
    </div>
  </div>;
}
