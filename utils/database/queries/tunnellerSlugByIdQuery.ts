import { PoolConnection, RowDataPacket } from "mysql2/promise";

export const tunnellerSlugByIdQuery = async (
  id: string,
  connection: PoolConnection,
): Promise<string | null> => {
  const query = `SELECT slug FROM tunneller WHERE id = ${id}`;
  const [results] = await connection.execute<RowDataPacket[]>(query);
  return results[0]?.slug ?? null;
};
