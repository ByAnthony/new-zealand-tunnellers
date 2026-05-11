import { NextResponse } from "next/server";

import { Locale } from "@/types/locale";
import { tunnellerSlugByIdQuery } from "@/utils/database/queries/tunnellerSlugByIdQuery";
import { withConnection } from "@/utils/database/withConnection";

export function legacyPermanentRedirect(path: string) {
  return new NextResponse(null, {
    status: 308,
    headers: {
      Location: path,
    },
  });
}

export async function getLegacyTunnellerRedirectPath(
  id: string | null,
  locale: Locale,
) {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const rollPath = `${localePrefix}/tunnellers/`;

  if (!id || !/^\d+$/.test(id)) {
    return rollPath;
  }

  const slug = await withConnection((connection) =>
    tunnellerSlugByIdQuery(id, connection),
  );

  return slug ? `${localePrefix}/tunnellers/${slug}/` : rollPath;
}
