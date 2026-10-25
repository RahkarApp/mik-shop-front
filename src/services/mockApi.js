/**
 * Mock Micro Server — شبیه‌ساز Micro Server
 *
 * این فایل نقش Micro Server را در فاز POC بازی می‌کند.
 * تمام داده‌ها و تنظیمات از اینجا خوانده می‌شوند.
 * در آینده این توابع به API واقعی Micro Server متصل می‌شوند.
 *
 * معماری: Frontend → Service → mockApi (Micro Server)
 */

import { products, categories, banners, orders } from '@/data/store';
import {
  TENANT_FASHION,
  TENANT_COSMETIC,
  TENANT_ELECTRONICS,
  DEFAULT_TENANT_ID,
} from '@/constants/config';
import {
  PRODUCT_CARD_A,
  PRODUCT_CARD_B,
  PRODUCT_CARD_C,
  BANNER_A,
  BANNER_B,
  BANNER_C,
  CART_A,
  CART_B,
  CATEGORIES_A,
  CATEGORIES_B,
  CATEGORIES_C,
} from '@/constants/config';
import { HEADER_A, HEADER_B, HEADER_C, FOOTER_A, FOOTER_B, FOOTER_C } from '@/constants/config';
import {
  SECTION_HERO,
  SECTION_CATEGORIES,
  SECTION_PRODUCTS,
} from '@/constants/config';

// ─────────────────────────────────────────────
// Tenant فعال — با تغییر این مقدار، فروشگاه عوض می‌شود
// در محیط واقعی از subdomain یا header تشخیص داده می‌شود
// ─────────────────────────────────────────────
let activeTenantId = DEFAULT_TENANT_ID;

/**
 * SiteConfig هر Tenant — منبع واحد تصمیم‌گیری رفتار سایت
 * Behavior = Config
 */
