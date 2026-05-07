"use strict";

/* global process */

const fs = require("node:fs");
const path = require("node:path");

loadEnvFile();

const appName = process.env.NEW_RELIC_APP_NAME || "";
const licenseKey = process.env.NEW_RELIC_LICENSE_KEY || "";

exports.config = {
  app_name: [appName],
  license_key: licenseKey,
  agent_enabled:
    process.env.NODE_ENV === "production" &&
    Boolean(appName) &&
    Boolean(licenseKey),
  distributed_tracing: {
    enabled: true,
  },
  application_logging: {
    forwarding: {
      enabled: true,
    },
  },
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || "info",
  },
  instrumentation: {
    timers: {
      enabled: false,
    },
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      "request.headers.cookie",
      "request.headers.authorization",
      "request.headers.proxyAuthorization",
      "request.headers.setCookie*",
      "request.headers.x*",
      "response.headers.cookie",
      "response.headers.authorization",
      "response.headers.proxyAuthorization",
      "response.headers.setCookie*",
      "response.headers.x*",
    ],
  },
};

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envFile = fs.readFileSync(envPath, "utf8");

  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
