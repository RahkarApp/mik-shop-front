/** Pure cart helpers: a draft never authorizes checkout price or inventory. */
export function cartItemKey(product, selectedFeatures = {}) {
  const features = Object.entries(selectedFeatures || {}).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify([String(product.id), product.proUID == null ? null : String(product.proUID), features]);
}

export function purchaseStorageScope(hostname, tenantId, demo) {
  // Preserve existing Real checkout intents when deploying; Demo tenants share a host.
  return demo ? `demo:${hostname}:${tenantId}` : `real:${hostname}`;
}

/** A single SKU needs no choice, but its backend identifier must still be retained. */
export function productSelection(product, selectedFeatures) {
  const variants = product.variants || [];
  const features = product.features || [];
  const automatic = selectedFeatures === undefined;
  const selection = automatic
    ? Object.fromEntries(features.filter(f => f.options?.length === 1).map(f => [f.name, String(f.options[0].value)]))
    : selectedFeatures;
  const pairs = Object.entries(selection || {});
  const matches = variants.filter(v => (v.properties || []).length === pairs.length &&
    pairs.every(([name, value]) => v.properties.some(p => p.name === name && String(p.value) === String(value))));
  const variant = automatic && variants.length === 1 ? variants[0] : matches.length === 1 ? matches[0] : null;
  const resolved = automatic && variant
    ? Object.fromEntries((variant.properties || []).map(p => [p.name, String(p.value)])) : selection || {};
  const requiresSelection = automatic
    ? variants.length > 1 || features.some(f => f.options?.length > 1)
    : features.some(f => !Object.hasOwn(resolved, f.name));
  return {variant, selectedFeatures: resolved, requiresSelection};
}

export function findCartItem(cart, product, selectedFeatures) {
  const selection = productSelection(product, selectedFeatures);
  if (selection.requiresSelection) return null;
  const sku = product.proUID ?? selection.variant?.proUID;
  return cart.find(item => String(item.id) === String(product.id) &&
    (sku == null || String(item.proUID) === String(sku)) &&
    cartItemKey({...item, proUID: null}, item.selectedFeatures) ===
      cartItemKey({...product, proUID: null}, selection.selectedFeatures)) || null;
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const {product, selectedFeatures = {}} = action.payload;
      if (product?.id == null) return state;
      const cartItemId = cartItemKey(product, selectedFeatures);
      const existing = state.find(item => item.cartItemId === cartItemId);
      const quantity = (existing?.quantity || 0) + 1;
      if (quantity > 1000 || product.stock != null && quantity > Number(product.stock)) return state;
      const item = {...product, selectedFeatures, cartItemId, quantity};
      return existing ? state.map(x => x.cartItemId === cartItemId ? item : x) : [...state, item];
    }
    case 'UPDATE_QUANTITY': {
      const {cartItemId, quantity, product} = action.payload;
      if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000) return state;
      if (quantity === 0) return state.filter(item => item.cartItemId !== cartItemId);
      return state.map(item => item.cartItemId === cartItemId ? {...item, ...product, quantity} : item);
    }
    case 'REMOVE_ITEM': return state.filter(item => item.cartItemId !== action.payload.cartItemId);
    case 'RESTORE': return sanitizeCart(action.payload);
    case 'CLEAR_CART': return [];
    default: return state;
  }
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
