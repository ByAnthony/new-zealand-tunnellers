import { NextRequest, NextResponse } from "next/server";

function redirectLegacyFrenchRollIndex(request: NextRequest) {
  return NextResponse.redirect(new URL("/fr/tunnellers/", request.url), {
    status: 308,
  });
}

export function GET(request: NextRequest) {
  return redirectLegacyFrenchRollIndex(request);
}

export function HEAD(request: NextRequest) {
  return redirectLegacyFrenchRollIndex(request);
}
