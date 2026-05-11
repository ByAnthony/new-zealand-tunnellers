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
        source: "/fr/liste/index.php",
        destination: "/fr/tunnellers/",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
