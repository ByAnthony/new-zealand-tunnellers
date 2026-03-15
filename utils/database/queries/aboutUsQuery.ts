import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { AboutUsData, ImageData, SectionData } from "@/types/article";

export const aboutUsTitle = async (connection: PoolConnection) => {
  const query = `SELECT
    about_us.string_id AS id
    , about_us.title_en AS title
    FROM about_us
    WHERE about_us.string_id="about-us"`;

  const [results] =
    await connection.execute<(AboutUsData & RowDataPacket)[]>(query);
  return results[0];
};

export const aboutUsSections = async (connection: PoolConnection) => {
  const query = `SELECT
    about_us_section.title_en AS title
    , about_us_section.text_en AS text
    FROM about_us_section
    JOIN about_us_section_join ON about_us_section_join.about_us_section_id=about_us_section.id
    WHERE about_us_section_join.about_us_id="about-us"`;

  const [results] =
    await connection.execute<(SectionData & RowDataPacket)[]>(query);
  return results;
};

export const aboutUsImage = async (connection: PoolConnection) => {
  const query = `SELECT
        about_us_image.file AS file
        , about_us_image.alt_en AS alt
        FROM about_us_image
        JOIN about_us_image_join ON about_us_image_join.about_us_image_id=about_us_image.id
        WHERE about_us_image_join.about_us_id="about-us"`;

  const [results] =
    await connection.execute<(ImageData & RowDataPacket)[]>(query);
  return results;
};
