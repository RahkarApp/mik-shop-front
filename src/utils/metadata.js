/**
 * metadata.js — ساخت Metadata Next.js از SiteConfig.seo
 *
 * SEO بخش Core سیستم است و از Config می‌آید.
 */

/**
 * تبدیل seo از SiteConfig به فرمت Metadata API در Next.js
 * @param {Object} siteConfig — کل SiteConfig یا فقط { seo, branding }
 */
export function buildMetadataFromConfig(siteConfig) {
  const seo = siteConfig?.seo || {};
  const branding = siteConfig?.branding || {};

  return {
    title: seo.title || branding.siteName || 'فروشگاه',
    description: seo.description || '',
    keywords: seo.keywords?.join(', ') || undefined,
  };
}
