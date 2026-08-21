import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  async headers() {
    return [
      {
        source: "/reference-assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/demo-products/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://ecombeckend.saaszo.in/api/v1/:path*"
      },
      {
        source: "/storage/:path*",
        destination: "https://ecombeckend.saaszo.in/storage/:path*"
      }
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "ecombeckend.saaszo.in",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      }
    ]
  },
  poweredByHeader: false,
  turbopack: {
    root: currentDir
  }
};

export default nextConfig;
