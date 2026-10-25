'use client';

/**
 * ReviewFeature — قابلیت نظرات محصول
 */

import ComponentBox from '@/components/ui/ComponentBox';
import { FEATURE_LABELS, FEATURE_REVIEWS } from '@/constants/config';
import { useFeatures } from '@/hooks/useFeatures';

export default function ReviewFeature() {
  const { isReviewsEnabled } = useFeatures();

  if (!isReviewsEnabled) return null;

  return (
    <ComponentBox
      title="ReviewFeature"
      subtitle={FEATURE_LABELS[FEATURE_REVIEWS]}
      color="bg-yellow-100 border-yellow-400"
      className="min-h-[80px]"
    />
  );
}
