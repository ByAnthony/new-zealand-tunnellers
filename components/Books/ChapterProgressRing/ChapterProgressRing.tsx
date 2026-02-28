"use client";

import { useEffect, useState } from "react";

import { getChapterProgress } from "@/utils/helpers/books/chapterProgressUtil";

import STYLES from "./ChapterProgressRing.module.scss";

type Props = {
  pathname: string;
};

const RING_RADIUS = 27.5;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const ChapterProgressRing = ({ pathname }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(getChapterProgress(pathname));
  }, [pathname]);

  const offset = CIRCUMFERENCE * (1 - progress / 100);
  const isComplete = progress === 100;

  return (
    <div className={STYLES.ring} aria-hidden="true">
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r={RING_RADIUS} className={STYLES.track} />
        <circle
          cx="30"
          cy="30"
          r={RING_RADIUS}
          className={STYLES.progress}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 30 30)"
        />
        <circle cx="30" cy="30" r="21" className={STYLES.inner} />
        <text
          x="30"
          y="30"
          className={STYLES.icon}
          dominantBaseline="central"
          textAnchor="middle"
        >
          {isComplete ? "✓" : "→"}
        </text>
      </svg>
    </div>
  );
};
