/**
 * Product/logo URLs come from the store Backend and can use customer-specific CDNs.
 * Disable Next's server-side image optimizer rather than allowing an arbitrary
 * external hostname to be fetched by the server (SSRF risk).
 * Browser images still render normally at their original responsive dimensions.
 */
const nextConfig = {
  images: {unoptimized: true},
};
export default nextConfig;
