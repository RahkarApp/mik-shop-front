/**
 * توابع فرمت مشترک — استفاده در تمام variantها
 */

/** تبدیل اعداد انگلیسی به فارسی */
export function toPersianDigits(value) {
  if (value === undefined || value === null) return '';
  const map = { 0: '۰', 1: '۱', 2: '۲', 3: '۳', 4: '۴', 5: '۵', 6: '۶', 7: '۷', 8: '۸', 9: '۹' };
  return String(value).replace(/[0-9]/g, (d) => map[d]);
}

export function normalizeDigits(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, digit =>
    String(digit.charCodeAt(0) - (digit >= '۰' ? 0x06f0 : 0x0660)));
}

/** فرمت قیمت با جداکننده هزارگان */
export function formatPrice(price) {
  if (price === undefined || price === null || price === '' || !Number.isFinite(Number(price))) return '—';
  return toPersianDigits(Number(price).toLocaleString('en-US'));
}

/** Always display the currency actually returned by the store/quote; never infer it. */
export function formatMoney(value, currency) {
  if (value === null || value === undefined || value === '' || !Number.isSafeInteger(Number(value)) || Number(value) < 0) return '—';
  const unit = currency === 'IRR' ? 'ریال' : currency === 'TOMAN' ? 'تومان' : 'واحد پول اعلام‌نشده';
  return `${formatPrice(value)} ${unit}`;
}
