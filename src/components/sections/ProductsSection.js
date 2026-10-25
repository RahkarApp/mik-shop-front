'use client';
import PreviewLink from '@/components/PreviewLink';

/**
 * ProductsSection — محصولات صفحه اصلی (variant کارت از Config)
 */

import ProductCardRenderer from '@/components/ui/product-cards/ProductCardRenderer';
import { useProducts } from '@/hooks/useProducts';
import { useComponentVariant } from '@/hooks/useComponentVariant';
import { PRODUCT_CARD_C } from '@/constants/config';

export default function ProductsSection() {
  const { products, loading, error } = useProducts({ limit: 10 });
  const cardVariant = useComponentVariant('productCard');

  // کارت فشرده — گرید متفاوت
  const gridClass =
    cardVariant === PRODUCT_CARD_C
      ? 'grid grid-cols-1 md:grid-cols-2 gap-3 px-2'
      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2';

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <section className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-end px-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-r-4 border-primary pr-3 rounded-sm">
          محصولات ویژه
        </h2>
        <PreviewLink href="/search-result" className="text-primary text-sm font-medium hover:underline">
          مشاهده همه
        </PreviewLink>
      </div>
      <div className={gridClass}>
        {products.map((product) => (
          <ProductCardRenderer key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
