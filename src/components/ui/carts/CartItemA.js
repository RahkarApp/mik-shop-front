'use client';

/**
 * CartItemA — آیتم سبد کلاسیک (کارت افقی)
 */

import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/shared/CartContext';
import { formatMoney, formatPrice } from '@/utils/format';
import {useSiteConfig} from '@/hooks/useSiteConfig';

export default function CartItemA({ item }) {
  const { dispatch } = useCart();
  const {config} = useSiteConfig();

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-50">
          <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-gray-800 truncate">{item.name}</h3>
          {item.selectedFeatures && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(item.selectedFeatures).map(([k, v]) => (
                <span key={k} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{k}: {v}</span>
              ))}
            </div>
          )}
          <p className="text-primary font-bold text-sm mt-1">{formatMoney(item.price, config?.currency)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center border rounded-lg">
          <button type="button" onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId: item.cartItemId, quantity: item.quantity + 1 } })} className="p-2 hover:bg-gray-50"><Plus size={14} /></button>
          <span className="px-2 text-sm font-medium w-8 text-center">{formatPrice(item.quantity)}</span>
          <button type="button" onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId: item.cartItemId, quantity: item.quantity - 1 } })} className="p-2 hover:bg-gray-50"><Minus size={14} /></button>
        </div>
        <button type="button" onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { cartItemId: item.cartItemId } })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}
