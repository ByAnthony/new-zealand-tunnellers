import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { Locale } from "@/types/locale";
import { TunnellerData } from "@/types/tunnellers";

export const rollQuery = async (locale: Locale, connection: PoolConnection) => {
  const query = `SELECT t.id
    , t.slug
    , t.surname
    , t.forename
    , DATE_FORMAT(t.birth_date, '%Y') AS birthYear
    , DATE_FORMAT(t.death_date, '%Y') AS deathYear
    , embarkation_unit.embarkation_unit_${locale} AS detachment
    , embarkation_unit.embarkation_unit_id AS detachment_id
    , rank.rank_${locale} AS rank
    , rank.rank_id AS rank_id
    , attached_corps.corps_${locale} AS attached_corps
    , attached_corps.corps_id AS corps_id

    FROM tunneller t

    LEFT JOIN embarkation_unit ON t.embarkation_unit_fk=embarkation_unit.embarkation_unit_id
    LEFT JOIN rank ON t.rank_fk=rank.rank_id
    LEFT JOIN corps attached_corps ON t.attached_corps_fk=attached_corps.corps_id

    ORDER BY t.surname, t.forename ASC`;

  const [results] =
    await connection.execute<(TunnellerData & RowDataPacket)[]>(query);
  return results;
};
