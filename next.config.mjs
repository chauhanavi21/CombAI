/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public URL — pub-xxx.r2.dev pattern
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      // Custom R2 public domain (if configured later)
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https",
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
