import baseConfig from "./playwright.config";

export default {
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: "http://127.0.0.1:3001",
  },
  webServer: {
    command: "npx next dev -H 127.0.0.1 -p 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: true,
  },
};
