/** فقط REST؛ قیمت/موجودی هنگام افزودن و Checkout از سرور تازه می‌شود. */
import { getProductInventory } from './productService';
export async function getSyncedInventory(productId, tenantId) { return getProductInventory(productId, tenantId); }
export function invalidateInventoryCache() { /* cache موجودی نداریم */ }
export async function validateStockBeforeAdd(productId, quantity, tenantId, selectedFeatures={}) {
  try {
    const inventory = await getSyncedInventory(productId, tenantId);
    if (!inventory) return {valid:false,reason:'محصول یافت نشد'};
    let chosen=null;
    if(inventory.requiresVariantSelection){
      const pairs=Object.entries(selectedFeatures);
      chosen=(inventory.variants || []).find(v=>pairs.length===v.properties.length && pairs.every(([k,value])=>v.properties.some(p=>p.name===k&&String(p.value)===String(value))));
      if(!chosen || !chosen.proUID)return {valid:false,reason:'ترکیب انتخابی یا شناسه موجودی آن در بک‌اند معتبر نیست'};
    }
    if(inventory.variantMissingId && !chosen)return {valid:false,reason:'شناسه ترکیب محصول در پاسخ بک‌اند موجود نیست'};
    const currentPrice=chosen ? chosen.price:inventory.price;
    const currentStock=chosen ? chosen.stock:inventory.stock;
    if(currentPrice===null || currentPrice===undefined)return {valid:false,reason:'قیمت معتبر از سرور موجود نیست'};
    if (currentStock===null||currentStock===undefined||!/^\d+(?:\.\d{1,6})?$/.test(String(currentStock))) return {valid:false,reason:'موجودی مشخص نیست'};
    if (Number(currentStock) < quantity) return {valid:false,reason:'موجودی کافی نیست'};
    return {valid:true,price:currentPrice,stock:currentStock,proUID:chosen?.proUID || null};
  } catch(e) {return {valid:false,reason:e.message};}
}
