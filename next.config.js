module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['cloudflare-assets.com'],
  },
  env: {
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    D1_DATABASE_ID: process.env.D1_DATABASE_ID,
  },
  eslint: {
    // 在生产构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建时忽略TypeScript错误
    ignoreBuildErrors: true
  }
}
