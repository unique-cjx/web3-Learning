/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    output: "export",
    images: {
        loader: "custom",
        unoptimized: true,
    },
    reactStrictMode: true,
}

module.exports = nextConfig
