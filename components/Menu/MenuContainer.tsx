import { getLocale } from "next-intl/server";

import { Menu } from "@/components/Menu/Menu";
import { Locale } from "@/types/locale";
import { getTunnellers } from "@/utils/database/getTunnellers";
import { mysqlConnection } from "@/utils/database/mysqlConnection";

async function getData(locale: Locale) {
  const connection = await mysqlConnection.getConnection();

  try {
    return getTunnellers(locale, connection);
  } catch (error) {
    throw new Error(`Failed to fetch Menu data: ${(error as Error).message}`);
  } finally {
    connection.release();
  }
}

export async function MenuContainer() {
  const locale = (await getLocale()) as Locale;
  const response = await getData(locale);
  const tunnellers = await response.json();

  return <Menu tunnellers={tunnellers} />;
}
