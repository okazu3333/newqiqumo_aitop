import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // 開発時のパフォーマンス向上
  poweredByHeader: false,
  // Cloud Run環境での画像最適化を無効化
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@survey-poc/api"],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
