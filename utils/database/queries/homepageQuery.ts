import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { HistoryChapterData, HistoryImageChapters } from "@/types/homepage";

export const historyChaptersQuery = async (connection: PoolConnection) => {
  const query = `SELECT
    article.string_id AS id
    , article.id AS chapter
    , article.title_en AS title
    FROM article`;

  const [results] =
    await connection.execute<(HistoryChapterData & RowDataPacket)[]>(query);
  return results;
};

export const historyImageChaptersQuery = async (connection: PoolConnection) => {
  const query = `SELECT
    article_image.file
    FROM article_image
    JOIN article_image_join ON article_image_join.image_id=article_image.id
    WHERE title_en IS NULL`;

  const [results] =
    await connection.execute<(HistoryImageChapters & RowDataPacket)[]>(query);
  return results;
};
