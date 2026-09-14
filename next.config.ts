import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev "N" badge sat exactly where the profile photo goes. Build errors still show.
  devIndicators: false,
  images: {
    // The intro video's poster comes straight from YouTube's thumbnail CDN.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
};

export default nextConfig;
