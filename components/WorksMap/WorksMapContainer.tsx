"use client";

import dynamic from "next/dynamic";

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
  locale: string;
};

export function WorksMapContainer({ works, paths, locale }: Props) {
  return <WorksMap works={works} paths={paths} locale={locale} />;
}
