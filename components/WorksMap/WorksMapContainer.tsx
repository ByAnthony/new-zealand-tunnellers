"use client";

import dynamic from "next/dynamic";

import { CaveData, CavePathPoint } from "@/utils/database/queries/cavesQuery";
import {
  FrontLineData,
  FrontLinePathPoint,
} from "@/utils/database/queries/frontLinesQuery";
import {
  SubwayData,
  SubwayPathPoint,
} from "@/utils/database/queries/subwaysQuery";
import { WorkData, WorkPathPoint } from "@/utils/database/queries/worksQuery";

const WorksMap = dynamic(
  () => import("@/components/WorksMap/WorksMap").then((m) => m.WorksMap),
  {
    ssr: false,
    loading: () => <div style={{ height: "600px" }} />,
  },
);

type Props = {
  works: WorkData[];
  paths: WorkPathPoint[];
  caves: CaveData[];
  cavePaths: CavePathPoint[];
  subways: SubwayData[];
  subwayPaths: SubwayPathPoint[];
  frontLines: FrontLineData[];
  frontLinePaths: FrontLinePathPoint[];
  locale: string;
};

export function WorksMapContainer({
  works,
  paths,
  caves,
  cavePaths,
  subways,
  subwayPaths,
  frontLines,
  frontLinePaths,
  locale,
}: Props) {
  return (
    <WorksMap
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
  );
}
