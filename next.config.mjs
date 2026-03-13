import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default withNextIntl(nextConfig);
