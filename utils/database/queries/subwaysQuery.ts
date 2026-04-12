import { PoolConnection, RowDataPacket } from "mysql2/promise";

export type SubwayData = {
  subway_id: number;
  subway_name_en: string;
  subway_name_fr: string;
  subway_type_en: string;
  subway_type_fr: string;
  subway_date_start: string | null;
  subway_date_end: string | null;
  subway_latitude: number;
  subway_longitude: number;
  subway_note_en: string | null;
  subway_note_fr: string | null;
};

export const subwaysQuery = async (connection: PoolConnection) => {
  const query = `SELECT
    subway_id,
    subway_name_en,
    subway_name_fr,
    subway_type_en,
    subway_type_fr,
    subway_date_start,
    subway_date_end,
    subway_latitude,
    subway_longitude,
    subway_note_en,
    subway_note_fr
    FROM subway`;

  const [results] =
    await connection.execute<(SubwayData & RowDataPacket)[]>(query);
  return results;
};

export type SubwayPathPoint = {
  subway_id: number;
  segment: number;
  point_order: number;
  latitude: number;
  longitude: number;
};

export const subwayPathsQuery = async (connection: PoolConnection) => {
  const query = `SELECT subway_id, segment, point_order, latitude, longitude
    FROM subway_path
    ORDER BY subway_id, segment, point_order`;

  const [results] =
    await connection.execute<(SubwayPathPoint & RowDataPacket)[]>(query);
  return results;
};
