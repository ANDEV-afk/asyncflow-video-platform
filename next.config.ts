import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [ // Remote patterns are the modern configuration method in Next.js next.config.js that defines which external domains and URL structures are permitted to serve images through the next/image component. 
      {
        protocol: "https",
        hostname:
          "async-ai-platform-recordings.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
