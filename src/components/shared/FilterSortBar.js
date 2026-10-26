'use client';
import {demoHref, isDemoPath} from '@/utils/demoRoute';
import { useState } from "react";
import {useRouter,usePathname,useSearchParams} from "next/navigation";
import { ArrowDownNarrowWide, Funnel } from "lucide-react";
import FilterModal from "./FilterModal";
import SortModal from "./SortModal";


// داده‌های تست برای گزینه‌های مرتب‌سازی
const SORT_OPTIONS = [
  { id: 1, name: "جدیدترین", value: "newest" },
  { id: 2, name: "ارزان‌ترین", value: "cheapest" },
  { id: 3, name: "گران‌ترین", value: "most_expensive" },
];


export default function FilterSortBar({onOpenCategoryModal}) {
  const router=useRouter(),pathname=usePathname(),searchParams=useSearchParams();
  const supportsFilters=process.env.NEXT_PUBLIC_DATA_MODE==='demo'||isDemoPath(pathname);
  const changeSort=(value)=>{const p=new URLSearchParams(searchParams.toString());p.set('sort',value);p.delete('page');router.push(demoHref(`${pathname}?${p}`))};


  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {/* دسته‌بندی، فیلتر و سورت */}
      <div className="w-full flex justify-start items-center p-1 gap-4">
        {onOpenCategoryModal && <button type="button" onClick={onOpenCategoryModal} className="md:hidden px-3 py-2 bg-white rounded-lg border text-sm">دسته‌بندی‌ها</button>}
        {/* دکمه فیلتر */}
        <button type="button"
          className="px-2 py-1 flex md:hidden bg-white rounded-lg border border-text-primary cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsFilterOpen(true)}
        >
          <Funnel className="w-5 h-5 text-text-primary" />
          <p className="text-sm px-1 text-text-primary">فیلتر</p>
        </button>
        {/*   دکمه مرتب‌سازی برای حالت موبایل  */}
        {supportsFilters&&<button type="button" className="px-2 py-1 flex md:hidden bg-white rounded-lg border border-text-primary cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsSortOpen(true)}
        >
          <ArrowDownNarrowWide className="w-5 h-5 text-text-primary" />
          <p className="text-sm px-1 text-text-primary">مرتب‌سازی</p>
        </button>}

        {/* مرتب سازی در دسکتاپ */}
        {supportsFilters&&<div className="hidden md:flex gap-2">
          {SORT_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => changeSort(option.value)}
              className={`px-3 py-1 rounded-lg  text-text-primary text-sm hover:bg-gray-100 transition-colors ${
                (searchParams.get('sort')||'newest') === option.value
                  ? "border-primary border-[1.4px]"
                  : "border-gray-400 border-[1px] bg-white"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>}
      </div>
      {!supportsFilters&&<p className="text-xs text-gray-500 self-start p-2">فیلتر دسته‌بندی فعال است؛ فیلتر قیمت، موجودی و مرتب‌سازی هنوز توسط سرویس فروشگاه پشتیبانی نمی‌شود.</p>}
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <SortModal isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} selectedValue={searchParams.get('sort')||'newest'} onSelect={changeSort} />
    </div>
  );
}
