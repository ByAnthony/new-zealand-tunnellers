import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Timeline } from "@/components/Timeline/Timeline";
import { Locale } from "@/types/locale";
import { TunnellerProfile } from "@/types/tunneller";
import { getTunneller } from "@/utils/database/getTunneller";
import { mysqlConnection } from "@/utils/database/mysqlConnection";
import { tunnellerSlugByIdQuery } from "@/utils/database/queries/tunnellerSlugByIdQuery";

type Props = {
  params: Promise<{ slug: string; locale: Locale }>;
};

async function getData(slug: string, locale: Locale) {
  const connection = await mysqlConnection.getConnection();

  try {
    if (/^\d+$/.test(slug)) {
      const newSlug = await tunnellerSlugByIdQuery(slug, connection);
      if (newSlug) {
        const localePrefix = locale === "en" ? "" : `/${locale}`;
        redirect(`${localePrefix}/tunnellers/${newSlug}/wwi-timeline`);
      }
    }

    return getTunneller(slug, locale, connection);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Timeline data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export async function generateMetadata(props: Props) {
  const { slug, locale } = await props.params;
  const response = await getData(slug, locale);
  const tunneller: TunnellerProfile = await response.json();

  const surname = tunneller.summary.name.surname;
  const forename = tunneller.summary.name.forename;

  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: `${t("timelineOf", { forename, surname })} - New Zealand Tunnellers`,
  };
}

export default async function Page(props: Props) {
  const { slug, locale } = await props.params;
  const response = await getData(slug, locale);
  const tunneller: TunnellerProfile = await response.json();

  return <Timeline tunneller={tunneller} />;
}
