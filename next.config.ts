import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // ✅ ini yang penting
  basePath: "/Sentimen-OIKN", // ✅ supaya path di GitHub Pages benar
  images: {
    unoptimized: true, // ✅ untuk static export
  },
};

export default nextConfig;
