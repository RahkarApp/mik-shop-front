/** Customer-facing authentication messages; backend codes remain on the original error. */
export function isOtpRateLimited(error) {
  return error?.rateLimited === true || error?.status === 429 || /RATE_LIMIT|COOLDOWN|TOO_MANY/.test(error?.code || '') ||
    /wait before requesting another code/i.test(error?.message || '');
}

export function authErrorMessage(error, action = 'request') {
  const code = String(error?.code || '');
  if (isOtpRateLimited(error)) return action === 'verify'
    ? 'تعداد تلاش‌های شما زیاد شده است. کمی صبر کنید و دوباره امتحان کنید.'
    : action === 'request' ? 'برای دریافت دوباره کد تأیید، کمی صبر کنید.' : 'تعداد درخواست‌های شما زیاد شده است. کمی صبر کنید و دوباره امتحان کنید.';
  if (action === 'verify' && !(error?.status >= 500) && code !== 'INVALID_BACKEND_RESPONSE') {
    if (/EXPIRED/.test(code) || error?.status === 410) return 'اعتبار کد تأیید تمام شده است. کد تازه بگیرید.';
    if (/INVALID|INCORRECT|MISMATCH/.test(code) || [400,401,422].includes(error?.status)) return 'کد تأیید درست نیست یا اعتبار آن تمام شده است. کد را بررسی کنید یا کد تازه بگیرید.';
  }
  if (action === 'request' && /PHONE|MOBILE/.test(code)) return 'شماره موبایل را بررسی کنید و دوباره تلاش کنید.';
  if (error?.status === 401) return 'برای ادامه خرید، وارد حساب کاربری شوید.';
  if (error?.status === 403) return 'در حال حاضر امکان انجام این درخواست برای حساب شما وجود ندارد.';
  if (action === 'checkout') return 'بررسی ورود به حساب انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.';
  if (action === 'profile') return 'ذخیره اطلاعات حساب انجام نشد. کمی بعد دوباره تلاش کنید.';
  return action === 'verify'
    ? 'تأیید کد انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.'
    : 'درخواست کد تأیید کامل نشد. کمی بعد دوباره تلاش کنید.';
}
