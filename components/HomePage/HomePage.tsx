"use client";

import { useEffect } from "react";

import { History } from "@/components/HomePage/History/History";
import { Tunnellers } from "@/components/HomePage/Tunnellers/Tunnellers";
import { HistoryChapter } from "@/types/homepage";

import STYLES from "./HomePage.module.scss";

type Props = {
  homepage: {
    historyChapters: HistoryChapter[];
  };
};

export function HomePage({ homepage }: Props) {
  useEffect(() => {
    localStorage.removeItem("filters");
    localStorage.removeItem("page");
    localStorage.removeItem("roll:scrollY");
  }, []);

  return (
    <div className={STYLES["homepage-container"]}>
      <Tunnellers />
      <History articles={homepage.historyChapters} />
    </div>
  );
}
