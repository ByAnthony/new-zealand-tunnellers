"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { basePath } from "@/utils/helpers/books/basePathUtil";

import STYLES from "./BookMenu.module.scss";

type Props = {
  locale: string;
};

export function BookMenu({ locale }: Props) {
  const [prevBookScrollPos, setPrevBookScrollPos] = useState(0);
  const [bookMenuVisible, setBookMenuVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setBookMenuVisible(prevBookScrollPos > currentScrollPos);
      setPrevBookScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevBookScrollPos]);

  return (
    <Link
      className={`${STYLES["book-menu"]} ${!bookMenuVisible ? "" : STYLES.hidden}`}
      href={basePath(locale)}
      aria-label={locale === "fr" ? "Retour au sommaire" : "Back to contents"}
    >
      <span className={STYLES.link}>
        {locale === "fr" ? "Sommaire" : "Contents"}
      </span>
    </Link>
  );
}
