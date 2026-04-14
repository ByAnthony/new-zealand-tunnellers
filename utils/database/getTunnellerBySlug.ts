import { redirect } from "next/navigation";

import { Locale } from "@/types/locale";

import { getTunneller } from "./getTunneller";
import { tunnellerSlugByIdQuery } from "./queries/tunnellerSlugByIdQuery";
import { withConnection } from "./withConnection";

type RedirectTarget = "profile" | "timeline";

export async function getTunnellerBySlug(
  slug: string,
  locale: Locale,
  redirectTarget: RedirectTarget = "profile",
) {
  try {
    return await withConnection(async (connection) => {
      if (/^\d+$/.test(slug)) {
        const newSlug = await tunnellerSlugByIdQuery(slug, connection);
        if (newSlug) {
          const localePrefix = locale === "en" ? "" : `/${locale}`;
          const suffix = redirectTarget === "timeline" ? "/wwi-timeline" : "";
          redirect(`${localePrefix}/tunnellers/${newSlug}${suffix}`);
        }
      }

      return getTunneller(slug, locale, connection);
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const context =
      redirectTarget === "timeline" ? "Timeline data" : "Tunneller data";
    throw new Error(`Failed to fetch ${context}: ${errorMessage}`);
  }
}
