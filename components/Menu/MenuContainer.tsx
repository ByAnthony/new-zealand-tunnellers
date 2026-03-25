import { getLocale } from "next-intl/server";

import { Menu } from "@/components/Menu/Menu";
import { Locale } from "@/types/locale";
import { getCachedTunnellers } from "@/utils/database/getTunnellers";

export async function MenuContainer() {
  const locale = (await getLocale()) as Locale;
  const grouped = await getCachedTunnellers(locale);
  const tunnellers = Object.values(grouped).flat();

  return <Menu tunnellers={tunnellers} />;
}
