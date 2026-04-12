import { NextRequest, NextResponse } from "next/server";

import { Locale } from "@/types/locale";
import { Tunneller } from "@/types/tunnellers";
import { getCachedTunnellers } from "@/utils/database/getTunnellers";

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "fr";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query")?.trim() ?? "";
  const requestedLocale = searchParams.get("locale");
  const locale: Locale = isLocale(requestedLocale) ? requestedLocale : "en";

  if (query.length === 0) {
    return NextResponse.json([]);
  }

  const searchParts = query.toLowerCase().split(/\s+/);
  const grouped = await getCachedTunnellers(locale);
  const matches = Object.values(grouped)
    .flat()
    .filter((tunneller: Tunneller) => {
      const fullName = tunneller.search.fullName?.toLowerCase() ?? "";
      return searchParts.every((part) => fullName.includes(part));
    });

  return NextResponse.json(matches);
}
