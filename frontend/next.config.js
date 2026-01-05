/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dollarsandlife.com',
      },
      {
        protocol: 'https',
        hostname: 'dollarsandlife.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
          recaptcha: {
            test: /[\\/]node_modules[\\/]react-google-recaptcha[\\/]/,
            name: 'recaptcha',
            chunks: 'all',
          },
          emailjs: {
            test: /[\\/]node_modules[\\/]emailjs-com[\\/]/,
            name: 'emailjs',
            chunks: 'all',
          },
          fortawesome: {
            test: /[\\/]node_modules[\\/]@fortawesome[\\/]/,
            name: 'fortawesome',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  // Handle static file serving and redirects
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Add redirects for legacy routes
  async redirects() {
    return [
      // Redirect case-sensitive URLs to lowercase
      {
        source: '/Extra-Income/:path*',
        destination: '/extra-income/:path*',
        permanent: true,
      },
      {
        source: '/extra-Income/:path*',
        destination: '/extra-income/:path*',
        permanent: true,
      },
      {
        source: '/EXTRA-INCOME/:path*',
        destination: '/extra-income/:path*',
        permanent: true,
      },
      // Redirect forum URLs with query params to clean URL (handled by client-side redirect, but this helps)
      {
        source: '/forum',
        has: [
          {
            type: 'query',
            key: 'apiKey',
          },
        ],
        destination: '/auth/action',
        permanent: false,
      },
    ];
  },
  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_REACT_APP_API_BASE: process.env.NEXT_PUBLIC_REACT_APP_API_BASE || 'http://localhost:5000',
    NEXT_PUBLIC_RSS2JSON_API_KEY: process.env.NEXT_PUBLIC_RSS2JSON_API_KEY || '',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-76XESXFFJP',
    NEXT_PUBLIC_GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16613104907',
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    NEXT_PUBLIC_EMAILJS_USER_ID: process.env.NEXT_PUBLIC_EMAILJS_USER_ID || '',
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    NEXT_PUBLIC_REACT_APP_INTERNAL_IP_PREFIX: process.env.NEXT_PUBLIC_REACT_APP_INTERNAL_IP_PREFIX || '',
  },
};

module.exports = nextConfig;
