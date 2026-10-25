'use client';

/**
 * SectionRenderer — رندر بخش‌ها بر اساس homeSections در Config
 *
 * ترتیب و نوع بخش‌ها از layout.homeSections می‌آید.
 */

import HeroSection from './HeroSection';
import CategoriesSection from './CategoriesSection';
import ProductsSection from './ProductsSection';
import BlogSection from './BlogSection';
import {
  SECTION_HERO,
  SECTION_CATEGORIES,
  SECTION_PRODUCTS,
  SECTION_BLOG,
} from '@/constants/config';

// نگاشت شناسه بخش به کامپوننت
const SECTION_MAP = {
  [SECTION_HERO]: HeroSection,
  [SECTION_CATEGORIES]: CategoriesSection,
  [SECTION_PRODUCTS]: ProductsSection,
  [SECTION_BLOG]: BlogSection,
};

/**
 * @param {Object} props
 * @param {string[]} props.sections — آرایه شناسه بخش‌ها از Config
 */
export default function SectionRenderer({ sections = [] }) {
  return (
    <div className="flex flex-col gap-8 w-full">
      {sections.map((sectionId) => {
        const SectionComponent = SECTION_MAP[sectionId];

        if (!SectionComponent) {
          return (
            <div
              key={sectionId}
              className="p-4 border border-red-300 bg-red-50 rounded text-red-700 text-sm"
            >
              بخش ناشناخته: {sectionId}
            </div>
          );
        }

        return <SectionComponent key={sectionId} />;
      })}
    </div>
  );
}
