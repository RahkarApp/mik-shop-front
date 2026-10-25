"use client";

/**
 * Footer — فوتر اصلی فروشگاه (Config-Driven)
 *
 * اطلاعات تماس و نام فروشگاه از SiteConfig.branding می‌آیند.
 * variant تعیین می‌کند کدام نسخه Layout (A یا B) رندر شود.
 */

import { Phone, MessageCircle, Send, Instagram, MapPin } from "lucide-react";
import { toJalali } from "@/utils/toJalali";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const ENAMAD_URL = "https://trustseal.enamad.ir";

function toPersianDigits(value) {
  if (value == null) return "";
  const map = { 0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "۴", 5: "۵", 6: "۶", 7: "۷", 8: "۸", 9: "۹" };
  return String(value).replace(/[0-9]/g, (d) => map[d]);
}

/**
 * @param {Object} props
 * @param {'a'|'b'} [props.variant] — نسخه Layout فوتر
 */
export default function Footer({ variant = "a" }) {
  const { config } = useSiteConfig();
  const branding = config?.branding || {};

  const siteName = branding.siteName || "فروشگاه";
  const description = branding.description || "";
  const phone = branding.phone || "";
  const address = branding.address || "";
  const social = branding.social || {};

  const currentJalaliDate = toJalali(new Date());
  const isVariantB = variant === "b";

  // variant B — فوتر مینیمال و روشن
  if (isVariantB) {
    return (
      <footer dir="rtl" className="bg-gray-100 w-full pt-10 pb-24 md:pb-8 border-t border-gray-200 text-gray-700">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                {config?.branding?.logo ? <img src={config.branding.logo} alt={siteName} className="w-full h-full object-contain rounded-lg" /> : siteName.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-gray-900">{siteName}</h2>
            </div>

            {phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-primary" />
                <span dir="ltr">{toPersianDigits(phone)}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                  <Instagram size={20} />
                </a>
              )}
              {social.telegram && (
                <a href={social.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500">
                  <Send size={20} />
                </a>
              )}
              {social.whatsapp && (
                <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500">
                  <MessageCircle size={20} />
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-500">
            <p>© {toPersianDigits(currentJalaliDate)} — {config?.footer?.copyright || 'تمامی حقوق محفوظ است'}</p>
          </div>
        </div>
      </footer>
    );
  }

  // variant A — فوتر کامل تیره (نسخه اصلی)
  return (
    <footer dir="rtl" className="bg-gray-900 w-full pt-16 pb-24 md:pb-8 md:px-5 border-t border-gray-800 text-gray-300">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                {config?.branding?.logo ? <img src={config.branding.logo} alt={siteName} className="w-full h-full object-contain rounded-lg" /> : siteName.charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{siteName}</h2>
            </div>

            {description && (
              <p className="text-gray-400 leading-7 max-w-sm text-sm text-justify">{description}</p>
            )}

            <div className="flex flex-col gap-3 mt-2 text-sm">
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary shrink-0 mt-1" />
                  <span className="leading-6">{toPersianDigits(address)}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-primary shrink-0" />
                  <span className="leading-6 dir-ltr text-right">{toPersianDigits(phone)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-lg relative inline-block">
              دسترسی سریع
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-primary rounded-full" />
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="/about" className="hover:text-primary transition-colors">درباره ما</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">تماس با ما</a></li>
              {config?.pages?.blog && (
                <li><a href="/blog" className="hover:text-primary transition-colors">بلاگ</a></li>
              )}
              {config?.pages?.returnPolicy && (
                <li><a href="/return-policy" className="hover:text-primary transition-colors">سیاست بازگشت کالا</a></li>
              )}
              <li><a href="/faq" className="hover:text-primary transition-colors">سوالات متداول</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-lg relative inline-block">
              همراه ما باشید
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-primary rounded-full" />
            </h3>
            <div className="flex items-center gap-4">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
              )}
              {social.telegram && (
                <a href={social.telegram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all">
                  <Send size={20} />
                </a>
              )}
              {social.whatsapp && (
                <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-all">
                  <MessageCircle size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{config?.footer?.copyright || 'تمامی حقوق مادی و معنوی این وب‌سایت محفوظ است.'}</p>
          <p>© {toPersianDigits(currentJalaliDate)}</p>
        </div>
      </div>
    </footer>
  );
}
