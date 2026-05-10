import { NextRequest } from "next/server";

import {
  getLegacyTunnellerRedirectPath,
  legacyPermanentRedirect,
} from "@/utils/helpers/legacyRedirect";

async function redirectLegacyRollDetails(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const path = await getLegacyTunnellerRedirectPath(id, "en");

  return legacyPermanentRedirect(path);
}

export async function GET(request: NextRequest) {
  return redirectLegacyRollDetails(request);
}

export async function HEAD(request: NextRequest) {
  return redirectLegacyRollDetails(request);
}
