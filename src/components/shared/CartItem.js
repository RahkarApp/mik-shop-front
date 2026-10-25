'use client';

import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/shared/CartContext';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {formatMoney} from '@/utils/format';

// تابع برای تبدیل اعداد به فارسی
const toPersianDigits = (num) => {
  if (num === undefined || num === null) return '';
  const persian = {
    0: '۰', 1: '۱', 2: '۲', 3: '۳', 4: '۴', 5: '۵', 6: '۶', 7: '۷', 8: '۸', 9: '۹'
  };
  return num.toString().replace(/[0-9]/g, (d) => persian[d]);
};

export default function CartItem({ item }) {
  const { dispatch } = useCart();
  const {config} = useSiteConfig();

  const handleQuantityChange = (newQuantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId: item.cartItemId, quantity: newQuantity } });
  };

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_ITEM', payload: { cartItemId: item.cartItemId } });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="rounded-md object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm md:text-base text-gray-800">{item.name}</h3>

          {/* Display Selected Features */}
          {item.selectedFeatures && (
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(item.selectedFeatures).map(([key, value]) => (
                <span key={key} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-600 text-xs md:text-sm mt-1">{formatMoney(item.price,config?.currency)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center border rounded-md">
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="p-2 text-gray-700 hover:bg-gray-100"
            aria-label="افزایش تعداد"
          >
            <Plus size={16} />
          </button>
          <span className="px-3 text-sm font-medium">{toPersianDigits(item.quantity)}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="p-2 text-gray-700 hover:bg-gray-100"
            aria-label="کاهش تعداد"
          >
            <Minus size={16} />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
          aria-label="حذف محصول"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
