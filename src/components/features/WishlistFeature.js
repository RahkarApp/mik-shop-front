'use client';

/**
 * WishlistFeature — قابلیت لیست علاقه‌مندی
 * مستقل و قابل حذف — فقط اگر features.wishlist فعال باشد
 */

import ComponentBox from '@/components/ui/ComponentBox';
import { FEATURE_LABELS, FEATURE_WISHLIST } from '@/constants/config';
import { useFeatures } from '@/hooks/useFeatures';

export default function WishlistFeature() {
  const { isWishlistEnabled } = useFeatures();

  if (!isWishlistEnabled) return null;

  return (
    <ComponentBox
      title="WishlistFeature"
      subtitle={FEATURE_LABELS[FEATURE_WISHLIST]}
      color="bg-pink-100 border-pink-400"
      className="min-h-[80px]"
    />
  );
}
