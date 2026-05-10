import { NextRequest, NextResponse } from "next/server";

function redirectLegacyFrenchRollDetails(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const path =
    id && /^\d+$/.test(id) ? `/fr/tunnellers/${id}/` : "/fr/tunnellers/";

  return NextResponse.redirect(new URL(path, request.url), {
    status: 308,
  });
}

export function GET(request: NextRequest) {
  return redirectLegacyFrenchRollDetails(request);
}

export function HEAD(request: NextRequest) {
  return redirectLegacyFrenchRollDetails(request);
}
