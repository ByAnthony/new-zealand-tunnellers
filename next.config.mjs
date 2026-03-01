/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "react-markdown",
    "remark-gfm",
    "remark-remove-comments",
    "rehype-raw",
    "unist-util-visit",
    "devlop",
    "hast-util-to-jsx-runtime",
    "html-url-attributes",
    "mdast-util-to-hast",
    "remark-parse",
    "remark-rehype",
    "unified",
    "vfile",
  ],
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

export default nextConfig;
