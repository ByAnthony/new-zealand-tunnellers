"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getChapterProgress,
  saveChapterProgress,
} from "@/utils/helpers/books/chapterProgressUtil";

import STYLES from "./ReadingProgress.module.scss";

export const ReadingProgress = () => {
  const [progress, setProgress] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const attach = (button: Element) => {
      const getTotalScrollable = () => {
        const buttonDocTop =
          button.getBoundingClientRect().top + window.scrollY;
        return buttonDocTop - window.innerHeight;
      };

      const saved = getChapterProgress(pathname);
      const total0 = getTotalScrollable();

      if (saved > 0 && total0 > 0) {
        window.scrollTo({ top: (saved / 100) * total0, behavior: "auto" });
      }

      const update = () => {
        const total = getTotalScrollable();
        if (total <= 0) return; // IMPORTANT: don’t save 100/0 from a bad measurement

        const p = Math.min(100, Math.max(0, (window.scrollY / total) * 100));
        setProgress(p);
        saveChapterProgress(pathname, p);
      };

      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();

      cleanup = () => window.removeEventListener("scroll", update);
      cleanup = () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      };
    };

    const existing = document.querySelector(".footnotes");
    if (existing) {
      attach(existing);
    } else {
      // Wait until it appears
      const mo = new MutationObserver(() => {
        const btn = document.querySelector(".footnotes");
        if (btn) {
          mo.disconnect();
          attach(btn);
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });

      cleanup = () => mo.disconnect();
    }

    return () => cleanup?.();
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
