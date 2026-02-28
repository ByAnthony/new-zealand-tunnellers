"use client";

import { useSyncExternalStore } from "react";

import {
  CHAPTER_PROGRESS_EVENT,
  getChapterProgress,
} from "@/utils/helpers/books/chapterProgressUtil";

import STYLES from "./ChapterProgressRing.module.scss";

type Props = {
  pathname: string;
};

const RING_RADIUS = 27.5;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function subscribeToProgressUpdates(callback: () => void): () => void {
  window.addEventListener(CHAPTER_PROGRESS_EVENT, callback);
  return () => window.removeEventListener(CHAPTER_PROGRESS_EVENT, callback);
}

export const ChapterProgressRing = ({ pathname }: Props) => {
  const progress = useSyncExternalStore(
    subscribeToProgressUpdates,
    () => getChapterProgress(pathname),
    () => 0,
  );

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
