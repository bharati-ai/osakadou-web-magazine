import type { NextConfig } from "next";

const prod = process.env.NODE_ENV === "production";

// No nonces: pages stay static/ISR, so inline scripts need 'unsafe-inline'. The article sanitizer is the XSS boundary;
// this CSP still blocks third-party scripts, plugins, framing and form posts elsewhere.
// ponytail: switch to nonce-based script-src (dynamic rendering) if the site ever renders untrusted HTML without the sanitizer.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ...(prod ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // one quality step, matching the old CDN setting (Next 16 only allows listed qualities)
  // every width the code requests by hand is kept (render.ts WIDTHS, thumb() 256/384/1200, admin 256/384/640)
  images: { qualities: [55], deviceSizes: [640, 828, 1080, 1200, 1920], imageSizes: [96, 256, 384], minimumCacheTTL: 2678400 },
  expireTime: 86400,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    // admin post saves carry the article HTML plus fields (pasted data: images can be large)
    serverActions: { bodySizeLimit: "8mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: security }];
  },
};

export default nextConfig;
