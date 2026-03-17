"use client";

import { useTranslations } from "next-intl";

import { Employment } from "@/types/tunneller";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  employment: Employment;
};

export function DiaryWork({ employment }: Props) {
  const t = useTranslations("profile");

  if (employment.occupation && employment.employer) {
    return (
      <>
        <div className={STYLES["fullwidth-main-card"]}>{t("work")}</div>
        <div className={STYLES["halfwidth-cards-container"]}>
          <div className={STYLES["halfwidth-secondary-card"]}>
            <div className={STYLES["halfwidth-secondary-card-title"]}>
              <p>{t("occupation")}</p>
            </div>
            <div>
              <span>{employment.occupation}</span>
            </div>
          </div>
          <div className={STYLES["halfwidth-secondary-card"]}>
            <div className={STYLES["halfwidth-secondary-card-title"]}>
              <p>{t("employer")}</p>
            </div>
            <div>
              <span>{employment.employer}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  const displayOccupation = (occupation: string | null) => (
    <div className={STYLES["halfwidth-cards-container"]}>
      <div className={STYLES["halfwidth-main-card"]}>
        <span>{t("work")}</span>
      </div>
      <div className={STYLES["halfwidth-secondary-card"]}>
        <div className={STYLES["halfwidth-secondary-card-title"]}>
          <p>{t("occupation")}</p>
        </div>
        <div>
          <span>{occupation}</span>
        </div>
      </div>
    </div>
  );

  if (employment.occupation && !employment.employer) {
    return displayOccupation(employment.occupation);
  }
  return null;
}
