"use client";

import { useTranslations } from "next-intl";

import { Death } from "@/types/tunneller";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  death: Death | null;
};

export function DiaryDied({ death }: Props) {
  const t = useTranslations("profile");

  const title = (ageAtDeath: number | null) =>
    ageAtDeath ? (
      <p>{t("diedAtAge", { age: ageAtDeath })}</p>
    ) : (
      <p>{t("died")}</p>
    );

  if (death && death.date) {
    return (
      <>
        <h3>{t("death")}</h3>
        <div className={STYLES["fullwidth-main-card"]}>
          {title(death.ageAtDeath)}
          <span>{`${death.date.dayMonth} ${death.date.year}`}</span>
        </div>
      </>
    );
  }
  return null;
}
