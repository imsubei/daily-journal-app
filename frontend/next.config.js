module.exports = {
  eslint: {
    // 在生产构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  output: 'export',
  // 禁用服务器端渲染以避免上下文提供者问题
  images: { unoptimized: true }
};
