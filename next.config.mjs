/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xeland314.github.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  trailingSlash: true,
  output: "export", // Habilita la exportación estática
  basePath: "",
  reactStrictMode: true,
};

export default nextConfig;
