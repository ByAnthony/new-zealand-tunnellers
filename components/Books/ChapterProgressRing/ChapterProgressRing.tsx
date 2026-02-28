"use client";

import React, { useEffect, useState } from "react";

import {
  CHAPTER_PROGRESS_EVENT,
  getChapterProgress,
} from "@/utils/helpers/books/chapterProgressUtil";

import STYLES from "./ChapterProgressRing.module.scss";

type Props = {
  pathname: string;
};

export const ChapterProgressRing = ({ pathname }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setProgress(getChapterProgress(pathname));
    handleUpdate();
    window.addEventListener(CHAPTER_PROGRESS_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(CHAPTER_PROGRESS_EVENT, handleUpdate);
  }, [pathname]);

  const isComplete = progress === 100;

  return (
    <div
      className={STYLES.ring}
      style={{ "--progress": progress } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className={STYLES.inner}>{isComplete ? "✓" : "→"}</div>
    </div>
  );
};
