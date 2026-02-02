/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: ['next-mdx-remote'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**'
      },
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
    // 使用自定义 loader 来代理特定域名的图片
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    // 自定义 loader 需要禁用内置优化
    unoptimized: true,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api']
  },
  reactStrictMode: false,
}

export default nextConfig
