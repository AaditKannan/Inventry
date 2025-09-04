/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: ['localhost'],
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static export for GitHub Pages
  trailingSlash: true, // Required for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Inventry' : '', // Replace 'Inventry' with your repo name
  basePath: process.env.NODE_ENV === 'production' ? '/Inventry' : '', // Replace 'Inventry' with your repo name
};

export default nextConfig;
