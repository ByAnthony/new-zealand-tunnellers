"use client";

import { useTranslations } from "next-intl";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  residence: string | null;
};

export function DiaryHometown({ residence }: Props) {
  const t = useTranslations("profile");

  return residence ? (
    <div className={STYLES["halfwidth-cards-container"]}>
      <div className={STYLES["halfwidth-main-card"]}>
        <span>{t("residence")}</span>
      </div>
      <div className={STYLES["halfwidth-secondary-card"]}>
        <div className={STYLES["halfwidth-secondary-card-title"]}>
          <p>{t("hometown")}</p>
        </div>
        <div>
          <span>{residence}</span>
        </div>
      </div>
    </div>
  ) : null;
}
