import React from 'react';
import Link from '@/components/PreviewLink';
import { getProductById } from '@/services/productService';
import { getServerTenantId, getServerStoreHost } from '@/services/tenantResolver';
import { getSiteConfig } from '@/services/siteConfigService';
import ImageSlider from '@/components/shared/ImageSlider';
import ProductDetailsClient from '@/components/shared/ProductDetailsClient';
import ReviewsPanel from '@/components/shared/ReviewsPanel';

export async function generateMetadata({ params }) {
  const tenantId = await getServerTenantId();
  const { slug } = await params;
  const product = await getProductById(slug, tenantId, await getServerStoreHost());
  const config = await getSiteConfig(tenantId,await getServerStoreHost());

  if (!product) {
    return { title: 'محصول یافت نشد' };
  }

  return {
    title: `${product.name} | ${config.branding?.siteName || 'فروشگاه'}`,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }) {
  const tenantId = await getServerTenantId();
  const { slug } = await params;
  const product = await getProductById(slug, tenantId, await getServerStoreHost());

  if (!product) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm bg-white rounded-xl border p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold mb-2 text-gray-800">محصولی یافت نشد</h1>
          <Link href="/" className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-2 py-6">
      <div className="w-full bg-white p-5 md:p-8 rounded-2xl border border-gray-100">
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:gap-10">
          <div className="rounded-xl overflow-hidden border border-gray-100 md:w-1/2 lg:w-5/12">
            <ImageSlider images={product.images || [product.image]} />
          </div>
          <ProductDetailsClient product={product} />
        </div>
      </div>
      <ReviewsPanel productId={slug}/>
    </main>
  );
}
