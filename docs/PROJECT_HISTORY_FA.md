# تاریخچه و وضعیت — Shapsaz
## 2026-10-21: بازسازی معماری اتصال فروشگاه
- مبنا: `shapsaz.zip` ارسالی؛ Next.js 15/React 19/JS. پروژه هوربان صرفاً مرجع روش توسعه و قوانین است، نه Feature.
- وضعیت سابق: چند Tenant ثابت `fashion/cosmetic/electronics`، Mock MicroServer وابسته به وضعیت سراسری، Product/Order و Profile نمایش آزمایشی، Checkout ثبت موفقیت تصادفی و تأخیر مصنوعی، برخی فیلترها از Static Data.
- انتقال Network واقعی به `src/services/api.js`؛ Serviceهای دامنه `productService`, `siteConfigService`, `shopService`. DEMO mode صریح بدون fallback.
- هویت Store در Real وابسته به Host و Backend؛ Tenant Switch فقط Demo. Cart در LocalStorage با namespace Store. Checkout Quote/Order اکنون درخواست سرور و پاسخ Order ID واقعی می‌خواهد.
- Orders، Invoice، Profile/Address، Login OTP، Wishlist، FAQ/Contact/About، Payment Result و Config favicon/SEO/Logo به مسیرهای اتصال جدید تغییر یافتند.
- هیچ Socket اضافه نشد؛ فایل legacy WebSocket-placeholder موجودی حذف و Inventory با REST پیاده شد.
- وضعیت اتصال: API backend ارائه نشده؛ URL/Contract پیشنهادی تا Approval نهایی است. Demo برای ارزیابی UI، نه اثبات پرداخت واقعی.
- ریسک‌های باز: Build/مرورگر/Backend واقعی در این محیط تأیید نشده؛ انطباق داده Blog و Facetهای Sort/Filter و Quote methods نهایی، Logout/CSRF، Gateway و کامل بودن همه تعامل‌های قدیمی نیاز به QA و توافق backend دارد.

## 2026-10-22 — انطباق با بک‌اند mik-shop
- بررسی سورس Backend، بدون تغییر Backend.
- اضافه‌کردن راهنمای دقیق API، معماری و لیست اصلاحات لازم برای تیم سرور.
- Proxy هم‌دامنه و Mapping Endpoint و Adapter؛ حذف Variantهای غیرفعال.

## بازبینی تکمیلی ۱۴۰۵/۰۷/۳۰
نتایج اصلاح و تست‌های این مرحله در `docs/REVIEW_20261022_FA.md` مستند است. مرجع پیشین و مرز Frontend/Backend حفظ شده است.


## ۱۴۰۵/۰۸/۰۲ — تطبیق با مستند رسمی بک‌اند
مرجع جدید `docs/SHOP-API.html`؛ اصلاح Auth، Tenant، Envelope، Pagination، Quote، سفارش‌های ناهمزمان، Idempotency و وضعیت‌های مالی. بک‌اند تغییر نکرد. Build و E2E باید روی سرور واقعی آزمایش شوند. جزئیات در `docs/API_ALIGNMENT_20261024_FA.md`.
