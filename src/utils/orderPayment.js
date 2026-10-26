const FINAL_PROCESSING_STATUSES = new Set(['CONFIRMED', 'CANCELLED', 'ACTION_REQUIRED']);

export function paymentHref(order, now = Date.now()) {
  if (!order || order.processingStatus !== 'AWAITING_PAYMENT' || order.paymentRequired === false || order.paymentState !== 'PENDING') return '';
  const expiresAt = Date.parse(order.paymentExpiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= now || typeof order.paymentUrl !== 'string') return '';
  try {
    const url = new URL(order.paymentUrl);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

export function orderNeedsPolling(order, now = Date.now()) {
  if (!order || FINAL_PROCESSING_STATUSES.has(order.processingStatus)) return false;
  if (order.paymentState === 'PAID') return true;
  if (order.processingStatus === 'PROCESSING') return true;
  if (order.processingStatus !== 'AWAITING_PAYMENT' || order.paymentRequired === false) return false;
  if (order.paymentUrl) return false;
  const expiresAt = Date.parse(order.paymentExpiresAt);
  return !Number.isFinite(expiresAt) || expiresAt > now;
}
