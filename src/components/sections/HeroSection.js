'use client';

/**
 * HeroSection — بنر صفحه اصلی (variant از Config)
 */

import BannerRenderer from '@/components/ui/banners/BannerRenderer';
import { useBanners } from '@/hooks/useBanners';

export default function HeroSection() {
  const { banners, loading, error } = useBanners();

  if (loading) {
    return <div className="w-full h-48 md:h-64 bg-gray-100 animate-pulse rounded-xl" />;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full">
      <BannerRenderer banners={banners} />
    </div>
  );
}
