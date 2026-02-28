"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { basePath } from "@/utils/helpers/books/basePathUtil";
import { CHAPTER_PROGRESS_EVENT } from "@/utils/helpers/books/chapterProgressUtil";

import STYLES from "./BookMenu.module.scss";

type Props = {
  locale: string;
};

export const BookMenu = ({ locale }: Props) => {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY.current && currentY > 150) {
        setVisible(true);
      } else if (currentY < lastScrollY.current) {
        setVisible(false);
      }
      lastScrollY.current = currentY;

      const footer = document.querySelector("footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        setBottomOffset(Math.max(0, window.innerHeight - rect.top));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`${STYLES.menu} ${visible ? STYLES.visible : ""}`}
      style={{ bottom: `${bottomOffset}px` }}
    >
      <Link
        className={STYLES.link}
        href={basePath(locale)}
        aria-label={
          locale === "fr"
            ? "Retour à la table des matières"
            : "Back to contents"
        }
        onClick={() =>
          window.dispatchEvent(new CustomEvent(CHAPTER_PROGRESS_EVENT))
        }
      >
        {locale === "fr" ? "Sommaire" : "Contents"}
      </Link>
    </div>
  );
};
