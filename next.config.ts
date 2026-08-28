import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    contentDispositionType: "inline",
    localPatterns: [{ pathname: "/images/**" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coresg-normal.trae.ai",
        pathname: "/api/ide/v1/text_to_image",
      },
    ],
  },
};

export default nextConfig;
