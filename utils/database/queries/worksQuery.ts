import { PoolConnection, RowDataPacket } from "mysql2/promise";

export type WorkData = {
  work_id: number;
  work_name: string;
  work_name_fr: string | null;
  work_type_en: string | null;
  work_type_fr: string | null;
  work_category_1_en: string | null;
  work_category_1_fr: string | null;
  work_category_2_en: string | null;
  work_category_2_fr: string | null;
  work_section: number | null;
  work_date_start: string | null;
  work_date_end: string | null;
  work_latitude: number;
  work_longitude: number;
};

export const worksQuery = async (connection: PoolConnection) => {
  const query = `SELECT
    work_id,
    work_name,
    work_name_fr,
    work_type_en,
    work_type_fr,
    work_category_1_en,
    work_category_1_fr,
    work_category_2_en,
    work_category_2_fr,
    work_section,
    DATE_FORMAT(work_date_start, '%Y-%m-%d') AS work_date_start,
    DATE_FORMAT(work_date_end, '%Y-%m-%d') AS work_date_end,
    work_latitude,
    work_longitude
    FROM work
    WHERE work_latitude IS NOT NULL
    ORDER BY work_date_start ASC`;

  const [results] =
    await connection.execute<(WorkData & RowDataPacket)[]>(query);
  return results;
};

export type WorkPathPoint = {
  work_id: number;
  segment: number;
  point_order: number;
  latitude: number;
  longitude: number;
};

export const workPathsQuery = async (connection: PoolConnection) => {
  const query = `SELECT work_id, segment, point_order, latitude, longitude
    FROM work_path
    ORDER BY work_id, segment, point_order`;

  const [results] =
    await connection.execute<(WorkPathPoint & RowDataPacket)[]>(query);
  return results;
};
