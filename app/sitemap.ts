import { readdirSync } from "fs";
import { join } from "path";

import { MetadataRoute } from "next";

import { mysqlConnection } from "@/utils/database/mysqlConnection";
import { allArticleIdsQuery } from "@/utils/database/queries/historyChapterQuery";
import { allTunnellerSlugsQuery } from "@/utils/database/queries/rollQuery";
import { bookFilePath } from "@/utils/helpers/books/basePathUtil";
import { pageUrl } from "@/utils/helpers/metadata";

const locales = ["en", "fr"];

const staticRoutes = [
  "/",
  "/tunnellers/",
  "/about-us/",
  "/maps/tunnellers-works/",
  "/books/kiwis-dig-tunnels-too/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const connection = await mysqlConnection.getConnection();

  try {
    const [slugs, articleIds] = await Promise.all([
      allTunnellerSlugsQuery(connection),
      allArticleIdsQuery(connection),
    ]);

    const bookChapterIds = readdirSync(
      join(process.cwd(), `contents/${bookFilePath("en")}`),
    )
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));

    const entries: MetadataRoute.Sitemap = [];

    for (const route of staticRoutes) {
      for (const locale of locales) {
        entries.push({ url: pageUrl(locale, route) });
      }
    }

    for (const slug of slugs) {
      for (const locale of locales) {
        entries.push({ url: pageUrl(locale, `/tunnellers/${slug}/`) });
        entries.push({
          url: pageUrl(locale, `/tunnellers/${slug}/wwi-timeline/`),
        });
      }
    }

    for (const id of articleIds) {
      for (const locale of locales) {
        entries.push({ url: pageUrl(locale, `/history/${id}/`) });
      }
    }

    for (const id of bookChapterIds) {
      for (const locale of locales) {
        entries.push({
          url: pageUrl(locale, `/books/kiwis-dig-tunnels-too/${id}/`),
        });
      }
    }

    return entries;
  } finally {
    connection.release();
  }
}
