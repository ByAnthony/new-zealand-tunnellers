import { PoolConnection, RowDataPacket } from "mysql2/promise";

export type CaveData = {
  cave_id: number;
  cave_name_en: string;
  cave_name_fr: string;
  cave_type_en: string;
  cave_type_fr: string;
  cave_latitude: number;
  cave_longitude: number;
};

export const cavesQuery = async (connection: PoolConnection) => {
  const query = `SELECT
    cave_id,
    cave_name_en,
    cave_name_fr,
    cave_type_en,
    cave_type_fr,
    cave_latitude,
    cave_longitude
    FROM cave`;

  const [results] =
    await connection.execute<(CaveData & RowDataPacket)[]>(query);
  return results;
};

export type CavePathPoint = {
  cave_id: number;
  segment: number;
  point_order: number;
  latitude: number;
  longitude: number;
};

export const cavePathsQuery = async (connection: PoolConnection) => {
  const query = `SELECT cave_id, segment, point_order, latitude, longitude
    FROM cave_path
    ORDER BY cave_id, segment, point_order`;

  const [results] =
    await connection.execute<(CavePathPoint & RowDataPacket)[]>(query);
  return results;
};
