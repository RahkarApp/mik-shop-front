import {formatPrice} from '@/utils/format';

export default function CartBadge({count}) {
  if (!Number.isSafeInteger(count) || count <= 0) return null;
  return <span role="status" aria-label={`${formatPrice(count)} کالا در سبد خرید`} className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm ring-2 ring-white">
    {count > 99 ? '۹۹+' : formatPrice(count)}
  </span>;
}
