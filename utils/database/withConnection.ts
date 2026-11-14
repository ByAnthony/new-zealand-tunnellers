import { PoolConnection } from "mysql2/promise";

import { mysqlConnection } from "@/utils/database/mysqlConnection";

export async function withConnection<T>(
  callback: (_connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await mysqlConnection.getConnection();

  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}
