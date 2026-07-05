import "newrelic";

import { createServer, ServerResponse } from "http";
import { parse } from "url";

import { loadEnvConfig } from "@next/env";
import mysql from "mysql2/promise";
import next from "next";

loadEnvConfig(process.cwd());

const legacyRedirectConnection = mysql.createPool({
  connectionLimit: 5,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
  waitForConnections: true,
});

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

type Locale = "en" | "fr";

// Legacy PHP redirects are handled before Next.js so trailingSlash redirects
// cannot produce absolute localhost Location headers behind the production proxy.
function permanentRedirect(res: ServerResponse, path: string) {
  res.writeHead(308, { Location: path });
  res.end();
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getLegacyTunnellerRedirectPath(
  id: string | undefined,
  locale: Locale,
) {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const rollPath = `${localePrefix}/tunnellers/`;

  if (!id || !/^\d+$/.test(id)) {
    return rollPath;
  }

  const [results] = await legacyRedirectConnection
    .execute<mysql.RowDataPacket[]>("SELECT slug FROM tunneller WHERE id = ?", [
      id,
    ])
    .catch(() => [[] as mysql.RowDataPacket[]]);
  const slug = results[0]?.slug;

  return slug ? `${localePrefix}/tunnellers/${slug}/` : rollPath;
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    const pathname = parsedUrl.pathname?.replace(/\/$/, "");

    // Old roll detail pages used query-string IDs, for example:
    // /roll/details.php?id=274 and /fr/liste/details.php?id=274.
    // Resolve those IDs to current slug URLs and return relative redirects.
    if (pathname === "/roll/details.php") {
      const path = await getLegacyTunnellerRedirectPath(
        firstQueryValue(parsedUrl.query.id),
        "en",
      );
      permanentRedirect(res, path);
      return;
    }

    if (pathname === "/fr/liste/details.php") {
      const path = await getLegacyTunnellerRedirectPath(
        firstQueryValue(parsedUrl.query.id),
        "fr",
      );
      permanentRedirect(res, path);
      return;
    }

    handle(req, res, parsedUrl);
  }).listen(port, () => {
    if (dev) {
      // Only log in development mode
      process.stdout.write(
        `> Server listening at http://localhost:${port} as development\n`,
      );
    }
  });
});
