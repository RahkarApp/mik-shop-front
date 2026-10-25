"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

// داده‌های تست برای گزینه‌های مرتب‌سازی
const SORT_OPTIONS = [
  { id: 1, name: "جدیدترین", value: "newest" },
  { id: 2, name: "ارزان‌ترین", value: "cheapest" },
  { id: 3, name: "گران‌ترین", value: "most_expensive" },
  { id: 4, name: "محبوب‌ترین", value: "most_popular" },
];

export default function SortModal({ isOpen, onClose, onSelect }) {
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0].value);

  // بستن مدال تو صفحه‌های بزرگ‌تر (md و بالاتر)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        onClose();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-end md:hidden transition-all duration-500 ease-in-out ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* پس‌زمینه  با افکت بلور */}
      <div
        className="absolute inset-0 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      {/* کانتینر */}
      <div
        className={`w-full max-h-[80vh] bg-gradient-to-b from-white to-gray-50 rounded-t-3xl p-6 overflow-y-auto shadow-2xl transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* هدر  */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">مرتب‌سازی</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* گزینه‌ها */}
        <div className="space-y-3">
          {SORT_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`py-3 px-4 text-base cursor-pointer rounded-lg transition-all duration-200 ${
                selectedSort === option.value
                  ? "bg-gray-200 font-semibold"
                  : "text-gray-700 font-semibold "
              }`}
              onClick={() => {
                setSelectedSort(option.value);
                onSelect?.(option.value);
                onClose();
              }}
            >
              {option.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}