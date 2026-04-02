"use client";

import dynamic from "next/dynamic";

import { CaveData, CavePathPoint } from "@/utils/database/queries/cavesQuery";
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
  locale: string;
};

export function WorksMapContainer({
  works,
  paths,
  caves,
  cavePaths,
  locale,
}: Props) {
  return (
    <WorksMap
      works={works}
      paths={paths}
      caves={caves}
      cavePaths={cavePaths}
      locale={locale}
    />
  );
}
