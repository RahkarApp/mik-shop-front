/** Pure cart helpers: a draft never authorizes checkout price or inventory. */
export function cartItemKey(product, selectedFeatures = {}) {
  const features = Object.entries(selectedFeatures || {}).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify([String(product.id), product.proUID == null ? null : String(product.proUID), features]);
}

export function sanitizeCart(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item && item.id != null &&
    Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 1000 &&
    typeof item.cartItemId === 'string' && item.cartItemId.length < 2000);
}

/** null means the estimate is unknown, not zero or free shipping. */
export function cartEstimate(items) {
  if (!items.length) return 0;
  if (!items.every(item => item.price !== null && item.price !== undefined && item.price !== '' &&
    Number.isSafeInteger(Number(item.price)) && Number(item.price) >= 0)) return null;
  const sum = items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  return Number.isSafeInteger(sum) ? sum : null;
}
