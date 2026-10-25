# یادداشت معماری قدیمی (غیرمرجع)

> این سند صرفاً سوابق طراحی POC است. قرارداد و قوانین اجرایی جدید در پنج فایل معرفی‌شده در AGENTS.md قرار دارد.

# راهنمای مفصل پروژه Shopsaz

> Frontend سایت‌ساز فروشگاهی Multi-Tenant — Next.js App Router  
> وضعیت فعلی: **Proof of Concept** — معماری Config-Driven با UI واقعی و Mock Micro Server

---

## فهرست مطالب

1. [معرفی پروژه](#۱-معرفی-پروژه)
2. [فلسفه معماری](#۲-فلسفه-معماری)
3. [معماری کلان سیستم](#۳-معماری-کلان-سیستم)
4. [سه ستون اصلی: Config، Data، Theme](#۴-سه-ستون-اصلی-config-data-theme)
5. [ساختار کامل SiteConfig](#۵-ساختار-کامل-siteconfig)
6. [لایه‌های کد و جریان داده](#۶-لایه‌های-کد-و-جریان-داده)
7. [ساختار پوشه‌ها — توضیح فایل به فایل](#۷-ساختار-پوشه‌ها--توضیح-فایل-به-فایل)
8. [سیستم Tenant (چند فروشگاهی)](#۸-سیستم-tenant-چند-فروشگاهی)
9. [سیستم Layout: هدر و فوتر](#۹-سیستم-layout-هدر-و-فوتر)
10. [سیستم Component Variant](#۱۰-سیستم-component-variant)
11. [صفحه اصلی و Section Builder](#۱۱-صفحه-اصلی-و-section-builder)
12. [سیستم Feature](#۱۲-سیستم-feature)
13. [سیستم Theme](#۱۳-سیستم-theme)
14. [SEO](#۱۴-seo)
15. [همگام‌سازی قیمت و موجودی](#۱۵-همگام‌سازی-قیمت-و-موجودی)
16. [صفحات اپلیکیشن](#۱۶-صفحات-اپلیکیشن)
17. [نحوه اجرا و تست](#۱۷-نحوه-اجرا-و-تست)
18. [راهنمای توسعه: افزودن قابلیت جدید](#۱۸-راهنمای-توسعه-افزودن-قابلیت-جدید)
19. [کارهای انجام‌شده و باقی‌مانده](#۱۹-کارهای-انجام‌شده-و-باقی‌مانده)
20. [سوالات متداول](#۲۰-سوالات-متداول)

---

## ۱. معرفی پروژه

این پروژه **Frontend یک سایت‌ساز فروشگاهی Multi-Tenant** است. یعنی:

- **یک کدبیس** برای هزاران فروشگاه
- **رفتار سایت** از تنظیمات (Config) می‌آید، نه Hardcode
- **Micro Server** منبع داده و تنظیمات است (فعلاً Mock)
- Frontend **مستقیماً** به Main Server وصل نمی‌شود

### تکنولوژی‌ها

| ابزار | نسخه / توضیح |
|-------|----------------|
| Next.js | 15 — App Router |
| React | 19 |
| JavaScript | بدون TypeScript |
| Tailwind CSS | v4 |
| Framer Motion | انیمیشن‌ها |
| Swiper | اسلایدر بنر |

### اولویت‌های طراحی

1. درک معماری
2. خوانایی کد
3. توسعه‌پذیری
4. ماژولار بودن

---

## ۲. فلسفه معماری

### اصل طلایی

```
Behavior = Config
```

یعنی:

- کدام هدر نمایش داده شود → از `layout.header`
- کدام کارت محصول استفاده شود → از `layout.components.productCard`
- آیا بلاگ فعال است → از `features.blog` و `pages.blog`
- رنگ اصلی سایت چیست → از `theme.primaryColor`

**نه** اینکه در کامپوننت بنویسیم: «اگر فروشگاه آرایشی بود، هدر بنفش نشان بده.»

### مزایا

- تغییر ظاهر و رفتار **بدون deploy مجدد کد UI**
- تست سریع چند فروشگاه با Mock Config
- جداسازی تصمیم (Config) از نمایش (UI)
- آماده اتصال به Micro Server واقعی

---

## ۳. معماری کلان سیستم

```
┌─────────────────┐
│   Main Server   │  ← دیتابیس مرکزی، مدیریت کلان
└────────┬────────┘
         ↑↓
┌─────────────────┐
│  Micro Server   │  ← تنظیمات فروشگاه، محصولات، Theme، SEO
└────────┬────────┘
         ↑↓
┌─────────────────┐
│ Next.js Frontend│  ← این پروژه
└─────────────────┘
```

### مسئولیت Micro Server

| داده | توضیح |
|------|--------|
| SiteConfig | branding، theme، layout، features، pages، seo |
| محصولات | لیست، جزئیات، قیمت، موجودی |
| دسته‌بندی | درخت دسته‌ها |
| بنر | اسلایدر صفحه اصلی |
| بلاگ | پست‌ها |
| سفارشات | تاریخچه خرید |
| رویدادها | آنالیتیکس، لاگ |

### وضعیت فعلی (POC)

فایل `src/services/mockApi.js` نقش Micro Server را شبیه‌سازی می‌کند.  
داده‌های تستی محصولات در `src/data/store.js` قرار دارند.

---

## ۴. سه ستون اصلی: Config، Data، Theme

```
┌──────────────┬────────────────────────────────────────────┐
│   Config     │  تصمیمات: چه چیزی نمایش داده شود؟       │
├──────────────┼────────────────────────────────────────────┤
│   Data       │  محتوا: محصولات، دسته‌ها، بنر، بلاگ      │
├──────────────┼────────────────────────────────────────────┤
│   Theme      │  ظاهر: رنگ، فونت، حالت light/dark         │
└──────────────┴────────────────────────────────────────────┘
```

| ستون | سوالی که جواب می‌دهد | مثال |
|------|----------------------|------|
| Config | چه Featureای فعال است؟ | `wishlist: true` |
| Config | کدام variant کارت؟ | `productCard: 'productCardB'` |
| Data | چه محصولاتی هست؟ | آرایه محصولات از API |
| Theme | رنگ اصلی چیست؟ | `primaryColor: '#E91E63'` |

---

## ۵. ساختار کامل SiteConfig

هر فروشگاه (Tenant) یک آبجکت `SiteConfig` دارد:

```js
{
  tenantId: "fashion-store",

  // ─── برندینگ ───
  branding: {
    siteName: "فشن‌استور",
    logo: "/images/logo-fashion.png",
    favicon: "/favicon-fashion.ico",
    description: "توضیح کوتاه فروشگاه",
    phone: "02191001234",
    address: "آدرس فروشگاه",
    social: {
      instagram: "https://...",
      telegram: "https://...",
      whatsapp: "https://..."
    }
  },

  // ─── تم ───
  theme: {
    mode: "light",           // "light" | "dark"
    primaryColor: "#E91E63",
    fontFamily: "Ravi, sans-serif",
    borderRadius: "12px"
  },

  // ─── چیدمان ───
  layout: {
    header: "headerA",       // headerA | headerB | headerC
    footer: "footerA",       // footerA | footerB | footerC
    homeSections: ["hero", "categories", "products", "blog"],
    components: {
      productCard: "productCardA",
      banner: "bannerA",
      cart: "cartA",
      categories: "categoriesA"
    }
  },

  // ─── قابلیت‌ها ───
  features: {
    wishlist: true,
    loyaltyClub: true,
    wallet: false,
    cashback: true,
    luckyWheel: false,
    campaigns: true,
    reviews: true,
    shareProduct: true,
    blog: true
  },

  // ─── صفحات ───
  pages: {
    blog: true,
    returnPolicy: true
  },

  // ─── SEO ───
  seo: {
    title: "فشن‌استور | فروشگاه مد و پوشاک",
    description: "توضیحات متا",
    keywords: ["پوشاک", "مد", "لباس"]
  }
}
```

**منبع تعریف:** `src/services/mockApi.js` → `TENANT_CONFIGS`

---

## ۶. لایه‌های کد و جریان داده

### قانون اصلی

```
هیچ کامپوننتی مستقیماً mockApi یا fetch را صدا نمی‌زند.
```

### لایه‌ها

```
┌─────────────────────────────────────────┐
│  UI Layer                               │
│  ProductCardRenderer, HeaderA, CartA   │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Hook Layer                             │
│  useSiteConfig, useProducts, useTheme  │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Service Layer                          │
│  siteConfigService, productService      │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Micro Server (Mock)                    │
│  mockApi.js                             │
└─────────────────────────────────────────┘
```

### مثال عملی: نمایش محصولات صفحه اصلی

```
ProductsSection
    → useProducts()           // Hook
        → getProducts()       // productService
            → fetchProducts() // mockApi
    → ProductCardRenderer
        → useComponentVariant('productCard')
        → ProductCardA | B | C
```

### مثال عملی: تغییر Tenant

```
TenantSwitcher (کلیک کاربر)
    → switchTenant()          // useSiteConfig
        → switchTenant()      // siteConfigService
            → setActiveTenant() // mockApi
    → loadConfig()            // SiteConfigContext
    → تمام UI با Config جدید رندر می‌شود
```

---

## ۷. ساختار پوشه‌ها — توضیح فایل به فایل

```
src/
│
├── app/                          # صفحات Next.js (App Router)
│   ├── layout.js                 # Root Layout + SiteConfigProvider
│   ├── page.js                   # صفحه اصلی + generateMetadata
│   ├── globals.css               # Tailwind v4 + Theme CSS
│   ├── cart/page.js              # سبد خرید
│   ├── checkout/page.js          # تسویه حساب
│   ├── profile/page.js           # پروفایل
│   ├── [slug]/page.js            # جزئیات محصول
│   ├── category/[category]/      # لیست دسته‌بندی
│   ├── search-result/            # نتایج جستجو
│   └── orders/                   # سفارشات
│
├── components/
│   │
│   ├── ui/                       # کامپوننت‌های پایه و variantها
│   │   ├── ComponentBox.js       # باکس تست فاز اول (legacy)
│   │   ├── product-cards/        # کارت محصول A, B, C + Renderer
│   │   ├── banners/              # بنر A, B, C + Renderer
│   │   ├── categories/           # دسته‌بندی A, B, C + Renderer
│   │   └── carts/                # سبد A, B + CartItem A, B + Renderer
│   │
│   ├── layouts/                  # انتخاب Layout از Config
│   │   ├── HeaderA.js            # wrapper → Header variant a
│   │   ├── HeaderB.js            # wrapper → Header variant b
│   │   ├── HeaderC.js            # هدر نوار بالا + منوی تیره
│   │   ├── FooterA/B/C.js        # wrapperهای فوتر
│   │   ├── LayoutRenderer.js     # انتخاب Header/Footer از Config
│   │   └── TenantSwitcher.js     # تست Multi-Tenant (فقط dev)
│   │
│   ├── layout/                   # پیاده‌سازی اصلی Layout
│   │   ├── Header.js             # هدر Config-Driven (variant a/b)
│   │   ├── Footer.js             # فوتر Config-Driven (variant a/b)
│   │   ├── ConfigAppShell.js     # پوسته اصلی + BottomMenu + مودال‌ها
│   │   └── AppShell.js           # نسخه قدیمی (نگه‌داری)
│   │
│   ├── sections/                 # بخش‌های صفحه اصلی
│   │   ├── HeroSection.js        # بنر (از BannerRenderer)
│   │   ├── CategoriesSection.js  # دسته‌بندی (از CategoriesRenderer)
│   │   ├── ProductsSection.js    # محصولات (از ProductCardRenderer)
│   │   ├── BlogSection.js        # بلاگ (شرطی بر اساس Config)
│   │   └── SectionRenderer.js    # چیدمان بخش‌ها از homeSections
│   │
│   ├── features/                 # Featureهای مستقل
│   │   ├── WishlistFeature.js
│   │   ├── ReviewFeature.js
│   │   ├── BlogFeature.js
│   │   ├── WalletFeature.js
│   │   └── FeatureRenderer.js
│   │
│   ├── templates/
│   │   └── HomePageBuilder.js    # سازنده صفحه اصلی
│   │
│   └── shared/                   # کامپوننت‌های مشترک (legacy + فعال)
│       ├── CartContext.js        # Context سبد خرید
│       ├── ProductCard.js        # re-export → ProductCardRenderer
│       ├── BannerSlider.js       # re-export → BannerRenderer
│       ├── Cart.js               # re-export → CartRenderer
│       ├── BottomMenu.js         # منوی پایین موبایل
│       ├── SearchModal.js        # مودال جستجو
│       └── ...
│
├── context/
│   └── SiteConfigContext.js      # مدیریت مرکزی Config + Theme
│
├── hooks/
│   ├── useSiteConfig.js          # دسترسی به Config
│   ├── useFeatures.js            # Featureهای فعال
│   ├── useTheme.js               # Theme فعال
│   ├── useComponentVariant.js    # variant کامپوننت از Config
│   ├── useBanners.js             # داده بنر
│   ├── useCategories.js          # داده دسته‌بندی
│   ├── useProducts.js            # داده محصول
│   └── useBlogPosts.js           # داده بلاگ
│
├── services/
│   ├── mockApi.js                # Mock Micro Server ★
│   ├── siteConfigService.js      # سرویس Config
│   ├── productService.js         # سرویس محصولات
│   └── inventorySync.js          # ساختار همگام‌سازی موجودی
│
├── constants/
│   ├── tenants.js                # شناسه Tenantها
│   ├── layouts.js                # شناسه Header/Footer
│   ├── components.js             # شناسه variant کامپوننت‌ها
│   ├── sections.js               # شناسه بخش‌های صفحه اصلی
│   └── features.js               # شناسه Featureها
│
├── data/
│   ├── store.js                  # داده تستی محصولات، دسته‌ها، ...
│   └── api.js                    # لایه سازگاری (→ productService)
│
└── utils/
    ├── format.js                 # formatPrice, toPersianDigits
    ├── theme.js                  # اعمال Theme به CSS
    ├── metadata.js               # ساخت Metadata Next.js
    └── toJalali.js               # تاریخ شمسی
```

---

## ۸. سیستم Tenant (چند فروشگاهی)

### Tenantهای آماده

| شناسه | نام | هدر | فوتر | تم |
|-------|-----|-----|------|-----|
| `fashion-store` | فشن‌استور | A | A | صورتی، light |
| `cosmetic-store` | بیوتی‌لند | B | B | بنفش، light |
| `electronics-store` | الکتروشاپ | C | C | آبی، dark |

### variant کامپوننت هر Tenant

| Tenant | کارت | بنر | سبد | دسته‌بندی |
|--------|------|-----|-----|-----------|
| فشن‌استور | A کلاسیک | A اسلایدر | A دو ستونه | A دایره‌ای |
| بیوتی‌لند | B مینیمال | B شبکه‌ای | B تک‌ستونه | B pill |
| الکتروشاپ | C فشرده | C Hero | A دو ستونه | C کارت تصویری |

### نحوه تست

1. `npm run dev`
2. در صفحه اصلی (حالت development) بخش **Tenant Switching** را ببینید
3. با کلیک روی هر فروشگاه، Config جدید لود می‌شود

### تغییر دستی Tenant پیش‌فرض

در `mockApi.js`:

```js
let activeTenantId = DEFAULT_TENANT_ID; // constants/tenants.js
```

---

## ۹. سیستم Layout: هدر و فوتر

### هدرها

| شناسه | نام | توضیح |
|-------|-----|--------|
| `headerA` | کلاسیک | لوگو چپ، سرچ وسط، آیکون‌ها راست |
| `headerB` | فشرده | لوگو وسط، جستجو از مودال |
| `headerC` | نوار بالا | نوار رنگی تلفن/ارسال + هدر تیره + منوی افقی |

**فایل‌ها:** `layouts/HeaderA|B|C.js` → `layout/Header.js` (A/B) یا `HeaderC.js`

**Config-Driven:**
- نام فروشگاه از `branding.siteName`
- آیکون wishlist اگر `features.wishlist === true`
- آیکون wallet اگر `features.wallet === true`

### فوترها

| شناسه | نام | توضیح |
|-------|-----|--------|
| `footerA` | کامل | ۴ ستون تیره، لینک‌ها، شبکه‌های اجتماعی |
| `footerB` | مینیمال | یک ردیف روشن، لوگو + تلفن + آیکون‌ها |
| `footerC` | خبرنامه | فرم عضویت + لینک‌ها + شبکه‌های اجتماعی |

**Config-Driven:**
- تلفن، آدرس، توضیحات از `branding`
- لینک «سیاست بازگشت» اگر `pages.returnPolicy === true`

### LayoutRenderer

فایل `components/layouts/LayoutRenderer.js`:

1. `layout.header` را می‌خواند → Header مناسب را رندر می‌کند
2. `layout.footer` را می‌خواند → Footer مناسب را رندر می‌کند
3. `children` (محتوای صفحه) را در وسط قرار می‌دهد

---

## ۱۰. سیستم Component Variant

### الگوی Renderer

هر نوع کامپوننت یک **Renderer** دارد که بر اساس Config، variant مناسب را انتخاب می‌کند:

```
Config.layout.components.productCard = "productCardB"
        ↓
ProductCardRenderer
        ↓
ProductCardB
```

### کارت محصول

| Variant | فایل | استایل |
|-------|------|--------|
| `productCardA` | `ProductCardA.js` | کلاسیک: تصویر بزرگ، دکمه «افزودن به سبد»، انیمیشن |
| `productCardB` | `ProductCardB.js` | مینیمال: دکمه + شناور روی تصویر، بدون حاشیه |
| `productCardC` | `ProductCardC.js` | فشرده افقی: تصویر کوچک + اطلاعات در یک ردیف |

### بنر

| Variant | فایل | استایل |
|-------|------|--------|
| `bannerA` | `BannerA.js` | Swiper تمام‌عرض با navigation و autoplay |
| `bannerB` | `BannerB.js` | چیدمان Bento: یک بنر بزرگ + دو بنر کوچک |
| `bannerC` | `BannerC.js` | Hero تکی با متن روی تصویر و CTA |

### دسته‌بندی

| Variant | فایل | استایل |
|-------|------|--------|
| `categoriesA` | `CategoriesA.js` | دایره‌های تصویری در گرید |
| `categoriesB` | `CategoriesB.js` | pillهای افقی با اسکرول |
| `categoriesC` | `CategoriesC.js` | کارت تصویری با overlay متن |

### سبد خرید

| Variant | فایل | استایل |
|-------|------|--------|
| `cartA` | `CartA.js` | دو ستونه: لیست کالا + خلاصه سفارش sticky |
| `cartB` | `CartB.js` | تک‌ستونه + نوار پرداخت ثابت پایین |

| آیتم سبد | فایل | استایل |
|----------|------|--------|
| CartItemA | `CartItemA.js` | کارت افقی با کنترل تعداد |
| CartItemB | `CartItemB.js` | ردیف فشرده لیستی |

### ثابت‌ها

همه شناسه‌ها در `src/constants/components.js` تعریف شده‌اند.

### Hook

```js
import { useComponentVariant } from '@/hooks/useComponentVariant';

const variant = useComponentVariant('productCard'); // "productCardA"
```

---

## ۱۱. صفحه اصلی و Section Builder

### homeSections

ترتیب بخش‌های صفحه اصلی از Config می‌آید:

```js
homeSections: ["hero", "categories", "products", "blog"]
```

### Sectionهای موجود

| شناسه | کامپوننت | توضیح |
|-------|----------|--------|
| `hero` | HeroSection | بنر (BannerRenderer) |
| `categories` | CategoriesSection | دسته‌بندی (CategoriesRenderer) |
| `products` | ProductsSection | شبکه محصولات (ProductCardRenderer) |
| `blog` | BlogSection | بلاگ — فقط اگر feature و page فعال باشند |

### جریان رندر

```
HomePageBuilder
    → SectionRenderer({ sections: config.layout.homeSections })
        → HeroSection
        → CategoriesSection
        → ProductsSection
        → BlogSection (شرطی)
```

### تغییر ترتیب بدون کد

```js
// mockApi.js — بیوتی‌لند
homeSections: ["hero", "products", "categories", "blog"]
// محصولات قبل از دسته‌بندی نمایش داده می‌شوند
```

---

## ۱۲. سیستم Feature

### اصل طراحی

هر Feature باید:

- **مستقل** باشد
- **وابستگی حداقلی** داشته باشد
- **قابل حذف** باشد
- **قابل غیرفعال شدن** باشد
- به Feature دیگر **قفل نشود**

### Featureهای تعریف‌شده

| کلید | توضیح فارسی | UI فعلی |
|------|-------------|---------|
| `wishlist` | لیست علاقه‌مندی | آیکون Heart در Header |
| `loyaltyClub` | باشگاه مشتریان | آماده (FeatureRenderer) |
| `wallet` | کیف پول | آیکون Wallet در Header |
| `cashback` | کش‌بک | آماده |
| `luckyWheel` | گردونه شانس | آماده |
| `campaigns` | کمپین‌ها | آماده |
| `reviews` | نظرات | آماده |
| `shareProduct` | اشتراک‌گذاری | آماده |
| `blog` | بلاگ | BlogSection + BlogFeature |

### بررسی فعال بودن

```js
const { isFeatureEnabled } = useSiteConfig();

if (isFeatureEnabled('wishlist')) {
  // نمایش آیکون علاقه‌مندی
}
```

### pages vs features

- `features.blog` → قابلیت بلاگ در سیستم فعال است
- `pages.blog` → صفحه/بخش بلاگ نمایش داده می‌شود
- **هر دو** باید `true` باشند تا `BlogSection` رندر شود

---

## ۱۳. سیستم Theme

### فیلدهای Theme

```js
theme: {
  mode: "light",              // light | dark
  primaryColor: "#E91E63",    // رنگ اصلی
  fontFamily: "Ravi, sans-serif",
  borderRadius: "12px"
}
```

### اعمال Theme

`SiteConfigProvider` در `context/SiteConfigContext.js`:

1. `--color-primary` را روی `document.documentElement` تنظیم می‌کند
2. کلاس `theme-light` یا `theme-dark` را به `body` اضافه می‌کند

### استفاده در Tailwind

کلاس `text-primary`، `bg-primary` و ... از `--color-primary` استفاده می‌کنند.

### Hook

```js
const { primaryColor, mode, themeModeClasses } = useTheme();
```

---

## ۱۴. SEO

SEO بخش **Core** سیستم است و از Config می‌آید.

### پیاده‌سازی

فایل `src/app/page.js`:

```js
export async function generateMetadata() {
  const config = await getSiteConfig();
  return buildMetadataFromConfig(config);
}
```

### فیلدهای SEO

```js
seo: {
  title: "عنوان صفحه",
  description: "توضیحات متا",
  keywords: ["کلمه۱", "کلمه۲"]
}
```

با تغییر Tenant، عنوان تب مرورگر و متا تگ‌ها عوض می‌شوند.

---

## ۱۵. همگام‌سازی قیمت و موجودی

### اصل

> قیمت و موجودی **همیشه** از Micro Server خوانده می‌شوند.  
> Cache طولانی‌مدت نباید باعث نمایش موجودی اشتباه شود.

### فایل `inventorySync.js`

| تابع | نقش |
|------|-----|
| `getSyncedInventory()` | خواندن موجودی با TTL کوتاه (۳۰ ثانیه) |
| `invalidateInventoryCache()` | پاک کردن Cache بعد از تغییر سبد |
| `subscribeToInventoryUpdates()` | placeholder برای WebSocket آینده |
| `validateStockBeforeAdd()` | بررسی موجودی قبل از افزودن به سبد |

### وضعیت

- ساختار آماده است
- Real-Time (WebSocket/SSE) در فاز بعدی پیاده‌سازی می‌شود

---

## ۱۶. صفحات اپلیکیشن

| مسیر | فایل | وضعیت Config-Driven |
|------|------|---------------------|
| `/` | `app/page.js` | ✅ کامل |
| `/cart` | `app/cart/page.js` | ✅ CartRenderer |
| `/[slug]` | `app/[slug]/page.js` | 🔶 جزئی |
| `/category/[category]` | | 🔶 جزئی |
| `/search-result` | | 🔶 جزئی |
| `/checkout` | | 🔶 جزئی |
| `/profile` | | 🔶 جزئی |
| `/orders` | | 🔶 جزئی |

**توضیح:** صفحه اصلی و Layout کاملاً Config-Driven هستند. صفحات داخلی هنوز از `data/api.js` استفاده می‌کنند ولی از Service Layer عبور می‌کنند.

---

## ۱۷. نحوه اجرا و تست

### نصب و اجرا

```bash
npm install
npm run dev
```

مرورگر: `http://localhost:3000`

### Build تولید

```bash
npm run build
npm start
```

### چک‌لیست تست

- [ ] Tenant Switcher — تغییر فروشگاه و مشاهده تفاوت هدر/فوتر/تم
- [ ] کارت محصول — هر Tenant variant متفاوت دارد
- [ ] بنر — اسلایدر / bento / hero
- [ ] سبد خرید — `/cart` با variant A یا B
- [ ] Featureها — wishlist در فشن‌استور، wallet در بیوتی‌لند
- [ ] بلاگ — در الکتروشاپ غیرفعال است
- [ ] SEO — عنوان تب با تغییر Tenant عوض می‌شود

---

## ۱۸. راهنمای توسعه: افزودن قابلیت جدید

### افزودن Tenant جدید

1. شناسه در `constants/tenants.js`
2. آبجکت کامل در `mockApi.js` → `TENANT_CONFIGS`
3. اضافه به `TENANT_LIST` برای TenantSwitcher

### افزودن variant کامپوننت جدید (مثال: ProductCardD)

1. `constants/components.js` → `PRODUCT_CARD_D = 'productCardD'`
2. `components/ui/product-cards/ProductCardD.js`
3. ثبت در `ProductCardRenderer.js` → `CARD_MAP`
4. تنظیم در `TENANT_CONFIGS.layout.components`

### افزودن Feature جدید

1. کلید در `constants/features.js`
2. `features.newFeature: true` در `TENANT_CONFIGS`
3. کامپوننت در `components/features/NewFeature.js`
4. استفاده شرطی: `isFeatureEnabled('newFeature')`

### افزودن Section جدید به صفحه اصلی

1. شناسه در `constants/sections.js`
2. کامپوننت در `components/sections/NewSection.js`
3. ثبت در `SectionRenderer.js` → `SECTION_MAP`
4. اضافه به `homeSections` در Config

### اتصال به Micro Server واقعی

فقط `mockApi.js` را با `fetch` به API واقعی جایگزین کنید.  
Service Layer و UI **دست نخورده** می‌مانند.

---

## ۱۹. کارهای انجام‌شده و باقی‌مانده

### ✅ انجام شده

- معماری Config-Driven کامل
- Mock Micro Server با ۳ Tenant
- SiteConfigContext + Hookها
- Layout System (Header A/B/C, Footer A/B/C)
- Component Variant System (کارت، بنر، سبد، دسته‌بندی)
- Home Page Builder
- Theme Switching
- Tenant Switching
- SEO از Config
- UI واقعی صفحه اصلی
- Service Layer
- ساختار inventorySync
- **Middleware تشخیص Tenant** (subdomain / cookie / query)
- **صفحات داخلی Config-Driven** (دسته، جستجو، محصول)
- **صفحات `/blog` و `/return-policy`** با PageGuard
- **ProductFeatureBar** در جزئیات محصول
- **اعتبارسنجی موجودی** قبل از افزودن به سبد
- **`.env.example`**

### ❌ باقی‌مانده

- اتصال Micro Server واقعی (جایگزینی mockApi با fetch)
- Real-Time همگام‌سازی موجودی (WebSocket)
- Config-Driven کامل checkout، profile، orders
- UI کامل Featureها (luckyWheel، loyaltyClub، ...)
- تست‌های خودکار

---

## ۲۰. سوالات متداول

### چرا Service جدا از mockApi است؟

تا هنگام اتصال Backend، فقط Service را تغییر دهیم و UI و Hookها دست نخورده بمانند.

### چرا Context + Hook؟

Config در کل درخت React در دسترس است. Hook رابط ساده و خوانا برای کامپوننت‌هاست.

### Renderer چیست؟

کامپوننتی که بر اساس Config، یکی از چند variant را انتخاب و رندر می‌کند. مثل یک «کلید برق» برای UI.

### چرا فایل‌های shared هنوز وجود دارند؟

برای **سازگاری با کد قبلی**. مثلاً `ProductCard.js` الان به `ProductCardRenderer` redirect می‌شود.

### ComponentBox چیست؟

باکس رنگی فاز اول POC. دیگر در UI اصلی استفاده نمی‌شود ولی برای تست معماری نگه داشته شده.

### چطور فقط یک فروشگاه را تغییر دهم؟

فقط آبجکت همان Tenant در `TENANT_CONFIGS` داخل `mockApi.js` را ویرایش کنید.

---

## نمودار کلی جریان اپلیکیشن

```
کاربر باز می‌کند localhost:3000
        ↓
layout.js → SiteConfigProvider
        ↓
mockApi.fetchSiteConfig() → SiteConfig
        ↓
Theme اعمال می‌شود (--color-primary)
        ↓
ConfigAppShell → LayoutRenderer
        ↓
HeaderX + FooterY (از Config)
        ↓
page.js → HomePageBuilder
        ↓
SectionRenderer(homeSections)
        ↓
هر Section → Hook → Service → mockApi
        ↓
Renderer → variant مناسب (A/B/C)
```

---

---

## ۲۱. فاز سوم — Middleware و صفحات داخلی

### Middleware (`src/middleware.js`)

Tenant با اولویت زیر تشخیص داده می‌شود:

1. `?tenant=cosmetic-store` در URL
2. Cookie `shopsaz-tenant`
3. Subdomain: `fashion.localhost`، `cosmetic.localhost`، ...
4. پیش‌فرض: `fashion-store`

هدر `x-tenant-id` روی درخواست ست می‌شود تا Server Components همان Tenant را ببینند.

### Subdomainهای تست

| آدرس | Tenant |
|------|--------|
| `fashion.localhost:3000` | fashion-store |
| `cosmetic.localhost:3000` | cosmetic-store |
| `electronics.localhost:3000` | electronics-store |
| `localhost:3000?tenant=...` | هر Tenant |

### PageGuard

صفحاتی که در `pages` غیرفعال‌اند پیام «صفحه در دسترس نیست» نشان می‌دهند:

- `/blog` — نیاز به `pages.blog: true`
- `/return-policy` — نیاز به `pages.returnPolicy: true`

### صفحات به‌روز شده

| مسیر | تغییرات |
|------|---------|
| `/category/[category]` | `useProducts` + `ProductCardRenderer` |
| `/search-result` | `useSearchParams` + Service Layer |
| `/[slug]` | `productService` + `ProductFeatureBar` + `validateStockBeforeAdd` |
| `/blog` | جدید — PageGuard |
| `/return-policy` | جدید — PageGuard |

### فایل‌های جدید فاز ۳

```
src/middleware.js
src/utils/tenant.js
src/services/tenantResolver.js
src/components/shared/PageGuard.js
src/components/templates/CategoryPageClient.js
src/components/templates/SearchResultClient.js
src/components/templates/BlogPageClient.js
src/components/templates/ReturnPolicyPageClient.js
src/components/features/ProductFeatureBar.js
.env.example
```

---

*آخرین به‌روزرسانی: فاز ۳ — Middleware Tenant + صفحات داخلی Config-Driven*
