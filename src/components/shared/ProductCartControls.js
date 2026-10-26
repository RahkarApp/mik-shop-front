'use client';

import {useEffect, useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {LoaderCircle, ShoppingCart, Plus, Minus, Trash2} from 'lucide-react';
import Link from '@/components/PreviewLink';
import {useCart} from './CartContext';
import {cartItemKey, findCartItem, productSelection} from '@/utils/cart';
import {demoHref} from '@/utils/demoRoute';
import {formatPrice} from '@/utils/format';

/** Shared interaction for catalog, selected SKU, and cart rows. */
export default function ProductCartControls({product: listedProduct, selectedFeatures, cartItem, compact = false}) {
  const {cart, ready, isUpdating, addItem, setItemQuantity} = useCart();
  // A list response may omit SKU details; retain the details returned by the last stock check.
  const checkedProduct = cart.find(item => String(item.id) === String(listedProduct.id));
  const product = !listedProduct.variants?.length && checkedProduct?.variants?.length
    ? {...listedProduct, variants:checkedProduct.variants, features:checkedProduct.features} : listedProduct;
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [error, setError] = useState('');
  const selection = productSelection(product, selectedFeatures);
  const item = cartItem || findCartItem(cart, product, selectedFeatures);
  const busy = isUpdating(product.id) || navigating;
  const selectionKey = cartItemKey(product, selection.selectedFeatures);
  useEffect(() => {setError('');}, [selectionKey]);

  async function update(quantity) {
    setError('');
    try {
      const result = item ? await setItemQuantity(item, quantity) : await addItem(product, selectedFeatures);
      if (result.requiresSelection) {
        startTransition(() => router.push(demoHref(`/${encodeURIComponent(product.id)}`)));
      } else if (!result.valid && result.reason) setError(result.reason);
    } catch (err) {setError(err.message || 'افزودن به سبد انجام نشد؛ دوباره تلاش کنید');}
  }

  const invalidCombination = selectedFeatures !== undefined && !selection.requiresSelection &&
    product.variants?.length > 0 && !selection.variant;
  const unavailable = Number(selection.variant?.stock ?? product.stock) === 0 &&
    (selection.variant?.stock ?? product.stock) != null;
  const disabled = !ready || busy || selection.requiresSelection || invalidCombination || unavailable;
  const buttonClass = 'w-full bg-gray-900 hover:bg-primary text-white flex justify-center items-center gap-2 text-sm py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return <div className={`relative z-20 flex flex-col gap-2 ${compact ? '' : 'w-full'}`}>
    {selectedFeatures === undefined && selection.requiresSelection && !cartItem ? (
      <Link href={`/${encodeURIComponent(product.id)}`} pendingLabel="در حال باز کردن محصول..." className={`relative ${buttonClass}`}>
        انتخاب گزینه‌ها
      </Link>
    ) : item ? (
      <div role="group" aria-label={`تعداد ${product.name} در سبد`} aria-busy={busy} className="flex items-center justify-between border border-gray-200 rounded-xl bg-white min-h-11">
        <button type="button" aria-label={`افزایش تعداد ${product.name}`} disabled={!ready || busy || item.quantity >= 1000} onClick={() => update(item.quantity + 1)} className="p-3 text-primary rounded-xl hover:bg-gray-50 disabled:opacity-40"><Plus size={16}/></button>
        <span role="status" className="min-w-8 text-center text-sm font-bold">
          {busy ? <><LoaderCircle size={18} className="animate-spin mx-auto motion-reduce:animate-none"/><span className="sr-only">در حال بررسی موجودی...</span></> : formatPrice(item.quantity)}
        </span>
        <button type="button" aria-label={item.quantity === 1 ? `حذف ${product.name} از سبد` : `کاهش تعداد ${product.name}`} disabled={!ready || busy} onClick={() => update(item.quantity - 1)} className="p-3 text-rose-600 rounded-xl hover:bg-rose-50 disabled:opacity-40">{item.quantity === 1 ? <Trash2 size={16}/> : <Minus size={16}/>}</button>
      </div>
    ) : (
      <button type="button" disabled={disabled} aria-busy={busy} onClick={() => update()} className={buttonClass}>
        {busy ? <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none"/> : <ShoppingCart size={16}/>}
        {busy ? navigating ? 'در حال باز کردن محصول...' : 'در حال افزودن...' : selection.requiresSelection ? 'لطفاً گزینه‌ها را انتخاب کنید' : invalidCombination ? 'ترکیب انتخابی موجود نیست' : unavailable ? 'ناموجود' : 'افزودن به سبد خرید'}
      </button>
    )}
    {error && <p role="alert" className="text-rose-600 text-xs leading-relaxed">{error}</p>}
    {compact && item && item.quantity > 1 && <button type="button" disabled={!ready || busy} onClick={()=>update(0)} className="text-xs text-rose-600 py-1 disabled:opacity-40">حذف از سبد</button>}
  </div>;
}
