import { api, isDemo } from './api';
export async function getSiteConfig(tenantId, host) { return api('/config', {tenantId,host}); }
export const getTenants = async () => isDemo ? (await import('./mockApi')).fetchTenants() : [];
