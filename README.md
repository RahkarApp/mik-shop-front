# Shapsaz — پوسته وب فروشگاه‌ساز

این مخزن فقط UI یک مدل قالب فروشگاه است. اطلاعات هر فروشگاه شامل اسم، لوگو، رنگ، فاوآیکون، فوتر، محصولات و ... از API می‌آیند. فروشگاه از دامنه در Backend شناسایی می‌شود و هیچ Socket وجود ندارد.

## اجرای توسعه

```bash
npm ci
cp .env.demo.example .env.local
npm run dev
npm run check
```

برای سرور واقعی، از `.env.example` استفاده کنید و `NEXT_PUBLIC_DATA_MODE=real` و `SHOP_BACKEND_ORIGIN` (فقط در سرور)، `SHOP_ALLOWED_HOSTS` و `NEXT_PUBLIC_APP_VERSION` را تنظیم کنید. **در Production از Demo استفاده نشود.** حالت real هیچ fallback به داده آزمایشی ندارد.

### پنج سند رسمی
`AGENTS.md`، `rules/10-web-storefront-project.mdc`، `rules/20-refactor.mdc`، `docs/BACKEND_CONNECTION_GUIDE_FA.md`، `docs/PROJECT_HISTORY_FA.md`.

قرارداد رسمی تیم بک‌اند در `docs/SHOP-API.html` ذخیره شده است. Checkout و پرداخت در بک‌اند مستند شده‌اند، اما اتصال و پرداخت واقعی این نسخه هنوز E2E آزمایش نشده است.


## انطباق با mik-shop — 2026-10-22
برای اتصال واقعی ابتدا `docs/BACKEND_CONNECTION_GUIDE_FA.md` و `docs/BACKEND_CHANGE_REQUEST_FA.md` را به تیم بک‌اند بدهید. شناسایی Store در وب بر اساس Host و در Telegram نیازمند اعتبارسنجی Bot↔Store است. مسیرهای رسمی در `docs/SHOP-API.html` جایگزین فرضیه‌های قبلی شده‌اند؛ Demo صریح با Real یکسان نیست. `npm run check` کنترل معماری و تست‌های قرارداد محلی را اجرا می‌کند.
