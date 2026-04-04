import { PoolConnection, RowDataPacket } from "mysql2/promise";

export type FrontLineData = {
  front_line_id: number;
  front_line_date: string;
  front_line_side: "british" | "german";
  front_line_period_start: string;
  front_line_period_end: string;
};

export const frontLinesQuery = async (connection: PoolConnection) => {
  const query = `SELECT
    front_line_id,
    DATE_FORMAT(front_line_date, '%Y-%m-%d') AS front_line_date,
    front_line_side,
    DATE_FORMAT(front_line_period_start, '%Y-%m-%d') AS front_line_period_start,
    DATE_FORMAT(front_line_period_end, '%Y-%m-%d') AS front_line_period_end
    FROM front_line
    ORDER BY front_line_date ASC`;

  const [results] =
    await connection.execute<(FrontLineData & RowDataPacket)[]>(query);
  return results;
};

export type FrontLinePathPoint = {
  front_line_id: number;
  segment: number;
  point_order: number;
  latitude: number;
  longitude: number;
};

export const frontLinePathsQuery = async (connection: PoolConnection) => {
  const query = `SELECT front_line_id, segment, point_order, latitude, longitude
    FROM front_line_path
    ORDER BY front_line_id, segment, point_order`;

  const [results] =
    await connection.execute<(FrontLinePathPoint & RowDataPacket)[]>(query);
  return results;
};
