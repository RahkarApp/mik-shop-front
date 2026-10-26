/** فقط REST؛ قیمت/موجودی هنگام افزودن و Checkout از سرور تازه می‌شود. */
import { getProductInventory } from './productService';
import {productSelection} from '@/utils/cart';
import {customerErrorMessage} from '@/utils/customerError';
export async function getSyncedInventory(productId, tenantId) { return getProductInventory(productId, tenantId); }
export function invalidateInventoryCache() { /* cache موجودی نداریم */ }
export async function validateStockBeforeAdd(productId, quantity, tenantId, selectedFeatures, expectedProUID) {
  try {
    const inventory = await getSyncedInventory(productId, tenantId);
    if (!inventory) return {valid:false,reason:'محصول یافت نشد'};
    if(!Number.isSafeInteger(quantity)||quantity<1||quantity>1000)return {valid:false,reason:'تعداد درخواستی معتبر نیست'};
    const selection=productSelection(inventory,selectedFeatures);
    if(selection.requiresSelection)return {valid:false,requiresSelection:true,reason:'ابتدا گزینه‌های محصول را انتخاب کنید'};
    let chosen=selection.variant;
    if(inventory.requiresVariantSelection){
      if(!chosen || !chosen.proUID)return {valid:false,reason:'این گزینه از کالا فعلاً قابل خرید نیست. گزینه دیگری انتخاب کنید یا با فروشگاه تماس بگیرید.'};
    }
    const proUID=chosen?.proUID ?? inventory.proUID;
    if(proUID==null||String(proUID)==='')return {valid:false,reason:'اطلاعات این کالا کامل نیست. لطفاً کمی بعد دوباره تلاش کنید یا با فروشگاه تماس بگیرید.'};
    if(expectedProUID!=null&&String(proUID)!==String(expectedProUID))return {valid:false,reason:'تنوع این کالا تغییر کرده است؛ آن را دوباره از صفحه محصول انتخاب کنید'};
    if(inventory.variantMissingId && !chosen)return {valid:false,reason:'اطلاعات گزینه انتخابی کامل نیست. گزینه دیگری انتخاب کنید یا با فروشگاه تماس بگیرید.'};
    const currentPrice=chosen ? chosen.price:inventory.price;
    const currentStock=chosen ? chosen.stock:inventory.stock;
    if(currentPrice===null || currentPrice===undefined || currentPrice==='' || !Number.isSafeInteger(Number(currentPrice)) || Number(currentPrice)<0)return {valid:false,reason:'قیمت این کالا فعلاً مشخص نیست. برای خرید با فروشگاه تماس بگیرید.'};
    if (currentStock===null||currentStock===undefined||!/^\d+(?:\.\d{1,6})?$/.test(String(currentStock))) return {valid:false,reason:'امکان بررسی موجودی این کالا فعلاً وجود ندارد. کمی بعد دوباره تلاش کنید.'};
    if (Number(currentStock) < quantity) return {valid:false,reason:'موجودی کافی نیست'};
    return {valid:true,price:currentPrice,stock:currentStock,proUID,selectedFeatures:selection.selectedFeatures,product:inventory};
  } catch(e) {return {valid:false,reason:customerErrorMessage(e,'cart')};}
}
