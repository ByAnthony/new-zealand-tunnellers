import { PoolConnection } from "mysql2/promise";
import { unstable_cache } from "next/cache";

import { Locale } from "@/types/locale";
import { Tunneller, TunnellerData } from "@/types/tunnellers";

import { rollQuery } from "./queries/rollQuery";
import { withConnection } from "./withConnection";

// Bump after database changes that affect the roll/search data.
const TUNNELLERS_CACHE_VERSION = "2026-05-03-marital-status-filter";

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
    maritalStatus: result.marital_status,
    maritalStatusEn: result.marital_status_en,
    maritalStatusId: result.marital_status_id,
  }));

  return tunnellers;
}

export const getCachedTunnellers = unstable_cache(
  async (locale: Locale): Promise<Record<string, Tunneller[]>> => {
    const data = await withConnection((connection) =>
      getTunnellers(locale, connection),
    );

    return data.reduce(
      (acc: Record<string, Tunneller[]>, tunneller: Tunneller) => {
        const firstLetter = tunneller.name.surname.charAt(0).toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(tunneller);
        return acc;
      },
      {},
    );
  },
  ["tunnellers", TUNNELLERS_CACHE_VERSION],
  { revalidate: false },
);
