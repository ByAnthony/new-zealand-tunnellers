import { NextResponse } from "next/server";

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
  chapterQuery,
  sectionsQuery,
  imagesQuery,
  nextArticleQuery,
} from "@/utils/database/queries/historyChapterQuery";
import { getNextChapter } from "@/utils/helpers/article";

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

export async function generateMetadata(props: Props) {
  const { id, locale } = await props.params;
  const response = await getData(id, locale);
  const article: Chapter = await response.json();

  const title = article.title.replace(/\\/g, " ");

  return {
    title: `${title} - New Zealand Tunnellers`,
  };
}

export default async function Page(props: Props) {
  const { id, locale } = await props.params;
  const response = await getData(id, locale);
  const article: Chapter = await response.json();

  return <Article article={article} />;
}
