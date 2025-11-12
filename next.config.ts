import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/Sentimen-OIKN" : "", // ✅ aktif hanya di production
  assetPrefix: isProd ? "/Sentimen-OIKN/" : "", // ✅ agar path file statis juga benar
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
