'use client';
import {demoHref} from '@/utils/demoRoute';

/**
 * Header — هدر اصلی فروشگاه (Config-Driven)
 *
 * نام فروشگاه و Featureها از SiteConfig می‌آیند.
 * variant تعیین می‌کند کدام نسخه Layout (A یا B) رندر شود.
 */

import { useState, useEffect } from "react";
import Link from "@/components/PreviewLink";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingCart, Heart, Wallet } from "lucide-react";
import SearchModal from "../shared/SearchModal";
import { useCart } from "@/components/shared/CartContext";
import CartBadge from '@/components/shared/CartBadge';
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useFeatures } from "@/hooks/useFeatures";

// تبدیل اعداد به فارسی
function toPersianDigits(num) {
  if (num === undefined || num === null) return "";
  const persian = { 0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "۴", 5: "۵", 6: "۶", 7: "۷", 8: "۸", 9: "۹" };
  return num.toString().replace(/[0-9]/g, (d) => persian[d]);
}

/**
 * @param {Object} props
 * @param {'a'|'b'} [props.variant] — نسخه Layout هدر
 */
export default function Header({ variant = "a" }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");
  const router = useRouter();
  const { cartItemCount } = useCart();
  const { config } = useSiteConfig();
  const { isWishlistEnabled, isWalletEnabled } = useFeatures();

  // نام فروشگاه از Config — نه Hardcode
  const siteName = config?.branding?.siteName || "فروشگاه";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDesktopSearch = (e) => {
    e.preventDefault();
    const q = desktopSearch.trim();
    if (!q) return;
    router.push(demoHref(`/search-result?q=${encodeURIComponent(q)}`));
  };

  // استایل variant B — لوگو وسط‌چین، بدون سرچ دسکتاپ
  const isVariantB = variant === "b";

  return (
    <>
      <header
        className={`w-full py-4 bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-gray-100 ${
          isScrolled ? "shadow-md" : ""
        } sticky top-0 z-50`}
        dir="rtl"
      >
        <div
          className={`container max-w-7xl mx-auto flex items-center px-4 sm:px-6 lg:px-8 ${
            isVariantB ? "flex-col gap-3 md:flex-row md:justify-between" : "justify-between"
          }`}
        >
          {/* لوگو و نام فروشگاه */}
          <Link
            href="/"
            className={`flex items-center gap-3 group ${isVariantB ? "md:order-2" : ""}`}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg">
              {config?.branding?.logo ? <img src={config.branding.logo} alt={siteName} className="w-full h-full object-contain rounded-lg" /> : siteName.charAt(0)}
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-gray-900 group-hover:text-primary transition-colors">
              {siteName}
            </span>
          </Link>

          {/* سرچ بار — فقط در variant A و دسکتاپ */}
          {!isVariantB && (
            <form
              className="relative hidden md:block flex-1 max-w-xl mx-8"
              dir="rtl"
              autoComplete="off"
              onSubmit={handleDesktopSearch}
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="جستجو در هزاران محصول..."
                  value={desktopSearch}
                  onChange={(e) => setDesktopSearch(e.target.value)}
                  className="w-full bg-gray-100 text-gray-800 rounded-xl px-5 py-3 pr-12 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none placeholder:text-gray-400"
                  dir="rtl"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                  aria-label="جستجو"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* آیکون‌ها — Featureها از Config فعال/غیرفعال می‌شوند */}
          <div className={`flex items-center gap-2 md:gap-3 ${isVariantB ? "md:order-1 w-full md:w-auto justify-end" : ""}`}>
            {isWishlistEnabled && (
              <Link
                href="/profile"
                className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-primary transition-all hidden md:block"
                aria-label="لیست علاقه‌مندی"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {isWalletEnabled && (
              <Link
                href="/profile"
                className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-primary transition-all hidden md:block"
                aria-label="کیف پول"
              >
                <Wallet className="w-6 h-6" />
              </Link>
            )}

            <Link
              href="/profile"
              className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-primary transition-all hidden md:block"
              aria-label="پروفایل کاربری"
            >
              <User className="w-6 h-6" />
            </Link>

            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-primary transition-all hidden md:block"
              aria-label="سبد خرید"
            >
              <ShoppingCart className="w-6 h-6" />
              <CartBadge count={cartItemCount}/>
            </Link>

            {/* variant B: دکمه جستجوی موبایل/دسکتاپ */}
            {isVariantB && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-primary transition-all"
                aria-label="جستجو"
              >
                <Search className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
