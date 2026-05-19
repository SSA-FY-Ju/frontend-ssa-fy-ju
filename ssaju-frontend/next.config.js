/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    NEXT_PUBLIC_OAUTH_REDIRECT_URI: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
  },
  images: {
    remotePatterns: [
      // Google OAuth 프로필 이미지
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      // Kakao OAuth 프로필 이미지
      { protocol: 'http', hostname: 'k.kakaocdn.net' },
      { protocol: 'https', hostname: 'k.kakaocdn.net' },
    ],
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
