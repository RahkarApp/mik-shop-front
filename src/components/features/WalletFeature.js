'use client';

/**
 * WalletFeature — قابلیت کیف پول
 */

import ComponentBox from '@/components/ui/ComponentBox';
import { FEATURE_LABELS, FEATURE_WALLET } from '@/constants/config';
import { useFeatures } from '@/hooks/useFeatures';

export default function WalletFeature() {
  const { isWalletEnabled } = useFeatures();

  if (!isWalletEnabled) return null;

  return (
    <ComponentBox
      title="WalletFeature"
      subtitle={FEATURE_LABELS[FEATURE_WALLET]}
      color="bg-teal-100 border-teal-400"
      className="min-h-[80px]"
    />
  );
}
