"use client";

import { useTranslations } from "next-intl";

import { Parent, Parents } from "@/types/tunneller";

import STYLES from "../ProfileDiary.module.scss";

type Props = {
  parents: Parents;
};

export function DiaryParents({ parents }: Props) {
  const t = useTranslations("profile");

  if (parents.mother && parents.father) {
    return (
      <>
        <div className={STYLES["fullwidth-main-card"]}>{t("parents")}</div>
        <div className={STYLES["halfwidth-cards-container"]}>
          <div className={STYLES["halfwidth-secondary-card"]}>
            <p>{t("mother")}</p>
            <span>{parents.mother.name}</span>
          </div>
          <div className={STYLES["halfwidth-secondary-card"]}>
            <p>{t("father")}</p>
            <span>{parents.father.name}</span>
          </div>
        </div>
      </>
    );
  }

  const isMotherOrFather = parents.mother ? t("mother") : t("father");

  const displayParent = (parent: Parent) => (
    <div className={STYLES["halfwidth-cards-container"]}>
      <div className={STYLES["halfwidth-main-card"]}>
        <span>{t("parent")}</span>
      </div>
      <div className={STYLES["halfwidth-secondary-card"]}>
        <p>{isMotherOrFather}</p>
        <span>{parent.name}</span>
      </div>
    </div>
  );

  if (parents.mother && !parents.father) {
    return displayParent(parents.mother);
  }
  if (!parents.mother && parents.father) {
    return displayParent(parents.father);
  }

  return null;
}
