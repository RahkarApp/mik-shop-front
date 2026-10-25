// === components (legacy demo compatibility constants) ===
/**
 * ثابت‌های variant کامپوننت‌ها — انتخاب از SiteConfig.layout.components
 */

// ─── کارت محصول ───
export const PRODUCT_CARD_A = 'productCardA';
export const PRODUCT_CARD_B = 'productCardB';
export const PRODUCT_CARD_C = 'productCardC';

// ─── بنر ───
export const BANNER_A = 'bannerA';
export const BANNER_B = 'bannerB';
export const BANNER_C = 'bannerC';

// ─── سبد خرید ───
export const CART_A = 'cartA';
export const CART_B = 'cartB';

// ─── دسته‌بندی ───
export const CATEGORIES_A = 'categoriesA';
export const CATEGORIES_B = 'categoriesB';
export const CATEGORIES_C = 'categoriesC';

// پیش‌فرض‌ها
export const DEFAULT_COMPONENTS = {
  productCard: PRODUCT_CARD_A,
  banner: BANNER_A,
  cart: CART_A,
  categories: CATEGORIES_A,
};

export const COMPONENT_LABELS = {
  [PRODUCT_CARD_A]: 'کارت کلاسیک',
  [PRODUCT_CARD_B]: 'کارت مینیمال',
  [PRODUCT_CARD_C]: 'کارت فشرده',
  [BANNER_A]: 'اسلایدر تمام‌عرض',
  [BANNER_B]: 'بنر شبکه‌ای',
  [BANNER_C]: 'بنر تکی Hero',
  [CART_A]: 'سبد دو ستونه',
  [CART_B]: 'سبد تک‌ستونه',
  [CATEGORIES_A]: 'دایره‌ای',
  [CATEGORIES_B]: 'اسکرول افقی',
  [CATEGORIES_C]: 'کارت تصویری',
};


// === features (legacy demo compatibility constants) ===
/**
 * ثابت‌های Feature — قابلیت‌های قابل فعال/غیرفعال شدن
 *
 * هر Feature مستقل است و نباید به Feature دیگر وابسته باشد.
 */

export const FEATURE_WISHLIST = 'wishlist';
export const FEATURE_LOYALTY = 'loyaltyClub';
export const FEATURE_WALLET = 'wallet';
export const FEATURE_CASHBACK = 'cashback';
export const FEATURE_LUCKY_WHEEL = 'luckyWheel';
export const FEATURE_CAMPAIGNS = 'campaigns';
export const FEATURE_REVIEWS = 'reviews';
export const FEATURE_SHARE = 'shareProduct';
export const FEATURE_BLOG = 'blog';

// برچسب فارسی Featureها برای نمایش در UI تست
export const FEATURE_LABELS = {
  [FEATURE_WISHLIST]: 'لیست علاقه‌مندی',
  [FEATURE_LOYALTY]: 'باشگاه مشتریان',
  [FEATURE_WALLET]: 'کیف پول',
  [FEATURE_CASHBACK]: 'کش‌بک',
  [FEATURE_LUCKY_WHEEL]: 'گردونه شانس',
  [FEATURE_CAMPAIGNS]: 'کمپین‌ها',
  [FEATURE_REVIEWS]: 'نظرات',
  [FEATURE_SHARE]: 'اشتراک‌گذاری محصول',
  [FEATURE_BLOG]: 'بلاگ',
};


// === layouts (legacy demo compatibility constants) ===
/**
 * ثابت‌های Layout — نام هدر و فوترهای قابل استفاده
 *
 * مقدار layout.header و layout.footer در SiteConfig
 * باید یکی از این کلیدها باشد.
 */

export const HEADER_A = 'headerA';
export const HEADER_B = 'headerB';
export const HEADER_C = 'headerC';
export const FOOTER_A = 'footerA';
export const FOOTER_B = 'footerB';
export const FOOTER_C = 'footerC';

export const LAYOUT_LABELS = {
  [HEADER_A]: 'هدر کلاسیک',
  [HEADER_B]: 'هدر فشرده',
  [HEADER_C]: 'هدر نوار بالا',
  [FOOTER_A]: 'فوتر کامل',
  [FOOTER_B]: 'فوتر مینیمال',
  [FOOTER_C]: 'فوتر خبرنامه',
};


// === sections (legacy demo compatibility constants) ===
/**
 * ثابت‌های Section — بخش‌های قابل چیدن در صفحه اصلی
 *
 * آرایه layout.homeSections در SiteConfig
 * از این شناسه‌ها تشکیل می‌شود.
 */

export const SECTION_HERO = 'hero';
export const SECTION_CATEGORIES = 'categories';
export const SECTION_PRODUCTS = 'products';
export const SECTION_BLOG = 'blog';

// برچسب نمایشی هر بخش
export const SECTION_LABELS = {
  [SECTION_HERO]: 'Hero Banner',
  [SECTION_CATEGORIES]: 'Categories',
  [SECTION_PRODUCTS]: 'Product Grid',
  [SECTION_BLOG]: 'Blog Section',
};

// رنگ پیش‌فرض هر بخش در ComponentBox
export const SECTION_COLORS = {
  [SECTION_HERO]: 'bg-amber-100 border-amber-400',
  [SECTION_CATEGORIES]: 'bg-sky-100 border-sky-400',
  [SECTION_PRODUCTS]: 'bg-emerald-100 border-emerald-400',
  [SECTION_BLOG]: 'bg-rose-100 border-rose-400',
};


// === tenants (legacy demo compatibility constants) ===
/**
 * ثابت‌های Tenant — شناسه فروشگاه‌های Mock
 */

export const TENANT_FASHION = 'fashion-store';
export const TENANT_COSMETIC = 'cosmetic-store';
export const TENANT_ELECTRONICS = 'electronics-store';

export const DEFAULT_TENANT_ID = TENANT_FASHION;

/** هدر HTTP که Middleware روی درخواست ست می‌کند */
export const TENANT_HEADER = 'x-tenant-id';

/** نام Cookie نگهداری Tenant */
export const TENANT_COOKIE = 'shopsaz-tenant';

/** نگاشت subdomain → tenantId (مثال: fashion.localhost → fashion-store) */
export const TENANT_SUBDOMAIN_MAP = {
  fashion: TENANT_FASHION,
  cosmetic: TENANT_COSMETIC,
  beauty: TENANT_COSMETIC,
  electronics: TENANT_ELECTRONICS,
  electro: TENANT_ELECTRONICS,
};

/** تمام Tenantهای معتبر */
export const VALID_TENANT_IDS = [
  TENANT_FASHION,
  TENANT_COSMETIC,
  TENANT_ELECTRONICS,
];

export const TENANT_LIST = [
  { id: TENANT_FASHION, label: 'وان استایل', subdomain: 'fashion' },
  { id: TENANT_COSMETIC, label: 'فروشگاه آرایشی', subdomain: 'cosmetic' },
  { id: TENANT_ELECTRONICS, label: 'فروشگاه الکترونیک', subdomain: 'electronics' },
];
