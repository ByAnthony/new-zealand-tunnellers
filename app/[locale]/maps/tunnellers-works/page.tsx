import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { WorksMapContainer } from "@/components/WorksMap/WorksMapContainer";
import { Locale } from "@/types/locale";
import {
  cavesQuery,
  cavePathsQuery,
  CaveData,
  CavePathPoint,
} from "@/utils/database/queries/cavesQuery";
import {
  frontLinesQuery,
  frontLinePathsQuery,
  FrontLineData,
  FrontLinePathPoint,
} from "@/utils/database/queries/frontLinesQuery";
import {
  subwaysQuery,
  subwayPathsQuery,
  SubwayData,
  SubwayPathPoint,
} from "@/utils/database/queries/subwaysQuery";
import {
  worksQuery,
  workPathsQuery,
  WorkData,
  WorkPathPoint,
} from "@/utils/database/queries/worksQuery";
import { withConnection } from "@/utils/database/withConnection";
import { buildPageMetadata } from "@/utils/helpers/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

async function getData() {
  try {
    return await withConnection(async (connection) => {
      const works = await worksQuery(connection);
      const paths = await workPathsQuery(connection);
      const caves = await cavesQuery(connection);
      const cavePaths = await cavePathsQuery(connection);
      const subways = await subwaysQuery(connection);
      const subwayPaths = await subwayPathsQuery(connection);
      const frontLines = await frontLinesQuery(connection);
      const frontLinePaths = await frontLinePathsQuery(connection);
      return {
        works,
        paths,
        caves,
        cavePaths,
        subways,
        subwayPaths,
        frontLines,
        frontLinePaths,
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch works data: ${errorMessage}`);
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const tMaps = await getTranslations({ locale, namespace: "maps" });

  return buildPageMetadata({
    locale,
    title: `${t("map")} - New Zealand Tunnellers`,
    description: tMaps("mapDescription"),
    path: "/maps/tunnellers-works/",
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const {
    works,
    paths,
    caves,
    cavePaths,
    subways,
    subwayPaths,
    frontLines,
    frontLinePaths,
  }: {
    works: WorkData[];
    paths: WorkPathPoint[];
    caves: CaveData[];
    cavePaths: CavePathPoint[];
    subways: SubwayData[];
    subwayPaths: SubwayPathPoint[];
    frontLines: FrontLineData[];
    frontLinePaths: FrontLinePathPoint[];
  } = await getData();

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <WorksMapContainer
        key={locale}
        works={works}
        paths={paths}
        caves={caves}
        cavePaths={cavePaths}
        subways={subways}
        subwayPaths={subwayPaths}
        frontLines={frontLines}
        frontLinePaths={frontLinePaths}
        locale={locale}
      />
    </Suspense>
  );
}
