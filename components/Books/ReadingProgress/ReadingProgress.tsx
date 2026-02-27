"use client";

import { useEffect, useState } from "react";

import STYLES from "./ReadingProgress.module.scss";

export const ReadingProgress = () => {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const button = document.querySelector(".button-chapter-book");
    if (!button) return;

    const buttonDocTop = button.getBoundingClientRect().top + window.scrollY;

    const updateProgress = () => {
      const totalScrollable = buttonDocTop - window.innerHeight;

      if (totalScrollable <= 0) {
        setProgress(100);
        return;
      }

      setProgress(
        Math.min(100, Math.max(0, (window.scrollY / totalScrollable) * 100)),
      );
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

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
