"use client";

import { useTranslations } from "next-intl";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  inNzLength: string | null;
};

export function DiaryArrivedInNz({ inNzLength }: Props) {
  const t = useTranslations("profile");

  return inNzLength ? (
    <div className={STYLES["fullwidth-main-card"]}>
      <p>{t("settledInNz")}</p>
      <span>{inNzLength}</span>
    </div>
  ) : null;
}
