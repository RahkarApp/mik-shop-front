
import './globals.css';
import ConfigAppShell from '../components/layout/ConfigAppShell';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import { CartProvider } from '@/components/shared/CartContext';
import { getServerTenantId } from '@/services/tenantResolver';

export default async function RootLayout({ children }) {
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
