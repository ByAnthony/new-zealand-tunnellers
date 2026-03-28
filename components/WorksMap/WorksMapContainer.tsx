"use client";

import dynamic from "next/dynamic";

import { WorkData } from "@/utils/database/queries/worksQuery";

const WorksMap = dynamic(
  () => import("@/components/WorksMap/WorksMap").then((m) => m.WorksMap),
  {
    ssr: false,
    loading: () => <div style={{ height: "600px" }} />,
  },
);

type Props = {
  works: WorkData[];
  locale: string;
};

export function WorksMapContainer({ works, locale }: Props) {
  return <WorksMap works={works} locale={locale} />;
}
