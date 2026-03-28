import { NextResponse } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { WorksMapContainer } from "@/components/WorksMap/WorksMapContainer";
import { Locale } from "@/types/locale";
import { mysqlConnection } from "@/utils/database/mysqlConnection";
import { worksQuery, WorkData } from "@/utils/database/queries/worksQuery";

type Props = {
  params: Promise<{ locale: Locale }>;
};

async function getData() {
  const connection = await mysqlConnection.getConnection();
  try {
    const results = await worksQuery(connection);
    return NextResponse.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch works data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return { title: `${t("map")} - New Zealand Tunnellers` };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const response = await getData();
  const works: WorkData[] = await response.json();

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <WorksMapContainer key={locale} works={works} locale={locale} />
    </Suspense>
  );
}
