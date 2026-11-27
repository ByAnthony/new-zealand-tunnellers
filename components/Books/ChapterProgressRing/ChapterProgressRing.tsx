"use client";

import React, { useEffect, useState } from "react";

import { getChapterProgress } from "@/utils/helpers/books/chapterProgressUtil";

import STYLES from "./ChapterProgressRing.module.scss";

type Props = {
  pathname: string;
};

export const ChapterProgressRing = ({ pathname }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reading localStorage must happen after hydration
    const handleUpdate = () => setProgress(getChapterProgress(pathname));
    const frame = window.requestAnimationFrame(handleUpdate);
    window.addEventListener("pageshow", handleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", handleUpdate);
    };
  }, [pathname]);

  const isComplete = progress === 100;

  return (
    <div
      className={STYLES.ring}
      style={{ "--progress": progress } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className={STYLES.inner}>
        {isComplete ? <div className={STYLES.checkmark}>✓</div> : "→"}
      </div>
    </div>
  );
};
