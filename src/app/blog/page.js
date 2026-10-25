import BlogPageClient from '@/components/templates/BlogPageClient';
import { getServerTenantId,getServerStoreHost } from '@/services/tenantResolver';
import { getSiteConfig } from '@/services/siteConfigService';
import { buildMetadataFromConfig } from '@/utils/metadata';

export async function generateMetadata() {
  await getServerTenantId();
  const config = await getSiteConfig(await getServerTenantId(),await getServerStoreHost());
  const base = buildMetadataFromConfig(config);
  return { ...base, title: `بلاگ | ${config.branding?.siteName || 'فروشگاه'}` };
}

export default function BlogPage() {
  return <BlogPageClient />;
}
