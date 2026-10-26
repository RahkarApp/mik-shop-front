'use client';

import {useEffect, useRef} from 'react';
import {useRouter, useParams, useSearchParams} from 'next/navigation';
import {X} from 'lucide-react';
import {useCategories} from '@/hooks/useCategories';
import {demoHref} from '@/utils/demoRoute';
import CategoryTree from './CategoryTree';

export default function CategoryModal({isOpen, onClose, selectedCategory, onSelect}) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const categories = useCategories({enabled:isOpen});
  const panel = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('input')?.focus();
    return () => {document.body.style.overflow = overflow;previous?.focus?.();};
  }, [isOpen]);
  if (!isOpen) return null;

  function select(id) {
    if (onSelect) onSelect(id);
    else router.push(demoHref(id ? `/category/${encodeURIComponent(id)}` : '/search-result'));
    onClose();
  }
  function handleKey(event) {
    if (event.key === 'Escape') {event.preventDefault();onClose();}
    if (event.key !== 'Tab') return;
    const elements = [...panel.current.querySelectorAll('button:not(:disabled),input,a[href]')];
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
  }
  return <div className="fixed inset-0 bottom-[60px] md:bottom-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="انتخاب دسته‌بندی" onKeyDown={handleKey}>
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true"/>
    <div ref={panel} className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-6 max-h-[85vh] overflow-y-auto shadow-xl">
      <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold">دسته‌بندی‌ها</h2><button type="button" onClick={onClose} aria-label="بستن دسته‌بندی‌ها" className="p-2 rounded-lg hover:bg-gray-100"><X size={22}/></button></div>
      <CategoryTree {...categories} onRetry={categories.retry} selectedId={selectedCategory ?? searchParams.get('category') ?? params.category} onSelect={select} showAll/>
    </div>
  </div>;
}
