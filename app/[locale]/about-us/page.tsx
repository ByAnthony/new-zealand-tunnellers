import { getTranslations } from "next-intl/server";

import { AboutUs } from "@/components/AboutUs/AboutUs";
import {
  AboutUsData,
  SectionData,
  AboutUsArticle,
  ImageData,
} from "@/types/article";
import { Locale } from "@/types/locale";
import {
  aboutUsTitle,
  aboutUsSections,
  aboutUsImage,
} from "@/utils/database/queries/aboutUsQuery";
import { withConnection } from "@/utils/database/withConnection";
import { buildPageMetadata } from "@/utils/helpers/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

async function getData(locale: Locale) {
  try {
    return await withConnection(async (connection) => {
      const data: AboutUsData = await aboutUsTitle(locale, connection);
      const sections: SectionData[] = await aboutUsSections(locale, connection);
      const images: ImageData[] = await aboutUsImage(locale, connection);

      const article: AboutUsArticle = {
        id: data.id,
        title: data.title,
        section: sections,
        image: images,
      };

      return article;
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch About Us data: ${errorMessage}`);
  }
}

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "site" });
  const title = `${t("aboutUs")} - New Zealand Tunnellers`;
  const description = t("aboutUsDescription");

  return buildPageMetadata({
    locale,
    title,
    description,
    path: "/about-us/",
  });
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const article: AboutUsArticle = await getData(locale);

  return <AboutUs article={article} />;
}
