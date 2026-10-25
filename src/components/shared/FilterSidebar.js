"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

function toPersianDigits(value) {
  if (value == null) return "";
  const map = { "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴", "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹" };
  return String(value).replace(/[0-9]/g, (d) => map[d]);
}

// دریافت دسته‌بندی‌ها از فایل داده تستی مرکزی
import {useCategories} from '@/hooks/useCategories';
import { useRouter, useSearchParams } from "next/navigation";




export default function FilterSidebar() {
  const {categories:CATEGORIES=[]}=useCategories();
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [persianPriceRange, setPersianPriceRange] = useState(["۰", toPersianDigits(10000000)]); // متغیر جدید برای اعداد فارسی
  const [openCategories, setOpenCategories] = useState({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category") || null;
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // به‌روزرسانی اعداد فارسی هنگام تغییر priceRange
  useEffect(() => {
    setPersianPriceRange([toPersianDigits(priceRange[0]), toPersianDigits(priceRange[1])]);
  }, [priceRange]);

  // تابع برای پیدا کردن مسیر والدین یک دسته‌بندی
  const findParentCategories = (categories, targetId, path = []) => {
    for (const category of categories) {
      if (category.id === targetId) {
        return [...path, category.id];
      }
      if (category.subcategories) {
        const subPath = findParentCategories(category.subcategories, targetId, [...path, category.id]);
        if (subPath.length > 0) return subPath;
      }
    }
    return [];
  };

  // تنظیم دراپ‌داون‌های باز بر اساس گزینه انتخاب‌شده
  useEffect(() => {
    if (selectedCategory) {
      setIsCategoriesOpen(true);
      const parentIds = findParentCategories(CATEGORIES, selectedCategory);
      setOpenCategories((prev) => {
        const newOpenCategories = { ...prev };
        parentIds.forEach((id) => {
          newOpenCategories[id] = true;
        });
        return newOpenCategories;
      });
    } else {
      setIsCategoriesOpen(false);
      setOpenCategories({});
    }
  }, [selectedCategory]);

  // تابع برای باز و بسته کردن دراپ‌داون‌ها
  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // تابع برای انتخاب دسته‌بندی (تک‌انتخابی)
  const toggleSubcategory = (categoryId) => {
    // تغییر پارامتر category در URL و رفرش صفحه سرچ ریزالت
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === selectedCategory) {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    router.push(`/search-result?${params.toString()}`);
  };

  // رندر دسته‌بندی‌های تودرتو
  const renderCategory = (category, level = 0) => {
    return (
      <div key={category.id} className="mb-2">
        <div className="w-full flex justify-between items-center py-3 px-4">
          <button
            className="flex-1 flex items-center gap-2 text-left text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            onClick={() => toggleSubcategory(category.id)}
          >
            {selectedCategory === category.id && (
              <Check className="w-5 h-5 text-primary" />
            )}
            <span className="font-medium" style={{ paddingRight: `${level * 12}px` }}>
              {category.name}
            </span>
          </button>
          {category.subcategories && (
            <span
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={() => toggleCategory(category.id)}
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                  openCategories[category.id] ? "rotate-180" : ""
                }`}
              />
            </span>
          )}
        </div>
        {category.subcategories && (
          <div className="w-full h-[1px] bg-gray-200 my-2" />
        )}
        {category.subcategories && openCategories[category.id] && (
          <div className="pt-2 space-y-2">
            {category.subcategories.map((sub) => (
              <div key={sub.id}>{renderCategory(sub, level + 1)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`hidden md:block w-full h-[99vh] overflow-y-scroll  bg-white p-6 border-l border-gray-100 sticky top-1 hover-scrollbar `}>
        {/* عنوان سایدبار */}
        <h2 className="text-xl font-bold text-gray-800 mb-6">فیلترها</h2>

        {/* دسته‌بندی‌ها با دراپ‌داون */}
        <div className="mb-6">
          <button
            className="w-full flex justify-between items-center py-3 px-4 text-base font-semibold text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          >
            <span>دسته‌بندی‌ها</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                isCategoriesOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isCategoriesOpen && (
            <div className="pt-3 space-y-2">
              {CATEGORIES.map((category) => (
                <div key={category.id}>{renderCategory(category)}</div>
              ))}
            </div>
          )}
        </div>

        {/* کالاهای موجود */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={() => setShowAvailableOnly(!showAvailableOnly)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full shadow-inner transition-colors duration-300 ease-in-out ${
                  showAvailableOnly ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                    showAvailableOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
            <span className="text-base text-gray-700 font-medium">کالاهای موجود</span>
          </label>
        </div>

        {/* محدوده قیمت */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">محدوده قیمت</h3>
          <input
            type="range"
            min="0"
            max="10000000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-base text-gray-700 mt-2">
            <span>{persianPriceRange[0]} تومان</span>
            <span>{persianPriceRange[1]} تومان</span>
          </div>
        </div>
      </div>
    </>
  );
}
