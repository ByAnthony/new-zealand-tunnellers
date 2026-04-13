import { getTranslations, setRequestLocale } from "next-intl/server";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";
import { Locale } from "@/types/locale";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";
import { ogLocale, pageUrl } from "@/utils/helpers/metadata";

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

  return {
    title,
    description: tHomepage("bookDescription"),
    alternates: {
      canonical: pageUrl(locale, "/books/kiwis-dig-tunnels-too/"),
      languages: {
        en: pageUrl("en", "/books/kiwis-dig-tunnels-too/"),
        fr: pageUrl("fr", "/books/kiwis-dig-tunnels-too/"),
      },
    },
    openGraph: {
      title,
      description: tHomepage("bookDescription"),
      url: pageUrl(locale, "/books/kiwis-dig-tunnels-too/"),
      siteName: "New Zealand Tunnellers",
      locale: ogLocale(locale),
      alternateLocale: locale === "fr" ? "en_NZ" : "fr_FR",
      type: "website",
    },
  };
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
