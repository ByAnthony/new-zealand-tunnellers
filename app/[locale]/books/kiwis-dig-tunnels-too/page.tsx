import { getTranslations, setRequestLocale } from "next-intl/server";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";
import { Locale } from "@/types/locale";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";
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
    path: "/books/kiwis-dig-tunnels-too/",
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: bookTitle(locale),
    inLanguage: locale,
    url: pageUrl(locale, "/books/kiwis-dig-tunnels-too/"),
    author: {
      "@type": "Person",
      name: "Anthony Byledbal",
    },
    publisher: {
      "@type": "Organization",
      name: "New Zealand Tunnellers",
      url: "https://www.nztunnellers.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentsContainer locale={locale} />
    </>
  );
}
