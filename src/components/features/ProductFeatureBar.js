'use client';

/**
 * ProductFeatureBar — Featureهای Config-Driven در صفحه محصول
 */

import { Heart, Share2, Star, Tag } from 'lucide-react';
import { useFeatures } from '@/hooks/useFeatures';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import {useShopActions} from '@/hooks/useShopActions';
import {useState} from 'react';

export default function ProductFeatureBar({ productName, productId }) {
  const [message,setMessage]=useState('');
  const {addWishlist}=useShopActions();
  const { isWishlistEnabled, isReviewsEnabled } = useFeatures();
  const { isFeatureEnabled, tenantId } = useSiteConfig();

  const showShare = isFeatureEnabled('shareProduct');
  const showCashback = isFeatureEnabled('cashback');
  const showCampaigns = isFeatureEnabled('campaigns');

  const hasAny = isWishlistEnabled || isReviewsEnabled || showShare || showCashback || showCampaigns;
  if (!hasAny) return null;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: productName, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('لینک کپی شد');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
      {message&&<p role="status" className="text-xs w-full">{message}</p>}
      {isWishlistEnabled && (
        <button type="button" onClick={async()=>{try{await addWishlist(productId);setMessage('به علاقه‌مندی‌ها افزوده شد')}catch(e){setMessage(e.message)}}} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors">
          <Heart className="w-3.5 h-3.5" />
          علاقه‌مندی
        </button>
      )}
      {showShare && (
        <button type="button" onClick={handleShare} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          اشتراک‌گذاری
        </button>
      )}
      {isReviewsEnabled && (
        <span className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-100">
          <Star className="w-3.5 h-3.5" />
          نظرات فعال
        </span>
      )}
      {showCashback && (
        <span className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-100">
          <Tag className="w-3.5 h-3.5" />
          کش‌بک
        </span>
      )}
      {showCampaigns && (
        <span className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
          <Tag className="w-3.5 h-3.5" />
          کمپین فعال
        </span>
      )}
    </div>
  );
}
