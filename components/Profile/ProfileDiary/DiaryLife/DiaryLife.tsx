"use client";

import { useTranslations } from "next-intl";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  maritalStatus: string | null;
  wife: string | null;
};

export function DiaryLife({ maritalStatus, wife }: Props) {
  const t = useTranslations("profile");

  if (maritalStatus && wife) {
    return (
      <>
        <div className={STYLES["fullwidth-main-card"]}>{t("personalLife")}</div>
        <div className={STYLES["halfwidth-cards-container"]}>
          <div className={STYLES["halfwidth-secondary-card"]}>
            <div className={STYLES["halfwidth-secondary-card-title"]}>
              <p>{t("maritalStatus")}</p>
            </div>
            <div>
              <span>{maritalStatus}</span>
            </div>
          </div>
          <div className={STYLES["halfwidth-secondary-card"]}>
            <div className={STYLES["halfwidth-secondary-card-title"]}>
              <p>{t("wife")}</p>
            </div>
            <div>
              <span>{wife}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (maritalStatus && !wife) {
    return (
      <div className={STYLES["halfwidth-cards-container"]}>
        <div className={STYLES["halfwidth-main-card"]}>
          <span>{t("personalLife")}</span>
        </div>
        <div className={STYLES["halfwidth-secondary-card"]}>
          <div className={STYLES["halfwidth-secondary-card-title"]}>
            <p>{t("maritalStatus")}</p>
          </div>
          <div>
            <span>{maritalStatus}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
