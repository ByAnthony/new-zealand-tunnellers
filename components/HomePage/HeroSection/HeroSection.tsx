"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import STYLES from "./HeroSection.module.scss";
import { BookOpenBadge } from "../../WorksMap/MapControls/RelatedChapterCard/RelatedChapterCard";

export function HeroSection() {
  const t = useTranslations("homepage");
  const router = useRouter();

  return (
    <>
      <div className={STYLES.hero}>
        <div className={STYLES["hero-wrapper"]}>
          <p>1915-1919</p>
          <h1>{t("heroTitle")}</h1>
          <div className={STYLES["hero-links"]}>
            <button
              onClick={() => router.push(`/#history`)}
              className={STYLES["hero-link"]}
            >
              <div className={STYLES["hero-link-content"]}>
                <BookOpenBadge />
                <div>{t("history")}</div>
              </div>
              <div className={STYLES.arrow}>&darr;</div>
            </button>
            <button
              onClick={() => router.push(`/history/tunnellers-works`)}
              className={STYLES["hero-link"]}
            >
              <div className={STYLES["hero-link-content"]}>
                <span className={STYLES["map-button-icon"]} aria-hidden />
                <div>{t("worksMap")}</div>
              </div>
              <div className={STYLES.arrow}>&rarr;</div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
