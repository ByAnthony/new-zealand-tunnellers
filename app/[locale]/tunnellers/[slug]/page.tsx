import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Profile } from "@/components/Profile/Profile";
import { Locale } from "@/types/locale";
import { TunnellerProfile } from "@/types/tunneller";
import { getTunneller } from "@/utils/database/getTunneller";
import { mysqlConnection } from "@/utils/database/mysqlConnection";
import { tunnellerSlugByIdQuery } from "@/utils/database/queries/tunnellerSlugByIdQuery";
import { buildPageMetadata, pageUrl } from "@/utils/helpers/metadata";

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
        redirect(`${localePrefix}/tunnellers/${newSlug}`);
      }
    }

    return getTunneller(slug, locale, connection);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Tunneller data: ${errorMessage}`);
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
  const rank = tunneller.militaryYears.enlistment.rank;
  const t = await getTranslations({ locale, namespace: "site" });
  const title = `${forename} ${surname} - New Zealand Tunnellers`;
  const description = t("tunnellerDescription", { rank, forename, surname });

  return buildPageMetadata({
    locale,
    title,
    description,
    path: `/tunnellers/${slug}/`,
    type: "profile",
    firstName: forename,
    lastName: surname,
  });
}

export default async function Page(props: Props) {
  const { slug, locale } = await props.params;
  const response = await getData(slug, locale);
  const tunneller: TunnellerProfile = await response.json();

  const { forename, surname } = tunneller.summary.name;
  const rank = tunneller.militaryYears.enlistment.rank;
  const birthDate = tunneller.origins.birth.date?.year;
  const birthPlace = tunneller.origins.birth.country;
  const deathDate = tunneller.death?.date?.year;
  const deathTown = tunneller.death?.place?.town;
  const deathCountry = tunneller.death?.place?.country;
  const awmm = tunneller.sources.awmmCenotaph;
  const image = tunneller.image?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${forename} ${surname}`,
    givenName: forename,
    familyName: surname,
    jobTitle: rank,
    memberOf: {
      "@type": "Organization",
      name: "New Zealand Tunnelling Company",
    },
    url: pageUrl(locale, `/tunnellers/${slug}/`),
    ...(image && {
      image: `https://www.nztunnellers.com/images/roll/tunnellers/${image}`,
    }),
    ...(birthDate && { birthDate }),
    ...(birthPlace && {
      birthPlace: { "@type": "Place", addressCountry: birthPlace },
    }),
    ...(deathDate && { deathDate }),
    ...((deathTown || deathCountry) && {
      deathPlace: {
        "@type": "Place",
        ...(deathTown && { name: deathTown }),
        ...(deathCountry && { addressCountry: deathCountry }),
      },
    }),
    ...(awmm && { sameAs: awmm }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Profile tunneller={tunneller} />
    </>
  );
}
