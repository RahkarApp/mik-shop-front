'use client';

/**
 * BlogFeature — قابلیت بلاگ (Feature Layer)
 * جدا از BlogSection — این Feature در سطح اپ فعال/غیرفعال می‌شود
 */

import ComponentBox from '@/components/ui/ComponentBox';
import { FEATURE_LABELS, FEATURE_BLOG } from '@/constants/config';
import { useFeatures } from '@/hooks/useFeatures';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function BlogFeature() {
  const { isBlogFeatureEnabled } = useFeatures();
  const { isPageEnabled } = useSiteConfig();

  // Feature و Page هر دو باید فعال باشند
  if (!isBlogFeatureEnabled || !isPageEnabled('blog')) return null;

  return (
    <ComponentBox
      title="BlogFeature"
      subtitle={FEATURE_LABELS[FEATURE_BLOG]}
      color="bg-orange-100 border-orange-400"
      className="min-h-[80px]"
    />
  );
}
