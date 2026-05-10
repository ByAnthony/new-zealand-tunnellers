import { NextRequest } from "next/server";

import {
  getLegacyTunnellerRedirectPath,
  legacyPermanentRedirect,
} from "@/utils/helpers/legacyRedirect";

async function redirectLegacyFrenchRollDetails(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const path = await getLegacyTunnellerRedirectPath(id, "fr");

  return legacyPermanentRedirect(path);
}

export async function GET(request: NextRequest) {
  return redirectLegacyFrenchRollDetails(request);
}

export async function HEAD(request: NextRequest) {
  return redirectLegacyFrenchRollDetails(request);
}
