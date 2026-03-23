"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { ArmyExperience } from "@/types/tunneller";
import { getFrenchCountryWithPrep } from "@/utils/helpers/country";

import STYLES_WWI from "./DiaryArmyExperience.module.scss";
import STYLES from "../ProfileDiary.module.scss";

type Props = {
  tunnellerSlug: string;
  armyExperience: ArmyExperience[];
};

function ArmyExperienceList({
  militaryExperience,
  locale,
}: {
  militaryExperience: ArmyExperience[] | [];
  locale: string;
}) {
  if (militaryExperience.length > 0) {
    return (
      <>
        {militaryExperience.map((experience) => {
          const displayDurationAndCountry = () => {
            const formatCountry = (country: string) =>
              locale === "fr"
                ? getFrenchCountryWithPrep(country)
                : experience.country_key !== "United Kingdom"
                  ? country
                  : `the ${country}`;
            if (experience.duration && experience.country) {
              const countryStr = formatCountry(experience.country);
              const separator = locale === "fr" ? " " : " in ";
              return (
                <p
                  className={STYLES_WWI["line-margin"]}
                >{`${experience.duration}${separator}${countryStr}`}</p>
              );
            }
            if (experience.duration && !experience.country) {
              return (
                <p className={STYLES_WWI["line-margin"]}>
                  {experience.duration}
                </p>
              );
            }
            if (!experience.duration && experience.country) {
              return (
                <p className={STYLES_WWI["line-margin"]}>
                  {experience.country}
                </p>
              );
            }
            return null;
          };

          if (experience.unit !== "Other" && experience.conflict) {
            return (
              <li
                className={STYLES["fullwidth-secondary-card"]}
                key={experience.unit}
              >
                <p>{experience.conflict}</p>
                <div className={STYLES_WWI["line-margin"]}>
                  <span>{experience.unit}</span>
                </div>
              </li>
            );
          }

          if (experience.unit === "Other") {
            if (experience.conflict && !experience.duration) {
              return (
                <li
                  className={STYLES["fullwidth-secondary-card"]}
                  key={experience.unit}
                >
                  <span>{experience.conflict}</span>
                </li>
              );
            }
            return (
              <li
                className={STYLES["fullwidth-secondary-card"]}
                key={experience.unit}
              >
                <span>{experience.conflict}</span>
                <p className={STYLES_WWI["line-margin"]}>
                  {experience.duration}
                </p>
              </li>
            );
          }
          return (
            <li
              className={STYLES["fullwidth-secondary-card"]}
              key={experience.unit}
            >
              <span>{experience.unit}</span>
              {displayDurationAndCountry()}
            </li>
          );
        })}
      </>
    );
  }
  return null;
}

export function DiaryArmyExperience({ tunnellerSlug, armyExperience }: Props) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  return (
    <>
      <h3>{t("armyExperience")}</h3>
      <ArmyExperienceList militaryExperience={armyExperience} locale={locale} />
      <Link
        href={`${localePrefix}/tunnellers/${tunnellerSlug}/wwi-timeline`}
        className={STYLES_WWI["war-service"]}
        aria-label={t("openTimeline")}
      >
        <div>
          <p>{t("wwiTitle")}</p>
          <span>{t("nzTunnellers")}</span>
        </div>
        <div className={STYLES_WWI.arrow}>&rarr;</div>
      </Link>
    </>
  );
}
