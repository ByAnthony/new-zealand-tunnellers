import { PoolConnection } from "mysql2/promise";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { Locale } from "@/types/locale";
import { Tunneller, TunnellerData } from "@/types/tunnellers";

import { mysqlConnection } from "./mysqlConnection";
import { rollQuery } from "./queries/rollQuery";

export async function getTunnellers(
  locale: Locale,
  connection: PoolConnection,
) {
  const results: TunnellerData[] = await rollQuery(locale, connection);

  const tunnellers: Tunneller[] = results.map((result: TunnellerData) => ({
    id: result.id,
    slug: result.slug,
    name: {
      surname: result.surname,
      forename: result.forename,
    },
    birthYear: result.birthYear,
    deathYear: result.deathYear,
    search: {
      fullName: `${result.forename} ${result.surname}`,
    },
    detachment: result.detachment,
    detachmentEn: result.detachment_en,
    detachmentId: result.detachment_id,
    rank: result.rank,
    rankEn: result.rank_en,
    rankId: result.rank_id,
    attachedCorps: result.attached_corps,
    corpsEn: result.corps_en,
    corpsId: result.corps_id,
  }));

  return NextResponse.json(tunnellers);
}

export const getCachedTunnellers = unstable_cache(
  async (locale: Locale): Promise<Record<string, Tunneller[]>> => {
    const connection = await mysqlConnection.getConnection();
    try {
      const response = await getTunnellers(locale, connection);
      const data: Tunneller[] = await response.json();

      return data.reduce(
        (acc: Record<string, Tunneller[]>, tunneller: Tunneller) => {
          const firstLetter = tunneller.name.surname.charAt(0).toUpperCase();
          if (!acc[firstLetter]) acc[firstLetter] = [];
          acc[firstLetter].push(tunneller);
          return acc;
        },
        {},
      );
    } finally {
      connection.release();
    }
  },
  ["tunnellers"],
  { revalidate: false },
);
