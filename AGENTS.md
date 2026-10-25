# قانون ۱ از ۳ — اصول همکاری و توسعه تیم (Shapsaz Web Storefront)

> این فایل نقطه ورود عامل برنامه‌نویسی (Codex/AI) است. روش توسعه از **هوربان** الگو گرفته، نه دامنه و امکانات آن. این پروژه **پوسته وب یک فروشگاه‌ساز چندفروشگاهی** است؛ نه پنل مدیریت، نه Telegram Mini App و نه بک‌اند فروشگاه‌ساز.

## پیش از هر تغییر (اجباری)

1. ابتدا همین `AGENTS.md` و `rules/10-web-storefront-project.mdc` را بخوان. **فقط برای Refactor، پاکسازی و انتقال مسئولیت‌ها**، `rules/20-refactor.mdc` را نیز بخوان.
2. کد واقعی را از Route آغاز کن و تمام مسیر `Page → Component → Hook/Context → Domain Service → api.js → Backend`، مصرف‌کنندگان، Stateها، خطاها و تست‌های همان قابلیت را دنبال کن. صرفاً بر اساس نام فایل یا مستند کد نزن.
3. قرارداد Backend را به سه وضعیت **موجود در سورس، موجود اما معیوب، و نیازمند توسعه** تفکیک کن. موجود بودن Route به معنای قابل‌استفاده بودن عملیاتی نیست؛ هر اختلاف را دقیق گزارش کن.
4. دامنه کار، Baseline رفتار و فایل‌های درگیر را قبل از ویرایش روشن کن. برای درخواست کوچک تغییر سراسری نده.

## سبک کدنویسی و مرز مسئولیت‌ها

- مانند یک **Senior Developer آموزشی** کد بنویس: JavaScript خوانا، نام‌های واضح، توابع کوچک با دلیل روشن، تعداد فایل حداقلی و کامنت کوتاه فقط برای تصمیم غیر بدیهی. از TypeScript و بازنویسی نمایشی پرهیز کن.
- `Page`: مرز Route، SEO/SSR مجاز و ترکیب صفحه؛ Page دیگر را Import نکند. **استثنای SSR:** Server Component ممکن است برای Metadata و داده اولیه مستقیماً Domain Service را صدا بزند؛ این استثنا راه دورزدن `api.js` نیست.
- `Component`: نمایش و تعامل محلی؛ بدون Network، Mock، قیمت‌گذاری یا منطق Backend. `Hook/Context`: State، چرخه درخواست، Loading/Error، Tenant، Draft و هماهنگی عملیات. `Domain Service`: Endpoint و کار دامنه بدون React/JSX. `src/services/api.js`: محل یگانه Transport، هدر، Timeout، Error و تفکیک Real/Demo. `Utility`: تبدیل خالص و قابل تست.
- API Factory، Repository/Base Class، Global State Manager، Generic CRUD و فایل/لایه جدید بدون نیاز واقعی نساز. بزرگ بودن فایل به‌تنهایی دلیل تقسیم نیست؛ کپی سبک هوربان به معنی کپی ساختار Monitoring نیست.
- UI، RTL، فونت، رنگ، فاصله، Responsiveness، Accessibility، URLهای فعلی و رفتار کاربر را بدون درخواست صریح تغییر نده. داده ناموجود `null`/نامعلوم است، نه صفر یا قیمت/موجودی حدسی.

## قواعد غیرقابل‌مذاکره محصول و امنیت

- **یک قالب ثابت** برای همه فروشگاه‌ها؛ نام، لوگو، رنگ، Favicon، Footer، SEO و Feature/Page Flags از Backend هر فروشگاه می‌آیند. انتخاب چند Layout از Backend فعال نکن.
- در Real، **فروشگاه از Host معتبر درخواست** مشخص می‌شود؛ `tenant` در Query/Cookie یا انتخاب Mock فقط Demo است. داده، احراز هویت، سبد و پاسخ Scope فروشگاه دیگر را نمایش نده. Next Proxy فقط مقصد ثابت و Host تأییدشده را Forward کند؛ از Host یا URL دلخواه کلاینت به‌عنوان مجوز اعتماد نکن.
- **فقط REST/API؛ هیچ Socket، SSE یا اتصال زنده** اضافه نکن. `NEXT_PUBLIC_DATA_MODE=real` در مسیرهای معمولی Real-only و دارای خطای واقعی است؛ فقط `/demo` و زیرمسیرهای آن Mock مستقل دارند. نبود API اختیاری یا ضروری را با موفقیت جعلی پنهان نکن.
- Backend منبع نهایی قیمت، ارز، موجودی هر Variant (`proUID`)، تخفیف، حمل، مالیات، Quote، سفارش، پرداخت و مالکیت داده است. سبد فرانت Draft است. `POST /order` قدیمی برای ثبت سفارش امن استفاده نشود؛ به قرارداد جدید Checkout مراجعه کن.
- سفارش و پرداخت Mutation مالی هستند: **retry/replay خودکار ممنوع**؛ Idempotency و تصمیم نهایی سمت سرور. بازگشت از درگاه، اثبات پرداخت موفق نیست. Secret/JWT/شماره OTP در Log، کامنت یا نمونه عمومی نگذار.
- هیچ تغییری در مخزن Backend مجاز نیست مگر با اجازه صریح؛ درخواست اصلاح Backend را مستند کن، نه اینکه قرارداد حدسی را به‌صورت اجراشده معرفی کنی.

