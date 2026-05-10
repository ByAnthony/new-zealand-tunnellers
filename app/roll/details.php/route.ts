import { NextRequest, NextResponse } from "next/server";

function redirectLegacyRollDetails(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const path = id && /^\d+$/.test(id) ? `/tunnellers/${id}/` : "/tunnellers/";

  return NextResponse.redirect(new URL(path, request.url), {
    status: 308,
  });
}

export function GET(request: NextRequest) {
  return redirectLegacyRollDetails(request);
}

export function HEAD(request: NextRequest) {
  return redirectLegacyRollDetails(request);
}
