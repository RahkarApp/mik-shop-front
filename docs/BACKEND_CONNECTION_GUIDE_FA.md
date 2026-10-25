# قرارداد رسمی اتصال شاپ‌ساز وب — ۲۴ اکتبر ۲۰۲۶

**مرجع اصلی تیم بک‌اند: `docs/SHOP-API.html`** (همان فایل دریافتی، بدون تغییر). در تعارض، قرارداد رسمی Backend اولویت دارد؛ این سند صرفاً راهنمای فرانت است.

## هویت فروشگاه و Transport

- فرانت عمومی از API سرویس Shop استفاده می‌کند؛ API مدیریت کسب‌وکار در Gateway و خارج از Scope پوسته مشتری است.
- Tenant فقط از `Host` معتبر در ingress/سرور تعیین می‌شود؛ `X-Forwarded-Host`, `shopId`, `businessId` کلاینت هیچ اختیاری برای تغییر آن ندارند.
- درخواست‌های مرورگر از `/api/shop/...` به Backend ثابت عبور می‌کنند. Node HTTP request باید Host معتبر را حفظ کند؛ مقصد هرگز با Host کاربر ساخته نشود.
- توکن مشتری opaque با `shop_` آغاز می‌شود و با `Authorization: Bearer ...` می‌رود؛ نه JWT مدیر. هدر `X-App-Version` واقعی ارسال می‌شود.
- پاسخ عمومی: `{status:true,data:...}`؛ خطا: `{status:false,code,message,retryable}`؛ قیمت تومان صحیح، مقدار موجودی رشتهٔ دقیق، null نامعلوم.

## مسیرها

| عملیات | مسیر منتشرشده | نکته |
|---|---|---|
| دریافت کانفیگ | `GET /store/config` | `shopId`، `branding.logoUrl`، `branding.primaryColor`، یک `storefront-v1` |
| دسته‌بندی | `GET /product/category?limit=&after=` | صفحه‌بندی cursor؛ `items,nextCursor` |
| محصولات | `GET /product?limit=&after=&categoryId=&search=` | جست‌وجوی prefix، بدون sort/regex آزاد |
| جزئیات | `GET /product/:productId?after=` | ادامهٔ تنوع بیش از ۵۰؛ `proUID` شناسهٔ PIM واقعی |
| روش ارسال/پرداخت | `GET /shop-methods` | بدون روش ارسال فرضی؛ فقط online در صورت فعال بودن |
| OTP | `POST /auth/otp/request` | `{phone}` ⇒ `challengeId` واقعی، resendAfterSeconds |
| تأیید OTP | `POST /auth/otp/verify` | `{challengeId,code,name?}` ⇒ `accessToken`, `requiresName`,`profilePending` |
| پروفایل | `GET/PUT /profile` | `expectedRevision` و `Idempotency-Key` برای PUT؛ شماره با این مسیر عوض نمی‌شود |
| نشانی | `GET /addresses` | تغییر و حذف از PUT /profile با فهرست کامل و revision |
| رزرو | `POST /checkout/start` | `{items:[{productId,variantId,quantity:string}]}` + Idempotency-Key |
| پیگیری رزرو | `GET /checkout/:id` | تا ACTIVE؛ RESERVING خرید موفق نیست |
| ویرایش رزرو | `PUT /checkout/:id/items` | `expectedRevision` + Idempotency-Key |
| لغو رزرو | `POST /checkout/:id/cancel` | فقط رزرو ACTIVE تأییدنشده |
| Quote | `POST /checkout/quote` | `{checkoutId,shippingMethodId,addressId?}` + Idempotency-Key |
| سفارش | `POST /checkout/orders` | `{checkoutId,quoteId,paymentMethod:"online"}` + Idempotency-Key ⇒ 202 `{order,replayed}` |
| سوابق/جزئیات | `GET /orders`, `GET /orders/:id` | `PROCESSING`, `AWAITING_PAYMENT`, `ACTION_REQUIRED`, `CONFIRMED` |

- بر خلاف Mini App تلگرام، Quote **رزرو جدید نمی‌سازد**؛ checkout/start یک رزرو آغاز کرده است.
- پس از `202` لینک پرداخت ممکن است null باشد؛ جزئیات همان سفارش را بخوانید. پردازش سفارش، پرداخت و تحویل مستقل‌اند. نتیجه `success` در URL معتبر نیست.
- Features فاقد API در سرور (wishlist, reviews, blog, coupons, returns, COD) باید در Config خاموش بمانند؛ فرانت نباید به‌جای سرور موفقیت بسازد.
- محدودیت فعلی: آپلود رسانه، مدیریت تنظیمات فروشگاه، تخصیص انبار و دامنه در **اپ مدیریتی Gateway** است، نه این پوسته عمومی.

## راه‌اندازی

`NEXT_PUBLIC_DATA_MODE=real`، `SHOP_BACKEND_ORIGIN` (فقط سرور)، `SHOP_ALLOWED_HOSTS` یا ingress معتبرِ ثبت دامنه و `NEXT_PUBLIC_APP_VERSION` را تنظیم کنید. در Demo از `.env.demo.example` استفاده کنید. هیچ Socket نیاز نیست.

نسخهٔ قرارداد: بررسی ۲۰۲۶/۱۰/۲۳؛ منبع HTML رسمی بک‌اند.
