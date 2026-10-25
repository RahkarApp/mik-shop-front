# استقرار شاپ‌ساز روی Mikcore — ۲۵ اکتبر ۲۰۲۶

- دامنه عمومی فرانت: `https://shop.p.mikcore.ir/`
- فرایند Next.js روی پورت داخلی: `3300`
- Backend سرویس Shop: `https://shop.test.mikcore.ir/`
- حالت عملیاتی: `NEXT_PUBLIC_DATA_MODE=real`، بدون fallback به Demo.

## اجرای پیشنهادی

1. `cp .env.deploy.example .env.production` (در ویندوز از `Copy-Item` استفاده شود).
2. در صورت نیاز، فهرست `SHOP_ALLOWED_HOSTS` را فقط با دامنه‌های واقعاً معتبر و تأییدشده تکمیل کنید.
3. `npm ci`، سپس `npm run check`، سپس `npm run build` و `npm run start`.
4. reverse proxy HTTPS باید درخواست `shop.p.mikcore.ir` را به `127.0.0.1:3300` هدایت کند و `Host` معتبر اصلی را حفظ کند. آدرس upstream ثابت می‌ماند؛ آن را از Host کاربر نسازید.

## شرط مهم برای تشخیص فروشگاه

Shop Backend بر اساس Host فروشگاه را انتخاب می‌کند. `shop.p.mikcore.ir` در Backend باید یکی از hostnameهای تخصیص‌یافته و فعال فروشگاه باشد، وگرنه پاسخ 404/503 قابل انتظار است. برای سرویس‌دهی چندفروشگاهی با دامنه‌های متفاوت، این دامنه‌ها علاوه بر DNS/TLS باید در registry دامنه Shop ثبت و در لایه ورودی معتبر شناخته شوند. `SHOP_TRUSTED_HOST_INGRESS` را بدون اعتبارسنجی سمت ingress روشن نکنید. `X-Forwarded-Host` دلخواه یا شناسه فروشگاه در Query مبنای تشخیص نیست.

## امنیت و آزمون

- مقدار `SHOP_BACKEND_ORIGIN` فقط سمت سرور است؛ URL داخلی یا secrets را با `NEXT_PUBLIC_` منتشر نکنید.
- اتصال وب `/api/shop/...` → API ثابت Shop است و توکن opaque مشتری با Bearer ارسال می‌شود.
- سرویس Shop پاسخ‌های مختلف 404/503 در صورت مشکل Tenant/فعال‌بودن می‌دهد؛ 401 هنگام احراز هویت معتبر بررسی شود.
- `NEXT_PUBLIC_*` در Build وارد Bundle کلاینت می‌شوند. هنگام تغییر تنظیمات محیطی که عمومی‌اند، Build جدید لازم است.
- موفقیت اتصال دامنه/SSL/REST/پرداخت تا اجرای آزمایش با زیرساخت واقعی تأیید نشده است.
