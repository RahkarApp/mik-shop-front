"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchModal({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState("");

    // بستن مدال در صفحه‌های بزرگ‌تر (md و بالاتر)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isOpen) {
                onClose();
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isOpen, onClose]);


    const router = useRouter();

    // مدیریت ارسال فرم
    const handleSubmit = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        router.push(`/search-result?q=${encodeURIComponent(q)}`);
        if (typeof onClose === 'function') onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start md:hidden">
                    {/* پس‌زمینه با افکت بلور */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* کانتینر اصلی */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full h-full bg-gradient-to-b from-white to-gray-50 rounded-t-3xl p-6 overflow-y-auto shadow-2xl relative z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* هدر با دکمه بستن */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">جستجو</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
                            </button>
                        </div>

                        {/* فرم جستجو */}
                        <form className="relative" dir="rtl" autoComplete="off" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="جستجو در محصولات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right placeholder:text-gray-400 pr-12 shadow-sm"
                                dir="rtl"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                                aria-label="جستجو"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </form>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