## روش اعتبارسنجی و تحویل

1. تغییر را در کوچک‌ترین Scope انجام بده؛ برای باگ مهم تا حد امکان تست بازتولید و Regression اضافه کن.
2. Diff را از جهت Route/SSR، Tenant، Permission، Cart/Variant، Quote/Payment، Branding/Flags و Demo مرور کن.
3. `npm run check` را اجرا کن؛ در صورت وجود وابستگی‌ها `npm run build`، سپس صفحات حساس در مرورگر و اتصال واقعی را مستقلاً تست کن. **Pass شدن تست استاتیک، ادعای Build/Production نیست.**
4. فایل‌های تغییرکرده، تست واقعی، موارد تأییدنشده و درخواست‌های Backend را صریح گزارش کن؛ تغییرات مهم را در تاریخچه Git ثبت کن.


## API رسمی (مرجع تحویلی تیم بک‌اند ۲۰۲۶/۱۰/۲۳)
- پروژه وب Shop: `GET /store/config`, `/product`, `/product/category`, `/product/:id`, `/shop-methods` با `Host` معتبر؛ پاسخ `{status:true,data}` و خطا `{status:false,code,message,retryable}`.
- احراز هویت `POST /auth/otp/request` (challengeId) → `POST /auth/otp/verify` (accessToken) → `GET/PUT /profile` (revision، Idempotency-Key).
- خرید `POST /checkout/start` → `GET /checkout/:id` تا ACTIVE → `POST /checkout/quote` → `POST /checkout/orders` → `GET /orders/:id`. سفارش 202 یعنی پذیرفته‌شده، **نه پرداخت موفق**.
- bearer مشتری در Host همان فروشگاه؛ Host را با allowlist/Ingress معتبر به سرور ثابت منتقل کن. اقلام با `variantId` واقعی و `quantity` رشته دقیق‌اند. اعداد پولی تومان، null نامعلوم.
- سرویس مدیریت فروشگاه (Gateway) جدا از UI این مخزن است. فرم‌های مدیریت و APIهای آن را وارد پوسته مشتری نکن.

## اجرای Demo و کنترل صحت
- تنظیمات اجرا فقط در `.env` نگهداری می‌شوند؛ فایل Example، Deploy یا `.env.local` نساز. `NEXT_PUBLIC_DATA_MODE=demo` کل برنامه را آزمایشی می‌کند، هم `/` هم `/demo`. تغییر حالت در `.env` نیازمند restart سرور است.
- در `real` مسیر `/demo` و زیرمسیرهای آن **مستقل و فقط آزمایشی** هستند؛ مسیرهای معمولی فقط Real می‌مانند. `NEXT_PUBLIC_DATA_MODE=demo` همچنان کل برنامه را Demo می‌کند؛ هیچ fallback پنهانی از خطای Real به Demo وجود ندارد.
- `npm run check` قبل از تحویل؛ `npm ci` (پس از ایجاد Lockfile معتبر با نصب آنلاین)، `npm run build`، اجرای مرورگر و API حقیقی باید مستقلاً بررسی شوند. از موفقیت ظاهری تست به معنی تأیید E2E/امنیت نتیجه نگیر.
- سه فایل قانون/راهنما کافی‌اند؛ از ساخت فایل MD موازی اجتناب کن. فایل تنظیمات `.env` و Test Fixtureهای JSON، Rule یا راهنما نیستند.

## ثبت اعتبارسنجی Wildcard فروشگاه — ۲۰۲۶/۱۰/۲۵
- `*.shop.p.mikcore.ir` در allowlist فقط یک برچسب فروشگاه را می‌پذیرد؛ Host در Proxy و SSR با منطق مشترک بررسی می‌شود و مقصد بک‌اند ثابت می‌ماند. import ماژول HTTP در Proxy نیز برای build اصلاح شد.
- `npm run check`: هر ۳۸ تست موفق؛ build و آزمون HTTP روی production محلی با بک‌اند آزمایشی، شامل دو Host مستقل، رد دامنه غیرمجاز، SSR، Demo و آدرس خام موفق بودند. بررسی بصری مرورگر انجام نشد.
- قرارداد Host و `/store/config` موجود است؛ آزمون Host آزمایشی `wildcard-probe.shop.p.mikcore.ir` پاسخ HTML با وضعیت 503 داد. بررسی بعدی دامنه واقعی `test.shop.p.mikcore.ir` روی `/` و `/api/shop/store/config` پاسخ JSON با وضعیت 404 و کد `ROUTE_NOT_FOUND` داد؛ HTML فرانت Next.js ارائه نمی‌شود. درخواست `/store/config` روی همین دامنه و روی Origin ثابت `https://shop.test.mikcore.ir` با `Host: test.shop.p.mikcore.ir` هر دو 404 و `SHOP_NOT_FOUND` دادند. لازم است Reverse Proxy/CDN مسیر دامنه فروشگاه را با حفظ Host به فرانت Next.js بفرستد و ثبت/Binding این دامنه و حفظ Host در Backend/Ingress بررسی شود. تنظیمات زیرساخت در این مخزن موجود نیست؛ تغییری در بک‌اند انجام نشد و Endpoint جدیدی لازم معرفی نشده است.
