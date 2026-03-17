import { PoolConnection } from "mysql2/promise";
import { NextResponse } from "next/server";

import { Locale } from "@/types/locale";
import { Tunneller, TunnellerData } from "@/types/tunnellers";

import { rollQuery } from "./queries/rollQuery";

export async function getTunnellers(
  locale: Locale,
  connection: PoolConnection,
) {
  const results: TunnellerData[] = await rollQuery(locale, connection);

  const tunnellers: Tunneller[] = results.map((result: TunnellerData) => ({
    id: result.id,
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
    rank: result.rank,
    attachedCorps: result.attached_corps,
  }));

  return NextResponse.json(tunnellers);
}
