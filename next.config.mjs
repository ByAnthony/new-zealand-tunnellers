import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  trailingSlash: true,
  // prod testing on /staging
  // basePath: "/staging",
  // assetPrefix: "/staging",
  // live prod
  basePath: "",
  assetPrefix: "",
  images: {
    loader: "custom",
    loaderFile: "./utils/imageLoader.ts",
  },
  async headers() {
    // Public images rarely change; rename a file when replacing its content.
    const imageCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=604800, stale-while-revalidate=86400",
      },
    ];

    return [
      { source: "/images/:path*", headers: imageCacheHeaders },
      {
        source: "/:file(nzt_logo|search|copy|apple-touch-icon.*)\\.png",
        headers: imageCacheHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/roll/index.php",
        destination: "/tunnellers/",
        permanent: true,
      },
      {
        source: "/roll/main.php",
        destination: "/tunnellers/",
        permanent: true,
      },
      {
        source: "/roll/details.php",
        destination: "/tunnellers/",
        permanent: true,
      },
      {
        source: "/fr/liste/index.php",
        destination: "/fr/tunnellers/",
        permanent: true,
      },
      {
        source: "/fr/liste/details.php",
        destination: "/fr/tunnellers/",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
