import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@ton/ton', '@ton/core', '@ton/crypto']
}

export default nextConfig
