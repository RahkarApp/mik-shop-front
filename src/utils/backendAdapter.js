/** Pure mapping of mik-shop API objects to the existing storefront UI contract. */
const imageUrl = (value) => typeof value === 'string' ? value : (value?.url || value?.src || value?.path || '');
const numeric = (value) => value === null || value === undefined || value === '' ? null : (Number.isFinite(Number(value)) ? Number(value) : null);

export function adaptProduct(item) {
  if (!item) return null;
  const images = (Array.isArray(item.images) ? item.images : Array.isArray(item.img) ? item.img : []).map(imageUrl).filter(Boolean);
  const variants = Array.isArray(item.pro) ? item.pro : [];
  const primaryVariant = variants.length === 1 ? variants[0] : null;
  const stock = item.inventoryAvailable === false || item.variantsComplete === false ? null : (item.stock ?? item.inventory ?? primaryVariant?.inventory ?? null);
  const price = numeric(item.price ?? item.defaultPrice ?? item.minPrice ?? primaryVariant?.price);
  // Group variant properties by name: one color selector, one size selector (not N copies).
  const groupedFeatures = new Map();
  for (const variant of variants) for (const property of (variant.value || [])) {
    if (!property.name) continue;
    if (!groupedFeatures.has(property.name)) groupedFeatures.set(property.name,new Map());
    const options = groupedFeatures.get(property.name);
    const value = String(property.value ?? '');
    const previous = options.get(value);
    options.set(value,{value,available:Boolean(previous?.available || (variant.inventory ?? 0)>0),colorCode:property.code || previous?.colorCode});
  }
  const features = Array.isArray(item.features) ? item.features : [...groupedFeatures].map(([name,options])=>({name,options:[...options.values()]}));
  return {
    ...item,
    id: item.id != null || item.uid != null ? String(item.id ?? item.uid) : null,
    name: item.name,
    image: imageUrl(item.image) || images[0] || '',
    images,
    description: item.description || item.productInfo?.description || '',
    price,
    originalPrice: numeric(item.originalPrice),
    stock,
    inventory: stock,
    inventoryAvailable: item.inventoryAvailable !== false && stock !== null,
    variantsComplete: item.variantsComplete !== false,
    variantsNextCursor: item.variantsNextCursor ?? null,
    category: item.category || item.categories?.[0]?.uid || item.catID?.[0] || '',
    features,
    variants: variants.map(variant => ({
      proUID: variant.proUID ?? variant.uid ?? null,
      price: numeric(variant.price), stock: variant.inventory ?? null, properties: variant.value || [],
    })),
    requiresVariantSelection: Boolean(item.isPro || variants.length > 0),
  };
}
export function adaptStore(store) {
  if (!store || !(store.uid || store.storeId || store.shopId) || !(store.name || store.branding?.siteName)) throw new Error('پیکربندی فروشگاه از بک‌اند ناقص است');
  const brand = store.branding || {};
  const primaryColor = store.primaryColor || brand.primaryColor || store.theme?.primaryColor;
  const color = /^#[0-9a-fA-F]{6}$/.test(primaryColor || '') ? primaryColor : '#333333';
  return {
    storeId: String(store.storeId || store.shopId || store.uid), tenantId: String(store.storeId || store.shopId || store.uid),
    currency: ['IRR','TOMAN'].includes(store.currency) ? store.currency : null,
    branding: { siteName: brand.siteName || store.name, logo: brand.logo || brand.logoUrl || store.logo || '',
      favicon: brand.favicon || store.favicon || '', description: brand.description || store.description || '',
      phone: brand.phone || store.tel?.[0] || '', address: brand.address || store.address || '', social: brand.social || store.social || {} },
    theme: { mode: 'light', primaryColor: color, secondaryColor: store.secondaryColor || null, fontFamily: 'Ravi, sans-serif', borderRadius: '12px' },
    layout: { template: 'storefront-v1', header: 'a', footer: 'a', homeSections: ['hero', 'categories', 'products'],
      components: { productCard: 'a', banner: 'a', cart: 'a', categories: 'a' } },
    // Backend must explicitly enable features; unsupported commerce features stay off.
    features: Object.fromEntries(Object.entries({ wishlist: false, wallet: false, reviews: false, blog: false, returns:false, orderCancellation:false, ...(store.features || {}) }).map(([key, value]) => [key, value === true])),
    pages: Object.fromEntries(Object.entries({ blog: false, returnPolicy: false, ...(store.pages || {}) }).map(([key, value]) => [key, value === true])),
    seo: { title: brand.siteName || store.name, description: brand.description || store.description || '', ...(store.seo || {}) },
    footer: store.footer || {}, content: store.content || {}, policies: store.policies || {},
  };
}
export function adaptResponse(path, method, response) {
  if (response?.status === false) throw Object.assign(new Error(response.message || 'درخواست ناموفق بود'), { code: response.code });
  const payload = response && typeof response === 'object' && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;
  const pathname = path.split('?')[0];
  if (pathname === '/config') return adaptStore(payload);
  if (pathname === '/products' && method === 'GET') {
    const entries = Array.isArray(payload) ? payload : payload?.items;
    if(!Array.isArray(entries))throw Object.assign(new Error('فهرست محصولات دریافت‌شده از فروشگاه معتبر نیست'),{code:'INVALID_BACKEND_RESPONSE'});
    return {items:entries.map(adaptProduct),nextCursor:payload?.nextCursor??null};
  }
  if (/^\/products\/[^/]+$/.test(pathname) && method === 'GET') return adaptProduct(payload);
  if (/^\/products\/[^/]+\/inventory$/.test(pathname) && method === 'GET') {
    const p = adaptProduct(payload);
    return p ? {productId:p.id,price:p.price,stock:p.stock,originalPrice:p.originalPrice,
      requiresVariantSelection:p.requiresVariantSelection || p.features.length>0,
      variants:p.variants,
      variantMissingId:p.variants.length>0 && p.variants.some(v=>!v.proUID)} : null;
  }
  if (pathname === '/categories' && method === 'GET') {
    const entries=Array.isArray(payload)?payload:payload?.items;
    if(!Array.isArray(entries))throw Object.assign(new Error('فهرست دسته‌بندی‌های دریافت‌شده از فروشگاه معتبر نیست'),{code:'INVALID_BACKEND_RESPONSE'});
    return {items:entries.map(c=>({...c,id:String(c.id??c.categoryId??c.uid),name:c.name})),nextCursor:payload?.nextCursor??null};
  }
  if (pathname === '/me' && payload?.Profile) return {...payload.Profile, phone:payload.Profile.mobile, addresses:payload.address};
  if (pathname === '/me' && payload) return {...payload, id:payload.customerId??payload.id, addresses:payload.addresses||[]};
  if (pathname === '/addresses' && method === 'GET') return payload?.items||[];
  if (pathname === '/shop-methods') return payload;
  if (pathname === '/auth/otp/request' && method === 'POST') return response;
  if (pathname === '/auth/otp/verify' && method === 'POST') return response;
  if (pathname === '/orders' && method === 'GET') { const list=Array.isArray(payload)?payload:payload?.items; return Array.isArray(list) ? list.map(adaptOrder) : payload; }
  if (/^\/orders\/[^/]+$/.test(pathname) && method === 'GET') return adaptOrder(payload);
  return payload;
}
export function adaptOrder(order) {
  if (!order) return null;
  const items = order.items && !Array.isArray(order.items) ? Object.entries(order.items).flatMap(([productId, group]) => (Array.isArray(group) ? group : [group]).map(x => ({...x, productId, quantity:x.qty ?? x.quantity}))) : (order.items || []);
  return {...order, id: order.id || order.orderId || order.uid, items, date:order.date || order.createdAt,
    status: Array.isArray(order.status) ? order.status.at(-1)?.status : order.status,
    processingStatus:order.processingStatus, paymentStatus:order.paymentStatus,deliveryStatus:order.deliveryStatus,
    summary:order.summary || order.totals || {total:null}};
}
