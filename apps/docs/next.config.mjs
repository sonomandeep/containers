import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  rewrites() {
    return [
      {
        source: "/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

export default withMDX(config);
