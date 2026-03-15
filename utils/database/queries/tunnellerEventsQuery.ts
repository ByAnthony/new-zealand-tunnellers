import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { Locale } from "@/types/locale";
import { SingleEventData } from "@/types/tunneller";

export const tunnellerEventsQuery = async (
  id: string,
  locale: Locale,
  connection: PoolConnection,
) => {
  const query = `SELECT
    DATE_FORMAT(event_join.event_date, '%Y-%m-%d') AS date
    , event_join.event_${locale} AS event
    , event_join.event_title AS title
    , event_join.event_img AS image
    FROM event_join
    WHERE event_join.event_t_id=${id} ORDER BY date ASC, event_join.event_sequence`;

  const [results] =
    await connection.execute<(SingleEventData & RowDataPacket)[]>(query);
  return results;
};
