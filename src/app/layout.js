
import './globals.css';
import ConfigAppShell from '../components/layout/ConfigAppShell';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import { CartProvider } from '@/components/shared/CartContext';
import { getServerTenantId, isStoreAddressMissing } from '@/services/tenantResolver';

export default async function RootLayout({ children }) {
  if (await isStoreAddressMissing()) {
    return (
      <html lang="fa" dir="rtl">
        <body className="min-h-screen w-full flex items-center justify-center p-8">
          <main role="alert" className="text-center">آدرس فروشگاه را به درستی وارد کنید</main>
        </body>
      </html>
    );
  }

  // Tenant از Middleware (subdomain / cookie / query) — SSR همگام با mockApi
  const initialTenantId = await getServerTenantId();

  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen w-full flex flex-col">
        <SiteConfigProvider initialTenantId={initialTenantId}>
          <CartProvider>
            <ConfigAppShell>{children}</ConfigAppShell>
          </CartProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
