"use client";

import { useLocale, useTranslations } from "next-intl";

import { Birth } from "@/types/tunneller";

import STYLES from "../ProfileDiary.module.scss";

const frPrepositions: Record<string, string> = {
  Canada: "au",
  Chili: "au",
  Danemark: "au",
  Montenegro: "au",
  "Pays de Galles": "au",
  "Royaume-Uni": "au",
  Açores: "aux",
  "États-Unis d'Amérique": "aux",
  "Île de Man": "à l'",
};

const getFrenchCountry = (country: string): string => {
  const prep = frPrepositions[country] ?? "en";
  return prep === "à l'" ? `à l'${country}` : `${prep} ${country}`;
};

type Props = {
  birth: Birth;
};

export function DiaryBirth({ birth }: Props) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const formatCountry = (country: string) =>
    locale === "fr" ? getFrenchCountry(country) : country;

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
