import { PoolConnection, RowDataPacket } from "mysql2/promise";

import {
  ArticleData,
  ArticleReferenceData,
  ImageData,
  SectionData,
} from "@/types/article";
import { Locale } from "@/types/locale";

export const chapterQuery = async (
  id: string,
  locale: Locale,
  connection: PoolConnection,
) => {
  const query = `SELECT
    article.string_id AS id
    , article.id AS chapter
    , article.title_${locale} AS title
    , article.notes_${locale} AS notes
    FROM article
    WHERE article.string_id="${id}"`;

  const [results] = await connection.execute<(ArticleData & RowDataPacket)[]>(
    query,
    [id],
  );
  return results[0];
};

export const sectionsQuery = async (
  id: string,
  locale: Locale,
  connection: PoolConnection,
) => {
  const query = `SELECT
    article_section.title_${locale} AS title
    , article_section.text_${locale} AS text
    FROM article_section
    JOIN article_section_join ON article_section_join.section_id=article_section.id
    WHERE article_section_join.article_id="${id}"`;

  const [results] = await connection.execute<(SectionData & RowDataPacket)[]>(
    query,
    [id],
  );
  return results;
};

export const imagesQuery = async (
  id: string,
  locale: Locale,
  connection: PoolConnection,
) => {
  const query = `SELECT
    article_image.file AS file
    , article_image.title_${locale} AS title
    , article_image.photographer_${locale} AS photographer
    , article_image.reference_${locale} AS reference
    , article_image.alt_${locale} AS alt
    FROM article_image
    JOIN article_image_join ON article_image_join.image_id=article_image.id
    WHERE article_image_join.article_id="${id}"`;

  const [results] = await connection.execute<(ImageData & RowDataPacket)[]>(
    query,
    [id],
  );
  return results;
};

export const nextArticleQuery = async (
  locale: Locale,
  connection: PoolConnection,
) => {
  const query = `SELECT
    article.string_id AS id
    , article.id AS chapter
    , article.title_${locale} AS title
    FROM article`;

  const [results] =
    await connection.execute<(ArticleReferenceData & RowDataPacket)[]>(query);
  return results;
};
