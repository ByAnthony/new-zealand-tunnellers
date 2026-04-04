import { NextResponse } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Article } from "@/components/Article/Article";
import {
  ArticleData,
  SectionData,
  ArticleReferenceData,
  Chapter,
  ImageData,
} from "@/types/article";
import { Locale } from "@/types/locale";
import { mysqlConnection } from "@/utils/database/mysqlConnection";
import {
  allArticleIdsQuery,
  chapterQuery,
  sectionsQuery,
  imagesQuery,
  nextArticleQuery,
} from "@/utils/database/queries/historyChapterQuery";
import { getNextChapter } from "@/utils/helpers/article";
import { ogLocale, pageUrl } from "@/utils/helpers/metadata";

type Props = {
  params: Promise<{ id: string; locale: Locale }>;
};

async function getData(id: string, locale: Locale) {
  const connection = await mysqlConnection.getConnection();

  try {
    const data: ArticleData = await chapterQuery(id, locale, connection);
    const section: SectionData[] = await sectionsQuery(id, locale, connection);
    const images: ImageData[] = await imagesQuery(id, locale, connection);
    const nextArticle: ArticleReferenceData[] = await nextArticleQuery(
      locale,
      connection,
    );

    const article: Chapter = {
      id: data.id,
      chapter: data.chapter,
      title: data.title,
      section: section,
      image: images,
      next: getNextChapter(data.chapter, nextArticle),
      notes: data.notes,
    };

    return NextResponse.json(article);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Chapter data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export async function generateStaticParams() {
  const connection = await mysqlConnection.getConnection();
  try {
    const ids = await allArticleIdsQuery(connection);
    return ids.map((id) => ({ id }));
  } finally {
    connection.release();
  }
}

export async function generateMetadata(props: Props) {
  const { id, locale } = await props.params;
  const response = await getData(id, locale);
  const article: Chapter = await response.json();

  const t = await getTranslations({ locale, namespace: "site" });
  const chapterTitle = article.title.replace(/\\/g, " ");
  const title = `${chapterTitle} - New Zealand Tunnellers`;

  return {
    title,
    openGraph: {
      title,
      description: t("historyChapterDescription", { title: chapterTitle }),
      url: pageUrl(locale, `/history/${id}/`),
      siteName: "New Zealand Tunnellers",
      locale: ogLocale(locale),
      alternateLocale: locale === "fr" ? "en_NZ" : "fr_FR",
      type: "article",
    },
  };
}

export default async function Page(props: Props) {
  const { id, locale } = await props.params;
  setRequestLocale(locale);
  const response = await getData(id, locale);
  const article: Chapter = await response.json();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title.replace(/\\/g, " "),
    inLanguage: locale,
    url: pageUrl(locale, `/history/${id}/`),
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
      <Article article={article} />
    </>
  );
}
