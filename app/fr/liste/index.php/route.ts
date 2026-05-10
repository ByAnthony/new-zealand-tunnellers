import { legacyPermanentRedirect } from "@/utils/helpers/legacyRedirect";

function redirectLegacyFrenchRollIndex() {
  return legacyPermanentRedirect("/fr/tunnellers/");
}

export function GET() {
  return redirectLegacyFrenchRollIndex();
}

export function HEAD() {
  return redirectLegacyFrenchRollIndex();
}
