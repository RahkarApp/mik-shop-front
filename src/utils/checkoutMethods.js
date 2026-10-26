export function normalizeCheckoutMethods(data) {
  if (!Array.isArray(data?.shippingMethods) || !Array.isArray(data?.paymentMethods)) {
    throw Object.assign(new Error('دریافت روش‌های خرید کامل نشد.'), {code:'INVALID_BACKEND_RESPONSE'});
  }
  if ([...data.shippingMethods,...data.paymentMethods].some(method => !method || typeof method !== 'object' || Array.isArray(method))) {
    throw Object.assign(new Error('دریافت روش‌های خرید کامل نشد.'), {code:'INVALID_BACKEND_RESPONSE'});
  }
  const shippingMethods = data.shippingMethods.map(method => ({...method, id:String(method.shippingMethodId ?? method.id ?? '')}));
  const paymentMethods = data.paymentMethods.map(method => ({...method, id:String(method.id ?? '')}));
  if ([...shippingMethods,...paymentMethods].some(method => !method.id || typeof method.name !== 'string' || !method.name.trim())) {
    throw Object.assign(new Error('دریافت روش‌های خرید کامل نشد.'), {code:'INVALID_BACKEND_RESPONSE'});
  }
  if (new Set(shippingMethods.map(method=>method.id)).size !== shippingMethods.length || new Set(paymentMethods.map(method=>method.id)).size !== paymentMethods.length) {
    throw Object.assign(new Error('دریافت روش‌های خرید کامل نشد.'), {code:'INVALID_BACKEND_RESPONSE'});
  }
  return {shippingMethods:shippingMethods.filter(method => method.active === true), paymentMethods};
}

/** The published order contract supports online only; a Quote can revoke catalog availability. */
export function checkoutPaymentOptions(methods, quote) {
  return methods.map(method => {
    const quoted = quote?.paymentMethods?.find(option => option.id === method.id);
    const enabled = method.id === 'online' && method.enabled === true &&
      (!quote || quoted?.enabled === true && quote.orderSubmissionAvailable === true);
    return {...method, enabled, detail:enabled ? method.description || '' : method.reason === 'PAYMENT_NOT_CONFIGURED' || quoted?.reason === 'PAYMENT_NOT_CONFIGURED'
      ? 'پرداخت آنلاین فروشگاه فعلاً فعال نیست.' : 'این روش پرداخت فعلاً قابل استفاده نیست.'};
  });
}
