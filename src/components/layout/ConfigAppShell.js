'use client';

/**
 * ConfigAppShell — پوسته Config-Driven با UI واقعی
 *
 * LayoutRenderer برای Header/Footer
 * BottomMenu و مودال‌ها برای موبایل
 */

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LayoutRenderer from '@/components/layouts/LayoutRenderer';
import BottomMenu from '@/components/shared/BottomMenu';

const SearchModal = dynamic(() => import('@/components/shared/SearchModal'), { ssr: false });
const CategoryModal = dynamic(() => import('@/components/shared/CategoryModal '), { ssr: false });
const FilterModal = dynamic(() => import('@/components/shared/FilterModal'), { ssr: false });

export default function ConfigAppShell({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const pathname = usePathname();

  // بستن مودال‌ها با تغییر مسیر
  useEffect(() => {
    setIsSearchOpen(false);
    setIsCategoryOpen(false);
    setIsFilterOpen(false);
  }, [pathname]);

  let activeModal = null;
  if (isSearchOpen) activeModal = 'search';
  else if (isCategoryOpen) activeModal = 'category';
  else if (isFilterOpen) activeModal = 'filter';

  return (
    <>
      <LayoutRenderer>{children}</LayoutRenderer>

      <BottomMenu
        onOpenCategoryModal={() => {
          setIsCategoryOpen((prev) => !prev);
          setIsSearchOpen(false);
          setIsFilterOpen(false);
        }}
        onOpenSearchModal={() => {
          setIsSearchOpen((prev) => !prev);
          setIsCategoryOpen(false);
          setIsFilterOpen(false);
        }}
        onOpenFilterModal={() => {
          setIsFilterOpen((prev) => !prev);
          setIsCategoryOpen(false);
          setIsSearchOpen(false);
        }}
        activeModal={activeModal}
      />

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CategoryModal isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
}
