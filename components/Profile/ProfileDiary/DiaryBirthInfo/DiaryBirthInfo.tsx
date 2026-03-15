"use client";

import { useTranslations } from "next-intl";

import { Birth } from "@/types/tunneller";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  birth: Birth;
};

export function DiaryBirth({ birth }: Props) {
  const t = useTranslations("profile");

  if (birth.date && birth.country) {
    return (
      <div className={STYLES["fullwidth-main-card"]}>
        <p>{t("bornInCountry", { country: birth.country })}</p>
        <span>{`${birth.date?.dayMonth} ${birth.date?.year}`}</span>
      </div>
    );
  }
  if (birth.date && !birth.country) {
    return (
      <div className={STYLES["fullwidth-main-card"]}>
        <p>{t("born")}</p>
        <span>{`${birth.date?.dayMonth} ${birth.date?.year}`}</span>
      </div>
    );
  }
  if (!birth.date && birth.country) {
    return (
      <div className={STYLES["fullwidth-main-card"]}>
        <span>{t("bornInCountry", { country: birth.country })}</span>
      </div>
    );
  }
  return null;
}
