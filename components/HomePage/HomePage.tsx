"use client";

import { useEffect } from "react";

import { HeroSection } from "@/components/HomePage/HeroSection/HeroSection";
import { History } from "@/components/HomePage/History/History";
import { KiwisDigTunnelsToo } from "@/components/HomePage/KiwisDigTunnelsToo/KiwisDigTunnelsToo";
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
      <HeroSection />
      <History articles={homepage.historyChapters} />
      <KiwisDigTunnelsToo />
    </div>
  );
}
