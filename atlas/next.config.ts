import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site — export plain HTML/CSS/JS so any host serves it
  // correctly with no server runtime or platform plugin involved.
  output: "export",
  trailingSlash: true,
  // Standalone app nested in a larger repo — pin the workspace root here.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
