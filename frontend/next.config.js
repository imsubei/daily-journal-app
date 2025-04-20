/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用静态生成和预渲染
  experimental: {
    appDir: true,
    serverComponents: true,
    serverActions: true,
  },
  // 忽略TypeScript和ESLint错误
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
