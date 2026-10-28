import { getTranslations } from "next-intl/server";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";
import { Locale } from "@/types/locale";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";
import { jsonLdAuthor, jsonLdPublisher } from "@/utils/helpers/jsonLd";
import { buildPageMetadata, pageUrl } from "@/utils/helpers/metadata";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const tHomepage = await getTranslations({ locale, namespace: "homepage" });
  const title = `${t("book")} - New Zealand Tunnellers`;

  return buildPageMetadata({
    locale,
    title,
    description: tHomepage("bookDescription"),
    path: "/kiwis-dig-tunnels-too/",
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: bookTitle(locale),
    inLanguage: locale,
    url: pageUrl(locale, "/kiwis-dig-tunnels-too/"),
    author: jsonLdAuthor,
    publisher: jsonLdPublisher,
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ContentsContainer locale={locale} />
    </>
  );
}
