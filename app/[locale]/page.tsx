import { NextResponse } from "next/server";

import { HomePage } from "@/components/HomePage/HomePage";
import { HistoryImageChapters, HistoryChapterData } from "@/types/homepage";
import { Locale } from "@/types/locale";
import { mysqlConnection } from "@/utils/database/mysqlConnection";
import {
  historyImageChaptersQuery,
  historyChaptersQuery,
} from "@/utils/database/queries/homepageQuery";
import { getHistoryChapters } from "@/utils/helpers/homepage";

type Props = {
  params: Promise<{ locale: Locale }>;
};

async function getData(locale: Locale) {
  const connection = await mysqlConnection.getConnection();

  try {
    const historyImageChapters: HistoryImageChapters[] =
      await historyImageChaptersQuery(connection);
    const historyChapters: HistoryChapterData[] = await historyChaptersQuery(
      locale,
      connection,
    );

    const homepage = {
      historyChapters: getHistoryChapters(
        historyChapters,
        historyImageChapters,
      ),
    };

    return NextResponse.json(homepage);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Homepage data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const response = await getData(locale);
  const homepage = await response.json();

  return <HomePage homepage={homepage} />;
}
