const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function validHostname(hostname) {
  return hostname.length > 0 && hostname.length <= 253 && !/[^a-z0-9.-]/.test(hostname) && hostname.split('.').every(label => DNS_LABEL.test(label));
}

function hostError(status, code, message) {
  return Object.assign(new Error(message), { status, code });
}

export function validateStoreHost(requestedHost, { allowedHosts = '', trustedIngress = false, production = false } = {}) {
  // Parse Host as an authority, never as a URL that could accept credentials or paths.
  const match = typeof requestedHost === 'string' && /^([^:]+)(?::([0-9]{1,5}))?$/.exec(requestedHost);
  const hostname = match && match[0] === requestedHost ? match[1].toLowerCase() : '';
  if (!validHostname(hostname) || (match[2] !== undefined && (Number(match[2]) < 1 || Number(match[2]) > 65535))) {
    throw hostError(400, 'INVALID_STORE_HOST', 'دامنه نامعتبر است');
  }

  const allowed = allowedHosts.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  for (const entry of allowed) {
    const suffix = entry.startsWith('*.') ? entry.slice(2) : entry;
    if (!validHostname(suffix) || (entry.startsWith('*.') && (!suffix.includes('.') || /^[0-9.]+$/.test(suffix)))) {
      throw hostError(503, 'INVALID_HOST_POLICY', 'سیاست اعتبارسنجی دامنه فروشگاه نامعتبر است');
    }
  }
  if (production && !allowed.length && !trustedIngress) {
    throw hostError(503, 'MISSING_HOST_POLICY', 'سیاست اعتبارسنجی دامنه فروشگاه تنظیم نشده است');
  }

  const matches = allowed.some(entry => {
    if (!entry.startsWith('*.')) return entry === hostname;
    const suffix = entry.slice(1);
    if (!hostname.endsWith(suffix)) return false;
    // Only {shopname}, not the base domain or multiple nested subdomains.
    return DNS_LABEL.test(hostname.slice(0, -suffix.length));
  });
  if (allowed.length && !matches) throw hostError(403, 'STORE_HOST_FORBIDDEN', 'دامنه مجاز نیست');
  return hostname;
}
