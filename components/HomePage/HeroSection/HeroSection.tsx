"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import STYLES from "./HeroSection.module.scss";
import { BookOpenBadge } from "../../WorksMap/MapControls/RelatedChapterCard/RelatedChapterCard";

export function HeroSection() {
  const t = useTranslations("homepage");

  return (
    <>
      <div className={STYLES.hero}>
        <div className={STYLES["hero-wrapper"]}>
          <p>1915-1919</p>
          <h1>{t("heroTitle")}</h1>
          <div className={STYLES["hero-links"]}>
            <Link href="/#history" className={STYLES["hero-link"]}>
              <div className={STYLES["hero-link-content"]}>
                <BookOpenBadge />
                <div>{t("history")}</div>
              </div>
              <div className={STYLES.arrow}>&darr;</div>
            </Link>
            <Link
              href="/history/tunnellers-works"
              className={STYLES["hero-link"]}
            >
              <div className={STYLES["hero-link-content"]}>
                <span className={STYLES["map-button-icon"]} aria-hidden />
                <div>{t("worksMap")}</div>
              </div>
              <div className={STYLES.arrow}>&rarr;</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
