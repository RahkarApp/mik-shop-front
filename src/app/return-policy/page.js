import ReturnPolicyPageClient from '@/components/templates/ReturnPolicyPageClient';
import { getServerTenantId,getServerStoreHost } from '@/services/tenantResolver';
import { getSiteConfig } from '@/services/siteConfigService';

export async function generateMetadata() {
  await getServerTenantId();
  const config = await getSiteConfig(await getServerTenantId(),await getServerStoreHost());
  return {
    title: `سیاست بازگشت کالا | ${config.branding?.siteName || 'فروشگاه'}`,
    description: 'شرایط و نحوه بازگشت کالا',
  };
}

export default function ReturnPolicyPage() {
  return <ReturnPolicyPageClient />;
}
