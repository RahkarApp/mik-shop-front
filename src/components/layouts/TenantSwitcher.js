'use client';

/**
 * TenantSwitcher — تغییر فروشگاه + نمایش variantهای فعال
 */

import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useComponents } from '@/hooks/useComponentVariant';
import { TENANT_LIST } from '@/constants/config';
import { LAYOUT_LABELS } from '@/constants/config';
import { COMPONENT_LABELS } from '@/constants/config';

export default function TenantSwitcher() {
  const { tenantId, switchTenant, loading, config } = useSiteConfig();
  const components = useComponents();

  return (
    <div className="w-full mb-6 p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm">
      <p className="font-medium text-gray-700 mb-2">تغییر فروشگاه (Tenant Switching)</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {TENANT_LIST.map((tenant) => (
          <button
            key={tenant.id}
            type="button"
            disabled={loading}
            onClick={() => switchTenant(tenant.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tenantId === tenant.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            {tenant.label}
          </button>
        ))}
      </div>

      {config && (
        <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
          <span>هدر: {LAYOUT_LABELS[config.layout?.header]}</span>
          <span>فوتر: {LAYOUT_LABELS[config.layout?.footer]}</span>
          <span>کارت: {COMPONENT_LABELS[components.productCard]}</span>
          <span>بنر: {COMPONENT_LABELS[components.banner]}</span>
          <span>سبد: {COMPONENT_LABELS[components.cart]}</span>
          <span>دسته: {COMPONENT_LABELS[components.categories]}</span>
        </div>
      )}
    </div>
  );
}