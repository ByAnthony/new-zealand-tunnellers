import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { SingleEventData } from "@/types/tunneller";

export const companyEventsQuery = async (connection: PoolConnection) => {
  const query = `SELECT
    DATE_FORMAT(company_events.company_events_date, '%Y-%m-%d') AS date
    , company_events.company_events_event_en AS event
    , company_events.company_events_title_en AS title
    , company_events.company_events_img AS image
    , company_events.company_events_img_alt_en AS imageAlt
    FROM company_events
    ORDER BY date ASC`;

  const [results] =
    await connection.execute<(SingleEventData & RowDataPacket)[]>(query);
  return results;
};
