import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Roll } from "@/components/Roll/Roll";
import { Locale } from "@/types/locale";
import { getCachedTunnellers } from "@/utils/database/getTunnellers";
import { ogLocale, pageUrl } from "@/utils/helpers/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "site" });
  const title = `${t("tunnellers")} - New Zealand Tunnellers`;
  return {
    title,
    openGraph: {
      title,
      description: t("tunnellersDescription"),
      url: pageUrl(locale, "/tunnellers/"),
      siteName: "New Zealand Tunnellers",
      locale: ogLocale(locale),
      alternateLocale: locale === "fr" ? "en_NZ" : "fr_FR",
      type: "website",
    },
  };
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const tunnellers = await getCachedTunnellers(locale);

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <Roll tunnellers={tunnellers} />
    </Suspense>
  );
}
