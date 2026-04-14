import { getTranslations } from "next-intl/server";

import { Profile } from "@/components/Profile/Profile";
import { Locale } from "@/types/locale";
import { TunnellerProfile } from "@/types/tunneller";
import { getTunnellerBySlug } from "@/utils/database/getTunnellerBySlug";
import { buildTunnellerJsonLd } from "@/utils/helpers/jsonLd";
import { buildPageMetadata, pageUrl } from "@/utils/helpers/metadata";

type Props = {
  params: Promise<{ slug: string; locale: Locale }>;
};

export async function generateMetadata(props: Props) {
  const { slug, locale } = await props.params;
  const tunneller: TunnellerProfile = await getTunnellerBySlug(slug, locale);

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
  const tunneller: TunnellerProfile = await getTunnellerBySlug(slug, locale);

  const { forename, surname } = tunneller.summary.name;
  const rank = tunneller.militaryYears.enlistment.rank;
  const birthDate = tunneller.origins.birth.date?.year;
  const birthPlace = tunneller.origins.birth.country;
  const deathDate = tunneller.death?.date?.year;
  const deathTown = tunneller.death?.place?.town;
  const deathCountry = tunneller.death?.place?.country;
  const awmm = tunneller.sources.awmmCenotaph;
  const image = tunneller.image?.url;

  const jsonLd = buildTunnellerJsonLd({
    awmm,
    birthDate,
    birthPlace,
    deathCountry,
    deathDate,
    deathTown,
    familyName: surname,
    givenName: forename,
    image,
    jobTitle: rank,
    url: pageUrl(locale, `/tunnellers/${slug}/`),
  });

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
