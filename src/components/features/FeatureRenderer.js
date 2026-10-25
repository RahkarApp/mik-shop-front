'use client';

/**
 * FeatureRenderer — نمایش Featureهای فعال بر اساس Config
 *
 * هر Feature مستقل است؛ غیرفعال بودن یکی روی بقیه اثر ندارد.
 */

import WishlistFeature from './WishlistFeature';
import ReviewFeature from './ReviewFeature';
import BlogFeature from './BlogFeature';
import WalletFeature from './WalletFeature';
import ComponentBox from '@/components/ui/ComponentBox';
import { useFeatures } from '@/hooks/useFeatures';
import { FEATURE_LABELS } from '@/constants/config';

// Featureهای اضافی که فقط با ComponentBox نمایش داده می‌شوند
function GenericFeatureBox({ featureKey }) {
  const { isFeatureEnabled } = useFeatures();

  if (!isFeatureEnabled(featureKey)) return null;

  return (
    <ComponentBox
      title={`${featureKey}Feature`}
      subtitle={FEATURE_LABELS[featureKey] || featureKey}
      color="bg-cyan-100 border-cyan-400"
      className="min-h-[80px]"
    />
  );
}

export default function FeatureRenderer() {
  const { features } = useFeatures();

  if (!features || Object.keys(features).length === 0) return null;

  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-gray-700 mb-4 border-r-4 border-[var(--color-primary)] pr-3">
        Featureهای فعال
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WishlistFeature />
        <ReviewFeature />
        <BlogFeature />
        <WalletFeature />
        <GenericFeatureBox featureKey="loyaltyClub" />
        <GenericFeatureBox featureKey="cashback" />
        <GenericFeatureBox featureKey="luckyWheel" />
        <GenericFeatureBox featureKey="campaigns" />
        <GenericFeatureBox featureKey="shareProduct" />
      </div>
    </section>
  );
}
