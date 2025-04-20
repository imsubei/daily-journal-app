/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用静态导出模式，完全避免服务器端渲染问题
  output: 'export',
  // 禁用图片优化，这在静态导出中是必需的
  images: { unoptimized: true },
  // 忽略TypeScript和ESLint错误
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
