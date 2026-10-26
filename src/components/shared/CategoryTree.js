'use client';

import {useEffect, useId, useState} from 'react';
import {Search, X, ChevronDown, Check} from 'lucide-react';
import {findCategoryPath, searchCategoryTree} from '@/utils/categories';

export default function CategoryTree({categories=[], selectedId, onSelect, loading, error, onRetry, autoFocus=false, showAll=false}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const searchId = useId();
  useEffect(() => {
    const path = findCategoryPath(categories, selectedId);
    if (!path.length) return;
    setExpanded(previous => path.every(item => previous[item.id]) ? previous : {...previous, ...Object.fromEntries(path.map(item => [item.id,true]))});
  }, [categories, selectedId]);
  const visible = searchCategoryTree(categories, query);

  function renderNodes(nodes) {
    return <ul className="space-y-1">
      {nodes.map(category => {
        const children = category.subcategories || [];
        const open = query.trim() ? true : expanded[category.id] === true;
        const selected = category.id === selectedId;
        return <li key={category.id}>
          <div className={`flex items-center gap-1 rounded-xl ${selected ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}>
            <button type="button" onClick={() => onSelect(category.id)} aria-pressed={selected} className="flex flex-1 min-w-0 items-center gap-2 text-right p-3 text-sm rounded-xl focus-visible:outline-primary">
              {selected && <Check size={16} className="shrink-0"/>}<span className="break-words">{category.name}</span>
            </button>
            {children.length > 0 && <button type="button" disabled={Boolean(query.trim())} aria-label={`${open ? 'بستن' : 'نمایش'} زیرمجموعه‌های ${category.name}`} aria-expanded={open}
              onClick={() => setExpanded(previous => ({...previous,[category.id]:!open}))} className="p-3 rounded-xl hover:bg-gray-100 focus-visible:outline-primary">
              <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
            </button>}
          </div>
          {children.length > 0 && open && <div className="mr-4 pr-2 border-r border-gray-200 mt-1">{renderNodes(children)}</div>}
        </li>;
      })}
    </ul>;
  }

  return <div className="w-full space-y-3">
    <label htmlFor={searchId} className="sr-only">جستجو در دسته‌بندی‌ها</label>
    <div className="relative">
      <Search size={18} aria-hidden="true" className="absolute right-3 top-3 text-gray-400"/>
      <input id={searchId} type="search" autoFocus={autoFocus} value={query} onChange={event => setQuery(event.target.value)}
        placeholder="جستجو در دسته‌بندی‌ها..." className="w-full rounded-xl border border-gray-200 py-2.5 pr-10 pl-10 text-sm outline-none focus:border-primary"/>
      {query && <button type="button" onClick={() => setQuery('')} aria-label="پاک کردن جستجوی دسته‌بندی" className="absolute left-2 top-2 p-1.5 text-gray-500"><X size={16}/></button>}
    </div>
    {loading ? <p role="status" className="py-6 text-sm text-gray-500">در حال دریافت دسته‌بندی‌ها...</p> : error ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 space-y-3">
      <p>{error}</p>{onRetry && <button type="button" onClick={onRetry} className="font-semibold underline">تلاش دوباره</button>}
    </div> : <>
      {showAll && <button type="button" onClick={() => onSelect(null)} aria-pressed={!selectedId} className="text-sm text-primary px-3 py-2 rounded-lg hover:bg-primary/5">همه دسته‌بندی‌ها</button>}
      {!categories.length ? <p className="py-6 text-sm text-gray-500">هنوز دسته‌بندی‌ای در فروشگاه ثبت نشده است.</p>
        : !visible.length ? <p role="status" className="py-6 text-sm text-gray-500">دسته‌بندی‌ای با این نام پیدا نشد. نام دیگری جستجو کنید.</p>
        : <div className="max-h-[55vh] overflow-y-auto hover-scrollbar" aria-label="دسته‌بندی‌ها و زیرمجموعه‌ها">{renderNodes(visible)}</div>}
    </>}
  </div>;
}
