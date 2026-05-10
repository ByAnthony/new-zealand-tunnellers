import { legacyPermanentRedirect } from "@/utils/helpers/legacyRedirect";

function redirectLegacyRollIndex() {
  return legacyPermanentRedirect("/tunnellers/");
}

export function GET() {
  return redirectLegacyRollIndex();
}

export function HEAD() {
  return redirectLegacyRollIndex();
}
