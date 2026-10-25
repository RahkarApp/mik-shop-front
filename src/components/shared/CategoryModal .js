'use client';
import {demoHref} from '@/utils/demoRoute';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, Check } from "lucide-react";
import {useCategories} from "@/hooks/useCategories";

export default function FilterModal({ isOpen, onClose }) {
  const {categories:CATEGORIES=[]}=useCategories();
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [openCategories, setOpenCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const router = useRouter();

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

  // تابع برای انتخاب دسته‌بندی (تک‌انتخابی و ریدایرکت)
  const toggleSubcategory = (categoryId) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
      router.push(demoHref(`/category/${categoryId}`));
      onClose && onClose();
    } else {
      setSelectedCategory(null);
    }
  };

  // بستن مدال تو صفحه‌های بزرگ‌تر (رزولوشن 768 به بالا)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        onClose();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  // کامپوننت بازگشتی برای رندر دسته‌بندی‌های تودرتو
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
        {category.subcategories && openCategories[category.id] && (
          <div className="pt-2 space-y-2">
            {category.subcategories.map((sub) => (
              <div key={sub.id}>
                {renderCategory(sub, level + 1)}
              </div>
            ))}
          </div>
        )}
        {category.subcategories && openCategories[category.id] && (
          <hr className="border-gray-200 mt-2" />
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed left-0 right-0 bottom-[60px] top-0 z-50 flex justify-center items-end md:hidden transition-all duration-500 ease-in-out ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* پس‌زمینه فقط با افکت بلور */}
      <div
        className="absolute inset-0 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      {/* کانتینر اصلی با گرادیانت و گوشه‌های گرد */}
      <div
        className={`w-full max-h-[80vh] bg-gradient-to-b from-white to-gray-50 rounded-t-3xl p-6 overflow-y-auto shadow-2xl transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر با فونت شیک و آیکون بستن */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

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
                <div key={category.id}>
                  {renderCategory(category)}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
