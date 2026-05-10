import { NextRequest, NextResponse } from "next/server";

function redirectLegacyRollIndex(request: NextRequest) {
  return NextResponse.redirect(new URL("/tunnellers/", request.url), {
    status: 308,
  });
}

export function GET(request: NextRequest) {
  return redirectLegacyRollIndex(request);
}

export function HEAD(request: NextRequest) {
  return redirectLegacyRollIndex(request);
}
