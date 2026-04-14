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
import {
  allArticleIdsQuery,
  chapterQuery,
  sectionsQuery,
  imagesQuery,
  nextArticleQuery,
} from "@/utils/database/queries/historyChapterQuery";
import { withConnection } from "@/utils/database/withConnection";
import { getNextChapter } from "@/utils/helpers/article";
import { buildPageMetadata, pageUrl } from "@/utils/helpers/metadata";

type Props = {
  params: Promise<{ id: string; locale: Locale }>;
};

async function getData(id: string, locale: Locale) {
  try {
    return await withConnection(async (connection) => {
      const data: ArticleData = await chapterQuery(id, locale, connection);
      const section: SectionData[] = await sectionsQuery(
        id,
        locale,
        connection,
      );
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

      return article;
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Chapter data: ${errorMessage}`);
  }
}

export async function generateStaticParams() {
  const ids = await withConnection((connection) =>
    allArticleIdsQuery(connection),
  );
  return ids.map((id) => ({ id }));
}

export async function generateMetadata(props: Props) {
  const { id, locale } = await props.params;
  const article: Chapter = await getData(id, locale);

  const t = await getTranslations({ locale, namespace: "site" });
  const chapterTitle = article.title.replace(/\\/g, " ");
  const title = `${chapterTitle} - New Zealand Tunnellers`;
  const description = t("historyChapterDescription", { title: chapterTitle });

  return buildPageMetadata({
    locale,
    title,
    description,
    path: `/history/${id}/`,
    type: "article",
  });
}

export default async function Page(props: Props) {
  const { id, locale } = await props.params;
  setRequestLocale(locale);
  const article: Chapter = await getData(id, locale);

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
