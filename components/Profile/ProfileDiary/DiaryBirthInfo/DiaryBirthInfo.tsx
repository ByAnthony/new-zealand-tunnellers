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

  if (birth.date && birth.country) {
    return (
      <div className={STYLES["fullwidth-main-card"]}>
        <p>{t("bornInCountry", { country: formatCountry(birth.country) })}</p>
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
        <span>
          {t("bornInCountry", { country: formatCountry(birth.country) })}
        </span>
      </div>
    );
  }
  return null;
}
