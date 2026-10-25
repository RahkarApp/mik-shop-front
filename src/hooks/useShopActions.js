'use client';
/** Customer/purchase actions bound to the current store. The UI never imports a transport. */
import {useMemo} from 'react';
import {useSiteConfig} from './useSiteConfig';
import * as shop from '@/services/shopService';
import {validateStockBeforeAdd} from '@/services/inventorySync';
export function useShopActions(){
 const {tenantId}=useSiteConfig();
 return useMemo(()=>({
  getProfile:()=>shop.getProfile(tenantId),updateProfile:(data)=>shop.updateProfile(data,tenantId),
  getAddresses:()=>shop.getAddresses(tenantId),createAddress:(data)=>shop.createAddress(data,tenantId),removeAddress:(id)=>shop.removeAddress(id,tenantId),
  getWishlist:()=>shop.getWishlist(tenantId),removeWishlist:(id)=>shop.removeWishlist(id,tenantId),addWishlist:(id)=>shop.addWishlist(id,tenantId),
  getReviews:(id)=>shop.getReviews(id,tenantId),submitReview:(id,data)=>shop.submitReview(id,data,tenantId),
  logout:()=>shop.logout(tenantId),requestOtp:(phone)=>shop.requestOtp(phone,tenantId),verifyOtp:(challengeId,code)=>shop.verifyOtp(challengeId,code,tenantId),
  getShopMethods:()=>shop.getShopMethods(tenantId),startCheckout:(items,key)=>shop.startCheckout(items,tenantId,key),
  getCheckout:(id)=>shop.getCheckout(id,tenantId),updateCheckoutItems:(id,items,revision,key)=>shop.updateCheckoutItems(id,items,revision,tenantId,key),
  quoteCheckout:(id,shippingId,addressId,key)=>shop.quoteCheckout(id,shippingId,addressId,tenantId,key),
  placeOrder:(data,key)=>shop.placeOrder(data,tenantId,null,key),
  validateStockBeforeAdd:(id,qty,features)=>validateStockBeforeAdd(id,qty,tenantId,features),
  requestReturn:(id,reason)=>shop.requestReturn(id,reason,tenantId),cancelOrder:(id)=>shop.cancelOrder(id,tenantId),
 }),[tenantId]);
}
