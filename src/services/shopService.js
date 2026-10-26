/** دامنه سفارش و حساب؛ تمام شبکه از api.js می‌گذرد. */
import { api, clearAccessToken } from './api';
const pathId = (id) => encodeURIComponent(id);
export const getOrders = (tenantId, token) => api('/orders', {tenantId, token});
export const getOrder = (id, tenantId, token) => api(`/orders/${pathId(id)}`, {tenantId, token});
export const getProfile = (tenantId, token) => api('/me', {tenantId, token});
export const updateProfile = (data, tenantId, token) => api('/me', {method:'PATCH', body:data, tenantId, token,idempotencyKey:crypto.randomUUID()});
export const getAddresses = async (tenantId,token) => (await getProfile(tenantId,token))?.addresses||[];
export async function createAddress(data,tenantId,token) {
 const profile=await getProfile(tenantId,token);
 const entry={addressId:crypto.randomUUID(),title:data.title||'نشانی',fullAddress:data.fullAddress||data.text||'',isDefault:!profile.addresses?.length};
 if(!entry.fullAddress)throw new Error('نشانی کامل الزامی است');
 const updated=await api('/me',{method:'PATCH',body:{expectedRevision:profile.revision,addresses:[...(profile.addresses||[]),entry]},tenantId,token,idempotencyKey:crypto.randomUUID()});
 const saved=updated?.addresses?.find(a=>a.addressId===entry.addressId);
 if(!saved)throw new Error('نشانی ثبت‌شده در پاسخ فروشگاه دریافت نشد؛ پیش از تلاش دوباره، نشانی‌های حساب را بررسی کنید');
 return saved;
}
export async function removeAddress(id,tenantId,token) {
 const profile=await getProfile(tenantId,token);
 return api('/me',{method:'PATCH',body:{expectedRevision:profile.revision,addresses:(profile.addresses||[]).filter(a=>String(a.addressId)!==String(id))},tenantId,token,idempotencyKey:crypto.randomUUID()});
}
export const getWishlist = (tenantId, token) => api('/wishlist', {tenantId,token});
export const addWishlist = (productId, tenantId, token) => api('/wishlist', {method:'POST',body:{productId},tenantId,token});
export const removeWishlist = (id, tenantId, token) => api(`/wishlist/${pathId(id)}`,{method:'DELETE',tenantId,token});
export const logout = async (tenantId) => {const result=await api('/auth/logout',{method:'POST',tenantId});clearAccessToken();return result;};
export const requestOtp = (phone, tenantId) => api('/auth/otp/request',{method:'POST',body:{phone},tenantId});
export const verifyOtp = (challengeId, code, tenantId) => api('/auth/otp/verify',{method:'POST',body:{challengeId,code},tenantId});
export const getShopMethods=(tenantId)=>api('/shop-methods',{tenantId});
export const startCheckout=(items,tenantId,key)=>api('/checkout/start',{method:'POST',body:{items},tenantId,idempotencyKey:key});
export const getCheckout=(id,tenantId)=>api(`/checkout/${pathId(id)}`,{tenantId});
export const updateCheckoutItems=(id,items,revision,tenantId,key)=>api(`/checkout/${pathId(id)}/items`,{method:'PUT',body:{expectedRevision:revision,items},tenantId,idempotencyKey:key});
export const cancelCheckout=(id,tenantId,key)=>api(`/checkout/${pathId(id)}/cancel`,{method:'POST',tenantId,idempotencyKey:key});
export const quoteCheckout=(checkoutId,shippingMethodId,addressId,tenantId,key)=>api('/checkout/quote',{method:'POST',body:{checkoutId,shippingMethodId,...(addressId?{addressId}:{})},tenantId,idempotencyKey:key});
export const placeOrder = (payload, tenantId, token, idempotencyKey) => api('/orders',{method:'POST',body:payload,tenantId,token,idempotencyKey});
export const validateCoupon = (code, tenantId, token) => api('/coupons/validate',{method:'POST',body:{code},tenantId,token});

export const getReviews=(id,tenantId)=>api(`/products/${pathId(id)}/reviews`,{tenantId});
export const submitReview=(id,data,tenantId)=>api(`/products/${pathId(id)}/reviews`,{method:'POST',body:data,tenantId});
export const requestReturn=(id,reason,tenantId)=>api(`/orders/${pathId(id)}/returns`,{method:'POST',body:{reason},tenantId});
export const cancelOrder=(id,tenantId)=>api(`/orders/${pathId(id)}/cancel`,{method:'POST',body:{},tenantId});
