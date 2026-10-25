'use client';

/**
 * CartA — سبد دو ستونه با خلاصه سفارش sticky
 */

import Link from 'next/link';
import { useCart } from '@/components/shared/CartContext';
import CartItemA from './CartItemA';
import { ShoppingCart, ArrowRight, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatMoney } from '@/utils/format';
import {useSiteConfig} from '@/hooks/useSiteConfig';

export default function CartA() {
  const { cart, cartTotal, dispatch } = useCart();
  const {config} = useSiteConfig();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center min-h-[50vh]">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart size={48} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">سبد خرید شما خالی است</h2>
        <Link href="/" className="mt-8 flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl">
          بازگشت به فروشگاه <ArrowRight size={18} className="rotate-180" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          سبد خرید ({formatPrice(cart.length)} کالا)
        </h1>
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <motion.div key={item.cartItemId} layout exit={{ opacity: 0, x: -50 }}>
              <CartItemA item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="lg:col-span-4 lg:sticky lg:top-24">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 font-bold border-b pb-4 mb-4">
            <Wallet className="w-5 h-5" /> خلاصه سفارش
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>جمع کالاها</span>
            <span>{cartTotal === null ? 'در مرحله استعلام مشخص می‌شود' : `${formatMoney(cartTotal, config?.currency)} (تقریبی)`}</span>
          </div>
          <div className="flex justify-between text-sm mb-6">
            <span>ارسال</span>
            <span className="text-gray-500 text-xs font-bold">در مرحله پرداخت محاسبه می‌شود</span>
          </div>
          <Link href="/checkout" className="block w-full bg-primary text-white text-center py-4 rounded-xl font-bold">
            ادامه خرید
          </Link>
          <button type="button" onClick={() => window.confirm('حذف کل سبد؟') && dispatch({ type: 'CLEAR_CART' })} className="w-full mt-3 text-red-500 text-sm py-2">
            حذف کل سبد
          </button>
        </div>
      </div>
    </div>
  );
}
