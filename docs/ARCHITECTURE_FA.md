# معماری پوسته وب فروشگاه‌ساز

هدف: یک قالب ثابت برای تعداد نامحدود Store معتبر. Backend با `Host` تشخیص Store می‌دهد؛ هیچ سازمان/نیروگاه/Socket از پروژه هوربان منتقل نشده است.

```text
src/app/page + route (Next Server Route برای SEO مجاز به SSR Service)
  → Component (UI و تعامل، بدون fetch مستقیم به Backend)
  → Hook / Context (state, loading, error, store scope, actions)
  → Domain Service (productService, shopService, siteConfigService)
  → services/api.js (HTTP فقط + Demo explicit)
  → utils/backendRoutes.js (mapping قرارداد) + utils/backendAdapter.js (pure data mapping)
  → same-origin Next route /api/shop/[...path] (Host preserving proxy)
  → mik-shop Backend
```

- `src/constants/config.js`: ثابت‌های UI و Demo legacy؛ Config فروشگاه واقعی از Backend است، نه این فایل.
- `src/context/SiteConfigContext.js`: دریافت Config، دامنه/Brand، Theme، Error و Tenant state.
- `src/components/shared/CartContext.js`: پیش‌نویس سبد مستقل Store در LocalStorage، **منبع قیمت و موجودی نیست**.
- `src/hooks/useShopActions.js`: متدهای حساب/سفارش/تعامل با Product با Tenant فعال؛ UI Service را مستقیم نمی‌شناسد.
- `src/hooks/useProducts.js`, `useCategories.js`, `useBanners.js`, `useOrders.js`: خواندن async با cleanup و error.
- `src/services/api.js`: Transport HTTP یگانه، GET single-flight، 15s timeout، بدون Retry Mutation، بدون Mock در real، Bearer opaque customer session به تفکیک Host.
- `src/utils/backendRoutes.js`: مبدل نام Endpoint قبلی فرانت به مسیر حقیقی Backend. فقط مسیرهای رسمی `SHOP-API.html` را به API Shop می‌فرستد.
- `src/utils/backendAdapter.js`: تبدیل سند Store/Product/Invoice به UI؛ `null` ناشناخته صفر نمی‌شود.
- `src/app/api/shop/[...path]/route.js`: ثابت نگه‌داشتن مقصد سرور، Forwarding `Host` معتبر، Authorization، idempotency؛ تنها پس از کنترل ingress مورد اعتماد.
- `src/services/mockApi.js` و `src/data/store.js`: فقط داده آزمایشی در mode=demo؛ امکان fallback پنهانی ممنوع.
- Layout و Header/Footer/Card صرفاً Variant A. فایل‌های Variantهای دیگر که فعال نبودند حذف شدند؛ رنگ و متن قابل تنظیم‌اند.
- قوانین رسمی: `AGENTS.md`, `rules/10-web-storefront-project.mdc`, `rules/20-refactor.mdc`, `docs/BACKEND_CONNECTION_GUIDE_FA.md`, `docs/PROJECT_HISTORY_FA.md`.

استثنای معنادار: Routeهای Next Server Component مثل Product/Metadata می‌توانند فقط برای SSR مستقیم Service بخوانند؛ React Hooks روی سرور قابل استفاده نیستند. Proxy و Domain Service همچنان Transport را یکپارچه نگه می‌دارند.

**محدودیت صریح:** Config/Quote/Payment در مستند رسمی جدید معرفی و پیاده‌شده توصیف شده‌اند؛ اما E2E این فرانت با Backend زنده تأیید نشده است. برای هر تغییر آینده ابتدا قرارداد، فلو، Hook، Service، Component و تست را هم‌زمان بررسی کنید.
