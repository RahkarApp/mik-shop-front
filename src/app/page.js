import HomePageBuilder from '@/components/templates/HomePageBuilder';
import { getSiteConfig } from '@/services/siteConfigService';
import {getServerTenantId,getServerStoreHost} from '@/services/tenantResolver';
import { buildMetadataFromConfig } from '@/utils/metadata';

/**
 * SEO از SiteConfig — Metadata API در Next.js
 * عنوان و توضیحات با تغییر Tenant عوض می‌شوند
 */
export async function generateMetadata() {
  const config = await getSiteConfig(await getServerTenantId(),await getServerStoreHost());
  return buildMetadataFromConfig(config);
}

/**
 * صفحه اصلی — ساخته شده توسط HomePageBuilder بر اساس Config
 * ترتیب بخش‌ها: layout.homeSections
 */
export default function HomePage() {
  return <HomePageBuilder />;
}
