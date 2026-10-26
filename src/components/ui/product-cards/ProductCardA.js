'use client';

/**
 * ProductCardA — کارت کلاسیک
 * تصویر بزرگ، دکمه افزودن به سبد، انیمیشن hover
 */

import { motion } from 'framer-motion';
import Link from '@/components/PreviewLink';
import Image from 'next/image';
import ProductCartControls from '@/components/shared/ProductCartControls';
import { formatPrice, formatMoney } from '@/utils/format';
import {useSiteConfig} from '@/hooks/useSiteConfig';

export default function ProductCardA({ product }) {
  const {config} = useSiteConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col overflow-hidden"
    >
      <Link href={`/${encodeURIComponent(product.id)}`} pendingLabel="در حال باز کردن محصول..." className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-primary" aria-label={product.name} />

      {product.discount > 0 && (
        <div className="absolute top-3 right-3 z-20 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {formatPrice(product.discount)}٪
        </div>
      )}

      {/*
       * قاب همه تصاویر ارتفاع و نسبت یکسان دارد. object-contain نسبت واقعی
       * عکس را حفظ می‌کند و مانع کشیدگی یا برش محصول می‌شود.
       */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50">
        {product.image ? <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
          className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        /> : <div className="flex h-full items-center justify-center text-gray-400 text-sm">بدون تصویر</div>}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto pt-3 flex flex-col gap-3">
          <div className="flex flex-col items-end">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatMoney(product.originalPrice, config?.currency)}</span>
            )}
            <span className="text-lg font-black">{product.price==null ? "قیمت نامشخص" : formatMoney(product.price, config?.currency)}</span>
          </div>
          <ProductCartControls product={product}/>
        </div>
      </div>
    </motion.div>
  );
}
