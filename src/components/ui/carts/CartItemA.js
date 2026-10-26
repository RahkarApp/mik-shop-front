'use client';

/**
 * CartItemA — آیتم سبد کلاسیک (کارت افقی)
 */

import Image from 'next/image';
import {formatMoney} from '@/utils/format';
import Link from '@/components/PreviewLink';
import ProductCartControls from '@/components/shared/ProductCartControls';
import {useSiteConfig} from '@/hooks/useSiteConfig';

export default function CartItemA({ item }) {
  const {config} = useSiteConfig();

  return (
    <div className="flex flex-wrap gap-3 items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-1 items-center gap-4 min-w-0">
        <Link href={`/${encodeURIComponent(item.id)}`} pendingLabel="در حال باز کردن محصول..." aria-label={item.name} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-50">
          {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1"/> : <span className="text-xs text-gray-400">بدون تصویر</span>}
        </Link>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-gray-800 truncate"><Link href={`/${encodeURIComponent(item.id)}`}>{item.name}</Link></h3>
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

      <ProductCartControls product={item} selectedFeatures={item.selectedFeatures || {}} cartItem={item} compact/>
    </div>
  );
}
