


import { useState, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import {useCategories} from '@/hooks/useCategories';

// تابع بازگشتی برای پیدا کردن نام دسته‌بندی انتخاب‌شده
function findCategoryName(categories, id) {
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (cat.id === id) {
      return cat.name;
    }
    if (cat.subcategories) {
      const name = findCategoryName(cat.subcategories, id);
      if (name) {
        return name;
      }
    }
  }
  return null;
}

export default function CategoryFilterModal({ open, onClose, selectedCategory, onSelect }) {
  const {categories:CATEGORIES=[]}=useCategories();
  const [openCategories, setOpenCategories] = useState({});
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      setOpenCategories({});
      setIsCategoriesOpen(true);
    }
  }, [open]);

  // باز و بسته کردن زیر دسته‌ها
  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // انتخاب دسته‌بندی
  const handleSelect = (categoryId) => {
    onSelect(categoryId === selectedCategory ? null : categoryId);
  };

  // بازگشتی برای نمایش دسته‌بندی‌ها
  const renderCategory = (category, level = 0) => {
    return (
      <div key={category.id} className="mb-2">
        <div className="w-full flex justify-between items-center py-3 px-4">
          <button
            className="flex-1 flex items-center gap-2 text-left text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            onClick={() => handleSelect(category.id)}
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
              <div key={sub.id}>{renderCategory(sub, level + 1)}</div>
            ))}
          </div>
        )}
        {category.subcategories && openCategories[category.id] && (
          <hr className="border-gray-200 mt-2" />
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div
      className={`fixed left-0 right-0 bottom-[60px] top-0 z-50 flex justify-center items-end md:hidden transition-all duration-500 ease-in-out ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* پس‌زمینه بلور */}
      <div
        className="absolute inset-0 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      {/* کانتینر اصلی */}
      <div
        className={`w-full max-h-[80vh] bg-gradient-to-b from-white to-gray-50 rounded-t-3xl p-6 overflow-y-auto shadow-2xl transition-transform duration-500 ease-in-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">فیلتر دسته‌بندی</h2>
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
            <span>
              {selectedCategory
                ? findCategoryName(CATEGORIES, selectedCategory)
                : "دسته‌بندی‌ها"}
            </span>
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
      </div>
    </div>

        )}