const TENANT_CONFIGS = {
  // ─── فروشگاه مد و پوشاک ───
  [TENANT_FASHION]: {
    tenantId: TENANT_FASHION,

    branding: {
      siteName: 'وان استایل',
      logo: '',
      favicon: '/favicon-fashion.ico',
      description: 'فروشگاه پوشاک، کفش و اکسسوری زنانه وان استایل.',
      phone: '',
      address: '',
      social: {
        instagram: '',
        telegram: '',
        whatsapp: '',
      },
    },

    theme: {
      mode: 'light',
      primaryColor: '#7C3AED',
      fontFamily: 'Ravi, sans-serif',
      borderRadius: '12px',
    },

    layout: {
      header: HEADER_A,
      footer: FOOTER_A,
      homeSections: [SECTION_HERO, SECTION_CATEGORIES, SECTION_PRODUCTS],
      components: {
        productCard: PRODUCT_CARD_A,
        banner: BANNER_A,
        cart: CART_A,
        categories: CATEGORIES_A,
      },
    },

    features: {
      wishlist: true,
      loyaltyClub: true,
      wallet: false,
      cashback: true,
      luckyWheel: false,
      campaigns: true,
      reviews: true,
      shareProduct: true,
      blog: false,
    },

    pages: {
      blog: false,
      returnPolicy: true,
    },

    seo: {
      title: 'وان استایل | پوشاک و اکسسوری زنانه',
      description: 'فروشگاه پوشاک، کفش و اکسسوری زنانه وان استایل',
      keywords: ['وان استایل', 'پوشاک زنانه', 'کفش زنانه', 'اکسسوری'],
    },
  },

  // ─── فروشگاه آرایشی ───
  [TENANT_COSMETIC]: {
    tenantId: TENANT_COSMETIC,

    branding: {
      siteName: 'بیوتی‌لند',
      logo: '/images/logo-cosmetic.png',
      favicon: '/favicon-cosmetic.ico',
      description: 'محصولات آرایشی و بهداشتی اصل با ارسال سریع.',
      phone: '02192002345',
      address: 'تهران، سعادت‌آباد، میدان کاج',
      social: {
        instagram: 'https://instagram.com/beautyland',
        telegram: 'https://t.me/beautyland',
        whatsapp: 'https://wa.me/989122002345',
      },
    },

    theme: {
      mode: 'light',
      primaryColor: '#9C27B0',
      fontFamily: 'Ravi, sans-serif',
      borderRadius: '8px',
    },

    layout: {
      header: HEADER_B,
      footer: FOOTER_B,
      homeSections: [SECTION_HERO, SECTION_PRODUCTS, SECTION_CATEGORIES],
      components: {
        productCard: PRODUCT_CARD_B,
        banner: BANNER_B,
        cart: CART_B,
        categories: CATEGORIES_B,
      },
    },

    features: {
      wishlist: true,
      loyaltyClub: false,
      wallet: true,
      cashback: false,
      luckyWheel: true,
      campaigns: true,
      reviews: true,
      shareProduct: true,
      blog: false,
    },

    pages: {
      blog: false,
      returnPolicy: false,
    },

    seo: {
      title: 'بیوتی‌لند | لوازم آرایشی و بهداشتی',
      description: 'محصولات آرایشی اصل با ارسال سریع — بیوتی‌لند',
      keywords: ['آرایش', 'زیبایی', 'کرم', 'عطر'],
    },
  },

  // ─── فروشگاه الکترونیک ───
  [TENANT_ELECTRONICS]: {
    tenantId: TENANT_ELECTRONICS,

    branding: {
      siteName: 'الکتروشاپ',
      logo: '/images/logo-electronics.png',
      favicon: '/favicon-electronics.ico',
      description: 'موبایل، لپ‌تاپ و گجت با گارانتی معتبر.',
      phone: '02193003456',
      address: 'تهران، میدان ونک، برج نگار',
      social: {
        instagram: 'https://instagram.com/electroshop',
        telegram: 'https://t.me/electroshop',
        whatsapp: 'https://wa.me/989123003456',
      },
    },

    theme: {
      mode: 'dark',
      primaryColor: '#2196F3',
      fontFamily: 'Ravi, sans-serif',
      borderRadius: '4px',
    },

    layout: {
      header: HEADER_C,
      footer: FOOTER_C,
      homeSections: [SECTION_HERO, SECTION_PRODUCTS],
      components: {
        productCard: PRODUCT_CARD_C,
        banner: BANNER_C,
        cart: CART_A,
        categories: CATEGORIES_C,
      },
    },

    features: {
      wishlist: false,
      loyaltyClub: false,
      wallet: true,
      cashback: true,
      luckyWheel: false,
      campaigns: false,
      reviews: true,
      shareProduct: false,
      blog: false,
    },

    pages: {
      blog: false,
      returnPolicy: true,
    },

    seo: {
      title: 'الکتروشاپ | فروشگاه دیجیتال',
      description: 'موبایل، لپ‌تاپ و گجت با گارانتی معتبر — الکتروشاپ',
      keywords: ['موبایل', 'لپ‌تاپ', 'الکترونیک', 'گجت'],
    },
  },
};

// شبیه‌سازی تأخیر شبکه — مانند درخواست واقعی به سرور
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────
// API های Micro Server
// ─────────────────────────────────────────────

/**
 * دریافت SiteConfig فروشگاه فعال
 * @param {string} [tenantId] — اختیاری؛ در غیر این صورت Tenant فعال
 */
export async function fetchSiteConfig(tenantId) {
  await delay(100);
  const id = tenantId || activeTenantId;
  const config = TENANT_CONFIGS[id];

  if (!config) {
    throw new Error(`Tenant "${id}" یافت نشد`);
  }

  return { ...config };
}

/**
 * تغییر Tenant فعال — برای شبیه‌سازی Multi-Tenant در POC
 * @param {string} tenantId
 */
export function setActiveTenant(tenantId) {
  if (!TENANT_CONFIGS[tenantId]) {
    throw new Error(`Tenant "${tenantId}" معتبر نیست`);
  }
  activeTenantId = tenantId;
}

