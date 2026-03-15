import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { Locale } from "@/types/locale";
import { Medal } from "@/types/tunneller";

export const medalsQuery = async (
  id: string,
  locale: Locale,
  connection: PoolConnection,
) => {
  const query = `SELECT
    medal.medal_name_${locale} AS name
    , country.country_${locale} AS country
    , medal_citation.medal_citation_${locale} AS citation
    , medal_image AS image
    FROM medal
    JOIN medal_join ON medal_join.medal_m_id=medal.medal_id
    LEFT JOIN medal_citation ON medal_citation.medal_citation_id=medal_c_id
    LEFT JOIN country ON country.country_id=medal_m_c_id
    WHERE medal_join.medal_t_id=${id}`;

  const [results] = await connection.execute<(Medal & RowDataPacket)[]>(query, [
    id,
  ]);
  return results;
};
