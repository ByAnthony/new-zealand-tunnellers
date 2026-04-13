import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

import { AboutUs } from "@/components/AboutUs/AboutUs";
import {
  AboutUsData,
  SectionData,
  AboutUsArticle,
  ImageData,
} from "@/types/article";
import { Locale } from "@/types/locale";
import { mysqlConnection } from "@/utils/database/mysqlConnection";
import {
  aboutUsTitle,
  aboutUsSections,
  aboutUsImage,
} from "@/utils/database/queries/aboutUsQuery";
import { ogLocale, pageUrl } from "@/utils/helpers/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

async function getData(locale: Locale) {
  const connection = await mysqlConnection.getConnection();

  try {
    const data: AboutUsData = await aboutUsTitle(locale, connection);
    const sections: SectionData[] = await aboutUsSections(locale, connection);
    const images: ImageData[] = await aboutUsImage(locale, connection);

    const article: AboutUsArticle = {
      id: data.id,
      title: data.title,
      section: sections,
      image: images,
    };

    return NextResponse.json(article);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch About Us data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "site" });
  const title = `${t("aboutUs")} - New Zealand Tunnellers`;
  const description = t("aboutUsDescription");

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl(locale, "/about-us/"),
      languages: {
        en: pageUrl("en", "/about-us/"),
        fr: pageUrl("fr", "/about-us/"),
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl(locale, "/about-us/"),
      siteName: "New Zealand Tunnellers",
      locale: ogLocale(locale),
      alternateLocale: locale === "fr" ? "en_NZ" : "fr_FR",
      type: "website",
    },
  };
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const response = await getData(locale);
  const article: AboutUsArticle = await response.json();

  return <AboutUs article={article} />;
}
