import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone app nested in a larger repo — pin the workspace root here.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
