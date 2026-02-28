"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CHAPTER_PROGRESS_EVENT,
  getChapterProgress,
  saveChapterProgress,
} from "@/utils/helpers/books/chapterProgressUtil";

import STYLES from "./ReadingProgress.module.scss";

export const ReadingProgress = () => {
  const [progress, setProgress] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const button = document.querySelector(".button-chapter-book");
    if (!button) return;

    const buttonDocTop = button.getBoundingClientRect().top + window.scrollY;
    const totalScrollable = buttonDocTop - window.innerHeight;

    const savedProgress = getChapterProgress(pathname);
    if (savedProgress > 0 && totalScrollable > 0) {
      window.scrollTo({
        top: (savedProgress / 100) * totalScrollable,
        behavior: "instant",
      });
    }

    const updateProgress = () => {
      let newProgress: number;

      if (totalScrollable <= 0) {
        newProgress = 100;
      } else {
        newProgress = Math.min(
          100,
          Math.max(0, (window.scrollY / totalScrollable) * 100),
        );
      }

      setProgress(newProgress);
      saveChapterProgress(pathname, newProgress);
      window.dispatchEvent(new CustomEvent(CHAPTER_PROGRESS_EVENT));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.dispatchEvent(new CustomEvent(CHAPTER_PROGRESS_EVENT));
    };
  }, [pathname]);

  if (progress === null) return null;

  return (
    <div
      className={STYLES["progress-bar"]}
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
};
