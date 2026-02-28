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
    const handleUpdate = () => setProgress(getChapterProgress(pathname));
    handleUpdate();
  }, [pathname]);

  const isComplete = progress === 100;

  return (
    <div
      className={STYLES.ring}
      style={
        {
          ...(progress > 2 && { "--progress": progress }),
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div className={STYLES.inner}>
        {isComplete ? <div className={STYLES.checkmark}>✓</div> : "→"}
      </div>
    </div>
  );
};
