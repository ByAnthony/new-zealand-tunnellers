import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Roll } from "@/components/Roll/Roll";
import { Locale } from "@/types/locale";
import { Tunneller } from "@/types/tunnellers";
import { getTunnellers } from "@/utils/database/getTunnellers";
import { mysqlConnection } from "@/utils/database/mysqlConnection";

type Props = {
  params: Promise<{ locale: Locale }>;
};

const getCachedTunnellers = unstable_cache(
  async (locale: Locale): Promise<Record<string, Tunneller[]>> => {
    const connection = await mysqlConnection.getConnection();

    try {
      const response = await getTunnellers(locale, connection);
      const data: Tunneller[] = await response.json();

      return data.reduce(
        (acc: Record<string, Tunneller[]>, tunneller: Tunneller) => {
          const firstLetter = tunneller.name.surname.charAt(0).toUpperCase();
          if (!acc[firstLetter]) acc[firstLetter] = [];
          acc[firstLetter].push(tunneller);
          return acc;
        },
        {},
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch Tunnellers data: ${errorMessage}`);
    } finally {
      connection.release();
    }
  },
  ["tunnellers"],
  { revalidate: false },
);

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "site" });
  return { title: `${t("tunnellers")} - New Zealand Tunnellers` };
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const tunnellers = await getCachedTunnellers(locale);

  return (
    <Suspense>
      <Roll tunnellers={tunnellers} />
    </Suspense>
  );
}
