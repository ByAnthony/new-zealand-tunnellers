"use client";

import { useLocale, useTranslations } from "next-intl";

import { Birth } from "@/types/tunneller";
import { getFrenchCountryWithPrep } from "@/utils/helpers/country";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  birth: Birth;
};

export function DiaryBirth({ birth }: Props) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const formatCountry = (country: string) =>
    locale === "fr" ? getFrenchCountryWithPrep(country) : country;
  const birthDate = birth.date
    ? `${birth.date.dayMonth} ${birth.date.year}`
    : birth.year;

  if (birthDate && birth.country) {
    return (
      <div className={STYLES["fullwidth-main-card"]}>
        <p>{t("bornInCountry", { country: formatCountry(birth.country) })}</p>
        <span>{birthDate}</span>
      </div>
    );
  }
  if (birthDate && !birth.country) {
    return (
      <div className={STYLES["fullwidth-main-card"]}>
        <p>{t("born")}</p>
        <span>{birthDate}</span>
      </div>
    );
  }
  if (!birthDate && birth.country) {
    return (
      <div className={STYLES["fullwidth-main-card"]}>
        <span>
          {t("bornInCountry", { country: formatCountry(birth.country) })}
        </span>
      </div>
    );
  }
  return null;
}
