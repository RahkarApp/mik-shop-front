'use client';
import Link from 'next/link';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {formatMoney} from '@/utils/format';

// تابع برای تبدیل اعداد به فارسی
const toPersianDigits = (num) => {
  if (num === undefined || num === null) return '';
  const persian = { 0: '۰', 1: '۱', 2: '۲', 3: '۳', 4: '۴', 5: '۵', 6: '۶', 7: '۷', 8: '۸', 9: '۹' };
  return num.toString().replace(/[0-9]/g, (d) => persian[d]);
};

export default function OrderList({ orders }) {
  const {config}=useSiteConfig();
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p>شما تاکنون هیچ سفارشی ثبت نکرده‌اید.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full bg-white rounded-lg shadow-md">
      <div className="space-y-2">
        {orders.map((order) => (
          <Link href={`/orders/${order.id}`} key={order.id} className="block p-4 border-b hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">سفارش #{toPersianDigits(order.id)}</p>
                <p className="text-xs text-gray-500 mt-1">{toPersianDigits(order.date || order.createdAt || "")}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{formatMoney(order.summary?.total??order.total,order.currency||config?.currency)}</p>
                <p className={`text-xs font-semibold mt-1 ${order.status === 'لغو شده' ? 'text-red-500' : 'text-green-500'}`}>
                  {order.status}
                </p>
              </div>
            </div>
            <div className="mt-2">
              {(order.products || order.items || []).map((product) => (
                <div key={product.id} className="flex items-center space-x-4 py-2">
                  {product.image && <img src={product.image} alt={product.name||"محصول"} className="w-16 h-16 object-cover rounded" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatMoney(product.price,order.currency||config?.currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
