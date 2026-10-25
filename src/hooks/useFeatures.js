'use client';

/**
 * useFeatures — دسترسی راحت به Featureهای فعال
 */

import { useMemo } from 'react';
import { useSiteConfig } from './useSiteConfig';

export function useFeatures() {
  const { config, isFeatureEnabled } = useSiteConfig();

  const features = useMemo(() => config?.features || {}, [config]);

  return {
    features,
    isFeatureEnabled,
    isWishlistEnabled: isFeatureEnabled('wishlist'),
    isWalletEnabled: isFeatureEnabled('wallet'),
    isReviewsEnabled: isFeatureEnabled('reviews'),
    isBlogFeatureEnabled: isFeatureEnabled('blog'),
  };
}
