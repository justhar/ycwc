import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({});

const nextConfig = {
  webpack: (config: any) => {
    config.externals = [...config.externals, "canvas", "jsdom"]
    return config
  }
}

export default withNextIntl(nextConfig);
