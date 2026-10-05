"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

import STYLES from "./HeroSection.module.scss";

export function HeroSection() {
  const t = useTranslations("homepage");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  useEffect(() => {
    const clearHistoryHash = () => {
      if (window.location.hash !== "#history") return;

      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    };

    const handleScrollKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, select, [contenteditable]")
      )
        return;

      if (
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      ) {
        clearHistoryHash();
      }
    };

    window.addEventListener("wheel", clearHistoryHash, { passive: true });
    window.addEventListener("touchmove", clearHistoryHash, { passive: true });
    window.addEventListener("keydown", handleScrollKey);

    return () => {
      window.removeEventListener("wheel", clearHistoryHash);
      window.removeEventListener("touchmove", clearHistoryHash);
      window.removeEventListener("keydown", handleScrollKey);
    };
  }, []);

  return (
    <>
      <div id="hero" className={STYLES.hero}>
        <div className={STYLES["hero-wrapper"]}>
          <div className={STYLES["hero-heading"]}>
            <p>1915-1919</p>
            <h1>{t("heroTitle")}</h1>
          </div>
          <div className={STYLES["hero-links"]}>
            <Link
              href={`${localePrefix}/tunnellers/`}
              className={STYLES["hero-main-link"]}
            >
              <div className={STYLES["hero-link-content"]}>
                <div>{t("heroTunnellers")}</div>
              </div>
              <div className={STYLES.arrow}>&rarr;</div>
            </Link>
            <a href="#history" className={STYLES["hero-link"]}>
              <div className={STYLES["hero-link-content"]}>
                <div>{t("heroHistory")}</div>
              </div>
              <div className={STYLES.arrow}>&darr;</div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
