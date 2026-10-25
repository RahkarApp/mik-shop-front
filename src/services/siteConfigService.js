import { api } from './api';
import {isDemoRuntime} from '@/utils/demoRoute';
export async function getSiteConfig(tenantId, host) { return api('/config', {tenantId,host}); }
export const getTenants = async () => isDemoRuntime() ? (await import('./mockApi')).fetchTenants() : [];