/** دریافت شناسه Tenant فعال */
export function getActiveTenantId() {
  return activeTenantId;
}

/** لیست تمام Tenantهای موجود */
export async function fetchTenants() {
  await delay(50);
  return Object.keys(TENANT_CONFIGS).map((id) => ({
    id,
    siteName: TENANT_CONFIGS[id].branding.siteName,
  }));
}

// ─── داده‌های محتوا (Data Layer) ───

/** دریافت بنرها — همیشه از Micro Server */
export async function fetchBanners() {
  await delay(100);
  return banners;
}

/** دریافت دسته‌بندی‌های اصلی */
export async function fetchCategories() {
  await delay(100);
  return categories.map(({ id, code, name, image }) => ({ id, code, name, image }));
}

/**
 * دریافت محصولات
 * قیمت و موجودی همیشه از این endpoint خوانده می‌شوند — Cache طولانی‌مدت ممنوع
 */
export async function fetchProducts({ query, category, limit = 10, sort, minPrice, maxPrice, availableOnly, page = 1 } = {}) {
  await delay(200);
  let filtered = [...products];

  if (query) {
    const normalizedQuery = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description?.toLowerCase().includes(normalizedQuery) ||
        product.code?.includes(normalizedQuery)
    );
  }

  if (category) {
    const allCategoryIds = new Set();
    const findSubcategories = (catId) => {
      allCategoryIds.add(catId);
      const cat = categories
        .flatMap((c) => [c, ...(c.subcategories || [])])
        .find((c) => c.id === catId);
      cat?.subcategories?.forEach((sub) => findSubcategories(sub.id));
    };
    findSubcategories(category);
    filtered = filtered.filter((p) => allCategoryIds.has(p.category));
  }

  if (availableOnly === 'true') filtered = filtered.filter(p => Number(p.stock) > 0);
  if (minPrice !== undefined && minPrice !== '') filtered = filtered.filter(p => p.price >= Number(minPrice));
  if (maxPrice !== undefined && maxPrice !== '') filtered = filtered.filter(p => p.price <= Number(maxPrice));
  if (sort === 'cheapest') filtered.sort((a,b)=>a.price-b.price);
  if (sort === 'most_expensive') filtered.sort((a,b)=>b.price-a.price);
  return filtered.slice((Math.max(1,Number(page)||1)-1)*limit,Math.max(1,Number(page)||1)*limit).map((p) => ({
    ...p,
    price: p.price,
    stock: p.stock,
    _syncedAt: Date.now(),
  }));
}

/**
 * دریافت قیمت و موجودی یک محصول — برای همگام‌سازی Real-Time در آینده
 */
export async function fetchProductInventory(productId) {
  await delay(80);
  const product = products.find((p) => p.id === productId);

  if (!product) return null;

  return {
    productId,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    stock: product.stock,
    syncedAt: Date.now(),
  };
}

/** دریافت یک محصول با شناسه */
export async function fetchProductById(id) {
  await delay(150);
  const product = products.find((p) => p.id === id);
  if (!product) return null;

  const inventory = await fetchProductInventory(id);
  return { ...product, ...inventory };
}

/** دریافت سفارشات */
export async function fetchOrders() {
  await delay(300);
  return orders;
}

/** دریافت جزئیات یک سفارش */
export async function fetchOrderById(id) {
  await delay(150);
  return orders.find((o) => o.id === id) || null;
}

/** دریافت پست‌های بلاگ — Mock */
export async function fetchBlogPosts() {
  await delay(100);
  return [];
}

/**
 * ارسال رویداد به Micro Server — برای آنالیتیکس و لاگ
 */
export async function sendEvent(eventName, payload = {}) {
  await delay(30);
  if (process.env.NODE_ENV === 'development') {
    console.log('[Mock Micro Server] Event:', eventName, payload);
  }
  return { success: true };
}
