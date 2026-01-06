/** @type {import('next').NextConfig} */

const nextConfig = {
    eslint:{
        ignoreDuringBuilds: true,
    },
    typescript:{
        ignoreBuildErrors: true
    },
    experimental: {
        turbo: false,
    },
};

export default nextConfig;
